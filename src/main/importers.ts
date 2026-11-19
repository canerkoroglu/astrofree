// Importers for chart files written by other astrology programs.
//   AAF  (Astrodienst / AstroGold / Solar Fire / Janus "Astrological Exchange Format")
//   CSV  (name;date;time;place;lat;lon;zone — header row decides the columns)
import { tm } from './i18n'
import type { ChartRecord, TzSpec } from '@shared/types'
import { searchOffline, zoneAt } from './geo'

const now = () => Date.now()

/** "38n15" / "85w46" / "38n15'30" → signed degrees. */
function aafCoord(s: string): number | null {
  const m = /^(\d{1,3})([nsewNSEW])(\d{1,2})(?:'?(\d{1,2}))?/.exec(s.trim())
  if (!m) return null
  const v = +m[1] + +m[3] / 60 + (m[4] ? +m[4] / 3600 : 0)
  return /[swSW]/.test(m[2]) ? -v : v
}

/** "6hw00" (6h west of Greenwich) / "1he00" / "-6:00" → minutes east of UTC. */
function aafZone(s: string): number | null {
  const t = s.trim()
  let m = /^(\d{1,2})h([ew])(\d{2})$/i.exec(t)
  if (m) return (m[2].toLowerCase() === 'w' ? -1 : 1) * (+m[1] * 60 + +m[3])
  m = /^([+-]?)(\d{1,2})(?::(\d{2}))?$/.exec(t)
  if (m) return (m[1] === '-' ? -1 : 1) * (+m[2] * 60 + +(m[3] ?? 0))
  return null
}

/** Julian day number (noon) of a calendar date; Julian calendar when `julian`. */
function jdn(y: number, m: number, d: number, julian: boolean): number {
  const a = Math.floor((14 - m) / 12)
  const yy = y + 4800 - a
  const mm = m + 12 * a - 3
  const base = d + Math.floor((153 * mm + 2) / 5) + 365 * yy + Math.floor(yy / 4)
  return julian ? base - 32083 : base - Math.floor(yy / 100) + Math.floor(yy / 400) - 32045
}

/** Gregorian date of a Julian day number. */
function fromJdn(j: number): { y: number; m: number; d: number } {
  const a = j + 32044
  const b = Math.floor((4 * a + 3) / 146097)
  const c = a - Math.floor((146097 * b) / 4)
  const d = Math.floor((4 * c + 3) / 1461)
  const e = c - Math.floor((1461 * d) / 4)
  const m = Math.floor((5 * e + 2) / 153)
  return { d: e - Math.floor((153 * m + 2) / 5) + 1, m: m + 3 - 12 * Math.floor(m / 10), y: 100 * b + d - 4800 + Math.floor(m / 10) }
}

/**
 * AAF ("Astrological Exchange Format", written by astro.com/Astrodienst, AstroGold, Solar Fire,
 * Janus and others). Each chart is an #A93 line (name, first name, sex, date, time, place,
 * country) followed by #B93 (UT Julian day, latitude, longitude, zone, DST); #COM lines are notes.
 * Dates may end in g/j (Gregorian/Julian calendar). When the Julian day is given it is the
 * exact moment, so the zone offset is taken from it (that covers DST and historical zones).
 */
export function parseAaf(text: string): { records: ChartRecord[]; skipped: number } {
  const out: ChartRecord[] = []
  let skipped = 0
  const lines = text.split(/\r?\n/).map((l) => l.trim())
  for (let i = 0; i < lines.length; i++) {
    const a = /^#A93:(.*)$/i.exec(lines[i])
    if (!a) continue
    let j = i + 1
    const b = /^#B93:(.*)$/i.exec(lines[j] ?? '')
    if (b) j++
    const notes: string[] = []
    while (j < lines.length && /^#(COM|ZNAB|TXT)/i.test(lines[j])) {
      const c = /^#(?:COM|TXT):?\s*(.*)$/i.exec(lines[j])
      if (c && c[1]) notes.push(c[1])
      j++
    }
    const [last, first, sex, date, time, place, country] = a[1].split(',').map((x) => (x ?? '').trim())
    const dm = /^(\d{1,2})\.(\d{1,2})\.(-?\d{1,5})\s*([gjGJ])?$/.exec(date ?? '')
    if (!dm) {
      skipped++
      continue
    }
    const julian = /j/i.test(dm[4] ?? '')
    const unknownTime = !time || /^\*/.test(time)
    const timeM = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(time ?? '')
    const hms = { h: timeM ? +timeM[1] : 12, mi: timeM ? +timeM[2] : 0, s: timeM?.[3] ? +timeM[3] : 0 }
    // The civil date as written, moved to the Gregorian calendar when it was Julian.
    const day = jdn(+dm[3], +dm[2], +dm[1], julian)
    const greg = julian ? fromJdn(day) : { y: +dm[3], m: +dm[2], d: +dm[1] }
    let lat = 0
    let lon = 0
    let tz: TzSpec | null = null
    let hasCoords = false
    if (b) {
      const fb = b[1].split(',').map((x) => x.trim())
      const la = aafCoord(fb[1] ?? '')
      const lo = aafCoord(fb[2] ?? '')
      if (la !== null && lo !== null) {
        lat = la
        lon = lo
        hasCoords = true
      }
      const jd = Number(fb[0])
      if (Number.isFinite(jd) && jd > 0 && !unknownTime) {
        // Local civil time as a day count against the UT moment gives the offset in use.
        const localDays = day - 0.5 + (hms.h + hms.mi / 60 + hms.s / 3600) / 24
        const minutes = Math.round((localDays - jd) * 1440)
        if (Math.abs(minutes) <= 15 * 60) tz = { kind: 'offset', minutes }
      }
      if (!tz) {
        const zone = aafZone(fb[3] ?? '')
        const dst = Number(fb[4] ?? 0) || 0
        if (zone !== null) tz = { kind: 'offset', minutes: zone + dst * 60 }
      }
    }
    if (!hasCoords) {
      skipped++
      continue
    }
    if (!tz) {
      const z = zoneAt(lat, lon)
      tz = z ? { kind: 'zone', zone: z } : { kind: 'lmt' }
    }
    const clean = (x?: string) => (x && x !== '*' ? x : '')
    const name = [clean(first), clean(last)].filter(Boolean).join(' ') || tm('İsimsiz')
    out.push({
      id: crypto.randomUUID(),
      name,
      kind: /^e$/i.test(sex ?? '') ? 'event' : 'person',
      local: { ...greg, ...hms },
      tz,
      timeUnknown: unknownTime || undefined,
      place: { name: [clean(place), clean(country)].filter(Boolean).join(', ') || tm('Bilinmiyor'), lat, lon, zone: zoneAt(lat, lon) ?? undefined },
      notes: notes.join('\n') || undefined,
      tags: [tm('içe-aktarılan')],
      createdAt: now(),
      updatedAt: now()
    })
    i = j - 1
  }
  return { records: out, skipped }
}

// i18n-ignore-start (default names; the UI reads them from src/shared/i18n)
const CSV_COLS: Record<string, string[]> = {
  name: ['name', 'isim', 'ad', 'adı', 'ad soyad'],
  date: ['date', 'tarih', 'doğum tarihi', 'birth date'],
  time: ['time', 'saat', 'doğum saati', 'birth time'],
  place: ['place', 'yer', 'şehir', 'city', 'location'],
  lat: ['lat', 'latitude', 'enlem'],
  lon: ['lon', 'lng', 'longitude', 'boylam'],
  zone: ['zone', 'timezone', 'tz', 'saat dilimi'],
  tags: ['tags', 'etiketler', 'etiket'],
  notes: ['notes', 'notlar', 'not'],
  group: ['group', 'grup'],
  kind: ['kind', 'type', 'tür', 'tip'],
  rodden: ['rodden', 'rating', 'rr']
}
// i18n-ignore-end

function splitCsv(line: string, sep: string): string[] {
  const out: string[] = []
  let cur = ''
  let q = false
  for (let i = 0; i < line.length; i++) {
    const ch = line[i]
    if (ch === '"') {
      if (q && line[i + 1] === '"') {
        cur += '"'
        i++
      } else q = !q
    } else if (ch === sep && !q) {
      out.push(cur)
      cur = ''
    } else cur += ch
  }
  out.push(cur)
  return out.map((x) => x.trim())
}

/** CSV with a header row. Dates as 17.01.1942 or 1942-01-17; coordinates decimal or 38n15. */
export function parseCsv(text: string): { records: ChartRecord[]; skipped: number } {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return { records: [], skipped: 0 }
  const sep = [';', ',', '\t'].sort((a, b) => lines[0].split(b).length - lines[0].split(a).length)[0]
  const head = splitCsv(lines[0], sep).map((h) => h.toLocaleLowerCase('tr'))
  const col = (k: string) => head.findIndex((h) => CSV_COLS[k].includes(h))
  const idx = Object.fromEntries(Object.keys(CSV_COLS).map((k) => [k, col(k)])) as Record<string, number>
  if (idx.name < 0 || idx.date < 0) throw new Error(tm('CSV başlığında en az "isim" ve "tarih" sütunları olmalı.'))
  const out: ChartRecord[] = []
  let skipped = 0
  for (const line of lines.slice(1)) {
    const f = splitCsv(line, sep)
    const get = (k: string) => (idx[k] >= 0 ? f[idx[k]] ?? '' : '')
    const ds = get('date')
    let m = /^(\d{1,2})[./-](\d{1,2})[./-](-?\d{1,4})$/.exec(ds)
    let y: number, mo: number, d: number
    if (m) [d, mo, y] = [+m[1], +m[2], +m[3]]
    else if ((m = /^(-?\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(ds))) [y, mo, d] = [+m[1], +m[2], +m[3]]
    else {
      skipped++
      continue
    }
    const timeM = /^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/.exec(get('time'))
    const num = (s: string) => {
      if (!s) return null
      // Decimal comma (European spreadsheets) as well as a point.
      if (/^-?\d+([.,]\d+)?$/.test(s)) return +s.replace(',', '.')
      return aafCoord(s)
    }
    let lat = num(get('lat'))
    let lon = num(get('lon'))
    // No coordinates: look the place up in the offline city list (first, most populous match).
    if ((lat === null || lon === null) && get('place')) {
      const hit = searchOffline(get('place'), 1)[0]
      if (hit) [lat, lon] = [hit.lat, hit.lon]
    }
    if (lat === null || lon === null || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
      skipped++
      continue
    }
    const zoneText = get('zone')
    // A fixed offset ("+3:00", "-5") or an IANA zone name ("Europe/Istanbul").
    const fixed = /^[+-]?\d{1,2}(:\d{2})?$/.test(zoneText) ? aafZone(zoneText) : null
    const zone = (fixed === null && zoneText) || zoneAt(lat, lon) || 'UTC'
    const kind = /^(event|olay|e)$/i.test(get('kind')) ? 'event' : 'person'
    const rodden = get('rodden').toUpperCase()
    out.push({
      id: crypto.randomUUID(),
      name: get('name') || tm('İsimsiz'),
      kind,
      local: { y, m: mo, d, h: timeM ? +timeM[1] : 12, mi: timeM ? +timeM[2] : 0, s: timeM?.[3] ? +timeM[3] : 0 },
      tz: fixed !== null ? { kind: 'offset', minutes: fixed } : { kind: 'zone', zone },
      timeUnknown: timeM ? undefined : true,
      place: { name: get('place') || tm('Bilinmiyor'), lat, lon, zone },
      tags: get('tags') ? get('tags').split(/[|,]/).map((t) => t.trim()).filter(Boolean) : [tm('içe-aktarılan')],
      notes: get('notes') || undefined,
      group: get('group') || undefined,
      rodden: /^(AA|A|B|C|DD|X|XX)$/.test(rodden) ? rodden : undefined,
      createdAt: now(),
      updatedAt: now()
    })
  }
  return { records: out, skipped }
}

/** Decide the format from the extension or the content. */
export type ParsedFile = { kind: 'records'; format: 'aaf' | 'csv'; records: ChartRecord[]; skipped: number } | { kind: 'json'; data: unknown }

export function parseChartsFile(name: string, text: string): ParsedFile {
  const lower = name.toLowerCase()
  if (lower.endsWith('.aaf') || /#A93:/i.test(text)) return { kind: 'records', format: 'aaf', ...parseAaf(text) }
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || lower.endsWith('.txt') || !/^\s*[[{]/.test(text)) return { kind: 'records', format: 'csv', ...parseCsv(text) }
  return { kind: 'json', data: JSON.parse(text) }
}
