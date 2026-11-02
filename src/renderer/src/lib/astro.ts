// Astrological reference data and pure calculations on top of raw ephemeris.
import type { AppSettings, AspectKey, EphemResult } from '@shared/types'
import { getLang } from './i18n'

/** Text presentation selector: keeps zodiac glyphs from rendering as emoji. */
const T = '︎'

export interface PointDef {
  key: string
  name: string
  short: string
  glyph: string
  swe?: number
  kind: 'luminary' | 'planet' | 'node' | 'minor' | 'angle' | 'calc'
  /** Multiplier applied to aspect orbs involving this point. */
  orbFactor: number
  aspects: boolean
}

export const POINTS: PointDef[] = [
  { key: 'sun', name: 'Güneş', short: 'Gün', glyph: '☉', swe: 0, kind: 'luminary', orbFactor: 1.15, aspects: true },
  { key: 'moon', name: 'Ay', short: 'Ay', glyph: '☽', swe: 1, kind: 'luminary', orbFactor: 1.15, aspects: true },
  { key: 'mercury', name: 'Merkür', short: 'Mer', glyph: '☿', swe: 2, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'venus', name: 'Venüs', short: 'Ven', glyph: '♀', swe: 3, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'mars', name: 'Mars', short: 'Mar', glyph: '♂', swe: 4, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'jupiter', name: 'Jüpiter', short: 'Jüp', glyph: '♃', swe: 5, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'saturn', name: 'Satürn', short: 'Sat', glyph: '♄', swe: 6, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'uranus', name: 'Uranüs', short: 'Ura', glyph: '♅', swe: 7, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'neptune', name: 'Neptün', short: 'Nep', glyph: '♆', swe: 8, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'pluto', name: 'Plüton', short: 'Plü', glyph: '♇', swe: 9, kind: 'planet', orbFactor: 1, aspects: true },
  { key: 'node', name: 'Kuzey Ay Düğümü', short: 'KAD', glyph: '☊', kind: 'node', orbFactor: 0.6, aspects: true },
  { key: 'snode', name: 'Güney Ay Düğümü', short: 'GAD', glyph: '☋', kind: 'node', orbFactor: 0.6, aspects: false },
  { key: 'chiron', name: 'Chiron', short: 'Chi', glyph: '⚷', swe: 15, kind: 'minor', orbFactor: 0.6, aspects: true },
  { key: 'lilith', name: 'Lilith (Kara Ay)', short: 'Lil', glyph: '⚸', kind: 'minor', orbFactor: 0.5, aspects: true },
  { key: 'ceres', name: 'Ceres', short: 'Cer', glyph: '⚳', swe: 17, kind: 'minor', orbFactor: 0.5, aspects: true },
  { key: 'pallas', name: 'Pallas', short: 'Pal', glyph: '⚴', swe: 18, kind: 'minor', orbFactor: 0.5, aspects: true },
  { key: 'juno', name: 'Juno', short: 'Jun', glyph: '⚵', swe: 19, kind: 'minor', orbFactor: 0.5, aspects: true },
  { key: 'vesta', name: 'Vesta', short: 'Ves', glyph: '⚶', swe: 20, kind: 'minor', orbFactor: 0.5, aspects: true },
  { key: 'fortune', name: 'Şans Noktası', short: 'Fort', glyph: '⊗', kind: 'calc', orbFactor: 0.5, aspects: false },
  { key: 'vertex', name: 'Vertex', short: 'Vx', glyph: 'Vx', kind: 'calc', orbFactor: 0.5, aspects: false },
  { key: 'asc', name: 'Yükselen (ASC)', short: 'ASC', glyph: 'AC', kind: 'angle', orbFactor: 1, aspects: true },
  { key: 'mc', name: 'Tepe Noktası (MC)', short: 'MC', glyph: 'MC', kind: 'angle', orbFactor: 1, aspects: true }
]

const POINT_EN: Record<string, [string, string]> = {
  sun: ['Sun', 'Sun'],
  moon: ['Moon', 'Moo'],
  mercury: ['Mercury', 'Mer'],
  venus: ['Venus', 'Ven'],
  mars: ['Mars', 'Mar'],
  jupiter: ['Jupiter', 'Jup'],
  saturn: ['Saturn', 'Sat'],
  uranus: ['Uranus', 'Ura'],
  neptune: ['Neptune', 'Nep'],
  pluto: ['Pluto', 'Plu'],
  node: ['North Node', 'NN'],
  snode: ['South Node', 'SN'],
  chiron: ['Chiron', 'Chi'],
  lilith: ['Lilith (Black Moon)', 'Lil'],
  ceres: ['Ceres', 'Cer'],
  pallas: ['Pallas', 'Pal'],
  juno: ['Juno', 'Jun'],
  vesta: ['Vesta', 'Ves'],
  fortune: ['Part of Fortune', 'PoF'],
  vertex: ['Vertex', 'Vx'],
  asc: ['Ascendant (ASC)', 'ASC'],
  mc: ['Midheaven (MC)', 'MC']
}
// Names follow the UI language; every caller reads p.name / p.short.
for (const p of POINTS) {
  const tr = { name: p.name, short: p.short }
  Object.defineProperty(p, 'name', { enumerable: true, get: () => (getLang() === 'en' ? POINT_EN[p.key]?.[0] ?? tr.name : tr.name) })
  Object.defineProperty(p, 'short', { enumerable: true, get: () => (getLang() === 'en' ? POINT_EN[p.key]?.[1] ?? tr.short : tr.short) })
}

export const POINT = Object.fromEntries(POINTS.map((p) => [p.key, p])) as Record<string, PointDef>
export const glyph = (key: string) => {
  const g = POINT[key]?.glyph ?? key
  return g.length === 1 ? g + T : g
}

/** Optional points the user can switch on/off; the rest are always shown. */
export const OPTIONAL_POINTS = ['chiron', 'lilith', 'snode', 'fortune', 'vertex', 'ceres', 'pallas', 'juno', 'vesta']

export const SIGNS = [
  { name: 'Koç', glyph: '♈', element: 'fire', mode: 'cardinal' },
  { name: 'Boğa', glyph: '♉', element: 'earth', mode: 'fixed' },
  { name: 'İkizler', glyph: '♊', element: 'air', mode: 'mutable' },
  { name: 'Yengeç', glyph: '♋', element: 'water', mode: 'cardinal' },
  { name: 'Aslan', glyph: '♌', element: 'fire', mode: 'fixed' },
  { name: 'Başak', glyph: '♍', element: 'earth', mode: 'mutable' },
  { name: 'Terazi', glyph: '♎', element: 'air', mode: 'cardinal' },
  { name: 'Akrep', glyph: '♏', element: 'water', mode: 'fixed' },
  { name: 'Yay', glyph: '♐', element: 'fire', mode: 'mutable' },
  { name: 'Oğlak', glyph: '♑', element: 'earth', mode: 'cardinal' },
  { name: 'Kova', glyph: '♒', element: 'air', mode: 'fixed' },
  { name: 'Balık', glyph: '♓', element: 'water', mode: 'mutable' }
] as const

const SIGN_EN = ['Aries', 'Taurus', 'Gemini', 'Cancer', 'Leo', 'Virgo', 'Libra', 'Scorpio', 'Sagittarius', 'Capricorn', 'Aquarius', 'Pisces']
SIGNS.forEach((sg, i) => {
  const tr = sg.name
  Object.defineProperty(sg, 'name', { enumerable: true, get: () => (getLang() === 'en' ? SIGN_EN[i] : tr) })
})

export const signGlyph = (i: number) => SIGNS[i].glyph + T
export const ELEMENT_TR = { fire: 'Ateş', earth: 'Toprak', air: 'Hava', water: 'Su' } as const
export const MODE_TR = { cardinal: 'Öncü', fixed: 'Sabit', mutable: 'Değişken' } as const

export interface AspectDef {
  key: AspectKey
  angle: number
  name: string
  glyph: string
  kind: 'hard' | 'soft' | 'minor'
}

export const ASPECTS: AspectDef[] = [
  { key: 'conjunction', angle: 0, name: 'Kavuşum', glyph: '☌', kind: 'hard' },
  { key: 'opposition', angle: 180, name: 'Karşıt', glyph: '☍', kind: 'hard' },
  { key: 'trine', angle: 120, name: 'Üçgen', glyph: '△', kind: 'soft' },
  { key: 'square', angle: 90, name: 'Kare', glyph: '□', kind: 'hard' },
  { key: 'sextile', angle: 60, name: 'Sekstil', glyph: '⚹', kind: 'soft' },
  { key: 'quincunx', angle: 150, name: 'Quincunx', glyph: '⚻', kind: 'minor' },
  { key: 'semisextile', angle: 30, name: 'Yarım sekstil', glyph: '⚺', kind: 'minor' },
  { key: 'semisquare', angle: 45, name: 'Yarım kare', glyph: '∠', kind: 'minor' },
  { key: 'sesquiquadrate', angle: 135, name: 'Seskikare', glyph: '⚼', kind: 'minor' },
  { key: 'quintile', angle: 72, name: 'Kuintil', glyph: 'Q', kind: 'minor' },
  { key: 'biquintile', angle: 144, name: 'Bikuintil', glyph: 'bQ', kind: 'minor' }
]
const ASPECT_EN: Record<AspectKey, string> = {
  conjunction: 'Conjunction',
  opposition: 'Opposition',
  trine: 'Trine',
  square: 'Square',
  sextile: 'Sextile',
  quincunx: 'Quincunx',
  semisextile: 'Semi-sextile',
  semisquare: 'Semi-square',
  sesquiquadrate: 'Sesquiquadrate',
  quintile: 'Quintile',
  biquintile: 'Biquintile'
}
for (const a of ASPECTS) {
  const tr = a.name
  Object.defineProperty(a, 'name', { enumerable: true, get: () => (getLang() === 'en' ? ASPECT_EN[a.key] : tr) })
}
export const ASPECT = Object.fromEntries(ASPECTS.map((a) => [a.key, a])) as Record<AspectKey, AspectDef>

export const HOUSE_SYSTEMS: [string, string][] = [
  ['P', 'Placidus'],
  ['K', 'Koch'],
  ['W', 'Tam Burç (Whole Sign)'],
  ['E', 'Eşit (ASC)'],
  ['O', 'Porphyry'],
  ['R', 'Regiomontanus'],
  ['C', 'Campanus'],
  ['T', 'Topocentric'],
  ['B', 'Alcabitius'],
  ['M', 'Morinus'],
  ['X', 'Meridyen']
]

export const AYANAMSAS: [number, string][] = [
  [1, 'Lahiri'],
  [0, 'Fagan/Bradley'],
  [3, 'Raman'],
  [5, 'Krishnamurti'],
  [7, 'Yukteshwar'],
  [27, 'True Citra'],
  [17, 'Galaktik Merkez 0° Yay']
]

// ---- math --------------------------------------------------------------------

export const norm360 = (x: number) => ((x % 360) + 360) % 360
/** Signed difference a-b folded into (-180, 180]. */
export const diff180 = (a: number, b: number) => {
  const d = norm360(a - b)
  return d > 180 ? d - 360 : d
}

export function splitDeg(lon: number) {
  const l = norm360(lon)
  let sign = Math.floor(l / 30)
  let totalSec = Math.round((l - sign * 30) * 3600)
  if (totalSec >= 30 * 3600) {
    totalSec -= 30 * 3600
    sign = (sign + 1) % 12
  }
  const deg = Math.floor(totalSec / 3600)
  const min = Math.floor((totalSec % 3600) / 60)
  return { sign, deg, min, sec: totalSec % 60 }
}

const p2 = (n: number) => String(n).padStart(2, '0')

/** 27°♑17' (or with seconds). */
export function fmtPos(lon: number, seconds = false): string {
  const s = splitDeg(lon)
  return `${s.deg}°${signGlyph(s.sign)}${p2(s.min)}'${seconds ? p2(s.sec) + '"' : ''}`
}

/** 27°17' Oğlak — for prompts and screen readers. */
export function fmtPosText(lon: number): string {
  const s = splitDeg(lon)
  return `${s.deg}°${p2(s.min)}' ${SIGNS[s.sign].name}`
}

export function fmtOrb(orb: number): string {
  const a = Math.abs(orb)
  const d = Math.floor(a)
  const m = Math.round((a - d) * 60)
  return m === 60 ? `${d + 1}°00'` : `${d}°${p2(m)}'`
}

export function fmtDecl(decl: number): string {
  const a = Math.abs(decl)
  const d = Math.floor(a)
  const m = Math.round((a - d) * 60)
  return `${decl < 0 ? 'G' : 'K'} ${d}°${p2(m)}'`
}

export function fmtCoord(v: number, pos: string, neg: string): string {
  const a = Math.abs(v)
  const d = Math.floor(a)
  const m = Math.round((a - d) * 60)
  return `${d}${v >= 0 ? pos : neg}${p2(m)}`
}

// ---- chart layers ------------------------------------------------------------

export type LayerKind = 'natal' | 'transit' | 'progressed' | 'solarArc' | 'synastry' | 'solarReturn' | 'lunarReturn'

export interface ChartPoint {
  key: string
  lon: number
  lat: number
  speed: number
  decl: number
  retro: boolean
  /** House in the chart's own cusps. */
  house: number
}

export interface Layer {
  kind: LayerKind
  label: string
  jdUT: number
  points: ChartPoint[]
  cusps: number[]
  asc: number
  mc: number
  armc: number
  eps: number
  ayanamsa: number
}

export function houseOf(lon: number, cusps: number[]): number {
  if (cusps.length !== 12) return 0
  for (let i = 0; i < 12; i++) {
    const a = cusps[i]
    const b = cusps[(i + 1) % 12]
    const span = norm360(b - a)
    if (norm360(lon - a) < span) return i + 1
  }
  return 1
}

/** Swiss Ephemeris body ids to request for the current settings. */
export function bodiesFor(settings: AppSettings): number[] {
  const ids = POINTS.filter((p) => p.swe !== undefined && (!OPTIONAL_POINTS.includes(p.key) || settings.points[p.key]))
    .map((p) => p.swe as number)
  ids.push(settings.nodeType === 'true' ? 11 : 10)
  if (settings.points.lilith) ids.push(settings.lilithType === 'true' ? 13 : 12)
  return ids
}

const SWE_TO_KEY: Record<number, string> = {
  10: 'node',
  11: 'node',
  12: 'lilith',
  13: 'lilith',
  ...Object.fromEntries(POINTS.filter((p) => p.swe !== undefined).map((p) => [p.swe, p.key]))
}

export function buildLayer(kind: LayerKind, label: string, r: EphemResult, settings: AppSettings): Layer {
  const pts: ChartPoint[] = []
  const mk = (key: string, lon: number, lat = 0, speed = 0, decl = 0): ChartPoint => ({
    key,
    lon: norm360(lon),
    lat,
    speed,
    decl,
    retro: false,
    house: houseOf(norm360(lon), r.cusps)
  })
  for (const b of r.bodies) {
    const key = SWE_TO_KEY[b.id]
    if (!key) continue
    pts.push(mk(key, b.lon, b.lat, b.speed, b.decl))
  }
  const node = pts.find((p) => p.key === 'node')
  if (node && settings.points.snode) pts.push(mk('snode', node.lon + 180, -node.lat, node.speed, -node.decl))

  const sun = pts.find((p) => p.key === 'sun')
  const moon = pts.find((p) => p.key === 'moon')
  if (settings.points.fortune && sun && moon && r.cusps.length === 12) {
    const dayChart = sun.house >= 7
    pts.push(mk('fortune', dayChart ? r.asc + moon.lon - sun.lon : r.asc + sun.lon - moon.lon))
  }
  if (settings.points.vertex && r.cusps.length === 12) pts.push(mk('vertex', r.vertex))
  if (r.cusps.length === 12) {
    pts.push(mk('asc', r.asc, 0, 360.98))
    pts.push(mk('mc', r.mc, 0, 360.98))
  }
  // Order like the POINTS table so tables and lists are stable.
  const order = Object.fromEntries(POINTS.map((p, i) => [p.key, i]))
  pts.sort((a, b) => order[a.key] - order[b.key])
  for (const p of pts) p.retro = p.speed < 0 && !['node', 'snode', 'lilith', 'asc', 'mc'].includes(p.key)
  return { kind, label, jdUT: r.jdUT, points: pts, cusps: r.cusps, asc: r.asc, mc: r.mc, armc: r.armc, eps: r.eps, ayanamsa: r.ayanamsa }
}

/** Shift a layer by a fixed arc (solar arc directions). */
export function shiftLayer(base: Layer, arc: number, kind: LayerKind, label: string, jdUT: number, speed: number): Layer {
  const cusps = base.cusps.map((c) => norm360(c + arc))
  return {
    ...base,
    kind,
    label,
    jdUT,
    cusps,
    asc: norm360(base.asc + arc),
    mc: norm360(base.mc + arc),
    points: base.points.map((p) => ({ ...p, lon: norm360(p.lon + arc), speed, retro: false, house: houseOf(norm360(p.lon + arc), base.cusps) }))
  }
}

/** Right ascension of an ecliptic longitude (latitude 0). */
export function eclToRa(lon: number, eps: number): number {
  const r = Math.PI / 180
  return norm360(Math.atan2(Math.sin(lon * r) * Math.cos(eps * r), Math.cos(lon * r)) / r)
}

// ---- aspects -------------------------------------------------------------------

export interface Aspect {
  a: ChartPoint
  b: ChartPoint
  aspect: AspectDef
  /** Distance from exact, degrees (always ≥ 0). */
  orb: number
  applying: boolean
}

/**
 * Aspects between two point lists. With `inner` null, aspects within `outer`.
 * With `inner` given, the inner (natal) points are treated as fixed.
 */
export function findAspects(outer: ChartPoint[], inner: ChartPoint[] | null, settings: AppSettings, outerOrbs: boolean): Aspect[] {
  const out: Aspect[] = []
  const enabled = ASPECTS.filter((a) => settings.aspects[a.key]?.enabled)
  const usable = (p: ChartPoint) => POINT[p.key]?.aspects
  const A = outer.filter(usable)
  const B = (inner ?? outer).filter(usable)
  for (let i = 0; i < A.length; i++) {
    for (let j = inner ? 0 : i + 1; j < B.length; j++) {
      const a = A[i]
      const b = B[j]
      if (!inner && ((a.key === 'asc' && b.key === 'mc') || (a.key === 'mc' && b.key === 'asc'))) continue
      const d = diff180(a.lon, b.lon)
      const sep = Math.abs(d)
      const factor = (POINT[a.key].orbFactor + POINT[b.key].orbFactor) / 2
      for (const asp of enabled) {
        const s = settings.aspects[asp.key]
        const allowed = (outerOrbs ? s.outerOrb : s.orb) * (outerOrbs ? Math.min(1, factor) : factor)
        const orb = sep - asp.angle
        if (Math.abs(orb) <= allowed) {
          const rel = a.speed - (inner ? 0 : b.speed)
          const rate = Math.sign(d || 1) * rel
          const applying = orb === 0 ? false : Math.sign(orb) * rate < 0
          out.push({ a, b, aspect: asp, orb: Math.abs(orb), applying })
          break
        }
      }
    }
  }
  return out.sort((x, y) => x.orb - y.orb)
}

// ---- dignities and balance ---------------------------------------------------

const RULERS = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter']
const MODERN_RULERS: Record<number, string> = { 7: 'pluto', 10: 'uranus', 11: 'neptune' }
const EXALT: Record<string, number> = { sun: 0, moon: 1, mercury: 5, venus: 11, mars: 9, jupiter: 3, saturn: 6 }

export function rulerOf(sign: number, modern = true): string {
  return (modern && MODERN_RULERS[sign]) || RULERS[sign]
}

export function dignity(key: string, sign: number): string {
  if (RULERS[sign] === key || MODERN_RULERS[sign] === key) return 'Yönetici'
  if (EXALT[key] === sign) return 'Yücelim'
  const opp = (sign + 6) % 12
  if (RULERS[opp] === key || MODERN_RULERS[opp] === key) return 'Zarar'
  if (EXALT[key] === opp) return 'Düşüş'
  return ''
}

const BALANCE_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto', 'asc', 'mc']

export function balance(points: ChartPoint[]) {
  const el = { fire: 0, earth: 0, air: 0, water: 0 }
  const mo = { cardinal: 0, fixed: 0, mutable: 0 }
  for (const p of points) {
    if (!BALANCE_KEYS.includes(p.key)) continue
    const s = SIGNS[splitDeg(p.lon).sign]
    el[s.element]++
    mo[s.mode]++
  }
  return { elements: el, modes: mo }
}

export function moonPhase(sunLon: number, moonLon: number): { angle: number; name: string } {
  const angle = norm360(moonLon - sunLon)
  const names =
    getLang() === 'en'
      ? ['New Moon', 'Waxing Crescent', 'First Quarter', 'Waxing Gibbous', 'Full Moon', 'Disseminating', 'Last Quarter', 'Balsamic Moon']
      : ['Yeni Ay', 'Hilal', 'İlk Dördün', 'Şişkin Ay', 'Dolunay', 'Yayılan Ay', 'Son Dördün', 'Balzamik Ay']
  return { angle, name: names[Math.floor(angle / 45) % 8] }
}
