// Checks the Swiss Ephemeris build against published values for a known
// chart (Muhammad Ali, 17 Jan 1942 18:35 CWT, Louisville KY — astro.com).
import SwissEph from 'swisseph-wasm'
import { arcsec, isEastern, referenceCusps } from './houses-reference.mjs'

const swe = new SwissEph()
await swe.initSwissEph()
const jd = swe.julday(1942, 1, 18, 0 + 35 / 60)
const expected = {
  0: [297, 17, 35], // Sun 27°17'35" Cap
  1: [312, 25, 56], // Moon 12°25'56" Aqu
  2: [313, 30, 54], // Mercury
  3: [320, 40, 13], // Venus
  4: [33, 3, 30], // Mars
  9: [124, 48, 15] // Pluto
}
let ok = true
for (const [id, [d, m, s]] of Object.entries(expected)) {
  const lon = swe.calc_ut(jd, Number(id), 2 | 256)[0]
  const want = d + m / 60 + s / 3600
  const errSec = Math.abs(lon - want) * 3600
  const pass = errSec < 2
  ok &&= pass
  console.log(`${pass ? 'OK  ' : 'FAIL'} body ${id}: ${lon.toFixed(5)}° (Δ ${errSec.toFixed(1)}")`)
}
const h = swe.houses(jd, 38 + 15 / 60, -(85 + 46 / 60), 'P')
const ascErr = Math.abs(h.ascmc[0] - (139 + 31 / 60 + 28 / 3600)) * 3600
console.log(`${ascErr < 5 ? 'OK  ' : 'FAIL'} ASC ${h.ascmc[0].toFixed(5)}° (Δ ${ascErr.toFixed(1)}")`)
ok &&= ascErr < 5

// Every house system against independent formulas, on several latitudes and dates.
const SYSTEMS = ['P', 'K', 'B', 'R', 'C', 'T', 'O', 'E', 'W', 'M', 'X']
const PLACES = [
  ['Quito', -0.18, -78.47],
  ['Istanbul', 41.01, 28.97],
  ['Buenos Aires', -34.6, -58.38],
  ['Oslo', 59.91, 10.75],
  ['Louisville', 38.25, -85.7667],
  ['Tromsø (polar)', 69.65, 18.96]
]
const DATES = [jd, 2448027.0625, 2460982.0, 2415020.5]
const worst = Object.fromEntries(SYSTEMS.map((h) => [h, 0]))
let polarOk = true
for (const t of DATES) {
  const eps = swe.calc_ut(t, -1, 0)[0]
  for (const [, lat, lon] of PLACES) {
    const polar = Math.abs(lat) >= 90 - eps
    for (const hsys of SYSTEMS) {
      const r = swe.houses_ex(t, 0, lat, lon, hsys)
      const cusps = Array.from(r.cusps).slice(1, 13)
      const armc = r.ascmc[2]
      if (polar) {
        // Inside the polar circle the ascendant must still rise in the east, and Placidus/Koch fall back to Porphyry.
        polarOk &&= isEastern(r.ascmc[0], armc, eps)
        if ('PK'.includes(hsys)) {
          const por = Array.from(swe.houses_ex(t, 0, lat, lon, 'O').cusps).slice(1, 13)
          polarOk &&= cusps.every((c, i) => arcsec(c, por[i]) < 0.01)
        }
        continue
      }
      const ref = referenceCusps(hsys, armc, lat, eps)
      const err = Math.max(...cusps.map((c, i) => arcsec(c, ref[i])))
      worst[hsys] = Math.max(worst[hsys], err)
    }
  }
}
for (const h of SYSTEMS) {
  const pass = worst[h] < 1
  ok &&= pass
  console.log(`${pass ? 'OK  ' : 'FAIL'} houses ${h}: max Δ ${worst[h].toFixed(3)}" vs independent formulas`)
}
console.log(`${polarOk ? 'OK  ' : 'FAIL'} polar circle: ascendant in the east, Placidus/Koch → Porphyry`)
ok &&= polarOk

// Sidereal: houses and planets must move by the same amount.
swe.set_sid_mode(1, 0, 0)
const tro = swe.houses_ex(DATES[1], 0, 41.01, 28.97, 'P').ascmc[0]
const sid = swe.houses_ex(DATES[1], 65536, 41.01, 28.97, 'P').ascmc[0]
const sunShift = swe.calc_ut(DATES[1], 0, 2)[0] - swe.calc_ut(DATES[1], 0, 2 | 65536)[0]
const sidErr = arcsec(tro - sid, sunShift)
console.log(`${sidErr < 0.5 ? 'OK  ' : 'FAIL'} sidereal houses shift like planets (Δ ${sidErr.toFixed(3)}")`)
ok &&= sidErr < 0.5

process.exit(ok ? 0 : 1)
