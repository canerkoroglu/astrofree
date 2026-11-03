import { getLang, t } from '../lib/i18n'
import { useState } from 'react'
import type { KbEntry } from '@shared/knowledge'
import { SIGNS } from '../lib/astro'
import { describeKeys, MANSIONS, PHASE_SLUG, SIGN_SLUG, TOPICS } from '../lib/kb'
import { moonPhase } from '../lib/astro'

export interface KbDraft {
  title: string
  body: string
  keys: string[]
  tags: string[]
  /** Target file for a new entry. */
  file: string
}

/** Form for one knowledge entry: text plus "when should this come up" rules. */
export default function KbEntryEditor({
  entry,
  files,
  starNames,
  onSave,
  onDelete,
  onClose
}: {
  entry: KbEntry | null
  files: { name: string; title: string }[]
  starNames: string[]
  onSave: (d: KbDraft) => void
  onDelete?: () => void
  onClose: () => void
}) {
  const [d, setD] = useState<KbDraft>({
    title: entry?.title ?? '',
    body: entry?.body ?? '',
    keys: entry?.keys ?? [],
    tags: entry?.tags ?? [],
    file: entry?.file ?? files[0]?.name ?? ''
  })
  const [mansion, setMansion] = useState('')
  const [star, setStar] = useState('')
  const [phase, setPhase] = useState('')
  const has = (k: string) => d.keys.includes(k)
  const add = (k: string) => k && !has(k) && setD({ ...d, keys: [...d.keys, k] })
  const drop = (pred: (k: string) => boolean) => setD({ ...d, keys: d.keys.filter((k) => !pred(k)) })

  const signs = d.keys.filter((k) => k.startsWith('burc:')).map((k) => k.slice(5))
  const range = d.keys.find((k) => k.startsWith('derece:'))?.slice(7) ?? ''
  const [rFrom, rTo] = range ? range.split('-') : ['', '']
  const setRange = (a: string, b: string) => {
    const rest = d.keys.filter((k) => !k.startsWith('derece:'))
    const v = a !== '' ? (b !== '' && b !== a ? `${a}-${b}` : a) : ''
    setD({ ...d, keys: v ? [...rest, `derece:${v}`] : rest })
  }
  const toggleSign = (slug: string) =>
    setD({ ...d, keys: has(`burc:${slug}`) ? d.keys.filter((k) => k !== `burc:${slug}`) : [...d.keys, `burc:${slug}`] })

  // Rules shown as removable chips (sign/degree is edited in place below).
  const ruleChips = d.keys.filter((k) => /^(durak|yildiz|faz):/.test(k) || k === 'harita-lordu-ay')
  const starSlug = (n: string) => n.trim().toLowerCase().replace(/\s+/g, '-')
  const valid = d.title.trim() && d.body.trim() && d.file

  return (
    <div className="modal-back" onMouseDown={(e) => e.target === e.currentTarget && onClose()} onKeyDown={(e) => e.key === 'Escape' && onClose()}>
      <div className="modal kb-edit" role="dialog" aria-label={entry ? t('Notu düzenle') : t('Yeni not')}>
        <h2>{entry ? t('Notu düzenle') : t('Yeni not')}</h2>

        <label className="field">
          {t('Başlık')}
          <input autoFocus value={d.title} onChange={(e) => setD({ ...d, title: e.target.value })} placeholder={t('ör. Ay Akrep 15°')} />
        </label>
        <label className="field">
          {t('Metin')}
          <textarea rows={8} value={d.body} onChange={(e) => setD({ ...d, body: e.target.value })} placeholder={t('Notunuz… (kalın için **metin**, liste için satır başında -)')} />
        </label>
        {!entry && files.length > 0 && (
          <label className="field">
            {t('Konu')}
            <select value={d.file} onChange={(e) => setD({ ...d, file: e.target.value })}>
              {files.map((f) => (
                <option key={f.name} value={f.name}>
                  {f.title}
                </option>
              ))}
            </select>
          </label>
        )}

        <fieldset className="kb-rules">
          <legend>{t('Ne zaman öne çıksın?')}</legend>
          <p className="muted small">
            {t('Açık haritada bu koşullardan biri varsa not “Bu harita için” listesinde görünür ve sohbette yapay zekâya gönderilir. Koşul eklemezseniz not yalnızca aramada ve konusunda görünür.')}
          </p>

          {ruleChips.length > 0 && (
            <div className="kb-chips">
              {ruleChips.map((k) => (
                <span key={k} className="chip-rule">
                  {describeKeys([k])[0] ?? k}
                  <button aria-label={t('Kaldır')} onClick={() => drop((x) => x === k)}>
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="kb-rule-row">
            <span>{t('Ay şu durakta')}</span>
            <select value={mansion} onChange={(e) => (add(`durak:${e.target.value}`), setMansion(''))}>
              <option value="">{t('Durak seçin…')}</option>
              {MANSIONS.map((m, i) => (
                <option key={i} value={i + 1}>
                  {i + 1}. {getLang() === 'tr' ? m.tr : m.en}
                </option>
              ))}
            </select>
          </div>

          <div className="kb-rule-row">
            <span>{t('Sabit yıldızla kavuşum')}</span>
            <input list="kb-stars" value={star} placeholder={t('Yıldız adı')} onChange={(e) => setStar(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && (add(`yildiz:${starSlug(star)}`), setStar(''))} />
            <datalist id="kb-stars">
              {starNames.map((n) => (
                <option key={n} value={n} />
              ))}
            </datalist>
            <button disabled={!star.trim()} onClick={() => (add(`yildiz:${starSlug(star)}`), setStar(''))}>
              {t('Ekle')}
            </button>
          </div>

          <div className="kb-rule-row">
            <span>{t('Ay fazı')}</span>
            <select value={phase} onChange={(e) => (add(`faz:${e.target.value}`), setPhase(''))}>
              <option value="">{t('Faz seçin…')}</option>
              {PHASE_SLUG.map((slug, i) => (
                <option key={slug} value={slug}>
                  {moonPhase(0, i * 45 + 1).name}
                </option>
              ))}
            </select>
          </div>

          <div className="kb-rule-row top">
            <span>{t('Bir gezegen veya köşe şu derecede')}</span>
            <div className="kb-deg">
              <div className="kb-signs">
                {SIGN_SLUG.map((slug, i) => (
                  <button key={slug} className={`chip-sign${has(`burc:${slug}`) ? ' on' : ''}`} title={SIGNS[i].name} onClick={() => toggleSign(slug)}>
                    {SIGNS[i].name}
                  </button>
                ))}
              </div>
              <div className="kb-range">
                <input type="number" min={0} max={29} value={rFrom} placeholder="0" onChange={(e) => setRange(e.target.value, rTo ?? '')} />
                <span>°–</span>
                <input type="number" min={0} max={29} value={rTo ?? ''} placeholder="29" onChange={(e) => setRange(rFrom, e.target.value)} />
                <span>°</span>
                {(signs.length > 0 || range) && (
                  <button className="link small" onClick={() => drop((k) => k.startsWith('burc:') || k.startsWith('derece:'))}>
                    {t('Temizle')}
                  </button>
                )}
              </div>
            </div>
          </div>

          <div className="kb-rule-row top">
            <span>{t('Konular')}</span>
            <div className="kb-chips">
              {TOPICS.map((tp) => (
                <button key={tp.key} className={`chip-sign${has(tp.key) ? ' on' : ''}`} onClick={() => (has(tp.key) ? drop((k) => k === tp.key) : add(tp.key))}>
                  {t(tp.label)}
                </button>
              ))}
            </div>
          </div>
        </fieldset>

        <footer className="actions">
          {entry && onDelete && (
            <button className="link danger" onClick={() => confirm(t('Bu not silinsin mi?')) && onDelete()}>
              {t('Notu sil')}
            </button>
          )}
          <span className="grow" />
          <button onClick={onClose}>{t('Vazgeç')}</button>
          <button className="primary" disabled={!valid} onClick={() => onSave({ ...d, title: d.title.trim(), body: d.body.trim() })}>
            {t('Kaydet')}
          </button>
        </footer>
      </div>
    </div>
  )
}
