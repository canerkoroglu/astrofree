// North and South Indian chart diagrams (sidereal, whole-sign houses from the Lagna).
import { POINT, SIGNS } from '../lib/astro'
import { t } from '../lib/i18n'

const S = 300
const short = (k: string) => (k === 'node' ? 'Ra' : k === 'snode' ? 'Ke' : k === 'asc' ? 'As' : POINT[k]?.short ?? k)

/** Planets per sign (0 = Aries), Lagna marked. */
function bySign(points: { key: string; lon: number }[]): string[][] {
  const out: string[][] = Array.from({ length: 12 }, () => [])
  for (const p of points) out[Math.floor((((p.lon % 360) + 360) % 360) / 30)].push(short(p.key))
  return out
}

function Labels({ x, y, items, max = 3 }: { x: number; y: number; items: string[]; max?: number }) {
  const rows: string[] = []
  for (let i = 0; i < items.length; i += max) rows.push(items.slice(i, i + max).join(' '))
  return (
    <>
      {rows.map((r, i) => (
        <text key={i} x={x} y={y + (i - (rows.length - 1) / 2) * 14} textAnchor="middle" dominantBaseline="central" className="vc-planets">
          {r}
        </text>
      ))}
    </>
  )
}

/** South Indian: signs fixed in a 4×4 frame (Pisces top-left), houses follow. */
function South({ points, lagna }: { points: { key: string; lon: number }[]; lagna: number | null }) {
  const cells: [number, number][] = [
    [0, 1], [0, 2], [0, 3], [1, 3], [2, 3], [3, 3], [3, 2], [3, 1], [3, 0], [2, 0], [1, 0], [0, 0]
  ] // Aries … Pisces as [row, col]
  const c = S / 4
  const signs = bySign(points.filter((p) => p.key !== 'asc'))
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="vedic-chart" role="img" aria-label={t('Güney Hint çarkı')}>
      <rect x={0.5} y={0.5} width={S - 1} height={S - 1} className="vc-line" />
      {cells.map(([r, col], s) => (
        <g key={s}>
          <rect x={col * c} y={r * c} width={c} height={c} className={`vc-line${lagna === s ? ' vc-lagna' : ''}`} />
          <text x={col * c + 5} y={r * c + 13} className="vc-sign">
            {SIGNS[s].name.slice(0, 3)}
          </text>
          {lagna === s && <line x1={col * c} y1={r * c + 22} x2={col * c + 22} y2={r * c} className="vc-line" />}
          <Labels x={col * c + c / 2} y={r * c + c / 2 + 6} items={signs[s]} />
        </g>
      ))}
      <text x={S / 2} y={S / 2} textAnchor="middle" dominantBaseline="central" className="vc-title">
        {t('Rāśi (D1)')}
      </text>
    </svg>
  )
}

/** North Indian: houses fixed (1st at the top diamond), sign numbers written in each house. */
function North({ points, lagna }: { points: { key: string; lon: number }[]; lagna: number }) {
  const centres: [number, number][] = [
    [S / 2, S / 4], [S / 4, S / 12], [S / 12, S / 4], [S / 4, S / 2], [S / 12, (3 * S) / 4], [S / 4, (11 * S) / 12],
    [S / 2, (3 * S) / 4], [(3 * S) / 4, (11 * S) / 12], [(11 * S) / 12, (3 * S) / 4], [(3 * S) / 4, S / 2], [(11 * S) / 12, S / 4], [(3 * S) / 4, S / 12]
  ]
  const signs = bySign(points.filter((p) => p.key !== 'asc'))
  return (
    <svg viewBox={`0 0 ${S} ${S}`} className="vedic-chart" role="img" aria-label={t('Kuzey Hint çarkı')}>
      <rect x={0.5} y={0.5} width={S - 1} height={S - 1} className="vc-line" />
      <line x1={0} y1={0} x2={S} y2={S} className="vc-line" />
      <line x1={S} y1={0} x2={0} y2={S} className="vc-line" />
      <polygon points={`${S / 2},0 ${S},${S / 2} ${S / 2},${S} 0,${S / 2}`} className="vc-line" />
      {centres.map(([x, y], h) => {
        const sign = (lagna + h) % 12
        const small = [1, 2, 4, 5, 7, 8, 10, 11].includes(h)
        return (
          <g key={h}>
            <text x={x} y={y - (small ? 16 : 26)} textAnchor="middle" className={`vc-num${h === 0 ? ' vc-lagna-num' : ''}`}>
              {sign + 1}
            </text>
            <Labels x={x} y={y + (small ? 2 : 0)} items={signs[sign]} max={small ? 2 : 3} />
          </g>
        )
      })}
    </svg>
  )
}

export default function VedicChart({ style, points }: { style: 'north' | 'south'; points: { key: string; lon: number }[] }) {
  const asc = points.find((p) => p.key === 'asc')
  const lagna = asc ? Math.floor((((asc.lon % 360) + 360) % 360) / 30) : null
  if (style === 'north' && lagna !== null) return <North points={points} lagna={lagna} />
  return <South points={points} lagna={lagna} />
}
