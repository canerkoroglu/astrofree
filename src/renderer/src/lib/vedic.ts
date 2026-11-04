// Vedic (Jyotish) helpers: nakshatras, navamsa (D9) and Vimshottari dasha.
// All longitudes here are sidereal (Lahiri) — see siderealLahiri().
import type { AppSettings } from '@shared/types'
import { norm360, type Layer } from './astro'

export const LAHIRI = 1 // Swiss Ephemeris SE_SIDM_LAHIRI

// i18n-ignore-start (Sanskrit proper names, the same in every language)
export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu', 'Pushya', 'Ashlesha',
  'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta', 'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha',
  'Mula', 'Purva Ashadha', 'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada', 'Uttara Bhadrapada', 'Revati'
]
// i18n-ignore-end

/** Vimshottari lords in order with their years (total 120). Ketu is the south node. */
export const DASHA: [string, number][] = [
  ['snode', 7],
  ['venus', 20],
  ['sun', 6],
  ['moon', 10],
  ['mars', 7],
  ['node', 18],
  ['jupiter', 16],
  ['saturn', 19],
  ['mercury', 17]
]
const YEAR = 365.25
const NAK = 360 / 27

export function nakshatraOf(lon: number): { index: number; name: string; pada: number; lord: string; frac: number } {
  const l = norm360(lon)
  const index = Math.floor(l / NAK)
  const within = l - index * NAK
  return { index, name: NAKSHATRAS[index], pada: Math.floor(within / (NAK / 4)) + 1, lord: DASHA[index % 9][0], frac: within / NAK }
}

/** Navamsa sign (0 = Aries): each sign is split into nine 3°20′ parts, counted on from Aries. */
export const navamsaSign = (lon: number) => Math.floor(norm360(lon) / (30 / 9)) % 12

/** Sidereal (Lahiri) longitudes of the chart's points, whatever zodiac the chart uses. */
export async function siderealLahiri(natal: Layer, settings: AppSettings): Promise<{ key: string; lon: number }[]> {
  const [r] = await window.astro.compute([{ jdUT: natal.jdUT, lat: 0, lon: 0, houseSystem: 'W', sidMode: LAHIRI, bodies: [0] }])
  const lahiri = r.ayanamsa
  const current = settings.zodiac === 'sidereal' ? natal.ayanamsa : 0
  return natal.points.map((p) => ({ key: p.key, lon: norm360(p.lon + current - lahiri) }))
}

export interface DashaPeriod {
  lord: string
  start: number
  end: number
  subs: { lord: string; start: number; end: number }[]
}

/** Vimshottari mahadashas (with antardashas) from birth for 120 years. */
export function vimshottari(moonSidereal: number, birthJd: number): DashaPeriod[] {
  const n = nakshatraOf(moonSidereal)
  const first = n.index % 9
  // The part of the first dasha already "used up" before birth.
  let start = birthJd - n.frac * DASHA[first][1] * YEAR
  const out: DashaPeriod[] = []
  for (let i = 0; i < 10; i++) {
    const [lord, years] = DASHA[(first + i) % 9]
    const end = start + years * YEAR
    const subs: DashaPeriod['subs'] = []
    let s = start
    for (let j = 0; j < 9; j++) {
      const [sl, sy] = DASHA[(first + i + j) % 9]
      const e = s + ((years * sy) / 120) * YEAR
      subs.push({ lord: sl, start: s, end: e })
      s = e
    }
    out.push({ lord, start, end, subs })
    start = end
  }
  return out
}
