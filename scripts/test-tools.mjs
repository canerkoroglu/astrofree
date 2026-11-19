// Checks the newer sky calculations against known values, without Electron:
// exact Moon phases (Ay Takvimi), tonight's sky (Bu gece) and birth-time rectification
// (a chart whose time is known must come out first from events made from that time).
//   npm run test:tools
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const src = join(dirname(fileURLToPath(import.meta.url)), '..', 'src')
registerHooks({
  resolve(spec, ctx, next) {
    let base = null
    if (spec.startsWith('@shared/')) base = join(src, 'shared', spec.slice(8))
    else if (spec.startsWith('.') && ctx.parentURL?.startsWith(pathToFileURL(src).href)) base = join(dirname(fileURLToPath(ctx.parentURL)), spec)
    if (base) for (const ext of ['.ts', '.tsx', '/index.ts', '']) if (existsSync(base + ext) && (ext || /\.\w+$/.test(base))) return next(pathToFileURL(base + ext).href, ctx)
    return next(spec, ctx)
  }
})
const { lunarPhases, nightSky, rectify } = await import(pathToFileURL(join(src, 'main/tools.ts')).href)
const { getSwe } = await import(pathToFileURL(join(src, 'main/ephemeris.ts')).href)
const swe = await getSwe()

let failed = 0
const check = (name, ok, got) => {
  if (!ok) failed++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${ok ? '' : ` — ${JSON.stringify(got)}`}`)
}
const jdOf = (iso) => Date.parse(iso) / 86400000 + 2440587.5
const near = (a, b, min) => Math.abs(a - b) * 1440 <= min

// Moon phases, November–December 2026 (published UT times).
const ph = await lunarPhases(jdOf('2026-11-19T00:00Z'), 40)
const full = ph.find((p) => p.phase === 2)
const nm = ph.find((p) => p.phase === 0)
check('Dolunay 24 Kasım 2026 14:53 UT', full && near(full.jd, jdOf('2026-11-24T14:53Z'), 3), full)
check('Yeni Ay 9 Aralık 2026 00:51 UT', nm && near(nm.jd, jdOf('2026-12-09T00:51Z'), 3), nm)
check('Evreler sırayla', ph.every((p, i) => i === 0 || p.phase === (ph[i - 1].phase + 1) % 4), ph.map((p) => p.phase))

// Tonight from Istanbul, 19 November 2026.
const n = await nightSky(jdOf('2026-11-19T12:00Z'), 41.01, 28.97, null)
const venus = n.bodies.find((b) => b.body === 3)
check('İstanbul gün batımı 14:42 UT (17:42 TRT)', n.sunset && near(n.sunset, jdOf('2026-11-19T14:42Z'), 5), n.sunset)
check('Venüs sabah gökyüzünde, çok parlak', venus && venus.from && venus.from > n.sunset + 0.4 && venus.magnitude < -4, venus)
check('Ay büyüyor, yarıdan fazlası aydınlık', n.moonWaxing && n.moonLit > 0.5 && n.moonLit < 0.9, n.moonLit)
check('2 Ağustos 2027 Güneş tutulması İstanbul’dan görünür', n.eclipses.some((e) => e.solar && near(e.jd, jdOf('2027-08-02T09:40Z'), 30)), n.eclipses)

// Rectification: a known time (15 June 1980, 10:20 local UTC+3, Istanbul) and events on
// the dates slow planets crossed that chart's angles.
const lat = 41.01
const lon = 28.97
const dayStart = 2444405.5 - 3 / 24
const trueJd = dayStart + (10 * 60 + 20) / 1440
const h = swe.houses_ex(trueJd, 0, lat, lon, 'W')
const norm = (x) => ((x % 360) + 360) % 360
const d180 = (x) => (norm(x) > 180 ? norm(x) - 360 : norm(x))
const events = []
for (const b of [6, 7, 9, 5])
  for (const [target, axis] of [[h.ascmc[0], 'asc'], [h.ascmc[1], 'mc'], [h.ascmc[0] + 180, 'asc'], [h.ascmc[1] + 180, 'mc']]) {
    let prev = null
    for (let t = trueJd + 365 * 5; t < trueJd + 365 * 44; t += 2) {
      const d = d180(swe.calc_ut(t, b, 2)[0] - target)
      if (prev !== null && Math.sign(d) !== Math.sign(prev) && Math.abs(d) < 5) {
        events.push({ id: `${b}${axis}${events.length}`, jd: Math.round(t), category: axis === 'mc' ? 'career' : 'relationship' })
        break
      }
      prev = d
    }
  }
const cands = []
for (let m = 0; m < 1440; m += 4) cands.push(dayStart + m / 1440)
const r = await rectify({ candidates: cands, lat, lon, events: events.slice(0, 7) })
const bestMin = r.best[0] ? Math.round((cands[r.best[0].index] - dayStart) * 1440) : null
check('Saat düzeltme: bilinen saat (10:20) ±8 dk içinde birinci', bestMin !== null && Math.abs(bestMin - 620) <= 8, r.best.map((b) => Math.round((cands[b.index] - dayStart) * 1440)))
check('Saat düzeltme: adaylar en az 20 dk arayla', r.best.every((b, i) => r.best.every((c, j) => i === j || Math.abs(b.index - c.index) * 4 >= 20)))

console.log(failed ? `\n${failed} test başarısız` : '\nTüm gökyüzü araçları testleri geçti')
process.exit(failed ? 1 : 0)
