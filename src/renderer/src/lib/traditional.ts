// Traditional techniques: essential dignities (Egyptian terms, Dorothean
// triplicities, Chaldean faces), almuten, sect, annual profections, firdaria
// and the Hermetic lots.
import { isAboveHorizon, norm360, POINT, splitDeg, type ChartPoint, type Layer } from './astro'

type P = 'sun' | 'moon' | 'mercury' | 'venus' | 'mars' | 'jupiter' | 'saturn'
export const SEVEN: P[] = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn']

const DOMICILE: P[] = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter']
const EXALT: Partial<Record<P, [number, number]>> = {
  sun: [0, 19],
  moon: [1, 3],
  mercury: [5, 15],
  venus: [11, 27],
  mars: [9, 28],
  jupiter: [3, 15],
  saturn: [6, 21]
}
// Dorothean triplicity rulers [day, night, participating] by element.
const TRIPLICITY: Record<string, [P, P, P]> = {
  fire: ['sun', 'jupiter', 'saturn'],
  earth: ['venus', 'moon', 'mars'],
  air: ['saturn', 'mercury', 'jupiter'],
  water: ['venus', 'mars', 'moon']
}
const ELEMENT = ['fire', 'earth', 'air', 'water']
// Egyptian terms: [ruler, end degree] per sign.
const TERMS: [P, number][][] = [
  [['jupiter', 6], ['venus', 12], ['mercury', 20], ['mars', 25], ['saturn', 30]],
  [['venus', 8], ['mercury', 14], ['jupiter', 22], ['saturn', 27], ['mars', 30]],
  [['mercury', 6], ['jupiter', 12], ['venus', 17], ['mars', 24], ['saturn', 30]],
  [['mars', 7], ['venus', 13], ['mercury', 19], ['jupiter', 26], ['saturn', 30]],
  [['jupiter', 6], ['venus', 11], ['saturn', 18], ['mercury', 24], ['mars', 30]],
  [['mercury', 7], ['venus', 17], ['jupiter', 21], ['mars', 28], ['saturn', 30]],
  [['saturn', 6], ['mercury', 14], ['jupiter', 21], ['venus', 28], ['mars', 30]],
  [['mars', 7], ['venus', 11], ['mercury', 19], ['jupiter', 24], ['saturn', 30]],
  [['jupiter', 12], ['venus', 17], ['mercury', 21], ['saturn', 26], ['mars', 30]],
  [['mercury', 7], ['jupiter', 14], ['venus', 22], ['saturn', 26], ['mars', 30]],
  [['mercury', 7], ['venus', 13], ['jupiter', 20], ['mars', 25], ['saturn', 30]],
  [['venus', 12], ['jupiter', 16], ['mercury', 19], ['mars', 28], ['saturn', 30]]
]
// Chaldean order of faces starting with Mars at 0° Aries.
const FACE_ORDER: P[] = ['mars', 'sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter']

export function domicileRuler(sign: number): P {
  return DOMICILE[sign]
}
export function exaltationRuler(sign: number): P | null {
  return (Object.entries(EXALT).find(([, v]) => v![0] === sign)?.[0] as P) ?? null
}
export function tripRulers(sign: number): [P, P, P] {
  return TRIPLICITY[ELEMENT[sign % 4]]
}
export function termRuler(lon: number): P {
  const sign = Math.floor(norm360(lon) / 30)
  const within = norm360(lon) - sign * 30
  return TERMS[sign].find(([, end]) => within < end)?.[0] ?? TERMS[sign][4][0]
}
export function faceRuler(lon: number): P {
  return FACE_ORDER[Math.floor(norm360(lon) / 10) % 7]
}

export interface Dignity {
  key: P
  domicile: boolean
  exaltation: boolean
  triplicity: boolean
  term: boolean
  face: boolean
  detriment: boolean
  fall: boolean
  peregrine: boolean
  score: number
}

/** Lilly-style essential dignity score for one of the seven planets. */
export function essentialDignity(key: P, lon: number, day: boolean): Dignity {
  const sign = splitDeg(lon).sign
  const trip = tripRulers(sign)
  const d = {
    key,
    domicile: DOMICILE[sign] === key,
    exaltation: EXALT[key]?.[0] === sign,
    triplicity: (day ? trip[0] : trip[1]) === key,
    term: termRuler(lon) === key,
    face: faceRuler(lon) === key,
    detriment: DOMICILE[(sign + 6) % 12] === key,
    fall: EXALT[key]?.[0] === (sign + 6) % 12
  }
  const peregrine = !d.domicile && !d.exaltation && !d.triplicity && !d.term && !d.face
  const score =
    (d.domicile ? 5 : 0) + (d.exaltation ? 4 : 0) + (d.triplicity ? 3 : 0) + (d.term ? 2 : 0) + (d.face ? 1 : 0) -
    (d.detriment ? 5 : 0) - (d.fall ? 4 : 0) - (peregrine ? 5 : 0)
  return { ...d, peregrine, score }
}

/** Planet with the most essential dignity at a degree (5/4/3/2/1 points). */
export function almuten(lon: number, day: boolean): { key: P; points: number } {
  const sign = splitDeg(lon).sign
  const pts = new Map<P, number>()
  const addP = (k: P | null, n: number) => k && pts.set(k, (pts.get(k) ?? 0) + n)
  addP(DOMICILE[sign], 5)
  addP(exaltationRuler(sign), 4)
  addP(day ? tripRulers(sign)[0] : tripRulers(sign)[1], 3)
  addP(termRuler(lon), 2)
  addP(faceRuler(lon), 1)
  let best: P = DOMICILE[sign]
  for (const [k, v] of pts) if (v > (pts.get(best) ?? 0)) best = k
  return { key: best, points: pts.get(best) ?? 0 }
}

export function isDayChart(natal: Layer): boolean {
  const sun = natal.points.find((p) => p.key === 'sun')
  return !!sun && isAboveHorizon(sun.lon, natal.asc)
}

/** Planets in sect: diurnal Sun, Jupiter, Saturn; nocturnal Moon, Venus, Mars. */
export function sectInfo(natal: Layer) {
  const day = isDayChart(natal)
  return {
    day,
    luminary: day ? 'sun' : 'moon',
    benefic: day ? 'jupiter' : 'venus',
    malefic: day ? 'saturn' : 'mars',
    contraryBenefic: day ? 'venus' : 'jupiter',
    contraryMalefic: day ? 'mars' : 'saturn'
  }
}

// ---- annual profections ------------------------------------------------------

export function profection(natal: Layer, natalJd: number, jd: number) {
  const age = Math.floor((jd - natalJd) / 365.2422)
  const asc = natal.points.find((p) => p.key === 'asc')
  const ascSign = asc ? splitDeg(asc.lon).sign : 0
  const sign = (((ascSign + age) % 12) + 12) % 12
  const lord = DOMICILE[sign]
  // Monthly profection: one sign per ~30.4 days from the last birthday.
  const sinceBirthday = jd - natalJd - age * 365.2422
  const month = Math.floor(sinceBirthday / (365.2422 / 12))
  const monthSign = (sign + month) % 12
  return { age, house: (((age % 12) + 12) % 12) + 1, sign, lord, monthSign, monthLord: DOMICILE[monthSign] }
}

// ---- firdaria ------------------------------------------------------------------

type FLord = P | 'node' | 'snode'
const FIRDAR_YEARS: Record<FLord, number> = {
  sun: 10, venus: 8, mercury: 13, moon: 9, saturn: 11, jupiter: 12, mars: 7, node: 3, snode: 2
}
const DAY_SEQ: FLord[] = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars', 'node', 'snode']
const NIGHT_SEQ: FLord[] = ['moon', 'saturn', 'jupiter', 'mars', 'sun', 'venus', 'mercury', 'node', 'snode']
const SUB_ORDER: P[] = ['sun', 'venus', 'mercury', 'moon', 'saturn', 'jupiter', 'mars']

export interface FirdarPeriod {
  lord: FLord
  sub: P | null
  start: number
  end: number
}

const YEAR = 365.25

/** Major and sub periods for 75 years from birth. */
export function firdaria(natalJd: number, day: boolean): FirdarPeriod[] {
  const out: FirdarPeriod[] = []
  let t = natalJd
  for (const lord of day ? DAY_SEQ : NIGHT_SEQ) {
    const len = FIRDAR_YEARS[lord] * YEAR
    out.push({ lord, sub: null, start: t, end: t + len })
    if (lord !== 'node' && lord !== 'snode') {
      const startIdx = SUB_ORDER.indexOf(lord)
      for (let i = 0; i < 7; i++) {
        out.push({ lord, sub: SUB_ORDER[(startIdx + i) % 7], start: t + (i * len) / 7, end: t + ((i + 1) * len) / 7 })
      }
    }
    t += len
  }
  return out
}

export function currentFirdar(periods: FirdarPeriod[], jd: number) {
  const major = periods.find((p) => !p.sub && jd >= p.start && jd < p.end) ?? null
  const sub = periods.find((p) => p.sub && jd >= p.start && jd < p.end) ?? null
  return { major, sub }
}

export const firdarName = (k: FLord) => POINT[k]?.name ?? k

// ---- Hermetic lots -------------------------------------------------------------

export interface Lot {
  name: string
  lon: number
  formula: string
}

export function hermeticLots(natal: Layer): Lot[] {
  const g = (k: string) => natal.points.find((p: ChartPoint) => p.key === k)?.lon
  const asc = g('asc')
  const sun = g('sun')
  const moon = g('moon')
  const mer = g('mercury')
  const ven = g('venus')
  const mar = g('mars')
  const jup = g('jupiter')
  const sat = g('saturn')
  if ([asc, sun, moon, mer, ven, mar, jup, sat].some((x) => x === undefined)) return []
  const day = isDayChart(natal)
  // Day formula ASC + a - b; reversed by night.
  const lot = (a: number, b: number) => norm360(asc! + (day ? a - b : b - a))
  const fortune = lot(moon!, sun!)
  const spirit = lot(sun!, moon!)
  return [
    { name: 'Şans (Fortuna)', lon: fortune, formula: 'ASC + Ay − Güneş' },
    { name: 'Ruh (Daimon)', lon: spirit, formula: 'ASC + Güneş − Ay' },
    { name: 'Eros', lon: lot(ven!, spirit), formula: 'ASC + Venüs − Ruh' },
    { name: 'Zorunluluk (Ananke)', lon: lot(fortune, mer!), formula: 'ASC + Şans − Merkür' },
    { name: 'Cesaret (Tolma)', lon: lot(fortune, mar!), formula: 'ASC + Şans − Mars' },
    { name: 'Zafer (Nike)', lon: lot(jup!, spirit), formula: 'ASC + Jüpiter − Ruh' },
    { name: 'Nemesis', lon: lot(fortune, sat!), formula: 'ASC + Şans − Satürn' }
  ]
}
