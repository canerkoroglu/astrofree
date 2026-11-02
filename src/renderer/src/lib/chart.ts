// Turns chart records + the current moment into computed wheel layers.
import type { AppSettings, ChartRecord, EphemRequest, Place, TzSpec } from '@shared/types'
import { bodiesFor, buildLayer, eclToRa, houseOf, norm360, shiftLayer, type Layer } from './astro'
import { localToJd } from './time'

export type OuterKind = 'transit' | 'progressed' | 'solarArc' | 'synastry' | 'solarReturn' | 'lunarReturn'

export const OUTER_LABEL: Record<OuterKind, string> = {
  transit: 'Transit',
  progressed: 'Progresyon',
  solarArc: 'Solar Ark',
  synastry: 'Sinastri',
  solarReturn: 'Güneş Dönüşü',
  lunarReturn: 'Ay Dönüşü'
}

export interface ComputeSpec {
  natal: ChartRecord
  eventJd: number
  eventPlace: Place
  eventTz: TzSpec
  outers: OuterKind[]
  partner: ChartRecord | null
  settings: AppSettings
}

export interface Computed {
  natal: Layer
  outers: Layer[]
  natalJd: number
  progressedJd: number | null
  /** Moments and places of return charts on screen. */
  returns: { kind: 'solarReturn' | 'lunarReturn'; jd: number; place: Place }[]
  error?: string
}

const TROPICAL_YEAR = 365.242199
const NAIBOD = 0.98564733 // mean solar motion, degrees per year

export const chartJd = (c: ChartRecord) => localToJd(c.local, c.tz, c.place.lon)

export async function computeCharts(spec: ComputeSpec): Promise<Computed> {
  const { settings: s, natal } = spec
  const bodies = bodiesFor(s)
  const sid = s.zodiac === 'sidereal' ? s.sidMode : null
  const req = (jdUT: number, place: Place, armc?: number): EphemRequest => ({
    jdUT,
    lat: place.lat,
    lon: place.lon,
    houseSystem: s.houseSystem,
    sidMode: sid,
    bodies,
    ...(armc !== undefined ? { armc } : {})
  })

  const natalJd = chartJd(natal)
  const years = (spec.eventJd - natalJd) / TROPICAL_YEAR
  const progJd = natalJd + (spec.eventJd - natalJd) / TROPICAL_YEAR
  const needProg = spec.outers.includes('progressed') || spec.outers.includes('solarArc')

  // First pass: everything that does not depend on the natal result.
  const first: EphemRequest[] = [req(natalJd, natal.place)]
  const idx: Partial<Record<OuterKind | 'prog', number>> = {}
  if (spec.outers.includes('transit')) idx.transit = first.push(req(spec.eventJd, spec.eventPlace)) - 1
  if (spec.outers.includes('synastry') && spec.partner) {
    idx.synastry = first.push(req(chartJd(spec.partner), spec.partner.place)) - 1
  }
  if (needProg) idx.prog = first.push(req(progJd, natal.place)) - 1

  const res = await window.astro.compute(first)
  const natalRes = res[0]
  if (natalRes.error) throw new Error(natalRes.error)
  const natalLayer = buildLayer('natal', natal.name || 'Natal', natalRes, s)

  let progLayer: Layer | null = null
  if (needProg && idx.prog !== undefined) {
    const progRaw = res[idx.prog]
    const natalSun = natalLayer.points.find((p) => p.key === 'sun')!.lon
    const progSun = progRaw.bodies.find((b) => b.id === 0)?.lon ?? natalSun
    // Progressed angles: Naibod in right ascension (Astrodienst default), or
    // the solar arc added to the MC and converted back to RA.
    const armc =
      s.progressedAngles === 'naibod'
        ? norm360(natalRes.armc + years * NAIBOD)
        : eclToRa(norm360(natalLayer.mc + norm360(progSun - natalSun)), natalRes.eps)
    const [withHouses] = await window.astro.compute([req(progJd, natal.place, armc)])
    progLayer = buildLayer('progressed', 'Progresyon', withHouses, s)
  }

  const outers: Layer[] = []
  for (const kind of spec.outers) {
    if (kind === 'transit' && idx.transit !== undefined) {
      outers.push(buildLayer('transit', 'Transit', res[idx.transit], s))
    } else if (kind === 'synastry' && idx.synastry !== undefined && spec.partner) {
      outers.push(buildLayer('synastry', spec.partner.name || 'Partner', res[idx.synastry], s))
    } else if (kind === 'progressed' && progLayer) {
      outers.push(progLayer)
    } else if (kind === 'solarArc' && progLayer) {
      const natalSun = natalLayer.points.find((p) => p.key === 'sun')!
      const progSun = progLayer.points.find((p) => p.key === 'sun')!
      const arc = norm360(progSun.lon - natalSun.lon)
      outers.push(shiftLayer(natalLayer, arc, 'solarArc', 'Solar Ark', spec.eventJd, progSun.speed))
    }
  }
  // Return charts: the last Sun/Moon return at or before the event date.
  const returns: Computed['returns'] = []
  for (const kind of ['solarReturn', 'lunarReturn'] as const) {
    if (!spec.outers.includes(kind)) continue
    const body = kind === 'solarReturn' ? 0 : 1
    const target = natalLayer.points.find((p) => p.key === (body === 0 ? 'sun' : 'moon'))!.lon
    const back = body === 0 ? 366 : 28
    const ahead = body === 0 ? 300 : 20
    let t = await window.astro.tools.returnTime(body, target, spec.eventJd - back, sid)
    if (t === null) continue
    const t2 = await window.astro.tools.returnTime(body, target, t + ahead, sid)
    if (t2 !== null && t2 <= spec.eventJd) t = t2
    const place = s.returnPlace === 'current' ? spec.eventPlace : natal.place
    const [r] = await window.astro.compute([req(t, place)])
    const layer = buildLayer(kind, OUTER_LABEL[kind], r, s)
    returns.push({ kind, jd: t, place })
    outers.splice(spec.outers.indexOf(kind), 0, layer)
  }

  // Outer points are placed in the natal houses.
  for (const l of outers) {
    for (const p of l.points) p.house = houseOf(p.lon, natalLayer.cusps)
  }
  return { natal: natalLayer, outers, natalJd, progressedJd: needProg ? progJd : null, returns }
}

