// Calendar and timezone conversions. Moments are kept as Julian Day (UT);
// local wall-clock time is derived per chart from its TzSpec.
import type { LocalDateTime, TzSpec } from '@shared/types'

const GREGORIAN_START_JD = 2299160.5 // 1582-10-15

function isGregorian(y: number, m: number, d: number): boolean {
  return y > 1582 || (y === 1582 && (m > 10 || (m === 10 && d >= 15)))
}

/** Meeus, Astronomical Algorithms ch. 7. Julian calendar before 1582-10-15. */
export function julday(y: number, m: number, d: number, hours: number): number {
  const greg = isGregorian(y, m, d)
  if (m <= 2) {
    y -= 1
    m += 12
  }
  const a = Math.floor(y / 100)
  const b = greg ? 2 - a + Math.floor(a / 4) : 0
  return Math.floor(365.25 * (y + 4716)) + Math.floor(30.6001 * (m + 1)) + d + b - 1524.5 + hours / 24
}

export function revjul(jd: number): LocalDateTime {
  // Round to the nearest second first so 12:59:59.9999 does not show as 12:59:59.
  const jdr = Math.round(jd * 86400) / 86400
  const z = Math.floor(jdr + 0.5)
  const f = jdr + 0.5 - z
  let a = z
  if (z + 0.5 >= GREGORIAN_START_JD + 0.5) {
    const alpha = Math.floor((z - 1867216.25) / 36524.25)
    a = z + 1 + alpha - Math.floor(alpha / 4)
  }
  const b = a + 1524
  const c = Math.floor((b - 122.1) / 365.25)
  const dd = Math.floor(365.25 * c)
  const e = Math.floor((b - dd) / 30.6001)
  const day = b - dd - Math.floor(30.6001 * e)
  const m = e < 14 ? e - 1 : e - 13
  const y = m > 2 ? c - 4716 : c - 4715
  let secs = Math.round(f * 86400)
  const h = Math.floor(secs / 3600)
  secs -= h * 3600
  const mi = Math.floor(secs / 60)
  return { y, m, d: day, h, mi, s: secs - mi * 60 }
}

export const jdToMs = (jd: number) => (jd - 2440587.5) * 86400000
export const msToJd = (ms: number) => ms / 86400000 + 2440587.5
export const nowJd = () => msToJd(Date.now())

const fmtCache = new Map<string, Intl.DateTimeFormat>()
function zoneFormatter(zone: string): Intl.DateTimeFormat {
  let f = fmtCache.get(zone)
  if (!f) {
    f = new Intl.DateTimeFormat('en-US', {
      timeZone: zone,
      hourCycle: 'h23',
      era: 'short',
      year: 'numeric',
      month: 'numeric',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      second: 'numeric'
    })
    fmtCache.set(zone, f)
  }
  return f
}

/** UTC offset in minutes (east positive) of an IANA zone at an instant. */
export function zoneOffsetMinutes(zone: string, ms: number): number {
  const parts = zoneFormatter(zone).formatToParts(new Date(ms))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value ?? 0)
  let year = get('year')
  if (parts.find((p) => p.type === 'era')?.value === 'BC') year = 1 - year
  // setUTCFullYear avoids Date.UTC's 0-99 → 1900-1999 mapping.
  const d = new Date(0)
  d.setUTCFullYear(year, get('month') - 1, get('day'))
  d.setUTCHours(get('hour'), get('minute'), get('second'), 0)
  return Math.round((d.getTime() - Math.floor(ms / 1000) * 1000) / 60000)
}

export function isValidZone(zone: string): boolean {
  try {
    zoneFormatter(zone)
    return true
  } catch {
    return false
  }
}

/** Offset (minutes east) for a chart's timezone setting at a UT instant. */
export function offsetAt(tz: TzSpec, jdUT: number, lon: number): number {
  if (tz.kind === 'offset') return tz.minutes
  if (tz.kind === 'lmt') return lon * 4
  try {
    return zoneOffsetMinutes(tz.zone, jdToMs(jdUT))
  } catch {
    return 0
  }
}

export function localToJd(local: LocalDateTime, tz: TzSpec, lon: number): number {
  const jdLocal = julday(local.y, local.m, local.d, local.h + local.mi / 60 + local.s / 3600)
  // Two passes resolve DST transitions: guess with the offset at the naive
  // instant, then re-evaluate at the corrected one.
  const off1 = offsetAt(tz, jdLocal, lon)
  const jd1 = jdLocal - off1 / 1440
  const off2 = offsetAt(tz, jd1, lon)
  return off2 === off1 ? jd1 : jdLocal - off2 / 1440
}

export function jdToLocal(jdUT: number, tz: TzSpec, lon: number): LocalDateTime {
  return revjul(jdUT + offsetAt(tz, jdUT, lon) / 1440)
}

const pad = (n: number, w = 2) => String(Math.abs(n)).padStart(w, '0')

export function fmtOffset(minutes: number): string {
  const sign = minutes >= 0 ? '+' : '−'
  const a = Math.abs(Math.round(minutes))
  return `UTC${sign}${pad(Math.floor(a / 60))}:${pad(a % 60)}`
}

export type DateOrder = 'DMY' | 'MDY' | 'YMD'
let dateOrder: DateOrder = 'DMY'
/** Set by the app from the language and the user's date-format setting. */
export function setDateOrder(o: DateOrder): void {
  dateOrder = o
}
export const getDateOrder = () => dateOrder

/** Date only, in the user's order: 17.01.1942 · 01/17/1942 · 1942-01-17 */
export function fmtDate(l: { y: number; m: number; d: number }, order: DateOrder = dateOrder): string {
  const year = l.y < 0 ? `${l.y}` : pad(l.y, 4)
  if (order === 'MDY') return `${pad(l.m)}/${pad(l.d)}/${year}`
  if (order === 'YMD') return `${year}-${pad(l.m)}-${pad(l.d)}`
  return `${pad(l.d)}.${pad(l.m)}.${year}`
}

export function fmtLocal(l: LocalDateTime, seconds = false): string {
  return `${fmtDate(l)} ${pad(l.h)}:${pad(l.mi)}${seconds ? ':' + pad(l.s) : ''}`
}

/** All IANA zones the runtime knows (for pickers). */
export function allZones(): string[] {
  try {
    return (Intl as unknown as { supportedValuesOf: (k: string) => string[] }).supportedValuesOf('timeZone')
  } catch {
    return ['UTC', 'Europe/Istanbul', 'Europe/London', 'America/New_York']
  }
}
export const systemZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone || 'UTC'

export function tzLabel(tz: TzSpec): string {
  if (tz.kind === 'zone') return tz.zone
  if (tz.kind === 'lmt') return 'LMT'
  return fmtOffset(tz.minutes)
}

const daysInMonth = (y: number, m: number) => {
  if (m === 2) {
    const leap = isGregorian(y, 2, 28) ? (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0 : y % 4 === 0
    return leap ? 29 : 28
  }
  return [4, 6, 9, 11].includes(m) ? 30 : 31
}

export type StepUnit = 'sec' | 'min' | 'hour' | 'day' | 'week' | 'month' | 'year'

/** Move a moment by n units. Months/years step in the chart's local calendar. */
export function stepJd(jd: number, unit: StepUnit, n: number, tz: TzSpec, lon: number): number {
  switch (unit) {
    case 'sec':
      return jd + n / 86400
    case 'min':
      return jd + n / 1440
    case 'hour':
      return jd + n / 24
    case 'day':
      return jd + n
    case 'week':
      return jd + 7 * n
    case 'month':
    case 'year': {
      const l = jdToLocal(jd, tz, lon)
      let y = l.y
      let m = l.m
      if (unit === 'year') y += n
      else {
        const t = y * 12 + (m - 1) + n
        y = Math.floor(t / 12)
        m = t - y * 12 + 1
      }
      const d = Math.min(l.d, daysInMonth(y, m))
      return localToJd({ ...l, y, m, d }, tz, lon)
    }
  }
}
