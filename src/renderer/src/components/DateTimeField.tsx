import { dowMonFirst, monthsLong, t } from '../lib/i18n'
import { useEffect, useRef, useState } from 'react'
import type { LocalDateTime } from '@shared/types'
import { fmtDate, getDateOrder } from '../lib/time'

const MONTHS_EN = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
// i18n-ignore-start (default names; the UI reads them from src/shared/i18n)
export const MONTHS_TR = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
// i18n-ignore-end
const p2 = (n: number) => String(n).padStart(2, '0')

const daysIn = (y: number, m: number) => (m === 2 ? (isLeap(y) ? 29 : 28) : [4, 6, 9, 11].includes(m) ? 30 : 31)
function isLeap(y: number) {
  return y < 1583 ? y % 4 === 0 : (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0
}

export function formatLocal(l: LocalDateTime, seconds: boolean): string {
  return `${fmtDate(l)} ${p2(l.h)}:${p2(l.mi)}${seconds ? ':' + p2(l.s) : ''}`
}

const fold = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i')

/**
 * Parse "17.01.1942 18:35", "17/1/1942", "1942-01-17 18:35:20",
 * "17 Ocak 1942 18:35". Missing time keeps the previous time.
 */
export function parseLocal(text: string, prev: LocalDateTime): LocalDateTime | null {
  const t = fold(text.trim())
  if (!t) return null
  let y: number, m: number, d: number
  let rest = ''
  let mt: RegExpMatchArray | null
  if ((mt = t.match(/^(-?\d{1,4})-(\d{1,2})-(\d{1,2})(.*)$/))) {
    ;[y, m, d] = [+mt[1], +mt[2], +mt[3]]
    rest = mt[4]
  } else if ((mt = t.match(/^(\d{1,2})[./-](\d{1,2})[./-](-?\d{1,4})(.*)$/))) {
    // Numeric dates follow the user's order (01/17/1942 when month-first).
    ;[d, m, y] = getDateOrder() === 'MDY' ? [+mt[2], +mt[1], +mt[3]] : [+mt[1], +mt[2], +mt[3]]
    rest = mt[4]
  } else if ((mt = t.match(/^(\d{1,2})\s+([a-z]+)\s+(-?\d{1,4})(.*)$/))) {
    const idx = [MONTHS_TR, MONTHS_EN].map((list) => list.findIndex((n) => fold(n).startsWith(mt![2].slice(0, 3)))).find((i) => i >= 0) ?? -1
    if (idx < 0) return null
    ;[d, m, y] = [+mt[1], idx + 1, +mt[3]]
    rest = mt[4]
  } else return null
  if (m < 1 || m > 12 || d < 1 || d > daysIn(y, m)) return null
  let { h, mi, s } = prev
  const tm = rest.trim().match(/^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/)
  if (rest.trim()) {
    if (!tm) return null
    ;[h, mi, s] = [+tm[1], +tm[2], tm[3] ? +tm[3] : 0]
    if (h > 23 || mi > 59 || s > 59) return null
  }
  return { y, m, d, h, mi, s }
}

/** Typed date/time with a Turkish calendar popover. */
export default function DateTimeField({
  value,
  onChange,
  seconds = false,
  className = '',
  live = false
}: {
  value: LocalDateTime
  onChange: (l: LocalDateTime) => void
  seconds?: boolean
  className?: string
  /** Apply every valid edit immediately (forms) instead of on blur (time bar). */
  live?: boolean
}) {
  const [text, setText] = useState(formatLocal(value, seconds))
  const [focused, setFocused] = useState(false)
  const [open, setOpen] = useState(false)
  const [view, setView] = useState({ y: value.y, m: value.m })
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focused) setText(formatLocal(value, seconds))
  }, [value, seconds, focused])
  useEffect(() => {
    if (open) setView({ y: value.y, m: value.m })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])
  useEffect(() => {
    if (!open) return
    const close = (e: MouseEvent) => {
      if (wrap.current && !wrap.current.contains(e.target as Node)) setOpen(false)
    }
    window.addEventListener('mousedown', close)
    return () => window.removeEventListener('mousedown', close)
  }, [open])

  const parsed = parseLocal(text, value)
  const commit = () => {
    if (parsed) onChange(parsed)
    else setText(formatLocal(value, seconds))
  }

  // Calendar grid, Monday first.
  const first = new Date(0)
  first.setUTCFullYear(view.y, view.m - 1, 1)
  const lead = (first.getUTCDay() + 6) % 7
  const n = daysIn(view.y, view.m)
  const cells: (number | null)[] = [...Array(lead).fill(null), ...Array.from({ length: n }, (_, i) => i + 1)]
  while (cells.length % 7) cells.push(null)
  const shiftMonth = (k: number) => {
    const t = view.y * 12 + view.m - 1 + k
    setView({ y: Math.floor(t / 12), m: (t % 12 + 12) % 12 + 1 })
  }
  const setTime = (patch: Partial<LocalDateTime>) => onChange({ ...value, ...patch })

  return (
    <div className={`dtf ${className}`} ref={wrap}>
      <input
        className={parsed ? '' : 'invalid'}
        value={text}
        spellCheck={false}
        placeholder={t(getDateOrder() === 'MDY' ? 'aa/gg/yyyy ss:dd' : getDateOrder() === 'YMD' ? 'yyyy-aa-gg ss:dd' : 'gg.aa.yyyy ss:dd')}
        title={t('Örn. 17.01.1942 18:35 · 17 Ocak 1942 18:35 · 1942-01-17')}
        onFocus={() => setFocused(true)}
        onBlur={() => {
          setFocused(false)
          commit()
        }}
        onChange={(e) => {
          setText(e.target.value)
          if (live) {
            const p = parseLocal(e.target.value, value)
            if (p && p.y >= 100) onChange(p)
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter') (e.target as HTMLInputElement).blur()
          if (e.key === 'Escape') {
            setText(formatLocal(value, seconds))
            ;(e.target as HTMLInputElement).blur()
          }
        }}
      />
      <button type="button" className="dtf-btn" title={t('Takvim')} aria-label={t('Takvimi aç')} onClick={() => setOpen(!open)}>
        <svg width="14" height="14" viewBox="0 0 16 16" aria-hidden>
          <rect x="2" y="3" width="12" height="11" rx="1.5" fill="none" stroke="currentColor" strokeWidth="1.4" />
          <path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div className="dtf-pop" onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}>
          <div className="dtf-head">
            <button type="button" onClick={() => shiftMonth(-1)} title={t('Önceki ay')}>
              ‹
            </button>
            <select value={view.m} onChange={(e) => setView({ ...view, m: +e.target.value })}>
              {monthsLong().map((name, i) => (
                <option key={i} value={i + 1}>
                  {name}
                </option>
              ))}
            </select>
            <input
              type="number"
              className="dtf-year"
              value={view.y}
              onChange={(e) => e.target.value && setView({ ...view, y: Math.max(-3000, Math.min(3000, +e.target.value)) })}
            />
            <button type="button" onClick={() => shiftMonth(1)} title={t('Sonraki ay')}>
              ›
            </button>
          </div>
          <div className="dtf-grid">
            {dowMonFirst().map((d) => (
              <span key={d} className="dtf-dow">
                {d}
              </span>
            ))}
            {cells.map((d, i) =>
              d === null ? (
                <span key={i} />
              ) : (
                <button
                  type="button"
                  key={i}
                  className={d === value.d && view.m === value.m && view.y === value.y ? 'on' : ''}
                  onClick={() => onChange({ ...value, y: view.y, m: view.m, d })}
                >
                  {d}
                </button>
              )
            )}
          </div>
          <div className="dtf-time">
            <span className="muted small">{t('Saat')}</span>
            <input type="number" min={0} max={23} value={value.h} onChange={(e) => setTime({ h: Math.max(0, Math.min(23, +e.target.value || 0)) })} />
            :
            <input type="number" min={0} max={59} value={p2(value.mi)} onChange={(e) => setTime({ mi: Math.max(0, Math.min(59, +e.target.value || 0)) })} />
            {seconds && (
              <>
                :
                <input type="number" min={0} max={59} value={p2(value.s)} onChange={(e) => setTime({ s: Math.max(0, Math.min(59, +e.target.value || 0)) })} />
              </>
            )}
            <span className="grow" />
            <button type="button" className="link small" onClick={() => setOpen(false)}>
              {t('Tamam')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
