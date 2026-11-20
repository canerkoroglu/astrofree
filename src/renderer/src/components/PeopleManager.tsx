// "Kişiler ve olaylar": the whole list in one place — search across names, notes, places,
// events and sessions; filters and sorting; actions on many at once (group, tags, export,
// delete); merging copies; and for astrologers a client card with contact details,
// a consultation log, follow-ups and upcoming birthdays.
import Select from './Select'
import ModalClose from './ModalClose'
import { useMemo, useState } from 'react'
import type { ChartRecord, ClientSession } from '@shared/types'
import { customGroups, GROUP_PRESETS, groupLabel } from '../lib/groups'
import { t } from '../lib/i18n'
import { duplicateGroups, haystack, matches, mergeCharts, sortCharts, toAaf, toCsv, type SortKey } from '../lib/people'
import { fmtDate, fmtLocal } from '../lib/time'

type Kind = 'all' | 'person' | 'event'
const todayYmd = () => {
  const d = new Date()
  return { y: d.getFullYear(), m: d.getMonth() + 1, d: d.getDate() }
}
const iso = (d: { y: number; m: number; d: number }) => `${d.y}-${String(d.m).padStart(2, '0')}-${String(d.d).padStart(2, '0')}`
const fromIso = (s: string) => {
  const [y, m, d] = s.split('-').map(Number)
  return y && m && d ? { y, m, d } : undefined
}
const initials = (name: string) =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w.charAt(0).toLocaleUpperCase())
    .join('')
const dayNo = (d: { y: number; m: number; d: number }) => Date.UTC(d.y, d.m - 1, d.d) / 86400000

export default function PeopleManager({
  charts,
  professional,
  onChange,
  onOpen,
  onEdit,
  onImport,
  onClose
}: {
  charts: ChartRecord[]
  professional: boolean
  onChange: (charts: ChartRecord[]) => void
  onOpen: (c: ChartRecord) => void
  onEdit: (c: ChartRecord) => void
  onImport: () => void
  onClose: () => void
}) {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState<Kind>('all')
  const [group, setGroup] = useState('')
  const [tag, setTag] = useState('')
  const [onlyUnknown, setOnlyUnknown] = useState(false)
  const [sort, setSort] = useState<SortKey>(() => {
    try {
      return (localStorage.getItem('people-sort') as SortKey) || 'name'
    } catch {
      return 'name'
    }
  })
  const [sel, setSel] = useState<Set<string>>(new Set())
  const [focus, setFocus] = useState<string | null>(null)
  const [showDups, setShowDups] = useState(false)
  const [tagDraft, setTagDraft] = useState('')
  const [msg, setMsg] = useState('')
  const [exportOpen, setExportOpen] = useState(false)

  const hay = useMemo(() => new Map(charts.map((c) => [c.id, haystack(c)])), [charts])
  const groups = [...GROUP_PRESETS.map(([id]) => id).filter((g) => charts.some((c) => c.group === g)), ...customGroups(charts)]
  const tags = [...new Set(charts.flatMap((c) => c.tags ?? []))].sort((a, b) => a.localeCompare(b))
  const list = useMemo(
    () =>
      sortCharts(
        charts.filter(
          (c) =>
            !c.composite &&
            (kind === 'all' || (c.kind ?? 'person') === kind) &&
            (!group || (group === '-' ? !c.group : c.group === group)) &&
            (!tag || (c.tags ?? []).includes(tag)) &&
            (!onlyUnknown || c.timeUnknown) &&
            (!q.trim() || matches(c, q, hay.get(c.id)))
        ),
        sort
      ),
    [charts, kind, group, tag, onlyUnknown, q, sort, hay]
  )
  const dups = useMemo(() => duplicateGroups(charts), [charts])
  const selected = charts.filter((c) => sel.has(c.id))
  const focused = charts.find((c) => c.id === focus) ?? null

  const flash = (s: string) => {
    setMsg(s)
    window.setTimeout(() => setMsg(''), 2500)
  }
  const saveMany = async (recs: ChartRecord[]) => onChange(await window.astro.charts.saveMany(recs))
  const pickSort = (k: SortKey) => {
    setSort(k)
    try {
      localStorage.setItem('people-sort', k)
    } catch {
      /* storage unavailable */
    }
  }

  // Upcoming birthdays (people only) and follow-up sessions, within the next 30 days.
  const today = todayYmd()
  const soon = useMemo(() => {
    const t0 = dayNo(today)
    const birthdays = charts
      .filter((c) => (c.kind ?? 'person') === 'person' && !c.composite)
      .map((c) => {
        let next = { y: today.y, m: c.local.m, d: c.local.d }
        if (dayNo(next) < t0) next = { ...next, y: today.y + 1 }
        return { c, date: next, days: dayNo(next) - t0, age: next.y - c.local.y }
      })
      .filter((b) => b.days <= 30)
      .sort((a, b) => a.days - b.days)
    const followUps = charts
      .flatMap((c) => (c.sessions ?? []).filter((s) => s.next && dayNo(s.next) >= t0 - 7 && dayNo(s.next) - t0 <= 30).map((s) => ({ c, s, days: dayNo(s.next!) - t0 })))
      .sort((a, b) => a.days - b.days)
    return { birthdays, followUps }
  }, [charts]) // eslint-disable-line react-hooks/exhaustive-deps

  const toggle = (id: string) => {
    const n = new Set(sel)
    if (n.has(id)) n.delete(id)
    else n.add(id)
    setSel(n)
  }

  const exportSel = async (format: 'aaf' | 'csv' | 'json') => {
    const recs = selected.length ? selected : list
    const name = `AstroFree - ${recs.length === 1 ? recs[0].name : t('{n} harita', { n: recs.length })}`
    const ok = format === 'json' ? await window.astro.charts.exportAll(recs) : await window.astro.charts.exportText(format === 'aaf' ? toAaf(recs) : toCsv(recs), format, name)
    if (ok) flash(t('Kaydedildi'))
  }

  const removeSel = async () => {
    if (!selected.length || !confirm(t('{n} kayıt silinsin mi? Bu işlem geri alınamaz.', { n: selected.length }))) return
    onChange(await window.astro.charts.removeMany(selected.map((c) => c.id)))
    setSel(new Set())
    if (focus && sel.has(focus)) setFocus(null)
  }

  const merge = async (g: ChartRecord[]) => {
    // Keep the one entered first; fold the others into it.
    const [keep, ...rest] = [...g].sort((a, b) => a.createdAt - b.createdAt)
    const merged = rest.reduce(mergeCharts, keep)
    await window.astro.charts.saveMany([merged])
    onChange(await window.astro.charts.removeMany(rest.map((c) => c.id)))
    flash(t('{name} için {n} kopya birleştirildi.', { name: keep.name, n: rest.length }))
  }

  const all = charts.filter((c) => !c.composite)
  const stats = {
    people: all.filter((c) => (c.kind ?? 'person') === 'person').length,
    events: all.filter((c) => c.kind === 'event').length,
    unknown: all.filter((c) => c.timeUnknown).length
  }
  const filtered = kind !== 'all' || !!group || !!tag || onlyUnknown || !!q.trim()
  const clearFilters = () => (setKind('all'), setGroup(''), setTag(''), setOnlyUnknown(false), setQ(''))
  const daysLabel = (n: number) => (n === 0 ? t('bugün') : n === 1 ? t('yarın') : n < 0 ? fmtDate(today) : t('{n} gün sonra', { n }))

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal people-modal" role="dialog" aria-label={t('Harita yönetimi')}>
        <ModalClose onClose={onClose} />
        <header className="pm-head">
          <div>
            <h2>{t('Harita yönetimi')}</h2>
            <p className="muted small">{t('{n} kayıt · tüm bilgiler yalnızca bu bilgisayarda tutulur', { n: all.length })}</p>
          </div>
          <div className="pm-head-actions">
            {dups.length > 0 && (
              <button className={showDups ? 'on' : ''} onClick={() => setShowDups(!showDups)}>
                {t('Kopyalar ({n})', { n: dups.length })}
              </button>
            )}
            <button onClick={onImport}>{t('İçe aktar…')}</button>
          </div>
        </header>

        <div className="pm-stats">
          {(
            [
              ['person', stats.people, t('Kişiler')],
              ['event', stats.events, t('Olaylar')],
              ['unknown', stats.unknown, t('Saati bilinmeyenler')],
              ['soon', soon.birthdays.length, t('Yaklaşan doğum günleri')]
            ] as const
          ).map(([k, n, label]) => {
            const on = (k === 'person' || k === 'event') ? kind === k : k === 'unknown' ? onlyUnknown : false
            return (
              <button
                key={k}
                className={`pm-stat${on ? ' on' : ''}`}
                onClick={() => {
                  setShowDups(false)
                  if (k === 'person' || k === 'event') setKind(kind === k ? 'all' : k)
                  else if (k === 'unknown') setOnlyUnknown(!onlyUnknown)
                  else setFocus(null)
                }}
              >
                <strong>{n}</strong>
                <span>{label}</span>
              </button>
            )
          })}
        </div>

        {showDups ? (
          <div className="people-dups">
            <p className="small muted">{t('Aynı isim, aynı doğum günü ve yakın yer: büyük olasılıkla aynı kayıt. Birleştirince ilk girilen kayıt kalır; etiketler, notlar, olaylar ve seanslar onda toplanır.')}</p>
            <ul>
              {dups.map((g) => (
                <li key={g[0].id} className="pm-panel">
                  <div className="row">
                    <strong>{g[0].name}</strong>
                    <span className="grow" />
                    <button className="primary" onClick={() => void merge(g)}>{t('Birleştir')}</button>
                  </div>
                  <ul className="small">
                    {g.map((c) => (
                      <li key={c.id}>
                        {fmtLocal(c.local)} · {c.place.name} {c.notes ? `· ${c.notes.slice(0, 60)}` : ''}
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="people-body">
            <section className="pm-listpane">
              <div className="pm-search">
                <input className="search" autoFocus placeholder={t('Ara: isim, yer, yıl, not, olay, etiket…')} value={q} onChange={(e) => setQ(e.target.value)} />
              </div>
              <div className="pm-filters">
                <div className="seg" role="radiogroup" aria-label={t('Tür')}>
                  {(
                    [
                      ['all', t('Tümü')],
                      ['person', t('Kişiler')],
                      ['event', t('Olaylar')]
                    ] as const
                  ).map(([k, label]) => (
                    <button key={k} role="radio" aria-checked={kind === k} className={kind === k ? 'on' : ''} onClick={() => setKind(k)}>
                      {label}
                    </button>
                  ))}
                </div>
                <Select value={group} onChange={(e) => setGroup(e.target.value)} aria-label={t('Grup')}>
                  <option value="">{t('Tüm gruplar')}</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {groupLabel(g)}
                    </option>
                  ))}
                  <option value="-">{t('Grupsuz')}</option>
                </Select>
                {tags.length > 0 && (
                  <Select value={tag} onChange={(e) => setTag(e.target.value)} aria-label={t('Etiket')}>
                    <option value="">{t('Tüm etiketler')}</option>
                    {tags.map((x) => (
                      <option key={x} value={x}>
                        #{x}
                      </option>
                    ))}
                  </Select>
                )}
                <span className="grow" />
                <Select value={sort} onChange={(e) => pickSort(e.target.value as SortKey)} aria-label={t('Sırala')}>
                  <option value="name">{t('İsme göre')}</option>
                  <option value="birth">{t('Doğum tarihine göre')}</option>
                  <option value="updated">{t('Son değişene göre')}</option>
                  <option value="created">{t('Son eklenene göre')}</option>
                </Select>
              </div>

              <div className={`pm-bulk small${sel.size ? ' active' : ''}`}>
                <label className="inline check">
                  <input
                    type="checkbox"
                    checked={list.length > 0 && list.every((c) => sel.has(c.id))}
                    onChange={(e) => setSel(e.target.checked ? new Set(list.map((c) => c.id)) : new Set())}
                    aria-label={t('Tümünü seç')}
                  />
                  {sel.size ? <strong>{t('{n} seçili', { n: sel.size })}</strong> : <span className="muted">{t('{n} kayıt', { n: list.length })}</span>}
                </label>
                {filtered && !sel.size && (
                  <button className="link small" onClick={clearFilters}>
                    {t('Filtreleri temizle')}
                  </button>
                )}
                {sel.size > 0 && (
                  <>
                    <Select value="" onChange={(e) => e.target.value && void saveMany(selected.map((c) => ({ ...c, group: e.target.value === '-' ? undefined : e.target.value })))} aria-label={t('Gruba taşı')}>
                      <option value="">{t('Gruba taşı…')}</option>
                      {[...GROUP_PRESETS.map(([id]) => id), ...customGroups(charts)].map((g) => (
                        <option key={g} value={g}>
                          {groupLabel(g)}
                        </option>
                      ))}
                      <option value="-">{t('Gruptan çıkar')}</option>
                    </Select>
                    <input className="tag-mini" value={tagDraft} placeholder={t('etiket')} onChange={(e) => setTagDraft(e.target.value)} />
                    <button disabled={!tagDraft.trim()} onClick={() => (void saveMany(selected.map((c) => ({ ...c, tags: [...new Set([...(c.tags ?? []), tagDraft.trim()])] }))), setTagDraft(''))}>
                      {t('Etiket ekle')}
                    </button>
                    <button disabled={!tagDraft.trim()} onClick={() => (void saveMany(selected.map((c) => ({ ...c, tags: (c.tags ?? []).filter((x) => x !== tagDraft.trim()) }))), setTagDraft(''))}>
                      {t('Etiketi kaldır')}
                    </button>
                    <button className="danger" onClick={() => void removeSel()}>
                      {t('Sil')}
                    </button>
                  </>
                )}
                <span className="grow" />
                {msg && <span className="pm-msg">{msg}</span>}
                <div className="menu-wrap">
                  <button aria-haspopup="menu" aria-expanded={exportOpen} onClick={() => setExportOpen(!exportOpen)} title={sel.size ? t('Seçilenleri dışa aktar:') : t('Listeyi dışa aktar:')}>
                    {t('Dışa aktar')} ▾
                  </button>
                  {exportOpen && (
                    <div className="pop-menu" role="menu" onMouseLeave={() => setExportOpen(false)}>
                      {(
                        [
                          ['aaf', 'AAF', t('astro.com, Solar Fire, AstroGold ve Janus okuyabilir')],
                          ['csv', 'CSV', t('Excel, Numbers, LibreOffice')],
                          ['json', 'JSON', t('AstroFree (tüm bilgilerle)')]
                        ] as const
                      ).map(([f, label, hint]) => (
                        <button key={f} role="menuitem" onClick={() => (setExportOpen(false), void exportSel(f))}>
                          <strong>{label}</strong>
                          <span className="muted small">{hint}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <ul className="people-list">
                {list.map((c) => {
                  const ev = c.kind === 'event'
                  return (
                    <li key={c.id} className={`${focus === c.id ? 'on' : ''}${sel.has(c.id) ? ' picked' : ''}`}>
                      <input type="checkbox" checked={sel.has(c.id)} onChange={() => toggle(c.id)} aria-label={c.name} />
                      <button className="people-row" onClick={() => setFocus(c.id)} onDoubleClick={() => onOpen(c)}>
                        <span className={`avatar sm${ev ? ' event' : ''}`} aria-hidden>
                          {ev ? '◆' : initials(c.name)}
                        </span>
                        <span className="pm-row-text">
                          <span className="nm">{c.name}</span>
                          <span className="muted small">
                            {c.timeUnknown ? fmtLocal(c.local).split(' ')[0] + ' · ' + t('saat bilinmiyor') : fmtLocal(c.local)} · {c.place.name.split(',')[0]}
                          </span>
                        </span>
                        <span className="pm-row-meta small">
                          {c.group && <span className="pill">{groupLabel(c.group)}</span>}
                          {(c.tags ?? []).slice(0, 2).map((x) => (
                            <span key={x} className="pill tag">
                              #{x}
                            </span>
                          ))}
                          {(c.journal?.length ?? 0) > 0 && (
                            <span className="muted" title={t('Olaylarım')}>
                              ◷ {c.journal!.length}
                            </span>
                          )}
                          {professional && (c.sessions?.length ?? 0) > 0 && (
                            <span className="muted" title={t('Seanslar')}>
                              ✎ {c.sessions!.length}
                            </span>
                          )}
                        </span>
                      </button>
                      <button
                        className={`star${c.favorite ? ' on' : ''}`}
                        aria-label={c.favorite ? t('Sabitlemeyi kaldır') : t('Üste sabitle')}
                        title={c.favorite ? t('Sabitlemeyi kaldır') : t('Üste sabitle')}
                        onClick={() => void saveMany([{ ...c, favorite: !c.favorite || undefined }])}
                      >
                        {c.favorite ? '★' : '☆'}
                      </button>
                    </li>
                  )
                })}
                {!list.length && (
                  <li className="pm-empty">
                    <span className="muted">{t('Aramaya uyan kayıt yok.')}</span>
                    {filtered && (
                      <button className="link small" onClick={clearFilters}>
                        {t('Filtreleri temizle')}
                      </button>
                    )}
                  </li>
                )}
              </ul>
            </section>

            <section className="pm-detail">
              {focused ? (
                <ClientCard key={focused.id} c={focused} professional={professional} onSave={(r) => void saveMany([r])} onOpen={() => onOpen(focused)} onEdit={() => onEdit(focused)} />
              ) : (
                <div className="pm-overview">
                  <p className="muted small">{t('Ayrıntıları görmek için listeden bir kayıt seçin; çift tıklayınca harita açılır.')}</p>
                  <div className="pm-panel">
                    <h4>🎂 {t('Yaklaşan doğum günleri')}</h4>
                    {soon.birthdays.length ? (
                      <ul className="pm-soon">
                        {soon.birthdays.slice(0, 8).map((b) => (
                          <li key={b.c.id}>
                            <button className="pm-soon-row" onClick={() => setFocus(b.c.id)}>
                              <span className="avatar sm" aria-hidden>
                                {initials(b.c.name)}
                              </span>
                              <span className="pm-row-text">
                                <span className="nm">{b.c.name}</span>
                                <span className="muted small">
                                  {fmtDate(b.date)} · {t('{n} yaşına giriyor', { n: b.age })}
                                </span>
                              </span>
                              <span className={`pill${b.days <= 7 ? ' hot' : ''}`}>{daysLabel(b.days)}</span>
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="muted small">{t('Önümüzdeki 30 günde doğum günü yok.')}</p>
                    )}
                  </div>
                  {professional && (
                    <div className="pm-panel">
                      <h4>📋 {t('Planlanan görüşmeler')}</h4>
                      {soon.followUps.length ? (
                        <ul className="pm-soon">
                          {soon.followUps.slice(0, 8).map((f) => (
                            <li key={f.s.id}>
                              <button className="pm-soon-row" onClick={() => setFocus(f.c.id)}>
                                <span className="avatar sm" aria-hidden>
                                  {initials(f.c.name)}
                                </span>
                                <span className="pm-row-text">
                                  <span className="nm">{f.c.name}</span>
                                  <span className="muted small">{fmtDate(f.s.next!)}</span>
                                </span>
                                <span className={`pill${f.days < 0 ? ' late' : f.days <= 7 ? ' hot' : ''}`}>{f.days < 0 ? t('gecikti') : daysLabel(f.days)}</span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="muted small">{t('Planlanmış görüşme yok. Bir danışanın kartından seans eklerken "Sonraki görüşme" tarihi girebilirsiniz.')}</p>
                      )}
                    </div>
                  )}
                </div>
              )}
            </section>
          </div>
        )}
      </div>
    </div>
  )
}

/** The selected person's card: contact, notes and (for professionals) the session log. */
function ClientCard({ c, professional, onSave, onOpen, onEdit }: { c: ChartRecord; professional: boolean; onSave: (r: ChartRecord) => void; onOpen: () => void; onEdit: () => void }) {
  const [email, setEmail] = useState(c.contact?.email ?? '')
  const [phone, setPhone] = useState(c.contact?.phone ?? '')
  const [notes, setNotes] = useState(c.notes ?? '')
  const [draft, setDraft] = useState<{ id: string | null; date: string; note: string; next: string } | null>(null)
  const dirty = email !== (c.contact?.email ?? '') || phone !== (c.contact?.phone ?? '') || notes !== (c.notes ?? '')
  const sessions = [...(c.sessions ?? [])].sort((a, b) => iso(b.date).localeCompare(iso(a.date)))

  const saveInfo = () =>
    onSave({ ...c, notes: notes.trim() || undefined, contact: email.trim() || phone.trim() ? { email: email.trim() || undefined, phone: phone.trim() || undefined } : undefined })

  const saveSession = () => {
    if (!draft) return
    const date = fromIso(draft.date)
    if (!date || !draft.note.trim()) return
    const s: ClientSession = { id: draft.id ?? crypto.randomUUID(), date, note: draft.note.trim(), next: fromIso(draft.next) }
    onSave({ ...c, sessions: [...(c.sessions ?? []).filter((x) => x.id !== s.id), s] })
    setDraft(null)
  }

  return (
    <aside className="client-card">
      <div className="cc-head">
        <span className={`avatar${c.kind === 'event' ? ' event' : ''}`} aria-hidden>
          {c.kind === 'event' ? '◆' : initials(c.name)}
        </span>
        <div className="cc-title">
          <h3>{c.name}</h3>
          <p className="muted small">
            {fmtLocal(c.local)} {c.timeUnknown ? `(${t('saat bilinmiyor')})` : ''} · {c.place.name}
          </p>
          <div className="cc-pills">
            {c.group && <span className="pill">{groupLabel(c.group)}</span>}
            {c.rodden && <span className="pill">Rodden {c.rodden}</span>}
            {(c.tags ?? []).map((x) => (
              <span key={x} className="pill tag">
                #{x}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="cc-actions">
        <button className="primary" onClick={onOpen}>
          {t('Haritayı aç')}
        </button>
        <button onClick={onEdit}>{t('Düzenle')}</button>
      </div>
      {(c.kind ?? 'person') === 'person' && (
        <div className="client-contact">
          <label>
            {t('E-posta')}
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
          </label>
          <label>
            {t('Telefon')}
            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </label>
        </div>
      )}
      <label>
        {t('Notlar')}
        <textarea rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </label>
      {dirty && (
        <div className="actions start">
          <button className="primary" onClick={saveInfo}>
            {t('Kaydet')}
          </button>
        </div>
      )}

      {professional && (c.kind ?? 'person') === 'person' && (
        <section className="client-sessions">
          <div className="row">
            <h4>{t('Seanslar')}</h4>
            <span className="grow" />
            <button className="small" onClick={() => setDraft({ id: null, date: iso(todayYmd()), note: '', next: '' })}>
              + {t('Seans ekle')}
            </button>
          </div>
          {draft && (
            <div className="journal-form">
              <label>
                {t('Tarih')}
                <input type="date" value={draft.date} onChange={(e) => setDraft({ ...draft, date: e.target.value })} />
              </label>
              <label>
                {t('Sonraki görüşme')}
                <input type="date" value={draft.next} onChange={(e) => setDraft({ ...draft, next: e.target.value })} />
              </label>
              <label className="grow">
                {t('Konuşulanlar')}
                <textarea rows={3} value={draft.note} maxLength={4000} onChange={(e) => setDraft({ ...draft, note: e.target.value })} />
              </label>
              <div className="actions">
                <button onClick={() => setDraft(null)}>{t('Vazgeç')}</button>
                <button className="primary" disabled={!fromIso(draft.date) || !draft.note.trim()} onClick={saveSession}>
                  {t('Kaydet')}
                </button>
              </div>
            </div>
          )}
          {!sessions.length && !draft && <p className="muted small">{t('Henüz seans kaydı yok.')}</p>}
          <ul className="client-session-list">
            {sessions.map((s) => (
              <li key={s.id}>
                <div className="row small">
                  <strong>{fmtDate(s.date)}</strong>
                  {s.next && <span className="muted">· {t('sonraki: {date}', { date: fmtDate(s.next) })}</span>}
                  <span className="grow" />
                  <button className="link small" onClick={() => setDraft({ id: s.id, date: iso(s.date), note: s.note, next: s.next ? iso(s.next) : '' })}>
                    {t('Düzenle')}
                  </button>
                  <button className="link small" onClick={() => confirm(t('Bu seans silinsin mi?')) && onSave({ ...c, sessions: (c.sessions ?? []).filter((x) => x.id !== s.id) })}>
                    {t('Sil')}
                  </button>
                </div>
                <div className="small pre">{s.note}</div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </aside>
  )
}
