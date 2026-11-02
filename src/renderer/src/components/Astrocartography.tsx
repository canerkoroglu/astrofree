import { t } from '../lib/i18n'
import { useEffect, useMemo, useState } from 'react'
import type { ChartRecord, GeoResult } from '@shared/types'
import { glyph, POINT, type Layer } from '../lib/astro'
import { ACG_BODIES, acgLines, acgTone, linesNear, type AngleKind } from '../lib/acg'
import WorldMap, { type MapOverlay } from './WorldMap'

const ANGLE_TEXT: Record<AngleKind, string> = {
  MC: 'tepe noktasında (MC) — kariyer, görünürlük',
  IC: 'dip noktasında (IC) — ev, aile, kökler',
  ASC: 'doğuyor (ASC) — kişilik, beden, yeni başlangıçlar',
  DSC: 'batıyor (DSC) — ilişkiler, ortaklıklar'
}

export default function Astrocartography({
  natal,
  rec,
  onRelocate,
  onAsk
}: {
  natal: Layer
  rec: ChartRecord
  onRelocate: (place: GeoResult) => void
  onAsk: (prompt: string) => void
}) {
  const lines = useMemo(() => acgLines(natal, rec.place.lon), [natal, rec.place.lon])
  const [shown, setShown] = useState<Set<string>>(new Set(ACG_BODIES.filter((k) => !['node', 'chiron'].includes(k))))
  const [angles, setAngles] = useState<Set<AngleKind>>(new Set(['MC', 'IC', 'ASC', 'DSC']))
  const [focus, setFocus] = useState<string | null>(null)
  const [pick, setPick] = useState<{ lat: number; lon: number } | null>(null)
  const [pickPlace, setPickPlace] = useState<(GeoResult & { km: number }) | null>(null)

  useEffect(() => {
    if (!pick) return
    let alive = true
    void window.astro.geo.nearest(pick.lat, pick.lon).then((p) => alive && setPickPlace(p))
    return () => {
      alive = false
    }
  }, [pick])

  const visible = lines.filter((l) => shown.has(l.key) && angles.has(l.angle))
  const overlays: MapOverlay[] = visible.map((l) => {
    const dim = focus !== null && focus !== l.key
    const tone = acgTone(l.key)
    return {
      d: l.d,
      className: `${tone} ${l.angle === 'IC' || l.angle === 'DSC' ? 'dashed' : ''} ${dim ? 'dim' : focus === l.key ? 'hl' : ''}`,
      width: focus === l.key ? 2.4 : 1.4,
      title: `${POINT[l.key].name} ${l.angle}`,
      label: { x: l.label[0] + 180, y: 90 - l.label[1], text: `${glyph(l.key)}${l.angle}`, className: dim ? 'dim' : '' }
    }
  })

  const near = pick ? linesNear(visible, pick.lat, pick.lon) : []
  const toggle = <T,>(set: Set<T>, v: T) => {
    const n = new Set(set)
    if (n.has(v)) n.delete(v)
    else n.add(v)
    return n
  }

  return (
    <div className="acg">
      <div className="acg-controls">
        <div className="acg-bodies">
          {ACG_BODIES.map((k) => (
            <button
              key={k}
              className={`acg-chip ${shown.has(k) ? 'on' : ''} ${focus === k ? 'focus' : ''}`}
              onClick={() => setShown(toggle(shown, k))}
              onMouseEnter={() => setFocus(k)}
              onMouseLeave={() => setFocus(null)}
              title={POINT[k].name}
            >
              <span className={`glyph tone-${acgTone(k)}`}>{glyph(k)}</span>
            </button>
          ))}
        </div>
        <div className="acg-angles">
          {(['MC', 'IC', 'ASC', 'DSC'] as AngleKind[]).map((a) => (
            <label key={a} className="inline small">
              <input type="checkbox" checked={angles.has(a)} onChange={() => setAngles(toggle(angles, a))} />
              {a}
            </label>
          ))}
        </div>
      </div>
      <WorldMap
        className="acg-map"
        lat={pick?.lat ?? rec.place.lat}
        lon={pick?.lon ?? rec.place.lon}
        overlays={overlays}
        onPick={(lat, lon) => setPick({ lat, lon })}
      />
      <div className="acg-legend muted small">
        {t('Düz çizgi: MC ve ASC · kesik çizgi: IC ve DSC · mavi: Güneş ve Ay · yeşil: Venüs ve Jüpiter · kırmızı: Mars ve Satürn. Bir yere tıklayın.')}
      </div>

      {pick && (
        <div className="acg-detail">
          <div className="acg-detail-head">
            <div>
              <div className="acg-place">{pickPlace ? pickPlace.name : `${pick.lat.toFixed(2)}, ${pick.lon.toFixed(2)}`}</div>
              <div className="muted small">
                {pickPlace ? `${Math.round(pickPlace.km)} km yakınında · ` : ''}
                {pick.lat.toFixed(2)}°, {pick.lon.toFixed(2)}°
              </div>
            </div>
            <span className="grow" />
            {pickPlace && (
              <button onClick={() => onRelocate(pickPlace)} title={t('Aynı doğum anı, bu konumdan bakıldığında')}>
                {t('Bu yere taşınmış harita')}
              </button>
            )}
            <button
              className="primary"
              onClick={() =>
                onAsk(
                  `Astrokartografi: ${pickPlace ? pickPlace.name : `${pick.lat.toFixed(2)}, ${pick.lon.toFixed(2)}`} konumu için yorum yap. ` +
                    (near.length
                      ? `Yakındaki çizgiler: ${near
                          .slice(0, 6)
                          .map((n) => `${POINT[n.line.key].name} ${n.line.angle} (${Math.round(n.km)} km)`)
                          .join(', ')}.`
                      : 'Yakında belirgin bir gezegen çizgisi yok.') +
                    ' Bu yerde yaşamak, çalışmak veya seyahat etmek hayatımın hangi alanlarını nasıl etkiler?'
                )
              }
            >
              {t('Bu yeri yorumla')}
            </button>
          </div>
          {near.length === 0 ? (
            <p className="muted small">{t('700 km içinde görünen bir çizgi yok.')}</p>
          ) : (
            <table className="data">
              <tbody>
                {near.slice(0, 8).map((n, i) => (
                  <tr key={i}>
                    <td>
                      <span className={`glyph tone-${acgTone(n.line.key)}`}>{glyph(n.line.key)}</span> {POINT[n.line.key].name}
                    </td>
                    <td className="muted">{ANGLE_TEXT[n.line.angle]}</td>
                    <td className="num">{Math.round(n.km)} km</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
