// Place search: an offline GeoNames city database bundled with the app, with
// Open-Meteo geocoding only as a fallback when nothing local matches.
import { app } from 'electron'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { gunzipSync } from 'node:zlib'
import tzlookup from 'tz-lookup'
import type { GeoResult } from '@shared/types'

// [name, ascii, alt names "|"-joined, country code, admin1, lat, lon, tz index, population]
type Row = [string, string, string, string, string, number, number, number, number]

interface CityDb {
  tz: string[]
  rows: Row[]
  keys: string[] // normalized search keys per row, "|"-joined
}

let db: CityDb | null = null

const fold = (s: string) =>
  s
    .toLocaleLowerCase('tr')
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[’']/g, '')
    .trim()

function resourcesDir(): string {
  // Packaged: electron-builder extraResources. Dev: <project>/resources next to out/main.
  return app.isPackaged ? process.resourcesPath : join(__dirname, '../../resources')
}

function loadDb(): CityDb {
  if (db) return db
  const raw = JSON.parse(gunzipSync(readFileSync(join(resourcesDir(), 'cities.json.gz'))).toString('utf8'))
  const rows = raw.rows as Row[]
  db = {
    tz: raw.tz,
    rows,
    keys: rows.map((r) => [r[0], r[1], ...(r[2] ? r[2].split('|') : [])].filter(Boolean).map(fold).join('|'))
  }
  return db
}

const countryNames = new Intl.DisplayNames(['tr'], { type: 'region' })
function countryName(cc: string): string {
  try {
    return countryNames.of(cc) ?? cc
  } catch {
    return cc
  }
}

export function searchOffline(query: string, limit = 15): GeoResult[] {
  const [placePart, ...rest] = query.split(',')
  const q = fold(placePart)
  if (q.length < 2) return []
  const qualifier = fold(rest.join(' '))
  const d = loadDb()
  const scored: { i: number; score: number }[] = []
  for (let i = 0; i < d.rows.length; i++) {
    const keys = d.keys[i]
    const at = keys.indexOf(q)
    if (at < 0) continue
    // Match must start a name (start of string or after a "|"/space).
    const before = at === 0 ? '|' : keys[at - 1]
    if (before !== '|' && before !== ' ' && before !== '-') continue
    const after = keys[at + q.length]
    const exact = (after === undefined || after === '|') && (before === '|' || at === 0)
    const r = d.rows[i]
    if (qualifier) {
      const hay = fold(`${r[4]} ${countryName(r[3])} ${r[3]}`)
      if (!qualifier.split(/\s+/).every((t) => hay.includes(t))) continue
    }
    // Rows are sorted by population, so index order breaks ties.
    scored.push({ i, score: (exact ? 0 : 1) * 1e7 + i })
  }
  scored.sort((a, b) => a.score - b.score)
  return scored.slice(0, limit).map(({ i }) => {
    const r = d.rows[i]
    const country = countryName(r[3])
    return {
      name: [r[0], r[4] && r[4] !== r[0] ? r[4] : undefined, country].filter(Boolean).join(', '),
      lat: r[5],
      lon: r[6],
      country,
      admin: r[4] || undefined,
      zone: d.tz[r[7]],
      population: r[8]
    }
  })
}

/** Closest bundled city to a coordinate, if one lies within maxKm. */
export function nearestPlace(lat: number, lon: number, maxKm = 75): (GeoResult & { km: number }) | null {
  const d = loadDb()
  const r = Math.PI / 180
  let best = -1
  let bestKm = Infinity
  const cosLat = Math.cos(lat * r)
  for (let i = 0; i < d.rows.length; i++) {
    const row = d.rows[i]
    const dLat = row[5] - lat
    if (Math.abs(dLat) > 2) continue
    let dLon = row[6] - lon
    if (dLon > 180) dLon -= 360
    if (dLon < -180) dLon += 360
    const km = 111.2 * Math.sqrt(dLat * dLat + (dLon * cosLat) ** 2)
    if (km < bestKm) {
      bestKm = km
      best = i
    }
  }
  if (best < 0 || bestKm > maxKm) return null
  const row = d.rows[best]
  const country = countryName(row[3])
  return {
    name: [row[0], row[4] && row[4] !== row[0] ? row[4] : undefined, country].filter(Boolean).join(', '),
    lat: row[5],
    lon: row[6],
    country,
    admin: row[4] || undefined,
    zone: d.tz[row[7]],
    km: bestKm
  }
}

interface OpenMeteoPlace {
  name: string
  latitude: number
  longitude: number
  country?: string
  admin1?: string
  timezone?: string
  population?: number
}

async function searchOnline(q: string, lang: string): Promise<GeoResult[]> {
  const url =
    'https://geocoding-api.open-meteo.com/v1/search?count=12&format=json' +
    `&language=${encodeURIComponent(lang)}&name=${encodeURIComponent(q)}`
  const res = await fetch(url, { signal: AbortSignal.timeout(8000) })
  if (!res.ok) throw new Error(`Konum servisi hatası (${res.status})`)
  const data = (await res.json()) as { results?: OpenMeteoPlace[] }
  return (data.results ?? []).map((r) => ({
    name: [r.name, r.admin1 !== r.name ? r.admin1 : undefined, r.country].filter(Boolean).join(', '),
    lat: r.latitude,
    lon: r.longitude,
    country: r.country,
    admin: r.admin1,
    zone: r.timezone || zoneAt(r.latitude, r.longitude) || undefined,
    population: r.population
  }))
}

export async function searchPlaces(query: string, lang: string): Promise<GeoResult[]> {
  const q = query.trim()
  if (q.length < 2) return []
  const local = searchOffline(q)
  if (local.length) return local
  try {
    return await searchOnline(q.split(',')[0], lang)
  } catch {
    return [] // offline and nothing in the bundled list: coordinates can be typed in
  }
}

export function zoneAt(lat: number, lon: number): string | null {
  try {
    return tzlookup(lat, lon)
  } catch {
    return null
  }
}
