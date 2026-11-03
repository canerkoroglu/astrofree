import { getLang, t } from '../lib/i18n'
import { useEffect, useMemo, useRef, useState } from 'react'
import { WORLD_PATH } from '../assets/world'
import { fmtDms } from '../lib/coords'

type Box = [number, number, number, number]
const FULL: Box = [0, 0, 360, 180]

type Detail = typeof import('../assets/world-detail')
let detailPromise: Promise<Detail> | null = null
// Borders and names are a separate ~3 MB chunk, loaded the first time a map opens.
const loadDetail = () => (detailPromise ??= import('../assets/world-detail'))

/** Highest Natural Earth min-zoom rank of country names shown at a view width. */
const countryRankFor = (w: number) => (w >= 240 ? 2.5 : w >= 120 ? 3.5 : w >= 60 ? 5 : w >= 25 ? 7 : 11)
const PROVINCE_ZOOM = 70 // show province borders below this view width (degrees)
const PROVINCE_LABEL_ZOOM = 28
const COUNTRY_PX = 11
const PROVINCE_PX = 10

/** Keep labels whose screen boxes do not collide (greedy, in priority order). */
function declutter<T extends [number, number, string, ...unknown[]]>(items: T[], box: Box, pxPerUnit: number, fontPx: number, taken: { x0: number; y0: number; x1: number; y1: number }[]): T[] {
  const out: T[] = []
  for (const it of items) {
    const sx = (it[0] + 180 - box[0]) * pxPerUnit
    const sy = (90 - it[1] - box[1]) * pxPerUnit
    const half = (it[2].length * fontPx * 0.55) / 2 + 3
    const r = { x0: sx - half, x1: sx + half, y0: sy - fontPx * 0.7, y1: sy + fontPx * 0.7 }
    if (taken.some((t) => r.x0 < t.x1 && r.x1 > t.x0 && r.y0 < t.y1 && r.y1 > t.y0)) continue
    taken.push(r)
    out.push(it)
  }
  return out
}

/** Offline equirectangular world map: wheel to zoom, drag to pan, click to pick. */
export interface MapOverlay {
  d: string
  className?: string
  width?: number
  label?: { x: number; y: number; text: string; className?: string }
  title?: string
}

export default function WorldMap({
  lat,
  lon,
  onPick,
  overlays = [],
  className = ''
}: {
  lat: number
  lon: number
  onPick: (lat: number, lon: number) => void
  overlays?: MapOverlay[]
  className?: string
}) {
  const [box, setBox] = useState<Box>(FULL)
  const [hover, setHover] = useState<[number, number] | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x: number; y: number; box: Box; moved: boolean } | null>(null)
  const [detail, setDetail] = useState<Detail | null>(null)
  const [widthPx, setWidthPx] = useState(600)

  useEffect(() => {
    const el = svgRef.current
    if (!el) return
    const ro = new ResizeObserver(() => setWidthPx(el.getBoundingClientRect().width || 600))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    let alive = true
    void loadDetail().then((d) => alive && setDetail(d))
    return () => {
      alive = false
    }
  }, [])

  const inView = (x: number, y: number) => x >= box[0] && x <= box[0] + box[2] && y >= box[1] && y <= box[1] + box[3]
  const provinces = useMemo(() => {
    if (!detail || box[2] > PROVINCE_ZOOM) return []
    const [bx, by, bw, bh] = box
    return detail.PROVINCES.filter(({ b }) => b[2] >= bx && b[0] <= bx + bw && b[3] >= by && b[1] <= by + bh)
  }, [detail, box])
  const pxPerUnit = widthPx / box[2]
  const labels = useMemo(() => {
    if (!detail) return { countries: [], provinces: [] }
    const taken: { x0: number; y0: number; x1: number; y1: number }[] = []
    const maxRank = countryRankFor(box[2])
    const countries = declutter(
      detail.COUNTRY_LABELS.filter(([lo, la, , rank]) => rank <= maxRank && inView(lo + 180, 90 - la)).sort((a, b) => a[3] - b[3]),
      box,
      pxPerUnit,
      COUNTRY_PX,
      taken
    )
    const provinces =
      box[2] > PROVINCE_LABEL_ZOOM ? [] : declutter(detail.PROVINCE_LABELS.filter(([lo, la]) => inView(lo + 180, 90 - la)), box, pxPerUnit, PROVINCE_PX, taken)
    return { countries, provinces }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detail, box, pxPerUnit])

  const toMap = (e: { clientX: number; clientY: number }, b = box): [number, number] => {
    const r = svgRef.current!.getBoundingClientRect()
    return [b[0] + ((e.clientX - r.left) / r.width) * b[2], b[1] + ((e.clientY - r.top) / r.height) * b[3]]
  }
  const clamp = (b: Box): Box => {
    const w = Math.min(360, Math.max(4, b[2]))
    const h = w / 2
    return [Math.min(360 - w, Math.max(0, b[0])), Math.min(180 - h, Math.max(0, b[1])), w, h]
  }
  const zoomAt = (mx: number, my: number, f: number) => {
    setBox((b) => {
      const w = b[2] * f
      const h = w / 2
      return clamp([mx - ((mx - b[0]) / b[2]) * w, my - ((my - b[1]) / b[3]) * h, w, h])
    })
  }

  const [mx, my] = [lon + 180, 90 - lat]
  const k = box[2] / 360 // stroke/marker scale
  const grid: number[] = []
  const step = box[2] > 120 ? 30 : box[2] > 30 ? 10 : box[2] > 10 ? 5 : 1
  for (let v = 0; v <= 360; v += step) grid.push(v)

  return (
    <div className={`worldmap ${className}`}>
      <svg
        ref={svgRef}
        viewBox={box.join(' ')}
        preserveAspectRatio="none"
        onWheel={(e) => {
          const [x, y] = toMap(e)
          zoomAt(x, y, e.deltaY > 0 ? 1.25 : 0.8)
        }}
        onMouseDown={(e) => (drag.current = { x: e.clientX, y: e.clientY, box, moved: false })}
        onMouseMove={(e) => {
          const [x, y] = toMap(e)
          setHover([90 - y, x - 180])
          const d = drag.current
          if (!d) return
          if (Math.abs(e.clientX - d.x) + Math.abs(e.clientY - d.y) > 3) d.moved = true
          if (d.moved) {
            const r = svgRef.current!.getBoundingClientRect()
            const dx = ((e.clientX - d.x) / r.width) * d.box[2]
            const dy = ((e.clientY - d.y) / r.height) * d.box[3]
            setBox(clamp([d.box[0] - dx, d.box[1] - dy, d.box[2], d.box[3]]))
          }
        }}
        onMouseUp={(e) => {
          const d = drag.current
          drag.current = null
          if (d && !d.moved) {
            const [x, y] = toMap(e)
            onPick(Math.round((90 - y) * 10000) / 10000, Math.round((x - 180) * 10000) / 10000)
          }
        }}
        onMouseLeave={() => {
          drag.current = null
          setHover(null)
        }}
      >
        <rect x={0} y={0} width={360} height={180} className="wm-sea" />
        {grid.map((v) => (
          <line key={`x${v}`} x1={v} y1={0} x2={v} y2={180} className="wm-grid" strokeWidth={0.6} />
        ))}
        {grid
          .filter((v) => v <= 180)
          .map((v) => (
            <line key={`y${v}`} x1={0} y1={v} x2={360} y2={v} className={v === 90 ? 'wm-grid wm-eq' : 'wm-grid'} strokeWidth={0.6} />
          ))}
        <path d={WORLD_PATH} className="wm-land" strokeWidth={0.6} />
        {provinces.map((p, i) => (
          <path key={i} d={p.d} className="wm-province" strokeWidth={0.8} />
        ))}
        {detail && <path d={detail.COUNTRY_BORDERS} className="wm-border" strokeWidth={1} />}
        {labels.provinces.map(([lo, la, nameTr, nameEn], i) => (
          <text key={`p${i}`} x={lo + 180} y={90 - la} className="wm-label wm-plabel" fontSize={PROVINCE_PX / pxPerUnit} strokeWidth={2.5 / pxPerUnit}>
            {getLang() === 'tr' ? nameTr : nameEn}
          </text>
        ))}
        {labels.countries.map(([lo, la, nameTr, , nameEn], i) => (
          <text key={`c${i}`} x={lo + 180} y={90 - la} className="wm-label" fontSize={COUNTRY_PX / pxPerUnit} strokeWidth={3 / pxPerUnit}>
            {getLang() === 'tr' ? nameTr : nameEn}
          </text>
        ))}
        {overlays.map((o, i) => (
          <g key={`o${i}`}>
            <path d={o.d} className={`wm-overlay ${o.className ?? ''}`} strokeWidth={o.width ?? 1.4}>
              {o.title && <title>{o.title}</title>}
            </path>
            {o.label && (
              <text x={o.label.x} y={o.label.y} className={`wm-olabel ${o.label.className ?? ''}`} fontSize={11 / pxPerUnit} strokeWidth={3 / pxPerUnit}>
                {o.label.text}
              </text>
            )}
          </g>
        ))}
        <circle cx={mx} cy={my} r={2.2 * k} className="wm-marker" strokeWidth={0.8 * k} />
        <line x1={mx - 5 * k} y1={my} x2={mx + 5 * k} y2={my} className="wm-cross" strokeWidth={0.5 * k} />
        <line x1={mx} y1={my - 5 * k} x2={mx} y2={my + 5 * k} className="wm-cross" strokeWidth={0.5 * k} />
      </svg>
      <div className="wm-bar small">
        <span className="muted">
          {hover ? `${fmtDms(hover[0], true)}  ${fmtDms(hover[1], false)}` : t('Tıklayarak konum seçin · tekerlek: yakınlaştır · sürükle: kaydır')}
        </span>
        <span className="grow" />
        <button className="link small" onClick={() => setBox(clamp([mx - 15, my - 7.5, 30, 15]))}>
          {t('Seçime yakınlaş')}
        </button>
        <button className="link small" onClick={() => setBox(FULL)}>
          {t('Tüm dünya')}
        </button>
      </div>
    </div>
  )
}
