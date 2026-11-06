// Advanced Vedic tools: Panchang of a moment and Ashtakoota (Guna Milan) matching.
// Longitudes are sidereal (Lahiri). Names are Sanskrit terms, the same in every language.
import { norm360 } from './astro'
import { nakshatraOf } from './vedic'

// i18n-ignore-start (Sanskrit terms)
const TITHI = ['Pratipada', 'Dwitiya', 'Tritiya', 'Chaturthi', 'Panchami', 'Shashthi', 'Saptami', 'Ashtami', 'Navami', 'Dashami', 'Ekadashi', 'Dwadashi', 'Trayodashi', 'Chaturdashi']
const YOGA = [
  'Vishkambha', 'Priti', 'Ayushman', 'Saubhagya', 'Shobhana', 'Atiganda', 'Sukarma', 'Dhriti', 'Shula', 'Ganda', 'Vriddhi', 'Dhruva', 'Vyaghata', 'Harshana',
  'Vajra', 'Siddhi', 'Vyatipata', 'Variyana', 'Parigha', 'Shiva', 'Siddha', 'Sadhya', 'Shubha', 'Shukla', 'Brahma', 'Indra', 'Vaidhriti'
]
const KARANA_MOVABLE = ['Bava', 'Balava', 'Kaulava', 'Taitila', 'Gara', 'Vanija', 'Vishti']
export const VARA_LORD = ['sun', 'moon', 'mars', 'mercury', 'jupiter', 'venus', 'saturn']
// i18n-ignore-end

export interface Panchang {
  tithi: string
  paksha: 'shukla' | 'krishna'
  tithiNo: number
  yoga: string
  karana: string
  nakshatra: string
  pada: number
}

/** Panchang elements from sidereal Sun and Moon longitudes. */
export function panchang(sunSid: number, moonSid: number): Panchang {
  const diff = norm360(moonSid - sunSid)
  const t = Math.floor(diff / 12) // 0..29
  const paksha = t < 15 ? 'shukla' : 'krishna'
  const inPaksha = t % 15
  const tithi = inPaksha === 14 ? (paksha === 'shukla' ? 'Purnima' : 'Amavasya') : TITHI[inPaksha]
  const yoga = YOGA[Math.floor(norm360(sunSid + moonSid) / (360 / 27)) % 27]
  const k = Math.floor(diff / 6) // 0..59
  const karana = k === 0 ? 'Kimstughna' : k === 57 ? 'Shakuni' : k === 58 ? 'Chatushpada' : k === 59 ? 'Naga' : KARANA_MOVABLE[(k - 1) % 7]
  const n = nakshatraOf(moonSid)
  return { tithi, paksha, tithiNo: t + 1, yoga, karana, nakshatra: n.name, pada: n.pada }
}

// ---- Ashtakoota ---------------------------------------------------------------

// Per nakshatra (Ashwini … Revati)
const GANA = 'DMRMDMDDRRMMDRDRDRRMMDRRMMD' // Deva, Manushya, Rakshasa
const NADI = [0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2, 2, 1, 0, 0, 1, 2] // Adi, Madhya, Antya
// Yoni animals: 0 Horse 1 Elephant 2 Sheep 3 Serpent 4 Dog 5 Cat 6 Rat 7 Cow 8 Buffalo 9 Tiger 10 Deer 11 Monkey 12 Mongoose 13 Lion
const YONI = [0, 1, 2, 3, 3, 4, 5, 2, 5, 6, 6, 7, 8, 9, 8, 9, 10, 10, 4, 11, 12, 11, 13, 0, 13, 7, 1]
const YONI_SCORE = [
  [4, 2, 2, 3, 2, 2, 2, 1, 0, 1, 3, 3, 2, 1],
  [2, 4, 3, 3, 2, 2, 2, 2, 3, 1, 2, 3, 2, 0],
  [2, 3, 4, 2, 1, 2, 1, 3, 3, 1, 2, 0, 3, 1],
  [3, 3, 2, 4, 2, 1, 1, 1, 1, 2, 2, 2, 0, 2],
  [2, 2, 1, 2, 4, 2, 1, 2, 2, 1, 0, 2, 1, 1],
  [2, 2, 2, 1, 2, 4, 0, 2, 2, 1, 3, 3, 2, 1],
  [2, 2, 1, 1, 1, 0, 4, 2, 2, 2, 2, 2, 1, 2],
  [1, 2, 3, 1, 2, 2, 2, 4, 3, 0, 3, 2, 2, 1],
  [0, 3, 3, 1, 2, 2, 2, 3, 4, 1, 2, 2, 2, 1],
  [1, 1, 1, 2, 1, 1, 2, 0, 1, 4, 1, 1, 2, 1],
  [3, 2, 2, 2, 0, 3, 2, 3, 2, 1, 4, 2, 2, 1],
  [3, 3, 0, 2, 2, 3, 2, 2, 2, 1, 2, 4, 3, 2],
  [2, 2, 3, 0, 1, 2, 1, 2, 2, 2, 2, 3, 4, 2],
  [1, 0, 1, 2, 1, 1, 2, 1, 1, 1, 1, 2, 2, 4]
]
// Per sign: varna 3 Brahmin, 2 Kshatriya, 1 Vaishya, 0 Shudra
const VARNA = [2, 1, 0, 3, 2, 1, 0, 3, 2, 1, 0, 3]
const SIGN_LORD = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter']
const FRIENDS: Record<string, [string[], string[]]> = {
  // [friends, enemies]; everything else is neutral
  sun: [['moon', 'mars', 'jupiter'], ['venus', 'saturn']],
  moon: [['sun', 'mercury'], []],
  mars: [['sun', 'moon', 'jupiter'], ['mercury']],
  mercury: [['sun', 'venus'], ['moon']],
  jupiter: [['sun', 'moon', 'mars'], ['mercury', 'venus']],
  venus: [['mercury', 'saturn'], ['sun', 'moon']],
  saturn: [['mercury', 'venus'], ['sun', 'moon', 'mars']]
}
const relation = (a: string, b: string) => (FRIENDS[a][0].includes(b) ? 2 : FRIENDS[a][1].includes(b) ? 0 : 1)

/** Vashya group: 0 quadruped, 1 human, 2 water, 3 wild (Leo), 4 insect (Scorpio). */
function vashya(lon: number): number {
  const s = Math.floor(norm360(lon) / 30)
  const deg = norm360(lon) % 30
  if (s === 8) return deg < 15 ? 1 : 0
  if (s === 9) return deg < 15 ? 0 : 2
  return [0, 0, 1, 2, 3, 1, 1, 4, 1, 0, 1, 2][s]
}
const VASHYA_SCORE = [
  [2, 1, 1, 0.5, 1],
  [1, 2, 0.5, 0, 1],
  [1, 0.5, 2, 1, 1],
  [0.5, 0, 1, 2, 0],
  [1, 1, 1, 0, 2]
]
const GANA_SCORE: Record<string, number> = { DD: 6, DM: 6, DR: 1, MD: 5, MM: 6, MR: 0, RD: 1, RM: 0, RR: 6 }

export interface Koota {
  key: 'varna' | 'vashya' | 'tara' | 'yoni' | 'maitri' | 'gana' | 'bhakoot' | 'nadi'
  name: string
  score: number
  max: number
}

/**
 * Ashtakoota matching from the Moons (sidereal). Traditionally `a` is the groom and
 * `b` the bride; Varna, Vashya and Gana depend on that order.
 */
export function ashtakoota(moonA: number, moonB: number): { kootas: Koota[]; total: number } {
  const na = nakshatraOf(moonA).index
  const nb = nakshatraOf(moonB).index
  const sa = Math.floor(norm360(moonA) / 30)
  const sb = Math.floor(norm360(moonB) / 30)
  const tara = (from: number, to: number) => {
    const r = (((to - from + 27) % 27) + 1) % 9
    return ![3, 5, 7].includes(r)
  }
  const tA = tara(nb, na)
  const tB = tara(na, nb)
  const la = SIGN_LORD[sa]
  const lb = SIGN_LORD[sb]
  const maitri = (() => {
    if (la === lb) return 5
    const x = relation(la, lb)
    const y = relation(lb, la)
    const k = [x, y].sort().join('')
    return ({ '22': 5, '12': 4, '11': 3, '02': 1, '01': 0.5, '00': 0 } as Record<string, number>)[k]
  })()
  const d1 = ((sb - sa + 12) % 12) + 1
  const d2 = ((sa - sb + 12) % 12) + 1
  const badBhakoot = [
    [2, 12],
    [5, 9],
    [6, 8]
  ].some(([p, q]) => (d1 === p && d2 === q) || (d1 === q && d2 === p))
  const kootas: Koota[] = [
    { key: 'varna', name: 'Varna', score: VARNA[sa] >= VARNA[sb] ? 1 : 0, max: 1 },
    { key: 'vashya', name: 'Vashya', score: VASHYA_SCORE[vashya(moonA)][vashya(moonB)], max: 2 },
    { key: 'tara', name: 'Tara', score: tA && tB ? 3 : tA || tB ? 1.5 : 0, max: 3 },
    { key: 'yoni', name: 'Yoni', score: YONI_SCORE[YONI[na]][YONI[nb]], max: 4 },
    { key: 'maitri', name: 'Graha Maitri', score: maitri, max: 5 },
    { key: 'gana', name: 'Gana', score: GANA_SCORE[GANA[na] + GANA[nb]], max: 6 },
    { key: 'bhakoot', name: 'Bhakoot', score: badBhakoot ? 0 : 7, max: 7 },
    { key: 'nadi', name: 'Nadi', score: NADI[na] === NADI[nb] ? 0 : 8, max: 8 }
  ]
  return { kootas, total: kootas.reduce((s, k) => s + k.score, 0) }
}
