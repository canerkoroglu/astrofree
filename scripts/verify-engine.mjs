// Checks the Swiss Ephemeris build against published values for a known
// chart (Muhammad Ali, 17 Jan 1942 18:35 CWT, Louisville KY — astro.com).
import SwissEph from 'swisseph-wasm'

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
process.exit(ok && ascErr < 5 ? 0 : 1)
