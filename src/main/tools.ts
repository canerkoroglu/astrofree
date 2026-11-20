// Ephemeris searches used by the renderer: transit calendar, return charts,
// fixed stars and planetary hours.
import type {
  ElectionRequest,
  DayFact,
  ElectionWindow,
  FixedStarPos,
  LunarPhase,
  MoonStay,
  NightSky,
  NightBody,
  PlanetaryHours,
  RectifyContact,
  RectifyRequest,
  RectifyResult,
  TimingFacts,
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

/**
 * The void-of-course search asks for the same moments again and again (the Moon against nine
 * bodies and five aspects on one 0.1-day grid): remember each longitude once.
 */
function memoLon(lon: (t: number, b: number) => number): (t: number, b: number) => number {
  const seen = new Map<string, number>()
  return (t, b) => {
    const k = `${b}|${t}`
    let v = seen.get(k)
    if (v === undefined) seen.set(k, (v = lon(t, b)))
    return v
  }
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

/** The Moon's sign stays from jd over `days`, each with the time it turns void of course. */
export async function moonStays(jd: number, days: number, sidMode: number | null): Promise<MoonStay[]> {
  const swe = await getSwe()
  const calc = lonFn(swe, sidMode)
  const lon = (t: number, b: number) => calc(t, b)[0]
  const vocLon = memoLon(lon)
  const sign = (t: number) => Math.floor(norm(lon(t, 1)) / 30)
  const out: MoonStay[] = []
  let start = jd
  let s = sign(jd)
  for (let t = jd + 0.1; start < jd + days; t += 0.1) {
    if (sign(t) === s) continue
    const end = bisect(t - 0.1, t, (x) => sign(x) !== s)
    const v = voidOfCourse(end - 0.2, vocLon)
    out.push({ start, end, sign: s, voc: Math.max(v?.start ?? end, start) })
    start = end
    s = sign(t)
  }
  return out
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
  const vocLon = memoLon(lon)
  const voc: { start: number; end: number }[] = []
  if (cond.moonNotVoc) {
    let t = req.start - 3
    for (let guard = 0; guard < 400 && t < req.end; guard++) {
      const v = voidOfCourse(t, vocLon)
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

const DAY_HOURS = Array.from({ length: 14 }, (_, i) => 8 + i) // 08:00 … 21:00 local
const TIMING_RETRO = [2, 3, 4] // Mercury, Venus, Mars

/**
 * Facts for timing questions over a longer range than the chart's "coming days":
 * per local day the Moon's sign and phase, its void-of-course-free daytime hours
 * and which of Mercury, Venus and Mars are retrograde; plus stations and eclipses.
 * `dayStart` is local midnight of the first day as a UT Julian day (one offset for
 * the whole range: close enough for daytime hours across a DST change).
 */
export async function timingFacts(dayStart: number, days: number, sidMode: number | null): Promise<TimingFacts> {
  const swe = await getSwe()
  const calc = lonFn(swe, sidMode)
  const lon = (t: number, b: number) => calc(t, b)[0]
  const lonMemo = memoLon(lon)
  const n = Math.max(1, Math.min(Math.round(days), 560))
  const end = dayStart + n

  const voc: { start: number; end: number }[] = []
  let t = dayStart - 3
  for (let guard = 0; guard < 600 && t < end; guard++) {
    const v = voidOfCourse(t, lonMemo)
    if (!v) break
    if (v.start < v.end) voc.push({ start: v.start, end: v.end })
    t = v.end + 0.05
  }
  let vi = 0
  const inVoc = (x: number) => {
    while (vi < voc.length && voc[vi].end <= x) vi++
    return vi < voc.length && x >= voc[vi].start && x < voc[vi].end
  }

  const out: DayFact[] = []
  for (let d = 0; d < n; d++) {
    const midnight = dayStart + d
    const noon = midnight + 0.5
    const free = DAY_HOURS.filter((h) => !inVoc(midnight + h / 24))
    out.push({
      jd: noon,
      moonLon: lon(noon, 1),
      elong: norm(lon(noon, 1) - lon(noon, 0)),
      freeHours: free.length,
      freeFrom: free.length ? free[0] : null,
      freeTo: free.length ? free[free.length - 1] + 1 : null,
      retro: TIMING_RETRO.filter((b) => calc(noon, b)[1] < 0)
    })
  }

  const stations: TimingFacts['stations'] = []
  for (const b of TIMING_RETRO) {
    let prev = calc(dayStart - 120, b)[1]
    // From well before the range to well after it, so periods it cuts through get both ends.
    for (let x = dayStart - 119; x <= end + 120; x += 1) {
      const cur = calc(x, b)[1]
      if (prev < 0 !== cur < 0) stations.push({ jd: bisect(x - 1, x, (y) => calc(y, b)[1] < 0), body: b, retro: cur < 0 })
      prev = cur
    }
  }
  stations.sort((a, b) => a.jd - b.jd)

  const eclipses: TimingFacts['eclipses'] = []
  for (const solar of [true, false]) {
    let x = dayStart - 15
    for (let guard = 0; guard < 6; guard++) {
      const r = solar ? swe.sol_eclipse_when_glob(x, SEFLG_SWIEPH, 0, 0) : swe.lun_eclipse_when(x, SEFLG_SWIEPH, 0, 0)
      const at = r?.tret?.[0]
      if (!at || at > end + 15) break
      eclipses.push({ jd: at, solar })
      x = at + 20
    }
  }
  eclipses.sort((a, b) => a.jd - b.jd)
  return { days: out, stations, eclipses }
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

/** Exact new, first-quarter, full and last-quarter Moons from jd over `days`. */
export async function lunarPhases(jd: number, days: number): Promise<LunarPhase[]> {
  const swe = await getSwe()
  const calc = lonFn(swe, null)
  const elong = (t: number) => norm(calc(t, 1)[0] - calc(t, 0)[0])
  const out: LunarPhase[] = []
  const end = jd + Math.min(days, 800)
  let prev = Math.floor(elong(jd) / 90)
  for (let t = jd + 0.25; t <= end; t += 0.25) {
    const q = Math.floor(elong(t) / 90)
    if (q !== prev) {
      // The quarter boundary crossed in this step (the elongation wraps at 360).
      const at = bisect(t - 0.25, t, (x) => Math.floor(elong(x) / 90) === q)
      out.push({ jd: at, phase: q as LunarPhase['phase'] })
      prev = q
    }
  }
  return out
}

const SE_CALC_RISE = 1
const SE_CALC_SET = 2
const SE_BIT_ASTRO_TWILIGHT = 4096
const SEFLG_EQUATORIAL = 2048
const NIGHT_BODIES = [1, 2, 3, 4, 5, 6] // Moon, Mercury, Venus, Mars, Jupiter, Saturn

/**
 * swe_pheno_ut with a correctly sized result buffer. The swisseph-wasm wrapper allocates
 * 8 doubles, but the C function writes 20 (and takes an error buffer the wrapper leaves out),
 * which corrupts the WASM heap and later fails with "memory access out of bounds".
 * Returns [phase angle, lit fraction, elongation, apparent diameter, magnitude, …] or null.
 */
function phenoUt(swe: Awaited<ReturnType<typeof getSwe>>, jd: number, body: number, flags: number): Float64Array | null {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const M = (swe as any).SweModule
  const attr = M._malloc(20 * 8)
  const serr = M._malloc(256)
  try {
    const ret = M.ccall('swe_pheno_ut', 'number', ['number', 'number', 'number', 'pointer', 'pointer'], [jd, body, flags, attr, serr])
    return ret < 0 ? null : new Float64Array(M.HEAPF64.buffer, attr, 20).slice()
  } finally {
    M._free(attr)
    M._free(serr)
  }
}

/**
 * Tonight's sky at a place: twilight times, when each naked-eye planet is up in a dark
 * enough sky and where to look, close pairs, and the next eclipses seen from there.
 * "Tonight" is the night after the sunset that ends the day containing `jd`
 * (or the night now under way).
 */
export async function nightSky(jd: number, lat: number, lon: number, sidMode: number | null): Promise<NightSky> {
  const swe = await getSwe()
  const geo = [lon, lat, 0]
  const rt = (t: number, body: number, flag: number) => {
    const r = swe.rise_trans(t, body, '', SEFLG_SWIEPH, flag, geo, 0, 0)?.[0] as number | undefined
    return r && r > 0 ? r : null
  }
  const hor = (t: number, body: number) => {
    const e = swe.calc_ut(t, body, SEFLG_SWIEPH)
    const a = swe.azalt(t, 0, geo, 0, 0, [e[0], e[1], e[2]])
    return { alt: a.apparentAltitude as number, az: norm((a.azimuth as number) + 180) }
  }
  // Night now under way, or the coming one.
  const sunNow = hor(jd, 0).alt
  let sunset = sunNow < -0.8 ? rt(jd - 1, 0, SE_CALC_SET) : rt(jd, 0, SE_CALC_SET)
  if (sunset && sunNow < -0.8) {
    const next = rt(sunset + 0.01, 0, SE_CALC_SET)
    if (next && next < jd) sunset = next
  }
  const from = sunset ?? jd
  const sunrise = rt(from + 0.01, 0, SE_CALC_RISE)
  const dark = rt(from - 0.01, 0, SE_CALC_SET | SE_BIT_ASTRO_TWILIGHT)
  const dawn = rt(from + 0.01, 0, SE_CALC_RISE | SE_BIT_ASTRO_TWILIGHT)
  const nightEnd = sunrise ?? from + 0.5

  // Sample every 10 minutes from sunset to sunrise.
  const step = 10 / 1440
  const ts: number[] = []
  for (let t = from; t <= nightEnd; t += step) ts.push(t)
  const sunAlt = ts.map((t) => hor(t, 0).alt)
  if (sidMode !== null) swe.set_sid_mode(sidMode, 0, 0)
  const zodiacFlags = SEFLG_SWIEPH | (sidMode !== null ? SEFLG_SIDEREAL : 0)

  const bodies: NightBody[] = []
  const tracks = new Map<number, { t: number; alt: number; ra: number; dec: number }[]>()
  for (const body of NIGHT_BODIES) {
    const ph = phenoUt(swe, from, body, SEFLG_SWIEPH)
    const mag = ph ? ph[4] : 0
    // Bright bodies show in a lighter sky.
    const sunLimit = body === 1 || mag < -1 ? -4 : mag < 1 ? -8 : -10
    let win: [number, number] | null = null
    let best = { t: 0, alt: -90, az: 0 }
    const track: { t: number; alt: number; ra: number; dec: number }[] = []
    ts.forEach((t, i) => {
      const h = hor(t, body)
      const q = swe.calc_ut(t, body, SEFLG_SWIEPH | SEFLG_EQUATORIAL)
      if (h.alt > 5 && sunAlt[i] < sunLimit) {
        win = win ? [win[0], t] : [t, t]
        track.push({ t, alt: h.alt, ra: q[0], dec: q[1] })
        if (h.alt > best.alt) best = { t, alt: h.alt, az: h.az }
      }
    })
    tracks.set(body, track)
    const w = win as [number, number] | null
    bodies.push({
      body,
      lon: swe.calc_ut(from, body, zodiacFlags)[0],
      magnitude: Math.round(mag * 10) / 10,
      from: w ? w[0] : null,
      to: w ? w[1] : null,
      best: w ? best.t : null,
      altitude: w ? Math.round(best.alt) : 0,
      azimuth: w ? Math.round(best.az) : 0,
      rise: rt(from - 0.5, body, SE_CALC_RISE),
      set: rt(from, body, SE_CALC_SET)
    })
  }

  // Close pairs while both are up.
  const sepDeg = (a: { ra: number; dec: number }, b: { ra: number; dec: number }) => {
    const r = Math.PI / 180
    const c = Math.sin(a.dec * r) * Math.sin(b.dec * r) + Math.cos(a.dec * r) * Math.cos(b.dec * r) * Math.cos((a.ra - b.ra) * r)
    return Math.acos(Math.min(1, Math.max(-1, c))) / r
  }
  const pairs: NightSky['pairs'] = []
  for (let i = 0; i < NIGHT_BODIES.length; i++)
    for (let j = i + 1; j < NIGHT_BODIES.length; j++) {
      const A = tracks.get(NIGHT_BODIES[i])!
      const B = new Map(tracks.get(NIGHT_BODIES[j])!.map((p) => [p.t, p]))
      let bestPair: { sep: number; jd: number } | null = null
      for (const p of A) {
        const q = B.get(p.t)
        if (!q) continue
        const s = sepDeg(p, q)
        if (s < 4 && (!bestPair || s < bestPair.sep)) bestPair = { sep: s, jd: p.t }
      }
      if (bestPair) pairs.push({ a: NIGHT_BODIES[i], b: NIGHT_BODIES[j], sep: Math.round(bestPair.sep * 10) / 10, jd: bestPair.jd })
    }

  const moonPh = phenoUt(swe, from + 0.25, 1, SEFLG_SWIEPH)
  const el = norm(swe.calc_ut(from + 0.25, 1, SEFLG_SWIEPH)[0] - swe.calc_ut(from + 0.25, 0, SEFLG_SWIEPH)[0])

  const eclipses: NightSky['eclipses'] = []
  const sol = swe.sol_eclipse_when_loc(jd, SEFLG_SWIEPH, geo, 0)
  if (sol) eclipses.push({ jd: sol.tret[0], solar: true, kind: sol.retFlag & 4 ? 'total' : sol.retFlag & 8 ? 'annular' : 'partial', magnitude: Math.round(sol.attr[0] * 100) / 100 })
  const lun = swe.lun_eclipse_when_loc(jd, SEFLG_SWIEPH, geo, 0)
  if (lun) eclipses.push({ jd: lun.tret[0], solar: false, kind: lun.retFlag & 4 ? 'total' : lun.retFlag & 16 ? 'partial' : 'penumbral', magnitude: Math.round((lun.retFlag & 20 ? lun.attr[0] : lun.attr[1]) * 100) / 100 })
  eclipses.sort((a, b) => a.jd - b.jd)

  return { sunset, dark, dawn, sunrise, moonLit: moonPh ? moonPh[1] : 0, moonWaxing: el < 180, bodies, pairs, eclipses }
}

// ---- Birth-time rectification ------------------------------------------------------

const RECT_NATAL = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9] // Sun … Pluto
const RECT_SLOW: Record<number, number> = { 5: 0.6, 6: 1, 7: 1, 8: 0.8, 9: 1 } // Jupiter … Pluto: weight
// Which angle axis an event kind tends to show on, and which planets.
const RECT_AXIS: Record<string, { axis?: 'asc' | 'mc'; bodies?: number[] }> = {
  relationship: { axis: 'asc', bodies: [3] },
  career: { axis: 'mc', bodies: [0, 6] },
  home: { axis: 'mc', bodies: [1] },
  family: { axis: 'mc', bodies: [1] },
  health: { axis: 'asc', bodies: [4] },
  loss: { bodies: [6, 9] },
  education: { bodies: [5, 2] },
  travel: { bodies: [5] }
}

/**
 * Scores candidate birth times against dated life events: slow transits to the angles,
 * solar-arc directed angles to natal planets and directed planets to the angles, and the
 * progressed Moon on an angle. Each event counts its two closest contacts, so one busy
 * event cannot outweigh the rest. A classic, rough method; the result is a short list.
 */
export async function rectify(req: RectifyRequest): Promise<RectifyResult> {
  const swe = await getSwe()
  const lon = (t: number, b: number) => swe.calc_ut(t, b, SEFLG_SWIEPH)[0] as number
  const events = req.events.slice(0, 60)
  const transits = events.map((e) => Object.fromEntries(Object.keys(RECT_SLOW).map((b) => [b, lon(e.jd, +b)])) as Record<number, number>)
  const sep = (a: number, b: number) => Math.abs(d180(a - b))
  // Conjunction, opposition (shown as the opposite angle) or square, within orb.
  const hit = (p: number, angleLon: number, orb: number, angle: 'asc' | 'mc') => {
    const d0 = sep(p, angleLon)
    if (d0 <= orb) return { angle, aspect: 'conjunction' as const, orb: d0 }
    const d180v = sep(p, angleLon + 180)
    if (d180v <= orb) return { angle: angle === 'asc' ? ('dsc' as const) : ('ic' as const), aspect: 'conjunction' as const, orb: d180v }
    const d90 = Math.min(sep(p, angleLon + 90), sep(p, angleLon - 90))
    if (d90 <= orb * 0.8) return { angle, aspect: 'square' as const, orb: d90 }
    return null
  }

  // Natal Sun once (its daily motion is under a degree; the arc uses it per candidate below).
  const scores: number[] = []
  const all: { asc: number; mc: number; contacts: (RectifyContact & { w: number })[] }[] = []
  for (const jd of req.candidates) {
    const h = swe.houses_ex(jd, 0, req.lat, req.lon, 'W')
    const asc = h.ascmc[0] as number
    const mc = h.ascmc[1] as number
    const natal = Object.fromEntries(RECT_NATAL.map((b) => [b, lon(jd, b)])) as Record<number, number>
    const contacts: (RectifyContact & { w: number })[] = []
    let total = 0
    events.forEach((e, i) => {
      const fav = RECT_AXIS[e.category ?? ''] ?? {}
      const boost = (angle: string, body: number) =>
        (fav.axis && (fav.axis === 'asc' ? angle === 'asc' || angle === 'dsc' : angle === 'mc' || angle === 'ic') ? 1.5 : 1) * (fav.bodies?.includes(body) ? 1.3 : 1)
      const found: (RectifyContact & { w: number })[] = []
      const add = (kind: RectifyContact['kind'], body: number, x: ReturnType<typeof hit>, maxOrb: number, weight: number) => {
        if (!x) return
        const w = weight * boost(x.angle, body) * (1 - x.orb / maxOrb) * (x.aspect === 'square' ? 0.7 : 1)
        found.push({ event: e.id, kind, body, angle: x.angle, aspect: x.aspect, orb: Math.round(x.orb * 100) / 100, w })
      }
      // Slow transits to the angles.
      for (const [b, w] of Object.entries(RECT_SLOW)) {
        add('transit', +b, hit(transits[i][+b], asc, 1.5, 'asc'), 1.5, w)
        add('transit', +b, hit(transits[i][+b], mc, 1.5, 'mc'), 1.5, w)
      }
      // Secondary progression: a day for a year.
      const years = (e.jd - jd) / 365.2422
      if (years > 0) {
        const pjd = jd + years
        const arc = d180(lon(pjd, 0) - natal[0])
        for (const b of RECT_NATAL) {
          // Directed angles to natal planets (the planet sits where the angle has moved to).
          add('arcAngle', b, hit(natal[b], asc + arc, 1, 'asc'), 1, 1)
          add('arcAngle', b, hit(natal[b], mc + arc, 1, 'mc'), 1, 1)
          // Directed planets to natal angles.
          add('arcPlanet', b, hit(natal[b] + arc, asc, 1, 'asc'), 1, 0.9)
          add('arcPlanet', b, hit(natal[b] + arc, mc, 1, 'mc'), 1, 0.9)
        }
        const pm = lon(pjd, 1)
        const c1 = hit(pm, asc, 1, 'asc')
        const c2 = hit(pm, mc, 1, 'mc')
        if (c1?.aspect === 'conjunction') add('progMoon', 1, c1, 1, 0.5)
        if (c2?.aspect === 'conjunction') add('progMoon', 1, c2, 1, 0.5)
      }
      found.sort((a, b) => b.w - a.w)
      const top = found.slice(0, 2)
      total += top.reduce((s, c) => s + c.w, 0)
      contacts.push(...top)
    })
    scores.push(Math.round(total * 100) / 100)
    all.push({ asc, mc, contacts })
  }

  // Smooth a little (neighbouring minutes), then take peaks at least 20 minutes apart.
  const sm = scores.map((_, i) => (scores[i - 1] ?? scores[i]) * 0.25 + scores[i] * 0.5 + (scores[i + 1] ?? scores[i]) * 0.25)
  const order = sm.map((v, i) => [v, i] as const).sort((a, b) => b[0] - a[0])
  const best: RectifyResult['best'] = []
  for (const [v, i] of order) {
    if (best.length >= 3 || v <= 0) break
    if (best.some((b) => Math.abs(req.candidates[b.index] - req.candidates[i]) * 1440 < 20)) continue
    best.push({ index: i, score: Math.round(v * 100) / 100, asc: all[i].asc, mc: all[i].mc, contacts: all[i].contacts.map(({ w: _w, ...c }) => c) })
  }
  return { scores, best }
}
