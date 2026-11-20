// Quick tooltips for any element with data-tip, drawn in one fixed layer on top of the page.
// CSS-only tooltips are clipped by scrolling panels (the side menu, the people list);
// this one never is, and it moves inside the window near the edges.
export function installTooltips(): void {
  const tip = document.createElement('div')
  tip.className = 'tip-layer'
  tip.setAttribute('role', 'tooltip')
  document.body.appendChild(tip)
  let target: HTMLElement | null = null

  const hide = () => {
    target = null
    tip.classList.remove('show')
  }
  const show = (el: HTMLElement) => {
    const text = el.getAttribute('data-tip')
    if (!text) return hide()
    target = el
    tip.textContent = text
    tip.classList.add('show')
    const r = el.getBoundingClientRect()
    const w = tip.offsetWidth
    const h = tip.offsetHeight
    const pad = 8
    let left = r.left + r.width / 2 - w / 2
    left = Math.max(pad, Math.min(left, window.innerWidth - w - pad))
    let top = r.bottom + 6
    if (top + h > window.innerHeight - pad) top = r.top - h - 6
    tip.style.left = `${Math.round(left)}px`
    tip.style.top = `${Math.round(top)}px`
  }
  const find = (e: Event) => (e.target instanceof Element ? (e.target.closest('[data-tip]') as HTMLElement | null) : null)

  document.addEventListener('mouseover', (e) => {
    const el = find(e)
    if (el && el !== target) show(el)
    else if (!el && target) hide()
  })
  document.addEventListener('focusin', (e) => {
    const el = find(e)
    if (el && el.matches(':focus-visible')) show(el)
  })
  document.addEventListener('focusout', hide)
  document.addEventListener('mousedown', hide)
  // A toggle's text changes on click: show the new text while the pointer stays on it.
  document.addEventListener('click', (e) => {
    const el = find(e)
    if (el) window.setTimeout(() => el.matches(':hover') && show(el), 0)
  })
  window.addEventListener('scroll', hide, true)
  window.addEventListener('blur', hide)
}
