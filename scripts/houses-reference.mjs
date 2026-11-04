// House cusps from the classical geometric definitions, written independently of the Swiss Ephemeris
// so the engine test can check every house system the app offers. Degrees throughout.
const R = Math.PI / 180
const n = (x) => ((x % 360) + 360) % 360
const sin = (x) => Math.sin(x * R)
const cos = (x) => Math.cos(x * R)
const tan = (x) => Math.tan(x * R)
const atan2 = (y, x) => n(Math.atan2(y, x) / R)

/** Ecliptic longitude on the position circle whose oblique ascension is `oa`, for pole height `pole`. */
const ascAt = (oa, pole, eps) => {
  const m = oa - 90
  return atan2(cos(m), -(sin(m) * cos(eps) + tan(pole) * sin(eps)))
}
/** Ecliptic point with right ascension `ra`. */
const raToLon = (ra, eps) => atan2(sin(ra), cos(ra) * cos(eps))
const decOf = (lon, eps) => Math.asin(sin(eps) * sin(lon)) / R

export const mcOf = (armc, eps) => raToLon(armc, eps)
export const ascOf = (armc, lat, eps) => ascAt(armc + 90, lat, eps)

/** Whole circle from the four quadrant cusps 10, 11, 12, 1, 2, 3 (the rest are opposite). */
const circle = (c10, c11, c12, c1, c2, c3) => {
  const half = [c1, c2, c3, c10 + 180, c11 + 180, c12 + 180]
  return [...half, ...half.map((c) => c + 180)].map(n)
}

/** Cusps 1..12 for a Swiss Ephemeris house code, or null when the system has no solution here. */
export function referenceCusps(hsys, armc, lat, eps) {
  const mc = mcOf(armc, eps)
  const asc = ascOf(armc, lat, eps)
  const poleCircles = (offsets, poleOf) => {
    const [c11, c12, c2, c3] = offsets.map((h) => ascAt(armc + h, poleOf(h), eps))
    return circle(mc, c11, c12, asc, c2, c3)
  }
  switch (hsys) {
    case 'E':
      return Array.from({ length: 12 }, (_, i) => n(asc + 30 * i))
    case 'W':
      return Array.from({ length: 12 }, (_, i) => n(Math.floor(asc / 30) * 30 + 30 * i))
    case 'O': {
      const a = n(asc - mc)
      const b = n(mc + 180 - asc)
      return circle(mc, mc + a / 3, mc + (2 * a) / 3, asc, asc + b / 3, asc + (2 * b) / 3)
    }
    case 'R': // Regiomontanus: equator in 30° steps, pole tan P = tan φ · sin H
      return poleCircles([30, 60, 120, 150], (h) => Math.atan(tan(lat) * sin(h)) / R)
    case 'T': // Topocentric (Polich-Page): tan P = tan φ · k/3
      return poleCircles([30, 60, 120, 150], (h) => Math.atan(tan(lat) * ({ 30: 1, 60: 2, 120: 2, 150: 1 }[h] / 3)) / R)
    case 'C': {
      // Campanus: prime vertical in 30° steps
      const [c11, c12, c2, c3] = [30, 60, 120, 150].map((a) => {
        const h = Math.atan2(sin(a) * cos(lat), cos(a)) / R
        return ascAt(armc + h, Math.asin(sin(lat) * sin(a)) / R, eps)
      })
      return circle(mc, c11, c12, asc, c2, c3)
    }
    case 'B': {
      // Alcabitius: the ascendant degree's diurnal and nocturnal semi-arcs trisected in right ascension
      const ad = Math.asin(tan(lat) * tan(decOf(asc, eps))) / R
      const dsa = 90 + ad
      const nsa = 180 - dsa
      return circle(mc, raToLon(armc + dsa / 3, eps), raToLon(armc + (2 * dsa) / 3, eps), asc, raToLon(armc + dsa + nsa / 3, eps), raToLon(armc + dsa + (2 * nsa) / 3, eps))
    }
    case 'P': {
      // Placidus: each cusp trisects its own semi-arc (solved iteratively)
      const cusp = (f, upper) => {
        let lon = n(mc + (upper ? 90 : 270) * f)
        for (let i = 0; i < 100; i++) {
          const x = tan(lat) * tan(decOf(lon, eps))
          if (Math.abs(x) >= 1) return null
          const ad = Math.asin(x) / R
          const next = raToLon(upper ? armc + f * (90 + ad) : armc + 180 - f * (90 - ad), eps)
          if (Math.abs(((next - lon + 540) % 360) - 180) < 1e-11) return next
          lon = next
        }
        return lon
      }
      const c = [cusp(1 / 3, true), cusp(2 / 3, true), cusp(2 / 3, false), cusp(1 / 3, false)]
      return c.includes(null) ? null : circle(mc, c[0], c[1], asc, c[2], c[3])
    }
    case 'K': {
      // Koch: ascendants at the times that trisect the MC degree's diurnal semi-arc, continued below the horizon
      const x = tan(lat) * tan(decOf(mc, eps))
      if (Math.abs(x) >= 1) return null
      const step = (90 + Math.asin(x) / R) / 3
      const oa = (k) => ascAt(armc + 90 + k * step, lat, eps)
      return circle(mc, oa(-2), oa(-1), asc, oa(1), oa(2))
    }
    case 'M': // Morinus: equator in 30° steps projected through the ecliptic poles
      return Array.from({ length: 12 }, (_, i) => atan2(sin(armc + 90 + 30 * i) * cos(eps), cos(armc + 90 + 30 * i)))
    case 'X': // Meridian (axial rotation): ecliptic points at right ascension ARMC + 30k
      return Array.from({ length: 12 }, (_, i) => raToLon(armc + 90 + 30 * i, eps))
    default:
      throw new Error(`no reference for house system ${hsys}`)
  }
}

/** Is an ecliptic longitude on the eastern side of the sky (rising half) at this ARMC? */
export function isEastern(lon, armc, eps) {
  const ra = atan2(sin(lon) * cos(eps), cos(lon))
  return sin(armc - ra) < 0
}

export const arcsec = (a, b) => Math.abs(((a - b + 540) % 360) - 180) * 3600
