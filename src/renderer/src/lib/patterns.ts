// Aspect pattern detection (grand trine, T-square, yod, ...) on natal points.
import type { AppSettings } from '@shared/types'
import { findAspects, POINT, SIGNS, splitDeg, type Aspect, type ChartPoint } from './astro'
import { t } from './i18n'

export interface Pattern {
  name: string
  keys: string[]
  note: string
}

const PLANETS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'uranus', 'neptune', 'pluto']
const PATTERN_POINTS = [...PLANETS, 'asc', 'mc', 'node', 'chiron']

const names = (keys: string[]) => keys.map((k) => POINT[k].name).join(', ')

export function findPatterns(points: ChartPoint[], settings: AppSettings): Pattern[] {
  const pts = points.filter((p) => PATTERN_POINTS.includes(p.key))
  // Use the natal orbs but always include the five major aspects and quincunx.
  const s: AppSettings = {
    ...settings,
    aspects: Object.fromEntries(
      Object.entries(settings.aspects).map(([k, v]) => [k, { ...v, enabled: ['conjunction', 'opposition', 'trine', 'square', 'sextile', 'quincunx'].includes(k) }])
    ) as AppSettings['aspects']
  }
  const asp = findAspects(pts, null, s, false)
  const rel = new Map<string, Aspect['aspect']['key']>()
  for (const a of asp) {
    rel.set(`${a.a.key}|${a.b.key}`, a.aspect.key)
    rel.set(`${a.b.key}|${a.a.key}`, a.aspect.key)
  }
  const is = (x: string, y: string, k: string) => rel.get(`${x}|${y}`) === k
  const keys = pts.map((p) => p.key)
  const out: Pattern[] = []
  const seen = new Set<string>()
  const add = (name: string, ks: string[], note: string) => {
    const id = name + '|' + [...ks].sort().join(',')
    if (seen.has(id)) return
    seen.add(id)
    out.push({ name, keys: ks, note })
  }
  const n = keys.length
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      for (let k = j + 1; k < n; k++) {
        const [a, b, c] = [keys[i], keys[j], keys[k]]
        if (is(a, b, 'trine') && is(b, c, 'trine') && is(a, c, 'trine')) {
          add('Büyük Üçgen', [a, b, c], t('{list} birbirine üçgen', { list: names([a, b, c]) }))
        }
        for (const [x, y, apex] of [
          [a, b, c],
          [a, c, b],
          [b, c, a]
        ]) {
          if (is(x, y, 'opposition') && is(x, apex, 'square') && is(y, apex, 'square')) {
            add('T-Kare', [x, y, apex], t('{a}–{b} karşıtlığı, tepe: {apex}', { a: POINT[x].name, b: POINT[y].name, apex: POINT[apex].name }))
          }
          if (is(x, y, 'sextile') && is(x, apex, 'quincunx') && is(y, apex, 'quincunx')) {
            add('Yod (Tanrının Parmağı)', [x, y, apex], t('{a}–{b} sekstili, tepe: {apex}', { a: POINT[x].name, b: POINT[y].name, apex: POINT[apex].name }))
          }
        }
      }
  // Four-point figures built from the triples above.
  for (const gt of out.filter((p) => p.name === 'Büyük Üçgen')) {
    for (const d of keys) {
      if (gt.keys.includes(d)) continue
      const opp = gt.keys.find((x) => is(x, d, 'opposition'))
      if (opp && gt.keys.filter((x) => x !== opp).every((x) => is(x, d, 'sextile'))) {
        add('Uçurtma', [...gt.keys, d], t('Büyük üçgen + {p}, kuyruk {q} karşıtı', { p: POINT[d].name, q: POINT[opp].name }))
      }
    }
  }
  for (const ts of out.filter((p) => p.name === 'T-Kare')) {
    const [x, y, apex] = ts.keys
    for (const d of keys) {
      if (ts.keys.includes(d)) continue
      if (is(apex, d, 'opposition') && is(x, d, 'square') && is(y, d, 'square')) add('Büyük Haç', [x, y, apex, d], `${names([x, y, apex, d])}`)
    }
  }
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++) {
      const [a, b] = [keys[i], keys[j]]
      if (!is(a, b, 'opposition')) continue
      for (let k = 0; k < n; k++)
        for (let l = k + 1; l < n; l++) {
          const [c, d] = [keys[k], keys[l]]
          if ([a, b].includes(c) || [a, b].includes(d) || !is(c, d, 'opposition')) continue
          const ok =
            (is(a, c, 'sextile') && is(b, d, 'sextile') && is(a, d, 'trine') && is(b, c, 'trine')) ||
            (is(a, c, 'trine') && is(b, d, 'trine') && is(a, d, 'sextile') && is(b, c, 'sextile'))
          if (ok) add('Mistik Dikdörtgen', [a, b, c, d], names([a, b, c, d]))
        }
    }
  // Stelliums: three or more planets in one sign or one house.
  const planets = points.filter((p) => PLANETS.includes(p.key))
  for (let s0 = 0; s0 < 12; s0++) {
    const inSign = planets.filter((p) => splitDeg(p.lon).sign === s0)
    if (inSign.length >= 3) add(t('Stelyum ({where})', { where: SIGNS[s0].name }), inSign.map((p) => p.key), names(inSign.map((p) => p.key)))
  }
  for (let h = 1; h <= 12; h++) {
    const inHouse = planets.filter((p) => p.house === h)
    if (inHouse.length >= 3) add(t('Stelyum ({where})', { where: t('{n}. ev', { n: h }) }), inHouse.map((p) => p.key), names(inHouse.map((p) => p.key)))
  }
  return out
}
