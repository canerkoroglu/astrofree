// WCAG 2.1 contrast check run inside the app window: returns text elements below
// 4.5:1 (3:1 for large text) against their composited background. Disabled controls are exempt.
function audit() {
  const parse = (c) => { const m = c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] === undefined ? 1 : p[3] } }
  const blend = (top, bot) => ({ r: top.r * top.a + bot.r * (1 - top.a), g: top.g * top.a + bot.g * (1 - top.a), b: top.b * top.a + bot.b * (1 - top.a), a: 1 })
  const lum = (c) => { const f = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4 }; return 0.2126 * f(c.r) + 0.7152 * f(c.g) + 0.0722 * f(c.b) }
  const ratio = (a, b) => { const x = lum(a), y = lum(b); return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05) }
  const bgOf = (el) => { const stack = []; for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > 0) { stack.push(c); if (c.a >= 1) break } } let base = parse(getComputedStyle(document.body).backgroundColor) || { r: 255, g: 255, b: 255, a: 1 }; for (let i = stack.length - 1; i >= 0; i--) base = blend(stack[i], base); return base }
  const out = []; const seen = new Set()
  for (const el of document.querySelectorAll('body *')) {
    if (!el.offsetParent && getComputedStyle(el).position !== 'fixed') continue
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ')
    const isInput = /^(INPUT|TEXTAREA|SELECT)$/.test(el.tagName)
    const text = own || (isInput ? el.value || el.placeholder : '')
    if (!text) continue
    const r = el.getBoundingClientRect(); if (r.width < 2 || r.height < 2) continue
    const cs = getComputedStyle(el); if (cs.visibility === 'hidden' || +cs.opacity === 0) continue
    let fg = parse(cs.color); if (!fg) continue
    const bg = bgOf(el); let op = 1; for (let e = el; e; e = e.parentElement) op *= +getComputedStyle(e).opacity
    fg = blend({ ...fg, a: fg.a * op }, bg)
    const size = parseFloat(cs.fontSize), bold = +cs.fontWeight >= 700
    const large = size >= 24 || (size >= 18.66 && bold)
    const need = large ? 3 : 4.5
    const cr = ratio(fg, bg)
    const disabled = el.disabled || el.closest('[disabled]')
    if (cr < need) {
      const sel = el.tagName.toLowerCase() + (el.className && typeof el.className === 'string' ? '.' + el.className.trim().split(/\s+/).slice(0, 2).join('.') : '')
      const key = sel + '|' + cr.toFixed(1)
      if (seen.has(key)) continue; seen.add(key)
      out.push(`${cr.toFixed(2)} (<${need}) ${disabled ? '[disabled] ' : ''}${sel} "${text.slice(0, 30)}" fg=${cs.color} bg=rgb(${bg.r|0},${bg.g|0},${bg.b|0})`)
    }
  }
  return out.sort()
}

module.exports = '(' + audit.toString() + ')()'
