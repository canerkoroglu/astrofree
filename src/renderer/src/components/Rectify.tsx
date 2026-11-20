// "Doğum saatini bul": birth-time rectification from the person's dated life events
// (Olaylarım). Every candidate minute in a chosen window is scored by how closely slow
// transits, solar-arc directions and the progressed Moon reach the angles on those dates;
// the best few times are listed with the reasons. Approximate by nature; said so plainly.
import ModalClose from './ModalClose'
import { useMemo, useState } from 'react'
import type { ChartRecord, RectifyContact, RectifyResult } from '@shared/types'
import { SIGNS, splitDeg } from '../lib/astro'
import { t } from '../lib/i18n'
import { categoryIcon } from '../lib/journal'
import { fmtDate, julday, localToJd } from '../lib/time'
import { bodyName } from '../lib/timing'

const hm = (min: number) => `${String(Math.floor(min / 60)).padStart(2, '0')}:${String(min % 60).padStart(2, '0')}`
const toMin = (s: string) => {
  const m = /^(\d{1,2}):(\d{2})$/.exec(s)
  return m ? Math.min(1439, +m[1] * 60 + +m[2]) : null
}
// i18n-ignore-start (labels go through t() where shown)
const ANGLE: Record<RectifyContact['angle'], string> = { asc: 'Yükselen', mc: 'MC', dsc: 'Alçalan', ic: 'IC' }
// i18n-ignore-end

export default function Rectify({ rec, onApply, onClose }: { rec: ChartRecord; onApply: (h: number, mi: number) => void; onClose: () => void }) {
  const events = rec.journal ?? []
  const known = !rec.timeUnknown
  const at = rec.local.h * 60 + rec.local.mi
  // A recorded time is refined within two hours either side; an unknown one searches the whole day.
  const [from, setFrom] = useState(known ? hm(Math.max(0, at - 120)) : '00:00')
  const [to, setTo] = useState(known ? hm(Math.min(1439, at + 120)) : '23:59')
  const [result, setResult] = useState<{ mins: number[]; r: RectifyResult } | null>(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const byId = useMemo(() => new Map(events.map((e) => [e.id, e])), [events])

  const run = async () => {
    const a = toMin(from)
    const b = toMin(to)
    if (a === null || b === null || b <= a) return setError(t('Geçerli bir saat aralığı girin (ör. 04:00 – 09:00).'))
    setError('')
    setBusy(true)
    try {
      const step = b - a <= 360 ? 2 : 4
      const mins: number[] = []
      for (let m = a; m <= b; m += step) mins.push(m)
      const candidates = mins.map((m) => localToJd({ ...rec.local, h: Math.floor(m / 60), mi: m % 60, s: 0 }, rec.tz, rec.place.lon))
      const r = await window.astro.tools.rectify({
        candidates,
        lat: rec.place.lat,
        lon: rec.place.lon,
        events: events.map((e) => ({ id: e.id, jd: julday(e.date.y, e.date.m, e.date.d, 12), category: e.category }))
      })
      setResult({ mins, r })
    } catch (e) {
      setError(String((e as Error).message ?? e))
    } finally {
      setBusy(false)
    }
  }

  const reason = (c: RectifyContact) => {
    const angle = t(ANGLE[c.angle])
    const planet = bodyName(c.body)
    const orb = c.orb.toLocaleString(document.documentElement.lang || undefined, { maximumFractionDigits: 1 })
    const square = c.aspect === 'square'
    const text =
      c.kind === 'transit'
        ? square
          ? t('{planet} transiti {angle} ile kare açıda', { planet, angle })
          : t('{planet} transiti {angle} üzerinde', { planet, angle })
        : c.kind === 'arcAngle'
          ? square
            ? t('Güneş yayıyla ilerleyen {angle}, doğum {planet} ile kare açıda', { planet, angle })
            : t('Güneş yayıyla ilerleyen {angle}, doğum {planet} üzerinde', { planet, angle })
          : c.kind === 'arcPlanet'
            ? square
              ? t('Güneş yayıyla ilerleyen {planet}, {angle} ile kare açıda', { planet, angle })
              : t('Güneş yayıyla ilerleyen {planet}, {angle} üzerinde', { planet, angle })
            : t('İlerletilmiş Ay {angle} üzerinde', { angle })
    return `${text} (${orb}°)`
  }

  // Score curve over the window.
  const curve = result && (() => {
    const W = 600
    const H = 90
    const { mins, r } = result
    const max = Math.max(...r.scores, 0.01)
    const x = (i: number) => (mins.length > 1 ? (i / (mins.length - 1)) * W : W / 2)
    const y = (v: number) => H - 6 - (v / max) * (H - 16)
    const pts = r.scores.map((v, i) => `${x(i).toFixed(1)},${y(v).toFixed(1)}`).join(' ')
    const span = mins[mins.length - 1] - mins[0]
    const tick = span > 720 ? 180 : span > 240 ? 60 : 30
    const ticks: number[] = []
    for (let m = Math.ceil(mins[0] / tick) * tick; m <= mins[mins.length - 1]; m += tick) ticks.push(m)
    const xm = (m: number) => (span ? ((m - mins[0]) / span) * W : W / 2)
    return (
      <svg viewBox={`0 -4 ${W} ${H + 18}`} className="rect-curve" role="img" aria-label={t('Saatlere göre uyum')}>
        <polyline points={pts} className="rect-line" />
        {r.best.map((b, k) => (
          <g key={b.index}>
            <line x1={x(b.index)} x2={x(b.index)} y1={0} y2={H} className="rect-mark" />
            <text x={x(b.index) + 3} y={10} className="rect-label">
              {k + 1}
            </text>
          </g>
        ))}
        {ticks.map((m) => (
          <text key={m} x={xm(m)} y={H + 12} className="rect-tick" textAnchor="middle">
            {hm(m)}
          </text>
        ))}
      </svg>
    )
  })()

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal wide rectify-modal" role="dialog" aria-label={t('Doğum saatini bul')}>
        <ModalClose onClose={onClose} />
        <h2>🕰 {t('Doğum saatini bul')}</h2>
        <p className="muted small">
          {t('{n} olayınızın tarihleri, gün içindeki her olası doğum saatiyle karşılaştırılır: yavaş gezegenlerin ve Güneş yayı direksiyonlarının haritanın köşelerine (Yükselen, MC, Alçalan, IC) o tarihlerde ne kadar yakın olduğuna bakılır. Olay türü seçilmişse ilgili köşe daha çok sayılır.', { n: events.length })}
        </p>
        {events.length < 5 && <p className="small warn">{t('Sonuç ne kadar çok ve çeşitli olayla çalışırsa o kadar anlamlı olabilir; 5–10 önemli olay önerilir.')}</p>}

        <div className="rect-window">
          <label className="inline">
            {t('Aranacak aralık')}
            <input value={from} onChange={(e) => setFrom(e.target.value)} placeholder="00:00" size={5} />
            –
            <input value={to} onChange={(e) => setTo(e.target.value)} placeholder="23:59" size={5} />
          </label>
          <button className="link small" onClick={() => (setFrom('00:00'), setTo('23:59'))}>
            {t('Tüm gün')}
          </button>
          <span className="muted small">{t('Bir ipucu varsa (ör. "sabaha karşı") aralığı daraltmak sonucu güçlendirebilir.')}</span>
          <span className="grow" />
          <button className="primary" disabled={busy || events.length < 3} onClick={() => void run()}>
            {busy ? t('Hesaplanıyor…') : t('Hesapla')}
          </button>
        </div>
        {error && <p className="error small">{error}</p>}

        {result && (
          <>
            {curve}
            {result.r.best.length ? (
              <ol className="rect-best">
                {result.r.best.map((b) => {
                  const min = result.mins[b.index]
                  const asc = splitDeg(b.asc)
                  const mc = splitDeg(b.mc)
                  const byEvent = new Map<string, RectifyContact[]>()
                  for (const c of b.contacts) byEvent.set(c.event, [...(byEvent.get(c.event) ?? []), c])
                  return (
                    <li key={b.index} className="gd-detail">
                      <div className="row">
                        <strong className="rect-time">{hm(min)}</strong>
                        <span className="muted small">
                          {t('Yükselen')} {SIGNS[asc.sign].name} {asc.deg}° · MC {SIGNS[mc.sign].name} {mc.deg}° · {t('{n} olayla uyumlu', { n: byEvent.size })}
                        </span>
                        <span className="grow" />
                        <button onClick={() => onApply(Math.floor(min / 60), min % 60)}>{t('Bu saatle haritayı aç')}</button>
                      </div>
                      <ul className="small">
                        {[...byEvent.entries()].map(([id, cs]) => {
                          const e = byId.get(id)
                          return (
                            <li key={id}>
                              {categoryIcon(e?.category)} <strong>{e?.title}</strong> <span className="muted">({e ? fmtDate(e.date) : ''})</span>: {cs.map(reason).join('; ')}
                            </li>
                          )
                        })}
                      </ul>
                    </li>
                  )
                })}
              </ol>
            ) : (
              <p className="muted">{t('Bu aralıkta olaylarla belirgin biçimde uyuşan bir saat çıkmadı; aralığı genişletmek ya da olay eklemek denenebilir.')}</p>
            )}
            <p className="muted small">{t('Bu yöntem yaklaşık bir sonuç verir ve kesinlik taşımaz; birbirine yakın puanlı saatler eşit derecede olası sayılmalıdır. Bulunan saati kaydederseniz saat kaynağı olarak "C — Kaynağı belirsiz, yaklaşık" seçilir.')}</p>
          </>
        )}
      </div>
    </div>
  )
}
