import { useEffect, useRef, useState } from 'react'
import type { GeoResult, Place } from '@shared/types'
import { fmtCoord } from '../lib/astro'
import { fmtDms, parseCoord } from '../lib/coords'
import WorldMap from './WorldMap'

/** 🇹🇷 from "TR" (regional indicator letters). */
export const flag = (cc?: string) =>
  cc && /^[A-Z]{2}$/i.test(cc) ? String.fromCodePoint(...[...cc.toUpperCase()].map((ch) => 0x1f1e6 + ch.charCodeAt(0) - 65)) : '📍'

/**
 * Place picker: offline city search with keyboard navigation, a card for the
 * chosen place, and a folded "advanced" area for coordinates and the world map.
 */
export default function PlaceSearch({
  value,
  onChange,
  autoFocus = false
}: {
  value: Place
  onChange: (p: Place) => void
  autoFocus?: boolean
}) {
  const [q, setQ] = useState('')
  const [results, setResults] = useState<GeoResult[]>([])
  const [active, setActive] = useState(0)
  const [busy, setBusy] = useState(false)
  const [latText, setLatText] = useState(String(value.lat))
  const [lonText, setLonText] = useState(String(value.lon))
  const [advanced, setAdvanced] = useState(false)
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
        setActive(0)
      } catch {
        setResults([])
      } finally {
        setBusy(false)
      }
    }, 150)
    return () => window.clearTimeout(timer.current)
  }, [q])

  const pick = (r: GeoResult) => {
    onChange({ name: r.name, lat: r.lat, lon: r.lon, country: r.country, cc: r.cc, admin: r.admin, zone: r.zone })
    setQ('')
    setResults([])
    setNear('')
  }

  /** Apply coordinates; name the place after the nearest city when one is close. */
  const setCoord = async (lat: number, lon: number) => {
    const zone = (await window.astro.geo.zone(lat, lon)) ?? value.zone
    const nearest = await window.astro.geo.nearest(lat, lon)
    setNear(nearest ? `${nearest.name} (~${Math.round(nearest.km)} km)` : '')
    const name =
      nearest && nearest.km < 15
        ? nearest.name
        : `${fmtCoord(lat, 'K', 'G')} ${fmtCoord(lon, 'D', 'B')}${nearest ? ` (${nearest.name.split(',')[0]} yakını)` : ''}`
    onChange({ ...value, name, lat, lon, zone: zone ?? undefined, country: nearest?.country ?? value.country, cc: nearest?.cc ?? value.cc })
  }

  const latParsed = parseCoord(latText, true)
  const lonParsed = parseCoord(lonText, false)
  const applyTyped = () =>
    latParsed !== null && lonParsed !== null && (latParsed !== value.lat || lonParsed !== value.lon) && void setCoord(latParsed, lonParsed)

  return (
    <div className="place">
      <div className="place-search">
        <span className="place-icon">⌕</span>
        <input
          autoFocus={autoFocus}
          placeholder="Şehir veya ilçe ara… (İzmir, Kadıköy, Londra)"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => {
            if (!results.length) return
            if (e.key === 'ArrowDown') {
              e.preventDefault()
              setActive((a) => Math.min(results.length - 1, a + 1))
            } else if (e.key === 'ArrowUp') {
              e.preventDefault()
              setActive((a) => Math.max(0, a - 1))
            } else if (e.key === 'Enter') {
              e.preventDefault()
              e.stopPropagation()
              pick(results[active])
            } else if (e.key === 'Escape') {
              e.stopPropagation()
              setQ('')
            }
          }}
        />
        {busy && <span className="muted small">…</span>}
      </div>
      {q.trim().length >= 2 && !busy && results.length === 0 && (
        <div className="muted small">Bulunamadı — aşağıdan koordinat girin veya haritadan seçin.</div>
      )}
      {results.length > 0 && (
        <ul className="place-results">
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" className={i === active ? 'active' : ''} onMouseEnter={() => setActive(i)} onClick={() => pick(r)}>
                <span className="flag">{flag(r.cc)}</span>
                <span className="pr-name">{r.name}</span>
                <span className="muted small">{r.zone}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="place-card">
        <span className="flag big">{flag(value.cc)}</span>
        <div className="pc-body">
          <input className="pc-name" value={value.name} onChange={(e) => onChange({ ...value, name: e.target.value })} title="Yer adı (düzenlenebilir)" />
          <div className="muted small">
            {fmtDms(value.lat, true)} · {fmtDms(value.lon, false)}
            {value.zone ? ` · ${value.zone}` : ''}
          </div>
        </div>
        <button type="button" className="link small" onClick={() => setAdvanced(!advanced)}>
          {advanced ? 'Gizle' : 'Koordinat / harita'}
        </button>
      </div>

      {advanced && (
        <div className="place-adv">
          <div className="row">
            <label className="coord">
              Enlem
              <input
                value={latText}
                placeholder="38n15 · 38°15'K · 38.25"
                onChange={(e) => setLatText(e.target.value)}
                onBlur={applyTyped}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyTyped())}
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
                onBlur={applyTyped}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), applyTyped())}
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
          {showMap && <WorldMap lat={value.lat} lon={value.lon} onPick={(la, lo) => void setCoord(la, lo)} />}
        </div>
      )}
    </div>
  )
}
