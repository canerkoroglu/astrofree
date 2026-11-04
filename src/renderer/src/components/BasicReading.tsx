// Built-in reading: works offline, without any AI provider. Texts come from
// src/shared/meanings and are always phrased as possibilities.
import { useMemo, useState } from 'react'
import type { AppSettings, ChartRecord } from '@shared/types'
import { t } from '../lib/i18n'
import { balance, elementName, findAspects, fmtOrb, glyph, POINT, SIGNS, signGlyph, splitDeg, type Layer } from '../lib/astro'
import { aspectText, houseText, M, READING_POINTS, signText } from '../lib/meanings'

const MAJOR = ['conjunction', 'opposition', 'trine', 'square', 'sextile']
/** Personal points compared in synastry. */
const SYN_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc']
/** A conjunction with one of these is counted with the challenging contacts. */
const HARD_CONJ = ['mars', 'saturn']

export default function BasicReading({
  natal,
  rec,
  settings,
  onAsk,
  synastry,
  partner
}: {
  natal: Layer
  rec: ChartRecord
  settings: AppSettings
  onAsk?: (prompt: string) => void
  /** The partner's chart as an outer layer, when the synastry layer is on. */
  synastry?: Layer | null
  partner?: ChartRecord | null
}) {
  const m = M()
  const [copied, setCopied] = useState(false)
  const timeKnown = !rec.timeUnknown
  const pt = (k: string) => natal.points.find((p) => p.key === k)
  const signOf = (lon: number) => SIGNS[splitDeg(lon).sign]

  const aspects = useMemo(
    () =>
      findAspects(natal.points, null, settings, false)
        .filter((a) => MAJOR.includes(a.aspect.key) && READING_POINTS.includes(a.a.key) && READING_POINTS.includes(a.b.key))
        .sort((x, y) => x.orb - y.orb)
        .slice(0, 12),
    [natal, settings]
  )

  // Synastry: partner's personal points to the person's personal points, major aspects, tightest first.
  const syn = useMemo(() => {
    if (!synastry) return null
    const keys = SYN_KEYS.filter((k) => !(['asc'].includes(k) && (rec.timeUnknown || partner?.timeUnknown)))
    const list = findAspects(
      synastry.points.filter((p) => keys.includes(p.key)),
      natal.points.filter((p) => keys.includes(p.key)),
      settings,
      true
    )
      .filter((a) => MAJOR.includes(a.aspect.key) && a.orb <= 5)
      .sort((x, y) => x.orb - y.orb)
    const soft = list.filter((a) => a.aspect.kind === 'soft' || (a.aspect.key === 'conjunction' && !HARD_CONJ.some((k) => k === a.a.key || k === a.b.key)))
    const hard = list.filter((a) => !soft.includes(a))
    return { soft: soft.slice(0, 8), hard: hard.slice(0, 8), nSoft: soft.length, nHard: hard.length }
  }, [synastry, natal, settings, rec.timeUnknown, partner?.timeUnknown])
  const partnerName = partner?.name || synastry?.label || t('Partner')

  const bal = balance(natal.points).elements
  const els = Object.entries(bal) as ['fire' | 'earth' | 'air' | 'water', number][]
  const strong = els.filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1])
  const weak = els.filter(([, n]) => n <= 1)

  const big3 = (
    [
      ['sun', pt('sun')],
      ['moon', pt('moon')],
      ...(timeKnown ? [['asc', pt('asc')]] : [])
    ] as [string, ReturnType<typeof pt>][]
  ).filter(([, p]) => p)

  const planets = READING_POINTS.map(pt).filter((p): p is NonNullable<typeof p> => !!p)
  const mc = timeKnown ? pt('mc') : undefined

  // Plain-text version for copying.
  const plain = () => {
    const lines: string[] = [`${rec.name || t('İsimsiz')} — ${t('Temel yorum')}`, '', m.disclaimer, '']
    for (const [k, p] of big3) lines.push(`${POINT[k].name} ${signOf(p!.lon).name}: ${signText(k, p!.lon)}`)
    lines.push('')
    for (const p of planets) {
      lines.push(`${POINT[p.key].name} — ${signOf(p.lon).name}${timeKnown ? `, ${t('{n}. ev', { n: p.house })}` : ''}`)
      if (!['sun', 'moon'].includes(p.key)) lines.push(signText(p.key, p.lon) ?? '')
      if (timeKnown) lines.push(houseText(p.key, p.house) ?? '')
      lines.push('')
    }
    for (const a of aspects) {
      const x = aspectText(a)
      if (x) lines.push(`${POINT[a.a.key].name} ${a.aspect.name} ${POINT[a.b.key].name}: ${x.text}`)
    }
    lines.push('', 'AstroFree — https://astrofree.cklabs.tr')
    return lines.filter((l, i, arr) => !(l === '' && arr[i - 1] === '')).join('\n')
  }

  return (
    <div className="natal-info reading">
      <section className="ni-summary">
        <div className="reading-head">
          <div>
            <h2>{rec.name || t('İsimsiz')}</h2>
            <div className="muted">{t('Yapay zekâ gerektirmeyen, çevrimdışı temel yorum')}</div>
          </div>
          <div className="reading-actions">
            <button
              onClick={() => {
                void navigator.clipboard.writeText(plain())
                setCopied(true)
                setTimeout(() => setCopied(false), 1600)
              }}
            >
              {copied ? t('Kopyalandı') : t('Metni kopyala')}
            </button>
            {onAsk && (
              <button className="primary" onClick={() => onAsk(t('Bu doğum haritasının genel bir yorumunu yap: önce en güçlü temalar, sonra Güneş, Ay, Yükselen ve öne çıkan açılar.'))}>
                {t('Yapay zekâ ile derinleştir')}
              </button>
            )}
          </div>
        </div>
        <div className="reading-disclaimer" role="note">
          {m.disclaimer}
        </div>
        {!timeKnown && <div className="reading-note">{t('Doğum saati bilinmediği için Yükselen ve ev yorumları gösterilmiyor.')}</div>}
      </section>

      <section className="reading-big3">
        {big3.map(([k, p]) => (
          <div key={k} className="ni-card reading-card">
            <div className="ni-big">
              <span className="glyph">{glyph(k)}</span> {POINT[k].name} · <span className="glyph">{signGlyph(splitDeg(p!.lon).sign)}</span>{' '}
              {signOf(p!.lon).name}
            </div>
            <p>{signText(k, p!.lon)}</p>
          </div>
        ))}
      </section>

      {(strong.length > 0 || weak.length > 0) && (
        <details open>
          <summary>{t('Element dengesi')}</summary>
          <div className="reading-body">
            <div className="muted small">{els.map(([e, n]) => `${elementName(e)} ${n}`).join(' · ')}</div>
            {strong.map(([e]) => (
              <p key={e}>{m.elements[e][0]}</p>
            ))}
            {weak.map(([e]) => (
              <p key={e}>{m.elements[e][1]}</p>
            ))}
          </div>
        </details>
      )}

      <details open>
        <summary>{t('Gezegenler')}</summary>
        <div className="reading-body">
          {planets.map((p) => (
            <div key={p.key} className="reading-item">
              <h4>
                <span className="glyph">{glyph(p.key)}</span> {POINT[p.key].name}
                <span className="muted">
                  {' '}
                  · {signOf(p.lon).name}
                  {timeKnown ? ` · ${t('{n}. ev', { n: p.house })}` : ''}
                  {p.retro && !['node', 'snode'].includes(p.key) ? ' · Retro' : ''}
                </span>
              </h4>
              <p className="muted small">{m.planets[p.key]?.about}</p>
              {!['sun', 'moon'].includes(p.key) && <p>{signText(p.key, p.lon)}</p>}
              {timeKnown && <p>{houseText(p.key, p.house)}</p>}
              {p.retro && !['node', 'snode'].includes(p.key) && <p className="muted">{m.retro}</p>}
            </div>
          ))}
          {mc && (
            <div className="reading-item">
              <h4>
                {POINT.mc.name} <span className="muted">· {signOf(mc.lon).name}</span>
              </h4>
              <p className="muted small">{m.planets.mc.about}</p>
              <p>{signText('mc', mc.lon)}</p>
            </div>
          )}
        </div>
      </details>

      {aspects.length > 0 && (
        <details open>
          <summary>{t('Öne çıkan açılar')}</summary>
          <div className="reading-body">
            <p className="muted small">{t('Orb’u en dar (en güçlü kabul edilen) ana açılar.')}</p>
            {aspects.map((a, i) => {
              const x = aspectText(a)
              if (!x) return null
              return (
                <div key={i} className="reading-item">
                  <h4>
                    <span className="glyph">{glyph(a.a.key)}</span> {POINT[a.a.key].name} <span className="glyph">{a.aspect.glyph}</span> {a.aspect.name}{' '}
                    <span className="glyph">{glyph(a.b.key)}</span> {POINT[a.b.key].name} <span className="muted">· {fmtOrb(a.orb)}</span>
                  </h4>
                  <p>{x.text}</p>
                  <p className="muted small">
                    {POINT[a.a.key].name}: {x.a} · {POINT[a.b.key].name}: {x.b}
                  </p>
                </div>
              )
            })}
          </div>
        </details>
      )}

      {syn && (
        <details open className="synastry">
          <summary>{t('Sinastri: {a} ve {b}', { a: rec.name || t('İsimsiz'), b: partnerName })}</summary>
          <div className="reading-body">
            <p className="muted small">
              {t('İki haritanın kişisel gezegenleri arasındaki ana açılar (orb ≤ 5°). Bir ilişkinin nasıl yaşanacağını hiçbir harita belirlemez; bunlar yalnızca üzerine konuşulabilecek temalardır.')}
            </p>
            <div className="syn-balance">
              <span>
                {t('Uyum alanları')}: <b>{syn.nSoft}</b>
              </span>
              <span>
                {t('Gelişim alanları')}: <b>{syn.nHard}</b>
              </span>
            </div>
            {(
              [
                ['Uyum alanları', syn.soft, 'Kolay akabilecek, birbirini destekleyebilecek temalar.'],
                ['Gelişim alanları', syn.hard, 'Sürtünme yaratabilecek ama birlikte büyümeye de alan açabilecek temalar.']
              ] as const
            ).map(([title, list, note]) =>
              list.length ? (
                <div key={title} className="syn-group">
                  <h4>{t(title)}</h4>
                  <p className="muted small">{t(note)}</p>
                  {list.map((a, i) => {
                    const x = aspectText(a)
                    if (!x) return null
                    return (
                      <div key={i} className="reading-item">
                        <h4>
                          {partnerName}: <span className="glyph">{glyph(a.a.key)}</span> {POINT[a.a.key].name} <span className="glyph">{a.aspect.glyph}</span> {a.aspect.name}{' '}
                          {rec.name || t('İsimsiz')}: <span className="glyph">{glyph(a.b.key)}</span> {POINT[a.b.key].name} <span className="muted">· {fmtOrb(a.orb)}</span>
                        </h4>
                        <p>{x.text}</p>
                        <p className="muted small">
                          {POINT[a.a.key].name}: {x.a} · {POINT[a.b.key].name}: {x.b}
                        </p>
                      </div>
                    )
                  })}
                </div>
              ) : null
            )}
            {onAsk && (
              <button onClick={() => onAsk(t('Bu iki haritanın sinastrisini yorumla: güçlü yanlar, olası zorluklar ve birlikte büyüme alanları.'))}>
                {t('Sinastriyi yapay zekâ ile derinleştir')}
              </button>
            )}
          </div>
        </details>
      )}

      <details>
        <summary>{t('Temel kavramlar')}</summary>
        <div className="reading-body">
          <dl className="reading-glossary">
            {m.glossary.map(([term, def]) => (
              <div key={term}>
                <dt>{term}</dt>
                <dd>{def}</dd>
              </div>
            ))}
          </dl>
        </div>
      </details>

      <p className="reading-disclaimer small">{m.disclaimer}</p>
    </div>
  )
}
