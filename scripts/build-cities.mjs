// Builds resources/cities.json.gz from GeoNames dumps (CC-BY 4.0, geonames.org):
//   node scripts/build-cities.mjs <cities5000.txt> <admin1CodesASCII.txt> [TR.txt ...]
// Optional country dumps add their districts (ADM2), e.g. Istanbul's Kadıköy.
import { readFileSync, writeFileSync } from 'node:fs'
import { gzipSync } from 'node:zlib'

const [citiesPath, admin1Path, ...countryDumps] = process.argv.slice(2)
if (!citiesPath || !admin1Path) {
  console.error('usage: node scripts/build-cities.mjs cities5000.txt admin1CodesASCII.txt')
  process.exit(1)
}

const admin1 = new Map()
for (const line of readFileSync(admin1Path, 'utf8').split('\n')) {
  const [code, name] = line.split('\t')
  if (code && name) admin1.set(code, name)
}

const latin = /^[\p{Script=Latin}\s'’\-.]+$/u
const tzIndex = new Map()
const rows = []
for (const line of readFileSync(citiesPath, 'utf8').split('\n')) {
  const f = line.split('\t')
  if (f.length < 18) continue
  const [, name, ascii, alts, lat, lon] = f
  const cc = f[8]
  const pop = Number(f[14]) || 0
  const tz = f[17]
  if (!tzIndex.has(tz)) tzIndex.set(tz, tzIndex.size)
  // Exonyms (e.g. Londra, Münih) only for larger cities to keep the file small.
  let alt = ''
  if (pop >= 100000 && alts) {
    const seen = new Set([name.toLowerCase(), ascii.toLowerCase()])
    alt = alts
      .split(',')
      .filter((a) => a.length <= 40 && latin.test(a) && !seen.has(a.toLowerCase()) && seen.add(a.toLowerCase()))
      .slice(0, pop >= 1000000 ? 120 : pop >= 300000 ? 40 : 15)
      .join('|')
  }
  rows.push([name, ascii === name ? '' : ascii, alt, cc, admin1.get(`${cc}.${f[10]}`) ?? '', +(+lat).toFixed(4), +(+lon).toFixed(4), tzIndex.get(tz), pop])
}
const fold = (x) => x.toLocaleLowerCase('tr').replace(/ı/g, 'i').normalize('NFD').replace(/\p{M}/gu, '')
const have = new Set(rows.map((r) => `${r[3]}|${r[4]}|${fold(r[0])}`))
for (const path of countryDumps) {
  let added = 0
  for (const line of readFileSync(path, 'utf8').split('\n')) {
    const f = line.split('\t')
    if (f.length < 18 || f[6] !== 'A' || f[7] !== 'ADM2') continue
    const name = f[1].replace(/\s+(İlçesi|District|Merkez)$/u, '').trim()
    const cc = f[8]
    const adm = admin1.get(`${cc}.${f[10]}`) ?? ''
    const key = `${cc}|${adm}|${fold(name)}`
    if (have.has(key)) continue
    have.add(key)
    const tz = f[17]
    if (!tzIndex.has(tz)) tzIndex.set(tz, tzIndex.size)
    const ascii = f[2].replace(/\s+(Ilcesi|District|Merkez)$/u, '').trim()
    rows.push([name, ascii === name ? '' : ascii, '', cc, adm, +(+f[4]).toFixed(4), +(+f[5]).toFixed(4), tzIndex.get(tz), Number(f[14]) || 0])
    added++
  }
  console.log(`${path}: +${added} districts`)
}
rows.sort((a, b) => b[8] - a[8])
const json = JSON.stringify({ source: 'GeoNames cities5000 (CC-BY 4.0)', tz: [...tzIndex.keys()], rows })
writeFileSync(new URL('../resources/cities.json.gz', import.meta.url), gzipSync(json, { level: 9 }))
console.log(`${rows.length} cities, ${(json.length / 1e6).toFixed(1)} MB json`)
