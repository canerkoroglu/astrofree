// Timing questions in the chat ("best day for a wedding in 2027?", "is it a good time to dye my
// hair?", "Mercury retrograde, should I get a new phone?"): find the topic and the date range in
// the question, score each day by traditional electional rules and send the AI a short list of
// candidate days and periods, so it answers with real dates instead of guessing.
import type { DayFact, TimingFacts, TzSpec } from '@shared/types'
import { LOCALES } from '@shared/i18n'
import { POINT, POINTS, SIGNS } from './astro'
import { t, weekdays } from './i18n'
import { fmtDate, jdToLocal, localToJd } from './time'

export type Topic = 'wedding' | 'diet' | 'hair' | 'purchase' | 'contract' | 'start' | 'travel' | 'move' | 'health' | 'medical'

// i18n-ignore-start (keywords in every interface language, matched against the question)
const KEYWORDS: [Topic, string[]][] = [
  ['medical', ['ameliyat', 'operasyon', 'surgery', 'operation', 'operación', 'operacion', 'cirugía', 'cirurgia', 'opération', 'операци', 'ऑपरेशन', 'सर्जरी']],
  ['wedding', ['nikah', 'nikâh', 'evlilik', 'evlen', 'düğün', 'nişan', 'wedding', 'marry', 'marriage', 'engagement', 'boda', 'casar', 'matrimonio', 'casamento', 'hochzeit', 'heirat', 'mariage', 'marier', 'свадьб', 'брак', 'жени', 'замуж', 'शादी', 'विवाह']],
  ['diet', ['diyet', 'kilo ver', 'zayıfla', 'diet', 'weight loss', 'lose weight', 'dieta', 'adelgaz', 'emagrec', 'abnehm', 'diät', 'régime', 'maigrir', 'диет', 'похуд', 'डाइट', 'वजन']],
  ['hair', ['saç ', 'saçım', 'saçın', 'saçlar', 'saçları', 'kuaför', 'berber', 'hair', 'pelo', 'cabello', 'cabelo', 'haare', 'friseur', 'cheveux', 'coiffeur', 'волос', 'стрижк', 'बाल']],
  ['purchase', ['telefon', 'bilgisayar', 'laptop', 'elektronik', 'cihaz', 'araba al', 'satın al', 'phone', 'computer', 'device', 'gadget', 'buy ', 'buying', 'teléfono', 'celular', 'móvil', 'comprar', 'handy', 'kaufen', 'ordinateur', 'téléphone', 'acheter', 'телефон', 'компьютер', 'купить', 'फ़ोन', 'फोन', 'खरीद']],
  ['contract', ['sözleşme', 'imza', 'kontrat', 'contract', 'sign ', 'contrato', 'firmar', 'assinar', 'vertrag', 'unterschreib', 'contrat', 'signer', 'договор', 'подпис', 'अनुबंध', 'हस्ताक्षर']],
  ['start', ['iş kur', 'şirket kur', 'yeni iş', 'işe başla', 'dükkan aç', 'start a business', 'new job', 'launch', 'negocio', 'empresa', 'nuevo trabajo', 'empleo', 'emprego', 'geschäft', 'firma gründ', 'neue stelle', 'entreprise', 'nouvel emploi', 'nouveau travail', 'бизнес', 'новую работ', 'новая работ', 'व्यापार', 'नौकरी']],
  ['travel', ['seyahat', 'yolculuk', 'tatil', 'uçuş', 'travel', 'trip', 'flight', 'vacation', 'holiday', 'viaje', 'viagem', 'reise', 'urlaub', 'voyage', 'путешеств', 'поездк', 'यात्रा']],
  ['move', ['taşın', 'ev değiştir', 'move house', 'moving', 'relocat', 'mudanza', 'mudar', 'umzug', 'umziehen', 'déménag', 'переезд', 'शिफ्ट']],
  ['health', ['sağlık', 'hastalık', 'iyileş', 'tedavi', 'health', 'illness', 'sick', 'recover', 'salud', 'saúde', 'gesundheit', 'santé', 'здоров', 'болезн', 'स्वास्थ्य', 'बीमारी']]
]
const NUMBERS: Record<string, number> = {
  bir: 1, iki: 2, üç: 3, dört: 4, beş: 5, altı: 6, yedi: 7, sekiz: 8, dokuz: 9, on: 10, 'on iki': 12,
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10, twelve: 12,
  dos: 2, tres: 3, cuatro: 4, cinco: 5, seis: 6, três: 3, quatro: 4, zwei: 2, drei: 3, vier: 4, fünf: 5, sechs: 6,
  deux: 2, trois: 3, quatre: 4, cinq: 5, два: 2, две: 2, три: 3, четыре: 4, пять: 5, шесть: 6
}
// [unit stem, days]
const UNITS: [string, number][] = [
  ['gün', 1], ['hafta', 7], ['ay', 30.44], ['yıl', 365.25], ['sene', 365.25],
  ['day', 1], ['week', 7], ['month', 30.44], ['year', 365.25],
  ['día', 1], ['dia', 1], ['semana', 7], ['mes', 30.44], ['mês', 30.44], ['año', 365.25], ['ano', 365.25],
  ['tag', 1], ['woche', 7], ['monat', 30.44], ['jahr', 365.25],
  ['jour', 1], ['semaine', 7], ['mois', 30.44], ['an', 365.25], ['année', 365.25],
  ['дн', 1], ['недел', 7], ['месяц', 30.44], ['год', 365.25], ['лет', 365.25],
  ['दिन', 1], ['हफ्त', 7], ['सप्ताह', 7], ['महीन', 30.44], ['साल', 365.25]
]
const THIS_YEAR = ['bu yıl', 'bu sene', 'this year', 'este año', 'este ano', 'dieses jahr', 'cette année', 'в этом году', 'इस साल']
const NEXT_YEAR = ['gelecek yıl', 'gelecek sene', 'önümüzdeki yıl', 'seneye', 'next year', 'próximo año', 'el año que viene', 'próximo ano', 'nächstes jahr', "l'année prochaine", 'в следующем году', 'अगले साल']
const THIS_MONTH = ['bu ay', 'this month', 'este mes', 'este mês', 'diesen monat', 'ce mois', 'в этом месяце', 'इस महीने']
const NEXT_MONTH = ['gelecek ay', 'önümüzdeki ay', 'next month', 'próximo mes', 'el mes que viene', 'próximo mês', 'nächsten monat', 'le mois prochain', 'в следующем месяце', 'अगले महीने']
// Month names that are also everyday words; they count only next to a year or a day number.
const AMBIGUOUS_MONTHS = new Set(['may', 'march', 'mai'])
// i18n-ignore-end

interface Rule {
  phase: 'waxing' | 'waning' | 'any'
  /** Swiss ids that should not be retrograde (and not stationing within 2 days). */
  avoid: number[]
  good: number[]
  bad: number[]
  /** Natal points whose harmonious contact with the Moon adds to a day. */
  natal: string[]
}
// Signs: 0 Aries … 11 Pisces. Traditional electional preferences, kept simple.
const RULES: Partial<Record<Topic, Rule>> = {
  wedding: { phase: 'waxing', avoid: [3, 2], good: [1, 3, 4, 6, 11], bad: [7, 9], natal: ['venus', 'moon', 'sun'] },
  diet: { phase: 'waning', avoid: [], good: [5, 9, 7], bad: [3], natal: ['moon'] },
  hair: { phase: 'waxing', avoid: [], good: [1, 4, 5, 6], bad: [3, 11], natal: ['venus'] },
  purchase: { phase: 'waxing', avoid: [2], good: [1, 2, 5, 10], bad: [], natal: ['mercury', 'venus'] },
  contract: { phase: 'waxing', avoid: [2], good: [1, 5, 6, 9], bad: [], natal: ['mercury', 'sun'] },
  start: { phase: 'waxing', avoid: [2], good: [0, 1, 4, 9], bad: [], natal: ['sun', 'jupiter', 'mc'] },
  travel: { phase: 'any', avoid: [2], good: [2, 8, 10], bad: [], natal: ['mercury', 'moon'] },
  move: { phase: 'waxing', avoid: [2], good: [1, 3, 4, 9], bad: [], natal: ['moon', 'venus'] }
}

// Labels and criteria in the source language; t() translates them where they are written.
const TOPIC_LABEL: Record<Topic, string> = {
  wedding: 'nikâh, düğün ya da nişan',
  diet: 'diyete başlamak',
  hair: 'saç kestirmek ya da boyatmak',
  purchase: 'alışveriş, özellikle elektronik cihaz',
  contract: 'sözleşme imzalamak',
  start: 'yeni bir işe ya da girişime başlamak',
  travel: 'yolculuk',
  move: 'taşınmak',
  health: 'sağlık',
  medical: 'tıbbi bir işlem'
}

export interface TimingAsk {
  topic: Topic | null
  /** Local midnight of the first day (UT Julian day) and the number of days. */
  start: number
  days: number
  /** The question named a range itself (otherwise the default for the topic). */
  explicit: boolean
}

const fold = (s: string) => s.toLocaleLowerCase().replace(/ı/g, 'i').normalize('NFD').replace(/[̀-ͯ]/g, '')
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
/** A keyword at the start of a word: "imza" in "imzalamak", "buy " never in "büyük". */
const at = (q: string, w: string) => new RegExp(`(^|[^\\p{L}])${esc(fold(w))}`, 'u').test(q)
const has = (q: string, words: string[]) => words.some((w) => at(q, w))

const MAX_DAYS = 548 // 18 months
// Range when the question names none: weddings and moves are planned further ahead.
const DEFAULT_DAYS: Partial<Record<Topic, number>> = { wedding: 365, move: 120, start: 90 }

/** Topic and date range of a question, or null when it is not about timing at all. */
export function detectTiming(question: string, tz: TzSpec, lon: number, nowJd: number): TimingAsk | null {
  const q = fold(question)
  const topic = KEYWORDS.find(([, w]) => has(q, w))?.[0] ?? null
  const today = jdToLocal(nowJd, tz, lon)
  const midnight = (y: number, m: number, d: number) => localToJd({ y, m, d, h: 0, mi: 0, s: 0 }, tz, lon)
  const start0 = midnight(today.y, today.m, today.d)
  let lo: number | null = null
  let to: number | null = null
  const span = (a: number, b: number) => {
    lo = Math.min(lo ?? a, a)
    to = Math.max(to ?? b, b)
  }
  const monthSpan = (y: number, m: number) => span(midnight(y, m, 1), m === 12 ? midnight(y + 1, 1, 1) : midnight(y, m + 1, 1))

  // Month names (any interface language), with a year next to them when there is one.
  const years = [...q.matchAll(/\b(20[2-4]\d)\b/g)].map((m) => Number(m[1]))
  const months = new Set<number>()
  for (const loc of LOCALES)
    loc.monthsLong.forEach((name, i) => {
      const n = fold(name)
      if (!at(q, n)) return
      if (AMBIGUOUS_MONTHS.has(n) && !new RegExp(`(\\d\\s*${n}|${n}\\s*\\d)`, 'u').test(q)) return
      months.add(i + 1)
    })
  if (months.size) {
    for (const m of months) {
      const y = years[0] ?? (m >= today.m ? today.y : today.y + 1)
      monthSpan(y, m)
    }
  } else if (years.length) {
    for (const y of years) span(midnight(y, 1, 1), midnight(y + 1, 1, 1))
  } else if (has(q, NEXT_YEAR)) span(midnight(today.y + 1, 1, 1), midnight(today.y + 2, 1, 1))
  else if (has(q, THIS_YEAR)) span(start0, midnight(today.y + 1, 1, 1))
  else if (has(q, NEXT_MONTH)) monthSpan(today.m === 12 ? today.y + 1 : today.y, (today.m % 12) + 1)
  else if (has(q, THIS_MONTH)) monthSpan(today.y, today.m)
  else {
    // "next 3 months", "önümüzdeki iki hafta", "в ближайшие 6 месяцев"
    const words = new Map(Object.entries(NUMBERS).map(([k, v]) => [fold(k), v]))
    const nums = [...words.keys()].sort((a, b) => b.length - a.length).map(esc).join('|')
    for (const [unit, days] of UNITS) {
      // A digit ("3 ay", "3ay", French "3 prochains mois") or a whole number word ("üç ay"), never inside a word ("monday").
      const m = q.match(new RegExp(`(?:^|[^\\p{L}\\d])(?:(\\d+)\\s*(?:\\p{L}+\\s+)?|(${nums})\\s+)${esc(fold(unit))}`, 'u'))
      const n = m ? (m[1] ? Number(m[1]) : (words.get(m[2]) ?? 0)) : 0
      if (n > 0) {
        to = start0 + Math.round(n * days)
        break
      }
    }
  }

  // A topic ("best day to dye my hair?") or a range ("what awaits me in the next 3 months?").
  const explicit = to !== null
  if (!topic && !explicit) return null
  const from = Math.max(start0, lo ?? start0)
  const end: number = to ?? start0 + ((topic && DEFAULT_DAYS[topic]) || 60)
  if (end <= start0) return null // only the past was asked about
  return { topic, start: from, days: Math.min(MAX_DAYS, Math.max(1, Math.round(end - from))), explicit }
}

const sep = (a: number, b: number) => {
  const d = Math.abs((((a - b) % 360) + 360) % 360)
  return d > 180 ? 360 - d : d
}

interface Scored {
  day: DayFact
  score: number
  notes: string[]
  reasons: string[] // why it does not qualify (empty = qualifies)
}

function scoreDay(f: DayFact, rule: Rule, facts: TimingFacts, natal: { key: string; lon: number; who?: string }[]): Scored {
  const sign = Math.floor(f.moonLon / 30) % 12
  const reasons: string[] = []
  const notes: string[] = []
  const waxing = f.elong < 180
  if (f.elong < 12 || f.elong > 348) reasons.push(t('Yeni Ay’a çok yakın'))
  else if (rule.phase === 'waxing' && !(f.elong >= 12 && f.elong <= 168)) reasons.push(t('Ay küçülüyor'))
  else if (rule.phase === 'waning' && !(f.elong >= 192 && f.elong <= 348)) reasons.push(t('Ay büyüyor'))
  if (f.freeHours < 4) reasons.push(t('Ay gün boyunca büyük ölçüde boşlukta'))
  for (const b of rule.avoid) {
    if (f.retro.includes(b)) reasons.push(t('{p} retro', { p: bodyName(b) }))
    else if (facts.stations.some((s) => s.body === b && Math.abs(s.jd - f.jd) < 2.5)) reasons.push(t('{p} duraklıyor', { p: bodyName(b) }))
  }
  if (facts.eclipses.some((e) => Math.abs(e.jd - f.jd) < 3.5)) reasons.push(t('tutulmaya çok yakın'))

  let score = f.freeHours / 14
  notes.push(t('Ay {sign} burcunda, {phase}', { sign: SIGNS[sign].name, phase: waxing ? t('büyüyor') : t('küçülüyor') }))
  if (rule.good.includes(sign)) score += 1.5
  if (rule.bad.includes(sign)) {
    score -= 1.5
    notes.push(t('bu iş için geleneksel olarak daha az tercih edilen bir Ay burcu'))
  }
  if (f.freeFrom !== null && f.freeHours < 14) notes.push(t('Ay boşlukta değil: {from}:00–{to}:00', { from: f.freeFrom, to: f.freeTo ?? 22 }))
  for (const p of natal) {
    if (!rule.natal.includes(p.key)) continue
    const d = sep(f.moonLon, p.lon)
    const name = (p.who ? `${p.who}: ` : '') + (POINT[p.key]?.name ?? p.key)
    if (d < 5 || Math.abs(d - 60) < 5 || Math.abs(d - 120) < 5) {
      score += 0.7
      notes.push(t('Ay, doğum haritasındaki {p} ile uyumlu', { p: name }))
    } else if (Math.abs(d - 90) < 5 || Math.abs(d - 180) < 5) {
      score -= 0.7
      notes.push(t('Ay, doğum haritasındaki {p} ile gergin', { p: name }))
    }
  }
  return { day: f, score, notes, reasons }
}

const bodyName = (swe: number) => POINTS.find((p) => p.swe === swe)?.name ?? ''

/** Best days spread over the range: a few per month at most, two days apart or more. */
function pick(scored: Scored[], days: number): Scored[] {
  const perMonth = days > 75 ? 2 : 6
  const total = days > 120 ? 10 : 6
  const out: Scored[] = []
  const count = new Map<string, number>()
  const month = (s: Scored) => {
    const d = new Date((s.day.jd - 2440587.5) * 86400000)
    return `${d.getUTCFullYear()}-${d.getUTCMonth()}`
  }
  for (const s of [...scored].filter((s) => !s.reasons.length).sort((a, b) => b.score - a.score)) {
    if (out.length >= total) break
    const m = month(s)
    if ((count.get(m) ?? 0) >= perMonth) continue
    if (out.some((o) => Math.abs(o.day.jd - s.day.jd) < 2)) continue
    out.push(s)
    count.set(m, (count.get(m) ?? 0) + 1)
  }
  return out.sort((a, b) => a.day.jd - b.day.jd)
}

/** Retrograde periods of Mercury, Venus and Mars that overlap the range (null = beyond the data). */
function retroPeriods(facts: TimingFacts, start: number, end: number): { body: number; from: number | null; to: number | null }[] {
  const out: { body: number; from: number | null; to: number | null }[] = []
  for (const b of [2, 3, 4]) {
    const st = facts.stations.filter((s) => s.body === b)
    // undefined = direct; null = already retrograde when the scan began
    let open: number | null | undefined = st.length ? (st[0].retro ? undefined : null) : facts.days[0]?.retro.includes(b) ? null : undefined
    for (const s of st) {
      if (s.retro) open = s.jd
      else if (open !== undefined) {
        out.push({ body: b, from: open, to: s.jd })
        open = undefined
      }
    }
    if (open !== undefined) out.push({ body: b, from: open, to: null })
  }
  return out.filter((p) => (p.from ?? -Infinity) < end && (p.to ?? Infinity) > start).sort((a, b) => (a.from ?? 0) - (b.from ?? 0))
}

/** The text sent to the AI with a timing question. */
export function timingText(
  ask: TimingAsk,
  facts: TimingFacts,
  natal: { key: string; lon: number; who?: string }[],
  tz: TzSpec,
  lon: number,
  todayJd: number,
  /** Slow-planet transits to the chart over the range, already formatted. */
  transits = ''
): string {
  const day = (jd: number) => {
    const l = jdToLocal(jd, tz, lon)
    return `${fmtDate(l)} ${weekdays()[new Date(Date.UTC(l.y, l.m - 1, l.d)).getUTCDay()]}`
  }
  const end = ask.start + ask.days
  const rule = ask.topic ? RULES[ask.topic] : undefined
  const out: string[] = [
    t('# ZAMANLAMA VERİSİ: {topic} · {from} – {to}', {
      topic: ask.topic ? t(TOPIC_LABEL[ask.topic]) : t('genel dönem'),
      from: fmtDate(jdToLocal(ask.start, tz, lon)),
      to: fmtDate(jdToLocal(end - 0.5, tz, lon))
    })
  ]

  if (rule) {
    const crit = [
      rule.phase === 'waxing' ? t('Ay büyüyor') : rule.phase === 'waning' ? t('Ay küçülüyor') : '',
      t('Ay gün içinde büyük ölçüde boşlukta değil'),
      ...rule.avoid.map((b) => t('{p} retro değil ve duraklamıyor', { p: bodyName(b) })),
      t('tutulmalara en az 3 gün uzak'),
      rule.good.length ? t('Ay şu burçlardaysa artı: {signs}', { signs: rule.good.map((s) => SIGNS[s].name).join(', ') }) : '',
      natal.length ? t('Ay’ın doğum haritasıyla uyumlu açıları artı') : ''
    ].filter(Boolean)
    out.push(t('Ölçütler (geleneksel seçim astrolojisi): {list}.', { list: crit.join('; ') }))
    const scored = facts.days.map((f) => scoreDay(f, rule, facts, natal))
    const best = pick(scored, ask.days)
    out.push(t('## Aday günler (puana göre seçildi, tarih sırasıyla)'))
    if (best.length) for (const s of best) out.push(`- ${day(s.day.jd)}: ${s.notes.join('; ')}`)
    else out.push(t('- Bu aralıkta tüm ölçütlere uyan gün yok; ölçütler gevşetilerek Zaman Seçimi sekmesinde aranabilir.'))
    const today = scored.find((s) => todayJd >= s.day.jd - 0.5 && todayJd < s.day.jd + 0.5)
    if (today)
      out.push(
        t('## Bugün ({date})', { date: day(today.day.jd) }),
        today.reasons.length ? t('- Ölçütlere uymuyor: {why}', { why: today.reasons.join('; ') }) : t('- Ölçütlere uyuyor: {notes}', { notes: today.notes.join('; ') })
      )
  } else if (ask.topic === 'medical') {
    out.push(t('Tıbbi işlemlerin tarihi astrolojiyle değil, doktorla birlikte belirlenir; bu yüzden aday gün hesaplanmadı. Yanıtta yalnızca bu dönemin genel temalarından, kesinlik taşımadan söz edilebilir.'))
  } else if (ask.topic === 'health') {
    out.push(t('Sağlıktaki gidişat astrolojiyle öngörülemez; aday gün hesaplanmadı. Yalnızca enerji, dinlenme ve kendine bakım temalarından olasılık diliyle söz edilebilir; kararlar doktorla verilir.'))
  }

  const periods = retroPeriods(facts, ask.start, end)
  const ecl = facts.eclipses.filter((e) => e.jd >= ask.start && e.jd < end)
  if (periods.length || ecl.length) {
    out.push(t('## Bu aralıktaki dönemler'))
    for (const p of periods)
      out.push(t('- {p} retro: {from} – {to}', { p: bodyName(p.body), from: p.from ? fmtDate(jdToLocal(p.from, tz, lon)) : '…', to: p.to ? fmtDate(jdToLocal(p.to, tz, lon)) : '…' }))
    for (const e of ecl) out.push(t('- {kind}: {date}', { kind: e.solar ? t('Güneş tutulması') : t('Ay tutulması'), date: fmtDate(jdToLocal(e.jd, tz, lon)) }))
  }

  if (transits) out.push(transits)
  out.push(t('Not: Bu tarihler yalnızca geleneksel ölçütlere göre hesaplanmıştır; kesinlik taşımaz ve kişinin kendi koşulları her zaman önce gelir.'))
  return out.join('\n')
}
