// "Doğum günü raporu": a one-page, plain reading of the year from one birthday to the next,
// from the solar return (the moment the Sun comes back to its birth position) and the year's
// slow transits, retrogrades and eclipses. Built-in texts only, tentative wording, no AI needed.
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AppSettings, ChartRecord, TimingFacts, TransitHit } from '@shared/types'
import { houseOf, SIGNS, splitDeg, type Layer } from '../lib/astro'
import { monthsLong, t } from '../lib/i18n'
import { M } from '../lib/meanings'
import { fmtDate, jdToLocal, julday } from '../lib/time'
import { bodyName, retroPeriods } from '../lib/timing'
import { PractitionerLine } from './PrintReport'

const YEAR_NATAL = ['sun', 'moon', 'venus', 'mars', 'asc', 'mc']
const ASPECTS = [
  { key: 'conjunction' as const, angle: 0, orb: 1 },
  { key: 'opposition' as const, angle: 180, orb: 1 },
  { key: 'square' as const, angle: 90, orb: 1 },
  { key: 'trine' as const, angle: 120, orb: 1 },
  { key: 'sextile' as const, angle: 60, orb: 1 }
]

interface Year {
  jd: number
  sunHouse: number
  moonHouse: number
  ascSign: number
  moonSign: number
  facts: TimingFacts
  hits: TransitHit[]
}

export default function BirthdayReport({
  natal,
  rec,
  settings,
  onAsk,
  onClose
}: {
  natal: Layer
  rec: ChartRecord
  settings: AppSettings
  onAsk?: (prompt: string) => void
  onClose: () => void
}) {
  const m = M()
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  const timeKnown = !rec.timeUnknown
  const sun = natal.points.find((p) => p.key === 'sun')
  const place = settings.returnPlace === 'current' ? settings.defaultPlace : rec.place
  const tz = settings.returnPlace === 'current' ? ({ kind: 'zone', zone: settings.defaultZone } as const) : rec.tz
  const local = (jd: number) => jdToLocal(jd, tz, place.lon)

  // This year's birthday while it is ahead or under two months past; otherwise next year's.
  const [year, setYear] = useState(() => {
    const now = new Date()
    const y = now.getFullYear()
    const daysSince = (now.getTime() - new Date(y, rec.local.m - 1, rec.local.d).getTime()) / 86400000
    return daysSince < 60 ? y : y + 1
  })
  const [data, setData] = useState<{ year: number; y: Year } | null>(null)
  const [error, setError] = useState('')
  const [printing, setPrinting] = useState(false)

  useEffect(() => {
    if (!sun) return
    let alive = true
    setError('')
    void (async () => {
      try {
        const jd = await window.astro.tools.returnTime(0, sun.lon, julday(year, rec.local.m, rec.local.d, 0) - 5, sid)
        if (jd === null) throw new Error(t('Güneş dönüşü bulunamadı'))
        const [chart] = await window.astro.compute([{ jdUT: jd, lat: place.lat, lon: place.lon, houseSystem: settings.houseSystem, sidMode: sid, bodies: [0, 1] }])
        if (chart.error) throw new Error(chart.error)
        const srSun = chart.bodies.find((b) => b.id === 0)!.lon
        const srMoon = chart.bodies.find((b) => b.id === 1)!.lon
        const own = natal.points.filter((p) => YEAR_NATAL.includes(p.key) && (timeKnown || (p.key !== 'asc' && p.key !== 'mc'))).map((p) => ({ key: p.key, lon: p.lon }))
        const [facts, hits] = await Promise.all([
          window.astro.tools.timing(Math.floor(jd + 0.5) - 0.5, 366, sid),
          window.astro.tools.transits({ start: jd, end: jd + 365.25, bodies: [5, 6], natal: own, aspects: ASPECTS, sidMode: sid })
        ])
        if (!alive) return
        setData({
          year,
          y: {
            jd,
            sunHouse: houseOf(srSun, chart.cusps),
            moonHouse: houseOf(srMoon, chart.cusps),
            ascSign: splitDeg(chart.asc).sign,
            moonSign: splitDeg(srMoon).sign,
            facts,
            hits: hits.filter((h) => h.exacts.length).sort((a, b) => a.exacts[0].jd - b.exacts[0].jd)
          }
        })
      } catch (e) {
        if (alive) setError(String((e as Error).message ?? e))
      }
    })()
    return () => {
      alive = false
    }
  }, [year, sun?.lon, sid, place.lat, place.lon, settings.houseSystem]) // eslint-disable-line react-hooks/exhaustive-deps

  const ready = data?.year === year ? data.y : null
  const age = year - rec.local.y
  const month = (jd: number) => {
    const l = local(jd)
    return `${monthsLong()[l.m - 1]} ${l.y}`
  }
  const lc = (s: string) => (document.documentElement.lang === 'de' ? s : s.charAt(0).toLocaleLowerCase() + s.slice(1))

  const transitLine = (h: TransitHit) => {
    const subject = m.planets[h.natalKey]?.subject
    if (!subject) return null
    const good = h.aspect === 'trine' || h.aspect === 'sextile' || (h.aspect === 'conjunction' && h.body === 5)
    const when = [...new Set(h.exacts.map((e) => month(e.jd)))].join(', ')
    const planet = bodyName(h.body)
    if (good) return t('{when}: {subject} için destekleyici bir dönem olabilir ({planet}).', { when, subject: lc(subject), planet })
    // Jupiter's hard aspects tend to excess rather than restriction.
    return h.body === 5
      ? t('{when}: {subject} konusunda fazlaya kaçma eğilimi olabilecek ama büyütücü bir dönem olabilir ({planet}).', { when, subject: lc(subject), planet })
      : t('{when}: {subject} konusunda sabır isteyebilecek ama olgunlaştırıcı bir dönem olabilir ({planet}).', { when, subject: lc(subject), planet })
  }

  const body = ready && (
    <article className="bday">
      {printing && <PractitionerLine settings={settings} />}
      <header className="bday-head">
        <div className="bday-cake" aria-hidden>
          🎂
        </div>
        <div>
          <h2>{t('{name} · {age}. yaş günü', { name: rec.name || t('İsimsiz'), age })}</h2>
          <div className="muted small">
            {t('Güneş dönüşü: {date}', { date: fmtDate(local(ready.jd)) })} · {place.name.split(',')[0]} · {t('bir sonraki doğum gününe kadar')}
          </div>
        </div>
      </header>

      {timeKnown ? (
        <section>
          <h3>{t('Yılın odağı')}</h3>
          <p>
            {m.planets.sun.subject} {m.houses[ready.sunHouse - 1].where}.
          </p>
          <p>
            {m.planets.moon.subject} {m.houses[ready.moonHouse - 1].where}.
          </p>
          <p className="muted">
            {t('Yılın tonu')}: {SIGNS[ready.ascSign].name} — {m.signs[ready.ascSign].keywords}
          </p>
        </section>
      ) : (
        <section>
          <h3>{t('Yılın odağı')}</h3>
          <p className="muted">{t('Doğum saati bilinmediği için yılın ev konuları hesaplanmadı; aşağıdaki dönemler yine de geçerli olabilir.')}</p>
          <p className="muted">
            {t('Bu yılın Ay’ı')}: {SIGNS[ready.moonSign].name} — {m.signs[ready.moonSign].keywords}
          </p>
        </section>
      )}

      <section>
        <h3>{t('Yıl içinde öne çıkabilecek dönemler')}</h3>
        {ready.hits.length ? (
          <ul>
            {ready.hits.slice(0, 7).map((h, i) => {
              const line = transitLine(h)
              return line ? <li key={i}>{line}</li> : null
            })}
          </ul>
        ) : (
          <p className="muted">{t('Bu yıl Jüpiter ve Satürn haritanızın ana noktalarına sıkı bir açı yapmıyor; daha sakin bir yıl olabilir.')}</p>
        )}
      </section>

      <section>
        <h3>{t('Takvimde işaretlenebilecek tarihler')}</h3>
        <ul>
          {retroPeriods(ready.facts, ready.jd, ready.jd + 365.25)
            .filter((p) => p.body === 2)
            .map((p, i) => (
              <li key={`r${i}`}>
                {t('Merkür retrosu')}: {p.from ? fmtDate(local(p.from)) : '…'} – {p.to ? fmtDate(local(p.to)) : '…'}{' '}
                <span className="muted small">{t('(gelenekte iletişim ve yazışmalarda aksaklıklarla ilişkilendirilir)')}</span>
              </li>
            ))}
          {ready.facts.eclipses
            .filter((e) => e.jd >= ready.jd && e.jd < ready.jd + 365.25)
            .map((e, i) => (
              <li key={`e${i}`}>
                {e.solar ? t('Güneş tutulması') : t('Ay tutulması')}: {fmtDate(local(e.jd))}
              </li>
            ))}
        </ul>
      </section>

      <p className="reading-disclaimer small">{m.disclaimer}</p>
      <p className="muted small">AstroFree · astrofree.cklabs.tr</p>
    </article>
  )

  const savePdf = async () => {
    setPrinting(true)
    await new Promise((r) => setTimeout(r, 400))
    try {
      await window.astro.exporter.pdf(`${rec.name || 'astrofree'} - ${t('doğum günü raporu')} ${year}`)
    } finally {
      setPrinting(false)
    }
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal bday-modal" role="dialog" aria-label={t('Doğum günü raporu')}>
        <div className="bday-nav">
          <button onClick={() => setYear(year - 1)} aria-label={t('Önceki yıl')}>
            ◀
          </button>
          <strong>{year}</strong>
          <button onClick={() => setYear(year + 1)} aria-label={t('Sonraki yıl')}>
            ▶
          </button>
        </div>
        {error && <p className="error small">{error}</p>}
        {!ready && !error && <p className="muted">{t('Hesaplanıyor…')}</p>}
        {body}
        <div className="actions">
          <button onClick={onClose}>{t('Kapat')}</button>
          {onAsk && ready && (
            <button
              onClick={() => {
                onClose()
                onAsk(t('{date} doğum günümden sonraki bir yılı Güneş dönüşü haritasına ve yılın transitlerine göre kısa ve sade anlat.', { date: fmtDate(local(ready.jd)) }))
              }}
            >
              {t('Yapay zekâya sor')}
            </button>
          )}
          <button className="primary" disabled={!ready} onClick={() => void savePdf()}>
            {t('PDF olarak kaydet')}
          </button>
        </div>
      </div>
      {printing && body && createPortal(<div className="print-root bday-print">{body}</div>, document.body)}
    </div>
  )
}
