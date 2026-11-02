import { useEffect, useMemo, useRef, useState } from 'react'
import type { ChartRecord, TzSpec } from '@shared/types'
import { fmtPos, glyph, SIGNS, signGlyph, splitDeg } from '../lib/astro'
import { fmtLocal, fmtOffset, isValidZone, jdToLocal, localToJd, nowJd, offsetAt, revjul } from '../lib/time'
import DateTimeField from './DateTimeField'
import PlaceSearch, { flag } from './PlaceSearch'

const RODDEN: [string, string][] = [
  ['', 'Belirtilmedi'],
  ['AA', 'AA — Doğum belgesi / resmi kayıt'],
  ['A', 'A — Kişinin ya da ailesinin beyanı'],
  ['B', 'B — Biyografi / otobiyografi'],
  ['C', 'C — Kaynağı belirsiz, yaklaşık'],
  ['DD', 'DD — Çelişkili kaynaklar'],
  ['X', 'X — Saat bilinmiyor']
]

const EVENT_IDEAS = ['Evlilik', 'Nişan', 'Şirket kuruluşu', 'Taşınma', 'İş başlangıcı', 'Mezuniyet', 'Kaza', 'Ameliyat']

interface Preview {
  sun: number
  moon: number
  asc: number
  ut: string
}

export default function ChartEditor({
  initial,
  existing,
  onApply,
  onClose
}: {
  initial: ChartRecord
  existing: ChartRecord[]
  onApply: (rec: ChartRecord, save: boolean) => void
  onClose: () => void
}) {
  const [rec, setRec] = useState<ChartRecord>({ kind: 'person', ...initial })
  const [zoneText, setZoneText] = useState(initial.tz.kind === 'zone' ? initial.tz.zone : initial.place.zone ?? '')
  const [tzOpen, setTzOpen] = useState(initial.tz.kind !== 'zone')
  const [moreOpen, setMoreOpen] = useState(!!(initial.notes || initial.tags?.length))
  const [tagDraft, setTagDraft] = useState('')
  const [preview, setPreview] = useState<Preview | null>(null)
  const nameRef = useRef<HTMLInputElement>(null)
  const isEvent = rec.kind === 'event'
  const isNew = !initial.createdAt

  const tzOk = rec.tz.kind !== 'zone' || isValidZone(rec.tz.zone)
  const jd = tzOk ? localToJd(rec.local, rec.tz, rec.place.lon) : NaN
  const off = tzOk ? offsetAt(rec.tz, jd, rec.place.lon) : 0
  // Standard offset of the zone in January/July tells whether DST applied.
  const dstNote = useMemo(() => {
    if (!tzOk || rec.tz.kind !== 'zone') return ''
    const jan = offsetAt(rec.tz, jd - ((rec.local.m - 1) * 30.4), rec.place.lon)
    const jul = offsetAt(rec.tz, jd + ((7 - rec.local.m) * 30.4), rec.place.lon)
    const std = Math.min(jan, jul)
    return off > std ? ' · yaz saati' : jan !== jul ? ' · kış saati' : ''
  }, [tzOk, rec.tz, jd, off, rec.local.m, rec.place.lon])

  const duplicate = existing.find((c) => c.id !== rec.id && c.name.trim().toLocaleLowerCase('tr') === rec.name.trim().toLocaleLowerCase('tr') && rec.name.trim())
  const allTags = [...new Set(existing.flatMap((c) => c.tags ?? []))].filter((t) => !(rec.tags ?? []).includes(t))
  const canSave = tzOk && rec.name.trim().length > 0

  // Live preview of the big three while typing.
  useEffect(() => {
    if (!tzOk || !Number.isFinite(jd)) return setPreview(null)
    let alive = true
    const t = window.setTimeout(async () => {
      const [r] = await window.astro.compute([{ jdUT: jd, lat: rec.place.lat, lon: rec.place.lon, houseSystem: 'P', sidMode: null, bodies: [0, 1] }])
      if (!alive || r.error) return
      const u = revjul(jd)
      setPreview({
        sun: r.bodies[0]?.lon ?? 0,
        moon: r.bodies[1]?.lon ?? 0,
        asc: r.asc,
        ut: `${String(u.d).padStart(2, '0')}.${String(u.m).padStart(2, '0')}.${u.y} ${String(u.h).padStart(2, '0')}:${String(u.mi).padStart(2, '0')} UT`
      })
    }, 120)
    return () => {
      alive = false
      window.clearTimeout(t)
    }
  }, [jd, tzOk, rec.place.lat, rec.place.lon])

  const setTz = (tz: TzSpec) => setRec((r) => ({ ...r, tz }))
  const addTag = (t: string) => {
    const v = t.trim().replace(/^#/, '')
    if (v && !(rec.tags ?? []).includes(v)) setRec((r) => ({ ...r, tags: [...(r.tags ?? []), v] }))
    setTagDraft('')
  }
  const submit = (save: boolean) => {
    if (!canSave) {
      nameRef.current?.focus()
      return
    }
    onApply({ ...rec, name: rec.name.trim(), rodden: rec.timeUnknown ? 'X' : rec.rodden }, save)
  }

  const initials = rec.name.trim() ? rec.name.trim().split(/\s+/).slice(0, 2).map((w) => w[0]).join('').toLocaleUpperCase('tr') : isEvent ? '◆' : '?'

  return (
    <div
      className="modal-back"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => {
        if (e.key === 'Escape') onClose()
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) submit(true)
      }}
    >
      <div className="modal wide editor">
        <header className="ed-head">
          <h2>{isNew ? (isEvent ? 'Yeni olay' : 'Yeni kişi') : isEvent ? 'Olayı düzenle' : 'Kişiyi düzenle'}</h2>
          <div className="seg kind-seg">
            <button type="button" className={!isEvent ? 'on' : ''} onClick={() => setRec({ ...rec, kind: 'person' })}>
              👤 Kişi
            </button>
            <button type="button" className={isEvent ? 'on' : ''} onClick={() => setRec({ ...rec, kind: 'event', timeUnknown: false })}>
              ◆ Olay
            </button>
          </div>
        </header>

        <div className="ed-grid">
          <div className="ed-form">
            <div className="ed-name">
              <div className={`avatar ${isEvent ? 'event' : ''}`}>{initials}</div>
              <div className="grow">
                <input
                  ref={nameRef}
                  autoFocus
                  className="big-input"
                  placeholder={isEvent ? 'Olay adı (ör. Evlilik, Şirket kuruluşu)' : 'Ad Soyad'}
                  value={rec.name}
                  onChange={(e) => setRec({ ...rec, name: e.target.value })}
                />
                {duplicate && <div className="warn small">Bu isimde bir kayıt zaten var ({fmtLocal(duplicate.local)}).</div>}
                {isEvent && !rec.name && (
                  <div className="idea-chips">
                    {EVENT_IDEAS.map((t) => (
                      <button type="button" key={t} onClick={() => setRec({ ...rec, name: t })}>
                        {t}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <section className="ed-sec">
              <div className="ed-sec-title">
                <span className="num">1</span> {isEvent ? 'Olay ne zaman oldu?' : 'Ne zaman doğdu?'}
              </div>
              <div className="row">
                <DateTimeField live seconds value={rec.local} onChange={(local) => setRec((r) => ({ ...r, local }))} />
                {isEvent && (
                  <button type="button" onClick={() => setRec((r) => ({ ...r, local: jdToLocal(nowJd(), r.tz, r.place.lon) }))}>
                    Şimdi
                  </button>
                )}
              </div>
              <div className="muted small">Yazın (17.01.1942 18:35 · 17 Ocak 1942) ya da 📅 takvimden seçin.</div>
              {!isEvent && (
                <div className="row ed-time-opts">
                  <label className="switch">
                    <input
                      type="checkbox"
                      checked={!!rec.timeUnknown}
                      onChange={(e) =>
                        setRec((r) => ({
                          ...r,
                          timeUnknown: e.target.checked,
                          local: e.target.checked ? { ...r.local, h: 12, mi: 0, s: 0 } : r.local
                        }))
                      }
                    />
                    <span>Doğum saati bilinmiyor</span>
                  </label>
                  {!rec.timeUnknown && (
                    <label className="inline-select">
                      Saat kaynağı
                      <select value={rec.rodden ?? ''} onChange={(e) => setRec({ ...rec, rodden: e.target.value })} title="Rodden güvenilirlik derecesi">
                        {RODDEN.filter(([k]) => k !== 'X').map(([k, n]) => (
                          <option key={k} value={k}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </label>
                  )}
                </div>
              )}
              {rec.timeUnknown && (
                <div className="note small">
                  12:00 kullanılacak. Yükselen, MC ve evler güvenilmez olur; Ay ±7° oynayabilir. Yorumlar buna göre yapılır.
                </div>
              )}
            </section>

            <section className="ed-sec">
              <div className="ed-sec-title">
                <span className="num">2</span> Nerede?
              </div>
              <PlaceSearch
                value={rec.place}
                onChange={(place) => {
                  setRec((r) => ({ ...r, place, tz: r.tz.kind === 'zone' && place.zone ? { kind: 'zone', zone: place.zone } : r.tz }))
                  if (place.zone) setZoneText(place.zone)
                }}
              />
              <div className="tz-line">
                <span className={tzOk ? '' : 'error'}>
                  🕒 {tzOk ? `${rec.tz.kind === 'zone' ? rec.tz.zone : rec.tz.kind === 'lmt' ? 'Yerel ortalama zaman' : 'Sabit fark'} · ${fmtOffset(off)}${dstNote}` : 'Geçersiz saat dilimi'}
                </span>
                <button type="button" className="link small" onClick={() => setTzOpen(!tzOpen)}>
                  {tzOpen ? 'Gizle' : 'Değiştir'}
                </button>
              </div>
              {tzOpen && (
                <div className="row tz-edit">
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
              )}
            </section>

            <section className="ed-sec">
              <button type="button" className="ed-sec-title as-btn" onClick={() => setMoreOpen(!moreOpen)}>
                <span className="num">3</span> Etiketler ve notlar <span className="muted small">(isteğe bağlı)</span>
                <span className="grow" />
                <span className="muted">{moreOpen ? '▾' : '▸'}</span>
              </button>
              {moreOpen && (
                <>
                  <div className="tag-input">
                    {(rec.tags ?? []).map((t) => (
                      <span key={t} className="tag-chip">
                        #{t}
                        <button type="button" onClick={() => setRec({ ...rec, tags: (rec.tags ?? []).filter((x) => x !== t) })} title="Kaldır">
                          ×
                        </button>
                      </span>
                    ))}
                    <input
                      value={tagDraft}
                      placeholder={(rec.tags ?? []).length ? '' : 'danışan, aile, ünlü… (Enter)'}
                      onChange={(e) => (e.target.value.endsWith(',') ? addTag(e.target.value.slice(0, -1)) : setTagDraft(e.target.value))}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && tagDraft.trim()) {
                          e.preventDefault()
                          e.stopPropagation()
                          addTag(tagDraft)
                        } else if (e.key === 'Backspace' && !tagDraft && rec.tags?.length) {
                          setRec({ ...rec, tags: rec.tags.slice(0, -1) })
                        }
                      }}
                      onBlur={() => tagDraft.trim() && addTag(tagDraft)}
                    />
                  </div>
                  {allTags.length > 0 && (
                    <div className="idea-chips">
                      {allTags.slice(0, 10).map((t) => (
                        <button type="button" key={t} onClick={() => addTag(t)}>
                          #{t}
                        </button>
                      ))}
                    </div>
                  )}
                  <textarea rows={3} placeholder="Notlar…" value={rec.notes ?? ''} onChange={(e) => setRec({ ...rec, notes: e.target.value })} />
                </>
              )}
            </section>
          </div>

          <aside className="ed-preview">
            <div className="pv-title muted small">Önizleme</div>
            <div className="pv-name">{rec.name.trim() || (isEvent ? 'Yeni olay' : 'Yeni kişi')}</div>
            <div className="muted small">
              {fmtLocal(rec.local)} {rec.timeUnknown ? '(saat bilinmiyor)' : ''}
            </div>
            <div className="muted small">
              {flag(rec.place.cc)} {rec.place.name.split(',').slice(0, 2).join(',')}
            </div>
            {preview ? (
              <div className="pv-big3">
                {(
                  [
                    ['sun', 'Güneş', preview.sun],
                    ['moon', 'Ay', preview.moon],
                    ['asc', 'Yükselen', preview.asc]
                  ] as [string, string, number][]
                ).map(([k, label, lon]) => {
                  const sd = splitDeg(lon)
                  const unreliable = rec.timeUnknown && k !== 'sun'
                  return (
                    <div key={k} className={`pv-item ${unreliable ? 'dim' : ''}`} title={fmtPos(lon, true)}>
                      <span className="glyph pv-planet">{k === 'asc' ? 'AC' : glyph(k)}</span>
                      <span className={`glyph pv-sign el-${SIGNS[sd.sign].element}`}>{signGlyph(sd.sign)}</span>
                      <div>
                        <div className="pv-label">{label}</div>
                        <div className="pv-val">
                          {SIGNS[sd.sign].name} {sd.deg}°{String(sd.min).padStart(2, '0')}'{unreliable ? ' ?' : ''}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="muted small">Hesaplanıyor…</div>
            )}
            {preview && <div className="muted small pv-ut">{preview.ut}</div>}
          </aside>
        </div>

        <footer className="actions">
          <span className="muted small grow">Esc kapat · ⌘/Ctrl + Enter kaydet</span>
          <button onClick={onClose}>Vazgeç</button>
          <button disabled={!canSave} onClick={() => submit(false)} title="Kaydetmeden haritayı göster">
            Göster
          </button>
          <button className="primary" disabled={!canSave} onClick={() => submit(true)}>
            {isNew ? 'Ekle' : 'Kaydet'}
          </button>
        </footer>
      </div>
    </div>
  )
}
