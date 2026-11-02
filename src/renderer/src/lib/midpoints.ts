// Midpoint structures (Ebertin / Uranian): C = A/B when C stands at a multiple
// of 45° from the midpoint of A and B, and harmonic chart transforms.
import { norm360, type ChartPoint, type Layer } from './astro'

export const MIDPOINT_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'asc', 'mc']

export interface MidpointHit {
  c: string
  a: string
  b: string
  /** 0, 45, 90, 135 or 180 */
  angle: number
  orb: number
}

const midpoint = (a: number, b: number) => norm360(a + ((((b - a) % 360) + 540) % 360 - 180) / 2)

export function midpointHits(points: ChartPoint[], maxOrb = 1.5): MidpointHit[] {
  const pts = points.filter((p) => MIDPOINT_KEYS.includes(p.key))
  const out: MidpointHit[] = []
  for (let i = 0; i < pts.length; i++)
    for (let j = i + 1; j < pts.length; j++) {
      const m = midpoint(pts[i].lon, pts[j].lon)
      for (const c of pts) {
        if (c === pts[i] || c === pts[j]) continue
        const d = norm360(c.lon - m)
        const k = Math.round(d / 45)
        const orb = Math.abs(d - k * 45)
        if (orb > maxOrb) continue
        const ang = (k * 45) % 360
        out.push({ c: c.key, a: pts[i].key, b: pts[j].key, angle: ang > 180 ? 360 - ang : ang, orb })
      }
    }
  return out.sort((x, y) => x.orb - y.orb)
}

/** Harmonic chart: every position multiplied by n (cusps too). */
export function harmonicLayer(l: Layer, n: number): Layer {
  if (n === 1) return l
  const h = (x: number) => norm360(x * n)
  return {
    ...l,
    label: `${l.label} · H${n}`,
    asc: h(l.asc),
    mc: h(l.mc),
    cusps: l.cusps.map(h),
    points: l.points.map((p) => ({ ...p, lon: h(p.lon), speed: p.speed * n }))
  }
}
