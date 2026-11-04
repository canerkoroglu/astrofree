import { getLang, t } from '../lib/i18n'
import { glossaryFor } from '@shared/meanings/glossary'
import { useMemo, useRef, useState } from 'react'
import { appendEntry, fileTitle, removeEntry, replaceEntry, serializeEntry, type KbEntry, type KbFile } from '@shared/knowledge'
import { describeKeys, shortCategory, type KbMatch } from '../lib/kb'
import { MarkdownBlock } from './Interpretations'
import KbEntryEditor, { type KbDraft } from './KbEntryEditor'

const RELEVANT = '__relevant__'
const GLOSSARY = '__glossary__'
const MY_NOTES = 'Notlarım.md' // i18n-ignore

const fold = (s: string) => s.toLocaleLowerCase('tr').normalize('NFD').replace(/[̀-ͯ]/g, '')

/** The user's own notes: browse by topic, see what applies to the open chart, add and edit. */
export default function Knowledge({
  files,
  entries,
  matches,
  starNames,
  onReload,
  onAsk
}: {
  files: KbFile[]
  entries: KbEntry[]
  matches: KbMatch[]
  starNames: string[]
  onReload: () => void
  onAsk: (prompt: string) => void
}) {
  const [view, setView] = useState<string>(RELEVANT)
  const [query, setQuery] = useState('')
  const [editing, setEditing] = useState<KbEntry | 'new' | null>(null)
  const [rawFile, setRawFile] = useState<{ name: string; text: string } | null>(null)
  const [menu, setMenu] = useState(false)
  const mainRef = useRef<HTMLElement>(null)

  const counts = useMemo(() => {
    const m = new Map<string, number>()
    for (const e of entries) m.set(e.file, (m.get(e.file) ?? 0) + 1)
    return m
  }, [entries])
  const topics = files.filter((f) => counts.get(f.name))
  const documents = files.filter((f) => !counts.get(f.name) && f.text.trim())
  const titleOf = (name: string) => fileTitle(name, files.find((f) => f.name === name)?.text ?? '')
  const reasons = useMemo(() => new Map(matches.map((m) => [m.entry.id, m.reasons])), [matches])

  const q = fold(query.trim())
  const inGlossary = view === GLOSSARY
  const glossary = useMemo(() => {
    const all = glossaryFor(getLang())
    if (!q) return all
    return all.map((g) => ({ ...g, terms: g.terms.filter(([term, def]) => fold(`${term} ${def}`).includes(q)) })).filter((g) => g.terms.length)
  }, [q])
  const glossaryCount = useMemo(() => glossaryFor(getLang()).reduce((n, g) => n + g.terms.length, 0), [])
  const shown = useMemo(() => {
    if (view === GLOSSARY) return []
    if (q) return entries.filter((e) => fold(`${e.title} ${e.section} ${e.category} ${e.tags.join(' ')} ${e.body}`).includes(q))
    if (view === RELEVANT) return matches.map((m) => m.entry)
    return entries.filter((e) => e.file === view)
  }, [q, view, entries, matches])
  const doc = !q && view !== RELEVANT && view !== GLOSSARY && !counts.get(view) ? files.find((f) => f.name === view) : undefined
  const sections = useMemo(() => [...new Set(shown.map((e) => e.section).filter(Boolean))], [shown])
  // "Koç burcundaki yıldızlar", "Boğa burcundaki yıldızlar"… → "Koç", "Boğa"… for the jump chips.
  const sectionLabel = useMemo(() => {
    const words = sections.map((s) => s.split(' '))
    const suffix: Record<string, number> = {}
    for (const w of words) for (let n = 1; n < w.length; n++) suffix[w.slice(-n).join(' ')] = (suffix[w.slice(-n).join(' ')] ?? 0) + 1
    const common = Object.entries(suffix)
      .filter(([, c]) => c >= 3 && c >= sections.length / 2)
      .sort((a, b) => b[0].length - a[0].length)[0]?.[0]
    return (s: string) => (common && s.endsWith(' ' + common) ? s.slice(0, -common.length - 1) : s)
  }, [sections])

  const go = (v: string) => {
    setView(v)
    setQuery('')
    setRawFile(null)
    mainRef.current?.scrollTo({ top: 0 })
  }

  const fileText = (name: string) => files.find((f) => f.name === name)?.text ?? ''
  const save = async (d: KbDraft) => {
    const block = serializeEntry(d)
    if (editing && editing !== 'new') {
      await window.astro.kb.save(editing.file, replaceEntry(fileText(editing.file), editing, block))
    } else {
      const name = d.file || MY_NOTES
      await window.astro.kb.save(name, appendEntry(fileText(name), t('Notlarım'), block))
      if (view !== RELEVANT) setView(name)
    }
    setEditing(null)
    onReload()
  }
  const remove = async (e: KbEntry) => {
    await window.astro.kb.save(e.file, removeEntry(fileText(e.file), e))
    setEditing(null)
    onReload()
  }
  const importFiles = async () => {
    setMenu(false)
    const added = await window.astro.kb.import()
    if (added.length) {
      onReload()
      setView(added[0])
    }
  }
  const editorFiles = [
    ...(files.some((f) => f.name === MY_NOTES) ? [] : [{ name: MY_NOTES, title: t('Notlarım') }]),
    ...topics.map((f) => ({ name: f.name, title: shortCategory(titleOf(f.name)) }))
  ]

  const editor = editing && (
    <KbEntryEditor
      entry={editing === 'new' ? null : editing}
      files={editorFiles}
      starNames={starNames}
      onSave={save}
      onDelete={editing !== 'new' ? () => void remove(editing) : undefined}
      onClose={() => setEditing(null)}
    />
  )

  if (!files.length && !inGlossary) {
    return (
      <div className="kb kb-empty-wrap">
        <div className="kb-empty">
          <h3>{t('Kendi astroloji notlarınız')}</h3>
          <p className="muted">
            {t(
              'Ders notlarınızı, kitaplardan öğrendiklerinizi ve kendi yorum kurallarınızı burada toplayın. Bir nota “ne zaman öne çıksın” koşulu eklerseniz (ör. Ay 5. durakta, Algol kavuşumu, Boğa 25°–27°), o koşulu taşıyan haritalarda not kendiliğinden listelenir ve yapay zekâ yorum yaparken bu notları kullanır.'
            )}
          </p>
          <div className="row">
            <button className="primary" onClick={() => setEditing('new')}>
              {t('+ İlk notu ekle')}
            </button>
            <button onClick={importFiles}>{t('Dosyadan içe aktar…')}</button>
            <button onClick={() => go(GLOSSARY)}>{t('Astroloji sözlüğü')}</button>
          </div>
        </div>
        {editor}
      </div>
    )
  }

  return (
    <div className="kb">
      <aside className="kb-side">
        <button className="primary kb-new" onClick={() => setEditing('new')}>
          {t('+ Yeni not')}
        </button>
        <input type="search" className="kb-search" placeholder={inGlossary ? t('Sözlükte ara…') : t('Notlarda ara…')} value={query} onChange={(e) => setQuery(e.target.value)} />

        <button className={`kb-nav${view === RELEVANT && !q ? ' on' : ''}`} onClick={() => go(RELEVANT)}>
          <span>{t('Bu harita için')}</span>
          <span className="kb-count">{matches.length}</span>
        </button>
        <button className={`kb-nav${inGlossary ? ' on' : ''}`} onClick={() => go(GLOSSARY)} title={t('Uygulamada geçen astroloji terimlerinin açıklamaları')}>
          <span>{t('Astroloji sözlüğü')}</span>
          <span className="kb-count">{glossaryCount}</span>
        </button>

        <div className="kb-nav-head">{t('Konular')}</div>
        {topics.map((f) => (
          <button key={f.name} className={`kb-nav${view === f.name && !q ? ' on' : ''}`} title={titleOf(f.name)} onClick={() => go(f.name)}>
            <span>{shortCategory(titleOf(f.name))}</span>
            <span className="kb-count">{counts.get(f.name)}</span>
          </button>
        ))}

        <div className="kb-side-foot">
          {documents.map((f) => (
            <button key={f.name} className="link small" onClick={() => go(f.name)}>
              {shortCategory(titleOf(f.name))}
            </button>
          ))}
          <div className="kb-more">
            <button className="link small" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              {t('Dosyalar')} ▾
            </button>
            {menu && (
              <div className="kb-menu" onMouseLeave={() => setMenu(false)}>
                <button onClick={importFiles}>{t('Dosyadan içe aktar…')}</button>
                <button
                  onClick={() => {
                    setMenu(false)
                    void window.astro.kb.openDir()
                  }}
                >
                  {t('Klasörü göster')}
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      <section className="kb-main" ref={mainRef}>
        <header className="kb-head">
          <div className="kb-head-text">
            <h3>{inGlossary ? t('Astroloji sözlüğü') : q ? t('Arama sonuçları') : view === RELEVANT ? t('Bu harita için') : shortCategory(titleOf(view))}</h3>
            <p className="muted small">
              {inGlossary
                ? t('Uygulamada geçen {n} terimin kısa açıklaması. Tanımlar astroloji geleneğini aktarır.', { n: glossary.reduce((n, g) => n + g.terms.length, 0) })
                : q
                ? t('{n} not bulundu', { n: shown.length })
                : view === RELEVANT
                  ? t('Açık haritadaki Ay durağı, sabit yıldız kavuşumları ve hassas derecelere göre seçilen {n} not. Sohbette yapay zekâ da bunları kullanır.', { n: shown.length })
                  : doc
                    ? ''
                    : t('{n} not', { n: shown.length })}
            </p>
          </div>
          {!q && view !== RELEVANT && !inGlossary && !rawFile && (
            <button className="link small" title={t('Bu konunun tamamını düz metin (Markdown) olarak düzenle')} onClick={() => setRawFile({ name: view, text: fileText(view) })}>
              {t('Gelişmiş düzenleme')}
            </button>
          )}
        </header>

        {inGlossary && !q && (
          <nav className="kb-sections">
            {glossary.map((g) => (
              <button key={g.title} className="chip-sign" onClick={() => document.getElementById(`kb-gl-${g.title}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>
                {g.title}
              </button>
            ))}
          </nav>
        )}

        {sections.length > 1 && !q && !rawFile && view !== RELEVANT && !inGlossary && (
          <nav className="kb-sections">
            {sections.map((s) => (
              <button key={s} className="chip-sign" onClick={() => document.getElementById(`kb-sec-${s}`)?.scrollIntoView({ block: 'start', behavior: 'smooth' })}>
                {sectionLabel(s)}
              </button>
            ))}
          </nav>
        )}

        {inGlossary ? (
          glossary.length ? (
            glossary.map((g) => (
              <section key={g.title} className="kb-glossary">
                <h4 className="kb-section" id={`kb-gl-${g.title}`}>
                  {g.title}
                </h4>
                <dl>
                  {g.terms.map(([term, def]) => (
                    <div key={term} className="kb-term">
                      <dt>{term}</dt>
                      <dd>{def}</dd>
                    </div>
                  ))}
                </dl>
              </section>
            ))
          ) : (
            <div className="kb-none muted">{t('Bu aramayla eşleşen terim yok.')}</div>
          )
        ) : rawFile ? (
          <div className="kb-editor">
            <p className="muted small">
              {t('Her “### Başlık” bir nottur. Başlığın hemen altındaki “- anahtarlar:” satırı notun ne zaman öne çıkacağını belirler.')}
            </p>
            <textarea spellCheck={false} value={rawFile.text} onChange={(e) => setRawFile({ ...rawFile, text: e.target.value })} />
            <div className="row-end">
              <button
                className="link danger"
                onClick={async () => {
                  if (!confirm(t('“{name}” konusunun tamamı çöp kutusuna taşınsın mı?', { name: shortCategory(titleOf(rawFile.name)) }))) return
                  await window.astro.kb.trash(rawFile.name)
                  go(RELEVANT)
                  onReload()
                }}
              >
                {t('Konuyu çöpe taşı')}
              </button>
              <span className="grow" />
              <button onClick={() => setRawFile(null)}>{t('Vazgeç')}</button>
              <button
                className="primary"
                onClick={async () => {
                  await window.astro.kb.save(rawFile.name, rawFile.text)
                  setRawFile(null)
                  onReload()
                }}
              >
                {t('Kaydet')}
              </button>
            </div>
          </div>
        ) : doc ? (
          <article className="kb-entry kb-doc">
            <MarkdownBlock text={doc.text.replace(/^#\s+.*\n/, '')} />
          </article>
        ) : !shown.length ? (
          <div className="kb-none muted">
            {q
              ? t('Bu aramayla eşleşen not yok.')
              : view === RELEVANT
                ? t('Bu haritada öne çıkan bir not yok. Notlarınıza koşul ekledikçe burada görünürler.')
                : t('Bu konuda henüz not yok.')}
          </div>
        ) : (
          shown.map((e, i) => {
            const why = view === RELEVANT && !q ? reasons.get(e.id) : undefined
            const rules = describeKeys(e.keys)
            const newSection = !q && view !== RELEVANT && e.section && e.section !== shown[i - 1]?.section
            return (
              <div key={e.id} className="kb-item">
                {newSection && (
                  <h4 className="kb-section" id={`kb-sec-${e.section}`}>
                    {e.section}
                  </h4>
                )}
                <article className="kb-entry">
                  <header>
                    <h4>{e.title}</h4>
                    {(view === RELEVANT || q) && <span className="kb-topic">{shortCategory(e.category)}</span>}
                  </header>
                  {why && why.length > 0 && (
                    <div className="kb-why">
                      <span className="muted small">{t('Neden burada:')}</span>
                      {why.map((r) => (
                        <span key={r} className="kb-why-item">
                          {r}
                        </span>
                      ))}
                    </div>
                  )}
                  <MarkdownBlock text={e.body} breaks />
                  <footer>
                    {!why && rules.length > 0 && (
                      <span className="muted small kb-when" title={t('Bu not, açık haritada bu koşullardan biri varsa öne çıkar')}>
                        {t('Öne çıktığı durum:')} {rules.join(' · ')}
                      </span>
                    )}
                    <span className="grow" />
                    <button className="link small" onClick={() => setEditing(e)}>
                      {t('Düzenle')}
                    </button>
                    <button className="small" onClick={() => onAsk(t('Bilgi bankamdaki “{title}” notunu bu haritaya uygula ve yorumla.', { title: e.title }))}>
                      {t('AI ile yorumla')}
                    </button>
                  </footer>
                </article>
              </div>
            )
          })
        )}
      </section>
      {editor}
    </div>
  )
}
