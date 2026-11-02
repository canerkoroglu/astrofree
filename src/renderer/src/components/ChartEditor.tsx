import { useState } from 'react'
import type { ChartRecord, TzSpec } from '@shared/types'
import { fmtOffset, isValidZone, localToJd, offsetAt } from '../lib/time'
import PlaceSearch from './PlaceSearch'

const p2 = (n: number) => String(n).padStart(2, '0')

export default function ChartEditor({
  initial,
  onApply,
  onClose
}: {
  initial: ChartRecord
  onApply: (rec: ChartRecord, save: boolean) => void
  onClose: () => void
}) {
  const [rec, setRec] = useState<ChartRecord>(initial)
  const [zoneText, setZoneText] = useState(initial.tz.kind === 'zone' ? initial.tz.zone : initial.place.zone ?? '')
  const l = rec.local
  const dateStr = `${String(l.y).padStart(4, '0')}-${p2(l.m)}-${p2(l.d)}`
  const timeStr = `${p2(l.h)}:${p2(l.mi)}:${p2(l.s)}`

  const tzOk = rec.tz.kind !== 'zone' || isValidZone(rec.tz.zone)
  const jd = tzOk ? localToJd(rec.local, rec.tz, rec.place.lon) : NaN
  const off = tzOk ? offsetAt(rec.tz, jd, rec.place.lon) : 0

  const setTz = (tz: TzSpec) => setRec((r) => ({ ...r, tz }))

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal wide">
        <h2>{initial.createdAt ? 'Haritayı düzenle' : 'Yeni harita'}</h2>
        <label>
          İsim
          <input autoFocus value={rec.name} onChange={(e) => setRec({ ...rec, name: e.target.value })} />
        </label>
        <div className="row">
          <label>
            Tarih
            <input
              type="date"
              value={dateStr}
              onChange={(e) => {
                const [y, m, d] = e.target.value.split('-').map(Number)
                if (y && m && d) setRec({ ...rec, local: { ...l, y, m, d } })
              }}
            />
          </label>
          <label>
            Saat (yerel)
            <input
              type="time"
              step={1}
              value={timeStr}
              onChange={(e) => {
                const [h, mi, s] = e.target.value.split(':').map(Number)
                setRec({ ...rec, local: { ...l, h: h || 0, mi: mi || 0, s: s || 0 } })
              }}
            />
          </label>
        </div>
        <fieldset>
          <legend>Doğum yeri</legend>
          <PlaceSearch
            value={rec.place}
            onChange={(place) => {
              setRec((r) => ({ ...r, place, tz: r.tz.kind === 'zone' && place.zone ? { kind: 'zone', zone: place.zone } : r.tz }))
              if (place.zone) setZoneText(place.zone)
            }}
          />
        </fieldset>
        <fieldset>
          <legend>Saat dilimi</legend>
          <div className="row">
            <select
              value={rec.tz.kind}
              onChange={(e) => {
                const k = e.target.value
                if (k === 'zone') setTz({ kind: 'zone', zone: zoneText || rec.place.zone || 'UTC' })
                else if (k === 'lmt') setTz({ kind: 'lmt' })
                else setTz({ kind: 'offset', minutes: Math.round(off) })
              }}
            >
              <option value="zone">Bölge (yaz saati geçmişi dahil)</option>
              <option value="offset">Sabit fark</option>
              <option value="lmt">Yerel ortalama zaman (LMT)</option>
            </select>
            {rec.tz.kind === 'zone' && (
              <input
                value={zoneText}
                onChange={(e) => {
                  setZoneText(e.target.value)
                  setTz({ kind: 'zone', zone: e.target.value })
                }}
                placeholder="Europe/Istanbul"
              />
            )}
            {rec.tz.kind === 'offset' && (
              <input
                type="number"
                step="0.25"
                value={rec.tz.minutes / 60}
                onChange={(e) => setTz({ kind: 'offset', minutes: Math.round(Number(e.target.value) * 60) })}
                title="Saat farkı (doğu +)"
              />
            )}
          </div>
          <div className={tzOk ? 'muted small' : 'error small'}>
            {tzOk ? `Uygulanan fark: ${fmtOffset(off)}` : 'Geçersiz saat dilimi adı'}
          </div>
        </fieldset>
        <label>
          Etiketler (virgülle)
          <input
            value={(rec.tags ?? []).join(', ')}
            placeholder="danışan, aile, ünlü…"
            onChange={(e) =>
              setRec({
                ...rec,
                tags: e.target.value
                  .split(',')
                  .map((t) => t.trim())
                  .filter((t, i, a) => t && a.indexOf(t) === i)
              })
            }
          />
        </label>
        <label>
          Notlar
          <textarea rows={2} value={rec.notes ?? ''} onChange={(e) => setRec({ ...rec, notes: e.target.value })} />
        </label>
        <div className="actions">
          <button onClick={onClose}>Vazgeç</button>
          <button disabled={!tzOk} onClick={() => onApply(rec, false)}>
            Uygula
          </button>
          <button className="primary" disabled={!tzOk} onClick={() => onApply(rec, true)}>
            Kaydet
          </button>
        </div>
      </div>
    </div>
  )
}
