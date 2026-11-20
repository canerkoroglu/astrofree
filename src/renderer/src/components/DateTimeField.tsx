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

const fold = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/\p{M}/gu, '').replace(/ı/g, 'i') // i18n-ignore

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
  // Days, months of a year, or a page of twelve years: birth dates are often decades back.
  const [mode, setMode] = useState<'days' | 'months' | 'years'>('days')
  const wrap = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!focused) setText(formatLocal(value, seconds))
  }, [value, seconds, focused])
  useEffect(() => {
    if (open) {
      setView({ y: value.y, m: value.m })
      setMode('days')
    }
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
  const today = new Date()
  const yearPage = view.y - (((view.y % 12) + 12) % 12)

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
        <div className="dtf-pop" onKeyDown={(e) => e.key === 'Escape' && (e.stopPropagation(), setOpen(false))}>
          <div className="dtf-head">
            <button
              type="button"
              className="dtf-nav"
              onClick={() => (mode === 'days' ? shiftMonth(-1) : setView({ ...view, y: view.y - (mode === 'years' ? 12 : 1) }))}
              aria-label={mode === 'days' ? t('Önceki ay') : t('Önceki')}
            >
              ‹
            </button>
            <div className="dtf-title">
              {mode === 'days' && (
                <button type="button" className="dtf-title-btn" onClick={() => setMode('months')} title={t('Ay seç')}>
                  {monthsLong()[view.m - 1]}
                </button>
              )}
              {mode !== 'years' ? (
                <button type="button" className="dtf-title-btn" onClick={() => setMode('years')} title={t('Yıl seç')}>
                  {view.y}
                </button>
              ) : (
                <span className="dtf-title-range">
                  {yearPage} – {yearPage + 11}
                </span>
              )}
            </div>
            <button
              type="button"
              className="dtf-nav"
              onClick={() => (mode === 'days' ? shiftMonth(1) : setView({ ...view, y: view.y + (mode === 'years' ? 12 : 1) }))}
              aria-label={mode === 'days' ? t('Sonraki ay') : t('Sonraki')}
            >
              ›
            </button>
          </div>

          {mode === 'days' && (
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
                    className={[
                      d === value.d && view.m === value.m && view.y === value.y ? 'on' : '',
                      d === today.getDate() && view.m === today.getMonth() + 1 && view.y === today.getFullYear() ? 'today' : ''
                    ].join(' ')}
                    onClick={() => onChange({ ...value, y: view.y, m: view.m, d })}
                  >
                    {d}
                  </button>
                )
              )}
            </div>
          )}
          {mode === 'months' && (
            <div className="dtf-cells">
              {monthsLong().map((name, i) => (
                <button
                  type="button"
                  key={i}
                  className={i + 1 === value.m && view.y === value.y ? 'on' : ''}
                  onClick={() => (setView({ ...view, m: i + 1 }), setMode('days'))}
                >
                  {name}
                </button>
              ))}
            </div>
          )}
          {mode === 'years' && (
            <div className="dtf-cells">
              {Array.from({ length: 12 }, (_, i) => yearPage + i).map((y) => (
                <button type="button" key={y} className={y === value.y ? 'on' : y === today.getFullYear() ? 'today' : ''} onClick={() => (setView({ ...view, y }), setMode('months'))}>
                  {y}
                </button>
              ))}
            </div>
          )}

          <div className="dtf-time">
            <span className="dtf-time-lbl">{t('Saat')}</span>
            <Spin value={value.h} max={23} onChange={(h) => setTime({ h })} label={t('Saat')} />
            <span className="dtf-colon">:</span>
            <Spin value={value.mi} max={59} onChange={(mi) => setTime({ mi })} label={t('Dakika')} />
            {seconds && (
              <>
                <span className="dtf-colon">:</span>
                <Spin value={value.s} max={59} onChange={(sec) => setTime({ s: sec })} label={t('Saniye')} />
              </>
            )}
          </div>
          <div className="dtf-foot">
            <button
              type="button"
              className="dtf-today"
              onClick={() => {
                onChange({ ...value, y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() })
                setView({ y: today.getFullYear(), m: today.getMonth() + 1 })
                setMode('days')
              }}
            >
              {t('Bugün')}
            </button>
            <span className="grow" />
            <button type="button" className="primary dtf-ok" onClick={() => setOpen(false)}>
              {t('Tamam')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

/** A two-digit number with ▲ ▼; arrow keys and the mouse wheel step it, wrapping around. */
function Spin({ value, max, onChange, label }: { value: number; max: number; onChange: (v: number) => void; label: string }) {
  const step = (k: number) => onChange((((value + k) % (max + 1)) + max + 1) % (max + 1))
  return (
    <div className="spin" onWheel={(e) => step(e.deltaY < 0 ? 1 : -1)}>
      <button type="button" tabIndex={-1} onClick={() => step(1)} aria-label={`${label} +1`}>
        ▲
      </button>
      <input
        inputMode="numeric"
        aria-label={label}
        value={p2(value)}
        onChange={(e) => {
          const v = parseInt(e.target.value.replace(/\D/g, '').slice(-2) || '0', 10)
          onChange(Math.max(0, Math.min(max, v)))
        }}
        onFocus={(e) => e.currentTarget.select()}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') (e.preventDefault(), step(1))
          if (e.key === 'ArrowDown') (e.preventDefault(), step(-1))
        }}
      />
      <button type="button" tabIndex={-1} onClick={() => step(-1)} aria-label={`${label} −1`}>
        ▼
      </button>
    </div>
  )
}
