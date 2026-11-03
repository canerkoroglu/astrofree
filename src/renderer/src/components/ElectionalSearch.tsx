import { t } from '../lib/i18n'
import { useState } from 'react'
import type { AppSettings, ElectionConditions, ElectionWindow, Place, TzSpec } from '@shared/types'
import { glyph, POINT, SIGNS, signGlyph, splitDeg } from '../lib/astro'
import { bodyKey } from '../lib/sky'
import { fmtDate, jdToLocal } from '../lib/time'

const BODIES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const RETRO_BODIES = [2, 3, 4, 5, 6]
const ASPECT_CHOICES: [string, number[]][] = [
  ['Uyumlu (üçgen, sekstil)', [120, 60]],
  ['Kavuşum', [0]],
  ['Zor (kare, karşıt)', [90, 180]]
]
const p2 = (n: number) => String(n).padStart(2, '0')

export default function ElectionalSearch({
  startJd,
  place,
  tz,
  settings,
  onJump,
  onAsk
}: {
  startJd: number
  place: Place
  tz: TzSpec
  settings: AppSettings
  onJump: (jd: number) => void
  onAsk: (prompt: string) => void
}) {
  const [days, setDays] = useState(30)
  const [cond, setCond] = useState<ElectionConditions>({
    moonSigns: [],
    moonNotVoc: true,
    moonWaxing: false,
    notRetro: [2],
    aspect: null,
    angular: null
  })
  const [aspectOn, setAspectOn] = useState(false)
  const [asp, setAsp] = useState({ a: 3, b: 5, kind: 0, orb: 3 })
  const [angOn, setAngOn] = useState(false)
  const [ang, setAng] = useState({ body: 5, orb: 8 })
  const [busy, setBusy] = useState(false)
  const [res, setRes] = useState<ElectionWindow[] | null>(null)

  const fmt = (jd: number) => {
    const l = jdToLocal(jd, tz, place.lon)
    return `${fmtDate(l)} ${p2(l.h)}:${p2(l.mi)}`
  }
  const dur = (w: ElectionWindow) => {
    const h = (w.end - w.start) * 24
    return h >= 24 ? t('{n} gün', { n: (h / 24).toFixed(1) }) : t('{n} saat', { n: Math.max(0.25, h).toFixed(h < 2 ? 1 : 0) })
  }

  const run = async () => {
    setBusy(true)
    const start = Math.floor(startJd * 96) / 96
    const full: ElectionConditions = {
      ...cond,
      aspect: aspectOn ? { a: asp.a, b: asp.b, aspects: ASPECT_CHOICES[asp.kind][1], orb: asp.orb } : null,
      angular: angOn ? ang : null
    }
    try {
      setRes(
        await window.astro.tools.election({
          start,
          end: start + days,
          stepMinutes: 15,
          lat: place.lat,
          lon: place.lon,
          sidMode: settings.zodiac === 'sidereal' ? settings.sidMode : null,
          cond: full
        })
      )
    } finally {
      setBusy(false)
    }
  }

  const describe = () =>
    [
      cond.moonSigns.length ? t('Ay {signs} burcunda', { signs: cond.moonSigns.map((s) => SIGNS[s].name).join('/') }) : '',
      cond.moonNotVoc ? t('Ay boşlukta değil') : '',
      cond.moonWaxing ? t('Ay büyüyor') : '',
      cond.notRetro.length ? t('{list} retro değil', { list: cond.notRetro.map((b) => POINT[bodyKey(b)].name).join(', ') }) : '',
      aspectOn ? `${POINT[bodyKey(asp.a)].name}–${POINT[bodyKey(asp.b)].name} ${t(ASPECT_CHOICES[asp.kind][0])} (±${asp.orb}°)` : '',
      angOn ? t('{p} köşede (±{orb}°, {place})', { p: POINT[bodyKey(ang.body)].name, orb: ang.orb, place: place.name.split(',')[0] }) : ''
    ]
      .filter(Boolean)
      .join('; ')

  const toggle = (arr: number[], v: number) => (arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v])

  return (
    <div className="election">
      <div className="el-grid">
        <section>
          <h3>{t('Ay')}</h3>
          <div className="el-signs">
            {SIGNS.map((s, i) => (
              <button key={i} className={cond.moonSigns.includes(i) ? 'chip-on' : ''} onClick={() => setCond({ ...cond, moonSigns: toggle(cond.moonSigns, i) })} title={s.name}>
                <span className="glyph">{signGlyph(i)}</span>
              </button>
            ))}
          </div>
          <div className="muted small">{cond.moonSigns.length ? cond.moonSigns.map((i) => SIGNS[i].name).join(', ') : t('Herhangi bir burç')}</div>
          <label className="inline">
            <input type="checkbox" checked={cond.moonNotVoc} onChange={(e) => setCond({ ...cond, moonNotVoc: e.target.checked })} /> {t('Boşlukta olmasın')}
          </label>
          <label className="inline">
            <input type="checkbox" checked={cond.moonWaxing} onChange={(e) => setCond({ ...cond, moonWaxing: e.target.checked })} /> {t('Büyüyen Ay (yeni aydan dolunaya)')}
          </label>
        </section>
        <section>
          <h3>{t('Retro olmasın')}</h3>
          <div className="el-signs">
            {RETRO_BODIES.map((b) => (
              <button key={b} className={cond.notRetro.includes(b) ? 'chip-on' : ''} onClick={() => setCond({ ...cond, notRetro: toggle(cond.notRetro, b) })} title={POINT[bodyKey(b)].name}>
                <span className="glyph">{glyph(bodyKey(b))}</span>
              </button>
            ))}
          </div>
          <h3>{t('Gezegen açısı')}</h3>
          <label className="inline">
            <input type="checkbox" checked={aspectOn} onChange={(e) => setAspectOn(e.target.checked)} /> {t('Şu açı olsun:')}
          </label>
          <div className="row" style={{ opacity: aspectOn ? 1 : 0.5 }}>
            <select value={asp.a} onChange={(e) => setAsp({ ...asp, a: +e.target.value })}>
              {BODIES.map((b) => (
                <option key={b} value={b}>
                  {POINT[bodyKey(b)].name}
                </option>
              ))}
            </select>
            <select value={asp.kind} onChange={(e) => setAsp({ ...asp, kind: +e.target.value })}>
              {ASPECT_CHOICES.map(([n], i) => (
                <option key={i} value={i}>
                  {t(n)}
                </option>
              ))}
            </select>
            <select value={asp.b} onChange={(e) => setAsp({ ...asp, b: +e.target.value })}>
              {BODIES.map((b) => (
                <option key={b} value={b}>
                  {POINT[bodyKey(b)].name}
                </option>
              ))}
            </select>
            <input type="number" min={0.5} max={10} step={0.5} value={asp.orb} onChange={(e) => setAsp({ ...asp, orb: +e.target.value })} title={t('Orb (°)')} style={{ width: 64 }} />
          </div>
        </section>
        <section>
          <h3>{t('Köşede gezegen')}</h3>
          <label className="inline">
            <input type="checkbox" checked={angOn} onChange={(e) => setAngOn(e.target.checked)} /> {t('ASC/DSC/MC/IC yakınında:')}
          </label>
          <div className="row" style={{ opacity: angOn ? 1 : 0.5 }}>
            <select value={ang.body} onChange={(e) => setAng({ ...ang, body: +e.target.value })}>
              {BODIES.map((b) => (
                <option key={b} value={b}>
                  {POINT[bodyKey(b)].name}
                </option>
              ))}
            </select>
            <input type="number" min={1} max={15} value={ang.orb} onChange={(e) => setAng({ ...ang, orb: +e.target.value })} title={t('Orb (°)')} style={{ width: 64 }} />
          </div>
          <div className="muted small">{t('Konum')}: {place.name}</div>
          <h3>{t('Aralık')}</h3>
          <div className="row">
            <select value={days} onChange={(e) => setDays(+e.target.value)}>
              {[7, 14, 30, 60, 90, 180, 365].map((d) => (
                <option key={d} value={d}>
                  {t('{n} gün', { n: d })}
                </option>
              ))}
            </select>
            <span className="muted small">{t('{date} tarihinden itibaren', { date: fmt(startJd) })}</span>
          </div>
          <button className="primary" onClick={() => void run()} disabled={busy}>
            {busy ? t('Aranıyor…') : t('Zamanları bul')}
          </button>
        </section>
      </div>

      {res && (
        <section className="el-results">
          <div className="el-res-head">
            <h3>
              {t('{n} uygun aralık', { n: res.length })} <span className="muted small">— {describe() || t('koşul yok')}</span>
            </h3>
            <span className="grow" />
            {res.length > 0 && (
              <button
                onClick={() =>
                  onAsk(
                    t('Elektif astroloji: şu koşullara uyan zaman aralıkları buldum ({cond}). İlk aralıklar: {list}. Hangisi daha uygun ve neden? Benim haritama göre de değerlendir.', {
                      cond: describe(),
                      list: res
                        .slice(0, 8)
                        .map((w) => `${fmt(w.start)}–${fmt(w.end)}`)
                        .join('; ')
                    })
                  )
                }
              >
                {t('AI ile değerlendir')}
              </button>
            )}
          </div>
          {res.length === 0 && <p className="muted">{t('Bu aralıkta tüm koşulları sağlayan zaman yok. Koşulları gevşetin veya aralığı uzatın.')}</p>}
          <table className="data">
            <tbody>
              {res.slice(0, 150).map((w, i) => {
                const sd = splitDeg(w.moonLon)
                return (
                  <tr key={i}>
                    <td className="num-l">
                      <button className="link" onClick={() => onJump(w.start)}>
                        {fmt(w.start)}
                      </button>
                    </td>
                    <td className="num-l muted">→ {fmt(w.end)}</td>
                    <td className="num">{dur(w)}</td>
                    <td className="muted">
                      {t('Ay')} <span className="glyph">{signGlyph(sd.sign)}</span> {SIGNS[sd.sign].name}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </section>
      )}
      <p className="muted small">{t('Açılar o andaki gezegenler arasında ölçülür; köşe koşulu seçili konuma göre hesaplanır. Bir tarihe tıklayınca harita o ana gider.')}</p>
    </div>
  )
}
