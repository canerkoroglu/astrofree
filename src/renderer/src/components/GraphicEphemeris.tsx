import { monthsShort, t } from '../lib/i18n'
import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, TzSpec } from '@shared/types'
import { glyph, POINT, type Layer } from '../lib/astro'
import { acgTone } from '../lib/acg'
import { bodyKey } from '../lib/sky'
import { fmtDate, jdToLocal } from '../lib/time'

const BODIES = [0, 2, 3, 4, 5, 6, 7, 8, 9, 15]
const NATAL_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']
const W = 1000
const H = 520
const PAD = { l: 52, r: 16, t: 12, b: 28 }

/**
 * Graphic ephemeris: transiting longitudes against time, folded by a modulus
 * (360°, 90°, 45° or 30°) so every hard-aspect contact to a natal point
 * shows up as a crossing of its horizontal line.
 */
export default function GraphicEphemeris({
  natal,
  startJd,
  tz,
  lon,
  settings,
  onJump
}: {
  natal: Layer
  startJd: number
  tz: TzSpec
  lon: number
  settings: AppSettings
  onJump: (jd: number) => void
}) {
  const [months, setMonths] = useState(12)
  const [mod, setMod] = useState(360)
  const [data, setData] = useState<{ jd: number[]; lon: Record<number, number[]> } | null>(null)
  const [hover, setHover] = useState<number | null>(null)
  const [focus, setFocus] = useState<number | null>(null)
  const start = Math.floor(startJd) + 0.5

  useEffect(() => {
    let alive = true
    const days = months * 30.44
    void window.astro.tools
      .series(start, days, Math.max(0.5, days / 500), BODIES, settings.zodiac === 'sidereal' ? settings.sidMode : null)
      .then((d) => alive && setData(d))
    return () => {
      alive = false
    }
  }, [start, months, settings.zodiac, settings.sidMode])

  const iw = W - PAD.l - PAD.r
  const ih = H - PAD.t - PAD.b
  const x = (jd: number) => (data ? PAD.l + ((jd - data.jd[0]) / (data.jd[data.jd.length - 1] - data.jd[0])) * iw : 0)
  const y = (l: number) => PAD.t + ih - (((l % mod) + mod) % mod) / mod * ih

  const paths = useMemo(() => {
    if (!data) return []
    return BODIES.map((b) => {
      let d = ''
      let prev: number | null = null
      data.lon[b].forEach((l, i) => {
        const v = ((l % mod) + mod) % mod
        const jump = prev !== null && Math.abs(v - prev) > mod / 2
        d += `${!d || jump ? 'M' : 'L'}${x(data.jd[i]).toFixed(1)} ${y(l).toFixed(1)}`
        prev = v
      })
      return { b, d }
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, mod])

  const ticks = useMemo(() => {
    if (!data) return []
    const out: { jd: number; label: string }[] = []
    let last = -1
    data.jd.forEach((jd) => {
      const l = jdToLocal(jd, tz, lon)
      if (l.m !== last) {
        out.push({ jd, label: `${monthsShort()[l.m - 1]}${l.m === 1 ? ' ' + l.y : ''}` })
        last = l.m
      }
    })
    return out.slice(1)
  }, [data, tz, lon])

  const hoverIdx = data && hover !== null ? Math.max(0, Math.min(data.jd.length - 1, Math.round(((hover - PAD.l) / iw) * (data.jd.length - 1)))) : null
  const yTicks = mod === 360 ? [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330] : Array.from({ length: mod / (mod > 45 ? 15 : 5) }, (_, i) => i * (mod > 45 ? 15 : 5))

  return (
    <div className="gephem">
      <div className="cal-controls">
        <select value={months} onChange={(e) => setMonths(+e.target.value)}>
          {[3, 6, 12, 24].map((m) => (
            <option key={m} value={m}>
              {t('{n} ay', { n: m })}
            </option>
          ))}
        </select>
        <div className="seg">
          {[360, 90, 45, 30].map((m) => (
            <button key={m} className={mod === m ? 'on' : ''} onClick={() => setMod(m)} title={t(m === 360 ? 'Tam daire' : m === 90 ? 'Kavuşum, kare, karşıt tek çizgide' : m === 45 ? 'Tüm sert açılar' : 'Burç içi derece')}>
              {m}°
            </button>
          ))}
        </div>
        <span className="muted small">{t('Yatay kesik çizgiler natal noktalar; bir eğrinin onları kestiği yerler tam transitlerdir. Tıklayınca o tarihe gider.')}</span>
      </div>
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="gephem-svg"
        onMouseMove={(e) => {
          const r = (e.currentTarget as SVGSVGElement).getBoundingClientRect()
          setHover(((e.clientX - r.left) / r.width) * W)
        }}
        onMouseLeave={() => setHover(null)}
        onClick={() => hoverIdx !== null && data && onJump(data.jd[hoverIdx])}
      >
        {yTicks.map((v) => (
          <g key={v}>
            <line x1={PAD.l} x2={W - PAD.r} y1={y(v)} y2={y(v)} className="ge-grid" />
            <text x={PAD.l - 6} y={y(v)} className="ge-tick" textAnchor="end" dominantBaseline="central">
              {v}°
            </text>
          </g>
        ))}
        {ticks.map((t) => (
          <g key={t.jd}>
            <line x1={x(t.jd)} x2={x(t.jd)} y1={PAD.t} y2={H - PAD.b} className="ge-grid" />
            <text x={x(t.jd) + 3} y={H - PAD.b + 16} className="ge-tick">
              {t.label}
            </text>
          </g>
        ))}
        {natal.points
          .filter((p) => NATAL_KEYS.includes(p.key))
          .map((p) => (
            <g key={p.key}>
              <line x1={PAD.l} x2={W - PAD.r} y1={y(p.lon)} y2={y(p.lon)} className="ge-natal" />
              <text x={W - PAD.r - 2} y={y(p.lon) - 6} className="ge-nlabel glyph" textAnchor="end">
                {glyph(p.key)}
              </text>
            </g>
          ))}
        {data &&
          BODIES.map((b) => (
            <text key={`l${b}`} x={PAD.l + 4} y={y(data.lon[b][0]) - 6} className={`ge-blabel glyph tone-${acgTone(bodyKey(b))}`}>
              {glyph(bodyKey(b))}
            </text>
          ))}
        {paths.map(({ b, d }) => (
          <path
            key={b}
            d={d}
            className={`ge-line tone-${acgTone(bodyKey(b))} ${focus !== null && focus !== b ? 'dim' : ''}`}
            onMouseEnter={() => setFocus(b)}
            onMouseLeave={() => setFocus(null)}
          />
        ))}
        {hoverIdx !== null && data && (
          <g>
            <line x1={x(data.jd[hoverIdx])} x2={x(data.jd[hoverIdx])} y1={PAD.t} y2={H - PAD.b} className="ge-cursor" />
            {BODIES.map((b) => (
              <text key={b} x={x(data.jd[hoverIdx]) + 4} y={y(data.lon[b][hoverIdx])} className="ge-blabel glyph" dominantBaseline="central">
                {glyph(bodyKey(b))}
              </text>
            ))}
          </g>
        )}
      </svg>
      {hoverIdx !== null && data && (
        <div className="muted small ge-readout">
          {(() => {
            const l = jdToLocal(data.jd[hoverIdx], tz, lon)
            return fmtDate(l)
          })()}{' '}
          ·{' '}
          {BODIES.map((b) => `${POINT[bodyKey(b)].short} ${(data.lon[b][hoverIdx] % 30).toFixed(0)}°`).join('  ')}
        </div>
      )}
    </div>
  )
}
