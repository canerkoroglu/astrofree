import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useState } from 'react'
import type { Interpretation } from '@shared/types'

export function MarkdownBlock({ text }: { text: string }) {
  return <div className="md" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(text, { async: false }) as string) }} />
}

const fmtDate = (ms: number) =>
  new Date(ms).toLocaleString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })

/** Saved AI interpretations for one chart. */
export default function Interpretations({
  items,
  onUpdate,
  onRemove
}: {
  items: Interpretation[]
  onUpdate: (id: string, patch: Partial<Interpretation>) => void
  onRemove: (id: string) => void
}) {
  const [editing, setEditing] = useState<string | null>(null)
  const [draft, setDraft] = useState('')
  if (!items.length) {
    return (
      <div className="interp muted pad">
        Henüz kaydedilmiş yorum yok. Sohbet panelindeki bir yanıtın altındaki <strong>“Yoruma kaydet”</strong> düğmesiyle buraya ekleyebilirsiniz.
      </div>
    )
  }
  return (
    <div className="interp">
      {[...items]
        .sort((a, b) => b.createdAt - a.createdAt)
        .map((it) => (
          <article key={it.id} className="interp-item">
            <header>
              <input className="interp-title" value={it.title} onChange={(e) => onUpdate(it.id, { title: e.target.value })} />
              <span className="muted small">
                {fmtDate(it.createdAt)} · {it.provider}
              </span>
              <span className="grow" />
              <button className="link small" onClick={() => navigator.clipboard.writeText(it.content)}>
                Kopyala
              </button>
              {editing === it.id ? (
                <button
                  className="link small"
                  onClick={() => {
                    onUpdate(it.id, { content: draft })
                    setEditing(null)
                  }}
                >
                  Bitti
                </button>
              ) : (
                <button
                  className="link small"
                  onClick={() => {
                    setEditing(it.id)
                    setDraft(it.content)
                  }}
                >
                  Düzenle
                </button>
              )}
              <button className="link small danger" onClick={() => confirm('Bu yorum silinsin mi?') && onRemove(it.id)}>
                Sil
              </button>
            </header>
            {editing === it.id ? <textarea rows={14} value={draft} onChange={(e) => setDraft(e.target.value)} /> : <MarkdownBlock text={it.content} />}
          </article>
        ))}
    </div>
  )
}
