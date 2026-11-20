// A select drawn in the app's own style: a button showing the choice and a list that opens
// in a fixed layer (never clipped by the scrolling side menu). Arrow keys, Enter and Esc work.
import { useEffect, useRef, useState } from 'react'
import Icon from './Icon'

export default function MenuSelect<T extends string | number>({
  value,
  options,
  onChange,
  label,
  display,
  className = ''
}: {
  value: T
  options: { value: T; label: string }[]
  onChange: (v: T) => void
  label: string
  /** Shorter text for the button than the option's full label. */
  display?: string
  className?: string
}) {
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  const [at, setAt] = useState({ left: 0, top: 0, width: 0 })
  const btn = useRef<HTMLButtonElement>(null)
  const list = useRef<HTMLUListElement>(null)
  const current = options.find((o) => o.value === value)

  const show = () => {
    const r = btn.current!.getBoundingClientRect()
    const h = Math.min(options.length * 34 + 8, 360)
    const top = r.bottom + 4 + h > window.innerHeight - 8 ? Math.max(8, r.top - 4 - h) : r.bottom + 4
    setAt({ left: r.left, top, width: Math.max(r.width, 200) })
    setHi(Math.max(0, options.findIndex((o) => o.value === value)))
    setOpen(true)
  }
  const pick = (v: T) => {
    onChange(v)
    setOpen(false)
    btn.current?.focus()
  }

  useEffect(() => {
    if (!open) return
    const close = (e: Event) => {
      if (!list.current?.contains(e.target as Node) && !btn.current?.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', close)
    window.addEventListener('resize', close)
    window.addEventListener('scroll', close, true)
    return () => {
      window.removeEventListener('mousedown', close)
      window.removeEventListener('resize', close)
      window.removeEventListener('scroll', close, true)
    }
  }, [open])
  useEffect(() => {
    if (open) list.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [hi, open])

  return (
    <>
      <button
        ref={btn}
        type="button"
        className={`menu-select ${className}${open ? ' open' : ''}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`${label}: ${current?.label ?? ''}`}
        title={label}
        onClick={() => (open ? setOpen(false) : show())}
        onKeyDown={(e) => {
          if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) return e.preventDefault(), show()
          if (!open) return
          if (e.key === 'ArrowDown') (e.preventDefault(), setHi(Math.min(hi + 1, options.length - 1)))
          else if (e.key === 'ArrowUp') (e.preventDefault(), setHi(Math.max(hi - 1, 0)))
          else if (e.key === 'Enter' || e.key === ' ') (e.preventDefault(), pick(options[hi].value))
          else if (e.key === 'Escape') (e.preventDefault(), e.stopPropagation(), setOpen(false))
        }}
      >
        {className.includes('row') && <span className="menu-select-lbl">{label}</span>}
        <span className="menu-select-val" title={current?.label}>
          {display ?? current?.label}
        </span>
        <Icon name="chevron" size={14} />
      </button>
      {open && (
        <ul ref={list} className="menu-select-list" role="listbox" aria-label={label} style={{ left: at.left, top: at.top, minWidth: at.width }}>
          {options.map((o, i) => (
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
              {o.label}
            </li>
          ))}
        </ul>
      )}
    </>
  )
}
