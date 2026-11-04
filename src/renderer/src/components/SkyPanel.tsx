import { monthsShort, t, weekdays } from '../lib/i18n'
import { useState } from 'react'
import type { PlanetaryHours, SkyEvent, SkyReport, TzSpec } from '@shared/types'
import { glyph, moonPhase, POINT, SIGNS, signGlyph, splitDeg } from '../lib/astro'
import { bodyKey, eventText, moonIllumination } from '../lib/sky'
import { mansionOf } from '../lib/kb'
import { jdToLocal } from '../lib/time'

const p2 = (n: number) => String(n).padStart(2, '0')
const ELEMENT_COLOR = { fire: 'var(--el-fire)', earth: 'var(--el-earth)', air: 'var(--el-air)', water: 'var(--el-water)' } as const

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
  onJump,
  wide = false
}: {
  report: SkyReport | null
  hours: PlanetaryHours | null
  jd: number
  tz: TzSpec
  lon: number
  onJump: (jd: number) => void
  /** Full-size layout (lightbox): sections side by side, planetary hours open. */
  wide?: boolean
}) {
  const [showHours, setShowHours] = useState(wide)
  if (!report) return <div className="sky muted small pad">{t('Gökyüzü hesaplanıyor…')}</div>

  const local = (tt: number) => jdToLocal(tt, tz, lon)
  const ref = local(report.jd)
  const ph = moonPhase(report.sunLon, report.moonLon)
  const moonSign = splitDeg(report.moonLon).sign
  const shortDate = (tt: number) => {
    const l = local(tt)
    return `${l.d} ${monthsShort()[l.m - 1]}${l.y !== ref.y ? ' ' + l.y : ''}`
  }
  const hm = (tt: number) => {
    const l = local(tt)
    return `${p2(l.h)}:${p2(l.mi)}`
  }
  const rel = (tt: number) => {
    const a = local(jd)
    const b = local(tt)
    const days = Math.round((Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86400000)
    if (days === 0) return t('bugün')
    if (days === 1) return t('yarın')
    if (days === -1) return t('dün')
    return days > 0 ? t('{n} gün sonra', { n: days }) : t('{n} gün önce', { n: -days })
  }
  const vocActive = !!report.voc && jd >= report.voc.start && jd < report.voc.end
  const curHour = hours?.hours.find((h) => jd >= h.start && jd < h.end)
  const events = [...report.events, ...report.nextEclipses.filter((e) => !report.events.includes(e))]

  return (
    <div className={wide ? 'sky sky-wide' : 'sky'}>
      <div className="sky-col">
      <div className="sky-hero">
        <MoonIcon angle={ph.angle} />
        <div className="sky-hero-text">
          <div className="sky-date">
            {ref.d} {monthsShort()[ref.m - 1]} {ref.y}
          </div>
          <div className="sky-moon-line">
            {t('Ay')} <span className="glyph" style={{ color: ELEMENT_COLOR[SIGNS[moonSign].element] }}>{signGlyph(moonSign)}</span> {SIGNS[moonSign].name}{' '}
            {splitDeg(report.moonLon).deg}°
          </div>
          <div className="muted small">
            {ph.name} · %{moonIllumination(report)}
          </div>
          <div className="muted small" title={t('28 Ay durağı (menâzil)')}>
            {t('{n}. durak', { n: mansionOf(report.moonLon).n })} · {mansionOf(report.moonLon).name}
          </div>
        </div>
      </div>

      <div className="sky-pills">
        {report.voc && (
          <button
            className={`pill ${vocActive ? 'pill-warn' : ''}`}
            onClick={() => onJump(report.voc!.start)}
            title={`${t('Ay boşlukta')}: ${shortDate(report.voc.start)} ${hm(report.voc.start)} → ${shortDate(report.voc.end)} ${hm(report.voc.end)}`}
          >
            {vocActive ? `◌ ${t('Ay boşlukta')}` : `◌ ${t('Boşluk')}`} · {vocActive ? `${t('bitiş')} ${hm(report.voc.end)}` : `${rel(report.voc.start)} ${hm(report.voc.start)}`}
          </button>
        )}
        {hours && (
          <button className={`pill ${showHours ? 'on' : ''}`} onClick={() => setShowHours(!showHours)} title={t('Gezegen günü ve saati')}>
            <span className="glyph">{glyph(bodyKey(hours.dayRuler))}</span> {weekdays()[hours.weekday]}
            {curHour && (
              <>
                {` · ${t('saat')} `}
                <span className="glyph">{glyph(bodyKey(curHour.ruler))}</span> → {hm(curHour.end)}
              </>
            )}
          </button>
        )}
      </div>
      {showHours && hours && (
        <div className="hours-card">
          <div className="muted small">
            ☀ {t('Doğuş')} {hm(hours.sunrise)} · {t('Batış')} {hm(hours.sunset)}
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

      </div>
      <div className="sky-col">
      <div className="sky-sub">{t('Retro gezegenler')}</div>
      {report.retro.length === 0 && <div className="muted small">{t('Şu an retro gezegen yok')}</div>}
      {report.retro.map((r) => {
        const pct = r.start && r.end ? Math.min(100, Math.max(0, ((jd - r.start) / (r.end - r.start)) * 100)) : 50
        const left = r.end ? Math.max(0, Math.ceil(r.end - jd)) : null
        return (
          <button key={r.body} className="retro-row" onClick={() => r.end && onJump(r.end)} title={`${r.start ? shortDate(r.start) : '?'} → ${r.end ? shortDate(r.end) : '?'} · ${t('tıklayınca düz harekete geçtiği ana gider')}`}>
            <span className="glyph retro-glyph">{glyph(bodyKey(r.body))}</span>
            <span className="retro-body">
              <span className="retro-top">
                <span>{POINT[bodyKey(r.body)].name}</span>
                <span className="muted small">{left !== null ? t('{n} gün kaldı', { n: left }) : ''}</span>
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

      </div>
      <div className="sky-col">
      <div className="sky-sub">{t('Yaklaşan olaylar')}</div>
      <ul className="timeline">
        {events.map((e, i) => {
          const sd = splitDeg(e.lon)
          return (
            <li key={i}>
              <button onClick={() => onJump(e.jd)} title={t('Bu ana git')}>
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
    </div>
  )
}
