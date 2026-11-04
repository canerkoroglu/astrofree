// Swiss Ephemeris (WASM build) wrapper. Runs in the main process because the
// package resolves its .wasm/.data files through Node's fs there.
import type { EphemBody, EphemRequest, EphemResult } from '@shared/types'

const SEFLG_SWIEPH = 2
const SEFLG_SPEED = 256
const SEFLG_EQUATORIAL = 2048
const SEFLG_SIDEREAL = 65536
const SE_ECL_NUT = -1

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Swe = any

let swePromise: Promise<Swe> | null = null

export function getSwe(): Promise<Swe> {
  if (!swePromise) {
    swePromise = (async () => {
      const mod = await import('swisseph-wasm')
      const swe = new mod.default()
      await swe.initSwissEph()
      return swe
    })()
    swePromise.catch(() => (swePromise = null))
  }
  return swePromise
}

const norm = (x: number) => ((x % 360) + 360) % 360

function computeOne(swe: Swe, req: EphemRequest): EphemResult {
  const sidereal = req.sidMode !== null && req.sidMode !== undefined
  if (sidereal) swe.set_sid_mode(req.sidMode, 0, 0)
  const baseFlags = SEFLG_SWIEPH | SEFLG_SPEED | (sidereal ? SEFLG_SIDEREAL : 0)

  const bodies: EphemBody[] = []
  for (const id of req.bodies) {
    try {
      const ecl = swe.calc_ut(req.jdUT, id, baseFlags)
      const equ = swe.calc_ut(req.jdUT, id, SEFLG_SWIEPH | SEFLG_EQUATORIAL)
      bodies.push({ id, lon: ecl[0], lat: ecl[1], dist: ecl[2], speed: ecl[3], decl: equ[1] })
    } catch {
      // Body outside the bundled ephemeris range (e.g. asteroids before 1800):
      // skip it rather than failing the whole chart.
    }
  }

  const nut = swe.calc_ut(req.jdUT, SE_ECL_NUT, 0)
  const eps: number = nut[0]
  // The shift Swiss Ephemeris actually applies to sidereal positions (ayanamsa including nutation), measured on
  // the Sun so that derived charts (houses from an ARMC) move exactly like the planets.
  const ayanamsa: number = sidereal
    ? norm(swe.calc_ut(req.jdUT, 0, SEFLG_SWIEPH)[0] - swe.calc_ut(req.jdUT, 0, SEFLG_SWIEPH | SEFLG_SIDEREAL)[0])
    : 0

  const hsys = req.houseSystem || 'P'
  // Placidus, Koch and Gauquelin have no solution inside the polar circles; Swiss Ephemeris then quietly
  // returns Porphyry cusps (swehouse.c: |lat| >= 90° − ε). Report it so the chart can say so.
  const houseFallback = 'PKG'.includes(hsys) && Math.abs(req.lat) >= 90 - eps ? 'O' : undefined
  let h: { cusps: Float64Array; ascmc: Float64Array }
  if (req.armc !== undefined) {
    h = swe.houses_armc(norm(req.armc), req.lat, eps, hsys)
    if (sidereal) {
      h.cusps = h.cusps.map((c: number, i: number) => (i === 0 ? c : norm(c - ayanamsa)))
      h.ascmc = h.ascmc.map((c: number, i: number) => (i === 2 ? c : norm(c - ayanamsa)))
    }
  } else {
    h = swe.houses_ex(req.jdUT, sidereal ? SEFLG_SIDEREAL : 0, req.lat, req.lon, hsys)
  }

  return {
    jdUT: req.jdUT,
    bodies,
    cusps: Array.from(h.cusps).slice(1, 13),
    asc: h.ascmc[0],
    mc: h.ascmc[1],
    armc: h.ascmc[2],
    vertex: h.ascmc[3],
    eps,
    ayanamsa,
    ...(houseFallback ? { houseFallback } : {})
  }
}

export async function computeMany(reqs: EphemRequest[]): Promise<EphemResult[]> {
  const swe = await getSwe()
  return reqs.map((r) => {
    try {
      return computeOne(swe, r)
    } catch (e) {
      return {
        jdUT: r.jdUT,
        bodies: [],
        cusps: [],
        asc: 0,
        mc: 0,
        armc: 0,
        vertex: 0,
        eps: 23.44,
        ayanamsa: 0,
        error: String((e as Error)?.message ?? e)
      }
    }
  })
}
