// Wording for sky events, shared by the sky panel and the AI context.
import type { SkyEvent, SkyReport, TzSpec } from '@shared/types'
import { fmtPos, fmtPosText, glyph, moonPhase, POINTS, SIGNS, splitDeg } from './astro'
import { fmtLocal, jdToLocal } from './time'

const KEY_BY_SWE = Object.fromEntries(POINTS.filter((p) => p.swe !== undefined).map((p) => [p.swe!, p.key]))
export const bodyKey = (swe: number) => KEY_BY_SWE[swe] ?? 'sun'
const bodyName = (swe: number) => POINTS.find((p) => p.swe === swe)?.name ?? '?'

export function eventText(e: SkyEvent): string {
  const name = bodyName(e.body)
  switch (e.kind) {
    case 'station-r':
      return `${name} retro başlıyor`
    case 'station-d':
      return `${name} düz harekete geçiyor`
    case 'ingress':
      return `${name} ${SIGNS[splitDeg(e.lon).sign].name} burcunda`
    case 'new-moon':
      return 'Yeni Ay'
    case 'full-moon':
      return 'Dolunay'
    case 'solar-eclipse':
      return `Güneş tutulması${e.detail ? ` (${e.detail})` : ''}`
    case 'lunar-eclipse':
      return `Ay tutulması${e.detail ? ` (${e.detail})` : ''}`
  }
}

export function eventGlyph(e: SkyEvent): string {
  if (e.kind === 'new-moon') return '●'
  if (e.kind === 'full-moon') return '○'
  if (e.kind === 'solar-eclipse') return '◐'
  if (e.kind === 'lunar-eclipse') return '◑'
  return glyph(bodyKey(e.body))
}

const p2 = (n: number) => String(n).padStart(2, '0')

export function fmtEventDate(jd: number, tz: TzSpec, lon: number, refJd: number): string {
  const l = jdToLocal(jd, tz, lon)
  const r = jdToLocal(refJd, tz, lon)
  return `${p2(l.d)}.${p2(l.m)}${l.y !== r.y ? '.' + l.y : ''} ${p2(l.h)}:${p2(l.mi)}`
}

export const eventPos = (e: SkyEvent) => fmtPos(e.lon)

export function moonIllumination(r: SkyReport): number {
  const e = moonPhase(r.sunLon, r.moonLon).angle
  return Math.round(((1 - Math.cos((e * Math.PI) / 180)) / 2) * 100)
}

/** Text block for the AI prompt. */
export function skyContext(r: SkyReport, tz: TzSpec, lon: number): string {
  const d = (jd: number) => fmtLocal(jdToLocal(jd, tz, lon))
  const out: string[] = []
  const ref = jdToLocal(r.jd, tz, lon)
  out.push(`# GÖKYÜZÜ OLAYLARI — referans ${p2(ref.d)}.${p2(ref.m)}.${ref.y}`)
  const ph = moonPhase(r.sunLon, r.moonLon)
  out.push(`- Ay: ${fmtPosText(r.moonLon)}, ${ph.name} (%${moonIllumination(r)} aydınlık)`)
  if (r.retro.length) {
    for (const p of r.retro) {
      out.push(
        `- Retro: ${bodyName(p.body)} — başlangıç ${p.start ? d(p.start) : '?'}${p.startLon !== null ? ` (${fmtPosText(p.startLon)})` : ''}, bitiş ${p.end ? d(p.end) : '?'}${p.endLon !== null ? ` (${fmtPosText(p.endLon)})` : ''}`
      )
    }
  } else out.push('- Şu an retro gezegen yok')
  if (r.previousLunation) out.push(`- Son ay evresi: ${eventText(r.previousLunation)} ${d(r.previousLunation.jd)}, ${fmtPosText(r.previousLunation.lon)}`)
  for (const e of r.events) out.push(`- ${d(e.jd)}: ${eventText(e)}, ${fmtPosText(e.lon)}`)
  for (const e of r.nextEclipses) if (!r.events.includes(e)) out.push(`- Sonraki: ${eventText(e)} ${d(e.jd)}, ${fmtPosText(e.lon)}`)
  return out.join('\n')
}
