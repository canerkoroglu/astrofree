// Plain-text chart summary sent to the AI with every chat turn.
import type { AppSettings, ChartRecord, Place, TzSpec } from '@shared/types'
import {
  AYANAMSAS,
  balance,
  dignity,
  elementName,
  findAspects,
  fmtCoord,
  fmtDecl,
  fmtOrb,
  fmtPosText,
  HOUSE_SYSTEMS,
  moonPhase,
  POINT,
  rulerOf,
  SIGNS,
  splitDeg,
  type Aspect,
  type Layer
} from './astro'
import type { Computed } from './chart'
import { t } from './i18n'
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
  if (withHouse && !['asc', 'mc'].includes(key)) parts.push(t('{n}. ev', { n: p.house }))
  if (p.retro) parts.push('retro')
  if (withDignity) {
    const dig = dignity(key, splitDeg(p.lon).sign)
    if (dig) parts.push(dig)
  }
  if (!['asc', 'mc', 'fortune', 'vertex'].includes(key)) parts.push(`dekl. ${fmtDecl(p.decl)}`)
  return '- ' + parts.join(', ')
}

function aspectLine(x: Aspect, prefixA = '', prefixB = ''): string {
  return `- ${prefixA}${POINT[x.a.key].name} ${x.aspect.name} ${prefixB}${POINT[x.b.key].name} (orb ${fmtOrb(x.orb)}, ${x.applying ? t('yaklaşan') : t('ayrılan')})`
}

function natalSection(c: Computed, rec: ChartRecord, s: AppSettings): string {
  const l = c.natal
  const out: string[] = []
  const ev = rec.kind === 'event'
  out.push(`# ${ev ? t('OLAY HARİTASI') : t('DOĞUM HARİTASI')} — ${rec.name || t('İsimsiz')}`)
  out.push(`${ev ? t('Olay zamanı') : t('Doğum')}: ${when(c.natalJd, rec.tz, rec.place.lon)}`)
  if (rec.timeUnknown) out.push(t('UYARI: Doğum saati bilinmiyor; 12:00 kullanıldı. Yükselen, MC, ev konumları ve ev yöneticileri güvenilmez; Ay derecesi ±7° oynayabilir. Bunlara dayanarak yorum yapma.'))
  else if (rec.rodden) out.push(t('Saat verisi güvenilirliği (Rodden): {r}', { r: rec.rodden }))
  out.push(`${t('Yer')}: ${placeText(rec.place)}`)
  const hs = HOUSE_SYSTEMS.find((h) => h[0] === s.houseSystem)?.[1] ?? s.houseSystem
  const zod =
    s.zodiac === 'sidereal'
      ? `Sidereal (${AYANAMSAS.find((a) => a[0] === s.sidMode)?.[1] ?? s.sidMode}, ayanamsa ${l.ayanamsa.toFixed(2)}°)`
      : 'Tropikal'
  out.push(`${t('Ev sistemi')}: ${t(hs)} · ${t('Zodyak')}: ${zod} · ${t('Ay düğümü')}: ${s.nodeType === 'true' ? t('gerçek') : t('ortalama')}`)

  out.push('\n## Gezegenler ve noktalar')
  for (const p of l.points) {
    const line = pointLine(l, p.key, true, true)
    if (line) out.push(line)
  }

  out.push('\n## ' + t('Ev başlangıçları ve yöneticileri'))
  l.cusps.forEach((cusp, i) => {
    const sign = splitDeg(cusp).sign
    const ruler = rulerOf(sign)
    const rp = l.points.find((p) => p.key === ruler)
    out.push(`- ${t('{n}. ev', { n: i + 1 })}: ${fmtPosText(cusp)} — ${t('yönetici')} ${POINT[ruler].name}${rp ? ` (${t('{n}. evde', { n: rp.house })})` : ''}`)
  })

  const occupied = new Map<number, string[]>()
  for (const p of l.points) {
    if (['asc', 'mc'].includes(p.key)) continue
    occupied.set(p.house, [...(occupied.get(p.house) ?? []), POINT[p.key].name])
  }
  out.push('\n## ' + t('Evlere göre gezegenler'))
  for (let h = 1; h <= 12; h++) out.push(`- ${t('{n}. ev', { n: h })}: ${(occupied.get(h) ?? [t('boş')]).join(', ')}`)

  out.push('\n## ' + t('Natal açılar'))
  const asp = findAspects(l.points, null, s, false)
  out.push(asp.length ? asp.map((x) => aspectLine(x)).join('\n') : `- (${t('yok')})`)

  const b = balance(l.points)
  out.push('\n## ' + t('Denge'))
  out.push(
    `- ${t('Elementler')}: ` +
      Object.entries(b.elements)
        .map(([k, v]) => `${elementName(k as 'fire')} ${v}`)
        .join(', ')
  )
  out.push(
    `- ${t('Nitelikler')}: ` +
      Object.entries(b.modes)
        .map(([k, v]) => `${elementName(k as 'fixed')} ${v}`)
        .join(', ')
  )
  const sun = l.points.find((p) => p.key === 'sun')
  const moon = l.points.find((p) => p.key === 'moon')
  if (sun && moon) {
    const ph = moonPhase(sun.lon, moon.lon)
    out.push(`- ${t('Ay fazı')}: ${ph.name} (${ph.angle.toFixed(0)}°) · ${sun.house >= 7 ? t('Gündüz haritası') : t('Gece haritası')}`)
  }
  const asc = l.points.find((p) => p.key === 'asc')
  if (asc) {
    const ruler = rulerOf(splitDeg(asc.lon).sign)
    const rp = l.points.find((p) => p.key === ruler)
    if (rp) out.push(`- ${t('Harita yöneticisi')}: ${POINT[ruler].name}, ${fmtPosText(rp.lon)}, ${t('{n}. ev', { n: rp.house })}`)
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
    out.push(`# ${t('TRANSİTLER')} — ${when(o.jdUT, eventTz, eventPlace.lon)}`)
    out.push(`${t('Transit yeri')}: ${placeText(eventPlace)}`)
  } else if (o.kind === 'progressed') {
    const d = revjul(c.progressedJd ?? o.jdUT)
    out.push(`# ${t('İKİNCİL PROGRESYONLAR')} — ${t('hedef tarih')} ${when(eventJd, eventTz, eventPlace.lon)}`)
    out.push(`${t('Progresyon tarihi (gün=yıl)')}: ${d.d}.${d.m}.${d.y} · ${t('açılar')}: ${s.progressedAngles === 'naibod' ? 'Naibod (RA)' : t('Solar ark')}`)
  } else if (o.kind === 'solarArc') {
    const arc = (o.points.find((p) => p.key === 'sun')!.lon - c.natal.points.find((p) => p.key === 'sun')!.lon + 360) % 360
    out.push(`# ${t('SOLAR ARK DİREKSİYONLARI')} — ${t('hedef tarih')} ${when(eventJd, eventTz, eventPlace.lon)}, ${t('ark')} ${fmtOrb(arc)}`)
  } else if (o.kind === 'solarReturn' || o.kind === 'lunarReturn') {
    const ret = c.returns.find((r) => r.kind === o.kind)
    out.push(`# ${o.kind === 'solarReturn' ? t('GÜNEŞ DÖNÜŞÜ') : t('AY DÖNÜŞÜ')} — ${ret ? when(ret.jd, eventTz, ret.place.lon) : ''}`)
    if (ret) out.push(`${t('Dönüş yeri')}: ${placeText(ret.place)}`)
    out.push(t('Dönüş haritasının kendi ev başlangıçları:'))
    o.cusps.forEach((cusp, i) => out.push(`- ${t('{n}. ev', { n: i + 1 })}: ${fmtPosText(cusp)}`))
  } else if (o.kind === 'synastry' && partner) {
    out.push(`# ${t('SİNASTRİ')} — ${partner.name}`)
    out.push(`${t('Doğum')}: ${fmtLocal(partner.local)} (${tzLabel(partner.tz)}), ${placeText(partner.place)}`)
  }
  out.push(`\n## ${t('{layer} konumları (natal evlere göre)', { layer: t(o.label) })}`)
  for (const p of o.points) {
    const line = pointLine(o, p.key, true, false)
    if (line) out.push(line.replace('- ', `- ${pre}`))
  }
  out.push(`\n## ${t(o.label)} → ${t('Natal açılar')}`)
  const asp = findAspects(o.points, c.natal.points, s, true)
  out.push(asp.length ? asp.map((x) => aspectLine(x, pre, 'N.')).join('\n') : `- (${t('orb içinde açı yok')})`)
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
  return ['## ' + t('Açı kalıpları'), ...patterns.map((p) => `- ${t(p.name)}: ${p.note}`)].join('\n')
}

export function traditionalText(natal: Layer, natalJd: number, jd: number): string {
  const sect = sectInfo(natal)
  const out: string[] = ['# ' + t('GELENEKSEL TEKNİKLER')]
  out.push(
    t('- Sekt: {kind} haritası; sekt ışığı {lum}, sekt iyicili {ben}, sekt kötücülü {mal}; sekt dışı kötücül {cmal}', {
      kind: sect.day ? t('gündüz') : t('gece'),
      lum: POINT[sect.luminary].name,
      ben: POINT[sect.benefic].name,
      mal: POINT[sect.malefic].name,
      cmal: POINT[sect.contraryMalefic].name
    })
  )
  const lines: string[] = []
  for (const k of SEVEN) {
    const p = natal.points.find((x) => x.key === k)
    if (!p) continue
    const d = essentialDignity(k, p.lon, sect.day)
    const tags = [
      d.domicile && t('Yönetici'),
      d.exaltation && t('Yücelim'),
      d.triplicity && t('Üçlü'),
      d.term && t('Sınır'),
      d.face && t('Yüz'),
      d.detriment && t('Zarar'),
      d.fall && t('Düşüş'),
      d.peregrine && t('Peregrin')
    ].filter(Boolean)
    lines.push(`- ${POINT[k].name}: ${t('puan')} ${d.score >= 0 ? '+' : ''}${d.score} (${tags.join(', ') || '—'})`)
  }
  out.push('## ' + t('Esas asaletler (Lilly puanı)'), ...lines)
  const asc = natal.points.find((p) => p.key === 'asc')
  const mc = natal.points.find((p) => p.key === 'mc')
  if (asc) out.push(`- ${t('ASC almuteni')}: ${POINT[almuten(asc.lon, sect.day).key].name}`)
  if (mc) out.push(`- ${t('MC almuteni')}: ${POINT[almuten(mc.lon, sect.day).key].name}`)
  const pr = profection(natal, natalJd, jd)
  out.push('## ' + t('Zaman lordları (seçili tarih için)'))
  out.push(t('- Yıllık profeksiyon: {age} yaş → {house}. ev ({sign}), yılın lordu {lord}', { age: pr.age, house: pr.house, sign: SIGNS[pr.sign].name, lord: POINT[pr.lord].name }))
  out.push(t('- Aylık profeksiyon: {sign}, ay lordu {lord}', { sign: SIGNS[pr.monthSign].name, lord: POINT[pr.monthLord].name }))
  const fd = currentFirdar(firdaria(natalJd, sect.day), jd)
  if (fd.major) {
    out.push(`- Firdaria: ${t('ana dönem')} ${firdarName(fd.major.lord)}${fd.sub?.sub ? `, ${t('alt dönem')} ${firdarName(fd.sub.sub)}` : ''}`)
  }
  const lots = hermeticLots(natal)
  if (lots.length) {
    out.push('## ' + t('Hermetik noktalar'))
    for (const l of lots) out.push(`- ${t(l.name)}: ${fmtPosText(l.lon)}`)
  }
  return out.join('\n')
}

export function starsText(conj: { star: string; key: string; orb: number }[]): string {
  if (!conj.length) return ''
  return ['## ' + t('Sabit yıldız kavuşumları (orb ≤ 1°)'), ...conj.map((c) => `- ${POINT[c.key].name} – ${c.star} (orb ${fmtOrb(c.orb)})`)].join('\n')
}
