import { useState } from 'react'
import type { PlanetaryHours, SkyEvent, SkyReport, TzSpec } from '@shared/types'
import { glyph, moonPhase, POINT, SIGNS, signGlyph, splitDeg } from '../lib/astro'
import { bodyKey, eventText, moonIllumination } from '../lib/sky'
import { jdToLocal } from '../lib/time'

const p2 = (n: number) => String(n).padStart(2, '0')
const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
const MONTHS = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara']
const ELEMENT_COLOR = { fire: '#e0533a', earth: '#4a9a3c', air: '#d4a12a', water: '#3878d0' } as const

/** Moon disc lit like the real phase (waxing lit on the right, northern view). */
function MoonIcon({ angle, size = 44 }: { angle: number; size?: number }) {
  const r = size / 2 - 2
  const c = size / 2
  const waxing = angle < 180
  const k = Math.cos((angle * Math.PI) / 180) // 1 new, -1 full
  const rx = Math.abs(k) * r
  const crescent = k > 0
  const outer = waxing ? 1 : 0
  const term = crescent === waxing ? 0 : 1
  const d = `M${c},${c - r} A${r},${r} 0 0 ${outer} ${c},${c + r} A${rx},${r} 0 0 ${term} ${c},${c - r} Z`
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="moon-icon" aria-hidden>
      <circle cx={c} cy={c} r={r} className="moon-dark" />
      {angle > 1 && angle < 359 && <path d={d} className="moon-lit" />}
      <circle cx={c} cy={c} r={r} className="moon-rim" />
    </svg>
  )
}

const KIND_STYLE: Record<SkyEvent['kind'], string> = {
  'station-r': 'ev-retro',
  'station-d': 'ev-direct',
  ingress: 'ev-ingress',
  'new-moon': 'ev-moon',
  'full-moon': 'ev-moon',
  'solar-eclipse': 'ev-eclipse',
  'lunar-eclipse': 'ev-eclipse'
}

export default function SkyPanel({
  report,
  hours,
  jd,
  tz,
  lon,
  onJump
}: {
  report: SkyReport | null
  hours: PlanetaryHours | null
  jd: number
  tz: TzSpec
  lon: number
  onJump: (jd: number) => void
}) {
  const [showHours, setShowHours] = useState(false)
  if (!report) return <div className="sky muted small pad">Gökyüzü hesaplanıyor…</div>

  const local = (t: number) => jdToLocal(t, tz, lon)
  const ref = local(report.jd)
  const ph = moonPhase(report.sunLon, report.moonLon)
  const moonSign = splitDeg(report.moonLon).sign
  const shortDate = (t: number) => {
    const l = local(t)
    return `${l.d} ${MONTHS[l.m - 1]}${l.y !== ref.y ? ' ' + l.y : ''}`
  }
  const hm = (t: number) => {
    const l = local(t)
    return `${p2(l.h)}:${p2(l.mi)}`
  }
  const rel = (t: number) => {
    const a = local(jd)
    const b = local(t)
    const days = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000)
    if (days === 0) return 'bugün'
    if (days === 1) return 'yarın'
    if (days === -1) return 'dün'
    return days > 0 ? `${days} gün sonra` : `${-days} gün önce`
  }
  const vocActive = !!report.voc && jd >= report.voc.start && jd < report.voc.end
  const curHour = hours?.hours.find((h) => jd >= h.start && jd < h.end)
  const events = [...report.events, ...report.nextEclipses.filter((e) => !report.events.includes(e))]

  return (
    <div className="sky">
      <div className="sky-hero">
        <MoonIcon angle={ph.angle} />
        <div className="sky-hero-text">
          <div className="sky-date">
            {ref.d} {MONTHS[ref.m - 1]} {ref.y}
          </div>
          <div className="sky-moon-line">
            Ay <span className="glyph" style={{ color: ELEMENT_COLOR[SIGNS[moonSign].element] }}>{signGlyph(moonSign)}</span> {SIGNS[moonSign].name}{' '}
            {splitDeg(report.moonLon).deg}°
          </div>
          <div className="muted small">
            {ph.name} · %{moonIllumination(report)}
          </div>
        </div>
      </div>

      <div className="sky-pills">
        {report.voc && (
          <button
            className={`pill ${vocActive ? 'pill-warn' : ''}`}
            onClick={() => onJump(report.voc!.start)}
            title={`Ay boşlukta: ${shortDate(report.voc.start)} ${hm(report.voc.start)} → ${shortDate(report.voc.end)} ${hm(report.voc.end)}`}
          >
            {vocActive ? '◌ Ay boşlukta' : '◌ Boşluk'} · {vocActive ? `${hm(report.voc.end)}'e kadar` : `${rel(report.voc.start)} ${hm(report.voc.start)}`}
          </button>
        )}
        {hours && (
          <button className={`pill ${showHours ? 'on' : ''}`} onClick={() => setShowHours(!showHours)} title="Gezegen günü ve saati">
            <span className="glyph">{glyph(bodyKey(hours.dayRuler))}</span> {WEEKDAYS[hours.weekday]}
            {curHour && (
              <>
                {' · saat '}
                <span className="glyph">{glyph(bodyKey(curHour.ruler))}</span> {hm(curHour.end)}'e kadar
              </>
            )}
          </button>
        )}
      </div>
      {showHours && hours && (
        <div className="hours-card">
          <div className="muted small">
            ☀ Doğuş {hm(hours.sunrise)} · Batış {hm(hours.sunset)}
          </div>
          <div className="hours-grid">
            {hours.hours.map((h, i) => (
              <button key={i} className={h === curHour ? 'on' : h.night ? 'night' : ''} onClick={() => onJump(h.start + 1 / 1440)} title={POINT[bodyKey(h.ruler)].name}>
                <span className="glyph">{glyph(bodyKey(h.ruler))}</span> {hm(h.start)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="sky-sub">Retro gezegenler</div>
      {report.retro.length === 0 && <div className="muted small">Şu an retro gezegen yok ✨</div>}
      {report.retro.map((r) => {
        const pct = r.start && r.end ? Math.min(100, Math.max(0, ((jd - r.start) / (r.end - r.start)) * 100)) : 50
        const left = r.end ? Math.max(0, Math.ceil(r.end - jd)) : null
        return (
          <button key={r.body} className="retro-row" onClick={() => r.end && onJump(r.end)} title={`${r.start ? shortDate(r.start) : '?'} → ${r.end ? shortDate(r.end) : '?'} · tıklayınca düz harekete geçtiği ana gider`}>
            <span className="glyph retro-glyph">{glyph(bodyKey(r.body))}</span>
            <span className="retro-body">
              <span className="retro-top">
                <span>{POINT[bodyKey(r.body)].name}</span>
                <span className="muted small">{left !== null ? `${left} gün kaldı` : ''}</span>
              </span>
              <span className="retro-bar">
                <span style={{ width: `${pct}%` }} />
              </span>
              <span className="retro-dates muted">
                <span>{r.start ? shortDate(r.start) : '?'}</span>
                <span>{r.end ? shortDate(r.end) : '?'}</span>
              </span>
            </span>
          </button>
        )
      })}

      <div className="sky-sub">Yaklaşan olaylar</div>
      <ul className="timeline">
        {events.map((e, i) => {
          const sd = splitDeg(e.lon)
          return (
            <li key={i}>
              <button onClick={() => onJump(e.jd)} title="Bu ana git">
                <span className={`tl-dot ${KIND_STYLE[e.kind]}`}>
                  {e.kind === 'new-moon' ? '●' : e.kind === 'full-moon' ? '○' : e.kind.includes('eclipse') ? '◐' : <span className="glyph">{glyph(bodyKey(e.body))}</span>}
                </span>
                <span className="tl-body">
                  <span className="tl-title">
                    {eventText(e)}
                    {e.kind === 'station-r' && <span className="retro"> ℞</span>}
                  </span>
                  <span className="tl-meta">
                    {shortDate(e.jd)} · {hm(e.jd)} · <em>{rel(e.jd)}</em>
                  </span>
                </span>
                <span className="tl-pos">
                  {sd.deg}°<span className="glyph" style={{ color: ELEMENT_COLOR[SIGNS[sd.sign].element] }}>{signGlyph(sd.sign)}</span>
                </span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
