// "Bugün": what the sky is doing today and which transits touch the open
// chart now and over the next 30 days. Texts are phrased as possibilities.
import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, AspectKey, ChartRecord, EphemResult, TransitHit, TzSpec } from '@shared/types'
import { t } from '../lib/i18n'
import { ASPECT, glyph, houseOf, moonPhase, POINT, SIGNS, splitDeg, type Layer } from '../lib/astro'
import { bodyKey } from '../lib/sky'
import { fmtDate, jdToLocal, nowJd } from '../lib/time'
import { M } from '../lib/meanings'

const NATAL_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']
const MAJORS: AspectKey[] = ['conjunction', 'opposition', 'square', 'trine', 'sextile']
// Today: everything but the Moon with a tight orb; the Moon gets a wider one (it moves ~13° a day).
const TODAY_BODIES = [0, 2, 3, 4, 5, 6, 7, 8, 9]
const SLOW_BODIES = [4, 5, 6, 7, 8, 9]
const SKY_BODIES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
/** Importance of a transiting body: slower planets first. */
const WEIGHT: Record<number, number> = { 9: 9, 8: 8, 7: 7, 6: 6, 5: 5, 4: 4, 0: 3, 3: 2, 2: 2, 1: 1 }

export default function TodayView({
  natal,
  rec,
  settings,
  tz,
  isNow,
  onAsk,
  onJump
}: {
  natal: Layer | null
  rec: ChartRecord
  settings: AppSettings
  tz: TzSpec
  /** The open chart is the "now" sky chart, not a person. */
  isNow: boolean
  onAsk?: (prompt: string) => void
  onJump: (jd: number) => void
}) {
  const [now] = useState(nowJd)
  const [sky, setSky] = useState<EphemResult | null>(null)
  const [today, setToday] = useState<TransitHit[] | null>(null)
  const [moonHits, setMoonHits] = useState<TransitHit[]>([])
  const [coming, setComing] = useState<TransitHit[] | null>(null)
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  const person = !isNow && natal
  const natalPts = useMemo(
    () => (natal ? natal.points.filter((p) => NATAL_KEYS.includes(p.key) && !(rec.timeUnknown && ['asc', 'mc'].includes(p.key))) : []),
    [natal, rec.timeUnknown]
  )
  const natalKey = natalPts.map((p) => p.lon.toFixed(3)).join(',')

  useEffect(() => {
    void window.astro
      .compute([{ jdUT: now, lat: settings.defaultPlace.lat, lon: settings.defaultPlace.lon, houseSystem: settings.houseSystem, sidMode: sid, bodies: SKY_BODIES }])
      .then(([r]) => setSky(r.error ? null : r))
  }, [now, sid, settings.defaultPlace.lat, settings.defaultPlace.lon, settings.houseSystem])

  useEffect(() => {
    if (!person) return
    const natalReq = natalPts.map((p) => ({ key: p.key, lon: p.lon }))
    const day = Math.floor(now + 0.5) - 0.5
    const asp = (orb: number) => MAJORS.map((k) => ({ key: k, angle: ASPECT[k].angle, orb }))
    let alive = true
    void Promise.all([
      window.astro.tools.transits({ start: day, end: day + 1, bodies: TODAY_BODIES, natal: natalReq, aspects: asp(1), sidMode: sid }),
      window.astro.tools.transits({ start: day, end: day + 1, bodies: [1], natal: natalReq, aspects: asp(3), sidMode: sid }),
      window.astro.tools.transits({ start: day + 1, end: day + 31, bodies: SLOW_BODIES, natal: natalReq, aspects: asp(1), sidMode: sid })
    ]).then(([a, b, c]) => {
      if (!alive) return
      setToday(a.sort((x, y) => (WEIGHT[y.body] ?? 0) - (WEIGHT[x.body] ?? 0)))
      setMoonHits(b)
      setComing(c.filter((h) => h.exacts.some((e) => e.jd > day + 1)).sort((x, y) => firstExact(x) - firstExact(y)))
    })
    return () => {
      alive = false
    }
  }, [person ? natalKey : '', now, sid])

  const m = M()
  const date = (jd: number) => fmtDate(jdToLocal(jd, tz, settings.defaultPlace.lon))
  const sun = sky?.bodies.find((b) => b.id === 0)
  const moon = sky?.bodies.find((b) => b.id === 1)
  const retros = sky?.bodies.filter((b) => b.speed < 0 && b.id > 1) ?? []

  const hitTitle = (h: TransitHit) => (
    <>
      <span className="glyph">{glyph(bodyKey(h.body))}</span> {POINT[bodyKey(h.body)].name} <span className="glyph">{ASPECT[h.aspect].glyph}</span>{' '}
      {ASPECT[h.aspect].name} <span className="glyph">{glyph(h.natalKey)}</span> {t('natal {p}', { p: POINT[h.natalKey].name })}
    </>
  )
  const hitText = (h: TransitHit) => {
    const tp = m.planets[bodyKey(h.body)]
    const np = m.planets[h.natalKey]
    const lon = sky?.bodies.find((b) => b.id === h.body)?.lon
    const house = natal && lon !== undefined && !rec.timeUnknown ? houseOf(lon, natal.cusps) : 0
    return (
      <>
        <p>{m.aspects[h.aspect]}</p>
        <p className="muted small">
          {tp && np ? `${POINT[bodyKey(h.body)].name}: ${tp.keywords} · ${POINT[h.natalKey].name}: ${np.keywords}` : ''}
          {house ? ` · ${t('Natal {n}. ev: {k}', { n: house, k: m.houses[house - 1].keywords })}` : ''}
        </p>
      </>
    )
  }

  const askPrompt = () =>
    t('Bugünün ({date}) gökyüzünü ve bu haritaya yaptığı transitleri yorumla. Bugün ve önümüzdeki günler için hangi temalar öne çıkabilir?', { date: date(now) })

  return (
    <div className="natal-info reading today">
      <section className="ni-summary">
        <div className="reading-head">
          <div>
            <h2>
              {t('Bugün')} · {date(now)}
            </h2>
            <div className="muted">{person ? rec.name || t('İsimsiz') : t('Gökyüzü')}</div>
          </div>
          <div className="reading-actions">
            {onAsk && person && (
              <button className="primary" onClick={() => onAsk(askPrompt())}>
                {t('Günün yorumunu yapay zekâya sor')}
              </button>
            )}
          </div>
        </div>
        <div className="reading-disclaimer" role="note">
          {m.disclaimer}
        </div>
      </section>

      {sun && moon && (
        <section className="ni-cards">
          <div className="ni-card">
            <div className="muted small">{t('Ay')}</div>
            <div className="ni-big">
              <span className="glyph">{glyph('moon')}</span> {SIGNS[splitDeg(moon.lon).sign].name}
            </div>
            <div className="muted small">{moonPhase(sun.lon, moon.lon).name}</div>
          </div>
          <div className="ni-card">
            <div className="muted small">{t('Güneş')}</div>
            <div className="ni-big">
              <span className="glyph">{glyph('sun')}</span> {SIGNS[splitDeg(sun.lon).sign].name}
            </div>
          </div>
          <div className="ni-card">
            <div className="muted small">{t('Retro gezegenler')}</div>
            <div className="ni-big">{retros.length ? retros.map((b) => <span key={b.id} className="glyph" title={POINT[bodyKey(b.id)].name}>{glyph(bodyKey(b.id))} </span>) : '—'}</div>
            <div className="muted small">{retros.map((b) => POINT[bodyKey(b.id)].name).join(', ')}</div>
          </div>
        </section>
      )}

      {!person && <div className="reading-note">{t('Kişisel transitleri görmek için soldaki listeden bir kişi açın.')}</div>}

      {person && (
        <details open>
          <summary>{t('Bugün etkili transitler')}</summary>
          <div className="reading-body">
            {today === null && <p className="muted">{t('Hesaplanıyor…')}</p>}
            {today?.length === 0 && moonHits.length === 0 && <p className="muted">{t('Bugün dar orb’lu bir transit yok; sakin bir gün olabilir.')}</p>}
            {today?.map((h, i) => (
              <div key={i} className="reading-item">
                <h4>{hitTitle(h)}</h4>
                {hitText(h)}
              </div>
            ))}
            {moonHits.length > 0 && (
              <div className="reading-item">
                <h4>{t('Ay’ın bugünkü temasları')}</h4>
                <p className="muted small">{t('Ay hızlı hareket eder; etkisi birkaç saatlik ruh hâli değişimleri olarak hissedilebilir.')}</p>
                <ul className="ni-list">
                  {moonHits.map((h, i) => (
                    <li key={i}>
                      {hitTitle(h)}
                      {m.planets[h.natalKey] ? <span className="muted"> — {m.planets[h.natalKey].keywords}</span> : null}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </details>
      )}

      {person && (
        <details open>
          <summary>{t('Önümüzdeki 30 gün')}</summary>
          <div className="reading-body">
            <p className="muted small">{t('Mars’tan Plüton’a yavaş gezegenlerin tam isabet tarihleri. Tarihe tıklayınca harita o güne gider.')}</p>
            {coming === null && <p className="muted">{t('Hesaplanıyor…')}</p>}
            {coming?.length === 0 && <p className="muted">{t('Önümüzdeki 30 günde yavaş gezegenlerden tam isabet yok.')}</p>}
            {coming?.map((h, i) => (
              <div key={i} className="reading-item">
                <h4>
                  {h.exacts
                    .filter((e) => e.jd > now)
                    .map((e, j) => (
                      <button key={j} className="link today-date" onClick={() => onJump(e.jd)}>
                        {date(e.jd)}
                        {e.retro ? ' ℞' : ''}
                      </button>
                    ))}{' '}
                  · {hitTitle(h)}
                </h4>
                {hitText(h)}
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}

const firstExact = (h: TransitHit) => h.exacts[0]?.jd ?? h.start
