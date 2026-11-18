// "Uygun Günler": days that may suit a wedding, a diet, a haircut… by traditional
// electional rules, on a month calendar, without needing the AI. Same engine as the
// chat's timing data (lib/timing), so both always agree.
import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, TimingFacts, TzSpec } from '@shared/types'
import { dowMonFirst, monthsLong, t, weekdays } from '../lib/i18n'
import { fmtDate, jdToLocal, localToJd, nowJd } from '../lib/time'
import { bodyName, criteria, pick, retroPeriods, RULES, scoreDay, TOPIC_LABEL, type Scored, type Topic } from '../lib/timing'

const TOPICS: Topic[] = ['wedding', 'start', 'contract', 'purchase', 'travel', 'move', 'hair', 'diet']
// i18n-ignore-start (labels go through t() where shown)
const TOPIC_ICON: Record<string, string> = { wedding: '💍', start: '🚀', contract: '✍️', purchase: '📱', travel: '✈️', move: '📦', hair: '✂️', diet: '🥗' }
const TOPIC_SHORT: Record<string, string> = {
  wedding: 'Nikâh / düğün',
  start: 'Yeni iş',
  contract: 'Sözleşme',
  purchase: 'Alışveriş / cihaz',
  travel: 'Yolculuk',
  move: 'Taşınma',
  hair: 'Saç',
  diet: 'Diyet'
}
// i18n-ignore-end
type Range = '30' | '90' | '180' | '365' | 'next'

interface Props {
  natal: { key: string; lon: number; who?: string }[]
  tz: TzSpec
  lon: number
  settings: AppSettings
  onAsk: (text: string) => void
}

const ymd = (l: { y: number; m: number; d: number }) => `${l.y}${String(l.m).padStart(2, '0')}${String(l.d).padStart(2, '0')}`
const icsText = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/([,;])/g, '\\$1')

export default function GoodDays({ natal, tz, lon, settings, onAsk }: Props) {
  const [topic, setTopic] = useState<Topic>(() => {
    try {
      const v = localStorage.getItem('good-days-topic') as Topic | null
      return v && TOPICS.includes(v) ? v : 'wedding'
    } catch {
      return 'wedding'
    }
  })
  const [range, setRange] = useState<Range>('90')
  const [facts, setFacts] = useState<{ key: string; f: TimingFacts } | null>(null)
  const [error, setError] = useState('')
  const [selected, setSelected] = useState<number | null>(null)
  const [msg, setMsg] = useState('')
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null

  const pickTopic = (k: Topic) => {
    setTopic(k)
    setSelected(null)
    try {
      localStorage.setItem('good-days-topic', k)
    } catch {
      /* storage unavailable */
    }
  }

  // Range from local midnight today (or 1 January of next year).
  const today = jdToLocal(nowJd(), tz, lon)
  const midnight = (y: number, m: number, d: number) => localToJd({ y, m, d, h: 0, mi: 0, s: 0 }, tz, lon)
  const start = range === 'next' ? midnight(today.y + 1, 1, 1) : midnight(today.y, today.m, today.d)
  const days = range === 'next' ? Math.round(midnight(today.y + 2, 1, 1) - start) : Number(range)
  const key = `${start.toFixed(3)}|${days}|${sid}`

  useEffect(() => {
    let alive = true
    setError('')
    window.astro.tools
      .timing(start, days, sid)
      .then((f) => alive && setFacts({ key, f }))
      .catch((e) => alive && setError(String(e)))
    return () => {
      alive = false
    }
  }, [key]) // eslint-disable-line react-hooks/exhaustive-deps

  const ready = facts?.key === key ? facts.f : null
  const rule = RULES[topic]!
  const scored = useMemo(() => (ready ? ready.days.map((f) => scoreDay(f, rule, ready, natal)) : []), [ready, rule, natal])
  const best = useMemo(() => pick(scored, days), [scored, days])
  const bestSet = new Set(best.map((b) => b.day.jd))
  const periods = ready ? retroPeriods(ready, start, start + days) : []
  const eclipses = ready ? ready.eclipses.filter((e) => e.jd >= start && e.jd < start + days) : []
  const nowJ = nowJd()
  const todayScore = scored.find((s) => nowJ >= s.day.jd - 0.5 && nowJ < s.day.jd + 0.5)
  const shown = scored.find((s) => s.day.jd === selected) ?? null

  const local = (jd: number) => jdToLocal(jd, tz, lon)
  const longDate = (jd: number) => {
    const l = local(jd)
    return `${l.d} ${monthsLong()[l.m - 1]} ${l.y}, ${weekdays()[new Date(Date.UTC(l.y, l.m - 1, l.d)).getUTCDay()]}`
  }

  // Month grids (Monday first).
  const months = useMemo(() => {
    const out: { y: number; m: number; cells: (Scored | null)[] }[] = []
    for (const s of scored) {
      const l = jdToLocal(s.day.jd, tz, lon)
      let mo = out[out.length - 1]
      if (!mo || mo.y !== l.y || mo.m !== l.m) {
        mo = { y: l.y, m: l.m, cells: [] }
        const dow = (new Date(Date.UTC(l.y, l.m - 1, 1)).getUTCDay() + 6) % 7
        // Days of the month before the range start stay empty.
        for (let i = 0; i < dow + l.d - 1; i++) mo.cells.push(null)
        out.push(mo)
      }
      mo.cells.push(s)
    }
    return out
  }, [scored, tz, lon])

  const flash = (s: string) => {
    setMsg(s)
    window.setTimeout(() => setMsg(''), 2000)
  }

  const exportIcs = async () => {
    const label = t(TOPIC_LABEL[topic])
    const stamp = new Date().toISOString().replace(/[-:]/g, '').replace(/\.\d+Z$/, 'Z')
    const ev = (from: number, to: number, summary: string, desc: string, uid: string) => {
      const a = local(from)
      const b = local(to)
      const end = new Date(Date.UTC(b.y, b.m - 1, b.d + 1))
      return [
        'BEGIN:VEVENT',
        `UID:${uid}@astrofree`,
        `DTSTAMP:${stamp}`,
        `DTSTART;VALUE=DATE:${ymd(a)}`,
        `DTEND;VALUE=DATE:${ymd({ y: end.getUTCFullYear(), m: end.getUTCMonth() + 1, d: end.getUTCDate() })}`,
        `SUMMARY:${icsText(summary)}`,
        `DESCRIPTION:${icsText(desc)}`,
        'TRANSP:TRANSPARENT',
        'END:VEVENT'
      ]
    }
    const note = t('Geleneksel ölçütlere göre hesaplanmıştır; kesinlik taşımaz. AstroFree')
    const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//AstroFree//Uygun Gunler//EN', 'CALSCALE:GREGORIAN']
    for (const b of best) lines.push(...ev(b.day.jd, b.day.jd, t('{topic} için uygun olabilir', { topic: label }), `${b.notes.join('; ')}\n${note}`, `${topic}-${ymd(local(b.day.jd))}`))
    for (const p of periods)
      if (p.from && p.to) lines.push(...ev(p.from, p.to, t('{p} retro', { p: bodyName(p.body) }), note, `retro-${p.body}-${ymd(local(p.from))}`))
    for (const e of eclipses) lines.push(...ev(e.jd, e.jd, e.solar ? t('Güneş tutulması') : t('Ay tutulması'), note, `eclipse-${ymd(local(e.jd))}`))
    lines.push('END:VCALENDAR')
    if (await window.astro.exporter.ics(lines.join('\r\n') + '\r\n', `AstroFree - ${label}`)) flash(t('Kaydedildi'))
  }

  const verdict = (s: Scored) =>
    s.reasons.length ? t('Ölçütlere uymuyor: {why}', { why: s.reasons.join('; ') }) : bestSet.has(s.day.jd) ? t('Bu aralıkta öne çıkan günlerden') : t('Ölçütlere uyuyor')

  return (
    <div className="good-days pad">
      <div className="gd-head">
        <div>
          <h2>{t('Uygun Günler')}</h2>
          <p className="muted small">{t('Bir iş için geleneksel astrolojide uygun sayılan günler. Yapay zekâ gerekmez.')}</p>
        </div>
        <button onClick={() => void exportIcs()} disabled={!ready || (!best.length && !periods.length)} title={t('Öne çıkan günleri, retro dönemlerini ve tutulmaları telefon ya da bilgisayar takviminize ekleyin')}>
          📅 {t('Takvime aktar')}
        </button>
      </div>

      <div className="gd-topics" role="radiogroup" aria-label={t('Ne için?')}>
        {TOPICS.map((k) => (
          <button key={k} role="radio" aria-checked={topic === k} className={topic === k ? 'on' : ''} onClick={() => pickTopic(k)}>
            <span aria-hidden>{TOPIC_ICON[k]}</span> {t(TOPIC_SHORT[k])}
          </button>
        ))}
      </div>
      <div className="seg gd-range" role="radiogroup" aria-label={t('Aralık')}>
        {(
          [
            ['30', t('30 gün')],
            ['90', t('3 ay')],
            ['180', t('6 ay')],
            ['365', t('12 ay')],
            ['next', String(today.y + 1)]
          ] as [Range, string][]
        ).map(([k, l]) => (
          <button key={k} role="radio" aria-checked={range === k} className={range === k ? 'on' : ''} onClick={() => (setRange(k), setSelected(null))}>
            {l}
          </button>
        ))}
      </div>

      {msg && <p className="small">{msg}</p>}
      {error && <p className="error small">{error}</p>}
      {!ready && !error && <p className="muted">{t('Hesaplanıyor…')}</p>}

      {ready && (
        <>
          {todayScore && (
            <div className={`gd-today ${todayScore.reasons.length ? 'no' : 'yes'}`}>
              <strong>{t('Bugün')}:</strong> {verdict(todayScore)}
            </div>
          )}

          <div className="gd-layout">
            <div className="gd-months">
              {months.map((mo) => (
                <div key={`${mo.y}-${mo.m}`} className="gd-month">
                  <h4>
                    {monthsLong()[mo.m - 1]} {mo.y}
                  </h4>
                  <div className="gd-grid">
                    {dowMonFirst().map((d) => (
                      <span key={d} className="gd-dow">
                        {d}
                      </span>
                    ))}
                    {mo.cells.map((c, i) =>
                      c ? (
                        <button
                          key={i}
                          className={`gd-day${bestSet.has(c.day.jd) ? ' best' : c.reasons.length ? ' no' : ' ok'}${selected === c.day.jd ? ' sel' : ''}`}
                          onClick={() => setSelected(c.day.jd)}
                          title={verdict(c)}
                        >
                          {local(c.day.jd).d}
                        </button>
                      ) : (
                        <span key={i} />
                      )
                    )}
                  </div>
                </div>
              ))}
              <div className="gd-legend muted small">
                <span className="gd-day best">●</span> {t('öne çıkan')} <span className="gd-day ok">●</span> {t('ölçütlere uyuyor')}{' '}
                <span className="gd-day no">●</span> {t('uymuyor')}
              </div>
            </div>

            <div className="gd-side">
              {shown ? (
                <div className="gd-detail">
                  <h3>{longDate(shown.day.jd)}</h3>
                  <p>{verdict(shown)}</p>
                  <ul className="small">
                    {shown.notes.map((n, i) => (
                      <li key={i}>{n}</li>
                    ))}
                  </ul>
                  <button
                    onClick={() =>
                      onAsk(t('{date} günü {topic} için nasıl görünüyor? Kısa ve sade anlat.', { date: fmtDate(local(shown.day.jd)), topic: t(TOPIC_LABEL[topic]) }))
                    }
                  >
                    {t('Yapay zekâya sor')}
                  </button>
                </div>
              ) : (
                <div className="gd-detail">
                  <h3>{t('Öne çıkan günler')}</h3>
                  {best.length ? (
                    <ul className="gd-best">
                      {best.map((b) => (
                        <li key={b.day.jd}>
                          <button className="link" onClick={() => setSelected(b.day.jd)}>
                            {longDate(b.day.jd)}
                          </button>
                          <div className="muted small">{b.notes.join('; ')}</div>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="muted small">{t('Bu aralıkta tüm ölçütlere uyan gün yok; daha uzun bir aralık seçilebilir.')}</p>
                  )}
                </div>
              )}

              {(periods.length > 0 || eclipses.length > 0) && (
                <div className="gd-detail">
                  <h3>{t('Bu aralıktaki dönemler')}</h3>
                  <ul className="small">
                    {periods.map((p, i) => (
                      <li key={i}>
                        {t('{p} retro', { p: bodyName(p.body) })}: {p.from ? fmtDate(local(p.from)) : '…'} – {p.to ? fmtDate(local(p.to)) : '…'}
                      </li>
                    ))}
                    {eclipses.map((e, i) => (
                      <li key={`e${i}`}>
                        {e.solar ? t('Güneş tutulması') : t('Ay tutulması')}: {fmtDate(local(e.jd))}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <details className="gd-detail">
                <summary>{t('Nasıl hesaplanıyor?')}</summary>
                <ul className="small">
                  {criteria(rule, natal.length > 0).map((c, i) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </details>
            </div>
          </div>
          <p className="muted small gd-note">
            {t('Bu günler yalnızca geleneksel seçim astrolojisi ölçütlerine göre hesaplanmıştır; kesinlik taşımaz ve bir tavsiye değildir. Kararlarınızda kendi koşullarınız her zaman önce gelir.')}
          </p>
        </>
      )}
    </div>
  )
}
