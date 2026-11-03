// Lunar mansions, the Moon-based chart lord, and matching knowledge-base
// entries to what is on screen.
import type { KbEntry } from '@shared/knowledge'
import { getLang, t } from './i18n'
import { moonPhase, POINT, SIGNS, norm360, type Layer } from './astro'

// i18n-ignore-start
/** 28 mansions as taught in the Turkish menâzil tradition: start longitude, names. */
export const MANSIONS: { start: number; tr: string; en: string }[] = [
  { start: 25, tr: 'Şarteyn', en: 'Al Sharatain' },
  { start: 38, tr: 'Büteyn', en: 'Al Butain' },
  { start: 51, tr: 'Süreyya', en: 'Al Thurayya' },
  { start: 63, tr: 'Debûran', en: 'Al Dabaran' },
  { start: 76, tr: "Hak'a", en: "Al Haq'ah" },
  { start: 89, tr: "Hen'a", en: "Al Han'ah" },
  { start: 102, tr: 'Zirâ', en: 'Al Dhira' },
  { start: 115, tr: 'Nesre', en: 'Al Nathrah' },
  { start: 128, tr: 'Tarfa', en: 'Al Tarf' },
  { start: 141, tr: 'Cebhe', en: 'Al Jabhah' },
  { start: 153, tr: 'Zübre', en: 'Al Zubrah' },
  { start: 166, tr: 'Sarfe', en: 'Al Sarfah' },
  { start: 179, tr: 'Avvâ', en: 'Al Awwa' },
  { start: 192, tr: 'Simâk', en: 'Al Simak' },
  { start: 205, tr: 'Gafr', en: 'Al Ghafr' },
  { start: 218, tr: 'Zübânâ', en: 'Al Zubana' },
  { start: 231, tr: 'İklîl', en: 'Al Iklil' },
  { start: 243, tr: 'Kalp', en: 'Al Qalb' },
  { start: 256, tr: 'Şevle', en: 'Al Shaulah' },
  { start: 269, tr: 'Neâim', en: "Al Na'aim" },
  { start: 282, tr: 'Belde', en: 'Al Baldah' },
  { start: 295, tr: "Sa'd ez-Zâbih", en: "Sa'd al Dhabih" },
  { start: 308, tr: "Sa'd Bula", en: "Sa'd al Bula" },
  { start: 321, tr: "Sa'd es-Su'ûd", en: "Sa'd al Su'ud" },
  { start: 333, tr: "Sa'd el-Ahbiye", en: "Sa'd al Akhbiyah" },
  { start: 346, tr: "Fergu'l-Mukaddem", en: 'Al Fargh al Mukdim' },
  { start: 359, tr: "Fergu'l-Muahhar", en: 'Al Fargh al Thani' },
  { start: 12, tr: "Batnu'l-Hût", en: 'Batn al Hut' }
]
const SIGN_SLUG = ['koc', 'boga', 'ikizler', 'yengec', 'aslan', 'basak', 'terazi', 'akrep', 'yay', 'oglak', 'kova', 'balik']
const PHASE_SLUG = ['yeni-ay', 'hilal', 'ilk-dordun', 'sisken', 'dolunay', 'yayilan', 'son-dordun', 'balzamik']
// i18n-ignore-end

export interface Mansion {
  n: number
  name: string
  start: number
  end: number
}

export function mansionOf(lon: number): Mansion {
  const l = norm360(lon)
  for (let i = 0; i < 28; i++) {
    const start = MANSIONS[i].start
    const end = MANSIONS[(i + 1) % 28].start
    const inside = start < end ? l >= start && l < end : l >= start || l < end
    if (inside) return { n: i + 1, name: getLang() === 'tr' ? MANSIONS[i].tr : MANSIONS[i].en, start, end }
  }
  return { n: 1, name: MANSIONS[0].tr, start: 25, end: 38 }
}

const TRAD_RULER = ['mars', 'venus', 'mercury', 'moon', 'sun', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'saturn', 'jupiter']

/** Classical chart lord from the Moon: ruler of the next sign, skipping the lights. */
export function moonChartLord(moonLon: number): string {
  let sign = Math.floor(norm360(moonLon) / 30)
  for (let i = 0; i < 3; i++) {
    sign = (sign + 1) % 12
    const r = TRAD_RULER[sign]
    if (r !== 'sun' && r !== 'moon') return r
  }
  return 'mercury'
}

const phaseIndex = (sun: number, moon: number) => Math.floor(norm360(moon - sun) / 45) % 8
const starSlug = (name: string) => name.toLowerCase().replace(/\s+/g, '-')

// Points whose degree is worth looking up (sensitive degrees, fixed stars).
const DEGREE_POINTS = [
  'sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'node', 'snode', 'chiron', 'juno', 'ceres', 'pallas', 'vesta', 'lilith', 'asc', 'mc'
]

interface Fact {
  /** Entry key it satisfies, e.g. "durak:5". */
  key: string
  why: string
}

function inRange(deg: number, range: string): boolean {
  const m = /^(\d+)(?:-(\d+))?$/.exec(range)
  if (!m) return false
  const a = Number(m[1])
  const b = m[2] === undefined ? a : Number(m[2])
  return a <= b ? deg >= a && deg <= b : deg >= a || deg <= b
}

export interface KbContext {
  natal: Layer
  /** Transit / sky layer when one is shown. */
  transit?: Layer
  stars: { star: string; key: string }[]
  /** Free text (the question) used for topic matching. */
  question?: string
  /** Extra topics from what is on screen, e.g. "sinastri". */
  topics?: string[]
}

export interface KbMatch {
  entry: KbEntry
  reasons: string[]
  score: number
}

// i18n-ignore-start
const TOPIC_WORDS: [RegExp, string[]][] = [
  [/sinastri|synastry|uyum|partner|eş|ilişki|relationship|evlil|marriage|aşk|love/i, ['sinastri', 'ilişki']],
  [/kompozit|composite|davison/i, ['kompozit']],
  [/rektifik|rectif|doğum saat|birth time/i, ['rektifikasyon']],
  [/elektif|election|zaman seç|ne zaman|when should|başla|start/i, ['elektif', 'durak']],
  [/tutulma|eclipse/i, ['olay:tutulma']],
  [/antiscia|antisya|yansıma/i, ['antiscia']],
  [/yanık|combust|cazimi/i, ['yanik', 'cazimi']],
  [/sabit yıldız|fixed star/i, ['sabit-yildiz']],
  [/ay durağ|menzil|mansion|nakşatra|nakshatra/i, ['durak']],
  [/faz|phase|yeni ay|dolunay|full moon|new moon/i, ['faz']]
]
// i18n-ignore-end

function facts(c: KbContext): Fact[] {
  const out: Fact[] = []
  const add = (layer: Layer, prefix: string) => {
    const moon = layer.points.find((p) => p.key === 'moon')
    const sun = layer.points.find((p) => p.key === 'sun')
    if (moon) {
      const m = mansionOf(moon.lon)
      out.push({ key: `durak:${m.n}`, why: t('{layer} Ay {n}. durakta', { layer: prefix, n: m.n }) })
    }
    if (moon && sun) out.push({ key: `faz:${PHASE_SLUG[phaseIndex(sun.lon, moon.lon)]}`, why: t('{layer} Ay fazı', { layer: prefix }) })
  }
  add(c.natal, t('Natal'))
  if (c.transit) add(c.transit, t('Transit'))
  out.push({ key: 'harita-lordu-ay', why: t("Ay'a göre harita lordu") })
  for (const s of c.stars) out.push({ key: `yildiz:${starSlug(s.star)}`, why: `${POINT[s.key]?.name ?? s.key} ☌ ${s.star}` })
  return out
}

/** Entries relevant to the chart (and question), best first. */
export function matchKnowledge(entries: KbEntry[], c: KbContext): KbMatch[] {
  const fs = facts(c)
  const byKey = new Map<string, string[]>()
  for (const f of fs) byKey.set(f.key, [...(byKey.get(f.key) ?? []), f.why])
  const degPoints = c.natal.points.filter((p) => DEGREE_POINTS.includes(p.key))

  const topics = new Set(c.topics ?? [])
  if (c.question) for (const [re, keys] of TOPIC_WORDS) if (re.test(c.question)) keys.forEach((k) => topics.add(k))

  const out: KbMatch[] = []
  const q = c.question?.toLocaleLowerCase('tr') ?? ''
  for (const e of entries) {
    const reasons: string[] = []
    let score = 0
    if (q && e.title.length > 3 && q.includes(e.title.toLocaleLowerCase('tr'))) {
      reasons.push(t('Soruda geçiyor'))
      score += 10
    }
    for (const k of e.keys) {
      const why = byKey.get(k)
      if (why) {
        reasons.push(...why)
        score += k.startsWith('durak:') || k.startsWith('yildiz:') ? 5 : 3
      }
    }
    // Sign + degree entries (sensitive degrees, stars named only by degree).
    const signs = e.keys.filter((k) => k.startsWith('burc:')).map((k) => SIGN_SLUG.indexOf(k.slice(5)))
    const ranges = e.keys.filter((k) => k.startsWith('derece:')).map((k) => k.slice(7))
    if (ranges.length) {
      for (const p of degPoints) {
        const sign = Math.floor(norm360(p.lon) / 30)
        const deg = Math.floor(norm360(p.lon) % 30)
        if (signs.length && !signs.includes(sign)) continue
        if (ranges.some((r) => inRange(deg, r))) {
          reasons.push(`${POINT[p.key]?.name ?? p.key} ${SIGNS[sign].name} ${deg}°`)
          score += p.key === 'asc' || p.key === 'mc' || p.key === 'sun' || p.key === 'moon' ? 4 : 2
        }
      }
    }
    if (!score && topics.size && e.keys.some((k) => topics.has(k) || [...topics].some((tp) => k.startsWith(tp + ':')))) {
      reasons.push(t('Konuyla ilgili'))
      score = 1
    }
    if (score) out.push({ entry: e, reasons: [...new Set(reasons)], score })
  }
  return out.sort((a, b) => b.score - a.score)
}

/** Text block for the AI, within a size budget. */
export function knowledgeText(matches: KbMatch[], budget = 14000): string {
  if (!matches.length) return ''
  const head =
    t('# KULLANICININ BİLGİ BANKASI') +
    '\n' +
    t('Kullanıcının kendi notlarından, bu haritayla eşleşen kayıtlar. Yorumda bu bilgileri öncelikle kullan, kaynağını belirtmeden doğal biçimde harmanla; harita verisiyle çelişirse harita verisi esastır.')
  const parts: string[] = [head]
  let used = head.length
  for (const m of matches) {
    const block = `\n## ${m.entry.title} — ${m.entry.category}\n(${m.reasons.join('; ')})\n${m.entry.body}`
    if (used + block.length > budget) break
    parts.push(block)
    used += block.length
  }
  return parts.join('\n')
}

// ---- human-readable rules ---------------------------------------------------------

// i18n-ignore-start
export const TOPICS: { key: string; label: string }[] = [
  { key: 'ilişki', label: 'İlişkiler' },
  { key: 'sinastri', label: 'Sinastri' },
  { key: 'kompozit', label: 'Kompozit' },
  { key: 'elektif', label: 'Zaman seçimi' },
  { key: 'rektifikasyon', label: 'Rektifikasyon' },
  { key: 'olay:tutulma', label: 'Tutulmalar' },
  { key: 'antiscia', label: 'Antiscia' },
  { key: 'sabit-yildiz', label: 'Sabit yıldızlar' }
]
export { SIGN_SLUG, PHASE_SLUG }
// i18n-ignore-end

const titleCase = (s: string) => s.replace(/-/g, ' ').replace(/(^|\s)\S/g, (c) => c.toLocaleUpperCase('tr'))

/** Short topic name: "İlişki astrolojisi: natal…" → "İlişki astrolojisi". */
export const shortCategory = (title: string) => title.split(/\s*[:(]\s*/)[0].trim()

/** Matching rules of an entry as short phrases; unknown keys are left out. */
export function describeKeys(keys: string[]): string[] {
  const out: string[] = []
  const signs = keys.filter((k) => k.startsWith('burc:')).map((k) => SIGN_SLUG.indexOf(k.slice(5))).filter((i) => i >= 0)
  const ranges = keys.filter((k) => k.startsWith('derece:')).map((k) => k.slice(7))
  for (const k of keys) {
    const [kind, val] = k.split(':')
    if (kind === 'durak' && val) {
      const n = Number(val)
      if (n >= 1 && n <= 28) out.push(t('Ay {n}. durakta ({name})', { n, name: getLang() === 'tr' ? MANSIONS[n - 1].tr : MANSIONS[n - 1].en }))
    } else if (kind === 'yildiz' && val) out.push(t('{star} kavuşumu', { star: titleCase(val) }))
    else if (kind === 'faz' && val) {
      const i = PHASE_SLUG.indexOf(val)
      if (i >= 0) out.push(t('Ay fazı: {phase}', { phase: moonPhaseName(i) }))
    } else if (k === 'harita-lordu-ay') out.push(t("Ay'a göre harita lordu"))
    else {
      const topic = TOPICS.find((tp) => tp.key === k)
      if (topic) out.push(t(topic.label))
    }
  }
  if (ranges.length) {
    const deg = ranges.map((r) => r.replace('-', '°–') + '°').join(', ')
    out.push(signs.length ? `${signs.map((i) => SIGNS[i].name).join(' / ')} ${deg}` : t('Burcun {deg} dereceleri', { deg }))
  }
  return [...new Set(out)]
}

function moonPhaseName(i: number): string {
  return moonPhase(0, i * 45 + 1).name
}
