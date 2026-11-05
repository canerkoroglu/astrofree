// Streaming chat over provider HTTP APIs (Anthropic, OpenAI-compatible incl. local servers, Gemini).
import { tm } from '../i18n'
import type { AiChatRequest, AiMessage, AiUsage, ProviderConfig } from '@shared/types'
import { questionWithContext } from '@shared/aiHistory'
import type { Emit } from './cli'

/** Yield the `data:` payload of each server-sent event in a fetch response. */
async function* sse(res: Response): AsyncGenerator<string> {
  if (!res.body) return
  const reader = res.body.getReader()
  const dec = new TextDecoder()
  let buf = ''
  for (;;) {
    const { value, done } = await reader.read()
    if (done) break
    buf += dec.decode(value, { stream: true }).replace(/\r\n/g, '\n')
    let sep: number
    while ((sep = buf.indexOf('\n\n')) >= 0) {
      const block = buf.slice(0, sep)
      buf = buf.slice(sep + 2)
      const data = block
        .split('\n')
        .filter((l) => l.startsWith('data:'))
        .map((l) => l.slice(5).trimStart())
        .join('\n')
      if (data) yield data
    }
  }
}

/** Plain-language advice for the HTTP errors people actually hit (wrong key, no credit, rate limit…). */
function httpHint(status: number, text: string, local: boolean): string | null {
  const t = text.toLowerCase()
  if (/location is not supported|unsupported_country|country, region, or territory/.test(t))
    return tm('Bu sağlayıcı bulunduğunuz ülkeden hizmet vermiyor. Başka bir sağlayıcı ya da yerel model deneyin.')
  if (status === 401 || /invalid[_ ]api[_ ]key|incorrect api key|api key not valid|authentication/.test(t))
    return local
      ? tm('Sunucu anahtar istiyor ya da anahtar yanlış (Ayarlar → Yapay zekâ → API anahtarı).')
      : tm('API anahtarı geçersiz. Anahtarı sağlayıcının sitesinden kopyalayıp yeniden girin; başında/sonunda boşluk kalmadığından emin olun.')
  if (status === 402 || /insufficient[_ ]balance|credit balance|insufficient_quota|billing|exceeded your current quota/.test(t))
    return tm('Hesapta bakiye ya da kota yok. API kullanımı, Claude Pro / ChatGPT Plus gibi aboneliklerden ayrı ücretlendirilir; sağlayıcının sitesinden ödeme yöntemi ekleyin veya kredi yükleyin.')
  if (status === 403)
    return tm('Bu anahtarın bu modele ya da hizmete erişim izni yok. Modeli değiştirin veya sağlayıcı panelinde anahtarın izinlerini kontrol edin.')
  if (status === 404)
    return local
      ? tm('Adres veya model adı yanlış olabilir (OpenAI uyumlu sunucularda adres genellikle /v1 ile biter).')
      : tm('Model bulunamadı. Model adını kontrol edin ya da boş bırakıp varsayılanı kullanın.')
  if (status === 429) return tm('İstek sınırına takıldınız (çok sık istek ya da dakikalık/günlük kota). Biraz bekleyip tekrar deneyin.')
  if (status === 529 || status === 503 || /overloaded/.test(t)) return tm('Sağlayıcının sunucuları şu an yoğun. Birkaç dakika sonra tekrar deneyin.')
  if (status >= 500) return tm('Sağlayıcı tarafında geçici bir hata oluştu. Biraz sonra tekrar deneyin.')
  return null
}

const isLocalUrl = (url: string) => {
  try {
    const h = new URL(url).hostname
    return /^(localhost|127\.|0\.0\.0\.0|\[?::1\]?$|10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(h) || h.endsWith('.local') || !h.includes('.')
  } catch {
    return false
  }
}

async function failIfBad(res: Response, label: string): Promise<void> {
  if (res.ok) return
  let msg = `${label} HTTP ${res.status}`
  let body = ''
  try {
    body = await res.text()
    const j = JSON.parse(body)
    msg += ': ' + (j.error?.message ?? j.message ?? body).toString().slice(0, 500)
  } catch {
    if (body && body.length < 300) msg += ': ' + body.trim()
  }
  const hint = httpHint(res.status, body, isLocalUrl(res.url))
  throw new Error(hint ? `${hint}\n(${msg})` : msg)
}

/** Chart data, cut to the configured size for small context windows. */
function contextOf(req: AiChatRequest, cfg: ProviderConfig): string {
  const c = req.context
  const limit = cfg.contextLimit ?? 0
  if (!c || !limit || c.length <= limit) return c
  return c.slice(0, limit) + '\n\n' + tm('[Veri {n} karakterde kesildi.]', { n: String(limit) })
}

/**
 * Messages with the chart data attached to the newest question. Instructions and
 * earlier messages stay byte-identical between requests, so providers can cache them.
 */
function messagesWithContext(req: AiChatRequest, cfg: ProviderConfig): AiMessage[] {
  const c = contextOf(req, cfg)
  const msgs = req.messages
  const last = msgs[msgs.length - 1]
  if (!last || last.role !== 'user') return msgs
  return [...msgs.slice(0, -1), { ...last, content: questionWithContext(last.content, c) }]
}

const trimSlash = (s: string) => s.replace(/\/+$/, '')

/** "Name: value" lines → header object (blank and malformed lines are ignored). */
export function parseHeaders(text = ''): Record<string, string> {
  const out: Record<string, string> = {}
  for (const line of text.split('\n')) {
    const i = line.indexOf(':')
    if (i <= 0) continue
    const k = line.slice(0, i).trim()
    const v = line.slice(i + 1).trim()
    if (/^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(k) && v) out[k] = v
  }
  return out
}

/** The caller's abort signal combined with the configured timeout. */
function withTimeout(signal: AbortSignal, cfg: ProviderConfig, fallbackSec: number): AbortSignal {
  const sec = cfg.timeoutSec && cfg.timeoutSec > 0 ? cfg.timeoutSec : fallbackSec
  return AbortSignal.any([signal, AbortSignal.timeout(sec * 1000)])
}

/** fetch() with readable errors for unreachable servers, proxies and timeouts. */
async function request(url: string, init: RequestInit & { signal: AbortSignal }, outer: AbortSignal): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    if (outer.aborted) throw e
    const err = e as Error & { cause?: { code?: string } }
    const local = isLocalUrl(url)
    if (err.name === 'TimeoutError') throw new Error(tm('Sunucu zamanında yanıt vermedi ({url}). Ayarlar → Gelişmiş bölümünden zaman aşımını artırabilirsiniz.', { url }))
    const code = err.cause?.code ?? ''
    if (/CERT|SELF_SIGNED|UNABLE_TO_VERIFY|ERR_TLS/.test(code)) {
      throw new Error(
        (local
          ? tm('Sunucunun güvenlik sertifikası doğrulanamadı: {url}. Kendi imzaladığınız bir sertifika kullanıyorsanız HTTPS yerine HTTP deneyin.', { url })
          : tm('Güvenli bağlantı kurulamadı: {url}. Şirket ağındaysanız bir proxy ya da güvenlik yazılımı bağlantıyı engelliyor olabilir.', { url })) + ` (${code})`
      )
    }
    if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ECONNRESET|EHOSTUNREACH|ENETUNREACH|ETIMEDOUT/.test(code) || /fetch failed/i.test(err.message)) {
      throw new Error(
        (local
          ? tm('Sunucuya bağlanılamadı: {url}. Sunucu çalışıyor mu, adres ve port doğru mu?', { url })
          : tm('{url} adresine ulaşılamadı. İnternet bağlantınızı kontrol edin; şirket ağında proxy ya da güvenlik duvarı engelliyor olabilir.', { url })) + (code ? ` (${code})` : '')
      )
    }
    throw e
  }
}

/** Removes <think>…</think> blocks from a token stream, even when tags are split across chunks. */
export function thinkFilter(emit: Emit): Emit & { flush: () => void } {
  let inside = false
  let carry = ''
  let announced = false
  const f = (e: Parameters<Emit>[0]) => {
    if (e.type !== 'delta') return emit(e)
    let text = carry + e.text
    carry = ''
    let out = ''
    while (text) {
      const tag = inside ? '</think>' : '<think>'
      const i = text.indexOf(tag)
      if (i >= 0) {
        if (!inside) {
          out += text.slice(0, i)
          if (!announced) {
            announced = true
            emit({ type: 'status', text: tm('Model düşünüyor…') })
          }
        }
        inside = !inside
        text = text.slice(i + tag.length)
        continue
      }
      // Keep a possible partial tag at the end for the next chunk.
      let keep = 0
      for (let n = Math.min(tag.length - 1, text.length); n > 0; n--) {
        if (tag.startsWith(text.slice(-n))) {
          keep = n
          break
        }
      }
      const body = text.slice(0, text.length - keep)
      if (!inside) out += body
      carry = text.slice(text.length - keep)
      text = ''
    }
    if (out) emit({ type: 'delta', text: out })
  }
  /** End of stream: a held-back partial tag was ordinary text after all. */
  const flush = () => {
    if (carry && !inside) emit({ type: 'delta', text: carry })
    carry = ''
  }
  return Object.assign(f, { flush })
}

async function anthropic(req: AiChatRequest, cfg: ProviderConfig, key: string, emit: Emit, signal: AbortSignal) {
  const url = `${trimSlash(cfg.baseUrl || 'https://api.anthropic.com')}/v1/messages`
  const res = await request(
    url,
    {
      method: 'POST',
      signal: withTimeout(signal, cfg, 180),
      headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
      body: JSON.stringify({
        model: req.model || cfg.model,
        max_tokens: cfg.maxTokens || 16000,
        ...(cfg.temperature !== undefined ? { temperature: cfg.temperature } : {}),
        stream: true,
        // Cache breakpoints: the instructions, and the history up to the message before the new question.
        system: [{ type: 'text', text: req.system, cache_control: { type: 'ephemeral' } }],
        messages: messagesWithContext(req, cfg).map((m, i, all) =>
          i === all.length - 2
            ? { role: m.role, content: [{ type: 'text', text: m.content, cache_control: { type: 'ephemeral' } }] }
            : { role: m.role, content: m.content }
        )
      })
    },
    signal
  )
  await failIfBad(res, 'Anthropic')
  const usage: AiUsage = { input: 0, cached: 0, output: 0 }
  for await (const data of sse(res)) {
    const o = JSON.parse(data)
    if (o.type === 'content_block_delta' && o.delta?.type === 'text_delta') emit({ type: 'delta', text: o.delta.text })
    else if (o.type === 'message_start' && o.message?.usage) {
      const u = o.message.usage
      usage.cached = Number(u.cache_read_input_tokens ?? 0)
      usage.input = Number(u.input_tokens ?? 0) + Number(u.cache_creation_input_tokens ?? 0) + usage.cached
    } else if (o.type === 'message_delta' && o.usage) usage.output = Number(o.usage.output_tokens ?? 0)
    else if (o.type === 'error') throw new Error(o.error?.message ?? tm('Anthropic hatası'))
  }
  if (usage.input) emit({ type: 'usage', usage })
}

async function openaiCompatible(
  req: AiChatRequest,
  cfg: ProviderConfig,
  key: string | null,
  emit: Emit,
  signal: AbortSignal,
  fallbackBase: string,
  label: string
) {
  const base = trimSlash(cfg.baseUrl || fallbackBase)
  if (!base) throw new Error(tm('Sunucu adresi girilmemiş (Ayarlar → Yapay zekâ).'))
  const url = `${base}/chat/completions`
  const res = await request(
    url,
    {
      method: 'POST',
      signal: withTimeout(signal, cfg, req.provider === 'local' ? 300 : 180),
      headers: {
        'content-type': 'application/json',
        ...(key ? { authorization: `Bearer ${key}` } : {}),
        ...parseHeaders(cfg.headers)
      },
      body: JSON.stringify({
        model: req.model || cfg.model,
        stream: true,
        ...(cfg.temperature !== undefined ? { temperature: cfg.temperature } : {}),
        ...(cfg.maxTokens ? { max_tokens: cfg.maxTokens } : {}),
        // Token counts (incl. cache hits) in the last chunk; local servers get no unknown fields.
        ...(req.provider !== 'local' ? { stream_options: { include_usage: true } } : {}),
        messages: [{ role: 'system', content: req.system }, ...messagesWithContext(req, cfg)]
      })
    },
    signal
  )
  await failIfBad(res, label)
  const filter = cfg.hideThinking ? thinkFilter(emit) : null
  const out = filter ?? emit
  let thinking = false
  for await (const data of sse(res)) {
    if (data === '[DONE]') break
    const o = JSON.parse(data)
    if (o.error) throw new Error(o.error.message ?? tm('API hatası'))
    if (o.usage?.prompt_tokens) {
      const u = o.usage
      const cached = Number(u.prompt_tokens_details?.cached_tokens ?? u.prompt_cache_hit_tokens ?? 0)
      emit({ type: 'usage', usage: { input: Number(u.prompt_tokens), cached, output: Number(u.completion_tokens ?? 0) } })
    }
    const delta = o.choices?.[0]?.delta
    if ((delta?.reasoning_content || delta?.reasoning) && !thinking) {
      thinking = true
      emit({ type: 'status', text: tm('Model düşünüyor…') })
    }
    if (delta?.content) out({ type: 'delta', text: delta.content })
  }
  filter?.flush()
}

async function gemini(req: AiChatRequest, cfg: ProviderConfig, key: string, emit: Emit, signal: AbortSignal) {
  const base = trimSlash(cfg.baseUrl || 'https://generativelanguage.googleapis.com/v1beta')
  const model = req.model || cfg.model
  const url = `${base}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`
  const generationConfig = {
    ...(cfg.temperature !== undefined ? { temperature: cfg.temperature } : {}),
    ...(cfg.maxTokens ? { maxOutputTokens: cfg.maxTokens } : {})
  }
  const res = await request(
    url,
    {
      method: 'POST',
      signal: withTimeout(signal, cfg, 180),
      headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: req.system }] },
        contents: messagesWithContext(req, cfg).map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        ...(Object.keys(generationConfig).length ? { generationConfig } : {})
      })
    },
    signal
  )
  await failIfBad(res, 'Gemini')
  let gUsage: any = null
  for await (const data of sse(res)) {
    const o = JSON.parse(data)
    if (o.error) throw new Error(o.error.message ?? tm('Gemini hatası'))
    if (o.usageMetadata?.promptTokenCount) gUsage = o.usageMetadata
    for (const part of o.candidates?.[0]?.content?.parts ?? []) {
      if (part.text && !part.thought) emit({ type: 'delta', text: part.text })
    }
  }
  if (gUsage) emit({ type: 'usage', usage: { input: Number(gUsage.promptTokenCount), cached: Number(gUsage.cachedContentTokenCount ?? 0), output: Number(gUsage.candidatesTokenCount ?? 0) } })
}

/** Model ids an OpenAI-compatible server offers (GET /models). */
export async function listModels(baseUrl: string, key: string | null, headers = ''): Promise<string[]> {
  const base = trimSlash(baseUrl)
  if (!base) throw new Error(tm('Sunucu adresi girilmemiş (Ayarlar → Yapay zekâ).'))
  const url = `${base}/models`
  const ctrl = new AbortController()
  const res = await request(
    url,
    {
      signal: AbortSignal.any([ctrl.signal, AbortSignal.timeout(5000)]),
      headers: { ...(key ? { authorization: `Bearer ${key}` } : {}), ...parseHeaders(headers) }
    },
    ctrl.signal
  )
  await failIfBad(res, tm('Sunucu'))
  const j = (await res.json()) as { data?: { id?: string }[]; models?: { name?: string; model?: string }[] }
  const ids = (j.data ?? []).map((m) => m.id).concat((j.models ?? []).map((m) => m.model ?? m.name))
  return [...new Set(ids.filter((x): x is string => !!x))].sort((a, b) => a.localeCompare(b))
}

export async function runApi(
  req: AiChatRequest,
  cfg: ProviderConfig,
  key: string | null,
  emit: Emit,
  signal: AbortSignal
): Promise<void> {
  if (!key && req.provider !== 'local') throw new Error(tm('Bu sağlayıcı için API anahtarı girilmemiş (Ayarlar → Yapay zekâ).'))
  switch (req.provider) {
    case 'anthropic':
      return anthropic(req, cfg, key!, emit, signal)
    case 'openai':
      return openaiCompatible(req, cfg, key, emit, signal, 'https://api.openai.com/v1', 'OpenAI')
    case 'deepseek':
      return openaiCompatible(req, cfg, key, emit, signal, 'https://api.deepseek.com', 'DeepSeek')
    case 'local':
      if (!(req.model || cfg.model)) throw new Error(tm('Yerel sunucu için model seçilmemiş. Ayarlar → Yapay zekâ → "Modelleri getir" ile seçin.'))
      return openaiCompatible(req, cfg, key, emit, signal, '', tm('Yerel sunucu'))
    case 'gemini':
      return gemini(req, cfg, key!, emit, signal)
    default:
      throw new Error(tm('Bilinmeyen sağlayıcı: {p}', { p: req.provider }))
  }
}

/** Check an API key by listing the provider's models (no tokens are spent). */
export async function testApiKey(provider: string, cfg: ProviderConfig, key: string): Promise<string[]> {
  const ctrl = new AbortController()
  const signal = AbortSignal.any([ctrl.signal, AbortSignal.timeout(10000)])
  let url: string
  let headers: Record<string, string>
  let label: string
  if (provider === 'anthropic') {
    url = `${trimSlash(cfg.baseUrl || 'https://api.anthropic.com')}/v1/models?limit=100`
    headers = { 'x-api-key': key, 'anthropic-version': '2023-06-01' }
    label = 'Anthropic'
  } else if (provider === 'gemini') {
    url = `${trimSlash(cfg.baseUrl || 'https://generativelanguage.googleapis.com/v1beta')}/models?pageSize=200`
    headers = { 'x-goog-api-key': key }
    label = 'Gemini'
  } else {
    const base = trimSlash(cfg.baseUrl || (provider === 'deepseek' ? 'https://api.deepseek.com' : 'https://api.openai.com/v1'))
    url = `${base}/models`
    headers = { authorization: `Bearer ${key}`, ...parseHeaders(cfg.headers) }
    label = provider === 'deepseek' ? 'DeepSeek' : 'OpenAI'
  }
  const res = await request(url, { signal, headers }, ctrl.signal)
  await failIfBad(res, label)
  const j = (await res.json()) as { data?: { id?: string }[]; models?: { name?: string; supportedGenerationMethods?: string[] }[] }
  const ids =
    provider === 'gemini'
      ? (j.models ?? []).filter((m) => !m.supportedGenerationMethods || m.supportedGenerationMethods.includes('generateContent')).map((m) => m.name?.replace(/^models\//, ''))
      : (j.data ?? []).map((m) => m.id)
  const chat = ids.filter((x): x is string => !!x && (provider !== 'openai' || /^(gpt|o\d|chatgpt)/.test(x)) && !/embed|tts|whisper|dall-e|image|audio|realtime|moderation|transcribe/i.test(x))
  return [...new Set(chat)].sort((a, b) => b.localeCompare(a))
}
