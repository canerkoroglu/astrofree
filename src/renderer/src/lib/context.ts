// Plain-text chart summary sent to the AI with every chat turn.
import type { AppSettings, ChartRecord, Place, TzSpec } from '@shared/types'
import {
  AYANAMSAS,
  balance,
  dignity,
  ELEMENT_TR,
  findAspects,
  fmtCoord,
  fmtDecl,
  fmtOrb,
  fmtPosText,
  HOUSE_SYSTEMS,
  MODE_TR,
  moonPhase,
  POINT,
  rulerOf,
  splitDeg,
  type Aspect,
  type Layer
} from './astro'
import type { Computed } from './chart'
import { fmtLocal, fmtOffset, jdToLocal, offsetAt, revjul, tzLabel } from './time'
import type { Pattern } from './patterns'
import {
  almuten,
  currentFirdar,
  essentialDignity,
  firdaria,
  firdarName,
  hermeticLots,
  profection,
  sectInfo,
  SEVEN
} from './traditional'

function when(jd: number, tz: TzSpec, lon: number): string {
  return `${fmtLocal(jdToLocal(jd, tz, lon))} (${tzLabel(tz)}, ${fmtOffset(offsetAt(tz, jd, lon))})`
}

const placeText = (p: Place) => `${p.name} (${fmtCoord(p.lat, 'K', 'G')}, ${fmtCoord(p.lon, 'D', 'B')})`

function pointLine(l: Layer, key: string, withHouse: boolean, withDignity: boolean): string | null {
  const p = l.points.find((x) => x.key === key)
  if (!p) return null
  const def = POINT[key]
  const parts = [`${def.name}: ${fmtPosText(p.lon)}`]
  if (withHouse && !['asc', 'mc'].includes(key)) parts.push(`${p.house}. ev`)
  if (p.retro) parts.push('retro')
  if (withDignity) {
    const dig = dignity(key, splitDeg(p.lon).sign)
    if (dig) parts.push(dig)
  }
  if (!['asc', 'mc', 'fortune', 'vertex'].includes(key)) parts.push(`dekl. ${fmtDecl(p.decl)}`)
  return '- ' + parts.join(', ')
}

function aspectLine(x: Aspect, prefixA = '', prefixB = ''): string {
  return `- ${prefixA}${POINT[x.a.key].name} ${x.aspect.name} ${prefixB}${POINT[x.b.key].name} (orb ${fmtOrb(x.orb)}, ${x.applying ? 'yaklaşan' : 'ayrılan'})`
}

function natalSection(c: Computed, rec: ChartRecord, s: AppSettings): string {
  const l = c.natal
  const out: string[] = []
  out.push(`# DOĞUM HARİTASI — ${rec.name || 'İsimsiz'}`)
  out.push(`Doğum: ${when(c.natalJd, rec.tz, rec.place.lon)}`)
  out.push(`Yer: ${placeText(rec.place)}`)
  const hs = HOUSE_SYSTEMS.find((h) => h[0] === s.houseSystem)?.[1] ?? s.houseSystem
  const zod =
    s.zodiac === 'sidereal'
      ? `Sidereal (${AYANAMSAS.find((a) => a[0] === s.sidMode)?.[1] ?? s.sidMode}, ayanamsa ${l.ayanamsa.toFixed(2)}°)`
      : 'Tropikal'
  out.push(`Ev sistemi: ${hs} · Zodyak: ${zod} · Ay düğümü: ${s.nodeType === 'true' ? 'gerçek' : 'ortalama'}`)

  out.push('\n## Gezegenler ve noktalar')
  for (const p of l.points) {
    const line = pointLine(l, p.key, true, true)
    if (line) out.push(line)
  }

  out.push('\n## Ev başlangıçları ve yöneticileri')
  l.cusps.forEach((cusp, i) => {
    const sign = splitDeg(cusp).sign
    const ruler = rulerOf(sign)
    const rp = l.points.find((p) => p.key === ruler)
    out.push(`- ${i + 1}. ev: ${fmtPosText(cusp)} — yönetici ${POINT[ruler].name}${rp ? ` (${rp.house}. evde)` : ''}`)
  })

  const occupied = new Map<number, string[]>()
  for (const p of l.points) {
    if (['asc', 'mc'].includes(p.key)) continue
    occupied.set(p.house, [...(occupied.get(p.house) ?? []), POINT[p.key].name])
  }
  out.push('\n## Evlere göre gezegenler')
  for (let h = 1; h <= 12; h++) out.push(`- ${h}. ev: ${(occupied.get(h) ?? ['boş']).join(', ')}`)

  out.push('\n## Natal açılar')
  const asp = findAspects(l.points, null, s, false)
  out.push(asp.length ? asp.map((x) => aspectLine(x)).join('\n') : '- (yok)')

  const b = balance(l.points)
  out.push('\n## Denge')
  out.push(
    '- Elementler: ' +
      Object.entries(b.elements)
        .map(([k, v]) => `${ELEMENT_TR[k as keyof typeof ELEMENT_TR]} ${v}`)
        .join(', ')
  )
  out.push(
    '- Nitelikler: ' +
      Object.entries(b.modes)
        .map(([k, v]) => `${MODE_TR[k as keyof typeof MODE_TR]} ${v}`)
        .join(', ')
  )
  const sun = l.points.find((p) => p.key === 'sun')
  const moon = l.points.find((p) => p.key === 'moon')
  if (sun && moon) {
    const ph = moonPhase(sun.lon, moon.lon)
    out.push(`- Ay fazı: ${ph.name} (${ph.angle.toFixed(0)}°) · ${sun.house >= 7 ? 'Gündüz' : 'Gece'} haritası`)
  }
  const asc = l.points.find((p) => p.key === 'asc')
  if (asc) {
    const ruler = rulerOf(splitDeg(asc.lon).sign)
    const rp = l.points.find((p) => p.key === ruler)
    if (rp) out.push(`- Harita yöneticisi: ${POINT[ruler].name}, ${fmtPosText(rp.lon)}, ${rp.house}. ev`)
  }
  return out.join('\n')
}

const OUTER_PREFIX: Record<string, string> = {
  transit: 'T.',
  progressed: 'P.',
  solarArc: 'SA.',
  synastry: 'S.',
  solarReturn: 'GD.',
  lunarReturn: 'AD.'
}

function outerSection(
  o: Layer,
  c: Computed,
  s: AppSettings,
  eventJd: number,
  eventTz: TzSpec,
  eventPlace: Place,
  partner: ChartRecord | null
): string {
  const out: string[] = []
  const pre = OUTER_PREFIX[o.kind]
  if (o.kind === 'transit') {
    out.push(`# TRANSİTLER — ${when(o.jdUT, eventTz, eventPlace.lon)}`)
    out.push(`Transit yeri: ${placeText(eventPlace)}`)
  } else if (o.kind === 'progressed') {
    const d = revjul(c.progressedJd ?? o.jdUT)
    out.push(`# İKİNCİL PROGRESYONLAR — hedef tarih ${when(eventJd, eventTz, eventPlace.lon)}`)
    out.push(`Progresyon tarihi (gün=yıl): ${d.d}.${d.m}.${d.y} · açılar: ${s.progressedAngles === 'naibod' ? 'Naibod (RA)' : 'Solar ark'}`)
  } else if (o.kind === 'solarArc') {
    const arc = (o.points.find((p) => p.key === 'sun')!.lon - c.natal.points.find((p) => p.key === 'sun')!.lon + 360) % 360
    out.push(`# SOLAR ARK DİREKSİYONLARI — hedef tarih ${when(eventJd, eventTz, eventPlace.lon)}, ark ${fmtOrb(arc)}`)
  } else if (o.kind === 'solarReturn' || o.kind === 'lunarReturn') {
    const ret = c.returns.find((r) => r.kind === o.kind)
    out.push(`# ${o.kind === 'solarReturn' ? 'GÜNEŞ' : 'AY'} DÖNÜŞÜ — ${ret ? when(ret.jd, eventTz, ret.place.lon) : ''}`)
    if (ret) out.push(`Dönüş yeri: ${placeText(ret.place)}`)
    out.push('Dönüş haritasının kendi ev başlangıçları:')
    o.cusps.forEach((cusp, i) => out.push(`- ${i + 1}. ev: ${fmtPosText(cusp)}`))
  } else if (o.kind === 'synastry' && partner) {
    out.push(`# SİNASTRİ — ${partner.name}`)
    out.push(`Doğum: ${fmtLocal(partner.local)} (${tzLabel(partner.tz)}), ${placeText(partner.place)}`)
  }
  out.push(`\n## ${o.label} konumları (natal evlere göre)`)
  for (const p of o.points) {
    const line = pointLine(o, p.key, true, false)
    if (line) out.push(line.replace('- ', `- ${pre}`))
  }
  out.push(`\n## ${o.label} → Natal açılar`)
  const asp = findAspects(o.points, c.natal.points, s, true)
  out.push(asp.length ? asp.map((x) => aspectLine(x, pre, 'N.')).join('\n') : '- (orb içinde açı yok)')
  return out.join('\n')
}

export function buildContext(
  c: Computed,
  rec: ChartRecord,
  s: AppSettings,
  eventJd: number,
  eventTz: TzSpec,
  eventPlace: Place,
  partner: ChartRecord | null
): string {
  const parts = [natalSection(c, rec, s)]
  for (const o of c.outers) parts.push(outerSection(o, c, s, eventJd, eventTz, eventPlace, partner))
  return parts.join('\n\n')
}

/** Short summary of what is on screen, used in quick-prompt labels. */
export function layerSummary(c: Computed | null): string {
  if (!c) return ''
  return [c.natal.label, ...c.outers.map((o) => o.label)].join(' + ')
}


// ---- extra sections -------------------------------------------------------------


export function patternsText(patterns: Pattern[]): string {
  if (!patterns.length) return ''
  return ['## Açı kalıpları', ...patterns.map((p) => `- ${p.name}: ${p.note}`)].join('\n')
}

export function traditionalText(natal: Layer, natalJd: number, jd: number): string {
  const sect = sectInfo(natal)
  const out: string[] = ['# GELENEKSEL TEKNİKLER']
  out.push(
    `- Sekt: ${sect.day ? 'gündüz' : 'gece'} haritası; sekt ışığı ${POINT[sect.luminary].name}, sekt iyicili ${POINT[sect.benefic].name}, sekt kötücülü ${POINT[sect.malefic].name}; sekt dışı kötücül ${POINT[sect.contraryMalefic].name}`
  )
  const lines: string[] = []
  for (const k of SEVEN) {
    const p = natal.points.find((x) => x.key === k)
    if (!p) continue
    const d = essentialDignity(k, p.lon, sect.day)
    const tags = [
      d.domicile && 'yönetici',
      d.exaltation && 'yücelim',
      d.triplicity && 'üçlü',
      d.term && 'sınır',
      d.face && 'yüz',
      d.detriment && 'zarar',
      d.fall && 'düşüş',
      d.peregrine && 'peregrin'
    ].filter(Boolean)
    lines.push(`- ${POINT[k].name}: puan ${d.score >= 0 ? '+' : ''}${d.score} (${tags.join(', ') || '—'})`)
  }
  out.push('## Esas asaletler (Lilly puanı)', ...lines)
  const asc = natal.points.find((p) => p.key === 'asc')
  const mc = natal.points.find((p) => p.key === 'mc')
  if (asc) out.push(`- ASC almuteni: ${POINT[almuten(asc.lon, sect.day).key].name}`)
  if (mc) out.push(`- MC almuteni: ${POINT[almuten(mc.lon, sect.day).key].name}`)
  const pr = profection(natal, natalJd, jd)
  out.push('## Zaman lordları (seçili tarih için)')
  out.push(`- Yıllık profeksiyon: ${pr.age} yaş → ${pr.house}. ev (${fmtPosText(pr.sign * 30).split(' ').pop()}), yılın lordu ${POINT[pr.lord].name}`)
  out.push(`- Aylık profeksiyon: ${fmtPosText(pr.monthSign * 30).split(' ').pop()}, ay lordu ${POINT[pr.monthLord].name}`)
  const fd = currentFirdar(firdaria(natalJd, sect.day), jd)
  if (fd.major) {
    out.push(`- Firdaria: ana dönem ${firdarName(fd.major.lord)}${fd.sub?.sub ? `, alt dönem ${firdarName(fd.sub.sub)}` : ''}`)
  }
  const lots = hermeticLots(natal)
  if (lots.length) {
    out.push('## Hermetik noktalar')
    for (const l of lots) out.push(`- ${l.name}: ${fmtPosText(l.lon)}`)
  }
  return out.join('\n')
}

export function starsText(conj: { star: string; key: string; orb: number }[]): string {
  if (!conj.length) return ''
  return ['## Sabit yıldız kavuşumları (orb ≤ 1°)', ...conj.map((c) => `- ${POINT[c.key].name} – ${c.star} (orb ${fmtOrb(c.orb)})`)].join('\n')
}
