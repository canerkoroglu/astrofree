import type { PlanetaryHours, SkyReport, TzSpec } from '@shared/types'
import { fmtPos, glyph, moonPhase } from '../lib/astro'
import { bodyKey, eventGlyph, eventText, fmtEventDate, moonIllumination } from '../lib/sky'
import { jdToLocal } from '../lib/time'

const p2 = (n: number) => String(n).padStart(2, '0')

const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export default function SkyPanel({
  report,
  hours,
  jd,
  tz,
  lon,
  onJump
}: {
  report: SkyReport | null
  hours: PlanetaryHours | null
  jd: number
  tz: TzSpec
  lon: number
  onJump: (jd: number) => void
}) {
  if (!report) return <div className="sky muted small pad">Gökyüzü hesaplanıyor…</div>
  const ref = jdToLocal(report.jd, tz, lon)
  const ph = moonPhase(report.sunLon, report.moonLon)
  const date = (jd: number) => fmtEventDate(jd, tz, lon, report.jd)
  const eclipses = report.nextEclipses.filter((e) => !report.events.includes(e))
  return (
    <div className="sky">
      <div className="sky-head">
        Gökyüzü · {p2(ref.d)}.{p2(ref.m)}.{ref.y}
      </div>
      <div className="sky-moon">
        <span className="glyph">{glyph('moon')}</span> {fmtPos(report.moonLon)} · {ph.name} %{moonIllumination(report)}
      </div>

      {report.voc && (
        <div className={jd >= report.voc.start && jd < report.voc.end ? 'sky-voc on' : 'sky-voc'} title="Ay'ın burcundan çıkmadan önceki son büyük açısından burç değişimine kadar">
          {jd >= report.voc.start && jd < report.voc.end ? 'Ay boşlukta' : 'Sonraki boşluk'}:{' '}
          <button className="link" onClick={() => onJump(report.voc!.start)}>
            {date(report.voc.start)}
          </button>{' '}
          →{' '}
          <button className="link" onClick={() => onJump(report.voc!.end)}>
            {date(report.voc.end)}
          </button>
        </div>
      )}
      {hours && <HoursView hours={hours} jd={jd} tz={tz} lon={lon} onJump={onJump} />}

      <div className="sky-sub">Retro gezegenler</div>
      {report.retro.length === 0 && <div className="muted small">Retro gezegen yok</div>}
      {report.retro.map((r) => (
        <div key={r.body} className="sky-retro" title="Retro başlangıcı → düz harekete geçiş">
          <span className="glyph">{glyph(bodyKey(r.body))}</span>
          <span className="retro">℞</span>
          <button className="link" disabled={!r.start} onClick={() => r.start && onJump(r.start)}>
            {r.start ? date(r.start).split(' ')[0] : '?'}
          </button>
          →
          <button className="link" disabled={!r.end} onClick={() => r.end && onJump(r.end)}>
            {r.end ? date(r.end).split(' ')[0] : '?'}
          </button>
        </div>
      ))}

      <div className="sky-sub">Yaklaşan olaylar</div>
      <ul className="sky-events">
        {report.events.map((e, i) => (
          <li key={i}>
            <button onClick={() => onJump(e.jd)} title="Bu ana git">
              <span className="when">{date(e.jd)}</span>
              <span className={`glyph ev ${e.kind}`}>{eventGlyph(e)}</span>
              <span className="what">
                {eventText(e)} <span className="muted">{fmtPos(e.lon)}</span>
              </span>
            </button>
          </li>
        ))}
        {eclipses.map((e, i) => (
          <li key={`ecl${i}`}>
            <button onClick={() => onJump(e.jd)} title="Bu ana git">
              <span className="when">{date(e.jd)}</span>
              <span className="glyph ev">{eventGlyph(e)}</span>
              <span className="what">
                {eventText(e)} <span className="muted">{fmtPos(e.lon)}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  )
}

function HoursView({ hours, jd, tz, lon, onJump }: { hours: PlanetaryHours; jd: number; tz: TzSpec; lon: number; onJump: (jd: number) => void }) {
  const hm = (t: number) => {
    const l = jdToLocal(t, tz, lon)
    return `${p2(l.h)}:${p2(l.mi)}`
  }
  const cur = hours.hours.find((h) => jd >= h.start && jd < h.end)
  return (
    <details className="sky-hours">
      <summary>
        Gün <span className="glyph">{glyph(bodyKey(hours.dayRuler))}</span> {WEEKDAYS[hours.weekday]}
        {cur && (
          <>
            {' '}
            · Saat <span className="glyph">{glyph(bodyKey(cur.ruler))}</span> {hm(cur.start)}–{hm(cur.end)}
          </>
        )}
      </summary>
      <div className="muted small">
        Doğuş {hm(hours.sunrise)} · Batış {hm(hours.sunset)}
      </div>
      <div className="hours-grid">
        {hours.hours.map((h, i) => (
          <button key={i} className={h === cur ? 'on' : h.night ? 'night' : ''} onClick={() => onJump(h.start + 1 / 1440)}>
            <span className="glyph">{glyph(bodyKey(h.ruler))}</span> {hm(h.start)}
          </button>
        ))}
      </div>
    </details>
  )
}
