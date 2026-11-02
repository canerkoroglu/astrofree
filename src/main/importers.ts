// Importers for chart files written by other astrology programs.
//   AAF  (Astrodienst / AstroGold / Solar Fire / Janus "Astrological Exchange Format")
//   CSV  (name;date;time;place;lat;lon;zone — header row decides the columns)
import type { ChartRecord, TzSpec } from '@shared/types'
import { zoneAt } from './geo'

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

export function parseAaf(text: string): ChartRecord[] {
  const out: ChartRecord[] = []
  const lines = text.split(/\r?\n/)
  for (let i = 0; i < lines.length; i++) {
    const a = /^#A93:(.*)$/.exec(lines[i].trim())
    if (!a) continue
    const b = /^#B93:(.*)$/.exec((lines[i + 1] ?? '').trim())
    const fa = a[1].split(',')
    // #A93:name,firstname,sex,date,time,place,country
    const [last, first, sex, date, time, place, country] = fa.map((x) => (x ?? '').trim())
    const dm = /^(\d{1,2})\.(\d{1,2})\.(-?\d{1,4})$/.exec(date ?? '')
    if (!dm) continue
    const unknownTime = !time || time === '*' || /^\*/.test(time)
    const tm = /^(\d{1,2}):(\d{1,2})(?::(\d{1,2}))?/.exec(time ?? '')
    let lat = 0
    let lon = 0
    let tz: TzSpec | null = null
    if (b) {
      // #B93:jd,lat,lon,zone,dst
      const fb = b[1].split(',').map((x) => x.trim())
      lat = aafCoord(fb[1] ?? '') ?? 0
      lon = aafCoord(fb[2] ?? '') ?? 0
      const zone = aafZone(fb[3] ?? '')
      const dst = Number(fb[4] ?? 0) || 0
      if (zone !== null) tz = { kind: 'offset', minutes: zone + dst * 60 }
    }
    if (!tz) {
      const z = zoneAt(lat, lon)
      tz = z ? { kind: 'zone', zone: z } : { kind: 'lmt' }
    }
    const name = [first, last].filter((x) => x && x !== '*').join(' ') || 'İsimsiz'
    out.push({
      id: crypto.randomUUID(),
      name,
      kind: sex === 'e' ? 'event' : 'person',
      local: { y: +dm[3], m: +dm[2], d: +dm[1], h: tm ? +tm[1] : 12, mi: tm ? +tm[2] : 0, s: tm?.[3] ? +tm[3] : 0 },
      tz,
      timeUnknown: unknownTime || undefined,
      place: { name: [place, country].filter((x) => x && x !== '*').join(', ') || 'Bilinmiyor', lat, lon, zone: zoneAt(lat, lon) ?? undefined },
      tags: ['içe-aktarılan'],
      createdAt: now(),
      updatedAt: now()
    })
  }
  return out
}

const CSV_COLS: Record<string, string[]> = {
  name: ['name', 'isim', 'ad', 'adı', 'ad soyad'],
  date: ['date', 'tarih', 'doğum tarihi', 'birth date'],
  time: ['time', 'saat', 'doğum saati', 'birth time'],
  place: ['place', 'yer', 'şehir', 'city', 'location'],
  lat: ['lat', 'latitude', 'enlem'],
  lon: ['lon', 'lng', 'longitude', 'boylam'],
  zone: ['zone', 'timezone', 'tz', 'saat dilimi'],
  tags: ['tags', 'etiketler', 'etiket'],
  notes: ['notes', 'notlar', 'not']
}

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
export function parseCsv(text: string): ChartRecord[] {
  const lines = text.split(/\r?\n/).filter((l) => l.trim())
  if (lines.length < 2) return []
  const sep = [';', ',', '\t'].sort((a, b) => lines[0].split(b).length - lines[0].split(a).length)[0]
  const head = splitCsv(lines[0], sep).map((h) => h.toLocaleLowerCase('tr'))
  const col = (k: string) => head.findIndex((h) => CSV_COLS[k].includes(h))
  const idx = Object.fromEntries(Object.keys(CSV_COLS).map((k) => [k, col(k)])) as Record<string, number>
  if (idx.name < 0 || idx.date < 0) throw new Error('CSV başlığında en az "isim" ve "tarih" sütunları olmalı.')
  const out: ChartRecord[] = []
  for (const line of lines.slice(1)) {
    const f = splitCsv(line, sep)
    const get = (k: string) => (idx[k] >= 0 ? f[idx[k]] ?? '' : '')
    const ds = get('date')
    let m = /^(\d{1,2})[./-](\d{1,2})[./-](-?\d{1,4})$/.exec(ds)
    let y: number, mo: number, d: number
    if (m) [d, mo, y] = [+m[1], +m[2], +m[3]]
    else if ((m = /^(-?\d{1,4})-(\d{1,2})-(\d{1,2})$/.exec(ds))) [y, mo, d] = [+m[1], +m[2], +m[3]]
    else continue
    const tm = /^(\d{1,2})[:.](\d{1,2})(?:[:.](\d{1,2}))?$/.exec(get('time'))
    const num = (s: string, isLat: boolean) => {
      if (!s) return null
      if (/^-?\d+(\.\d+)?$/.test(s)) return +s
      const v = aafCoord(s)
      return v === null ? null : v
    }
    const lat = num(get('lat'), true) ?? 0
    const lon = num(get('lon'), false) ?? 0
    const zone = get('zone') || zoneAt(lat, lon) || 'UTC'
    out.push({
      id: crypto.randomUUID(),
      name: get('name') || 'İsimsiz',
      kind: 'person',
      local: { y, m: mo, d, h: tm ? +tm[1] : 12, mi: tm ? +tm[2] : 0, s: tm?.[3] ? +tm[3] : 0 },
      tz: { kind: 'zone', zone },
      timeUnknown: tm ? undefined : true,
      place: { name: get('place') || 'Bilinmiyor', lat, lon, zone },
      tags: get('tags') ? get('tags').split(/[|,]/).map((t) => t.trim()).filter(Boolean) : ['içe-aktarılan'],
      notes: get('notes') || undefined,
      createdAt: now(),
      updatedAt: now()
    })
  }
  return out
}

/** Decide the format from the extension or the content. */
export function parseChartsFile(name: string, text: string): ChartRecord[] | unknown {
  const lower = name.toLowerCase()
  if (lower.endsWith('.aaf') || /#A93:/.test(text)) return parseAaf(text)
  if (lower.endsWith('.csv') || lower.endsWith('.tsv') || lower.endsWith('.txt')) return parseCsv(text)
  return JSON.parse(text)
}
