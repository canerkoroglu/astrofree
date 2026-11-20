// "Bu gece gökyüzünde": what can be seen with the naked eye from the user's place tonight —
// when each planet is up in a dark enough sky and where to look, the Moon, close pairs,
// meteor showers and the next eclipses seen from there. Astronomy first, with the sign
// each body is in as a bridge to the chart.
import ModalClose from './ModalClose'
import { useEffect, useState } from 'react'
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

const hm = (l: { h: number; mi: number }) => `${String(l.h).padStart(2, '0')}:${String(l.mi).padStart(2, '0')}`

export default function NightSky({ place, tz, sidMode, onClose }: { place: Place; tz: TzSpec; sidMode: number | null; onClose: () => void }) {
  const [offset, setOffset] = useState(0)
  const [data, setData] = useState<{ offset: number; n: Night } | null>(null)
  const [error, setError] = useState('')
  const local = (jd: number) => jdToLocal(jd, tz, place.lon)
  const time = (jd: number | null) => (jd ? hm(local(jd)) : '—')

  // Noon of the chosen day; for today, now (so a night already under way is the one shown).
  const today = local(nowJd())
  const at = offset === 0 ? nowJd() : localToJd({ y: today.y, m: today.m, d: today.d + offset, h: 12, mi: 0, s: 0 }, tz, place.lon)

  useEffect(() => {
    let alive = true
    setError('')
    window.astro.tools
      .night(at, place.lat, place.lon, sidMode)
      .then((n) => alive && setData({ offset, n }))
      .catch((e) => alive && setError(String(e)))
    return () => {
      alive = false
    }
  }, [offset, place.lat, place.lon, sidMode]) // eslint-disable-line react-hooks/exhaustive-deps

  const n = data?.offset === offset ? data.n : null
  const dateLabel = (jd: number) => {
    const l = local(jd)
    return `${l.d} ${monthsLong()[l.m - 1]} ${l.y}, ${weekdays()[new Date(Date.UTC(l.y, l.m - 1, l.d)).getUTCDay()]}`
  }
  const where = (b: NightBody) => {
    const dir = t(COMPASS[Math.round(b.azimuth / 45) % 8])
    const height = b.altitude < 20 ? t('ufka yakın') : b.altitude < 45 ? t('orta yükseklikte') : b.altitude < 70 ? t('yüksekte') : t('neredeyse tepede')
    return t('{dir} yönünde, {height}', { dir, height })
  }
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

  // A small sky dome: horizon circle, zenith in the middle, each body at its best moment.
  const dome = (
    <svg viewBox="-110 -110 220 220" className="night-dome" role="img" aria-label={t('Gökyüzü haritası')}>
      <circle r="100" className="dome-sky" />
      <circle r="66.7" className="dome-ring" />
      <circle r="33.3" className="dome-ring" />
      {(['K', 'D', 'G', 'B'] as const).map((k, i) => {
        const a = (i * 90 * Math.PI) / 180
        return (
          <text key={k} x={-Math.sin(a) * 92} y={-Math.cos(a) * 92 + 4} className="dome-label" textAnchor="middle">
            {t(['K', 'D', 'G', 'B'][i])}
          </text>
        )
      })}
      {(() => {
        // Each body at its best moment; names that would overlap are pushed apart vertically.
        const pts = seen
          .map((b) => {
            const r = 100 * (1 - b.altitude / 90)
            const a = (b.azimuth * Math.PI) / 180
            // Drawn as seen looking up: north at the top, east on the left (as on star charts).
            return { b, x: -Math.sin(a) * r, y: -Math.cos(a) * r, ly: -Math.cos(a) * r + 3 }
          })
          .sort((p, q) => p.y - q.y)
        for (let i = 1; i < pts.length; i++)
          for (let j = 0; j < i; j++)
            if (Math.abs(pts[i].x - pts[j].x) < 46 && pts[i].ly - pts[j].ly < 11) pts[i].ly = pts[j].ly + 11
        return (
          <>
            {pts.map(({ b, x, y }) => (
              <circle key={b.body} cx={x} cy={y} r={b.body === 1 ? 6 : Math.max(2.5, 5 - b.magnitude)} className={`dome-body b${b.body}`} />
            ))}
            {pts.map(({ b, x, y, ly }) => {
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
          </>
        )
      })()}
    </svg>
  )

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal wide night-modal" role="dialog" aria-label={t('Bu gece gökyüzünde')}>
        <ModalClose onClose={onClose} />
        <div className="gd-head">
          <div>
            <h2>🔭 {t('Bu gece gökyüzünde')}</h2>
            <p className="muted small">
              {place.name.split(',')[0]} · {t('çıplak gözle görülebilecekler')}
            </p>
          </div>
          <div className="bday-nav">
            <button onClick={() => setOffset(offset - 1)} disabled={offset <= 0} aria-label={t('Önceki gece')}>
              ◀
            </button>
            <strong>{offset === 0 ? t('Bu gece') : dateLabel(at)}</strong>
            <button onClick={() => setOffset(offset + 1)} disabled={offset >= 60} aria-label={t('Sonraki gece')}>
              ▶
            </button>
          </div>
        </div>

        {error && <p className="error small">{error}</p>}
        {!n && !error && <p className="muted">{t('Hesaplanıyor…')}</p>}

        {n && (
          <>
            <div className="night-times">
              <div>
                <span aria-hidden>🌇</span>
                <span className="muted small">{t('Gün batımı')}</span>
                <strong>{time(n.sunset)}</strong>
              </div>
              <div>
                <span aria-hidden>🌌</span>
                <span className="muted small">{t('Tam karanlık')}</span>
                <strong>{n.dark ? time(n.dark) : '—'}</strong>
                {!n.dark && <span className="muted small">{t('olmuyor (aydınlık gece)')}</span>}
              </div>
              <div>
                <span aria-hidden>🌅</span>
                <span className="muted small">{t('Gün doğumu')}</span>
                <strong>{time(n.sunrise)}</strong>
              </div>
            </div>
            <div className="night-layout">
              <figure className="night-fig">
                {dome}
                <figcaption className="muted small">{t('Her gökcismi en iyi görüldüğü andaki yerinde gösterilir.')}</figcaption>
              </figure>
              <div className="night-list">
                <ul>
                  {seen.map((b) => (
                    <li key={b.body} className="night-card">
                      <div className="night-card-head">
                        <strong>{bodyName(b.body)}</strong>
                        <span className="pill">{sign(b.lon)}</span>
                        <span className="grow" />
                        <span className="muted small">
                          {b.body === 1 ? t('Ay’ın %{p} kadarı aydınlık', { p: Math.round(n.moonLit * 100) }) : bright(b.magnitude)}
                        </span>
                      </div>
                      <dl className="small">
                        <dt>{t('Görülebilir')}</dt>
                        <dd>
                          {time(b.from)} – {time(b.to)}
                        </dd>
                        <dt>{t('En iyi')}</dt>
                        <dd>
                          {time(b.best)} · {where(b)}
                        </dd>
                      </dl>
                    </li>
                  ))}
                </ul>
                {unseen.length > 0 && (
                  <p className="muted small">
                    {t('Bu gece görülmüyor (Güneş’e çok yakın ya da gündüz gökyüzünde)')}: {unseen.map((b) => bodyName(b.body)).join(', ')}
                  </p>
                )}
              </div>
            </div>

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

            {n.moonLit > 0.6 && seen.some((b) => b.body === 1) && <p className="small muted">{t('Ay parlak olduğu için soluk yıldızlar ve meteorlar daha zor görülebilir.')}</p>}

            {(showers.length > 0 || n.eclipses.length > 0) && (
              <section className="night-sec">
                <h3>{t('Yaklaşan gökyüzü olayları')}</h3>
                <ul className="small">
                  {showers.map((s) => (
                    <li key={s.name + s.jd}>
                      ☄️ {t('{name} meteor yağmuru', { name: t(s.name) })}: {dateLabel(s.jd)}
                      {s.jd < (n.sunset ?? at) && <span className="muted"> ({t('zirvesi geçti')})</span>} · {t('karanlık bir yerde saatte {n} meteora kadar', { n: s.rate })}
                    </li>
                  ))}
                  {n.eclipses.map((e) => (
                    <li key={e.jd}>
                      {e.solar ? '☀️' : '🌘'} {e.solar ? t('Güneş tutulması') : t('Ay tutulması')} ({t(ECLIPSE_KIND[e.kind])}): {dateLabel(e.jd)} {time(e.jd)} · {t('buradan görülebilir')}
                      {e.solar && <strong> · {t('Güneş’e asla korumasız gözle bakmayın.')}</strong>}
                    </li>
                  ))}
                </ul>
              </section>
            )}
            <p className="muted small">{t('Saatler yaklaşıktır; dağlar, binalar ve hava durumu görüşü etkileyebilir.')}</p>
          </>
        )}
      </div>
    </div>
  )
}
