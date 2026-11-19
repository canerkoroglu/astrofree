// Checks reading and writing chart files from other programs without Electron:
// AAF (astro.com, Solar Fire, AstroGold, Janus) and CSV, the AstroFree AAF/CSV writers
// (a written file must read back the same), and duplicate detection.
//   npm run test:import
import { registerHooks } from 'node:module'
import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const src = join(root, 'src')
// geo.ts finds its city list through Electron's app; outside Electron it sits in resources/.
const electronStub = 'data:text/javascript,export const app = { isPackaged: false }'
registerHooks({
  resolve(spec, ctx, next) {
    if (spec === 'electron') return { url: electronStub, shortCircuit: true }
    let base = null
    if (spec.startsWith('@shared/')) base = join(src, 'shared', spec.slice(8))
    else if (spec.startsWith('.') && ctx.parentURL?.startsWith(pathToFileURL(src).href)) base = join(dirname(fileURLToPath(ctx.parentURL)), spec)
    if (base) for (const ext of ['.ts', '.tsx', '/index.ts', '']) if (existsSync(base + ext) && (ext || /\.\w+$/.test(base))) return next(pathToFileURL(base + ext).href, ctx)
    return next(spec, ctx)
  }
})
globalThis.document = { documentElement: {} }
// geo.ts resolves resources/ from __dirname (out/main when bundled).
globalThis.__dirname = join(root, 'out', 'main')

const { parseAaf, parseCsv, parseChartsFile } = await import(pathToFileURL(join(src, 'main/importers.ts')).href)
const { toAaf, toCsv, duplicateGroups, matches, fold } = await import(pathToFileURL(join(src, 'renderer/src/lib/people.ts')).href)
const { localToJd } = await import(pathToFileURL(join(src, 'renderer/src/lib/time.ts')).href)

let failed = 0
const check = (name, ok, got) => {
  if (!ok) failed++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${ok ? '' : ` — ${JSON.stringify(got)}`}`)
}
const ut = (c) => localToJd(c.local, c.tz, c.place.lon)

// astro.com style: Gregorian marker, Julian day given, local mean time zone.
const AAF = [
  '#A93:Einstein,Albert,m,14.3.1879g,11:30,Ulm,DEU',
  '#B93:2407422.98027,48n24,10e00,0h40e,0',
  '#COM:Rodden AA',
  '#A93:Lennon,John,m,9.10.1940g,18:30,Liverpool,ENG',
  '#B93:2429912.23,53n25,2w55,1hE00,1',
  '#A93:Newton,Isaac,m,25.12.1642j,1:38,Woolsthorpe,ENG',
  '#B93:*,52n48,0w38,0hE00,0',
  '#A93:Unknown,Time,f,1.1.1990,*,Ankara,TUR',
  '#B93:*,39n56,32e52,2hE00,0',
  '#A93:Bad,Date,m,soon,12:00,Nowhere,XX',
  '#B93:*,1n00,1e00,0hE00,0'
].join('\n')
const a = parseAaf(AAF)
const [ein, len, newt, unk] = a.records
check('AAF: 4 kayıt okundu, 1 atlandı', a.records.length === 4 && a.skipped === 1, { n: a.records.length, skipped: a.skipped })
check('AAF: "14.3.1879g" tarihi okunuyor', ein?.local.y === 1879 && ein.local.m === 3 && ein.local.d === 14, ein?.local)
check('AAF: Jülyen günü verilince an birebir korunuyor', ein && Math.abs(ut(ein) - 2407422.98027) < 1 / 1440, ein && ut(ein))
check('AAF: Einstein koordinatları', ein && Math.abs(ein.place.lat - 48.4) < 0.01 && Math.abs(ein.place.lon - 10) < 0.01, ein?.place)
check('AAF: #COM notlara gidiyor', ein?.notes === 'Rodden AA', ein?.notes)
check('AAF: ad soyad birleşiyor', ein?.name === 'Albert Einstein', ein?.name)
check('AAF: batı boylamı eksi', len && len.place.lon < 0, len?.place)
check('AAF: Lennon UT ile birebir', len && Math.abs(ut(len) - 2429912.23) < 1 / 1440, len && ut(len))
check('AAF: Jülyen takvimi tarihi Gregoryen\'e çevriliyor (25.12.1642j → 4.1.1643)', newt && newt.local.y === 1643 && newt.local.m === 1 && newt.local.d === 4, newt?.local)
check('AAF: "*" saat → saat bilinmiyor', unk?.timeUnknown === true, unk)

// Write AAF back and read it again.
const back = parseAaf(toAaf(a.records)).records
check('AAF yaz-oku: aynı sayıda kayıt', back.length === 4, back.length)
check('AAF yaz-oku: an korunuyor', back.slice(0, 3).every((c, i) => Math.abs(ut(c) - ut(a.records[i])) < 1.5 / 1440), back.map(ut))
check('AAF yaz-oku: isim ve yer', back[0].name === 'Albert Einstein' && back[0].place.name.startsWith('Ulm'), back[0])

// CSV: semicolon, decimal comma, fixed offset, zone name, place lookup with no coordinates.
const CSV = [
  'isim;tarih;saat;yer;enlem;boylam;saat dilimi;tür;grup;etiketler',
  'Ayşe Yılmaz;17.01.1985;14:05;İstanbul;41,01;28,97;Europe/Istanbul;;clients;danışan|2024',
  'Firma Kuruluşu;2001-05-02;09:00;Ankara;39.93;32.85;+3:00;olay;work;',
  'Yer Ara;03.03.1990;;Izmir;;;;;;',
  'Eksik;;10:00;X;1;1;;;;'
].join('\n')
const c = parseCsv(CSV)
const [ay, firm, izm] = c.records
check('CSV: 3 kayıt okundu, 1 atlandı', c.records.length === 3 && c.skipped === 1, { n: c.records.length, skipped: c.skipped })
check('CSV: ondalık virgül', ay && Math.abs(ay.place.lat - 41.01) < 1e-6, ay?.place)
check('CSV: grup ve etiketler', ay?.group === 'clients' && ay.tags.join(',') === 'danışan,2024', ay)
check('CSV: sabit fark (+3:00) ve olay türü', firm?.tz.kind === 'offset' && firm.tz.minutes === 180 && firm.kind === 'event', firm)
check('CSV: koordinat yoksa şehir listesinden bulunuyor', izm && Math.abs(izm.place.lat - 38.4) < 0.3 && izm.timeUnknown === true, izm?.place)
const back2 = parseCsv(toCsv(c.records)).records
check('CSV yaz-oku: an ve grup korunuyor', back2.length === 3 && back2.every((r, i) => Math.abs(ut(r) - ut(c.records[i])) < 1 / 1440 && r.group === c.records[i].group), back2.map(ut))

// Format by content.
check('Biçim: içerikten AAF anlaşılıyor', parseChartsFile('notlar.txt', AAF).format === 'aaf')
check('Biçim: JSON yedek', parseChartsFile('yedek.json', '{"charts":[]}').kind === 'json')

// Duplicates and search.
const dup = duplicateGroups([...a.records, { ...a.records[0], id: 'x', name: 'albert  einstein' }])
check('Kopya: aynı kişi bulunuyor', dup.length === 1 && dup[0].length === 2, dup.map((g) => g.map((x) => x.name)))
check('Arama: aksan duyarsız', matches(ay, 'ayse yilmaz') && matches(ay, 'DANIŞAN') && fold('Şükrü') === 'sukru')
check('Arama: yıl ve not', matches(ein, '1879') && matches(ein, 'rodden') && !matches(ein, 'lennon'))

console.log(failed ? `\n${failed} test başarısız` : '\nTüm içe/dışa aktarım testleri geçti')
process.exit(failed ? 1 : 0)
