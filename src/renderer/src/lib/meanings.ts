// Composes the built-in (offline, no AI) reading texts from src/shared/meanings.
import { meaningsFor, type MeaningSet } from '@shared/meanings'
import { getLang, t } from './i18n'
import { houseOf, splitDeg, type Aspect, type ChartPoint, type Layer } from './astro'

export const M = (): MeaningSet => meaningsFor(getLang())

/** Points that have built-in texts, in reading order. */
export const READING_POINTS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'node', 'chiron']

const sentence = (s: string) => (s ? s.charAt(0).toLocaleUpperCase(getLang()) + s.slice(1) : s).replace(/[.\s]*$/, '.')

/** "{point} in {sign}" text, or null if there is none for this point. */
export function signText(key: string, lon: number): string | null {
  const m = M()
  const sign = splitDeg(lon).sign
  if (key === 'sun') return m.sunSign[sign]
  if (key === 'moon') return m.moonSign[sign]
  if (key === 'asc') return m.ascSign[sign]
  const p = m.planets[key]
  return p ? sentence(`${p.what} ${m.signs[sign].how}`) : null
}

/** "{point} in house n" text. */
export function houseText(key: string, house: number): string | null {
  const m = M()
  const p = m.planets[key]
  const h = m.houses[house - 1]
  return p && h ? sentence(`${p.subject} ${h.where}`) : null
}

export function aspectText(a: Aspect): { text: string; a: string; b: string } | null {
  const m = M()
  const text = m.aspects[a.aspect.key]
  const pa = m.planets[a.a.key]
  const pb = m.planets[a.b.key]
  return text && pa && pb ? { text, a: pa.keywords, b: pb.keywords } : null
}

/** Texts for a point card: sign and house (the house of the natal chart for outer rings). */
export function pointTexts(point: ChartPoint, layer: Layer, natal: Layer, timeKnown: boolean): string[] {
  const out: string[] = []
  if (layer.kind === 'natal') {
    const s = signText(point.key, point.lon)
    if (s) out.push(s)
    if (timeKnown && !['asc', 'mc'].includes(point.key)) {
      const h = houseText(point.key, point.house)
      if (h) out.push(h)
    }
    if (point.retro && M().planets[point.key] && !['node', 'snode'].includes(point.key)) out.push(M().retro)
  } else if (timeKnown && M().planets[point.key] && !['asc', 'mc'].includes(point.key)) {
    const n = houseOf(point.lon, natal.cusps)
    out.push(t('Natal haritanın {n}. evine düşüyor; {k} konuları öne çıkabilir.', { n, k: M().houses[n - 1].keywords }))
  }
  return out
}
