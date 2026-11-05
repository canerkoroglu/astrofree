import { t } from '../lib/i18n'
import AiSetupGuide from './AiSetupGuide'
import type { SettingsFocus } from './SettingsDialog'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useEffect, useMemo, useRef, useState } from 'react'
import { PROVIDERS } from '@shared/defaults'
import { getLocale } from '@shared/i18n'
import type { AiMessage, AppSettings, ChatSession, ProviderId, ProviderStatus } from '@shared/types'

interface Props {
  chatKey: string
  context: string
  layers: string[] // e.g. ['natal', 'transit']
  settings: AppSettings
  onSettings: (s: AppSettings) => void
  onSave?: (content: string, question: string, provider: string) => Promise<void>
  /** A prompt sent from elsewhere in the app (chart click, map, calendar). */
  inject?: { id: number; text: string } | null
  /** Knowledge-base entries matching the chart and the question, as text. */
  knowledge?: (question: string) => string
  /** Number of knowledge files, to show the toggle only when there is a base. */
  knowledgeCount?: number
  /** Open Settings at this provider's section (address, key, model). */
  onOpenSettings?: (focus: SettingsFocus) => void
}

const QUICK: { label: string; needs?: string; prompt: string }[] = [
  {
    label: 'Günün gökyüzü',
    needs: 'sky',
    prompt:
      'Bu anın gökyüzünü yorumla: Ay burcu ve fazı, retro gezegenler, sıkı gezegen açıları ve yaklaşan önemli olaylar (duraklar, burç geçişleri, ay evreleri, tutulmalar). Gün için genel temayı ve dikkat edilmesi gerekenleri özetle.'
  },
  {
    label: 'Natal yorum',
    needs: 'natal',
    prompt:
      'Doğum haritasını bütünlüklü yorumla: kişilik teması, Güneş-Ay-Yükselen üçlüsü, harita yöneticisi, en sıkı açılar, öne çıkan evler ve güçlü/zayıf yönler.'
  },
  {
    label: 'Transitler',
    needs: 'transit',
    prompt:
      'Bu tarihteki transitleri natal haritaya göre yorumla. Önce en etkili (yavaş gezegen, sıkı orb, yaklaşan) transitleri ele al; hangi yaşam alanlarını etkilediklerini ve yaklaşık zamanlamayı açıkla.'
  },
  {
    label: 'Progresyon',
    needs: 'progressed',
    prompt: 'İkincil progresyonları yorumla: progres Ay fazı ve evi, progres gezegenlerin natal noktalara açıları, açı/burç değiştiren progres gezegenler.'
  },
  { label: 'Solar ark', needs: 'solarArc', prompt: 'Solar ark direksiyonlarını yorumla; 1° orb içindeki direksiyonlara odaklan.' },
  {
    label: 'Sinastri',
    needs: 'synastry',
    prompt: 'İki harita arasındaki sinastriyi yorumla: çekim, uyum ve zorlanma alanları, Venüs-Mars ve Ay bağlantıları, uzun vadeli potansiyel.'
  },
  { label: 'Kariyer', needs: 'natal', prompt: 'Haritaya göre kariyer ve meslek potansiyelini yorumla (MC, 10. ev, 6. ev, 2. ev ve yöneticileri).' },
  { label: 'İlişkiler', needs: 'natal', prompt: 'Haritaya göre ilişki ve ortaklık dinamiklerini yorumla (7. ev, Venüs, Mars, Ay, DC yöneticisi).' }
]

function Markdown({ text }: { text: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(text, { async: false }) as string), [text])
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

const newSessionMeta = () => ({ id: crypto.randomUUID(), createdAt: Date.now(), title: '' })

export default function ChatPanel({ chatKey, context, layers, settings, onSettings, onSave, inject, knowledge, knowledgeCount = 0, onOpenSettings }: Props) {
  const [lastKb, setLastKb] = useState('')
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set())
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [runId, setRunId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [error, setError] = useState('')
  const [statuses, setStatuses] = useState<ProviderStatus[]>([])
  const [showCtx, setShowCtx] = useState(false)
  const [guide, setGuide] = useState(false)
  const [attach, setAttach] = useState(true)
  const listRef = useRef<HTMLDivElement>(null)
  const loadedKey = useRef<string | null>(null)
  // Chat sessions of this chart; the open one is `session`.
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [session, setSession] = useState<{ id: string; createdAt: number; title: string }>(() => newSessionMeta())
  const [renaming, setRenaming] = useState<string | null>(null)
  const loadedMessages = useRef<AiMessage[] | null>(null)
  const runIdRef = useRef<string | null>(null)

  const provider = settings.ai.provider
  const cfg = settings.ai.providers[provider]
  const info = PROVIDERS.find((p) => p.id === provider)!
  const st = statuses.find((s) => s.id === provider)
  const models = [...new Set([...(st?.models ?? []), ...info.models].filter(Boolean))]

  const recheck = () => {
    setStatuses([])
    void window.astro.ai.detect().then(setStatuses)
  }
  useEffect(recheck, [settings.ai.providers])

  // Load this chart's sessions and open the last active one.
  const openSession = (s: ChatSession | null) => {
    setSavedIdx(new Set())
    setError('')
    setRenaming(null)
    if (s) {
      setSession({ id: s.id, createdAt: s.createdAt, title: s.title })
      setMessages(s.messages)
      loadedMessages.current = s.messages
    } else {
      setSession(newSessionMeta())
      setMessages([])
      loadedMessages.current = []
    }
  }
  useEffect(() => {
    loadedKey.current = null
    setSessions([])
    openSession(null)
    void window.astro.chats.list(chatKey).then((c) => {
      setSessions(c.sessions)
      openSession(c.sessions.find((x) => x.id === c.activeId) ?? null)
      loadedKey.current = chatKey
    })
  }, [chatKey])

  // Save the open session after each completed exchange (not on load, not mid-stream).
  useEffect(() => {
    if (loadedKey.current !== chatKey || runId || !messages.length || messages === loadedMessages.current) return
    loadedMessages.current = messages
    void window.astro.chats
      .save(chatKey, { id: session.id, title: session.title, createdAt: session.createdAt, updatedAt: Date.now(), provider, messages })
      .then((c) => setSessions(c.sessions))
  }, [messages, runId, chatKey])

  const newSession = () => {
    if (runId) return
    openSession(null)
    void window.astro.chats.setActive(chatKey, null)
  }
  const switchSession = (id: string) => {
    if (runId) return
    const s = sessions.find((x) => x.id === id)
    if (!s) return newSession()
    openSession(s)
    void window.astro.chats.setActive(chatKey, id)
  }
  const deleteSession = async () => {
    if (runId || !sessions.some((x) => x.id === session.id)) return newSession()
    if (!confirm(t('Bu sohbet oturumu silinsin mi?'))) return
    const c = await window.astro.chats.remove(chatKey, session.id)
    setSessions(c.sessions)
    openSession(null)
  }
  const renameSession = async (title: string) => {
    setRenaming(null)
    if (!title.trim() || !sessions.some((x) => x.id === session.id)) return
    setSession((s) => ({ ...s, title: title.trim() }))
    const c = await window.astro.chats.rename(chatKey, session.id, title)
    setSessions(c.sessions)
  }
  const sessionLabel = (s: ChatSession) => `${s.title || t('Adsız sohbet')} · ${new Date(s.updatedAt).toLocaleDateString(document.documentElement.lang || undefined)}`
  const stored = sessions.some((x) => x.id === session.id)

  useEffect(() => {
    return window.astro.ai.onEvent((e) => {
      if (e.id !== runIdRef.current) return
      if (e.type === 'delta') {
        setStatus('')
        setMessages((m) => {
          const last = m[m.length - 1]
          if (last?.role === 'assistant') return [...m.slice(0, -1), { ...last, content: last.content + e.text }]
          return [...m, { role: 'assistant', content: e.text }]
        })
      } else if (e.type === 'status') setStatus(e.text)
      else {
        if (e.type === 'error') setError(e.message)
        setStatus('')
        setRunId(null)
        runIdRef.current = null
      }
    })
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, status])

  const send = (text: string) => {
    const msg = text.trim()
    if (!msg || runId) return
    const next: AiMessage[] = [...messages, { role: 'user', content: msg }]
    setMessages(next)
    setInput('')
    setError('')
    const id = crypto.randomUUID()
    runIdRef.current = id
    setRunId(id)
    setStatus(t('{p} yanıtlıyor…', { p: info.label }))
    const system = settings.ai.systemPrompt.trim() || getLocale(settings.ai.language).systemPrompt
    const kb = attach && settings.ai.useKnowledge && knowledge ? knowledge(msg) : ''
    setLastKb(kb)
    window.astro.ai.start({
      id,
      provider,
      model: cfg.model || undefined,
      system,
      context: attach ? (kb ? `${context}\n\n${kb}` : context) : '',
      messages: next
    })
  }

  const sendRef = useRef(send)
  sendRef.current = send
  useEffect(() => {
    if (!inject) return
    // Wait until this chart's stored conversation has loaded, or it would
    // overwrite the message we are about to send.
    let timer = 0
    const go = () => {
      if (loadedKey.current === chatKey) sendRef.current(inject.text)
      else timer = window.setTimeout(go, 80)
    }
    go()
    return () => window.clearTimeout(timer)
  }, [inject?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => {
    if (runId) window.astro.ai.cancel(runId)
  }

  const setProvider = (id: ProviderId) => onSettings({ ...settings, ai: { ...settings.ai, provider: id } })
  const setModel = (model: string) =>
    onSettings({ ...settings, ai: { ...settings.ai, providers: { ...settings.ai.providers, [provider]: { ...cfg, model } } } })

  return (
    <div className="chat">
      <div className="chat-head">
        <select value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)}>
          {PROVIDERS.map((p) => {
            const s = statuses.find((x) => x.id === p.id)
            return (
              <option key={p.id} value={p.id}>
                {s ? (s.available ? '● ' : '○ ') : ''}
                {t(p.label)}
              </option>
            )
          })}
        </select>
        <input list="models" value={cfg.model} placeholder={t('model (varsayılan)')} onChange={(e) => setModel(e.target.value)} />
        <datalist id="models">
          {models.map((m) => (
            <option key={m} value={m} />
          ))}
        </datalist>
      </div>
      <div className="chat-sessions">
        {renaming !== null ? (
          <input
            autoFocus
            className="session-title-input"
            value={renaming}
            onChange={(e) => setRenaming(e.target.value)}
            onBlur={() => void renameSession(renaming)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') void renameSession(renaming)
              if (e.key === 'Escape') setRenaming(null)
            }}
          />
        ) : (
          <select value={stored ? session.id : ''} disabled={!!runId} onChange={(e) => switchSession(e.target.value)} title={t('Bu haritanın sohbet oturumları')}>
            {!stored && <option value="">{t('Yeni sohbet')}</option>}
            {sessions.map((x) => (
              <option key={x.id} value={x.id}>
                {sessionLabel(x)}
              </option>
            ))}
          </select>
        )}
        <span className="muted small session-count">{t('{n} oturum', { n: sessions.length })}</span>
        <button className="icon-btn" disabled={!!runId || !stored} title={t('Oturumun adını değiştir')} aria-label={t('Oturumun adını değiştir')} onClick={() => setRenaming(session.title)}>
          ✎
        </button>
        <button className="icon-btn" disabled={!!runId || !stored} title={t('Oturumu sil')} aria-label={t('Oturumu sil')} onClick={() => void deleteSession()}>
          🗑
        </button>
        <button className="primary small-btn" disabled={!!runId || !messages.length} onClick={newSession} title={t('Bu sohbet saklanır; yeni, boş bir oturum açılır')}>
          + {t('Yeni sohbet')}
        </button>
      </div>
      {st && !st.available ? (
        <div className="chat-status warn unavailable">
          <span>{st.detail}</span>
          <span className="chat-status-actions">
            {onOpenSettings && info.kind === 'api' && (
              <button className="link" onClick={() => onOpenSettings(`ai:${provider}`)}>
                {provider === 'local' ? t('Adres ve port') : t('API anahtarı gir')}
              </button>
            )}
            <button className="link" onClick={() => setGuide(true)}>
              {t('Nasıl bağlanırım?')}
            </button>
            <button className="link" onClick={recheck}>
              {t('Tekrar kontrol et')}
            </button>
          </span>
        </div>
      ) : (
        <div className="chat-status">
          {st ? st.detail : t('Kontrol ediliyor…')}
          {st && provider === 'local' && onOpenSettings && (
            <>
              {' · '}
              <button className="link" onClick={() => onOpenSettings('ai:local')}>
                {t('Adres ve port')}
              </button>
            </>
          )}
        </div>
      )}
      {guide && (
        <AiSetupGuide
          onClose={() => setGuide(false)}
          onRecheck={() => {
            setGuide(false)
            recheck()
          }}
        />
      )}

      <div className="quick">
        {QUICK.filter((q) => !q.needs || layers.includes(q.needs)).map((q) => (
          <button key={q.label} disabled={!!runId} onClick={() => send(t(q.prompt))}>
            {t(q.label)}
          </button>
        ))}
      </div>

      <div className="messages" ref={listRef}>
        {messages.length === 0 && (
          <div className="muted pad">
            {t('Haritayı yorumlatmak için yukarıdaki kısayollardan birini seçin ya da soru yazın. Ekrandaki harita (ve zamanı ilerlettiğinizde güncel transitler) her mesajla birlikte gönderilir.')}
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`msg ${m.role}`}>
            {m.role === 'assistant' ? <Markdown text={m.content} /> : <div className="user-text">{m.content}</div>}
            {m.role === 'assistant' && (
              <div className="msg-actions">
                <button className="link small" onClick={() => navigator.clipboard.writeText(m.content)}>
                  {t('Kopyala')}
                </button>
                {onSave && (
                  <button
                    className="link small"
                    disabled={savedIdx.has(i) || (!!runId && i === messages.length - 1)}
                    onClick={async () => {
                      const q = [...messages.slice(0, i)].reverse().find((x) => x.role === 'user')?.content ?? ''
                      await onSave(m.content, q, `${t(info.label)}${cfg.model ? ' · ' + cfg.model : ''}`)
                      setSavedIdx((s) => new Set(s).add(i))
                    }}
                  >
                    {savedIdx.has(i) ? `✓ ${t('Kaydedildi')}` : t('Yoruma kaydet')}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
        {status && <div className="msg status">{status}</div>}
        {error && (
          <div className="msg error">
            {error}
            <div className="msg-error-actions">
              <button className="link" onClick={() => setGuide(true)}>
                {t('Nasıl bağlanırım?')}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="composer">
        <textarea
          rows={3}
          value={input}
          placeholder={t('Haritayla ilgili sorunuzu yazın… (Enter gönderir, Shift+Enter yeni satır)')}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              send(input)
            }
          }}
        />
        <div className="composer-row">
          <label className="inline small">
            <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} /> {t('Harita verisini ekle')}
          </label>
          {knowledgeCount > 0 && (
            <label className="inline small" title={t('Haritayla ve sorunuzla eşleşen bilgi bankası kayıtları da gönderilir')}>
              <input
                type="checkbox"
                checked={settings.ai.useKnowledge}
                disabled={!attach}
                onChange={(e) => onSettings({ ...settings, ai: { ...settings.ai, useKnowledge: e.target.checked } })}
              />{' '}
              {t('Bilgi bankası')}
            </label>
          )}
          <button className="link small" onClick={() => setShowCtx(!showCtx)}>
            {showCtx ? t('Veriyi gizle') : t('Gönderilen veri')}
          </button>

          <span className="grow" />
          {runId ? (
            <button onClick={stop}>{t('■ Durdur')}</button>
          ) : (
            <button className="primary" disabled={!input.trim()} onClick={() => send(input)}>
              {t('Gönder')}
            </button>
          )}
        </div>
        <div className="ai-disclaimer">{t('Yapay zekâ yanıtları hata içerebilir; kişisel keşif amaçlıdır, kesin bilgi ya da profesyonel tavsiye değildir.')}</div>
        {showCtx && <pre className="ctx">{lastKb ? `${context}\n\n${lastKb}` : context}</pre>}
      </div>
    </div>
  )
}
