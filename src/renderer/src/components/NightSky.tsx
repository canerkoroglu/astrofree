// "Bu gece gökyüzünde": what can be seen with the naked eye from the user's place tonight —
// when each planet is up in a dark enough sky and where to look, the Moon, close pairs,
// meteor showers and the next eclipses seen from there. Astronomy first, with the sign
// each body is in as a bridge to the chart.
import ModalClose from './ModalClose'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { NightBody, NightSky as Night, Place, TzSpec } from '@shared/types'
import { SIGNS, splitDeg } from '../lib/astro'
import { monthsLong, t, weekdays } from '../lib/i18n'
import { jdToLocal, localToJd, nowJd } from '../lib/time'
import { bodyName } from '../lib/timing'

// i18n-ignore-start (labels go through t() where shown)
const COMPASS = ['kuzey', 'kuzeydoğu', 'doğu', 'güneydoğu', 'güney', 'güneybatı', 'batı', 'kuzeybatı']
// Peak dates of the main yearly meteor showers (month, day) and their hourly rate in a dark sky.
const SHOWERS: { name: string; m: number; d: number; rate: number }[] = [
  { name: 'Kuadrantidler', m: 1, d: 3, rate: 110 },
  { name: 'Liridler', m: 4, d: 22, rate: 18 },
  { name: 'Eta Akuaridler', m: 5, d: 6, rate: 50 },
  { name: 'Delta Akuaridler', m: 7, d: 30, rate: 25 },
  { name: 'Perseidler', m: 8, d: 12, rate: 100 },
  { name: 'Drakonidler', m: 10, d: 8, rate: 10 },
  { name: 'Orionidler', m: 10, d: 21, rate: 20 },
  { name: 'Leonidler', m: 11, d: 17, rate: 15 },
  { name: 'Geminidler', m: 12, d: 14, rate: 150 },
  { name: 'Ursidler', m: 12, d: 22, rate: 10 }
]
const ECLIPSE_KIND: Record<string, string> = { total: 'tam', annular: 'halkalı', partial: 'parçalı', penumbral: 'yarıgölge' }
// i18n-ignore-end
// Naked-eye colours of the bodies on the sky map.
const BODY_COLOR: Record<number, string> = { 1: '#f2f0e6', 2: '#c9c3b6', 3: '#fff6d8', 4: '#ff8d5c', 5: '#ffe2b0', 6: '#f3d27a' }
// A fixed scatter of faint background stars (deterministic, so it does not flicker).
const STARS = Array.from({ length: 140 }, (_, i) => {
  const a = (i * 137.508 * Math.PI) / 180
  const r = 100 * Math.sqrt(((i * 7919) % 997) / 997)
  return { x: Math.cos(a) * r, y: Math.sin(a) * r, s: 0.25 + ((i * 31) % 10) / 22, o: 0.25 + ((i * 17) % 10) / 16 }
})

const hm = (l: { h: number; mi: number }) => `${String(l.h).padStart(2, '0')}:${String(l.mi).padStart(2, '0')}`

export default function NightSky({ place, tz, sidMode, onClose }: { place: Place; tz: TzSpec; sidMode: number | null; onClose: () => void }) {
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<{ offset: number; n: Night } | null>(null)
  const [error, setError] = useState('')
  const [ti, setTi] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [hover, setHover] = useState<number | null>(null)
  const local = (jd: number) => jdToLocal(jd, tz, place.lon)
  const time = (jd: number | null) => (jd ? hm(local(jd)) : '—')

  // Noon of the chosen day; for today, now (so a night already under way is the one shown).
  const today = local(nowJd())
  const at = offset === 0 ? nowJd() : localToJd({ y: today.y, m: today.m, d: today.d + offset, h: 12, mi: 0, s: 0 }, tz, place.lon)

  useEffect(() => {
    let alive = true
    setError('')
    setPlaying(false)
    window.astro.tools
      .night(at, place.lat, place.lon, sidMode)
      .then((n) => alive && setData({ offset, n }))
      .catch((e) => alive && setError(String(e)))
    return () => {
      alive = false
    }
  }, [offset, place.lat, place.lon, sidMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const n = data?.offset === offset ? data.n : null

  // Start the map at "now" when the night is under way, otherwise when the sky is fully dark.
  useEffect(() => {
    if (!n) return
    const start = offset === 0 && nowJd() > n.times[0] ? nowJd() : n.dark ?? n.times[0]
    const i = n.times.findIndex((x) => x >= start)
    setTi(i < 0 ? 0 : i)
  }, [n]) // eslint-disable-line react-hooks/exhaustive-deps

  // Play: the night runs by in about twelve seconds.
  const reduce = useRef(typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches)
  useEffect(() => {
    if (!playing || !n) return
    const id = window.setInterval(() => {
      setTi((i) => {
        if (i >= n.times.length - 1) {
          setPlaying(false)
          return i
        }
        return i + 1
      })
    }, reduce.current ? 400 : 140)
    return () => window.clearInterval(id)
  }, [playing, n])

  const dateLabel = (jd: number) => {
    const l = local(jd)
    return `${l.d} ${monthsLong()[l.m - 1]} ${l.y}, ${weekdays()[new Date(Date.UTC(l.y, l.m - 1, l.d)).getUTCDay()]}`
  }
  const dirOf = (az: number) => t(COMPASS[Math.round(az / 45) % 8])
  const heightOf = (alt: number) => (alt < 20 ? t('ufka yakın') : alt < 45 ? t('orta yükseklikte') : alt < 70 ? t('yüksekte') : t('neredeyse tepede'))
  const bright = (mag: number) => (mag < -2 ? t('çok parlak') : mag < 0.5 ? t('parlak') : mag < 2 ? t('kolayca görülür') : t('soluk'))
  const sign = (lon: number) => SIGNS[splitDeg(lon).sign].name

  // Showers peaking within three days before and 40 days after tonight.
  const showers = (() => {
    const base = n?.sunset ?? at
    const list: { name: string; jd: number; rate: number }[] = []
    for (const s of SHOWERS)
      for (const y of [today.y, today.y + 1]) {
        const jd = localToJd({ y, m: s.m, d: s.d, h: 22, mi: 0, s: 0 }, tz, place.lon)
        if (jd > base - 3 && jd < base + 40) list.push({ name: s.name, jd, rate: s.rate })
      }
    return list.sort((a, b) => a.jd - b.jd)
  })()

  const seen = n ? n.bodies.filter((b) => b.from !== null) : []
  const unseen = n ? n.bodies.filter((b) => b.from === null) : []
  const tNow = n ? n.times[Math.min(ti, n.times.length - 1)] : 0
  const sunNow = n ? n.sunAlt[Math.min(ti, n.sunAlt.length - 1)] : -20

  // Sky colour follows the Sun: dusk blue to full night.
  const skyTop = sunNow > -6 ? '#2a4a7a' : sunNow > -12 ? '#1a2d55' : sunNow > -18 ? '#111d3d' : '#0a1128'
  const skyEdge = sunNow > -6 ? '#5a6f98' : sunNow > -12 ? '#2c3d66' : sunNow > -18 ? '#1a2649' : '#121b38'
  const starOpacity = sunNow > -6 ? 0 : sunNow > -12 ? 0.35 : sunNow > -18 ? 0.7 : 1

  // Bodies above the horizon at the chosen moment, with label positions that do not overlap.
  const placed = useMemo(() => {
    if (!n) return []
    const pts = n.bodies
      .map((b) => ({ b, p: b.track[ti] }))
      .filter((x): x is { b: NightBody; p: { alt: number; az: number } } => !!x.p && x.p.alt > 0)
      .map(({ b, p }) => {
        const r = 100 * (1 - p.alt / 90)
        const a = (p.az * Math.PI) / 180
        // Looking up: north at the top, east on the left (as on star charts).
        const x = -Math.sin(a) * r
        const y = -Math.cos(a) * r
        return { b, p, x, y, ly: y + 3 }
      })
      .sort((p, q) => p.y - q.y)
    for (let i = 1; i < pts.length; i++)
      for (let j = 0; j < i; j++) if (Math.abs(pts[i].x - pts[j].x) < 46 && pts[i].ly - pts[j].ly < 11) pts[i].ly = pts[j].ly + 11
    return pts
  }, [n, ti])
  const upNow = new Set(placed.map((x) => x.b.body))

  const dome = (
    <svg viewBox="-112 -112 224 224" className="night-dome" role="img" aria-label={t('Gökyüzü haritası')}>
      <defs>
        <radialGradient id="ns-sky" cx="0" cy="0" r="100" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor={skyTop} />
          <stop offset="100%" stopColor={skyEdge} />
        </radialGradient>
        <filter id="ns-glow" x="-1" y="-1" width="3" height="3">
          <feGaussianBlur stdDeviation="2.2" />
        </filter>
        <clipPath id="ns-clip">
          <circle r="100" />
        </clipPath>
      </defs>
      <circle r="100" fill="url(#ns-sky)" className="dome-sky" />
      <g clipPath="url(#ns-clip)" style={{ opacity: starOpacity }} className="dome-stars">
        {STARS.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r={s.s} fill="#fff" opacity={s.o} />
        ))}
      </g>
      {[30, 60].map((alt) => (
        <g key={alt}>
          <circle r={100 * (1 - alt / 90)} className="dome-ring" />
          <text x={2} y={-100 * (1 - alt / 90) - 2} className="dome-alt">
            {alt}°
          </text>
        </g>
      ))}
      <line x1={-100} y1={0} x2={100} y2={0} className="dome-axis" />
      <line x1={0} y1={-100} x2={0} y2={100} className="dome-axis" />
      <circle r="100" className="dome-horizon" />
      {(['K', 'D', 'G', 'B'] as const).map((k, i) => {
        const a = (i * 90 * Math.PI) / 180
        return (
          <text key={k} x={-Math.sin(a) * 106} y={-Math.cos(a) * 106 + 3.5} className="dome-label" textAnchor="middle">
            {t(k)}
          </text>
        )
      })}
      {/* Each body's path tonight, faint */}
      {n?.bodies.map((b) => {
        const d = b.track
          .map((p, i) => (p && p.alt > 0 ? { p, i } : null))
          .filter(Boolean)
          .map((q, k) => {
            const r = 100 * (1 - q!.p.alt / 90)
            const a = (q!.p.az * Math.PI) / 180
            return `${k ? 'L' : 'M'}${(-Math.sin(a) * r).toFixed(1)},${(-Math.cos(a) * r).toFixed(1)}`
          })
          .join(' ')
        return d ? <path key={b.body} d={d} className={`dome-path${hover === b.body ? ' hl' : ''}`} style={{ stroke: BODY_COLOR[b.body] }} /> : null
      })}
      {placed.map(({ b, x, y }) => {
        const r = b.body === 1 ? 6.5 : Math.max(2.4, 4.6 - b.magnitude * 0.9)
        return (
          <g key={b.body} className={`dome-body-g${hover === b.body ? ' hl' : ''}`}>
            <circle cx={x} cy={y} r={r * 2.2} fill={BODY_COLOR[b.body]} opacity={0.35} filter="url(#ns-glow)" />
            <circle cx={x} cy={y} r={r} fill={BODY_COLOR[b.body]} />
            {b.body === 1 && n && (
              // Moon phase: the unlit part as a dark ellipse (waxing lit on the west side).
              <ellipse
                cx={x + (n.moonWaxing ? -1 : 1) * r * n.moonLit * 1.0}
                cy={y}
                rx={r * Math.max(0.05, 1 - n.moonLit)}
                ry={r}
                fill="#0a1128"
                opacity={n.moonLit > 0.97 ? 0 : 0.85}
              />
            )}
          </g>
        )
      })}
      {placed.map(({ b, x, y, ly }) => {
        const left = x > 40
        const tx = left ? x - 9 : x + 9
        return (
          <g key={b.body}>
            {Math.abs(ly - 3 - y) > 4 && <line x1={x} y1={y} x2={tx} y2={ly - 3} className="dome-leader" />}
            <text x={tx} y={ly} className="dome-name" textAnchor={left ? 'end' : 'start'}>
              {bodyName(b.body)}
            </text>
          </g>
        )
      })}
    </svg>
  )

  const pct = n && n.times.length > 1 ? (ti / (n.times.length - 1)) * 100 : 0
  const markAt = (jd: number | null) => (n && jd && n.times.length > 1 ? ((jd - n.times[0]) / (n.times[n.times.length - 1] - n.times[0])) * 100 : null)

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal wide night-modal" role="dialog" aria-label={t('Bu gece gökyüzünde')}>
        <ModalClose onClose={onClose} />
        <header className="night-head">
          <div className="night-title">
            <h2>{t('Bu gece gökyüzünde')}</h2>
            <p className="muted small">
              {place.name.split(',')[0]} · {t('çıplak gözle görülebilecekler')}
            </p>
          </div>
          {n && (
            <div className="night-times">
              <span>
                <span className="muted">{t('Gün batımı')}</span> <strong>{time(n.sunset)}</strong>
              </span>
              <span>
                <span className="muted">{t('Tam karanlık')}</span> <strong>{n.dark ? time(n.dark) : '—'}</strong>
              </span>
              <span>
                <span className="muted">{t('Gün doğumu')}</span> <strong>{time(n.sunrise)}</strong>
              </span>
            </div>
          )}
          <div className="night-nav">
            <button className="ghost-icon" onClick={() => setOffset(offset - 1)} disabled={offset <= 0} aria-label={t('Önceki gece')}>
              ‹
            </button>
            <strong>{offset === 0 ? t('Bu gece') : dateLabel(at)}</strong>
            <button className="ghost-icon" onClick={() => setOffset(offset + 1)} disabled={offset >= 60} aria-label={t('Sonraki gece')}>
              ›
            </button>
          </div>
        </header>

        {error && <p className="error small">{error}</p>}
        {!n && !error && <p className="muted">{t('Hesaplanıyor…')}</p>}

        {n && (
          <div className="night-grid">
            <section className="night-map">
              {dome}
              <div className="night-scrub">
                <button className="night-play" onClick={() => (ti >= n.times.length - 1 && setTi(0), setPlaying(!playing))} aria-label={playing ? t('Durdur') : t('Oynat')}>
                  {playing ? '❚❚' : '▶'}
                </button>
                <div className="night-track">
                  <div className="night-track-bar">
                    {[n.dark, n.dawn].map((jd, i) => {
                      const m = markAt(jd)
                      return m !== null ? <span key={i} className="night-tick" style={{ left: `${m}%` }} /> : null
                    })}
                    <span className="night-fill" style={{ width: `${pct}%` }} />
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={n.times.length - 1}
                    value={ti}
                    onChange={(e) => (setPlaying(false), setTi(+e.target.value))}
                    aria-label={t('Saat')}
                  />
                </div>
                <strong className="night-clock">{time(tNow)}</strong>
              </div>
              <p className="muted small night-cap">{t('Kaydırıcıyla gece boyunca gökyüzünü izleyin; kuzey üstte, doğu solda.')}</p>
            </section>

            <section className="night-list">
              <ul>
                {seen.map((b) => (
                  <li
                    key={b.body}
                    className={`night-card${upNow.has(b.body) ? ' up' : ''}${hover === b.body ? ' hl' : ''}`}
                    onMouseEnter={() => setHover(b.body)}
                    onMouseLeave={() => setHover(null)}
                  >
                    <span className="night-dot" style={{ background: BODY_COLOR[b.body] }} aria-hidden />
                    <div className="night-card-main">
                      <div className="night-card-head">
                        <strong>{bodyName(b.body)}</strong>
                        <span className="pill">{sign(b.lon)}</span>
                        <span className="grow" />
                        <span className="muted small">{b.body === 1 ? t('Ay’ın %{p} kadarı aydınlık', { p: Math.round(n.moonLit * 100) }) : bright(b.magnitude)}</span>
                      </div>
                      <div className="small night-card-line">
                        <span className="night-when">
                          {time(b.from)}–{time(b.to)}
                        </span>
                        <span className="muted">
                          {t('En iyi')} {time(b.best)} · {dirOf(b.azimuth)}, {heightOf(b.altitude)}
                        </span>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
              {unseen.length > 0 && (
                <p className="muted small">
                  {t('Bu gece görülmüyor (Güneş’e çok yakın ya da gündüz gökyüzünde)')}: {unseen.map((b) => bodyName(b.body)).join(', ')}
                </p>
              )}
            </section>

            <aside className="night-side">
              {n.pairs.length > 0 && (
                <section className="night-sec">
                  <h3>{t('Yakın görünenler')}</h3>
                  <ul className="small">
                    {n.pairs.map((p) => (
                      <li key={`${p.a}-${p.b}`}>
                        {t('{a} ve {b} gökyüzünde birbirine çok yakın görünüyor ({sep}°, {time} civarı).', {
                          a: bodyName(p.a),
                          b: bodyName(p.b),
                          sep: p.sep.toLocaleString(document.documentElement.lang || undefined),
                          time: time(p.jd)
                        })}
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {(showers.length > 0 || n.eclipses.length > 0) && (
                <section className="night-sec">
                  <h3>{t('Yaklaşan gökyüzü olayları')}</h3>
                  <ul className="small night-events">
                    {showers.map((s) => (
                      <li key={s.name + s.jd}>
                        <span className="night-ev-ico" aria-hidden>☄</span>
                        <span>
                          <strong>{t('{name} meteor yağmuru', { name: t(s.name) })}</strong>
                          {s.jd < (n.sunset ?? at) && <span className="muted"> ({t('zirvesi geçti')})</span>}
                          <br />
                          <span className="muted">
                            {dateLabel(s.jd)} · {t('karanlık bir yerde saatte {n} meteora kadar', { n: s.rate })}
                          </span>
                        </span>
                      </li>
                    ))}
                    {n.eclipses.map((e) => (
                      <li key={e.jd}>
                        <span className="night-ev-ico" aria-hidden>{e.solar ? '☉' : '☾'}</span>
                        <span>
                          <strong>
                            {e.solar ? t('Güneş tutulması') : t('Ay tutulması')} ({t(ECLIPSE_KIND[e.kind])})
                          </strong>
                          <br />
                          <span className="muted">
                            {dateLabel(e.jd)} {time(e.jd)} · {t('buradan görülebilir')}
                          </span>
                          {e.solar && <span className="night-warn"> {t('Güneş’e asla korumasız gözle bakmayın.')}</span>}
                        </span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
              {n.moonLit > 0.6 && seen.some((b) => b.body === 1) && <p className="small muted">{t('Ay parlak olduğu için soluk yıldızlar ve meteorlar daha zor görülebilir.')}</p>}
              <p className="muted small">{t('Saatler yaklaşıktır; dağlar, binalar ve hava durumu görüşü etkileyebilir.')}</p>
            </aside>
          </div>
        )}
      </div>
    </div>
  )
}
