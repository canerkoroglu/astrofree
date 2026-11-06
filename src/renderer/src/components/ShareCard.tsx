// "Paylaşım kartı": social-media sized PNGs — the chart with the big three, or an
// upcoming sky event (retrograde, ingress, lunation, eclipse) with a hedged note.
import { useEffect, useRef, useState } from 'react'
import type { AppSettings, ChartRecord, SkyEvent, TzSpec } from '@shared/types'
import { t } from '../lib/i18n'
import { POINT, POINTS, SIGNS, splitDeg, type Layer } from '../lib/astro'
import { eventGlyph, eventText } from '../lib/sky'
import { fmtDate, fmtLocal, jdToLocal } from '../lib/time'
import { inlineSvg, renderCard, renderEventCard } from '../lib/shareCard'
import ChartWheel from './ChartWheel'

// i18n-ignore-start (labels go through t() where shown)
const FORMATS = {
  post: { label: 'Gönderi 4:5 (Instagram)', w: 1080, h: 1350 },
  story: { label: 'Hikâye 9:16 (Instagram, WhatsApp)', w: 1080, h: 1920 },
  square: { label: 'Kare 1:1', w: 1080, h: 1080 },
  x: { label: 'X (Twitter) 16:9', w: 1600, h: 900 },
  linkedin: { label: 'LinkedIn 1,91:1', w: 1200, h: 627 },
  pinterest: { label: 'Pinterest 2:3', w: 1000, h: 1500 }
} as const
// i18n-ignore-end
type Format = keyof typeof FORMATS

const bodyName = (swe: number) => POINTS.find((p) => p.swe === swe)?.name ?? ''

/** One hedged sentence per kind of sky event. */
function eventNote(e: SkyEvent): string {
  const p = bodyName(e.body)
  switch (e.kind) {
    case 'station-r':
      return t('{p} geri harekete başlıyor; {p} konularını gözden geçirmek için uygun bir dönem olabilir.', { p })
    case 'station-d':
      return t('{p} yeniden ileri gidiyor; bekleyen konular hız kazanabilir.', { p })
    case 'ingress':
      return t('{p} {sign} burcuna geçiyor; {p} temaları yeni bir tonda yaşanabilir.', { p, sign: SIGNS[splitDeg(e.lon).sign].name })
    case 'new-moon':
      return t('Yeni Ay {sign} burcunda; yeni niyetler ve başlangıçlar için uygun bir an olabilir.', { sign: SIGNS[splitDeg(e.lon).sign].name })
    case 'full-moon':
      return t('Dolunay {sign} burcunda; duyguların ve sonuçların görünür hâle gelebileceği bir dönem olabilir.', { sign: SIGNS[splitDeg(e.lon).sign].name })
    case 'solar-eclipse':
    case 'lunar-eclipse':
      return t('Tutulmalar geleneksel olarak dönüm noktası hissi veren gelişmelerle ilişkilendirilir; etkisi kişiden kişiye değişebilir.')
  }
}

export default function ShareCard({
  natal,
  rec,
  settings,
  events,
  tz,
  lon,
  onClose
}: {
  natal: Layer
  rec: ChartRecord
  settings: AppSettings
  /** Upcoming sky events for the "sky event" card. */
  events: SkyEvent[]
  tz: TzSpec
  lon: number
  onClose: () => void
}) {
  const [kind, setKind] = useState<'chart' | 'event'>('chart')
  const [eventIdx, setEventIdx] = useState(0)
  const [format, setFormat] = useState<Format>('post')
  const [showName, setShowName] = useState(true)
  const [showDate, setShowDate] = useState(false)
  const [png, setPng] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const wheelRef = useRef<HTMLDivElement>(null)
  const timeKnown = !rec.timeUnknown
  const event = events[eventIdx]

  useEffect(() => {
    let alive = true
    setPng(null)
    const id = window.setTimeout(async () => {
      const css = getComputedStyle(document.documentElement)
      const v = (n: string) => css.getPropertyValue(n).trim()
      const f = FORMATS[format]
      const footer = [
        { text: 'astrofree.cklabs.tr', size: 28, weight: 600, color: v('--ink') },
        { text: t('Ücretsiz ve açık kaynak astroloji programı · kişisel keşif amaçlıdır'), size: 22, color: v('--muted'), gap: 12 }
      ]
      try {
        let url: string
        if (kind === 'event' && event) {
          url = await renderEventCard({
            width: f.w,
            height: f.h,
            bg: v('--paper'),
            ink: v('--ink'),
            muted: v('--muted'),
            accent: v('--accent'),
            symbol: eventGlyph(event),
            title: eventText(event),
            date: fmtLocal(jdToLocal(event.jd, tz, lon)).slice(0, 16),
            note: eventNote(event),
            brand: 'AstroFree',
            footer
          })
        } else {
          const svg = wheelRef.current?.querySelector('svg.wheel') as SVGSVGElement | null
          if (!svg) return
          const pt = (k: string) => natal.points.find((p) => p.key === k)
          const trio = (['sun', 'moon', ...(timeKnown ? ['asc'] : [])] as string[])
            .map((k) => pt(k))
            .filter((p): p is NonNullable<typeof p> => !!p)
            .map((p) => [SIGNS[splitDeg(p.lon).sign].glyph, POINT[p.key].name.replace(/\s*\(.*\)$/, ''), SIGNS[splitDeg(p.lon).sign].name] as [string, string, string])
          const header = [
            { text: 'AstroFree', size: 30, weight: 700, color: v('--accent'), gap: 0 },
            ...(showName && rec.name ? [{ text: rec.name, size: 58, weight: 700, color: v('--ink'), gap: 26 }] : []),
            ...(showDate ? [{ text: `${fmtDate(rec.local)} · ${rec.place.name.split(',')[0]}`, size: 28, color: v('--muted'), gap: 14 }] : [])
          ]
          url = await renderCard({
            width: f.w,
            height: f.h,
            bg: v('--paper'),
            ink: v('--ink'),
            muted: v('--muted'),
            accent: v('--accent'),
            wheel: inlineSvg(svg),
            header,
            trio,
            footer
          })
        }
        if (alive) setPng(url)
      } catch (e) {
        if (alive) setMsg(String(e))
      }
    }, 300)
    return () => {
      alive = false
      window.clearTimeout(id)
    }
  }, [kind, event, format, showName, showDate, natal, rec, timeKnown, tz, lon])

  const flash = (s: string) => {
    setMsg(s)
    window.setTimeout(() => setMsg(''), 1800)
  }
  const fileName = kind === 'event' && event ? `AstroFree - ${eventText(event)}` : `${rec.name || 'astrofree'} - ${t('kart')}`

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal share-card" role="dialog" aria-label={t('Paylaşım kartı')}>
        <h2>{t('Paylaşım kartı')}</h2>
        <div className="share-layout">
          <div className="share-preview">{png ? <img src={png} alt={t('Paylaşım kartı')} /> : <div className="muted">{t('Hazırlanıyor…')}</div>}</div>
          <div className="share-options">
            <div className="seg share-kind" role="radiogroup" aria-label={t('Kart türü')}>
              <button role="radio" aria-checked={kind === 'chart'} className={kind === 'chart' ? 'on' : ''} onClick={() => setKind('chart')}>
                {t('Harita')}
              </button>
              <button role="radio" aria-checked={kind === 'event'} className={kind === 'event' ? 'on' : ''} disabled={!events.length} onClick={() => setKind('event')}>
                {t('Gökyüzü olayı')}
              </button>
            </div>
            {kind === 'event' && (
              <label>
                {t('Olay')}
                <select value={eventIdx} onChange={(e) => setEventIdx(Number(e.target.value))}>
                  {events.map((e, i) => (
                    <option key={i} value={i}>
                      {fmtDate(jdToLocal(e.jd, tz, lon))} · {eventText(e)}
                    </option>
                  ))}
                </select>
              </label>
            )}
            <fieldset>
              <legend>{t('Boyut')}</legend>
              {(Object.keys(FORMATS) as Format[]).map((k) => (
                <label key={k} className="inline">
                  <input type="radio" name="share-format" checked={format === k} onChange={() => setFormat(k)} /> {t(FORMATS[k].label)}
                </label>
              ))}
            </fieldset>
            {kind === 'chart' && (
              <fieldset>
                <legend>{t('Gizlilik')}</legend>
                <label className="inline">
                  <input type="checkbox" checked={showName} onChange={(e) => setShowName(e.target.checked)} /> {t('İsmi göster')}
                </label>
                <label className="inline">
                  <input type="checkbox" checked={showDate} onChange={(e) => setShowDate(e.target.checked)} /> {t('Doğum tarihi ve yerini göster')}
                </label>
                <p className="muted small">{t('Doğum saati karta hiçbir zaman yazılmaz.')}</p>
              </fieldset>
            )}
            <p className="muted small">{t('Kart, seçili temanın renkleriyle çizilir.')}</p>
            {msg && <p className="small">{msg}</p>}
          </div>
        </div>
        <div className="actions">
          <button onClick={onClose}>{t('Kapat')}</button>
          <button disabled={!png} onClick={async () => png && (await window.astro.exporter.copyImage(png)) && flash(t('Panoya kopyalandı'))}>
            {t('Panoya kopyala')}
          </button>
          <button className="primary" disabled={!png} onClick={async () => png && (await window.astro.exporter.pngData(png, fileName)) && flash(t('Kaydedildi'))}>
            {t('PNG olarak kaydet')}
          </button>
        </div>
        {/* Off-screen natal wheel used as the card's source. */}
        <div ref={wheelRef} className="share-source" aria-hidden>
          <ChartWheel natal={natal} outers={[]} settings={settings} aspectLayer={-1} timeKnown={timeKnown} />
        </div>
      </div>
    </div>
  )
}
