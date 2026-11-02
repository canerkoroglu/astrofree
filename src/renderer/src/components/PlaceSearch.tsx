import { useEffect, useRef, useState } from 'react'
import type { GeoResult, Place } from '@shared/types'
import { fmtCoord } from '../lib/astro'
import { fmtDms, parseCoord } from '../lib/coords'
import WorldMap from './WorldMap'

/** City search (offline database) plus typed coordinates or a world-map pick. */
export default function PlaceSearch({ value, onChange }: { value: Place; onChange: (p: Place) => void }) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [busy, setBusy] = useState(false)
  const [latText, setLatText] = useState(String(value.lat))
  const [lonText, setLonText] = useState(String(value.lon))
  const [showMap, setShowMap] = useState(false)
  const [near, setNear] = useState('')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => {
    setLatText(String(value.lat))
    setLonText(String(value.lon))
  }, [value.lat, value.lon])

  useEffect(() => {
    window.clearTimeout(timer.current)
    if (q.trim().length < 2) {
      setResults([])
      return
    }
    timer.current = window.setTimeout(async () => {
      setBusy(true)
      try {
        setResults(await window.astro.geo.search(q, 'tr'))
      } catch {
        setResults([])
      } finally {
        setBusy(false)
      }
    }, 200)
    return () => window.clearTimeout(timer.current)
  }, [q])

  /** Apply coordinates; name the place after the nearest city when one is close. */
  const setCoord = async (lat: number, lon: number, rename: boolean) => {
    const zone = (await window.astro.geo.zone(lat, lon)) ?? value.zone
    const nearest = await window.astro.geo.nearest(lat, lon)
    setNear(nearest ? `${nearest.name} (~${Math.round(nearest.km)} km)` : '')
    const name = rename
      ? nearest && nearest.km < 15
        ? nearest.name
        : `${fmtCoord(lat, 'K', 'G')} ${fmtCoord(lon, 'D', 'B')}${nearest ? ` (${nearest.name.split(',')[0]} yakını)` : ''}`
      : value.name
    onChange({ ...value, name, lat, lon, zone: zone ?? undefined, country: nearest?.country ?? value.country })
  }

  const latParsed = parseCoord(latText, true)
  const lonParsed = parseCoord(lonText, false)

  return (
    <div className="place">
      <div className="place-current">
        <strong>{value.name || 'Konum seçilmedi'}</strong>
        <span className="muted">
          {' '}
          {fmtCoord(value.lat, 'K', 'G')} {fmtCoord(value.lon, 'D', 'B')} {value.zone ? `· ${value.zone}` : ''}
        </span>
      </div>
      <input placeholder="Şehir veya ilçe ara… (ör. İzmir, Kadıköy, Londra)" value={q} onChange={(e) => setQ(e.target.value)} />
      {busy && <div className="muted small">Aranıyor…</div>}
      {!busy && q.trim().length >= 2 && results.length === 0 && (
        <div className="muted small">Bulunamadı — koordinat girin veya haritadan seçin.</div>
      )}
      {results.length > 0 && (
        <ul className="place-results">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => {
                  onChange({ name: r.name, lat: r.lat, lon: r.lon, country: r.country, admin: r.admin, zone: r.zone })
                  setQ('')
                  setResults([])
                  setNear('')
                }}
              >
                {r.name}
                <span className="muted small">
                  {' '}
                  {fmtCoord(r.lat, 'K', 'G')} {fmtCoord(r.lon, 'D', 'B')} · {r.zone}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="row">
        <label>
          Yer adı
          <input value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} />
        </label>
        <label className="coord">
          Enlem
          <input
            value={latText}
            placeholder="38n15 · 38°15'K · 38.25"
            onChange={(e) => setLatText(e.target.value)}
            onBlur={() => latParsed !== null && lonParsed !== null && (latParsed !== value.lat || lonParsed !== value.lon) && void setCoord(latParsed, lonParsed, true)}
            className={latParsed === null ? 'invalid' : ''}
          />
          <span className={latParsed === null ? 'error small' : 'muted small'}>{latParsed === null ? 'geçersiz' : fmtDms(latParsed, true)}</span>
        </label>
        <label className="coord">
          Boylam
          <input
            value={lonText}
            placeholder="85w46 · 28°57'D · -85.77"
            onChange={(e) => setLonText(e.target.value)}
            onBlur={() => latParsed !== null && lonParsed !== null && (latParsed !== value.lat || lonParsed !== value.lon) && void setCoord(latParsed, lonParsed, true)}
            className={lonParsed === null ? 'invalid' : ''}
          />
          <span className={lonParsed === null ? 'error small' : 'muted small'}>{lonParsed === null ? 'geçersiz' : fmtDms(lonParsed, false)}</span>
        </label>
      </div>
      <div className="row">
        <button type="button" onClick={() => setShowMap(!showMap)}>
          {showMap ? 'Haritayı gizle' : '🌍 Haritadan seç'}
        </button>
        {near && <span className="muted small">En yakın yerleşim: {near}</span>}
      </div>
      {showMap && <WorldMap lat={value.lat} lon={value.lon} onPick={(la, lo) => void setCoord(la, lo, true)} />}
    </div>
  )
}
