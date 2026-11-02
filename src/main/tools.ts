// Ephemeris searches used by the renderer: transit calendar, return charts,
// fixed stars and planetary hours.
import type {
  ElectionRequest,
  ElectionWindow,
  FixedStarPos,
  PlanetaryHours,
  TransitHit,
  TransitSearchRequest
} from '@shared/types'
import { getSwe } from './ephemeris'
import { voidOfCourse } from './events'

const SEFLG_SWIEPH = 2
const SEFLG_SPEED = 256
const SEFLG_SIDEREAL = 65536

const norm = (x: number) => ((x % 360) + 360) % 360
const d180 = (x: number) => {
  const v = norm(x)
  return v > 180 ? v - 360 : v
}

function bisect(a: number, b: number, f: (t: number) => boolean, tol = 1 / 1440): number {
  const fa = f(a)
  while (b - a > tol) {
    const m = (a + b) / 2
    if (f(m) === fa) a = m
    else b = m
  }
  return (a + b) / 2
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function lonFn(swe: any, sidMode: number | null) {
  if (sidMode !== null) swe.set_sid_mode(sidMode, 0, 0)
  const flags = SEFLG_SWIEPH | SEFLG_SPEED | (sidMode !== null ? SEFLG_SIDEREAL : 0)
  return (t: number, body: number): [number, number] => {
    const r = swe.calc_ut(t, body, flags)
    return [r[0], r[3]]
  }
}

/**
 * Every period in which a transiting body is within orb of an aspect to a
 * natal point, with the exact hits inside it (up to three with retrogrades).
 */
export async function transitSearch(req: TransitSearchRequest): Promise<TransitHit[]> {
  const swe = await getSwe()
  const calc = lonFn(swe, req.sidMode)
  const hits: TransitHit[] = []
  const step = 1
  for (const body of req.bodies) {
    // Sample once per day and reuse for every natal point and aspect.
    const ts: number[] = []
    const lons: number[] = []
    const speeds: number[] = []
    for (let t = req.start - step; t <= req.end + step; t += step) {
      const [l, s] = calc(t, body)
      ts.push(t)
      lons.push(l)
      speeds.push(s)
    }
    const lonAt = (t: number) => calc(t, body)[0]
    for (const np of req.natal) {
      for (const asp of req.aspects) {
        const targets = asp.angle === 0 || asp.angle === 180 ? [np.lon + asp.angle] : [np.lon + asp.angle, np.lon - asp.angle]
        for (const target of targets) {
          const g = (l: number) => d180(l - target)
          let inside = false
          let cur: TransitHit | null = null
          for (let i = 1; i < ts.length; i++) {
            const g0 = g(lons[i - 1])
            const g1 = g(lons[i])
            const in1 = Math.abs(g1) <= asp.orb
            if (in1 && !inside) {
              const enter = Math.abs(g0) <= asp.orb ? ts[i - 1] : bisect(ts[i - 1], ts[i], (t) => Math.abs(g(lonAt(t))) <= asp.orb)
              cur = {
                body,
                natalKey: np.key,
                aspect: asp.key,
                start: enter,
                end: req.end,
                exacts: [],
                startsBefore: i === 1 && Math.abs(g0) <= asp.orb
              }
            }
            // Exact hit: sign change of g while near the target (not a ±180 wrap).
            if (cur && Math.sign(g0) !== Math.sign(g1) && Math.abs(g0) < 20 && Math.abs(g1) < 20) {
              const at = bisect(ts[i - 1], ts[i], (t) => g(lonAt(t)) > 0)
              if (at >= req.start && at <= req.end) cur.exacts.push({ jd: at, retro: speeds[i] < 0 })
            }
            if (!in1 && inside && cur) {
              cur.end = bisect(ts[i - 1], ts[i], (t) => Math.abs(g(lonAt(t))) <= asp.orb)
              cur.endsAfter = false
              if (cur.end >= req.start) hits.push(cur)
              cur = null
            }
            inside = in1
          }
          if (cur) {
            cur.endsAfter = true
            hits.push(cur)
          }
        }
      }
    }
  }
  return hits.sort((a, b) => (a.exacts[0]?.jd ?? a.start) - (b.exacts[0]?.jd ?? b.start))
}

/** Next moment after jdStart when `body` reaches `targetLon` (direct motion). */
export async function findReturn(body: number, targetLon: number, jdStart: number, sidMode: number | null): Promise<number | null> {
  const swe = await getSwe()
  const calc = lonFn(swe, sidMode)
  const step = body === 1 ? 0.25 : 1
  const limit = body === 1 ? 35 : 400
  let prev = d180(calc(jdStart, body)[0] - targetLon)
  for (let t = jdStart + step; t <= jdStart + limit; t += step) {
    const g = d180(calc(t, body)[0] - targetLon)
    if (prev < 0 && g >= 0 && Math.abs(g - prev) < 90) {
      return bisect(t - step, t, (x) => d180(calc(x, body)[0] - targetLon) >= 0, 1 / 86400)
    }
    prev = g
  }
  return null
}

export const STAR_NAMES = [
  'Alcyone', 'Aldebaran', 'Algol', 'Algorab', 'Alphard', 'Alphecca', 'Altair', 'Antares', 'Arcturus',
  'Bellatrix', 'Betelgeuse', 'Canopus', 'Capella', 'Castor', 'Deneb Algedi', 'Denebola', 'Fomalhaut',
  'Hamal', 'Markab', 'Pollux', 'Procyon', 'Regulus', 'Rigel', 'Scheat', 'Sirius', 'Spica',
  'Vega', 'Vindemiatrix', 'Zuben Elgenubi', 'Zuben Eschamali', 'Achernar', 'Acrux', 'Polaris'
]

export async function fixedStars(jd: number, sidMode: number | null): Promise<FixedStarPos[]> {
  const swe = await getSwe()
  if (sidMode !== null) swe.set_sid_mode(sidMode, 0, 0)
  const flags = SEFLG_SWIEPH | (sidMode !== null ? SEFLG_SIDEREAL : 0)
  const out: FixedStarPos[] = []
  for (const name of STAR_NAMES) {
    try {
      const r = swe.fixstar_ut(name, jd, flags)
      if (r && Number.isFinite(r[0])) out.push({ name, lon: r[0], lat: r[1] })
    } catch {
      /* star missing from catalogue */
    }
  }
  return out
}

const CHALDEAN = [6, 5, 4, 0, 3, 2, 1] // Saturn, Jupiter, Mars, Sun, Venus, Mercury, Moon
const DAY_RULER = [0, 1, 4, 2, 5, 3, 6] // Sunday..Saturday

/**
 * Planetary hours for the day containing `jd` at a place: 12 unequal hours
 * from sunrise to sunset, 12 from sunset to the next sunrise.
 */
export async function planetaryHours(jd: number, lat: number, lon: number, tzOffsetMin: number): Promise<PlanetaryHours | null> {
  const swe = await getSwe()
  const geo = [lon, lat, 0]
  const rise = (t: number) => swe.rise_trans(t, 0, '', SEFLG_SWIEPH, 1, geo, 0, 0)?.[0] as number | undefined
  const set = (t: number) => swe.rise_trans(t, 0, '', SEFLG_SWIEPH, 2, geo, 0, 0)?.[0] as number | undefined
  // Find the sunrise that starts the current planetary day.
  let sunrise = rise(jd - 1)
  if (sunrise === undefined) return null // polar day/night
  for (let guard = 0; guard < 3; guard++) {
    const next = rise(sunrise + 0.01)
    if (next === undefined || next > jd) break
    sunrise = next
  }
  const sunset = set(sunrise)
  const nextRise = sunset !== undefined ? rise(sunset) : undefined
  if (sunset === undefined || nextRise === undefined) return null
  // Weekday of the sunrise in local civil time.
  const localJd = sunrise + tzOffsetMin / 1440
  const weekday = Math.floor(localJd + 1.5) % 7 // 0 = Sunday
  const dayRuler = DAY_RULER[weekday]
  const start = CHALDEAN.indexOf(dayRuler)
  const hours: PlanetaryHours['hours'] = []
  const dayLen = (sunset - sunrise) / 12
  const nightLen = (nextRise - sunset) / 12
  for (let i = 0; i < 24; i++) {
    const s = i < 12 ? sunrise + i * dayLen : sunset + (i - 12) * nightLen
    const e = i < 12 ? s + dayLen : s + nightLen
    hours.push({ start: s, end: e, ruler: CHALDEAN[(start + i) % 7], night: i >= 12 })
  }
  return { sunrise, sunset, nextSunrise: nextRise, dayRuler, weekday, hours }
}

/**
 * Electional search: windows in which every chosen condition holds, sampled
 * every stepMinutes and merged into continuous spans.
 */
export async function electionalSearch(req: ElectionRequest): Promise<ElectionWindow[]> {
  const swe = await getSwe()
  const calc = lonFn(swe, req.sidMode)
  const lon = (t: number, b: number) => calc(t, b)[0]
  const { cond } = req
  const step = Math.max(5, req.stepMinutes) / 1440

  // Void-of-course spans across the range, found once.
  const voc: { start: number; end: number }[] = []
  if (cond.moonNotVoc) {
    let t = req.start - 3
    for (let guard = 0; guard < 400 && t < req.end; guard++) {
      const v = voidOfCourse(t, lon)
      if (!v) break
      voc.push({ start: v.start, end: v.end })
      t = v.end + 0.05
    }
  }
  const inVoc = (t: number) => voc.some((v) => t >= v.start && t < v.end)

  const ok = (t: number): number | null => {
    const moon = lon(t, 1)
    if (cond.moonSigns.length && !cond.moonSigns.includes(Math.floor(norm(moon) / 30))) return null
    if (cond.moonWaxing && norm(moon - lon(t, 0)) >= 180) return null
    if (cond.moonNotVoc && inVoc(t)) return null
    for (const b of cond.notRetro) if (calc(t, b)[1] < 0) return null
    if (cond.aspect) {
      const sep = Math.abs(d180(lon(t, cond.aspect.a) - lon(t, cond.aspect.b)))
      if (!cond.aspect.aspects.some((a) => Math.abs(sep - a) <= cond.aspect!.orb)) return null
    }
    if (cond.angular) {
      const h = swe.houses_ex(t, req.sidMode !== null ? SEFLG_SIDEREAL : 0, req.lat, req.lon, 'P')
      const p = lon(t, cond.angular.body)
      const near = [h.ascmc[0], h.ascmc[1], h.ascmc[0] + 180, h.ascmc[1] + 180].some((x: number) => Math.abs(d180(p - x)) <= cond.angular!.orb)
      if (!near) return null
    }
    return moon
  }

  const out: ElectionWindow[] = []
  let cur: ElectionWindow | null = null
  for (let t = req.start; t <= req.end; t += step) {
    const m = ok(t)
    if (m !== null) {
      if (!cur) cur = { start: t, end: t, moonLon: m }
      cur.end = t
    } else if (cur) {
      out.push(cur)
      cur = null
      if (out.length >= 300) break
    }
  }
  if (cur) out.push(cur)
  return out
}

/** Longitudes of several bodies sampled over a range (graphic ephemeris). */
export async function ephemSeries(start: number, days: number, stepDays: number, bodies: number[], sidMode: number | null) {
  const swe = await getSwe()
  const calc = lonFn(swe, sidMode)
  const jd: number[] = []
  const lon: Record<number, number[]> = Object.fromEntries(bodies.map((b) => [b, []]))
  for (let t = start; t <= start + days + 1e-9; t += stepDays) {
    jd.push(t)
    for (const b of bodies) lon[b].push(calc(t, b)[0])
  }
  return { jd, lon }
}
