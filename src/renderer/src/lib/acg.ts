// Astrocartography: where on Earth each planet was on the MC, IC, ASC or DSC
// at the birth moment. Lines are returned in map coordinates (x = lon + 180,
// y = 90 - lat) as SVG path data.
import { norm360, type ChartPoint, type Layer } from './astro'

export const ACG_BODIES = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'snode', 'chiron']
export type AngleKind = 'MC' | 'IC' | 'ASC' | 'DSC'

export interface AcgLine {
  key: string
  angle: AngleKind
  d: string
  /** Points of the line for distance queries (lon, lat). */
  pts: [number, number][]
  label: [number, number]
}

const R = Math.PI / 180
const n180 = (x: number) => {
  const v = norm360(x)
  return v > 180 ? v - 360 : v
}

export function equatorial(p: ChartPoint, eps: number): { ra: number; dec: number } {
  const l = p.lon * R
  const b = p.lat * R
  const e = eps * R
  const dec = Math.asin(Math.sin(b) * Math.cos(e) + Math.cos(b) * Math.sin(e) * Math.sin(l)) / R
  const ra = norm360(Math.atan2(Math.sin(l) * Math.cos(e) - Math.tan(b) * Math.sin(e), Math.cos(l)) / R)
  return { ra, dec }
}

function toPath(pts: [number, number][]): string {
  let d = ''
  let prev: [number, number] | null = null
  for (const p of pts) {
    const x = (p[0] + 180).toFixed(2)
    const y = (90 - p[1]).toFixed(2)
    // Break the path where it wraps around the antimeridian.
    d += (!prev || Math.abs(p[0] - prev[0]) > 180 ? 'M' : 'L') + x + ' ' + y
    prev = p
  }
  return d
}

/** natalLon: geographic longitude of the birth place (east +). */
export function acgLines(natal: Layer, natalLon: number): AcgLine[] {
  const gast = norm360(natal.armc - natalLon) // Greenwich apparent sidereal time, degrees
  const out: AcgLine[] = []
  for (const key of ACG_BODIES) {
    const p = natal.points.find((x) => x.key === key)
    if (!p) continue
    const { ra, dec } = equatorial(p, natal.eps)
    const mcLon = n180(ra - gast)
    for (const [angle, lon] of [
      ['MC', mcLon],
      ['IC', n180(mcLon + 180)]
    ] as [AngleKind, number][]) {
      const pts: [number, number][] = []
      for (let la = -85; la <= 85; la += 5) pts.push([lon, la])
      out.push({ key, angle, d: toPath(pts), pts, label: [lon, angle === 'MC' ? 78 : -78] })
    }
    const asc: [number, number][] = []
    const dsc: [number, number][] = []
    const tanDec = Math.tan(dec * R)
    for (let la = -80; la <= 80; la += 0.5) {
      const x = -Math.tan(la * R) * tanDec
      if (Math.abs(x) > 1) continue
      const h0 = Math.acos(x) / R
      asc.push([n180(ra - h0 - gast), la])
      dsc.push([n180(ra + h0 - gast), la])
    }
    const mid = (a: [number, number][]) => a[Math.floor(a.length * 0.62)] ?? a[0]
    if (asc.length > 1) out.push({ key, angle: 'ASC', d: toPath(asc), pts: asc, label: mid(asc) })
    if (dsc.length > 1) out.push({ key, angle: 'DSC', d: toPath(dsc), pts: dsc, label: mid(dsc) })
  }
  return out
}

/** Great-circle distance in km. */
export function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const dLat = (lat2 - lat1) * R
  const dLon = (lon2 - lon1) * R
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * R) * Math.cos(lat2 * R) * Math.sin(dLon / 2) ** 2
  return 6371 * 2 * Math.asin(Math.min(1, Math.sqrt(a)))
}

/** Lines passing within maxKm of a place, nearest first. */
export function linesNear(lines: AcgLine[], lat: number, lon: number, maxKm = 700) {
  const res: { line: AcgLine; km: number }[] = []
  for (const line of lines) {
    let best = Infinity
    if (line.angle === 'MC' || line.angle === 'IC') {
      const lineLon = line.pts[0][0]
      best = distanceKm(lat, lon, lat, lineLon)
    } else {
      for (const [lo, la] of line.pts) best = Math.min(best, distanceKm(lat, lon, la, lo))
    }
    if (best <= maxKm) res.push({ line, km: best })
  }
  return res.sort((a, b) => a.km - b.km)
}

const TONE: Record<string, 'lum' | 'ben' | 'mal' | 'other'> = {
  sun: 'lum',
  moon: 'lum',
  venus: 'ben',
  jupiter: 'ben',
  mars: 'mal',
  saturn: 'mal'
}
export const acgTone = (key: string) => TONE[key] ?? 'other'
