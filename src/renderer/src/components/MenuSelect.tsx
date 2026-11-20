// A select drawn in the app's own style: a full-width button showing the whole choice, and a
// list in a fixed layer (never clipped by the scrolling side menu) with a search box on top
// that filters as you type (accents ignored). Arrow keys, Enter and Esc work.
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { t } from '../lib/i18n'
import { fold } from '../lib/people'
import Icon from './Icon'

export default function MenuSelect<T extends string | number>({
  value,
  options,
  onChange,
  label,
  searchable = true,
  allowCustom = false,
  disabled = false,
  title,
  display
}: {
  value: T
  options: { value: T; label: string; hint?: string }[]
  onChange: (v: T) => void
  label: string
  searchable?: boolean
  /** Also offer what was typed in the search box as a value (e.g. a model name). */
  allowCustom?: boolean
  disabled?: boolean
  title?: string
  /** Text for the button instead of the option's label. */
  display?: string
}) {
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [hi, setHi] = useState(0)
  const [at, setAt] = useState({ left: 0, top: 0, width: 0, maxH: 360 })
  const btn = useRef<HTMLButtonElement>(null)
  const pop = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const current = options.find((o) => o.value === value)

  const shown = useMemo(() => {
    const words = fold(q).split(/\s+/).filter(Boolean)
    const list = words.length ? options.filter((o) => words.every((w) => fold(`${o.label} ${o.hint ?? ''} ${o.value}`).includes(w))) : options
    const typed = q.trim()
    if (allowCustom && typed && !options.some((o) => String(o.value) === typed)) return [{ value: typed as T, label: typed, hint: t('bunu kullan') }, ...list]
    return list
  }, [options, q, allowCustom])

  const show = () => {
    const r = btn.current!.getBoundingClientRect()
    const want = Math.min(options.length * 34 + (searchable ? 52 : 8), 420)
    const below = window.innerHeight - r.bottom - 12
    const up = below < Math.min(want, 240) && r.top > below
    const maxH = Math.max(160, Math.min(want, up ? r.top - 12 : below))
    setAt({ left: r.left, top: up ? r.top - 4 - maxH : r.bottom + 4, width: Math.max(r.width, 220), maxH })
    setQ('')
    setHi(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const close = () => {
    setOpen(false)
    btn.current?.focus()
  }
  const pick = (v: T) => {
    onChange(v)
    close()
  }

  useEffect(() => {
    if (!open) return
    const off = (e: Event) => {
      if (!pop.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false)
    }
    const away = () => setOpen(false)
    window.addEventListener('mousedown', off)
    window.addEventListener('resize', away)
    return () => {
      window.removeEventListener('mousedown', off)
      window.removeEventListener('resize', away)
    }
  }, [open])
  // Keep the list inside the window: measured after it opens, moved left if it would spill.
  useLayoutEffect(() => {
    if (!open || !pop.current) return
    const r = pop.current.getBoundingClientRect()
    const over = r.right - (window.innerWidth - 8)
    if (over > 0) setAt((a) => ({ ...a, left: Math.max(8, a.left - over) }))
  }, [open, at.left, shown.length])
  useEffect(() => setHi(0), [q])
  useEffect(() => {
    if (open) listRef.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [hi, open])

  const keys = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') (e.preventDefault(), setHi(Math.min(hi + 1, shown.length - 1)))
    else if (e.key === 'ArrowUp') (e.preventDefault(), setHi(Math.max(hi - 1, 0)))
    else if (e.key === 'Enter') (e.preventDefault(), shown[hi] && pick(shown[hi].value))
    else if (e.key === 'Escape') (e.preventDefault(), e.stopPropagation(), close())
  }

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`menu-select${open ? ' open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current?.label ?? display ?? ''}`}
        title={title}
        disabled={disabled}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp' || e.key === 'Enter' || e.key === ' ')) (e.preventDefault(), show())
        }}
      >
        <span className="menu-select-val">{display ?? current?.label ?? String(value ?? '')}</span>
        <Icon name="chevron" size={14} />
      </button>
      {open && (
        <div ref={pop} className="menu-select-pop" style={{ left: at.left, top: at.top, minWidth: at.width, maxHeight: at.maxH }} onKeyDown={keys}>
          {searchable && (
            <div className="menu-select-search">
              <Icon name="search" size={14} />
              <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={t('Ara…')} aria-label={t('Ara…')} />
            </div>
          )}
          <ul ref={listRef} className="menu-select-list" role="listbox" aria-label={label} tabIndex={searchable ? -1 : 0} autoFocus={!searchable}>
            {shown.map((o, i) => (
              <li
                key={String(o.value)}
                data-i={i}
                role="option"
                aria-selected={o.value === value}
                className={`${i === hi ? 'hi' : ''}${o.value === value ? ' on' : ''}`}
                onMouseEnter={() => setHi(i)}
                onMouseDown={(e) => (e.preventDefault(), pick(o.value))}
              >
                <span className="menu-select-check" aria-hidden>
                  {o.value === value ? '✓' : ''}
                </span>
                <span className="menu-select-opt">
                  {o.label}
                  {o.hint && <span className="muted small"> · {o.hint}</span>}
                </span>
              </li>
            ))}
            {!shown.length && <li className="menu-select-none muted small">{t('Sonuç yok')}</li>}
          </ul>
        </div>
      )}
    </>
  )
}
