// "Paylaşım kartı": a social-media sized PNG of the chart with the big three.
import { useEffect, useRef, useState } from 'react'
import type { AppSettings, ChartRecord } from '@shared/types'
import { t } from '../lib/i18n'
import { POINT, SIGNS, splitDeg, type Layer } from '../lib/astro'
import { fmtDate } from '../lib/time'
import { inlineSvg, renderCard } from '../lib/shareCard'
import ChartWheel from './ChartWheel'

const FORMATS = {
  post: { label: 'Gönderi 4:5', w: 1080, h: 1350 },
  story: { label: 'Hikâye 9:16', w: 1080, h: 1920 },
  square: { label: 'Kare 1:1', w: 1080, h: 1080 }
} as const
type Format = keyof typeof FORMATS

export default function ShareCard({ natal, rec, settings, onClose }: { natal: Layer; rec: ChartRecord; settings: AppSettings; onClose: () => void }) {
  const [format, setFormat] = useState<Format>('post')
  const [showName, setShowName] = useState(true)
  const [showDate, setShowDate] = useState(false)
  const [png, setPng] = useState<string | null>(null)
  const [msg, setMsg] = useState('')
  const wheelRef = useRef<HTMLDivElement>(null)
  const timeKnown = !rec.timeUnknown

  useEffect(() => {
    let alive = true
    const id = window.setTimeout(async () => {
      const svg = wheelRef.current?.querySelector('svg.wheel') as SVGSVGElement | null
      if (!svg) return
      const css = getComputedStyle(document.documentElement)
      const v = (n: string) => css.getPropertyValue(n).trim()
      const pt = (k: string) => natal.points.find((p) => p.key === k)
      const trio = (['sun', 'moon', ...(timeKnown ? ['asc'] : [])] as string[])
        .map((k) => pt(k))
        .filter((p): p is NonNullable<typeof p> => !!p)
        .map((p) => [SIGNS[splitDeg(p.lon).sign].glyph, POINT[p.key].name.replace(/\s*\(.*\)$/, ''), SIGNS[splitDeg(p.lon).sign].name] as [string, string, string])
      const f = FORMATS[format]
      const header = [
        { text: 'AstroFree', size: 30, weight: 700, color: v('--accent'), gap: 0 },
        ...(showName && rec.name ? [{ text: rec.name, size: 58, weight: 700, color: v('--ink'), gap: 26 }] : []),
        ...(showDate ? [{ text: `${fmtDate(rec.local)} · ${rec.place.name.split(',')[0]}`, size: 28, color: v('--muted'), gap: 14 }] : [])
      ]
      const footer = [
        { text: 'astrofree.cklabs.tr', size: 28, weight: 600, color: v('--ink') },
        { text: t('Ücretsiz ve açık kaynak astroloji programı · kişisel keşif amaçlıdır'), size: 22, color: v('--muted'), gap: 12 }
      ]
      try {
        const url = await renderCard({
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
        if (alive) setPng(url)
      } catch (e) {
        if (alive) setMsg(String(e))
      }
    }, 300)
    return () => {
      alive = false
      window.clearTimeout(id)
    }
  }, [format, showName, showDate, natal, rec, timeKnown])

  const flash = (s: string) => {
    setMsg(s)
    window.setTimeout(() => setMsg(''), 1800)
  }

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal share-card" role="dialog" aria-label={t('Paylaşım kartı')}>
        <h2>{t('Paylaşım kartı')}</h2>
        <div className="share-layout">
          <div className="share-preview">{png ? <img src={png} alt={t('Paylaşım kartı')} /> : <div className="muted">{t('Hazırlanıyor…')}</div>}</div>
          <div className="share-options">
            <fieldset>
              <legend>{t('Boyut')}</legend>
              {(Object.keys(FORMATS) as Format[]).map((k) => (
                <label key={k} className="inline">
                  <input type="radio" name="share-format" checked={format === k} onChange={() => setFormat(k)} /> {t(FORMATS[k].label)}
                </label>
              ))}
            </fieldset>
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
            <p className="muted small">{t('Çark, seçili temanın renkleriyle çizilir.')}</p>
            {msg && <p className="small">{msg}</p>}
          </div>
        </div>
        <div className="actions">
          <button onClick={onClose}>{t('Kapat')}</button>
          <button disabled={!png} onClick={async () => png && (await window.astro.exporter.copyImage(png)) && flash(t('Panoya kopyalandı'))}>
            {t('Panoya kopyala')}
          </button>
          <button
            className="primary"
            disabled={!png}
            onClick={async () => png && (await window.astro.exporter.pngData(png, `${rec.name || 'astrofree'} - ${t('kart')}`)) && flash(t('Kaydedildi'))}
          >
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

