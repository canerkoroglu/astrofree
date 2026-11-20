import { t } from '../lib/i18n'
import Icon from './Icon'
import AiSetupGuide from './AiSetupGuide'
import type { SettingsFocus } from './SettingsDialog'
import DOMPurify from 'dompurify'
import { marked } from 'marked'
import { useEffect, useMemo, useRef, useState } from 'react'
import { aiLanguageOf, aiSystemPrompt, PROVIDERS } from '@shared/defaults'
import { checkAnswer } from '@shared/answerCheck'
import { buildConversation, lastSentContext, requestTokens } from '@shared/aiHistory'
import type { AiLevel, AiMessage, AppSettings, ChatSession, ProviderId, ProviderStatus } from '@shared/types'

interface Props {
  chatKey: string
  context: string
  /** Live mode: the context changes by itself as the clock runs. */
  live?: boolean
  layers: string[] // e.g. ['natal', 'transit']
  settings: AppSettings
  onSettings: (s: AppSettings) => void
  onSave?: (content: string, question: string, provider: string) => Promise<void>
  /** A prompt sent from elsewhere in the app (chart click, map, calendar). */
  inject?: { id: number; text: string } | null
  /** Knowledge-base entries matching the chart and the question, as text. */
  knowledge?: (question: string) => string
  /** Candidate days and periods for a timing question ('' when the question is not about timing). */
  timing?: (question: string) => Promise<string>
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

/** Shortcuts at the amateur level: everyday life questions instead of techniques. */
const QUICK_AMATEUR: typeof QUICK = [
  { label: 'Bugün nasıl?', needs: 'sky', prompt: 'Bugün gökyüzü nasıl bir gün gösteriyor? Sade bir dille, bugün nelere dikkat etmek iyi olur?' },
  { label: 'Ben nasıl biriyim?', needs: 'natal', prompt: 'Haritama göre nasıl bir insanım? Güçlü yanlarımı ve zorlanabileceğim konuları sade bir dille anlat.' },
  { label: 'Önümüzdeki 3 ay', needs: 'natal', prompt: 'Önümüzdeki 3 ayda hayatımda hangi konular öne çıkabilir? Kısa ve sade bir dille anlat.' },
  { label: 'Aşk', needs: 'natal', prompt: 'Aşk hayatım ve ilişkilerim hakkında haritam neler gösterebilir? Önümüzdeki haftalarda öne çıkabilecek temalar neler?' },
  {
    label: 'İş ve para',
    needs: 'natal',
    prompt: 'İş, kariyer ve para konusunda güçlü yanlarım neler olabilir? Önümüzdeki haftalarda yeni başlangıçlar için daha uygun görülebilecek günler var mı?'
  },
  { label: 'Sağlık ve enerji', needs: 'natal', prompt: 'Enerjim, dinlenme ihtiyacım ve kendime bakım konusunda haritam neler gösterebilir?' },
  { label: 'Uyumumuz', needs: 'synastry', prompt: 'Bu iki kişi birbiriyle nasıl anlaşır? İlişkinin güçlü yanlarını ve dikkat edilmesi gerekenleri sade bir dille anlat.' },
  {
    label: 'Merkür retrosu',
    prompt: 'Önümüzdeki 6 ayda Merkür retrosu var mı? Ne zaman başlayıp bitiyor ve geleneksel olarak nelerle ilişkilendiriliyor?'
  },
  {
    label: 'Uygun günler',
    prompt: 'Önümüzdeki 30 günde yeni bir işe başlamak ya da önemli bir adım atmak için hangi günler daha uygun görülebilir? Her biri için kısa bir neden yaz.'
  }
]
/** Offered under an amateur-level answer: the same in more depth, still in plain words. */
const MORE_DETAIL = { label: 'Biraz daha ayrıntılı', prompt: 'Son yanıtı biraz daha ayrıntılı ama yine sade bir dille anlatır mısın?' }
/** Offered when a beginner-level answer came out long or directive: the model rewrites it to the rules. */
const REWRITE = 'Son yanıtını en fazla 150 kelimeyle, sade bir dille ve yönlendirme yapmadan ("yapmalısın", "mutlaka" gibi ifadeler olmadan), olasılık diliyle yeniden yazar mısın?'

function Markdown({ text }: { text: string }) {
  const html = useMemo(() => DOMPurify.sanitize(marked.parse(text, { async: false }) as string), [text])
  return <div className="md" dangerouslySetInnerHTML={{ __html: html }} />
}

const newSessionMeta = () => ({ id: crypto.randomUUID(), createdAt: Date.now(), title: '' })

export default function ChatPanel({ chatKey, context, live = false, layers, settings, onSettings, onSave, inject, knowledge, timing, knowledgeCount = 0, onOpenSettings }: Props) {
  const [lastKb, setLastKb] = useState('')
  const [savedIdx, setSavedIdx] = useState<Set<number>>(new Set())
  const [messages, setMessages] = useState<AiMessage[]>([])
  const [input, setInput] = useState('')
  const [runId, setRunId] = useState<string | null>(null)
  const [status, setStatus] = useState('')
  const [started, setStarted] = useState(0)
  const [, tick] = useState(0)
  useEffect(() => {
    if (!started) return
    const id = window.setInterval(() => tick((n) => n + 1), 1000)
    return () => window.clearInterval(id)
  }, [started])
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
  /** Dates are being computed: the request has not gone out yet. */
  const preparing = useRef(false)

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

  // When to attach chart data to the next question: when it differs from what the conversation
  // already has. In live mode the clock alone changes it every minute; then it is refreshed at
  // most every 30 minutes (a manual time or layer change still goes out at once: live turns off).
  const ctxSentAt = useRef(0)
  useEffect(() => {
    ctxSentAt.current = 0
  }, [chatKey, session.id])
  const contextToAttach = (): string | undefined => {
    if (!attach || !context) return undefined
    const last = lastSentContext(messages)
    if (context === last) return undefined
    if (live && last && Date.now() - ctxSentAt.current < 30 * 60 * 1000) return undefined
    return context
  }

  // Size of the next request (what pressing Send would cost, roughly).
  const nextSize = useMemo(() => {
    const system = aiSystemPrompt(settings)
    const ctx = contextToAttach()
    const next: AiMessage[] = [...messages, { role: 'user', content: input || ' ', ...(ctx ? { context: ctx } : {}) }]
    const sent = requestTokens(system, next)
    // Everything before the new question was in the previous request too: likely served from the cache.
    const repeat = messages.length ? requestTokens(system, messages) : 0
    return { tokens: sent, repeat: Math.min(repeat, sent), withChart: !!ctx, shortened: buildConversation(next).shortened }
  }, [messages, input, attach, context, live, settings.ai.systemPrompt, settings.ai.level, settings.ai.language, settings.uiLanguage])
  const fmtK = (n: number) => (n >= 1000 ? `${(n / 1000).toLocaleString(document.documentElement.lang || undefined, { maximumFractionDigits: 1 })}k` : String(n))

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
      else if (e.type === 'usage') {
        setMessages((m) => {
          const last = m[m.length - 1]
          return last?.role === 'assistant' ? [...m.slice(0, -1), { ...last, usage: e.usage }] : m
        })
      } else {
        if (e.type === 'error') setError(e.message)
        setStatus('')
        setStarted(0)
        setRunId(null)
        runIdRef.current = null
      }
    })
  }, [])

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight })
  }, [messages, status])

  const send = async (text: string) => {
    const msg = text.trim()
    if (!msg || runIdRef.current) return
    const kb = attach && settings.ai.useKnowledge && knowledge ? knowledge(msg) : ''
    setLastKb(kb)
    // Chart data rides on the question only when it differs from what this conversation already has,
    // so follow-ups reuse the provider's cached copy.
    const ctx = contextToAttach()
    if (ctx) ctxSentAt.current = Date.now()
    const question: AiMessage = { role: 'user', content: msg, ...(ctx ? { context: ctx } : {}), ...(kb ? { knowledge: kb } : {}) }
    setMessages([...messages, question])
    setInput('')
    setError('')
    const id = crypto.randomUUID()
    runIdRef.current = id
    setRunId(id)
    setStarted(Date.now())
    // "When…?" questions: compute candidate days for the range they name (a second or two at most).
    let dates = ''
    if (timing && attach) {
      setStatus(t('Tarihler hesaplanıyor…'))
      preparing.current = true
      dates = await Promise.race([timing(msg).catch(() => ''), new Promise<string>((r) => window.setTimeout(() => r(''), 15000))])
      preparing.current = false
      if (runIdRef.current !== id) return // stopped meanwhile
    }
    const next: AiMessage[] = [...messages, dates ? { ...question, timing: dates } : question]
    if (dates) setMessages(next)
    setStatus(t('{p} yanıtlıyor…', { p: info.label }))
    const system = aiSystemPrompt(settings)
    window.astro.ai.start({
      id,
      provider,
      model: cfg.model || undefined,
      system,
      context: '',
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
      if (loadedKey.current === chatKey) void sendRef.current(inject.text)
      else timer = window.setTimeout(go, 80)
    }
    go()
    return () => window.clearTimeout(timer)
  }, [inject?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const stop = () => {
    if (!runId) return
    window.astro.ai.cancel(runId)
    // Still computing dates: nothing was sent yet, so no 'done' event will clear the run.
    if (preparing.current) {
      runIdRef.current = null
      setRunId(null)
      setStatus('')
      setStarted(0)
    }
  }

  const setProvider = (id: ProviderId) => onSettings({ ...settings, ai: { ...settings.ai, provider: id } })
  const setModel = (model: string) =>
    onSettings({ ...settings, ai: { ...settings.ai, providers: { ...settings.ai.providers, [provider]: { ...cfg, model } } } })
  const setLevel = (level: AiLevel) => onSettings({ ...settings, ai: { ...settings.ai, level } })

  return (
    <div className="chat">
      <div className="chat-top">
        <div className="chat-conn">
          <span className={`conn-dot ${st ? (st.available ? 'ok' : 'off') : 'wait'}`} aria-hidden />
          <select className="conn-provider" value={provider} onChange={(e) => setProvider(e.target.value as ProviderId)} aria-label={t('Yapay zekâ sağlayıcısı')}>
            {PROVIDERS.map((p) => {
              const s = statuses.find((x) => x.id === p.id)
              return (
                <option key={p.id} value={p.id}>
                  {t(p.label)}
                  {s && !s.available ? ` (${t('bağlı değil')})` : ''}
                </option>
              )
            })}
          </select>
          <span className="conn-sep" aria-hidden />
          <input className="conn-model" list="models" value={cfg.model} placeholder={t('model (varsayılan)')} onChange={(e) => setModel(e.target.value)} aria-label={t('Model')} title={cfg.model || t('model (varsayılan)')} />
          <datalist id="models">
            {models.map((m) => (
              <option key={m} value={m} />
            ))}
          </datalist>
        </div>
        {st && !st.available ? (
          <div className="chat-callout" role="status">
            <div className="chat-callout-msg">
              <span aria-hidden>⚠︎</span> {st.detail}
            </div>
            <div className="chat-callout-btns">
              {onOpenSettings && info.kind === 'api' && (
                <button className="primary" onClick={() => onOpenSettings(`ai:${provider}`)}>
                  {provider === 'local' ? t('Adres ve port') : t('API anahtarı gir')}
                </button>
              )}
              <button onClick={() => setGuide(true)}>{t('Nasıl bağlanırım?')}</button>
              <button className="ghost-icon" onClick={recheck} aria-label={t('Tekrar kontrol et')} title={t('Tekrar kontrol et')}>
                <Icon name="refresh" />
              </button>
            </div>
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
            <select value={stored ? session.id : ''} disabled={!!runId} onChange={(e) => switchSession(e.target.value)} title={`${t('Bu haritanın sohbet oturumları')} · ${t('{n} oturum', { n: sessions.length })}`}>
              {!stored && <option value="">{t('Yeni sohbet')}</option>}
              {sessions.map((x) => (
                <option key={x.id} value={x.id}>
                  {sessionLabel(x)}
                </option>
              ))}
            </select>
          )}
          <button className="ghost-icon" disabled={!!runId || !stored} title={t('Oturumun adını değiştir')} aria-label={t('Oturumun adını değiştir')} onClick={() => setRenaming(session.title)}>
            <Icon name="edit" />
          </button>
          <button className="ghost-icon" disabled={!!runId || !stored} title={t('Oturumu sil')} aria-label={t('Oturumu sil')} onClick={() => void deleteSession()}>
            <Icon name="trash" />
          </button>
          <button className="ghost-icon new" disabled={!!runId || !messages.length} onClick={newSession} title={t('Bu sohbet saklanır; yeni, boş bir oturum açılır')} aria-label={t('Yeni sohbet')}>
            <Icon name="plus" />
          </button>
        </div>
      </div>
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
        {settings.ai.level === 'amateur' && !runId && messages[messages.length - 1]?.role === 'assistant' && (
          <button className="quick-more" onClick={() => void send(t(MORE_DETAIL.prompt))}>
            {t(MORE_DETAIL.label)}
          </button>
        )}
        {(settings.ai.level === 'amateur' ? QUICK_AMATEUR : QUICK).filter((q) => !q.needs || layers.includes(q.needs)).map((q) => (
          <button key={q.label} disabled={!!runId} onClick={() => void send(t(q.prompt))}>
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
            {m.role === 'user' && m.context && (
              <div className="msg-tag" title={t('Bu soruyla ekrandaki haritanın verisi gönderildi; harita değişmedikçe sonraki sorularda yeniden gönderilmez.')}>
                {t('harita verisi eklendi')}
              </div>
            )}
            {m.role === 'assistant' &&
              settings.ai.level === 'amateur' &&
              i === messages.length - 1 &&
              !runId &&
              (() => {
                const c = checkAnswer(m.content, aiLanguageOf(settings))
                // A long answer is fine when the person asked for more detail.
                const askedDetail = messages[i - 1]?.content === t(MORE_DETAIL.prompt)
                if (!c || (!c.directive && askedDetail)) return null
                return (
                  <div className="answer-check small" role="note">
                    {c.directive
                      ? t('Bu yanıt yönlendirici bir ifade içeriyor ("{w}"); kararlar her zaman size aittir.', { w: c.directive })
                      : t('Bu yanıt Amatör düzey için uzun ({n} kelime).', { n: c.words })}{' '}
                    <button className="link small" onClick={() => void send(t(REWRITE))}>
                      {t('Kısalt ve yumuşat')}
                    </button>
                  </div>
                )
              })()}
            {m.role === 'assistant' && (
              <div className="msg-actions">
                {m.usage && (
                  <span
                    className="muted small msg-usage"
                    title={t('Sağlayıcının bildirdiği değerler: gönderilen token, bunun ne kadarının önbellekten okunduğu (daha hızlı ve ucuz) ve yanıtın uzunluğu.')}
                  >
                    {fmtK(m.usage.input)} {t('girdi')}
                    {m.usage.input > 0 ? ` · %${Math.round((m.usage.cached / m.usage.input) * 100)} ${t('önbellekten')}` : ''} · {fmtK(m.usage.output)} {t('çıktı')}
                  </span>
                )}
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
        {runId && started > 0 && (
          <div className="msg status">
            {status || t('Yanıt yazılıyor…')} <span className="muted">· {Math.round((Date.now() - started) / 1000)} {t('sn')}</span>
          </div>
        )}
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
        <div className="composer-box">
          <textarea
            rows={3}
            value={input}
            placeholder={t('Haritayla ilgili sorunuzu yazın… (Enter gönderir, Shift+Enter yeni satır)')}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                void send(input)
              }
            }}
          />
          <div className="composer-row">
            <label className={`chip-check${attach ? ' on' : ''}`} title={t('Harita verisini ekle')}>
              <input type="checkbox" checked={attach} onChange={(e) => setAttach(e.target.checked)} />
              <Icon name="wheel" size={14} />
              {t('Harita verisi')}
            </label>
            {knowledgeCount > 0 && (
              <label className={`chip-check${settings.ai.useKnowledge && attach ? ' on' : ''}`} title={t('Haritayla ve sorunuzla eşleşen bilgi bankası kayıtları da gönderilir')}>
                <input
                  type="checkbox"
                  checked={settings.ai.useKnowledge}
                  disabled={!attach}
                  onChange={(e) => onSettings({ ...settings, ai: { ...settings.ai, useKnowledge: e.target.checked } })}
                />
                <Icon name="book" size={14} />
                {t('Bilgi bankası')}
              </label>
            )}
            <button className="link small" onClick={() => setShowCtx(!showCtx)}>
              {showCtx ? t('Veriyi gizle') : t('Gönderilen veri')}
            </button>
            <span className="composer-actions">
              <span
                className="muted small token-meter"
                title={[
                  t('Gönder’e basınca gidecek yaklaşık veri: talimat, harita verisi, sohbet geçmişi ve sorunuz. Eski mesajlar kısaltılarak gönderilir; talimat ve geçmiş sağlayıcının önbelleğinden okunduğu için tekrar eden kısım daha hızlı ve ucuzdur.'),
                  nextSize.repeat > 0 ? t('≈ {n} tekrar (önbellek)', { n: fmtK(nextSize.repeat) }) : '',
                  nextSize.withChart ? `📎 ${t('harita verisiyle')}` : '',
                  nextSize.shortened > 0 ? t('{n} eski mesaj kısaltıldı', { n: nextSize.shortened }) : ''
                ]
                  .filter(Boolean)
                  .join('\n')}
              >
                ≈ {fmtK(nextSize.tokens)} {t('token')}
              </span>
              <select
                className="chat-level"
                value={settings.ai.level}
                onChange={(e) => setLevel(e.target.value as AiLevel)}
                title={t('Yanıt düzeyi: Amatör sade, gündelik bir dille; Profesyonel teknik terimler ve ayrıntıyla yanıtlar.')}
              >
                <option value="amateur">{t('Amatör')}</option>
                <option value="professional">{t('Profesyonel')}</option>
              </select>
              {runId ? (
                <button className="send-btn stop" onClick={stop} aria-label={t('■ Durdur')} title={t('■ Durdur')}>
                  <span className="stop-sq" aria-hidden />
                </button>
              ) : (
                <button className="send-btn primary" disabled={!input.trim()} onClick={() => void send(input)} aria-label={t('Gönder')} title={t('Gönder')}>
                  <Icon name="send" size={17} />
                </button>
              )}
            </span>
          </div>
        </div>
        <div className="ai-disclaimer">{t('Yapay zekâ yanıtları hata içerebilir; kişisel keşif amaçlıdır, kesin bilgi ya da profesyonel tavsiye değildir.')}</div>
        {showCtx && <pre className="ctx">{lastKb ? `${context}\n\n${lastKb}` : context}</pre>}
      </div>
    </div>
  )
}

