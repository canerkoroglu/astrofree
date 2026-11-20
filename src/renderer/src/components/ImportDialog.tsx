// Charts from another program (AAF from astro.com, Solar Fire, AstroGold, Janus; or CSV):
// a preview before anything is saved. Charts already in the list are marked and left out,
// rows that could not be read are counted, and all can go into one group at once.
import Select from './Select'
import ModalClose from './ModalClose'
import { useMemo, useState } from 'react'
import type { ChartRecord, ImportResult } from '@shared/types'
import { customGroups, GROUP_PRESETS, groupLabel } from '../lib/groups'
import { t } from '../lib/i18n'
import { sameChart } from '../lib/people'
import { fmtLocal } from '../lib/time'

type Preview = Extract<ImportResult, { kind: 'preview' }>

export default function ImportDialog({
  initial,
  charts,
  onDone,
  onClose
}: {
  initial: Preview | null
  charts: ChartRecord[]
  onDone: (charts: ChartRecord[], message: string) => void
  onClose: () => void
}) {
  const [preview, setPreview] = useState<Preview | null>(initial)
  const [text, setText] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [group, setGroup] = useState('')
  const [tag, setTag] = useState(true)
  const dup = useMemo(() => (preview ? preview.records.map((r) => charts.some((c) => sameChart(c, r))) : []), [preview, charts])
  const [off, setOff] = useState<Set<number>>(new Set())
  const picked = preview ? preview.records.filter((_, i) => !dup[i] && !off.has(i)) : []

  const load = async (p: Promise<ImportResult | null>) => {
    setError('')
    try {
      const r = await p
      if (!r) return
      if (r.kind === 'restored') return onDone(r.charts, t('Yedek geri yüklendi.'))
      setPreview(r)
      setOff(new Set())
      if (!r.records.length) setError(t('Bu dosyada okunabilen harita bulunamadı.'))
    } catch (e) {
      setError(String((e as Error).message ?? e))
    }
  }

  const add = async () => {
    setBusy(true)
    try {
      const tagName = t('içe-aktarılan')
      const recs = picked.map((r) => ({
        ...r,
        group: group || r.group,
        tags: tag ? [...new Set([...(r.tags ?? []).filter((x) => x !== tagName), tagName])] : (r.tags ?? []).filter((x) => x !== tagName)
      }))
      const res = await window.astro.charts.addMany(recs)
      onDone(res.charts, t('{n} harita eklendi.', { n: res.added }) + (res.duplicates ? ' ' + t('{n} tanesi zaten listede olduğu için eklenmedi.', { n: res.duplicates }) : ''))
    } finally {
      setBusy(false)
    }
  }

  const groups = [...GROUP_PRESETS.map(([id]) => id), ...customGroups(charts)]

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal wide import-dialog" role="dialog" aria-label={t('Harita içe aktar')}>
        <ModalClose onClose={onClose} />
        <h2>{t('Harita içe aktar')}</h2>
        {!preview ? (
          <>
            <p className="muted small">
              {t('astro.com, Solar Fire, AstroGold ya da Janus’tan AAF olarak dışa aktardığınız dosyayı, bir CSV tablosunu ya da AstroFree yedeğini seçin. Solar Fire’da: Charts → Export → AAF.')}
            </p>
            <div className="actions start">
              <button className="primary" onClick={() => void load(window.astro.charts.importFile())}>
                {t('Dosya seç…')}
              </button>
            </div>
            <label>
              {t('ya da AAF / CSV metnini buraya yapıştırın')}
              <textarea rows={6} value={text} onChange={(e) => setText(e.target.value)} placeholder={'#A93:Einstein,Albert,m,14.3.1879g,11:30,Ulm,DEU\n#B93:2407422.98027,48n24,10e00,0h40e,0'} />
            </label>
            <details className="small muted">
              <summary>{t('CSV sütunları')}</summary>
              <p>{t('İlk satır başlık olmalı. Tanınan sütunlar: isim, tarih (17.01.1985 ya da 1985-01-17), saat, yer, enlem, boylam, saat dilimi (Europe/Istanbul ya da +3:00), tür (kişi/olay), grup, etiketler (| ile ayrılır), rodden, notlar. Enlem ve boylam yoksa yer adı şehir listesinde aranır.')}</p>
            </details>
          </>
        ) : (
          <>
            <p className="small">
              {t('{file}: {n} harita okundu.', { file: preview.file, n: preview.records.length })}{' '}
              {preview.skipped > 0 && <span className="warn">{t('{n} satır okunamadı (tarih ya da koordinat eksik).', { n: preview.skipped })}</span>}{' '}
              {dup.some(Boolean) && <span className="muted">{t('{n} tanesi zaten listede.', { n: dup.filter(Boolean).length })}</span>}
            </p>
            <div className="import-opts">
              <label className="inline">
                {t('Gruba ekle')}
                <Select value={group} onChange={(e) => setGroup(e.target.value)}>
                  <option value="">{t('Dosyadaki gibi')}</option>
                  {groups.map((g) => (
                    <option key={g} value={g}>
                      {groupLabel(g)}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="inline check">
                <input type="checkbox" checked={tag} onChange={(e) => setTag(e.target.checked)} /> {t('"içe-aktarılan" etiketi ekle')}
              </label>
              <span className="grow" />
              <button className="link small" onClick={() => setOff(new Set())}>
                {t('Tümünü seç')}
              </button>
              <button className="link small" onClick={() => setOff(new Set(preview.records.map((_, i) => i)))}>
                {t('Hiçbirini seçme')}
              </button>
            </div>
            <ul className="import-list">
              {preview.records.map((r, i) => (
                <li key={i} className={dup[i] ? 'dup' : ''}>
                  <label>
                    <input
                      type="checkbox"
                      disabled={dup[i]}
                      checked={!dup[i] && !off.has(i)}
                      onChange={(e) => {
                        const n = new Set(off)
                        if (e.target.checked) n.delete(i)
                        else n.add(i)
                        setOff(n)
                      }}
                    />
                    <span className="nm">
                      {r.kind === 'event' ? '◆ ' : ''}
                      {r.name}
                    </span>
                    <span className="muted small">
                      {r.timeUnknown ? fmtLocal(r.local).split(' ')[0] + ` (${t('saat bilinmiyor')})` : fmtLocal(r.local)} · {r.place.name}
                    </span>
                    {dup[i] && <span className="small muted">· {t('zaten var')}</span>}
                  </label>
                </li>
              ))}
            </ul>
          </>
        )}
        {error && <p className="error small">{error}</p>}
        <div className="actions">
          <button onClick={onClose}>{t('Vazgeç')}</button>
          {!preview && (
            <button disabled={!text.trim()} onClick={() => void load(window.astro.charts.importText(text))}>
              {t('Metni oku')}
            </button>
          )}
          {preview && (
            <>
              <button onClick={() => (setPreview(null), setError(''))}>{t('Başka dosya')}</button>
              <button className="primary" disabled={!picked.length || busy} onClick={() => void add()}>
                {t('{n} haritayı ekle', { n: picked.length })}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
