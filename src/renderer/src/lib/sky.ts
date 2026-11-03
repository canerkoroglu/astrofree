// Wording for sky events, shared by the sky panel and the AI context.
import type { SkyEvent, SkyReport, TzSpec } from '@shared/types'
import { fmtPos, fmtPosText, glyph, moonPhase, POINTS, SIGNS, splitDeg } from './astro'
import { t } from './i18n'
import { fmtDate, fmtLocal, jdToLocal } from './time'

const KEY_BY_SWE = Object.fromEntries(POINTS.filter((p) => p.swe !== undefined).map((p) => [p.swe!, p.key]))
export const bodyKey = (swe: number) => KEY_BY_SWE[swe] ?? 'sun'
const bodyName = (swe: number) => POINTS.find((p) => p.swe === swe)?.name ?? '?'

export function eventText(e: SkyEvent): string {
  const name = bodyName(e.body)
  switch (e.kind) {
    case 'station-r':
      return t('{p} retro başlıyor', { p: name })
    case 'station-d':
      return t('{p} düz harekete geçiyor', { p: name })
    case 'ingress':
      return t('{p} {sign} burcunda', { p: name, sign: SIGNS[splitDeg(e.lon).sign].name })
    case 'new-moon':
      return t('Yeni Ay')
    case 'full-moon':
      return t('Dolunay')
    case 'solar-eclipse':
      return t('Güneş tutulması') + (e.detail ? ` (${t(e.detail)})` : '')
    case 'lunar-eclipse':
      return t('Ay tutulması') + (e.detail ? ` (${t(e.detail)})` : '')
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
  out.push(`# ${t('GÖKYÜZÜ OLAYLARI')} — ${t('referans')} ${fmtDate(ref)}`)
  const ph = moonPhase(r.sunLon, r.moonLon)
  out.push(`- ${t('Ay')}: ${fmtPosText(r.moonLon)}, ${ph.name} (${t('%{n} aydınlık', { n: moonIllumination(r) })})`)
  if (r.retro.length) {
    for (const p of r.retro) {
      out.push(
        `- Retro: ${bodyName(p.body)} — ${t('başlangıç')} ${p.start ? d(p.start) : '?'}${p.startLon !== null ? ` (${fmtPosText(p.startLon)})` : ''}, ${t('bitiş')} ${p.end ? d(p.end) : '?'}${p.endLon !== null ? ` (${fmtPosText(p.endLon)})` : ''}`
      )
    }
  } else out.push(`- ${t('Şu an retro gezegen yok')}`)
  if (r.previousLunation) out.push(`- ${t('Son ay evresi')}: ${eventText(r.previousLunation)} ${d(r.previousLunation.jd)}, ${fmtPosText(r.previousLunation.lon)}`)
  for (const e of r.events) out.push(`- ${d(e.jd)}: ${eventText(e)}, ${fmtPosText(e.lon)}`)
  for (const e of r.nextEclipses) if (!r.events.includes(e)) out.push(`- ${t('Sonraki')}: ${eventText(e)} ${d(e.jd)}, ${fmtPosText(e.lon)}`)
  return out.join('\n')
}
