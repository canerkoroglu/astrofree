// "Olaylarım": a person's life-event journal. Each event shows the sky of that day in plain
// words (the Moon, and the slow planets touching the birth chart), and the journal shows which
// planets keep coming back. A way to learn astrology on one's own life; no AI needed.
import { useEffect, useMemo, useState } from 'react'
import type { AppSettings, ChartRecord, JournalEntry, TransitHit } from '@shared/types'
import { ASPECT, moonPhase, POINT, SIGNS, splitDeg, type Layer } from '../lib/astro'
import { t } from '../lib/i18n'
import { M } from '../lib/meanings'
import { fmtDate, julday } from '../lib/time'
import { bodyName } from '../lib/timing'

const SLOW = [4, 5, 6, 7, 8, 9] // Mars … Pluto
const NATAL_KEYS = ['sun', 'moon', 'mercury', 'venus', 'mars', 'jupiter', 'saturn', 'asc', 'mc']
const ASPECTS = (['conjunction', 'opposition', 'square', 'trine', 'sextile'] as const).map((k) => ({ key: k, angle: ASPECT[k].angle, orb: 1.5 }))

interface Sky {
  moonLon: number
  sunLon: number
  hits: TransitHit[]
}

const iso = (d: JournalEntry['date']) => `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return y && m && d ? { y, m, d } : null
}

export default function Journal({
  natal,
  rec,
  settings,
  onSave,
  onAsk
}: {
  natal: Layer
  rec: ChartRecord
  settings: AppSettings
  onSave: (entries: JournalEntry[]) => Promise<void>
  onAsk?: (prompt: string) => void
}) {
  const m = M()
  const entries = useMemo(() => [...(rec.journal ?? [])].sort((a, b) => iso(b.date).localeCompare(iso(a.date))), [rec.journal])
  const [draft, setDraft] = useState<{ id: string | null; date: string; title: string; note: string } | null>(null)
  const [sky, setSky] = useState<Record<string, Sky>>({})
  const sid = settings.zodiac === 'sidereal' ? settings.sidMode : null
  const timeKnown = !rec.timeUnknown
  const points = natal.points.filter((p) => NATAL_KEYS.includes(p.key) && (timeKnown || (p.key !== 'asc' && p.key !== 'mc'))).map((p) => ({ key: p.key, lon: p.lon }))
  const natalKey = points.map((p) => p.lon.toFixed(2)).join(',')
  const entriesKey = entries.map((e) => `${e.id}:${iso(e.date)}`).join('|')

  // That day's sky for every entry (noon UT is close enough for the slow planets and the Moon's sign).
  useEffect(() => {
    let alive = true
    void (async () => {
      const jds = entries.map((e) => julday(e.date.y, e.date.m, e.date.d, 12))
      if (!jds.length) return setSky({})
      const charts = await window.astro.compute(jds.map((jd) => ({ jdUT: jd, lat: rec.place.lat, lon: rec.place.lon, houseSystem: settings.houseSystem, sidMode: sid, bodies: [0, 1] })))
      const hits = await Promise.all(jds.map((jd) => window.astro.tools.transits({ start: jd - 0.5, end: jd + 0.5, bodies: SLOW, natal: points, aspects: ASPECTS, sidMode: sid })))
      if (!alive) return
      const out: Record<string, Sky> = {}
      entries.forEach((e, i) => {
        const b = charts[i]?.bodies ?? []
        out[e.id] = { moonLon: b.find((x) => x.id === 1)?.lon ?? 0, sunLon: b.find((x) => x.id === 0)?.lon ?? 0, hits: hits[i] }
      })
      setSky(out)
    })()
    return () => {
      alive = false
    }
  }, [entriesKey, natalKey, sid]) // eslint-disable-line react-hooks/exhaustive-deps

  const lc = (s: string) => (document.documentElement.lang === 'de' ? s : s.charAt(0).toLocaleLowerCase() + s.slice(1))
  const plain = (h: TransitHit) => {
    const subject = m.planets[h.natalKey]?.subject
    if (!subject) return ''
    const good = h.aspect === 'trine' || h.aspect === 'sextile' || (h.aspect === 'conjunction' && h.body === 5)
    return good ? t('{p}: {subject} için destekleyici bir etki olabilir', { p: bodyName(h.body), subject: lc(subject) }) : t('{p}: {subject} üzerinde zorlayıcı ya da harekete geçirici bir etki olabilir', { p: bodyName(h.body), subject: lc(subject) })
  }
  const technical = (h: TransitHit) => `${bodyName(h.body)} ${ASPECT[h.aspect].glyph} ${POINT[h.natalKey]?.name ?? h.natalKey}`

  // Planets that keep coming back across the events.
  const recurring = useMemo(() => {
    const count = new Map<number, number>()
    for (const e of entries) for (const b of new Set((sky[e.id]?.hits ?? []).map((h) => h.body))) count.set(b, (count.get(b) ?? 0) + 1)
    return [...count.entries()].filter(([, n]) => n >= 2).sort((a, b) => b[1] - a[1])
  }, [sky, entriesKey]) // eslint-disable-line react-hooks/exhaustive-deps

  const save = async () => {
    if (!draft) return
    const date = fromIso(draft.date)
    if (!date || !draft.title.trim()) return
    const entry: JournalEntry = { id: draft.id ?? crypto.randomUUID(), date, title: draft.title.trim(), ...(draft.note.trim() ? { note: draft.note.trim() } : {}) }
    const rest = (rec.journal ?? []).filter((e) => e.id !== entry.id)
    await onSave([...rest, entry])
    setDraft(null)
  }
  const remove = async (id: string) => {
    if (!confirm(t('Bu olay silinsin mi?'))) return
    await onSave((rec.journal ?? []).filter((e) => e.id !== id))
  }

  const askAll = () => {
    const lines = entries.map((e) => {
      const s = sky[e.id]
      return `- ${fmtDate(e.date)}: ${e.title}${s?.hits.length ? ` (${s.hits.map(technical).join(', ')})` : ''}`
    })
    onAsk?.(t('Hayatımdaki şu olayları o günlerin transitleriyle birlikte kısa ve sade yorumla; tekrar eden temalar var mı?') + '\n' + lines.join('\n'))
  }

  return (
    <div className="journal pad">
      <div className="gd-head">
        <div>
          <h2>{t('Olaylarım')}</h2>
          <p className="muted small">{t('Hayatınızdaki önemli olayları (iş değişikliği, taşınma, bir tanışma…) tarihiyle kaydedin; o günün gökyüzünü haritanızla birlikte görün.')}</p>
        </div>
        <div className="reading-actions">
          {onAsk && entries.length > 0 && <button onClick={askAll}>{t('Yapay zekâya sor')}</button>}
          <button className="primary" onClick={() => setDraft({ id: null, date: '', title: '', note: '' })}>
            + {t('Olay ekle')}
          </button>
        </div>
      </div>

      {draft && (
        <div className="journal-form">
          <label>
            {t('Tarih')}
            <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
          </label>
          <label className="grow">
            {t('Ne oldu?')}
            <input value={draft.title} maxLength={120} placeholder={t('ör. Yeni işe başladım')} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className="grow">
            {t('Not (isteğe bağlı)')}
            <input value={draft.note} maxLength={500} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
          </label>
          <div className="actions">
            <button onClick={() => setDraft(null)}>{t('Vazgeç')}</button>
            <button className="primary" disabled={!fromIso(draft.date) || !draft.title.trim()} onClick={() => void save()}>
              {t('Kaydet')}
            </button>
          </div>
        </div>
      )}

      {!entries.length && !draft && <p className="muted">{t('Henüz olay yok. İlk olayınızı ekleyerek başlayabilirsiniz.')}</p>}

      {recurring.length > 0 && (
        <div className="gd-today yes">
          {t('Olaylarınızda sık eşlik eden gezegenler')}: {recurring.map(([b, n]) => t('{p} ({n} olay)', { p: bodyName(b), n })).join(', ')}
        </div>
      )}

      <ul className="journal-list">
        {entries.map((e) => {
          const s = sky[e.id]
          return (
            <li key={e.id} className="gd-detail">
              <div className="journal-row">
                <div>
                  <strong>{e.title}</strong> <span className="muted small">· {fmtDate(e.date)}</span>
                  {e.note && <div className="small">{e.note}</div>}
                </div>
                <div className="journal-tools">
                  <button className="link small" onClick={() => setDraft({ id: e.id, date: iso(e.date), title: e.title, note: e.note ?? '' })}>
                    {t('Düzenle')}
                  </button>
                  <button className="link small" onClick={() => void remove(e.id)}>
                    {t('Sil')}
                  </button>
                </div>
              </div>
              {s ? (
                <div className="small journal-sky">
                  <div className="muted">
                    {t('Ay {sign} burcunda', { sign: SIGNS[splitDeg(s.moonLon).sign].name })} · {moonPhase(s.sunLon, s.moonLon).name}
                  </div>
                  {s.hits.length ? (
                    <ul>
                      {s.hits.map((h, i) => (
                        <li key={i}>
                          {plain(h)} <span className="muted">({technical(h)})</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="muted">{t('O gün yavaş gezegenler haritanızın ana noktalarına sıkı bir açı yapmıyordu.')}</div>
                  )}
                </div>
              ) : (
                <div className="muted small">{t('Hesaplanıyor…')}</div>
              )}
            </li>
          )
        })}
      </ul>
      <p className="muted small gd-note">{m.disclaimer}</p>
    </div>
  )
}
