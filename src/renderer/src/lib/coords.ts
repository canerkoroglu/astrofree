// Coordinate parsing and formatting. Accepts decimal degrees and the common
// astrological / atlas forms: 38n15, 85w46, 38°15'K, 38 15 30 N, 41K01, 28D57.

const NEG = new Set(['S', 'W', 'G', 'B'])
const POS = new Set(['N', 'E', 'K', 'D'])
const LAT_LETTERS = new Set(['N', 'S', 'K', 'G'])
const LON_LETTERS = new Set(['E', 'W', 'D', 'B'])

/** Parse a latitude (isLat) or longitude string. Returns null when invalid. */
export function parseCoord(input: string, isLat: boolean): number | null {
  const raw = input.trim().toLocaleUpperCase('tr').replace(/,/g, '.')
  if (!raw) return null
  const letters = raw.match(/[NSEWKGDB]/g) ?? []
  if (letters.length > 1) return null
  const letter = letters[0]
  if (letter && (isLat ? !LAT_LETTERS.has(letter) : !LON_LETTERS.has(letter))) return null

  const nums = raw.match(/\d+(?:\.\d+)?/g)?.map(Number) ?? []
  if (!nums.length || nums.length > 3) return null
  let value: number
  if (nums.length === 1 && !letter && /^[+-]?\d+(\.\d+)?$/.test(raw.replace(/\s|°/g, ''))) {
    value = Math.abs(nums[0])
  } else {
    const [d, m = 0, s = 0] = nums
    if (m >= 60 || s >= 60) return null
    value = d + m / 60 + s / 3600
  }
  let sign = raw.startsWith('-') ? -1 : 1
  if (letter && NEG.has(letter)) sign = -1
  if (letter && POS.has(letter)) sign = 1
  const v = sign * value
  const max = isLat ? 90 : 180
  return Math.abs(v) <= max ? v : null
}

const p2 = (n: number) => String(n).padStart(2, '0')

/** 38°15'00" K style, for showing what was understood. */
export function fmtDms(v: number, isLat: boolean): string {
  const a = Math.abs(v)
  let d = Math.floor(a)
  let m = Math.floor((a - d) * 60)
  let s = Math.round(((a - d) * 60 - m) * 60)
  if (s === 60) {
    s = 0
    m++
  }
  if (m === 60) {
    m = 0
    d++
  }
  const h = isLat ? (v >= 0 ? 'K' : 'G') : v >= 0 ? 'D' : 'B'
  return `${d}°${p2(m)}'${p2(s)}" ${h}`
}
