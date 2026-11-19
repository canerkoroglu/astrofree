// "Ay Takvimi": a month of the Moon — phase, sign, sign changes, void-of-course hours and
// the exact lunations — with the traditional garden and hair notes that lunar calendars
// carry (popular in German, Russian and French almanacs). No AI needed; can go to PDF or
// to a phone calendar (.ics).
import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import type { AppSettings, DayFact, LunarPhase, MoonStay, TimingFacts, TzSpec } from '@shared/types'
import { SIGNS, splitDeg } from '../lib/astro'
import { dowMonFirst, monthsLong, t, weekdays } from '../lib/i18n'
import { jdToLocal, localToJd, nowJd } from '../lib/time'

// i18n-ignore-start (labels go through t() where shown)
const PHASE_NAME = ['Yeni Ay', 'İlk Dördün', 'Dolunay', 'Son Dördün']
const ELEMENT_DAY: Record<string, [string, string]> = {
  earth: ['Kök günü', 'Geleneksel bahçe takvimlerinde kök bitkiler (havuç, patates, soğan) için uygun sayılır.'],
  water: ['Yaprak günü', 'Geleneksel bahçe takvimlerinde yapraklı bitkiler (marul, ıspanak) ve sulama için uygun sayılır.'],
  air: ['Çiçek günü', 'Geleneksel bahçe takvimlerinde çiçekler ve çiçek açan bitkiler için uygun sayılır.'],
  fire: ['Meyve günü', 'Geleneksel bahçe takvimlerinde meyve ve tohum veren bitkiler (domates, fasulye) için uygun sayılır.']
}
// i18n-ignore-end
// Waxing crescent … waning crescent as seen from the northern hemisphere; mirrored in the south.
const ICON_N = ['🌑', '🌒', '🌓', '🌔', '🌕', '🌖', '🌗', '🌘']
const ICON_S = ['🌑', '🌘', '🌗', '🌖', '🌕', '🌔', '🌓', '🌒']

interface Props {
  tz: TzSpec
  lat: number
  lon: number
  settings: AppSettings
  onAsk: (text: string) => void
}

interface MonthData {
  key: string
  facts: TimingFacts
  stays: MoonStay[]
  phases: LunarPhase[]
}

const hm = (l: { h: number; mi: number }) => `${String(l.h).padStart(2, '0')}:${String(l.mi).padStart(2, '0')}`
const ymd = (l: { y: number; m: number; d: number }) => `${l.y}${String(l.m).padStart(2, '0')}${String(l.d).padStart(2, '0')}`
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

export default function MoonCalendar({ tz, lat, lon, settings, onAsk }: Props) {
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  const today = jdToLocal(nowJd(), tz, lon)
  const [ym, setYm] = useState({ y: today.y, m: today.m })
  const [data, setData] = useState<MonthData | null>(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [printing, setPrinting] = useState(false)
  const [msg, setMsg] = useState('')
  const icons = lat < 0 ? ICON_S : ICON_N

  const midnight = (y: number, m: number, d: number) => localToJd({ y, m, d, h: 0, mi: 0, s: 0 }, tz, lon)
  const start = midnight(ym.y, ym.m, 1)
  const next = ym.m === 12 ? { y: ym.y + 1, m: 1 } : { y: ym.y, m: ym.m + 1 }
  const days = Math.round(midnight(next.y, next.m, 1) - start)
  const key = `${start.toFixed(3)}|${days}|${sid}`

  useEffect(() => {
    let alive = true
    setError('')
    void Promise.all([window.astro.tools.timing(start, days, sid), window.astro.tools.moon(start - 3, days + 6, sid), window.astro.tools.phases(start - 1, days + 2)])
      .then(([facts, stays, phases]) => alive && setData({ key, facts, stays, phases }))
      .catch((e) => alive && setError(String(e)))
    return () => {
      alive = false
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const ready = data?.key === key ? data : null
  const local = (jd: number) => jdToLocal(jd, tz, lon)
  const dayOf = (jd: number) => Math.floor(jd - start)
  const longDate = (jd: number) => {
    const l = local(jd)
    return `${l.d} ${monthsLong()[l.m - 1]} ${l.y}, ${weekdays()[new Date(Date.UTC(l.y, l.m - 1, l.d)).getUTCDay()]}`
  }

  // Per day: the exact phase, the sign change and the void-of-course span that fall on it.
  const info = useMemo(() => {
    if (!ready) return []
    return ready.facts.days.map((f, i) => {
      const from = start + i
      const to = from + 1
      const phase = ready.phases.find((p) => p.jd >= from && p.jd < to) ?? null
      const ingress = ready.stays.find((s) => s.end >= from && s.end < to) ?? null
      const voc = ready.stays
        .filter((s) => s.voc < s.end && s.voc < to && s.end > from)
        .map((s) => ({ from: Math.max(s.voc, from), to: Math.min(s.end, to), startsBefore: s.voc < from, endsAfter: s.end > to }))
      return { f, phase, ingress, voc }
    })
  }, [ready, start])

  const cells = useMemo(() => {
    const dow = (new Date(Date.UTC(ym.y, ym.m - 1, 1)).getUTCDay() + 6) % 7
    return [...Array(dow).fill(null), ...info]
  }, [info, ym])

  const icon = (f: DayFact) => icons[Math.round(f.elong / 45) % 8]
  const signOf = (f: DayFact) => splitDeg(f.moonLon).sign
  const shown = selected !== null ? info[selected] : null
  const isToday = (i: number) => ym.y === today.y && ym.m === today.m && i === today.d - 1

  const move = (n: number) => {
    const m0 = ym.m - 1 + n
    setYm({ y: ym.y + Math.floor(m0 / 12), m: ((m0 % 12) + 12) % 12 + 1 })
    setSelected(null)
  }

  const flash = (s: string) => {
    setMsg(s)
    window.setTimeout(() => setMsg(''), 2000)
  }

  const exportIcs = async () => {
    if (!ready) return
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
    const utc = (jd: number) => new Date((jd - 2440587.5) * 86400000).toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
    const note = t('Geleneksel ölçütlere göre hesaplanmıştır; kesinlik taşımaz. AstroFree')
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AstroFree//Ay Takvimi//EN', 'CALSCALE:GREGORIAN']
    for (const p of ready.phases.filter((p) => p.jd >= start && p.jd < start + days)) {
      const sign = SIGNS[splitDeg(info[dayOf(p.jd)]?.f.moonLon ?? 0).sign].name
      lines.push('BEGIN:VEVENT', `UID:phase-${p.phase}-${ymd(local(p.jd))}@astrofree`, `DTSTAMP:${stamp}`, `DTSTART:${utc(p.jd)}`, `DTEND:${utc(p.jd + 1 / 96)}`)
      lines.push(`SUMMARY:${icsText(`${ICON_N[p.phase * 2]} ${t(PHASE_NAME[p.phase])} (${sign})`)}`, `DESCRIPTION:${icsText(note)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT')
    }
    for (const e of ready.facts.eclipses.filter((e) => e.jd >= start && e.jd < start + days)) {
      lines.push('BEGIN:VEVENT', `UID:eclipse-${ymd(local(e.jd))}@astrofree`, `DTSTAMP:${stamp}`, `DTSTART:${utc(e.jd)}`, `DTEND:${utc(e.jd + 1 / 48)}`)
      lines.push(`SUMMARY:${icsText(e.solar ? t('Güneş tutulması') : t('Ay tutulması'))}`, `DESCRIPTION:${icsText(note)}`, 'TRANSP:TRANSPARENT', 'END:VEVENT')
    }
    lines.push('END:VCALENDAR')
    if (await window.astro.exporter.ics(lines.join('\r\n') + '\r\n', `AstroFree - ${t('Ay Takvimi')} ${monthsLong()[ym.m - 1]} ${ym.y}`)) flash(t('Kaydedildi'))
  }

  const savePdf = async () => {
    setPrinting(true)
    await new Promise((r) => setTimeout(r, 400))
    try {
      await window.astro.exporter.pdf(`AstroFree - ${t('Ay Takvimi')} ${monthsLong()[ym.m - 1]} ${ym.y}`)
    } finally {
      setPrinting(false)
    }
  }

  const grid = (
    <div className="moon-grid">
      {dowMonFirst().map((d) => (
        <span key={d} className="gd-dow">
          {d}
        </span>
      ))}
      {cells.map((c, i) => {
        if (!c) return <span key={`b${i}`} />
        const idx = i - (cells.length - info.length)
        const s = signOf(c.f)
        return (
          <button
            key={idx}
            className={`moon-day el-${SIGNS[s].element}${selected === idx ? ' sel' : ''}${isToday(idx) ? ' today' : ''}${c.phase ? ' exact' : ''}`}
            onClick={() => setSelected(idx)}
            title={`${SIGNS[s].name}${c.phase ? ` · ${t(PHASE_NAME[c.phase.phase])} ${hm(local(c.phase.jd))}` : ''}`}
          >
            <span className="md-num">{idx + 1}</span>
            <span className="md-moon" aria-hidden>
              {c.phase ? icons[c.phase.phase * 2] : icon(c.f)}
            </span>
            <span className="md-sign">
              {SIGNS[s].glyph}
              {c.ingress ? <span className="md-arrow">→{SIGNS[(c.ingress.sign + 1) % 12].glyph}</span> : null}
            </span>
            {c.voc.length > 0 && <span className="md-voc" title={t('Ay boşlukta')} />}
          </button>
        )
      })}
    </div>
  )

  const lunations = ready ? ready.phases.filter((p) => p.jd >= start && p.jd < start + days) : []
  const eclipses = ready ? ready.facts.eclipses.filter((e) => e.jd >= start && e.jd < start + days) : []

  const summary = (
    <ul className="small moon-list">
      {lunations.map((p) => (
        <li key={p.jd}>
          {icons[p.phase * 2]} <strong>{t(PHASE_NAME[p.phase])}</strong> · {longDate(p.jd)} {hm(local(p.jd))} · {SIGNS[splitDeg(info[dayOf(p.jd)]?.f.moonLon ?? 0).sign].name}
        </li>
      ))}
      {eclipses.map((e) => (
        <li key={`e${e.jd}`}>
          {e.solar ? '☀️' : '🌘'} <strong>{e.solar ? t('Güneş tutulması') : t('Ay tutulması')}</strong> · {longDate(e.jd)} {hm(local(e.jd))}
        </li>
      ))}
    </ul>
  )

  const detail = (c: (typeof info)[number], i: number) => {
    const s = signOf(c.f)
    const waxing = c.f.elong < 180
    const el = ELEMENT_DAY[SIGNS[s].element]
    return (
      <div className="gd-detail">
        <h3>{longDate(start + i + 0.5)}</h3>
        <p>
          <span className="md-big" aria-hidden>
            {c.phase ? icons[c.phase.phase * 2] : icon(c.f)}
          </span>{' '}
          {c.phase ? `${t(PHASE_NAME[c.phase.phase])} ${hm(local(c.phase.jd))}` : waxing ? t('Büyüyen Ay') : t('Küçülen Ay')} · {t('Ay {sign} burcunda', { sign: SIGNS[s].name })}
        </p>
        <ul className="small">
          {c.ingress && <li>{t('{time} itibarıyla Ay {sign} burcuna geçiyor.', { time: hm(local(c.ingress.end)), sign: SIGNS[(c.ingress.sign + 1) % 12].name })}</li>}
          {c.voc.map((v, k) => (
            <li key={k}>
              {t('Ay boşlukta')}: {v.startsBefore ? '…' : hm(local(v.from))} – {v.endsAfter ? '…' : hm(local(v.to))}{' '}
              <span className="muted">{t('(gelenekte yeni başlangıçlar için tercih edilmeyen saatler)')}</span>
            </li>
          ))}
          <li>
            <strong>{t(el[0])}</strong>: {t(el[1])}
          </li>
          <li>
            {waxing
              ? t('Büyüyen Ay: gelenekte ekim, dikim ve toprağın üstünde büyüyen bitkiler için tercih edilir; saç kesimi için daha hızlı uzama ile ilişkilendirilir.')
              : t('Küçülen Ay: gelenekte budama, hasat, ot temizliği ve kök bitkiler için tercih edilir; saç kesimi için daha yavaş uzama ile ilişkilendirilir.')}
          </li>
        </ul>
        <button onClick={() => onAsk(t('{date} günü Ay nasıl bir etki gösterebilir? Kısa ve sade anlat.', { date: longDate(start + i + 0.5) }))}>{t('Yapay zekâya sor')}</button>
      </div>
    )
  }

  return (
    <div className="moon-cal pad">
      <div className="gd-head">
        <div>
          <h2>{t('Ay Takvimi')}</h2>
          <p className="muted small">{t('Ay’ın evreleri, burçları ve boşluk saatleri; geleneksel bahçe ve saç takvimi notlarıyla.')}</p>
        </div>
        <div className="reading-actions">
          <button onClick={() => void exportIcs()} disabled={!ready} title={t('Ay evrelerini ve tutulmaları telefon ya da bilgisayar takviminize ekleyin')}>
            📅 {t('Takvime aktar')}
          </button>
          <button onClick={() => void savePdf()} disabled={!ready}>
            {t('PDF olarak kaydet')}
          </button>
        </div>
      </div>

      <div className="bday-nav">
        <button onClick={() => move(-1)} aria-label={t('Önceki ay')}>
          ◀
        </button>
        <strong>
          {monthsLong()[ym.m - 1]} {ym.y}
        </strong>
        <button onClick={() => move(1)} aria-label={t('Sonraki ay')}>
          ▶
        </button>
        {(ym.y !== today.y || ym.m !== today.m) && (
          <button className="link small" onClick={() => (setYm({ y: today.y, m: today.m }), setSelected(null))}>
            {t('Bu ay')}
          </button>
        )}
      </div>

      {msg && <p className="small">{msg}</p>}
      {error && <p className="error small">{error}</p>}
      {!ready && !error && <p className="muted">{t('Hesaplanıyor…')}</p>}

      {ready && (
        <div className="gd-layout">
          <div className="gd-months">
            {grid}
            <div className="gd-legend muted small">
              <span className="moon-chip el-earth" /> {t('Kök günü')} <span className="moon-chip el-water" /> {t('Yaprak günü')} <span className="moon-chip el-air" /> {t('Çiçek günü')}{' '}
              <span className="moon-chip el-fire" /> {t('Meyve günü')} <span className="md-voc inline" /> {t('Ay boşlukta')}
            </div>
          </div>
          <div className="gd-side">
            {shown ? detail(shown, selected!) : (
              <div className="gd-detail">
                <h3>{t('Bu ayın Ay evreleri')}</h3>
                {summary}
                <p className="muted small">{t('Ayrıntı için bir güne tıklayın.')}</p>
              </div>
            )}
          </div>
        </div>
      )}
      <p className="muted small gd-note">{t('Bahçe ve saç notları geleneksel Ay takvimlerinden derlenmiştir; bilimsel bir dayanağı yoktur ve bir tavsiye değildir.')}</p>

      {printing &&
        ready &&
        createPortal(
          <div className="print-root moon-print">
            <h2>
              {t('Ay Takvimi')} · {monthsLong()[ym.m - 1]} {ym.y}
            </h2>
            {grid}
            {summary}
            <p className="small">{t('Bahçe ve saç notları geleneksel Ay takvimlerinden derlenmiştir; bilimsel bir dayanağı yoktur ve bir tavsiye değildir.')}</p>
            <p className="small">AstroFree · astrofree.cklabs.tr</p>
          </div>,
          document.body
        )}
    </div>
  )
}
