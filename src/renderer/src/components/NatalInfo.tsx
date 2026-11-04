import { mansionOf, moonChartLord } from '../lib/kb'
import { t } from '../lib/i18n'
import { useMemo } from 'react'
import type { AppSettings, ChartRecord } from '@shared/types'
import {
  cuspsAreAngles,
  balance,
  elementName,
  findAspects,
  glyph,
  HOUSE_SYSTEMS,
  moonPhase,
  POINT,
  rulerOf,
  SIGNS,
  signGlyph,
  splitDeg,
  type Layer
} from '../lib/astro'
import { fmtDate, fmtLocal, fmtOffset, jdToLocal, offsetAt, tzLabel } from '../lib/time'
import { fmtCoord, fmtOrb } from '../lib/astro'
import type { Pattern } from '../lib/patterns'
import { midpointHits } from '../lib/midpoints'
import {
  isDayChart,
  almuten,
  currentFirdar,
  essentialDignity,
  exaltationRuler,
  faceRuler,
  firdaria,
  firdarName,
  hermeticLots,
  profection,
  sectInfo,
  SEVEN,
  termRuler,
  tripRulers
} from '../lib/traditional'

export interface StarConj {
  star: string
  key: string
  orb: number
}

const p2 = (n: number) => String(n).padStart(2, '0')
const ELEMENT_COLOR = { fire: 'var(--el-fire)', earth: 'var(--el-earth)', air: 'var(--el-air)', water: 'var(--el-water)' } as const

function degMin(lon: number) {
  const s = splitDeg(lon)
  return `${p2(s.deg)}° ${p2(s.min)}'`
}

const signDeg = (lon: number) => `${SIGNS[Math.floor(lon / 30) % 12].name} ${Math.round(lon % 30)}°`

/** Daily motion as ±DD° MM' SS". */
function speedDms(v: number) {
  const a = Math.abs(v)
  const d = Math.floor(a)
  const mf = (a - d) * 60
  const m = Math.floor(mf)
  const s = Math.round((mf - m) * 60)
  const [mm, ss] = s === 60 ? [m + 1, 0] : [m, s]
  return `${v < 0 ? '-' : ''}${p2(d)}° ${p2(mm)}' ${p2(ss)}"`
}

function SignCell({ lon }: { lon: number }) {
  const s = splitDeg(lon).sign
  return (
    <td className="sign">
      <span className="glyph" style={{ color: ELEMENT_COLOR[SIGNS[s].element] }}>
        {signGlyph(s)}
      </span>{' '}
      {SIGNS[s].name}
    </td>
  )
}

function Name({ k, retro }: { k: string; retro?: boolean }) {
  return (
    <>
      <span className="glyph pg">{glyph(k)}</span> {POINT[k]?.name}
      {retro && <span className="retro"> ℞</span>}
    </>
  )
}

const DIGNITY_CLASS: Record<string, string> = { Yönetici: 'good', Yücelim: 'good', Üçlü: 'good', Sınır: 'good', Yüz: 'good', Zarar: 'bad', Düşüş: 'bad', Peregrin: 'bad' }

export default function NatalInfo({
  natal,
  rec,
  settings,
  natalJd,
  eventJd,
  patterns,
  stars
}: {
  natal: Layer
  rec: ChartRecord
  settings: AppSettings
  natalJd: number
  eventJd: number
  patterns: Pattern[]
  stars: StarConj[]
}) {
  const sect = sectInfo(natal)
  const prof = profection(natal, natalJd, eventJd)
  const firdar = useMemo(() => firdaria(natalJd, sect.day), [natalJd, sect.day])
  const curFirdar = currentFirdar(firdar, eventJd)
  const lots = hermeticLots(natal)
  const dateOf = (jd: number) => fmtDate(jdToLocal(jd, rec.tz, rec.place.lon))
  const g = (k: string) => <span className="glyph">{glyph(k)}</span>
  const aspects = useMemo(() => findAspects(natal.points, null, settings, false), [natal, settings])
  const pt = (k: string) => natal.points.find((p) => p.key === k)
  const sun = pt('sun')
  const moon = pt('moon')
  const mansion = moon ? mansionOf(moon.lon) : null
  const moonLord = moon ? moonChartLord(moon.lon) : null
  const asc = pt('asc')
  const mc = pt('mc')
  const bal = balance(natal.points)
  const ascRuler = asc ? rulerOf(splitDeg(asc.lon).sign) : null
  const ascRulerPt = ascRuler ? pt(ascRuler) : undefined
  const dominant = (Object.entries(bal.elements) as ['fire' | 'earth' | 'air' | 'water', number][]).sort((a, b) => b[1] - a[1])[0]
  const houseName = t(HOUSE_SYSTEMS.find((h) => h[0] === settings.houseSystem)?.[1] ?? settings.houseSystem)

  const big3: [string, string, number | undefined][] = [
    ['Güneş', 'sun', sun?.lon],
    ['Ay', 'moon', moon?.lon],
    ['Yükselen', 'asc', asc?.lon]
  ]

  return (
    <div className="natal-info">
      <section className="ni-summary">
        <div className="ni-person">
          <h2>{rec.name || t('İsimsiz')}</h2>
          <div className="muted">
            {fmtLocal(rec.local)} · {tzLabel(rec.tz)} ({fmtOffset(offsetAt(rec.tz, natalJd, rec.place.lon))})
          </div>
          <div className="muted">
            {rec.place.name} · {fmtCoord(rec.place.lat, 'K', 'G')} {fmtCoord(rec.place.lon, 'D', 'B')}
          </div>
          <div className="muted small">
            {houseName} · {settings.zodiac === 'tropical' ? t('Tropikal') : 'Sidereal'}
            {natal.houseFallback && (
              <span className="badge warn" title={t('Placidus, Koch ve Gauquelin kutup dairelerinin içinde (enlem ≥ 90° − 23,4°) matematiksel olarak tanımsızdır; Swiss Ephemeris bu durumda Porphyry ev başlangıçlarını kullanır.')}>
                {t('Kutup dairesi: Porphyry kullanıldı')}
              </span>
            )}
          </div>
        </div>
        <div className="ni-cards">
          {big3.map(([label, key, lon]) =>
            lon === undefined ? null : (
              <div key={key} className="ni-card">
                <div className="muted small">{t(label)}</div>
                <div className="ni-big">
                  <span className="glyph" style={{ color: ELEMENT_COLOR[SIGNS[splitDeg(lon).sign].element] }}>
                    {signGlyph(splitDeg(lon).sign)}
                  </span>{' '}
                  {SIGNS[splitDeg(lon).sign].name}
                </div>
                <div className="muted small">
                  {degMin(lon)}
                  {key !== 'asc' && pt(key) ? ` · ${pt(key)!.house}. ${t('ev')}` : ''}
                </div>
              </div>
            )
          )}
          {ascRuler && ascRulerPt && (
            <div className="ni-card">
              <div className="muted small">{t('Harita yöneticisi')}</div>
              <div className="ni-big">
                <span className="glyph">{glyph(ascRuler)}</span> {POINT[ascRuler].name}
              </div>
              <div className="muted small">
                {SIGNS[splitDeg(ascRulerPt.lon).sign].name} · {ascRulerPt.house}. {t('ev')}
              </div>
            </div>
          )}
          {sun && moon && (
            <div className="ni-card">
              <div className="muted small">{t('Ay fazı')}</div>
              <div className="ni-big">{moonPhase(sun.lon, moon.lon).name}</div>
              <div className="muted small">{isDayChart(natal) ? t('Gündüz haritası') : t('Gece haritası')}</div>
            </div>
          )}
          {moon && (
            <div className="ni-card" title={t('28 Ay durağı (menâzil)')}>
              <div className="muted small">{t('Ay durağı')}</div>
              <div className="ni-big">
                {mansion!.n}. {mansion!.name}
              </div>
              <div className="muted small">
                {signDeg(mansion!.start)} – {signDeg(mansion!.end)}
              </div>
            </div>
          )}
          {moon && (
            <div className="ni-card" title={t("Ay'ın burcundan sonraki burcun yöneticisi (Güneş ve Ay atlanır)")}>
              <div className="muted small">{t("Ay'a göre harita lordu")}</div>
              <div className="ni-big">
                <span className="glyph">{glyph(moonLord!)}</span> {POINT[moonLord!].name}
                {pt(moonLord!)?.retro ? ' ℞' : ''}
              </div>
              {pt(moonLord!) && (
                <div className="muted small">
                  {SIGNS[splitDeg(pt(moonLord!)!.lon).sign].name} · {pt(moonLord!)!.house}. {t('ev')}
                </div>
              )}
            </div>
          )}
          <div className="ni-card">
            <div className="muted small">{t('Baskın element')}</div>
            <div className="ni-big" style={{ color: ELEMENT_COLOR[dominant[0]] }}>
              {elementName(dominant[0])}
            </div>
            <div className="muted small">
              {(Object.entries(bal.elements) as ['fire' | 'earth' | 'air' | 'water', number][]).map(([k, v]) => `${elementName(k)} ${v}`).join(' · ')}
            </div>
            <div className="muted small">
              {(Object.entries(bal.modes) as ['cardinal' | 'fixed' | 'mutable', number][]).map(([k, v]) => `${elementName(k)} ${v}`).join(' · ')}
            </div>
          </div>
        </div>
      </section>

      <details open>
        <summary>{t('Gezegenler')}</summary>
        <table className="data ni">
          <thead>
            <tr>
              <th>{t('Gezegen')}</th>
              <th>{t('Burç')}</th>
              <th>{t('Derece')}</th>
              <th className="num">{t('Ev')}</th>
              <th className="num">{t('Hız (günlük)')}</th>
            </tr>
          </thead>
          <tbody>
            {natal.points.map((p) => (
              <tr key={p.key}>
                <td>
                  <Name k={p.key} retro={p.retro} />
                </td>
                <SignCell lon={p.lon} />
                <td className="num-l">{degMin(p.lon)}</td>
                <td className="num">{['asc', 'mc'].includes(p.key) ? '' : p.house}</td>
                <td className="num muted">{['asc', 'mc', 'fortune', 'vertex'].includes(p.key) ? '' : speedDms(p.speed)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      <details open>
        <summary>{t('Açılar')}</summary>
        <table className="data ni">
          <thead>
            <tr>
              <th>{t('Gezegen')}</th>
              <th>{t('Açı')}</th>
              <th>{t('Gezegen')}</th>
              <th className="num">{t('Orb')}</th>
              <th>{t('Durum')}</th>
            </tr>
          </thead>
          <tbody>
            {aspects.map((a, i) => (
              <tr key={i}>
                <td>
                  <Name k={a.a.key} retro={a.a.retro} />
                </td>
                <td>
                  <span className={`glyph asp-k-${a.aspect.key}`}>{a.aspect.glyph}</span> {a.aspect.name}{' '}
                  <small className="muted">{a.aspect.angle}°</small>
                </td>
                <td>
                  <Name k={a.b.key} retro={a.b.retro} />
                </td>
                <td className="num">{a.orb.toFixed(2)}</td>
                <td className="muted">{a.applying ? t('yaklaşan') : t('ayrılan')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {patterns.length > 0 && (
        <details open>
          <summary>{t('Açı kalıpları')}</summary>
          <ul className="ni-list">
            {patterns.map((p, i) => (
              <li key={i}>
                <strong>{p.name}</strong> — {p.keys.map((k) => g(k))} <span className="muted">{p.note}</span>
              </li>
            ))}
          </ul>
        </details>
      )}

      <details open>
        <summary>{t('Asaletler (esas)')}</summary>
        <p className="muted small ni-note">
          {sect.day ? t('Gündüz haritası') : t('Gece haritası')} · {t('Mısır sınırları, Dorotheus üçlüleri, Kalde yüzleri · Puan: yönetici +5, yücelim +4, üçlü +3, sınır +2, yüz +1, zarar −5, düşüş −4, peregrin −5')}
        </p>
        <table className="data ni">
          <thead>
            <tr>
              <th>{t('Gezegen')}</th>
              <th>{t('Burç')}</th>
              <th>{t('Ev sahibi')}</th>
              <th>{t('Yücelim')}</th>
              <th>{t('Üçlü (G/Ge/K)')}</th>
              <th>{t('Sınır')}</th>
              <th>{t('Yüz')}</th>
              <th>{t('Durum')}</th>
              <th className="num">{t('Puan')}</th>
            </tr>
          </thead>
          <tbody>
            {SEVEN.map((k) => {
              const p = pt(k)
              if (!p) return null
              const sign = splitDeg(p.lon).sign
              const d = essentialDignity(k, p.lon, sect.day)
              const tr = tripRulers(sign)
              const ex = exaltationRuler(sign)
              const tags = [
                d.domicile && 'Yönetici',
                d.exaltation && 'Yücelim',
                d.triplicity && 'Üçlü',
                d.term && 'Sınır',
                d.face && 'Yüz',
                d.detriment && 'Zarar',
                d.fall && 'Düşüş',
                d.peregrine && 'Peregrin'
              ].filter(Boolean) as string[]
              return (
                <tr key={k}>
                  <td>
                    <Name k={k} retro={p.retro} />
                  </td>
                  <SignCell lon={p.lon} />
                  <td>{g(rulerOf(sign, false))}</td>
                  <td>{ex ? g(ex) : '—'}</td>
                  <td>
                    {g(tr[0])} {g(tr[1])} {g(tr[2])}
                  </td>
                  <td>{g(termRuler(p.lon))}</td>
                  <td>{g(faceRuler(p.lon))}</td>
                  <td>
                    {tags.map((tag) => (
                      <span key={tag} className={`tag ${DIGNITY_CLASS[tag] ?? (tag === 'Peregrin' ? 'bad' : 'good')}`}>
                        {t(tag)}
                      </span>
                    ))}
                  </td>
                  <td className={`num ${d.score > 0 ? 'good' : d.score < 0 ? 'bad' : ''}`}>
                    {d.score > 0 ? '+' : ''}
                    {d.score}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </details>

      <details open>
        <summary>{t('Geleneksel')}</summary>
        <div className="ni-grid">
          <div>
            <h4>{t('Sekt')}</h4>
            <div>
              {sect.day ? t('Gündüz haritası') : t('Gece haritası')} · {t('Sekt ışığı')} {g(sect.luminary)} {POINT[sect.luminary].name}
            </div>
            <div>
              {t('Sekt iyicili')} {g(sect.benefic)} {POINT[sect.benefic].name} · {t('Sekt kötücülü')} {g(sect.malefic)} {POINT[sect.malefic].name}
            </div>
            <div className="muted">
              {t('Sekt dışı kötücül (en zorlayıcı)')}: {g(sect.contraryMalefic)} {POINT[sect.contraryMalefic].name}
            </div>
            <h4>{t('Almuten')}</h4>
            {asc && (
              <div>
                ASC: {g(almuten(asc.lon, sect.day).key)} {POINT[almuten(asc.lon, sect.day).key].name}
              </div>
            )}
            {mc && (
              <div>
                MC: {g(almuten(mc.lon, sect.day).key)} {POINT[almuten(mc.lon, sect.day).key].name}
              </div>
            )}
          </div>
          <div>
            <h4>{t('Hermetik noktalar')}</h4>
            <table className="data ni compact">
              <tbody>
                {lots.map((l) => (
                  <tr key={l.name} title={t(l.formula) + (sect.day ? '' : ` (${t('gece ters')})`)}>
                    <td>{t(l.name)}</td>
                    <SignCell lon={l.lon} />
                    <td className="num-l">{degMin(l.lon)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      <details open>
        <summary>{t('Zaman lordları')} — {dateOf(eventJd)}</summary>
        <div className="ni-grid">
          <div>
            <h4>{t('Yıllık profeksiyon')}</h4>
            <div>
              {t('{n} yaş', { n: prof.age })} → <strong>{t('{n}. ev', { n: prof.house })}</strong> ({SIGNS[prof.sign].name})
            </div>
            <div>
              {t('Yılın lordu')}: {g(prof.lord)} <strong>{POINT[prof.lord].name}</strong>
              {pt(prof.lord) ? <span className="muted"> ({t('natalde')} {t('{n}. ev', { n: pt(prof.lord)!.house })}, {SIGNS[splitDeg(pt(prof.lord)!.lon).sign].name})</span> : null}
            </div>
            <div className="muted">
              {t('Aylık')}: {SIGNS[prof.monthSign].name}, {t('ay lordu')} {g(prof.monthLord)} {POINT[prof.monthLord].name}
            </div>
          </div>
          <div>
            <h4>{t('Firdaria')}</h4>
            {curFirdar.major && (
              <div>
                {t('Şu an')}: <strong>{firdarName(curFirdar.major.lord)}</strong>
                {curFirdar.sub?.sub ? ` / ${firdarName(curFirdar.sub.sub)}` : ''}{' '}
                <span className="muted">
                  ({dateOf((curFirdar.sub ?? curFirdar.major).start)} – {dateOf((curFirdar.sub ?? curFirdar.major).end)})
                </span>
              </div>
            )}
            <table className="data ni compact">
              <tbody>
                {firdar
                  .filter((f) => !f.sub)
                  .map((f) => (
                    <tr key={f.lord} className={curFirdar.major === f ? 'current' : ''}>
                      <td>
                        {g(f.lord)} {firdarName(f.lord)}
                      </td>
                      <td className="muted">
                        {dateOf(f.start)} – {dateOf(f.end)}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      </details>

      <details>
        <summary>{t('Orta noktalar')}</summary>
        <p className="muted small ni-note">{t('Bir nokta, iki noktanın orta noktasına 0°, 45°, 90°, 135° veya 180° açıyla (±1,5°) değiyor. Ebertin gösterimi: C = A/B.')}</p>
        <table className="data ni">
          <tbody>
            {midpointHits(natal.points)
              .slice(0, 40)
              .map((h, i) => (
                <tr key={i}>
                  <td>
                    <Name k={h.c} /> <span className="muted">=</span> {g(h.a)}/{g(h.b)} <span className="muted small">{POINT[h.a].name} / {POINT[h.b].name}</span>
                  </td>
                  <td className="num muted">{h.angle}°</td>
                  <td className="num">{fmtOrb(h.orb)}</td>
                </tr>
              ))}
          </tbody>
        </table>
      </details>

      <details open>
        <summary>{t('Sabit yıldızlar')}</summary>
        {stars.length === 0 ? (
          <p className="muted small ni-note">{t('Gezegen veya köşelerle 1° içinde kavuşan parlak sabit yıldız yok.')}</p>
        ) : (
          <table className="data ni">
            <tbody>
              {stars.map((c, i) => (
                <tr key={i}>
                  <td>
                    <Name k={c.key} />
                  </td>
                  <td>☌ {c.star}</td>
                  <td className="num">{fmtOrb(c.orb)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </details>

      <details open>
        <summary>{t('Evler')}</summary>
        <table className="data ni">
          <thead>
            <tr>
              <th className="num">{t('Ev')}</th>
              <th>{t('Burç')}</th>
              <th>{t('Derece')}</th>
              <th>{t('Yönetici')}</th>
              <th className="num">{t('Yöneticinin evi')}</th>
              <th>{t('İçindekiler')}</th>
            </tr>
          </thead>
          <tbody>
            {natal.cusps.map((c, i) => {
              const anglesAtCusps = cuspsAreAngles(natal)
              const ruler = rulerOf(splitDeg(c).sign)
              const inside = natal.points.filter((p) => p.house === i + 1 && !['asc', 'mc'].includes(p.key))
              return (
                <tr key={i}>
                  <td className="num">
                    {i + 1}
                    {anglesAtCusps && (i === 0 ? ' (ASC)' : i === 9 ? ' (MC)' : '')}
                  </td>
                  <SignCell lon={c} />
                  <td className="num-l">{degMin(c)}</td>
                  <td>
                    <Name k={ruler} />
                  </td>
                  <td className="num">{pt(ruler)?.house ?? ''}</td>
                  <td>
                    {inside.map((p) => (
                      <span key={p.key} className="glyph pg" title={POINT[p.key].name}>
                        {glyph(p.key)}{' '}
                      </span>
                    ))}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {mc && <p className="muted small">MC {degMin(mc.lon)} {SIGNS[splitDeg(mc.lon).sign].name}</p>}
      </details>
    </div>
  )
}
