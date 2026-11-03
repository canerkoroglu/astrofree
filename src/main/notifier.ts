// Desktop notifications for exact transits to saved charts. Runs while the
// app is open: shortly after start and then every six hours.
import { app, BrowserWindow, Notification } from 'electron'
import { promises as fs } from 'node:fs'
import { join } from 'node:path'
import type { ChartRecord, EphemRequest } from '@shared/types'
import { computeMany } from './ephemeris'
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

async function checkOnce(): Promise<void> {
  const settings = await getSettings()
  if (!settings.notifications?.enabled || !Notification.isSupported()) return
  setMainLang(settings.uiLanguage)
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
    const req: EphemRequest = { jdUT: chartJd(c), lat: c.place.lat, lon: c.place.lon, houseSystem: settings.houseSystem, sidMode: sid, bodies: Object.keys(NATAL).map(Number) }
    const [r] = await computeMany([req])
    if (r.error) continue
    const natal = [
      ...r.bodies.map((b) => ({ key: NATAL[b.id], lon: b.lon })),
      ...(c.timeUnknown ? [] : [{ key: 'asc', lon: r.asc }, { key: 'mc', lon: r.mc }])
    ]
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
        n.on('click', () => {
          const win = BrowserWindow.getAllWindows()[0]
          if (!win) return
          if (win.isMinimized()) win.restore()
          win.focus()
          win.webContents.send('open-chart', c.id)
        })
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
