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

export async function renderCard(spec: CardSpec): Promise<string> {
  const { width: W, height: H } = spec
  const pad = Math.round(W * 0.07)
  const sans = "'Public Sans', 'Noto Sans Symbols', 'Noto Sans Symbols 2', sans-serif"
  const sym = "'Noto Sans Symbols', 'Noto Sans Symbols 2', 'Public Sans', sans-serif"
  let y = pad
  const lines = (ls: CardLine[]) =>
    ls
      .map((l) => {
        y += (l.gap ?? 0) + l.size
        return `<text x="${W / 2}" y="${y}" text-anchor="middle" font-family="${l.family ?? sans}" font-size="${l.size}" font-weight="${l.weight ?? 400}" fill="${l.color}">${esc(l.text)}</text>`
      })
      .join('')
  const head = lines(spec.header)
  const headEnd = y + pad * 0.4

  // Footer and trio are laid out from the bottom.
  const footH = spec.footer.reduce((s, l) => s + (l.gap ?? 0) + l.size, 0)
  const trioH = spec.trio.length ? W * 0.13 : 0
  const footTop = H - pad - footH
  const trioTop = footTop - pad * 0.6 - trioH
  y = footTop
  const foot = lines(spec.footer)

  const colW = (W - pad * 2) / Math.max(1, spec.trio.length)
  const trio = spec.trio
    .map(([g, label, sign], i) => {
      const cx = pad + colW * (i + 0.5)
      return `<g>
        <text x="${cx}" y="${trioTop + W * 0.05}" text-anchor="middle" font-family="${sym}" font-size="${W * 0.05}" fill="${spec.accent}">${esc(g)}</text>
        <text x="${cx}" y="${trioTop + W * 0.088}" text-anchor="middle" font-family="${sans}" font-size="${W * 0.03}" font-weight="650" fill="${spec.ink}">${esc(sign)}</text>
        <text x="${cx}" y="${trioTop + W * 0.118}" text-anchor="middle" font-family="${sans}" font-size="${W * 0.021}" fill="${spec.muted}">${esc(label)}</text>
      </g>`
    })
    .join('')

  // Wheel fills the space between header and trio.
  const vb = spec.wheel.viewBox.baseVal
  const boxH = trioTop - headEnd - pad * 0.4
  const boxW = W - pad
  const scale = Math.min(boxW / vb.width, boxH / vb.height)
  const ww = vb.width * scale
  const wh = vb.height * scale
  const wheel = spec.wheel.cloneNode(true) as SVGSVGElement
  wheel.setAttribute('x', String((W - ww) / 2))
  wheel.setAttribute('y', String(headEnd + (boxH - wh) / 2))
  wheel.setAttribute('width', String(ww))
  wheel.setAttribute('height', String(wh))
  wheel.removeAttribute('class')
  const wheelXml = new XMLSerializer().serializeToString(wheel)

  const fonts = await embeddedFonts()
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <style>${fonts}</style>
    <rect width="${W}" height="${H}" fill="${spec.bg}"/>
    ${head}${wheelXml}${trio}${foot}
  </svg>`

  const img = new Image()
  img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg)
  await img.decode()
  const canvas = document.createElement('canvas')
  canvas.width = W
  canvas.height = H
  const ctx = canvas.getContext('2d')!
  ctx.drawImage(img, 0, 0, W, H)
  return canvas.toDataURL('image/png')
}
