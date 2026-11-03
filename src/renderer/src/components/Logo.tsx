// The AstroFree mark: a plain eight-pointed star. The same geometry is used for
// the application icon (scripts/build-icon.mjs).

export const STAR_POINTS = 8
export const STAR_INNER = 0.42

/** Polygon points of the star centred at (c, c) with outer radius r. */
export function starPath(c: number, r: number, inner = STAR_INNER): string {
  const pts: string[] = []
  for (let i = 0; i < STAR_POINTS * 2; i++) {
    const rad = i % 2 === 0 ? r : r * inner
    const a = (Math.PI / STAR_POINTS) * i - Math.PI / 2
    pts.push(`${(c + rad * Math.cos(a)).toFixed(2)},${(c + rad * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}

export default function Logo({ size = 18, className = '' }: { size?: number; className?: string }) {
  return (
    <svg className={`logo ${className}`} width={size} height={size} viewBox="0 0 100 100" aria-hidden>
      <polygon points={starPath(50, 48)} fill="currentColor" />
    </svg>
  )
}
