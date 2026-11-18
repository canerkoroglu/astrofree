// Checks the chat's "when?" engine (src/renderer/src/lib/timing.ts) without Electron:
// topic and date-range detection in all interface languages, the traps that once misfired,
// and the day rules. Runs the TypeScript sources directly (Node strips the types).
//   npm run test:timing
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
globalThis.document = { documentElement: {} }

const { setLang } = await import(pathToFileURL(join(src, 'renderer/src/lib/i18n.ts')).href)
const { detectTiming, scoreDay, RULES } = await import(pathToFileURL(join(src, 'renderer/src/lib/timing.ts')).href)
const { LOCALES } = await import(pathToFileURL(join(src, 'shared/i18n/index.ts')).href)
setLang('tr')

const tz = { kind: 'zone', zone: 'Europe/Istanbul' }
const NOW = 2461362.9 // 18 Nov 2026
let failed = 0
const check = (name, ok, got) => {
  if (!ok) failed++
  console.log(`${ok ? 'OK  ' : 'FAIL'} ${name}${ok ? '' : ` — ${JSON.stringify(got)}`}`)
}
const ask = (q) => detectTiming(q, tz, 29, NOW)

// Topic, default or named range.
const cases = [
  ['en uygun diyet tarihi?', 'diet', 60],
  ['en uygun evlilik tarihi?', 'wedding', 365],
  ['sevgilimle 2027 yılında ne zaman nikah günü alabiliriz?', 'wedding', 365],
  ['saç boyatmak için astrolojik olarak uygun bir zaman mı?', 'hair', 60],
  ['saçımı kestirmek istiyorum', 'hair', 60],
  ['merkür retrosu var mı, telefonumu yenilesem ne olur?', 'purchase', 60],
  ['sağlık problemlerim iyiye gidecek mi önümüzdeki 3 ay beni neler bekliyor?', 'health', 91],
  ['önümüzdeki iki hafta yolculuk', 'travel', 14],
  ['When is a good day to sign a contract next month?', 'contract', 31],
  ['Best day for our wedding in 2027?', 'wedding', 365],
  ['¿Cuándo es buen momento para mudarme en los próximos 6 meses?', 'move', 183],
  ['Quando devo começar a dieta?', 'diet', 60],
  ['Wann ist ein guter Tag für die Hochzeit im nächsten Jahr?', 'wedding', 365],
  ['Quel jour pour signer un contrat dans les 30 prochains jours ?', 'contract', 30],
  ['Когда лучше подстричь волосы?', 'hair', 60],
  ['शादी के लिए अच्छा दिन कब है?', 'wedding', 365],
  ['Ameliyat için uygun gün hangisi?', 'medical', 60]
]
for (const [q, topic, days] of cases) {
  const a = ask(q)
  check(`"${q}" → ${topic}, ${days} gün`, a && a.topic === topic && Math.abs(a.days - days) <= 1, a && { topic: a.topic, days: a.days })
}

// Not timing questions, and words that once looked like topics.
for (const q of ['bu saçma bir soru mu? büyük bir değişim olacak mı', 'what about monday', 'Haritamda Ay nerede?', 'Natal yorum yapar mısın?']) {
  const a = ask(q)
  check(`"${q}" → zamanlama sorusu değil`, a === null, a)
}

// A named month starts on its first day.
const may = ask('Mayısta taşınmak istiyorum')
check('"Mayısta" → 1 Mayıs 2027, 31 gün', may && may.topic === 'move' && may.days === 31, may)

// The chat shortcuts, translated into every language, keep their meaning.
const SHORTCUTS = [
  ['Önümüzdeki 3 ayda hayatımda hangi konular öne çıkabilir? Kısa ve sade bir dille anlat.', null, 91],
  ['Önümüzdeki 30 günde yeni bir işe başlamak ya da önemli bir adım atmak için hangi günler daha uygun görülebilir? Her biri için kısa bir neden yaz.', 'start', 30],
  ['Önümüzdeki 6 ayda Merkür retrosu var mı? Ne zaman başlayıp bitiyor ve geleneksel olarak nelerle ilişkilendiriliyor?', null, 183]
]
for (const loc of LOCALES)
  for (const [key, topic, days] of SHORTCUTS) {
    const q = loc.code === 'tr' ? key : loc.strings[key]
    const a = q ? ask(q) : null
    check(`[${loc.code}] kısayol "${key.slice(0, 28)}…"`, a && a.topic === topic && Math.abs(a.days - days) <= 1, a && { topic: a.topic, days: a.days })
  }

// Day rules: one clean day, then one thing wrong at a time.
const facts = { days: [], stations: [], eclipses: [] }
const day = (o) => ({ jd: NOW, moonLon: 40, elong: 60, freeHours: 14, freeFrom: 8, freeTo: 22, retro: [], ...o })
const reasons = (topic, o, f = facts) => scoreDay(day(o), RULES[topic], f, []).reasons
check('nikâh: temiz gün uygun', reasons('wedding', {}).length === 0, reasons('wedding', {}))
check('nikâh: Venüs retro → uygun değil', reasons('wedding', { retro: [3] }).length > 0)
check('nikâh: Ay küçülürken → uygun değil', reasons('wedding', { elong: 250 }).length > 0)
check('diyet: Ay küçülürken uygun', reasons('diet', { elong: 250 }).length === 0, reasons('diet', { elong: 250 }))
check('cihaz: Merkür retro → uygun değil', reasons('purchase', { retro: [2] }).length > 0)
check('cihaz: Merkür duraklıyor → uygun değil', reasons('purchase', {}, { ...facts, stations: [{ jd: NOW + 1, body: 2, retro: false }] }).length > 0)
check('her konu: Ay boşlukta → uygun değil', reasons('travel', { freeHours: 2 }).length > 0)
check('her konu: tutulmaya yakın → uygun değil', reasons('hair', {}, { ...facts, eclipses: [{ jd: NOW + 2, solar: true }] }).length > 0)
check('her konu: Yeni Ay günü → uygun değil', reasons('start', { elong: 5 }).length > 0)

// Answer check under beginner-level answers: catches instructions and length, not tentative wording.
const { checkAnswer } = await import(pathToFileURL(join(src, 'shared/answerCheck.ts')).href)
const flagged = (text, lang) => checkAnswer(text, lang)
check('yanıt denetimi: "mutlaka" yakalanıyor', flagged('Bu hafta mutlaka dinlenmelisiniz.', 'tr')?.directive === 'mutlaka', flagged('Bu hafta mutlaka dinlenmelisiniz.', 'tr'))
check('yanıt denetimi: "yapmalısınız" yakalanıyor', !!flagged('Sözleşmeyi cuma günü imzalamalısınız, bunu yapmalısınız.', 'tr')?.directive)
check('yanıt denetimi: olasılık dili geçiyor', flagged('Bu hafta dinlenmek için uygun bir dönem olabilir; yeni başlangıçlar tercih edilebilir.', 'tr') === null)
check('yanıt denetimi: "sakınca" yanlış alarm değil', flagged('Bu tarihte bir sakınca görünmüyor olabilir.', 'tr') === null)
check('yanıt denetimi: "you should" yakalanıyor', !!flagged('You should sign the contract on Friday.', 'en')?.directive)
check('yanıt denetimi: İngilizce olasılık dili geçiyor', flagged('Friday may be a good day; it could be considered.', 'en') === null)
check('yanıt denetimi: uzun yanıt', !!flagged('olabilir '.repeat(300), 'tr')?.tooLong)

console.log(failed ? `\n${failed} test başarısız` : '\nTüm zamanlama testleri geçti')
process.exit(failed ? 1 : 0)
