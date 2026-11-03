// Lists UI strings that a language file does not translate yet.
//   npm run i18n:check            all languages
//   npm run i18n:check -- en      one language
//
// Keys are the Turkish source strings: every literal passed to t('…') / tm('…')
// plus every string literal in the UI code that contains Turkish letters
// (those are labels passed through t() by variable).
import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'

const root = new URL('..', import.meta.url).pathname
const SKIP = [/src\/shared\/i18n\//, /assets\/world/, /\.d\.ts$/]
const files = []
const walk = (d) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f)
    if (statSync(p).isDirectory()) walk(p)
    else if (/\.(ts|tsx)$/.test(f) && !SKIP.some((r) => r.test(p))) files.push(p)
  }
}
walk(join(root, 'src'))

const keys = new Map()
const lit = /(['"`])((?:(?!\1)[^\\\n]|\\.)+?)\1/g
for (const f of files) {
  // Skip comments and blocks marked i18n-ignore-start … i18n-ignore-end.
  let ignoring = false
  const src = readFileSync(f, 'utf8')
    .split('\n')
    .filter((l) => {
      if (l.includes('i18n-ignore-start')) ignoring = true
      if (l.includes('i18n-ignore-end')) return (ignoring = false)
      return !ignoring && !l.includes('i18n-ignore') && !/^\s*(\/\/|\*|\/\*)/.test(l)
    })
    .join('\n')
  for (const m of src.matchAll(/\b(?:t|tm)\(\s*(['"])((?:(?!\1)[^\\\n]|\\.)+?)\1/g)) keys.set(m[2].replace(/\\'/g, "'"), relative(root, f))
  for (const m of src.matchAll(lit)) {
    const s = m[2]
    if (m[1] === '`' && s.includes('${')) continue
    if (/[çğıöşüÇĞİÖŞÜ]/.test(s) && !/^[./@]/.test(s) && !/\\n/.test(s)) keys.set(s.replace(/\\'/g, "'"), relative(root, f))
  }
}

// Locale files are TypeScript; read their `strings` block as data.
const i18nDir = join(root, 'src/shared/i18n')
const only = process.argv[2]
let missingTotal = 0
for (const f of readdirSync(i18nDir).filter((f) => /^[a-z]{2,3}(-[A-Z]{2})?\.ts$/.test(f) && f !== 'tr.ts')) {
  const code = f.replace('.ts', '')
  if (only && only !== code) continue
  const text = readFileSync(join(i18nDir, f), 'utf8')
  const block = text.slice(text.indexOf('strings: {'))
  const have = new Set([...block.matchAll(/^\s*("(?:[^"\\]|\\.)*")\s*:/gm)].map((m) => JSON.parse(m[1])))
  const missing = [...keys.keys()].filter((k) => !have.has(k)).sort()
  missingTotal += missing.length
  console.log(`\n${code}: ${missing.length} missing of ${keys.size}`)
  for (const k of missing) console.log(`  ${JSON.stringify(k)}  (${keys.get(k)})`)
}
process.exitCode = missingTotal ? 1 : 0
