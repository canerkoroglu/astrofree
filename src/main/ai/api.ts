// Streaming chat over provider HTTP APIs (Anthropic, OpenAI-compatible incl. local servers, Gemini).
import { tm } from '../i18n'
import type { AiChatRequest, ProviderConfig } from '@shared/types'
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

async function failIfBad(res: Response, label: string): Promise<void> {
  if (res.ok) return
  let msg = `${label} HTTP ${res.status}`
  try {
    const body = await res.text()
    const j = JSON.parse(body)
    msg += ': ' + (j.error?.message ?? j.message ?? body).toString().slice(0, 500)
  } catch {
    /* keep status only */
  }
  if (res.status === 404) msg += '\n' + tm('Adres veya model adı yanlış olabilir (OpenAI uyumlu sunucularda adres genellikle /v1 ile biter).')
  throw new Error(msg)
}

/** Chart data, cut to the configured size for small context windows. */
function contextOf(req: AiChatRequest, cfg: ProviderConfig): string {
  const c = req.context
  const limit = cfg.contextLimit ?? 0
  if (!c || !limit || c.length <= limit) return c
  return c.slice(0, limit) + '\n\n' + tm('[Veri {n} karakterde kesildi.]', { n: String(limit) })
}

const systemWithContext = (req: AiChatRequest, cfg: ProviderConfig) => {
  const c = contextOf(req, cfg)
  return c ? `${req.system}\n\n<chart_data>\n${c}\n</chart_data>` : req.system
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

/** fetch() with readable errors for unreachable servers and timeouts. */
async function request(url: string, init: RequestInit & { signal: AbortSignal }, outer: AbortSignal): Promise<Response> {
  try {
    return await fetch(url, init)
  } catch (e) {
    if (outer.aborted) throw e
    const err = e as Error & { cause?: { code?: string } }
    if (err.name === 'TimeoutError') throw new Error(tm('Sunucu zamanında yanıt vermedi ({url}). Ayarlar → Gelişmiş bölümünden zaman aşımını artırabilirsiniz.', { url }))
    const code = err.cause?.code ?? ''
    if (/ECONNREFUSED|ENOTFOUND|EAI_AGAIN|ECONNRESET|EHOSTUNREACH/.test(code) || /fetch failed/i.test(err.message)) {
      throw new Error(tm('Sunucuya bağlanılamadı: {url}. Sunucu çalışıyor mu, adres ve port doğru mu?', { url }) + (code ? ` (${code})` : ''))
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
        system: systemWithContext(req, cfg),
        messages: req.messages.map((m) => ({ role: m.role, content: m.content }))
      })
    },
    signal
  )
  await failIfBad(res, 'Anthropic')
  for await (const data of sse(res)) {
    const o = JSON.parse(data)
    if (o.type === 'content_block_delta' && o.delta?.type === 'text_delta') emit({ type: 'delta', text: o.delta.text })
    else if (o.type === 'error') throw new Error(o.error?.message ?? tm('Anthropic hatası'))
  }
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
        messages: [{ role: 'system', content: systemWithContext(req, cfg) }, ...req.messages]
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
        systemInstruction: { parts: [{ text: systemWithContext(req, cfg) }] },
        contents: req.messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] })),
        ...(Object.keys(generationConfig).length ? { generationConfig } : {})
      })
    },
    signal
  )
  await failIfBad(res, 'Gemini')
  for await (const data of sse(res)) {
    const o = JSON.parse(data)
    if (o.error) throw new Error(o.error.message ?? tm('Gemini hatası'))
    for (const part of o.candidates?.[0]?.content?.parts ?? []) {
      if (part.text && !part.thought) emit({ type: 'delta', text: part.text })
    }
  }
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
