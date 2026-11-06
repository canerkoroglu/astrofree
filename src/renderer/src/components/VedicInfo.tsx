// Vedic section of Natal Bilgiler: nakshatras, navamsa (D9) and Vimshottari dasha (Lahiri).
import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, ChartRecord } from '@shared/types'
import { t, weekdays } from '../lib/i18n'
import { glyph, POINT, SIGNS, signGlyph, splitDeg, type Layer } from '../lib/astro'
import { fmtDate, jdToLocal } from '../lib/time'
import { nakshatraOf, navamsaSign, siderealLahiri, vimshottari } from '../lib/vedic'
import { ashtakoota, panchang, VARA_LORD } from '../lib/vedicExtra'
import VedicChart from './VedicChart'

const KEYS = ['asc', 'sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn', 'node', 'snode']

export default function VedicInfo({
  natal,
  rec,
  settings,
  eventJd,
  partner
}: {
  natal: Layer
  rec: ChartRecord
  settings: AppSettings
  eventJd: number
  /** Synastry partner, for Ashtakoota matching. */
  partner?: { name: string; layer: Layer } | null
}) {
  const [sid, setSid] = useState<{ key: string; lon: number }[] | null>(null)
  const [partnerMoon, setPartnerMoon] = useState<number | null>(null)
  const [swap, setSwap] = useState(false)
  const [style, setStyle] = useState<'north' | 'south'>(() => {
    try {
      return localStorage.getItem('vedic-chart-style') === 'south' ? 'south' : 'north'
    } catch {
      return 'north'
    }
  })
  const pickStyle = (v: 'north' | 'south') => {
    setStyle(v)
    try {
      localStorage.setItem('vedic-chart-style', v)
    } catch {
      /* storage unavailable */
    }
  }
  useEffect(() => {
    if (!partner) return setPartnerMoon(null)
    let alive = true
    void siderealLahiri(partner.layer, settings).then((r) => alive && setPartnerMoon(r.find((p) => p.key === 'moon')?.lon ?? null))
    return () => {
      alive = false
    }
  }, [partner?.layer.jdUT, settings.zodiac, settings.sidMode])
  const [openMd, setOpenMd] = useState<number | null>(null)
  const natalKey = `${natal.jdUT}|${settings.zodiac}|${settings.sidMode}`

  useEffect(() => {
    let alive = true
    void siderealLahiri(natal, settings).then((r) => alive && setSid(r))
    return () => {
      alive = false
    }
    // natalKey covers the inputs that change the result
  }, [natalKey])

  const rows = useMemo(
    () => (sid ? KEYS.map((k) => sid.find((p) => p.key === k)).filter((p): p is { key: string; lon: number } => !!p && !(rec.timeUnknown && p.key === 'asc')) : []),
    [sid, rec.timeUnknown]
  )
  const moon = sid?.find((p) => p.key === 'moon')
  const dashas = useMemo(() => (moon ? vimshottari(moon.lon, natal.jdUT) : []), [moon, natal.jdUT])
  const date = (jd: number) => fmtDate(jdToLocal(jd, rec.tz, rec.place.lon))
  const curMd = dashas.findIndex((d) => eventJd >= d.start && eventJd < d.end)
  const shownMd = openMd ?? curMd
  const name = (k: string) => (k === 'node' ? 'Rahu' : k === 'snode' ? 'Ketu' : POINT[k].name)
  const sign = (lon: number) => (
    <>
      <span className="glyph">{signGlyph(splitDeg(lon).sign)}</span> {SIGNS[splitDeg(lon).sign].name}
    </>
  )

  const sun = sid?.find((p) => p.key === 'sun')
  const pc = sun && moon ? panchang(sun.lon, moon.lon) : null
  const vara = VARA_LORD[new Date(Date.UTC(rec.local.y, rec.local.m - 1, rec.local.d)).getUTCDay()]
  const match = moon && partnerMoon !== null ? (swap ? ashtakoota(partnerMoon, moon.lon) : ashtakoota(moon.lon, partnerMoon)) : null
  const chartPoints = rows.filter((p) => KEYS.includes(p.key))

  if (!sid) return null
  return (
    <details>
      <summary>
        {t('Vedik (Jyotiş)')} <span className="badge">{t('Gelişmiş')}</span>
      </summary>
      <div className="ni-grid vedic-grid">
        <div>
          <div className="vedic-chart-head">
            <h4>{t('Rāśi (D1)')}</h4>
            <div className="seg">
              <button className={style === 'north' ? 'on' : ''} onClick={() => pickStyle('north')} disabled={rec.timeUnknown}>
                {t('Kuzey Hint')}
              </button>
              <button className={style === 'south' ? 'on' : ''} onClick={() => pickStyle('south')}>
                {t('Güney Hint')}
              </button>
            </div>
          </div>
          <VedicChart style={rec.timeUnknown ? 'south' : style} points={chartPoints} />
        </div>
        {pc && (
          <div>
            <h4>{t('Doğum Panchangı')}</h4>
            <table className="data ni">
              <tbody>
                <tr>
                  <td>{t('Tithi')}</td>
                  <td>
                    {pc.paksha === 'shukla' ? 'Shukla' : 'Krishna'} {pc.tithi} <span className="muted small">({pc.tithiNo}/30)</span>
                  </td>
                </tr>
                <tr>
                  <td>{t('Vara (gün)')}</td>
                  <td>
                    {weekdays()[new Date(Date.UTC(rec.local.y, rec.local.m - 1, rec.local.d)).getUTCDay()]} <span className="muted small">({name(vara)})</span>
                  </td>
                </tr>
                <tr>
                  <td>{t('Nakshatra')}</td>
                  <td>
                    {pc.nakshatra} · {t('Pada')} {pc.pada}
                  </td>
                </tr>
                <tr>
                  <td>{t('Yoga')}</td>
                  <td>{pc.yoga}</td>
                </tr>
                <tr>
                  <td>{t('Karana')}</td>
                  <td>{pc.karana}</td>
                </tr>
              </tbody>
            </table>
            <p className="muted small">{t('Gün, yerel takvim tarihine göredir; geleneksel Panchang günü gün doğumunda başlar.')}</p>
          </div>
        )}
      </div>
      {match && partner && (
        <div className="vedic-match">
          <div className="vedic-chart-head">
            <h4>
              {t('Kundli eşleştirme (Ashtakoota)')}: {rec.name || t('İsimsiz')} · {partner.name}
            </h4>
            <button className="link small" onClick={() => setSwap(!swap)} title={t('Gelenekte Varna, Vashya ve Gana puanları damat/gelin sırasına göre hesaplanır.')}>
              {t('Sırayı değiştir')}
            </button>
          </div>
          <table className="data ni">
            <tbody>
              {match.kootas.map((k) => (
                <tr key={k.key}>
                  <td>{k.name}</td>
                  <td className="num">
                    {k.score} / {k.max}
                  </td>
                </tr>
              ))}
              <tr className="vedic-total">
                <td>{t('Toplam')}</td>
                <td className="num">{match.total} / 36</td>
              </tr>
            </tbody>
          </table>
          <p className="muted small">
            {t('Geleneksel Guna Milan puanlamasıdır (18 ve üstü geleneksel olarak uygun sayılır). Bir ilişkinin nasıl yaşanacağını hiçbir puan belirlemez; yalnızca üzerine konuşulabilecek bir çerçeve sunabilir.')}
          </p>
        </div>
      )}
      <p className="muted small ni-note">
        {t('Lahiri ayanamsası ile sidereal konumlar; Rahu = Kuzey Ay Düğümü, Ketu = Güney Ay Düğümü. Dasha dönemleri geleneksel bir zamanlama çerçevesidir, kesin olayları göstermez.')}
      </p>
      <div className="ni-grid vedic-grid">
        <div>
          <h4>{t('Nakshatra ve navamsa (D9)')}</h4>
          <table className="data ni">
            <thead>
              <tr>
                <th></th>
                <th>{t('Rāśi (D1)')}</th>
                <th>{t('Nakshatra')}</th>
                <th className="num">{t('Pada')}</th>
                <th>{t('Navamsa (D9)')}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const n = nakshatraOf(p.lon)
                const d9 = navamsaSign(p.lon)
                const varg = d9 === splitDeg(p.lon).sign
                return (
                  <tr key={p.key}>
                    <td>
                      <span className="glyph">{glyph(p.key)}</span> {name(p.key)}
                    </td>
                    <td>
                      {sign(p.lon)} <span className="muted small">{splitDeg(p.lon).deg}°</span>
                    </td>
                    <td>
                      {n.name} <span className="muted small">({name(n.lord)})</span>
                    </td>
                    <td className="num">{n.pada}</td>
                    <td>
                      <span className="glyph">{signGlyph(d9)}</span> {SIGNS[d9].name}
                      {varg && (
                        <span className="badge" title={t('Gezegen D1 ve D9’da aynı burçta; geleneksel olarak güçlü sayılır.')}>
                          {t('vargottama')}
                        </span>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <div>
          <h4>{t('Vimshottari dasha')}</h4>
          {moon && (
            <p className="muted small">
              {t('Ay nakshatrası {n} ({l}); doğumda {l} dönemi işliyor.', { n: nakshatraOf(moon.lon).name, l: name(nakshatraOf(moon.lon).lord) })}
            </p>
          )}
          <ul className="dasha-list">
            {dashas.map((d, i) => (
              <li key={i} className={i === curMd ? 'current' : ''}>
                <button className="dasha-md" aria-expanded={i === shownMd} onClick={() => setOpenMd(i === shownMd ? -1 : i)}>
                  <span>
                    <span className="glyph">{glyph(d.lord)}</span> {name(d.lord)}
                    {i === curMd && <span className="badge">{t('şu an')}</span>}
                  </span>
                  <span className="muted small num">
                    {date(Math.max(d.start, natal.jdUT))} – {date(d.end)}
                  </span>
                </button>
                {i === shownMd && (
                  <ul className="dasha-subs">
                    {d.subs
                      .filter((s) => s.end > natal.jdUT)
                      .map((s, j) => (
                        <li key={j} className={eventJd >= s.start && eventJd < s.end ? 'current' : ''}>
                          <span>
                            {name(d.lord)} / {name(s.lord)}
                          </span>
                          <span className="muted small num">
                            {date(Math.max(s.start, natal.jdUT))} – {date(s.end)}
                          </span>
                        </li>
                      ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </details>
  )
}
