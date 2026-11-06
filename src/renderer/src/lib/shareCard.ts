// Renders a shareable PNG card (chart wheel + big three + AstroFree mark).
// The wheel's on-screen SVG is cloned with its computed styles inlined, the
// page's fonts are embedded, and the whole card is rasterised on a canvas.

const STYLE_PROPS = [
  'fill',
  'fill-opacity',
  'stroke',
  'stroke-width',
  'stroke-opacity',
  'stroke-dasharray',
  'stroke-linecap',
  'opacity',
  'font-family',
  'font-size',
  'font-weight',
  'font-style',
  'text-anchor',
  'dominant-baseline',
  'alignment-baseline',
  'letter-spacing',
  'paint-order'
]

/** Copy of an on-screen SVG with every computed style written inline. */
export function inlineSvg(src: SVGSVGElement): SVGSVGElement {
  const clone = src.cloneNode(true) as SVGSVGElement
  const a = [src, ...src.querySelectorAll('*')] as Element[]
  const b = [clone, ...clone.querySelectorAll('*')] as Element[]
  for (let i = a.length - 1; i >= 0; i--) {
    const cs = getComputedStyle(a[i])
    if (cs.display === 'none' || cs.visibility === 'hidden') {
      b[i].remove()
      continue
    }
    const style = STYLE_PROPS.map((p) => `${p}:${cs.getPropertyValue(p)}`).join(';')
    b[i].setAttribute('style', style)
    b[i].removeAttribute('class')
  }
  return clone
}

let fontCss: Promise<string> | null = null

/** @font-face rules of the page with their files embedded as data: URLs. */
export function embeddedFonts(): Promise<string> {
  fontCss ??= (async () => {
    const rules: CSSFontFaceRule[] = []
    for (const sheet of [...document.styleSheets]) {
      try {
        for (const r of [...sheet.cssRules]) if (r instanceof CSSFontFaceRule) rules.push(r)
      } catch {
        /* cross-origin sheet */
      }
    }
    const out = await Promise.all(
      rules.map(async (r) => {
        const m = r.cssText.match(/url\(["']?([^"')]+\.woff2?)["']?\)/)
        if (!m) return ''
        try {
          const url = new URL(m[1], r.parentStyleSheet?.href ?? location.href).href
          const buf = await (await fetch(url)).arrayBuffer()
          let bin = ''
          const bytes = new Uint8Array(buf)
          for (let i = 0; i < bytes.length; i += 0x8000) bin += String.fromCharCode(...bytes.subarray(i, i + 0x8000))
          const mime = m[1].endsWith('woff2') ? 'font/woff2' : 'font/woff'
          return r.cssText.replace(/src:[^;]+;/, `src: url(data:${mime};base64,${btoa(bin)});`)
        } catch {
          return ''
        }
      })
    )
    return out.filter(Boolean).join('\n')
  })()
  return fontCss
}

export interface CardLine {
  text: string
  size: number
  weight?: number
  color: string
  family?: string
  /** Gap above the line, px. */
  gap?: number
}

export interface CardSpec {
  width: number
  height: number
  bg: string
  ink: string
  muted: string
  accent: string
  wheel: SVGSVGElement
  header: CardLine[]
  /** Big three: [glyph, label, sign] */
  trio: [string, string, string][]
  footer: CardLine[]
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

const SANS = "'Public Sans', 'Noto Sans Symbols', 'Noto Sans Symbols 2', sans-serif"
const SYM = "'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Public Sans', sans-serif"

/** Lines of text centred on cx, from y downwards; returns the markup and the new y. */
function textLines(ls: CardLine[], cx: number, y0: number): { svg: string; y: number } {
  let y = y0
  const svg = ls
    .map((l) => {
      y += (l.gap ?? 0) + l.size
      return `<text x="${cx}" y="${y}" text-anchor="middle" font-family="${l.family ?? SANS}" font-size="${l.size}" font-weight="${l.weight ?? 400}" fill="${l.color}">${esc(l.text)}</text>`
    })
    .join('')
  return { svg, y }
}
const linesHeight = (ls: CardLine[]) => ls.reduce((s, l) => s + (l.gap ?? 0) + l.size, 0)

async function rasterize(body: string, W: number, H: number, bg: string): Promise<string> {
  const fonts = await embeddedFonts()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <style>${fonts}</style>
    <rect width="${W}" height="${H}" fill="${bg}"/>
    ${body}
  </svg>`
  const img = new Image()
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  canvas.getContext('2d')!.drawImage(img, 0, 0, W, H)
  return canvas.toDataURL('image/png')
}

/**
 * Chart card. Portrait and square: header on top, wheel in the middle, big three and
 * footer at the bottom. Landscape (X, LinkedIn): wheel on the left, text on the right.
 */
export async function renderCard(spec: CardSpec): Promise<string> {
  const { width: W, height: H } = spec
  const landscape = W > H * 1.15
  const pad = Math.round(Math.min(W, H) * 0.07)
  const wheelSize = landscape ? H - pad * 2 : 0
  const colX = landscape ? pad * 2 + wheelSize : 0
  const colW = landscape ? W - colX - pad : W
  const cx = colX + colW / 2
  // Sizes of the big-three row scale with the column it sits in.
  const u = landscape ? colW * 1.45 : W

  const head = textLines(spec.header, cx, pad)
  const headEnd = head.y + pad * 0.4
  const footH = linesHeight(spec.footer)
  const trioH = spec.trio.length ? u * 0.13 : 0
  const footTop = H - pad - footH
  const trioTop = landscape ? headEnd + (footTop - headEnd - trioH) / 2 : footTop - pad * 0.6 - trioH
  const foot = textLines(spec.footer, cx, footTop)

  const cell = colW / Math.max(1, spec.trio.length)
  const trio = spec.trio
    .map(([g, label, sign], i) => {
      const x = colX + cell * (i + 0.5)
      return `<g>
        <text x="${x}" y="${trioTop + u * 0.05}" text-anchor="middle" font-family="${SYM}" font-size="${u * 0.05}" fill="${spec.accent}">${esc(g)}</text>
        <text x="${x}" y="${trioTop + u * 0.088}" text-anchor="middle" font-family="${SANS}" font-size="${u * 0.03}" font-weight="650" fill="${spec.ink}">${esc(sign)}</text>
        <text x="${x}" y="${trioTop + u * 0.118}" text-anchor="middle" font-family="${SANS}" font-size="${u * 0.021}" fill="${spec.muted}">${esc(label)}</text>
      </g>`
    })
    .join('')

  const vb = spec.wheel.viewBox.baseVal
  const box = landscape ? { x: pad, y: pad, w: wheelSize, h: wheelSize } : { x: pad / 2, y: headEnd, w: W - pad, h: trioTop - headEnd - pad * 0.4 }
  const scale = Math.min(box.w / vb.width, box.h / vb.height)
  const ww = vb.width * scale
  const wh = vb.height * scale
  const wheel = spec.wheel.cloneNode(true) as SVGSVGElement
  wheel.setAttribute('x', String(box.x + (box.w - ww) / 2))
  wheel.setAttribute('y', String(box.y + (box.h - wh) / 2))
  wheel.setAttribute('width', String(ww))
  wheel.setAttribute('height', String(wh))
  wheel.removeAttribute('class')
  const wheelXml = new XMLSerializer().serializeToString(wheel)
  return rasterize(head.svg + wheelXml + trio + foot.svg, W, H, spec.bg)
}

export interface EventCardSpec {
  width: number
  height: number
  bg: string
  ink: string
  muted: string
  accent: string
  /** Big symbol in the middle (planet glyph, ● for New Moon…). */
  symbol: string
  title: string
  date: string
  /** Short, hedged sentence about the event. */
  note: string
  brand: string
  footer: CardLine[]
}

/** Split text into lines of at most `max` characters, at spaces. */
function wrap(text: string, max: number): string[] {
  const out: string[] = []
  let cur = ''
  for (const w of text.split(/\s+/)) {
    if (cur && (cur + ' ' + w).length > max) {
      out.push(cur)
      cur = w
    } else cur = cur ? cur + ' ' + w : w
  }
  if (cur) out.push(cur)
  return out
}

/** Sky-event card: symbol, title, date and one hedged sentence, all centred. */
export async function renderEventCard(spec: EventCardSpec): Promise<string> {
  const { width: W, height: H } = spec
  const m = Math.min(W, H)
  const pad = Math.round(m * 0.07)
  const cx = W / 2
  const r = m * 0.17
  const noteSize = Math.round(m * 0.036)
  const noteLines = wrap(spec.note, Math.max(18, Math.floor((W - pad * 4) / (noteSize * 0.55))))
  const blockH = r * 2 + m * 0.06 + m * 0.07 + m * 0.05 + noteLines.length * noteSize * 1.4
  let y = Math.max(pad * 2.2, (H - blockH) / 2)
  const parts: string[] = [
    `<text x="${cx}" y="${pad + m * 0.035}" text-anchor="middle" font-family="${SANS}" font-size="${m * 0.03}" font-weight="700" fill="${spec.accent}">${esc(spec.brand)}</text>`,
    `<circle cx="${cx}" cy="${y + r}" r="${r}" fill="none" stroke="${spec.accent}" stroke-width="${m * 0.006}"/>`,
    `<text x="${cx}" y="${y + r}" text-anchor="middle" dominant-baseline="central" font-family="${SYM}" font-size="${r * 1.05}" fill="${spec.ink}">${esc(spec.symbol)}</text>`
  ]
  y += r * 2 + m * 0.06 + m * 0.055
  parts.push(`<text x="${cx}" y="${y}" text-anchor="middle" font-family="${SANS}" font-size="${m * 0.055}" font-weight="700" fill="${spec.ink}">${esc(spec.title)}</text>`)
  y += m * 0.055
  parts.push(`<text x="${cx}" y="${y}" text-anchor="middle" font-family="${SANS}" font-size="${m * 0.032}" fill="${spec.muted}">${esc(spec.date)}</text>`)
  y += m * 0.05
  for (const line of noteLines) {
    y += noteSize * 1.4
    parts.push(`<text x="${cx}" y="${y}" text-anchor="middle" font-family="${SANS}" font-size="${noteSize}" fill="${spec.ink}">${esc(line)}</text>`)
  }
  const foot = textLines(spec.footer, cx, H - pad - linesHeight(spec.footer))
  return rasterize(parts.join('') + foot.svg, W, H, spec.bg)
}
