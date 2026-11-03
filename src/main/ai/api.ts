// Streaming chat over provider HTTP APIs (Anthropic, OpenAI-compatible, Gemini).
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
  throw new Error(msg)
}

const systemWithContext = (req: AiChatRequest) =>
  req.context ? `${req.system}\n\n<chart_data>\n${req.context}\n</chart_data>` : req.system

const trimSlash = (s: string) => s.replace(/\/+$/, '')

async function anthropic(req: AiChatRequest, cfg: ProviderConfig, key: string, emit: Emit, signal: AbortSignal) {
  const res = await fetch(`${trimSlash(cfg.baseUrl || 'https://api.anthropic.com')}/v1/messages`, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', 'x-api-key': key, 'anthropic-version': '2023-06-01' },
    body: JSON.stringify({
      model: req.model || cfg.model,
      max_tokens: 16000,
      stream: true,
      system: systemWithContext(req),
      messages: req.messages.map((m) => ({ role: m.role, content: m.content }))
    })
  })
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
  key: string,
  emit: Emit,
  signal: AbortSignal,
  fallbackBase: string
) {
  const res = await fetch(`${trimSlash(cfg.baseUrl || fallbackBase)}/chat/completions`, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', authorization: `Bearer ${key}` },
    body: JSON.stringify({
      model: req.model || cfg.model,
      stream: true,
      messages: [{ role: 'system', content: systemWithContext(req) }, ...req.messages]
    })
  })
  await failIfBad(res, req.provider === 'deepseek' ? 'DeepSeek' : 'OpenAI')
  let thinking = false
  for await (const data of sse(res)) {
    if (data === '[DONE]') break
    const o = JSON.parse(data)
    if (o.error) throw new Error(o.error.message ?? tm('API hatası'))
    const delta = o.choices?.[0]?.delta
    if (delta?.reasoning_content && !thinking) {
      thinking = true
      emit({ type: 'status', text: tm('Model düşünüyor…') })
    }
    if (delta?.content) emit({ type: 'delta', text: delta.content })
  }
}

async function gemini(req: AiChatRequest, cfg: ProviderConfig, key: string, emit: Emit, signal: AbortSignal) {
  const base = trimSlash(cfg.baseUrl || 'https://generativelanguage.googleapis.com/v1beta')
  const model = req.model || cfg.model
  const res = await fetch(`${base}/models/${encodeURIComponent(model)}:streamGenerateContent?alt=sse`, {
    method: 'POST',
    signal,
    headers: { 'content-type': 'application/json', 'x-goog-api-key': key },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: systemWithContext(req) }] },
      contents: req.messages.map((m) => ({ role: m.role === 'assistant' ? 'model' : 'user', parts: [{ text: m.content }] }))
    })
  })
  await failIfBad(res, 'Gemini')
  for await (const data of sse(res)) {
    const o = JSON.parse(data)
    if (o.error) throw new Error(o.error.message ?? tm('Gemini hatası'))
    for (const part of o.candidates?.[0]?.content?.parts ?? []) {
      if (part.text && !part.thought) emit({ type: 'delta', text: part.text })
    }
  }
}

export async function runApi(
  req: AiChatRequest,
  cfg: ProviderConfig,
  key: string | null,
  emit: Emit,
  signal: AbortSignal
): Promise<void> {
  if (!key) throw new Error(tm('Bu sağlayıcı için API anahtarı girilmemiş (Ayarlar → Yapay Zekâ).'))
  switch (req.provider) {
    case 'anthropic':
      return anthropic(req, cfg, key, emit, signal)
    case 'openai':
      return openaiCompatible(req, cfg, key, emit, signal, 'https://api.openai.com/v1')
    case 'deepseek':
      return openaiCompatible(req, cfg, key, emit, signal, 'https://api.deepseek.com')
    case 'gemini':
      return gemini(req, cfg, key, emit, signal)
    default:
      throw new Error(tm('Bilinmeyen sağlayıcı: {p}', { p: req.provider }))
  }
}
