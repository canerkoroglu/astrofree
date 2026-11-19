// People and events list: search across everything a chart holds, sorting, duplicates,
// and writing charts back out as AAF or CSV so they can be moved to other programs.
import type { ChartRecord } from '@shared/types'
import { groupLabel } from './groups'
import { monthsLong } from './i18n'
import { localToJd, offsetAt } from './time'

/** Lower case without accents, so "sukru" finds "Şükrü" and "jose" finds "José". */
export const fold = (s: string) =>
  s
    .toLocaleLowerCase()
    .replace(/ı/g, 'i')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')

/** Everything a search can match in a chart, folded. */
export function haystack(c: ChartRecord): string {
  const parts = [
    c.name,
    ...(c.tags ?? []),
    c.group ? groupLabel(c.group) : '',
    c.notes ?? '',
    c.place.name,
    String(c.local.y),
    monthsLong()[c.local.m - 1] ?? '',
    `${c.local.d}.${c.local.m}.${c.local.y}`,
    c.contact?.email ?? '',
    c.contact?.phone ?? '',
    ...(c.journal ?? []).flatMap((e) => [e.title, e.note ?? '']),
    ...(c.sessions ?? []).map((s) => s.note)
  ]
  return fold(parts.join(' \u0001 '))
}

/** Every word of the query must appear somewhere. */
export function matches(c: ChartRecord, q: string, hay = haystack(c)): boolean {
  const words = fold(q).split(/\s+/).filter(Boolean)
  return words.every((w) => hay.includes(w))
}

export type SortKey = 'name' | 'birth' | 'updated' | 'created'

export function sortCharts(list: ChartRecord[], key: SortKey): ChartRecord[] {
  const birth = (c: ChartRecord) => c.local.y * 1e8 + c.local.m * 1e6 + c.local.d * 1e4 + c.local.h * 100 + c.local.mi
  const by: Record<SortKey, (a: ChartRecord, b: ChartRecord) => number> = {
    name: (a, b) => a.name.localeCompare(b.name),
    birth: (a, b) => birth(a) - birth(b),
    updated: (a, b) => b.updatedAt - a.updatedAt,
    created: (a, b) => b.createdAt - a.createdAt
  }
  return [...list].sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite) || by[key](a, b))
}

/** Same person or event entered twice: same folded name and birth day, place within ~10 km. */
export function duplicateGroups(list: ChartRecord[]): ChartRecord[][] {
  const groups = new Map<string, ChartRecord[]>()
  for (const c of list) {
    if (c.composite) continue
    const k = `${fold(c.name).replace(/\s+/g, ' ').trim()}|${c.local.y}-${c.local.m}-${c.local.d}`
    groups.set(k, [...(groups.get(k) ?? []), c])
  }
  const out: ChartRecord[][] = []
  for (const g of groups.values()) {
    if (g.length < 2) continue
    const near = g.filter((c) => g.some((o) => o !== c && Math.abs(o.place.lat - c.place.lat) < 0.1 && Math.abs(o.place.lon - c.place.lon) < 0.1))
    if (near.length > 1) out.push(near)
  }
  return out
}

/** Two copies into one: the first one's data, both ones' tags, notes, events and sessions. */
export function mergeCharts(keep: ChartRecord, drop: ChartRecord): ChartRecord {
  const notes = [keep.notes, drop.notes].filter((n, i, a) => n && a.indexOf(n) === i).join('\n\n')
  const byId = <T extends { id: string }>(a: T[] = [], b: T[] = []) => [...a, ...b.filter((x) => !a.some((y) => y.id === x.id))]
  return {
    ...keep,
    tags: [...new Set([...(keep.tags ?? []), ...(drop.tags ?? [])])],
    notes: notes || undefined,
    group: keep.group ?? drop.group,
    rodden: keep.rodden ?? drop.rodden,
    contact: { ...drop.contact, ...keep.contact },
    journal: byId(keep.journal, drop.journal),
    sessions: byId(keep.sessions, drop.sessions)
  }
}

// ---- Writing out ----------------------------------------------------------------

const aafCoord = (v: number, pos: string, neg: string) => {
  const a = Math.abs(v)
  let deg = Math.floor(a)
  let min = Math.round((a - deg) * 60)
  if (min === 60) [deg, min] = [deg + 1, 0]
  return `${deg}${v < 0 ? neg : pos}${String(min).padStart(2, '0')}`
}
const aafField = (s: string) => s.replace(/[,\r\n]/g, ' ').trim() || '*'

/** AAF (#A93/#B93) as read by astro.com, Solar Fire, AstroGold, Janus and AstroFree. */
export function toAaf(list: ChartRecord[]): string {
  const out: string[] = []
  for (const c of list) {
    if (c.composite) continue
    const jd = localToJd(c.local, c.tz, c.place.lon)
    const off = offsetAt(c.tz, jd, c.place.lon)
    const words = c.name.trim().split(/\s+/)
    const event = c.kind === 'event'
    const last = event || words.length < 2 ? c.name : words[words.length - 1]
    const first = event || words.length < 2 ? '*' : words.slice(0, -1).join(' ')
    const [city, ...rest] = c.place.name.split(',')
    const l = c.local
    const time = c.timeUnknown ? '*' : `${l.h}:${String(l.mi).padStart(2, '0')}${l.s ? `:${String(l.s).padStart(2, '0')}` : ''}`
    const zone = `${Math.floor(Math.abs(off) / 60)}h${off < 0 ? 'w' : 'e'}${String(Math.abs(off) % 60).padStart(2, '0')}`
    out.push(`#A93:${aafField(last)},${aafField(first)},${event ? 'e' : '*'},${l.d}.${l.m}.${l.y}g,${time},${aafField(city ?? '')},${aafField(rest.join(','))}`)
    out.push(`#B93:${jd.toFixed(5)},${aafCoord(c.place.lat, 'n', 's')},${aafCoord(c.place.lon, 'e', 'w')},${zone},0`)
    if (c.notes) for (const line of c.notes.split(/\r?\n/).filter(Boolean)) out.push(`#COM:${line}`)
  }
  return out.join('\r\n') + '\r\n'
}

const csvCell = (s: string | number | undefined) => {
  const v = String(s ?? '')
  return /[;"\n\r]/.test(v) ? `"${v.replace(/"/g, '""')}"` : v
}

/** CSV with the column names AstroFree reads back (semicolon, opens in spreadsheets). */
export function toCsv(list: ChartRecord[]): string {
  const head = ['name', 'date', 'time', 'place', 'lat', 'lon', 'zone', 'kind', 'group', 'tags', 'rodden', 'notes']
  const rows = list
    .filter((c) => !c.composite)
    .map((c) => {
      const l = c.local
      const zone = c.tz.kind === 'zone' ? c.tz.zone : c.tz.kind === 'offset' ? `${c.tz.minutes < 0 ? '-' : '+'}${Math.floor(Math.abs(c.tz.minutes) / 60)}:${String(Math.abs(c.tz.minutes) % 60).padStart(2, '0')}` : ''
      return [
        c.name,
        `${l.y}-${String(l.m).padStart(2, '0')}-${String(l.d).padStart(2, '0')}`,
        c.timeUnknown ? '' : `${String(l.h).padStart(2, '0')}:${String(l.mi).padStart(2, '0')}`,
        c.place.name,
        c.place.lat.toFixed(4),
        c.place.lon.toFixed(4),
        zone,
        c.kind ?? 'person',
        c.group ?? '',
        (c.tags ?? []).join('|'),
        c.rodden ?? '',
        c.notes ?? ''
      ]
        .map(csvCell)
        .join(';')
    })
  return [head.join(';'), ...rows].join('\r\n') + '\r\n'
}

/** Same chart already in the list (as the importer judges it). */
export const sameChart = (a: ChartRecord, b: ChartRecord) =>
  fold(a.name.trim()) === fold(b.name.trim()) &&
  a.local.y === b.local.y &&
  a.local.m === b.local.m &&
  a.local.d === b.local.d &&
  (a.timeUnknown || b.timeUnknown || (a.local.h === b.local.h && a.local.mi === b.local.mi)) &&
  Math.abs(a.place.lat - b.place.lat) < 0.1 &&
  Math.abs(a.place.lon - b.place.lon) < 0.1
