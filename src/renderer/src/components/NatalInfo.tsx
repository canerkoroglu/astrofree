import { useMemo } from 'react'
import type { AppSettings, ChartRecord } from '@shared/types'
import {
  balance,
  ELEMENT_TR,
  findAspects,
  glyph,
  HOUSE_SYSTEMS,
  MODE_TR,
  moonPhase,
  POINT,
  rulerOf,
  SIGNS,
  signGlyph,
  splitDeg,
  type Layer
} from '../lib/astro'
import { fmtLocal, fmtOffset, jdToLocal, offsetAt, tzLabel } from '../lib/time'
import { fmtCoord, fmtOrb } from '../lib/astro'
import type { Pattern } from '../lib/patterns'
import {
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
const ELEMENT_COLOR = { fire: '#d9452b', earth: '#3f8f3a', air: '#c48f00', water: '#2b6cc4' } as const

function degMin(lon: number) {
  const s = splitDeg(lon)
  return `${p2(s.deg)}° ${p2(s.min)}'`
}

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
  const dateOf = (jd: number) => {
    const l = jdToLocal(jd, rec.tz, rec.place.lon)
    return `${p2(l.d)}.${p2(l.m)}.${l.y}`
  }
  const g = (k: string) => <span className="glyph">{glyph(k)}</span>
  const aspects = useMemo(() => findAspects(natal.points, null, settings, false), [natal, settings])
  const pt = (k: string) => natal.points.find((p) => p.key === k)
  const sun = pt('sun')
  const moon = pt('moon')
  const asc = pt('asc')
  const mc = pt('mc')
  const bal = balance(natal.points)
  const ascRuler = asc ? rulerOf(splitDeg(asc.lon).sign) : null
  const ascRulerPt = ascRuler ? pt(ascRuler) : undefined
  const dominant = (Object.entries(bal.elements) as [keyof typeof ELEMENT_TR, number][]).sort((a, b) => b[1] - a[1])[0]
  const houseName = HOUSE_SYSTEMS.find((h) => h[0] === settings.houseSystem)?.[1] ?? settings.houseSystem

  const big3: [string, string, number | undefined][] = [
    ['Güneş', 'sun', sun?.lon],
    ['Ay', 'moon', moon?.lon],
    ['Yükselen', 'asc', asc?.lon]
  ]

  return (
    <div className="natal-info">
      <section className="ni-summary">
        <div className="ni-person">
          <h2>{rec.name || 'İsimsiz'}</h2>
          <div className="muted">
            {fmtLocal(rec.local)} · {tzLabel(rec.tz)} ({fmtOffset(offsetAt(rec.tz, natalJd, rec.place.lon))})
          </div>
          <div className="muted">
            {rec.place.name} · {fmtCoord(rec.place.lat, 'K', 'G')} {fmtCoord(rec.place.lon, 'D', 'B')}
          </div>
          <div className="muted small">
            {houseName} · {settings.zodiac === 'tropical' ? 'Tropikal' : 'Sidereal'}
          </div>
        </div>
        <div className="ni-cards">
          {big3.map(([label, key, lon]) =>
            lon === undefined ? null : (
              <div key={key} className="ni-card">
                <div className="muted small">{label}</div>
                <div className="ni-big">
                  <span className="glyph" style={{ color: ELEMENT_COLOR[SIGNS[splitDeg(lon).sign].element] }}>
                    {signGlyph(splitDeg(lon).sign)}
                  </span>{' '}
                  {SIGNS[splitDeg(lon).sign].name}
                </div>
                <div className="muted small">
                  {degMin(lon)}
                  {key !== 'asc' && pt(key) ? ` · ${pt(key)!.house}. ev` : ''}
                </div>
              </div>
            )
          )}
          {ascRuler && ascRulerPt && (
            <div className="ni-card">
              <div className="muted small">Harita yöneticisi</div>
              <div className="ni-big">
                <span className="glyph">{glyph(ascRuler)}</span> {POINT[ascRuler].name}
              </div>
              <div className="muted small">
                {SIGNS[splitDeg(ascRulerPt.lon).sign].name} · {ascRulerPt.house}. ev
              </div>
            </div>
          )}
          {sun && moon && (
            <div className="ni-card">
              <div className="muted small">Ay fazı</div>
              <div className="ni-big">{moonPhase(sun.lon, moon.lon).name}</div>
              <div className="muted small">{sun.house >= 7 ? 'Gündüz' : 'Gece'} haritası</div>
            </div>
          )}
          <div className="ni-card">
            <div className="muted small">Baskın element</div>
            <div className="ni-big" style={{ color: ELEMENT_COLOR[dominant[0]] }}>
              {ELEMENT_TR[dominant[0]]}
            </div>
            <div className="muted small">
              {(Object.entries(bal.elements) as [keyof typeof ELEMENT_TR, number][]).map(([k, v]) => `${ELEMENT_TR[k]} ${v}`).join(' · ')}
            </div>
            <div className="muted small">
              {(Object.entries(bal.modes) as [keyof typeof MODE_TR, number][]).map(([k, v]) => `${MODE_TR[k]} ${v}`).join(' · ')}
            </div>
          </div>
        </div>
      </section>

      <details open>
        <summary>Gezegenler</summary>
        <table className="data ni">
          <thead>
            <tr>
              <th>Gezegen</th>
              <th>Burç</th>
              <th>Derece</th>
              <th className="num">Ev</th>
              <th className="num">Hız (günlük)</th>
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
        <summary>Açılar</summary>
        <table className="data ni">
          <thead>
            <tr>
              <th>Gezegen</th>
              <th>Açı</th>
              <th>Gezegen</th>
              <th className="num">Orb</th>
              <th>Durum</th>
            </tr>
          </thead>
          <tbody>
            {aspects.map((a, i) => (
              <tr key={i}>
                <td>
                  <Name k={a.a.key} retro={a.a.retro} />
                </td>
                <td>
                  <span className={`glyph asp-${a.aspect.kind}`}>{a.aspect.glyph}</span> {a.aspect.name}{' '}
                  <small className="muted">{a.aspect.angle}°</small>
                </td>
                <td>
                  <Name k={a.b.key} retro={a.b.retro} />
                </td>
                <td className="num">{a.orb.toFixed(2)}</td>
                <td className="muted">{a.applying ? 'yaklaşan' : 'ayrılan'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </details>

      {patterns.length > 0 && (
        <details open>
          <summary>Açı kalıpları</summary>
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
        <summary>Asaletler (esas)</summary>
        <p className="muted small ni-note">
          {sect.day ? 'Gündüz' : 'Gece'} haritası · Mısır sınırları, Dorotheus üçlüleri, Kalde yüzleri · Puan: yönetici +5, yücelim +4, üçlü +3, sınır +2, yüz +1, zarar −5, düşüş −4, peregrin −5
        </p>
        <table className="data ni">
          <thead>
            <tr>
              <th>Gezegen</th>
              <th>Burç</th>
              <th>Ev sahibi</th>
              <th>Yücelim</th>
              <th>Üçlü (G/Ge/K)</th>
              <th>Sınır</th>
              <th>Yüz</th>
              <th>Durum</th>
              <th className="num">Puan</th>
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
                    {tags.map((t) => (
                      <span key={t} className={`tag ${DIGNITY_CLASS[t] ?? (t === 'Peregrin' ? 'bad' : 'good')}`}>
                        {t}
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
        <summary>Geleneksel</summary>
        <div className="ni-grid">
          <div>
            <h4>Sekt</h4>
            <div>
              {sect.day ? 'Gündüz' : 'Gece'} haritası · Sekt ışığı {g(sect.luminary)} {POINT[sect.luminary].name}
            </div>
            <div>
              Sekt iyicili {g(sect.benefic)} {POINT[sect.benefic].name} · Sekt kötücülü {g(sect.malefic)} {POINT[sect.malefic].name}
            </div>
            <div className="muted">
              Sekt dışı kötücül (en zorlayıcı): {g(sect.contraryMalefic)} {POINT[sect.contraryMalefic].name}
            </div>
            <h4>Almuten</h4>
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
            <h4>Hermetik noktalar</h4>
            <table className="data ni compact">
              <tbody>
                {lots.map((l) => (
                  <tr key={l.name} title={l.formula + (sect.day ? '' : ' (gece ters)')}>
                    <td>{l.name}</td>
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
        <summary>Zaman lordları — {dateOf(eventJd)}</summary>
        <div className="ni-grid">
          <div>
            <h4>Yıllık profeksiyon</h4>
            <div>
              {prof.age} yaş → <strong>{prof.house}. ev</strong> ({SIGNS[prof.sign].name})
            </div>
            <div>
              Yılın lordu: {g(prof.lord)} <strong>{POINT[prof.lord].name}</strong>
              {pt(prof.lord) ? <span className="muted"> (natalde {pt(prof.lord)!.house}. ev, {SIGNS[splitDeg(pt(prof.lord)!.lon).sign].name})</span> : null}
            </div>
            <div className="muted">
              Aylık: {SIGNS[prof.monthSign].name}, ay lordu {g(prof.monthLord)} {POINT[prof.monthLord].name}
            </div>
          </div>
          <div>
            <h4>Firdaria</h4>
            {curFirdar.major && (
              <div>
                Şu an: <strong>{firdarName(curFirdar.major.lord)}</strong>
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

      <details open>
        <summary>Sabit yıldızlar</summary>
        {stars.length === 0 ? (
          <p className="muted small ni-note">Gezegen veya köşelerle 1° içinde kavuşan parlak sabit yıldız yok.</p>
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
        <summary>Evler</summary>
        <table className="data ni">
          <thead>
            <tr>
              <th className="num">Ev</th>
              <th>Burç</th>
              <th>Derece</th>
              <th>Yönetici</th>
              <th className="num">Yöneticinin evi</th>
              <th>İçindekiler</th>
            </tr>
          </thead>
          <tbody>
            {natal.cusps.map((c, i) => {
              const ruler = rulerOf(splitDeg(c).sign)
              const inside = natal.points.filter((p) => p.house === i + 1 && !['asc', 'mc'].includes(p.key))
              return (
                <tr key={i}>
                  <td className="num">
                    {i + 1}
                    {i === 0 ? ' (ASC)' : i === 9 ? ' (MC)' : ''}
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
