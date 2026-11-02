import { useMemo, useState } from 'react'
import type { AppSettings } from '@shared/types'
import {
  ASPECT,
  dignity,
  findAspects,
  fmtDecl,
  fmtOrb,
  fmtPos,
  glyph,
  norm360,
  POINT,
  SIGNS,
  signGlyph,
  splitDeg,
  type Aspect,
  type ChartPoint,
  type Layer
} from '../lib/astro'

const C = 500
const ELEMENT_COLOR = { fire: '#d9452b', earth: '#3f8f3a', air: '#c48f00', water: '#2b6cc4' } as const
export const LAYER_COLOR: Record<string, string> = {
  natal: 'var(--ink)',
  transit: '#1d8a55',
  progressed: '#8a43b8',
  solarArc: '#c25a14',
  synastry: '#1f62c4',
  solarReturn: '#b07d00',
  lunarReturn: '#3f7fae'
}
const ASPECT_COLOR = { hard: '#d23c3c', soft: '#2d62c8', minor: '#2f9a5a' } as const

interface Props {
  natal: Layer
  outers: Layer[]
  settings: AppSettings
  aspectLayer: number // -1 natal-natal, otherwise index into outers
  onWheel?: (deltaY: number, shift: boolean) => void
}

interface Ring {
  layer: Layer
  index: number // -1 natal
  r0: number // outer radius
  r1: number // inner radius
}

interface Placed {
  p: ChartPoint
  display: number
}

/** Spread glyphs around the circle so none are closer than minSep degrees. */
function spread(points: ChartPoint[], minSep: number): Placed[] {
  const n = points.length
  if (!n) return []
  const sep = Math.min(minSep, 360 / n)
  const sorted = [...points].sort((a, b) => a.lon - b.lon)
  // Cut the circle at its widest gap so the problem becomes linear.
  let cut = 0
  let widest = -1
  for (let i = 0; i < n; i++) {
    const gap = norm360(sorted[(i + 1) % n].lon - sorted[i].lon) || (n === 1 ? 360 : 0)
    if (gap > widest) {
      widest = gap
      cut = (i + 1) % n
    }
  }
  const lin = sorted.map((_, k) => sorted[(cut + k) % n])
  const base = lin[0].lon
  const vals = lin.map((p) => base + norm360(p.lon - base))

  type Cluster = { from: number; to: number; center: number }
  let clusters: Cluster[] = vals.map((v, i) => ({ from: i, to: i, center: v }))
  const first = (c: Cluster) => c.center - ((c.to - c.from) * sep) / 2
  const last = (c: Cluster) => c.center + ((c.to - c.from) * sep) / 2
  for (let guard = 0; guard < n * 2; guard++) {
    let merged = false
    const next: Cluster[] = []
    for (const c of clusters) {
      const prev = next[next.length - 1]
      if (prev && last(prev) + sep > first(c) + 1e-9) {
        const from = prev.from
        const to = c.to
        let sum = 0
        for (let i = from; i <= to; i++) sum += vals[i]
        next[next.length - 1] = { from, to, center: sum / (to - from + 1) }
        merged = true
      } else next.push(c)
    }
    clusters = next
    if (!merged) break
  }
  const out: Placed[] = []
  for (const c of clusters) {
    for (let i = c.from; i <= c.to; i++) out.push({ p: lin[i], display: norm360(first(c) + (i - c.from) * sep) })
  }
  return out
}

export default function ChartWheel({ natal, outers, settings, aspectLayer, onWheel }: Props) {
  const [hover, setHover] = useState<{ ring: number; key: string; x: number; y: number } | null>(null)

  const rot = settings.orientation === 'asc' ? natal.asc : 0
  const ang = (lon: number) => ((180 + lon - rot) * Math.PI) / 180
  const pt = (lon: number, r: number) => {
    const a = ang(lon)
    return [C + r * Math.cos(a), C - r * Math.sin(a)] as const
  }

  const rZ1 = 462
  const rZ2 = 412
  const rTick = 402
  const layout = useMemo(() => {
    const n = 1 + outers.length
    const hubW = n === 1 ? 32 : n === 2 ? 30 : 26
    const aspectR = n === 1 ? 236 : n === 2 ? 212 : 186
    const ringsSpace = rTick - (aspectR + hubW)
    const w = ringsSpace / n
    const rings: Ring[] = []
    // Outermost ring holds the last outer layer; natal sits innermost.
    for (let i = 0; i < n; i++) {
      const r0 = rTick - i * w
      const layerIdx = outers.length - 1 - i
      const layer = layerIdx >= 0 ? outers[layerIdx] : natal
      rings.push({ layer, index: layerIdx, r0, r1: r0 - w })
    }
    return { rings, w, hubOuter: aspectR + hubW, aspectR }
  }, [outers, natal])

  const aspects: Aspect[] = useMemo(() => {
    if (aspectLayer >= 0 && outers[aspectLayer]) {
      const list = findAspects(outers[aspectLayer].points, natal.points, settings, true)
      if (settings.showNatalAspectsInBiwheel) list.push(...findAspects(natal.points, null, settings, false))
      return list
    }
    return findAspects(natal.points, null, settings, false)
  }, [natal, outers, settings, aspectLayer])

  const hoverPoint = hover
    ? (hover.ring < 0 ? natal : outers[hover.ring])?.points.find((p) => p.key === hover.key) ?? null
    : null
  const hoverLayer = hover ? (hover.ring < 0 ? natal : outers[hover.ring]) : null
  const isHoverAspect = (x: Aspect) => hoverPoint !== null && (x.a === hoverPoint || x.b === hoverPoint)

  const { rings, w, aspectR, hubOuter } = layout
  const cuspLines = natal.cusps.length === 12

  return (
    <div className="wheel-wrap" onWheel={(e) => onWheel?.(e.deltaY, e.shiftKey)}>
      <svg viewBox="-90 -30 1180 1060" className="wheel" role="img" aria-label="Harita çarkı">
        {/* Zodiac band */}
        <circle cx={C} cy={C} r={rZ1} className="w-line w-strong" fill="none" />
        {SIGNS.map((s, i) => {
          const a0 = i * 30
          const a1 = a0 + 30
          const [x1, y1] = pt(a0, rZ1)
          const [x2, y2] = pt(a1, rZ1)
          const [x3, y3] = pt(a1, rZ2)
          const [x4, y4] = pt(a0, rZ2)
          const [gx, gy] = pt(a0 + 15, (rZ1 + rZ2) / 2)
          const col = ELEMENT_COLOR[s.element]
          return (
            <g key={s.name}>
              <path
                d={`M${x1},${y1} A${rZ1},${rZ1} 0 0 0 ${x2},${y2} L${x3},${y3} A${rZ2},${rZ2} 0 0 1 ${x4},${y4} Z`}
                style={{ fill: col, fillOpacity: 0.09 }}
                className="w-line"
              />
              <text x={gx} y={gy} className="w-glyph" style={{ fill: col, fontSize: 30 }} dominantBaseline="central" textAnchor="middle">
                {signGlyph(i)}
              </text>
            </g>
          )
        })}
        {/* Degree ticks */}
        {Array.from({ length: 360 }, (_, d) => {
          const len = d % 10 === 0 ? 10 : d % 5 === 0 ? 7 : 4
          const [x1, y1] = pt(d, rZ2)
          const [x2, y2] = pt(d, rZ2 - len)
          return <line key={d} x1={x1} y1={y1} x2={x2} y2={y2} className="w-tick" />
        })}
        <circle cx={C} cy={C} r={rZ2} className="w-line w-strong" fill="none" />

        {/* Ring borders */}
        {rings.map((r, i) => (
          <circle key={i} cx={C} cy={C} r={r.r1} className="w-line" fill="none" />
        ))}
        <circle cx={C} cy={C} r={aspectR} className="w-line w-strong" fill="none" />

        {/* House cusps */}
        {cuspLines &&
          natal.cusps.map((c, i) => {
            const angular = i % 3 === 0
            const [x1, y1] = pt(c, angular ? rZ1 + 20 : rZ2)
            const [x2, y2] = pt(c, aspectR)
            const mid = norm360(c + norm360(natal.cusps[(i + 1) % 12] - c) / 2)
            const [hx, hy] = pt(mid, (hubOuter + aspectR) / 2)
            const [lx, ly] = pt(c, rZ1 + (angular ? 24 : 10))
            const sd = splitDeg(c)
            const label = ['AC', 'IC', 'DC', 'MC'][i / 3]
            return (
              <g key={i}>
                <line x1={x1} y1={y1} x2={x2} y2={y2} className={angular ? 'w-cusp w-angle' : 'w-cusp'} />
                <text x={hx} y={hy} className="w-house" textAnchor="middle" dominantBaseline="central">
                  {i + 1}
                </text>
                <text
                  x={lx}
                  y={ly}
                  className={angular ? 'w-cusplabel w-anglelabel' : 'w-cusplabel'}
                  textAnchor={lx < C - 60 ? 'end' : lx > C + 60 ? 'start' : 'middle'}
                  dominantBaseline="central"
                >
                  {angular ? `${label} ` : ''}
                  {sd.deg}°<tspan className="w-glyph">{signGlyph(sd.sign)}</tspan>
                  {String(sd.min).padStart(2, '0')}'
                </text>
              </g>
            )
          })}

        {/* Aspect lines */}
        <g>
          {aspects.map((x, i) => {
            if (x.aspect.key === 'conjunction') return null
            const [x1, y1] = pt(x.a.lon, aspectR)
            const [x2, y2] = pt(x.b.lon, aspectR)
            const def = ASPECT[x.aspect.key]
            const set = settings.aspects[x.aspect.key]
            const outerAspect = aspectLayer >= 0 && !!outers[aspectLayer]?.points.includes(x.a)
            const maxOrb = Math.max(0.1, outerAspect ? set.outerOrb : set.orb)
            const tight = Math.max(0, 1 - x.orb / maxOrb)
            const active = hoverPoint ? isHoverAspect(x) : true
            return (
              <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                style={{
                  stroke: ASPECT_COLOR[def.kind],
                  strokeWidth: 0.8 + 2.4 * tight,
                  strokeOpacity: active ? 0.35 + 0.6 * tight : 0.06,
                  strokeDasharray: def.kind === 'minor' ? '6 5' : undefined
                }}
              />
            )
          })}
        </g>

        {/* Planet rings */}
        {rings.map((ring) => (
          <PlanetRing
            key={ring.index}
            ring={ring}
            width={w}
            pt={pt}
            aspectR={aspectR}
            hoverKey={hover && hover.ring === ring.index ? hover.key : null}
            onHover={(key, e) => {
              if (!key) return setHover(null)
              const box = (e.currentTarget.ownerSVGElement as SVGSVGElement).getBoundingClientRect()
              setHover({ ring: ring.index, key, x: e.clientX - box.left, y: e.clientY - box.top })
            }}
          />
        ))}
      </svg>
      {hover && hoverPoint && hoverLayer && (
        <PointTooltip
          x={hover.x}
          y={hover.y}
          point={hoverPoint}
          layer={hoverLayer}
          aspects={aspects.filter(isHoverAspect)}
        />
      )}
    </div>
  )
}

function PlanetRing({
  ring,
  width,
  pt,
  aspectR,
  hoverKey,
  onHover
}: {
  ring: Ring
  width: number
  pt: (lon: number, r: number) => readonly [number, number]
  aspectR: number
  hoverKey: string | null
  onHover: (key: string | null, e: React.MouseEvent<SVGGElement>) => void
}) {
  const { layer, r0 } = ring
  const color = LAYER_COLOR[layer.kind]
  const isNatal = ring.index < 0
  const pts = layer.points.filter((p) => !(isNatal && (p.key === 'asc' || p.key === 'mc')))
  const glyphSize = Math.min(30, width * 0.3)
  const rGlyph = r0 - glyphSize * 0.75
  const full = width >= 95
  const rDeg = rGlyph - glyphSize * 0.95
  const rSign = rDeg - (full ? 19 : 15)
  const rMin = rSign - (full ? 18 : 14)
  const small = full ? 15 : 12
  const minSep = Math.max(((glyphSize * 1.3) / rGlyph) * (180 / Math.PI), ((small * 2.1) / rMin) * (180 / Math.PI))
  const placed = spread(pts, minSep)

  return (
    <g>
      {placed.map(({ p, display }) => {
        const [tx1, ty1] = pt(p.lon, r0)
        const [tx2, ty2] = pt(p.lon, r0 - 7)
        const [gx, gy] = pt(display, rGlyph)
        const [cx2, cy2] = pt(display, rGlyph + glyphSize * 0.55)
        const [dx, dy] = pt(display, rDeg)
        const [sx, sy] = pt(display, rSign)
        const [mx, my] = pt(display, rMin)
        const [ax, ay] = pt(p.lon, aspectR)
        const sd = splitDeg(p.lon)
        const isText = POINT[p.key].glyph.length > 1
        const hl = hoverKey === p.key
        return (
          <g
            key={p.key}
            className={hl ? 'w-planet hl' : 'w-planet'}
            onMouseEnter={(e) => onHover(p.key, e)}
            onMouseMove={(e) => onHover(p.key, e)}
            onMouseLeave={(e) => onHover(null, e)}
          >
            <line x1={tx1} y1={ty1} x2={tx2} y2={ty2} style={{ stroke: color }} strokeWidth={1.6} />
            {Math.abs(norm360(display - p.lon + 180) - 180) > 0.4 && (
              <line x1={tx2} y1={ty2} x2={cx2} y2={cy2} style={{ stroke: color }} strokeWidth={0.7} strokeOpacity={0.6} />
            )}
            <circle cx={gx} cy={gy} r={glyphSize * 0.62} className="w-hit" />
            <text
              x={gx}
              y={gy}
              className={isText ? 'w-ptext' : 'w-glyph'}
              style={{ fill: color, fontSize: isText ? glyphSize * 0.55 : glyphSize }}
              textAnchor="middle"
              dominantBaseline="central"
            >
              {glyph(p.key)}
            </text>
            <text x={dx} y={dy} className="w-deg" style={{ fill: color, fontSize: small }} textAnchor="middle" dominantBaseline="central">
              {sd.deg}°
            </text>
            <text x={sx} y={sy} className="w-glyph" style={{ fill: color, fontSize: small }} textAnchor="middle" dominantBaseline="central">
              {signGlyph(sd.sign)}
            </text>
            <text x={mx} y={my} className="w-min" style={{ fill: color, fontSize: small * 0.85 }} textAnchor="middle" dominantBaseline="central">
              {String(sd.min).padStart(2, '0')}'{p.retro ? 'ʀ' : ''}
            </text>
            {isNatal && <circle cx={ax} cy={ay} r={2.6} style={{ fill: color }} />}
            {!isNatal && <circle cx={ax} cy={ay} r={2.2} style={{ fill: 'none', stroke: color }} strokeWidth={1.2} />}
          </g>
        )
      })}
    </g>
  )
}

function PointTooltip({ x, y, point, layer, aspects }: { x: number; y: number; point: ChartPoint; layer: Layer; aspects: Aspect[] }) {
  const def = POINT[point.key]
  const dig = dignity(point.key, splitDeg(point.lon).sign)
  return (
    <div className="tooltip" style={{ left: x + 16, top: y + 12 }}>
      <div className="tt-title">
        <span className="glyph" style={{ color: LAYER_COLOR[layer.kind] }}>
          {glyph(point.key)}
        </span>{' '}
        {def.name} <span className="muted">· {layer.label}</span>
      </div>
      <div>
        {fmtPos(point.lon, true)} · {point.house}. ev{point.retro ? ' · Retro' : ''}
        {dig ? ` · ${dig}` : ''}
      </div>
      {!['asc', 'mc'].includes(point.key) && (
        <div className="muted">
          Hız {point.speed.toFixed(4)}°/gün · Dekl. {fmtDecl(point.decl)}
        </div>
      )}
      {aspects.length > 0 && (
        <div className="tt-aspects">
          {aspects.slice(0, 10).map((a, i) => {
            const other = a.a === point ? a.b : a.a
            return (
              <div key={i}>
                <span className="glyph">{a.aspect.glyph}</span> {POINT[other.key].name} · {fmtOrb(a.orb)} {a.applying ? 'yakl.' : 'ayr.'}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
