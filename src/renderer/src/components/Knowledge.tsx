import { t } from '../lib/i18n'
import { useMemo, useState } from 'react'
import type { KbEntry, KbFile } from '@shared/knowledge'
import type { KbMatch } from '../lib/kb'
import { MarkdownBlock } from './Interpretations'

const RELEVANT = '__relevant__'

const fold = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '')

/** Browse, search and edit the user's knowledge base; shows what matches the open chart. */
export default function Knowledge({
  files,
  entries,
  matches,
  onReload,
  onAsk
}: {
  files: KbFile[]
  entries: KbEntry[]
  matches: KbMatch[]
  onReload: () => void
  onAsk: (prompt: string) => void
}) {
  const [file, setFile] = useState<string>(RELEVANT)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<{ name: string; text: string } | null>(null)
  const [busy, setBusy] = useState(false)

  const reasons = useMemo(() => new Map(matches.map((m) => [m.entry.id, m.reasons])), [matches])
  const shown = useMemo(() => {
    let list = file === RELEVANT ? matches.map((m) => m.entry) : entries.filter((e) => e.file === file)
    const q = fold(query.trim())
    if (q) {
      // A search always covers the whole base.
      list = entries.filter((e) => fold(`${e.title} ${e.tags.join(' ')} ${e.keys.join(' ')} ${e.body}`).includes(q))
    }
    return list
  }, [file, query, entries, matches])

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) m.set(e.file, (m.get(e.file) ?? 0) + 1)
    return m
  }, [entries])
  const category = (name: string) => entries.find((e) => e.file === name)?.category ?? name.replace(/\.(md|txt)$/i, '')

  const importFiles = async () => {
    setBusy(true)
    try {
      const added = await window.astro.kb.import()
      if (added.length) {
        onReload()
        setFile(added[0])
      }
    } finally {
      setBusy(false)
    }
  }

  const newFile = async () => {
    const name = prompt(t('Yeni dosyanın adı'), t('notlarim'))?.trim()
    if (!name) return
    const fname = /\.(md|txt)$/i.test(name) ? name : `${name}.md`
    if (files.some((f) => f.name === fname)) return setFile(fname)
    const text = `# ${name.replace(/\.(md|txt)$/i, '')}\n\n### ${t('Başlık')}\n- ${t('anahtarlar')}: \n- ${t('etiketler')}: \n${t('Metin…')}\n`
    await window.astro.kb.save(fname, text)
    onReload()
    setFile(fname)
    setEditing({ name: fname, text })
  }

  if (!files.length) {
    return (
      <div className="kb pad">
        <div className="kb-empty">
          <h3>{t('Bilgi bankası boş')}</h3>
          <p className="muted">
            {t(
              'Kendi ders notlarınızı, kitap özetlerinizi veya yorum kurallarınızı Markdown dosyası olarak ekleyin. Her “### Başlık” bir kayıttır; altına “- anahtarlar: durak:5, yildiz:algol, burc:boga, derece:25-27” gibi bir satır eklerseniz kayıt haritayla otomatik eşleşir ve sohbette yapay zekâya gönderilir.'
            )}
          </p>
          <div className="row">
            <button className="primary" disabled={busy} onClick={importFiles}>
              {t('Dosya ekle…')}
            </button>
            <button onClick={newFile}>{t('Yeni dosya')}</button>
            <button className="link" onClick={() => void window.astro.kb.openDir()}>
              {t('Klasörü aç')}
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="kb">
      <aside className="kb-side">
        <input type="search" placeholder={t('Bilgi bankasında ara…')} value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className={file === RELEVANT && !query ? 'on' : ''} onClick={() => (setFile(RELEVANT), setQuery(''))}>
          <span>{t('Bu haritayla ilgili')}</span>
          <span className="muted">{matches.length}</span>
        </button>
        {files.map((f) => (
          <button key={f.name} className={file === f.name && !query ? 'on' : ''} onClick={() => (setFile(f.name), setQuery(''))}>
            <span>{category(f.name)}</span>
            <span className="muted">{counts.get(f.name) ?? 0}</span>
          </button>
        ))}
        <div className="kb-actions">
          <button className="link small" disabled={busy} onClick={importFiles}>
            {t('Dosya ekle…')}
          </button>
          <button className="link small" onClick={newFile}>
            {t('Yeni dosya')}
          </button>
          <button className="link small" onClick={onReload}>
            {t('Yenile')}
          </button>
          <button className="link small" onClick={() => void window.astro.kb.openDir()}>
            {t('Klasörü aç')}
          </button>
        </div>
      </aside>

      <section className="kb-main">
        {file !== RELEVANT && !query && (
          <div className="kb-filebar">
            <strong>{category(file)}</strong>
            <span className="muted small">{file}</span>
            <span className="grow" />
            <button className="link small" onClick={() => setEditing({ name: file, text: files.find((f) => f.name === file)?.text ?? '' })}>
              {t('Düzenle')}
            </button>
            <button
              className="link small danger"
              onClick={async () => {
                if (!confirm(t('“{name}” çöp kutusuna taşınsın mı?', { name: file }))) return
                await window.astro.kb.trash(file)
                setFile(RELEVANT)
                onReload()
              }}
            >
              {t('Çöpe taşı')}
            </button>
          </div>
        )}

        {editing ? (
          <div className="kb-editor">
            <div className="kb-filebar">
              <strong>{editing.name}</strong>
              <span className="grow" />
              <button onClick={() => setEditing(null)}>{t('Vazgeç')}</button>
              <button
                className="primary"
                onClick={async () => {
                  await window.astro.kb.save(editing.name, editing.text)
                  setEditing(null)
                  onReload()
                }}
              >
                {t('Kaydet')}
              </button>
            </div>
            <textarea spellCheck={false} value={editing.text} onChange={(e) => setEditing({ ...editing, text: e.target.value })} />
          </div>
        ) : !shown.length ? (
          <p className="muted pad">
            {query ? t('Eşleşen kayıt yok.') : file === RELEVANT ? t('Bu haritayla eşleşen kayıt yok.') : t('Bu dosyada kayıt yok.')}
          </p>
        ) : (
          shown.map((e) => (
            <article key={e.id} className="kb-entry">
              <header>
                <h4>{e.title}</h4>
                <span className="grow" />
                <button
                  className="link small"
                  onClick={() => onAsk(t('Bilgi bankamdaki “{title}” kaydını bu haritaya uygula ve yorumla.', { title: e.title }))}
                >
                  {t('Haritaya uygula')}
                </button>
              </header>
              <div className="kb-meta">
                {(file === RELEVANT || query) && <span className="chip">{e.category}</span>}
                {reasons.get(e.id)?.map((r) => (
                  <span key={r} className="chip accent">
                    {r}
                  </span>
                ))}
                {e.tags.map((tg) => (
                  <span key={tg} className="chip muted">
                    {tg}
                  </span>
                ))}
              </div>
              <MarkdownBlock text={e.body} breaks />
            </article>
          ))
        )}
      </section>
    </div>
  )
}
