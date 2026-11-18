// Desktop notifications for exact transits to saved charts. Runs while the
// app is open: shortly after start and then every six hours.
import { app, BrowserWindow, Notification } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { AppSettings, ChartRecord, EphemRequest, SkyEvent } from '@shared/types'
import { meaningsFor } from '@shared/meanings'
import { computeMany } from './ephemeris'
import { skyReport } from './events'
import { mainLocale, setMainLang, tm } from './i18n'
import { getSettings, listCharts } from './store'
import { transitSearch } from './tools'

const SLOW = [4, 5, 6, 7, 8, 9] // Mars..Pluto
const NATAL: Record<number, string> = { 0: 'sun', 1: 'moon', 2: 'mercury', 3: 'venus', 4: 'mars', 5: 'jupiter', 6: 'saturn', 7: 'uranus', 8: 'neptune', 9: 'pluto' }
const ASPECTS = [
  { key: 'conjunction' as const, angle: 0 },
  { key: 'opposition' as const, angle: 180 },
  { key: 'square' as const, angle: 90 },
  { key: 'trine' as const, angle: 120 }
]
const pointName = (key: string) => mainLocale().points[key]?.[0] ?? key

const seenFile = () => join(app.getPath('userData'), 'notified.json')

/** Local wall time → JD (UT) without the renderer's timezone helpers. */
function chartJd(c: ChartRecord): number {
  const { y, m, d, h, mi, s } = c.local
  const ms = Date.UTC(y, m - 1, d, h, mi, s)
  let offset = 0
  if (c.tz.kind === 'offset') offset = c.tz.minutes
  else if (c.tz.kind === 'lmt') offset = c.place.lon * 4
  else {
    try {
      const f = new Intl.DateTimeFormat('en-US', { timeZone: c.tz.zone, hourCycle: 'h23', year: 'numeric', month: 'numeric', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' })
      const p = Object.fromEntries(f.formatToParts(new Date(ms)).map((x) => [x.type, x.value]))
      offset = Math.round((Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - ms) / 60000)
    } catch {
      offset = 0
    }
  }
  return (ms - offset * 60000) / 86400000 + 2440587.5
}

/** Natal longitudes of a saved chart (null when it cannot be computed). */
async function natalPoints(c: ChartRecord, settings: AppSettings): Promise<{ key: string; lon: number }[] | null> {
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  const req: EphemRequest = { jdUT: chartJd(c), lat: c.place.lat, lon: c.place.lon, houseSystem: settings.houseSystem, sidMode: sid, bodies: Object.keys(NATAL).map(Number) }
  const [r] = await computeMany([req])
  if (r.error) return null
  return [...r.bodies.map((b) => ({ key: NATAL[b.id], lon: b.lon })), ...(c.timeUnknown ? [] : [{ key: 'asc', lon: r.asc }, { key: 'mc', lon: r.mc }])]
}

const openApp = (chartId?: string) => {
  const win = BrowserWindow.getAllWindows()[0]
  if (!win) return
  if (win.isMinimized()) win.restore()
  win.focus()
  if (chartId) win.webContents.send('open-chart', chartId)
}

const weekFile = () => join(app.getPath('userData'), 'weekly.json')
/** Monday of this local week, as YYYY-MM-DD: one summary per week. */
function weekKey(): string {
  const d = new Date()
  d.setHours(12, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

const HARMONIOUS = new Set(['trine', 'sextile'])
const BENEFIC = new Set([0, 3, 5]) // Sun, Venus, Jupiter: a conjunction reads as support
const WEEKLY_BODIES = [0, 3, 4, 5, 6] // Sun, Venus, Mars, Jupiter, Saturn (slow enough to matter for a week)
const WEEKLY_NATAL = ['sun', 'moon', 'venus', 'mars', 'asc']
const WEEKLY_ASPECTS = [...ASPECTS, { key: 'sextile' as const, angle: 60 }].map((a) => ({ key: a.key, angle: a.angle, orb: 1 }))

/** The week's summary in plain, tentative words: a few sky events and the person's main transit. */
async function weeklyDigest(settings: AppSettings, charts: ChartRecord[]): Promise<void> {
  if (settings.notifications.weekly === false || !Notification.isSupported()) return
  const key = weekKey()
  let last = ''
  try {
    last = JSON.parse(await fs.readFile(weekFile(), 'utf8')).week ?? ''
  } catch {
    /* first run */
  }
  if (last === key) return
  const now = Date.now() / 86400000 + 2440587.5
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  const loc = mainLocale()
  const day = (jd: number) => new Date((jd - 2440587.5) * 86400000).toLocaleDateString(loc.intl, { weekday: 'short', day: 'numeric', month: 'short' })
  const planet = (id: number) => loc.points[NATAL[id] ?? (id === 15 ? 'chiron' : '')]?.[0] ?? ''
  const sign = (lon: number) => loc.signs[Math.floor((((lon % 360) + 360) % 360) / 30)]

  const lines: string[] = []
  const sky = await skyReport(now, 7, sid)
  const text = (e: SkyEvent): string | null => {
    switch (e.kind) {
      case 'station-r':
        return [2, 3, 4].includes(e.body) ? tm('{p} geri harekete başlıyor ({date})', { p: planet(e.body), date: day(e.jd) }) : null
      case 'station-d':
        return [2, 3, 4].includes(e.body) ? tm('{p} yeniden ileri gidiyor ({date})', { p: planet(e.body), date: day(e.jd) }) : null
      case 'new-moon':
        return tm('Yeni Ay {sign} burcunda ({date})', { sign: sign(e.lon), date: day(e.jd) })
      case 'full-moon':
        return tm('Dolunay {sign} burcunda ({date})', { sign: sign(e.lon), date: day(e.jd) })
      case 'solar-eclipse':
        return tm('Güneş tutulması ({date})', { date: day(e.jd) })
      case 'lunar-eclipse':
        return tm('Ay tutulması ({date})', { date: day(e.jd) })
      default:
        return null
    }
  }
  for (const e of sky.events) {
    const s = text(e)
    if (s && lines.length < 2) lines.push(s)
  }

  // The person's main transit this week, in words from the built-in readings.
  const me = charts.find((c) => c.id === settings.notifications.weeklyChart) ?? charts[0]
  if (me) {
    const natal = (await natalPoints(me, settings))?.filter((p) => WEEKLY_NATAL.includes(p.key))
    if (natal?.length) {
      const hits = await transitSearch({ start: now, end: now + 7, bodies: WEEKLY_BODIES, natal, aspects: WEEKLY_ASPECTS, sidMode: sid })
      const exact = hits.filter((h) => h.exacts.some((x) => x.jd >= now && x.jd <= now + 7))
      // Slow planets first: their themes last longer than a week.
      exact.sort((a, b) => b.body - a.body)
      const h = exact[0]
      const m = meaningsFor(loc.code)
      const raw = h ? m.planets[h.natalKey]?.subject : undefined
      // Mid-sentence: lower-case the first letter, except German (nouns and the polite "Ihre" stay capitalised).
      const subject = raw && loc.code !== 'de' ? raw.charAt(0).toLocaleLowerCase(loc.intl) + raw.slice(1) : raw
      if (h && subject) {
        const good = HARMONIOUS.has(h.aspect) || (h.aspect === 'conjunction' && BENEFIC.has(h.body))
        lines.push(
          good
            ? tm('{name}: {subject} için destekleyici bir hafta olabilir.', { name: me.name, subject })
            : tm('{name}: {subject} konusunda biraz zorlanılabilecek ama gelişime açık bir hafta olabilir.', { name: me.name, subject })
        )
      }
    }
  }
  await fs.writeFile(weekFile(), JSON.stringify({ week: key }), 'utf8')
  if (!lines.length) return
  const n = new Notification({ title: tm('Bu hafta · AstroFree'), body: lines.join('\n') })
  n.on('click', () => openApp(me?.id))
  n.show()
}

async function checkOnce(): Promise<void> {
  const settings = await getSettings()
  if (!settings.notifications?.enabled || !Notification.isSupported()) return
  setMainLang(settings.uiLanguage)
  const people = (await listCharts()).filter((c) => (c.kind ?? 'person') === 'person')
  await weeklyDigest(settings, people).catch(() => undefined)
  // Exact-transit alerts are technical ("T.Saturn square N.Sun"): professional mode only.
  if (settings.mode === 'amateur') return
  const charts = (await listCharts()).filter(
    (c) => (c.kind ?? 'person') === 'person' && (settings.notifications.scope === 'all' || (c.tags ?? []).includes(settings.notifications.tag))
  )
  if (!charts.length) return
  let seen: string[] = []
  try {
    seen = JSON.parse(await fs.readFile(seenFile(), 'utf8'))
  } catch {
    /* first run */
  }
  const now = Date.now() / 86400000 + 2440587.5
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  for (const c of charts.slice(0, 200)) {
    const natal = await natalPoints(c, settings)
    if (!natal) continue
    const hits = await transitSearch({
      start: now,
      end: now + 3,
      bodies: SLOW,
      natal,
      aspects: ASPECTS.map((a) => ({ key: a.key, angle: a.angle, orb: 1 })),
      sidMode: sid
    })
    for (const h of hits) {
      for (const e of h.exacts) {
        if (e.jd < now || e.jd > now + 3) continue
        const id = `${c.id}|${h.body}|${h.natalKey}|${h.aspect}|${Math.round(e.jd)}`
        if (seen.includes(id)) continue
        seen.push(id)
        const when = new Date((e.jd - 2440587.5) * 86400000).toLocaleDateString(mainLocale().intl, { day: '2-digit', month: 'short' })
        const aspect = (mainLocale().aspects[h.aspect] ?? h.aspect).toLocaleLowerCase(mainLocale().intl)
        const n = new Notification({
          title: `${c.name}: T.${pointName(NATAL[h.body])} ${aspect} N.${pointName(h.natalKey)}`,
          body: tm('Tam isabet {date}', { date: when }) + (e.retro ? ' (retro)' : '') + ' · AstroFree'
        })
        n.on('click', () => openApp(c.id))
        n.show()
      }
    }
  }
  await fs.writeFile(seenFile(), JSON.stringify(seen.slice(-2000)), 'utf8')
}

export function startNotifier(): void {
  const run = () => void checkOnce().catch(() => undefined)
  setTimeout(run, 20_000)
  setInterval(run, 6 * 60 * 60 * 1000)
}
