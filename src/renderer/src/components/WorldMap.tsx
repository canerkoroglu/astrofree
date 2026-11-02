import { useRef, useState } from 'react'
import { WORLD_PATH } from '../assets/world'
import { fmtDms } from '../lib/coords'

type Box = [number, number, number, number]
const FULL: Box = [0, 0, 360, 180]

/** Offline equirectangular world map: wheel to zoom, drag to pan, click to pick. */
export default function WorldMap({ lat, lon, onPick }: { lat: number; lon: number; onPick: (lat: number, lon: number) => void }) {
  const [box, setBox] = useState<Box>(FULL)
  const [hover, setHover] = useState<[number, number] | null>(null)
  const svgRef = useRef<SVGSVGElement>(null)
  const drag = useRef<{ x: number; y: number; box: Box; moved: boolean } | null>(null)

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
    <div className="worldmap">
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
          <line key={`x${v}`} x1={v} y1={0} x2={v} y2={180} className="wm-grid" strokeWidth={0.4 * k} />
        ))}
        {grid
          .filter((v) => v <= 180)
          .map((v) => (
            <line key={`y${v}`} x1={0} y1={v} x2={360} y2={v} className={v === 90 ? 'wm-grid wm-eq' : 'wm-grid'} strokeWidth={0.4 * k} />
          ))}
        <path d={WORLD_PATH} className="wm-land" strokeWidth={0.3 * k} />
        <circle cx={mx} cy={my} r={2.2 * k} className="wm-marker" strokeWidth={0.8 * k} />
        <line x1={mx - 5 * k} y1={my} x2={mx + 5 * k} y2={my} className="wm-cross" strokeWidth={0.5 * k} />
        <line x1={mx} y1={my - 5 * k} x2={mx} y2={my + 5 * k} className="wm-cross" strokeWidth={0.5 * k} />
      </svg>
      <div className="wm-bar small">
        <span className="muted">
          {hover ? `${fmtDms(hover[0], true)}  ${fmtDms(hover[1], false)}` : 'Tıklayarak konum seçin · tekerlek: yakınlaştır · sürükle: kaydır'}
        </span>
        <span className="grow" />
        <button className="link small" onClick={() => setBox(clamp([mx - 15, my - 7.5, 30, 15]))}>
          Seçime yakınlaş
        </button>
        <button className="link small" onClick={() => setBox(FULL)}>
          Tüm dünya
        </button>
      </div>
    </div>
  )
}
