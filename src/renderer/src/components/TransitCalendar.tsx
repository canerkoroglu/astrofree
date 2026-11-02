import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, AspectKey, TransitHit, TzSpec } from '@shared/types'
import { ASPECT, glyph, POINT, type Layer } from '../lib/astro'
import { bodyKey } from '../lib/sky'
import { jdToLocal } from '../lib/time'

const GROUPS = {
  slow: { label: 'Jüpiter–Plüton, Chiron', bodies: [5, 6, 7, 8, 9, 15] },
  mars: { label: 'Mars', bodies: [4] },
  fast: { label: 'Güneş, Merkür, Venüs', bodies: [0, 2, 3] }
} as const
type Group = keyof typeof GROUPS

const NATAL_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'chiron', 'asc', 'mc']
const MAJORS: AspectKey[] = ['conjunction', 'opposition', 'square', 'trine', 'sextile']
const MONTHS = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık']
const p2 = (n: number) => String(n).padStart(2, '0')

export function calendarText(hits: TransitHit[], tz: TzSpec, lon: number, limit = 80): string {
  const d = (jd: number) => {
    const l = jdToLocal(jd, tz, lon)
    return `${p2(l.d)}.${p2(l.m)}.${l.y}`
  }
  const lines = hits.slice(0, limit).map((h) => {
    const exact = h.exacts.length ? h.exacts.map((e) => d(e.jd) + (e.retro ? ' ℞' : '')).join(', ') : 'tam isabet yok (orb içinde)'
    return `- T.${POINT[bodyKey(h.body)].name} ${ASPECT[h.aspect].name} N.${POINT[h.natalKey].name}: tam ${exact}; etki ${h.startsBefore ? '…' : d(h.start)} – ${h.endsAfter ? '…' : d(h.end)}`
  })
  return ['# TRANSİT TAKVİMİ', ...lines, hits.length > limit ? `(+${hits.length - limit} transit daha)` : ''].filter(Boolean).join('\n')
}

export default function TransitCalendar({
  natal,
  settings,
  startJd,
  tz,
  lon,
  onJump,
  onHits
}: {
  natal: Layer
  settings: AppSettings
  startJd: number
  tz: TzSpec
  lon: number
  onJump: (jd: number) => void
  onHits: (hits: TransitHit[]) => void
}) {
  const [months, setMonths] = useState(12)
  const [groups, setGroups] = useState<Record<Group, boolean>>({ slow: true, mars: true, fast: false })
  const [hits, setHits] = useState<TransitHit[] | null>(null)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState('')

  const startDay = Math.floor(startJd + 0.5) - 0.5
  const natalKey = natal.points.map((p) => p.lon.toFixed(4)).join(',')

  useEffect(() => {
    let alive = true
    const timer = window.setTimeout(async () => {
      setBusy(true)
      const bodies = (Object.keys(GROUPS) as Group[]).filter((g) => groups[g]).flatMap((g) => [...GROUPS[g].bodies])
      const res = await window.astro.tools.transits({
        start: startDay,
        end: startDay + months * 30.4375,
        bodies,
        natal: natal.points.filter((p) => NATAL_KEYS.includes(p.key)).map((p) => ({ key: p.key, lon: p.lon })),
        aspects: MAJORS.map((k) => ({ key: k, angle: ASPECT[k].angle, orb: Math.max(0.5, settings.aspects[k].outerOrb) })),
        sidMode: settings.zodiac === 'sidereal' ? settings.sidMode : null
      })
      if (!alive) return
      setHits(res)
      onHits(res)
      setBusy(false)
    }, 250)
    return () => {
      alive = false
      window.clearTimeout(timer)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDay, months, groups, natalKey, settings.aspects, settings.zodiac, settings.sidMode])

  const date = (jd: number) => {
    const l = jdToLocal(jd, tz, lon)
    return `${p2(l.d)}.${p2(l.m)}.${l.y}`
  }

  const grouped = useMemo(() => {
    const out: { label: string; rows: TransitHit[] }[] = []
    const f = filter.toLocaleLowerCase('tr')
    for (const h of hits ?? []) {
      if (f) {
        const text = `${POINT[bodyKey(h.body)].name} ${ASPECT[h.aspect].name} ${POINT[h.natalKey].name}`.toLocaleLowerCase('tr')
        if (!text.includes(f)) continue
      }
      const key = h.exacts[0]?.jd ?? h.start
      const l = jdToLocal(key, tz, lon)
      const label = `${MONTHS[l.m - 1]} ${l.y}`
      if (out[out.length - 1]?.label !== label) out.push({ label, rows: [] })
      out[out.length - 1].rows.push(h)
    }
    return out
  }, [hits, filter, tz, lon])

  return (
    <div className="calendar">
      <div className="cal-controls">
        <span>
          <strong>{date(startDay + 0.5)}</strong> tarihinden itibaren
        </span>
        <select value={months} onChange={(e) => setMonths(Number(e.target.value))}>
          {[1, 3, 6, 12, 24, 36].map((m) => (
            <option key={m} value={m}>
              {m} ay
            </option>
          ))}
        </select>
        {(Object.keys(GROUPS) as Group[]).map((g) => (
          <label key={g} className="inline small">
            <input type="checkbox" checked={groups[g]} onChange={(e) => setGroups({ ...groups, [g]: e.target.checked })} />
            {GROUPS[g].label}
          </label>
        ))}
        <input className="cal-filter" placeholder="Süz… (ör. Satürn, kare)" value={filter} onChange={(e) => setFilter(e.target.value)} />
        {busy && <span className="muted small">Hesaplanıyor…</span>}
      </div>
      <p className="muted small">
        Tarihe tıklayınca harita o ana gider. Orb'lar Ayarlar → Açılar'daki "Transit" sütunundan alınır. ℞: geçiş retro sırasında.
      </p>
      {hits && hits.length === 0 && <p className="muted pad">Bu aralıkta transit bulunamadı.</p>}
      {grouped.map((g) => (
        <section key={g.label}>
          <h3>{g.label}</h3>
          <table className="data cal">
            <tbody>
              {g.rows.map((h, i) => (
                <tr key={i}>
                  <td className="cal-exact">
                    {h.exacts.length ? (
                      h.exacts.map((e, j) => (
                        <button key={j} className="link" onClick={() => onJump(e.jd)} title="Bu ana git">
                          {date(e.jd)}
                          {e.retro ? ' ℞' : ''}
                        </button>
                      ))
                    ) : (
                      <span className="muted small">orb içinde</span>
                    )}
                  </td>
                  <td>
                    <span className="glyph t-col">{glyph(bodyKey(h.body))}</span> {POINT[bodyKey(h.body)].name}
                  </td>
                  <td>
                    <span className={`glyph asp-${ASPECT[h.aspect].kind}`}>{ASPECT[h.aspect].glyph}</span> {ASPECT[h.aspect].name}
                  </td>
                  <td>
                    <span className="glyph">{glyph(h.natalKey)}</span> {POINT[h.natalKey].name}
                  </td>
                  <td className="muted small">
                    <button className="link small" onClick={() => onJump(h.start)}>
                      {h.startsBefore ? '…' : date(h.start)}
                    </button>{' '}
                    –{' '}
                    <button className="link small" onClick={() => onJump(h.end)}>
                      {h.endsAfter ? '…' : date(h.end)}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  )
}
