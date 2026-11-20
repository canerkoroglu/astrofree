// Synastry partner chooser: a search box over the saved charts (name, place, year, tags,
// notes — accents ignored, as in the people list), with arrow keys and Enter.
import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChartRecord } from '@shared/types'
import { t } from '../lib/i18n'
import { haystack, matches, sortCharts } from '../lib/people'
import { fmtLocal } from '../lib/time'

export default function PartnerPicker({ charts, value, onChange }: { charts: ChartRecord[]; value: string | null; onChange: (id: string) => void }) {
  const current = charts.find((c) => c.id === value) ?? null
  const [q, setQ] = useState('')
  const [open, setOpen] = useState(false)
  const [hi, setHi] = useState(0)
  // The list is placed on the screen, so the narrow, scrolling side menu does not clip it.
  const [at, setAt] = useState<{ left: number; top: number } | null>(null)
  const box = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const hay = useMemo(() => new Map(charts.map((c) => [c.id, haystack(c)])), [charts])
  const list = useMemo(() => sortCharts(charts.filter((c) => !q.trim() || matches(c, q, hay.get(c.id))), 'name').slice(0, 50), [charts, q, hay])

  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => !box.current?.contains(e.target as Node) && (setOpen(false), setQ(''))
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])
  useEffect(() => setHi(0), [q])
  useEffect(() => {
    listRef.current?.querySelector<HTMLElement>(`[data-i="${hi}"]`)?.scrollIntoView({ block: 'nearest' })
  }, [hi])

  const pick = (c: ChartRecord) => {
    onChange(c.id)
    setOpen(false)
    setQ('')
  }

  return (
    <div className="pp" ref={box}>
      <input
        className="pp-input"
        role="combobox"
        aria-expanded={open}
        aria-controls="pp-list"
        aria-label={t('Sinastri partneri')}
        placeholder={current ? current.name : t('Kişi ara…')}
        value={open ? q : current?.name ?? ''}
        onFocus={(e) => {
          const r = e.currentTarget.getBoundingClientRect()
          setAt({ left: r.left, top: r.bottom + 4 })
          setOpen(true)
          setQ('')
          e.currentTarget.select()
        }}
        onChange={(e) => (setQ(e.target.value), setOpen(true))}
        onKeyDown={(e) => {
          if (e.key === 'ArrowDown') (e.preventDefault(), setOpen(true), setHi(Math.min(hi + 1, list.length - 1)))
          else if (e.key === 'ArrowUp') (e.preventDefault(), setHi(Math.max(hi - 1, 0)))
          else if (e.key === 'Enter' && open && list[hi]) (e.preventDefault(), pick(list[hi]), e.currentTarget.blur())
          else if (e.key === 'Escape') (e.stopPropagation(), setOpen(false), setQ(''), e.currentTarget.blur())
        }}
      />
      {open && (
        <ul className="pp-list" id="pp-list" role="listbox" ref={listRef} style={at ? { left: at.left, top: Math.min(at.top, window.innerHeight - 330) } : undefined}>
          {list.map((c, i) => (
            <li
              key={c.id}
              data-i={i}
              role="option"
              aria-selected={c.id === value}
              className={`${i === hi ? 'hi' : ''}${c.id === value ? ' on' : ''}`}
              onMouseEnter={() => setHi(i)}
              onMouseDown={(e) => (e.preventDefault(), pick(c))}
            >
              <span className="nm">
                {c.kind === 'event' ? '◆ ' : ''}
                {c.name}
              </span>
              <span className="muted small">
                {fmtLocal(c.local).split(' ')[0]} · {c.place.name.split(',')[0]}
              </span>
            </li>
          ))}
          {!list.length && <li className="muted small pp-none">{t('Aramaya uyan kayıt yok.')}</li>}
        </ul>
      )}
    </div>
  )
}
