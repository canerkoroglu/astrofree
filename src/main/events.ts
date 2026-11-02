// Sky events around a date: retrograde periods and stations, sign ingresses,
// lunations and eclipses. Found by scanning and refining with bisection.
import type { RetroPeriod, SkyEvent, SkyReport } from '@shared/types'
import { getSwe } from './ephemeris'

const SEFLG_SWIEPH = 2
const SEFLG_SPEED = 256
const SEFLG_SIDEREAL = 65536

const STATION_BODIES = [2, 3, 4, 5, 6, 7, 8, 9, 15] // Mercury..Pluto, Chiron
const INGRESS_BODIES = [0, 2, 3, 4, 5, 6, 7, 8, 9]

const norm = (x: number) => ((x % 360) + 360) % 360

/** Bisection for the boundary where `side` flips, between a (side false) and b (true). */
function refine(a: number, b: number, side: (t: number) => boolean, tol = 1 / 1440): number {
  const startSide = side(a)
  while (b - a > tol) {
    const m = (a + b) / 2
    if (side(m) === startSide) a = m
    else b = m
  }
  return (a + b) / 2
}

function eclipseKind(flag: number, solar: boolean): string {
  if (flag & 4) return 'tam'
  if (flag & 32) return 'hibrit'
  if (flag & 8) return 'halkalı'
  if (flag & 16) return 'parçalı'
  if (flag & 64) return solar ? 'parçalı' : 'yarıgölge'
  return ''
}

export async function skyReport(jd: number, days: number, sidMode: number | null): Promise<SkyReport> {
  const swe = await getSwe()
  const sidereal = sidMode !== null
  if (sidereal) swe.set_sid_mode(sidMode, 0, 0)
  const flags = SEFLG_SWIEPH | SEFLG_SPEED | (sidereal ? SEFLG_SIDEREAL : 0)
  const calc = (t: number, body: number): [number, number] => {
    const r = swe.calc_ut(t, body, flags)
    return [r[0], r[3]]
  }
  const lon = (t: number, b: number) => calc(t, b)[0]
  const speed = (t: number, b: number) => calc(t, b)[1]
  const end = jd + days
  const events: SkyEvent[] = []

  // Retrograde periods in progress at the reference date.
  const retro: RetroPeriod[] = []
  for (const b of STATION_BODIES) {
    if (speed(jd, b) >= 0) continue
    let start: number | null = null
    let stop: number | null = null
    for (let t = jd; t > jd - 260; t -= 1) {
      if (speed(t - 1, b) >= 0) {
        start = refine(t - 1, t, (x) => speed(x, b) < 0)
        break
      }
    }
    for (let t = jd; t < jd + 260; t += 1) {
      if (speed(t + 1, b) >= 0) {
        stop = refine(t, t + 1, (x) => speed(x, b) >= 0)
        break
      }
    }
    retro.push({
      body: b,
      start,
      end: stop,
      startLon: start !== null ? lon(start, b) : null,
      endLon: stop !== null ? lon(stop, b) : null
    })
  }

  // Stations inside the window.
  for (const b of STATION_BODIES) {
    let prev = speed(jd, b)
    for (let t = jd + 1; t <= end + 1e-9; t += 1) {
      const cur = speed(t, b)
      if ((prev < 0) !== (cur < 0)) {
        const at = refine(t - 1, t, (x) => speed(x, b) < 0)
        events.push({ jd: at, kind: cur < 0 ? 'station-r' : 'station-d', body: b, lon: lon(at, b) })
      }
      prev = cur
    }
  }

  // Sign ingresses inside the window (the Moon only for its next one).
  const sign = (t: number, b: number) => Math.floor(norm(lon(t, b)) / 30)
  for (const b of [1, ...INGRESS_BODIES]) {
    const step = b === 1 ? 0.25 : 1
    let prev = sign(jd, b)
    for (let t = jd + step; t <= end + 1e-9; t += step) {
      const cur = sign(t, b)
      if (cur !== prev) {
        const s0 = prev
        const at = refine(t - step, t, (x) => sign(x, b) !== s0)
        // Sample just after the boundary so the longitude is in the new sign.
        events.push({ jd: at + 1 / 1440, kind: 'ingress', body: b, lon: lon(at + 2 / 1440, b) })
        if (b === 1) break
      }
      prev = cur
    }
  }

  // Lunations: Moon-Sun elongation crossing 0° and 180°.
  const elong = (t: number) => norm(lon(t, 1) - lon(t, 0))
  let previousLunation: SkyEvent | null = null
  let prevE = elong(jd - 32)
  for (let t = jd - 32 + 0.5; t <= end + 1e-9; t += 0.5) {
    const e = elong(t)
    let ev: SkyEvent | null = null
    if (e < prevE && prevE - e > 180) {
      const at = refine(t - 0.5, t, (x) => elong(x) < 180)
      ev = { jd: at, kind: 'new-moon', body: 1, lon: lon(at, 1) }
    } else if (prevE < 180 && e >= 180) {
      const at = refine(t - 0.5, t, (x) => elong(x) >= 180)
      ev = { jd: at, kind: 'full-moon', body: 1, lon: lon(at, 1) }
    }
    if (ev) {
      if (ev.jd < jd) previousLunation = ev
      else events.push(ev)
    }
    prevE = e
  }

  // Next solar and lunar eclipse (always reported, even beyond the window).
  const nextEclipses: SkyEvent[] = []
  const sol = swe.sol_eclipse_when_glob(jd, SEFLG_SWIEPH, 0, 0)
  if (sol) nextEclipses.push({ jd: sol.tret[0], kind: 'solar-eclipse', body: 0, lon: lon(sol.tret[0], 0), detail: eclipseKind(sol.retFlag, true) })
  const lun = swe.lun_eclipse_when(jd, SEFLG_SWIEPH, 0, 0)
  if (lun) nextEclipses.push({ jd: lun.tret[0], kind: 'lunar-eclipse', body: 1, lon: lon(lun.tret[0], 1), detail: eclipseKind(lun.retFlag, false) })
  nextEclipses.sort((a, b) => a.jd - b.jd)
  for (const e of nextEclipses) if (e.jd <= end) events.push(e)

  events.sort((a, b) => a.jd - b.jd)
  return { jd, retro, events, previousLunation, nextEclipses, moonLon: lon(jd, 1), sunLon: lon(jd, 0), voc: voidOfCourse(jd, lon) }
}

/**
 * Void-of-course Moon around jd: from the Moon's last Ptolemaic aspect to a
 * planet (Sun..Pluto) until it leaves its sign.
 */
function voidOfCourse(jd: number, lon: (t: number, b: number) => number) {
  const sign = (t: number) => Math.floor(norm(lon(t, 1)) / 30)
  // Next ingress of the Moon.
  const s0 = sign(jd)
  let ingress: number | null = null
  for (let t = jd + 0.1; t <= jd + 3; t += 0.1) {
    if (sign(t) !== s0) {
      ingress = refine(t - 0.1, t, (x) => sign(x) !== s0)
      break
    }
  }
  if (ingress === null) return null
  let last = -Infinity
  let lastBody = -1
  let lastAspect = -1
  const d180 = (x: number) => {
    const v = norm(x)
    return v > 180 ? v - 360 : v
  }
  for (const body of [0, 2, 3, 4, 5, 6, 7, 8, 9]) {
    for (const a of [0, 60, 90, 120, 180]) {
      for (const sgn of a === 0 || a === 180 ? [1] : [1, -1]) {
        const g = (t: number) => d180(lon(t, 1) - lon(t, body) - sgn * a)
        let prev = g(ingress - 3)
        for (let t = ingress - 3 + 0.1; t <= ingress + 1e-9; t += 0.1) {
          const cur = g(Math.min(t, ingress))
          if (Math.sign(prev) !== Math.sign(cur) && Math.abs(prev) < 20 && Math.abs(cur) < 20) {
            const at = refine(t - 0.1, Math.min(t, ingress), (x) => g(x) > 0)
            if (at > last && at <= ingress) {
              last = at
              lastBody = body
              lastAspect = a
            }
          }
          prev = cur
        }
      }
    }
  }
  if (!Number.isFinite(last)) return { start: ingress - 2.5, end: ingress, lastBody: -1, lastAspect: -1 }
  return { start: last, end: ingress, lastBody, lastAspect }
}
