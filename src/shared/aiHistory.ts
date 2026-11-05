// How a conversation is sent to the AI, shared by the main process (which
// sends it) and the chat panel (which shows its size).
//
// Built so that each request starts with exactly the same text as the one
// before it, which every provider caches (faster, and cached input is billed
// at a fraction of the price):
// - Chart data travels on the question it was sent with and stays there. It is
//   attached again only when it changed (time moved, another layer), so
//   follow-up questions about the same chart reuse the cached copy.
// - Only the newest chart data is sent in full; older copies are replaced by a
//   short note (they describe a moment that is no longer on screen).
// - The last KEEP_FULL messages go as they are; older ones are shortened
//   (questions to ~400 characters, answers to their first ~600), so a long chat
//   stops growing without bound.
import type { AiMessage } from './types'

export const KEEP_FULL = 12
const OLD_QUESTION = 400
const OLD_ANSWER = 600
const DETACHED_NOTE = '[Chart data was attached to this message; the current data is in <chart_data> in the system prompt.]'
const OLD_CONTEXT_NOTE = '[Chart data for an earlier moment was sent here; the current data is attached to a later message.]'

function shorten(text: string, max: number): string {
  if (text.length <= max) return text
  // Cut at a paragraph or sentence end near the limit when there is one.
  const cut = text.slice(0, max)
  const at = Math.max(cut.lastIndexOf('\n\n'), cut.lastIndexOf('. '))
  return (at > max * 0.5 ? cut.slice(0, at + 1) : cut).trimEnd() + ' […]'
}

/** The newest question with chart data in front of it. */
export const questionWithContext = (question: string, context: string) =>
  context ? `<chart_data>\n${context}\n</chart_data>\n\n${question}` : question

/**
 * The conversation exactly as sent: plain role/content messages.
 * `extraContext` (rarely used) is attached to the newest question.
 */
export function buildConversation(
  messages: AiMessage[],
  extraContext = '',
  /** Leave chart data out of the messages and return the newest copy separately (Claude Code puts it in its system prompt). */
  detach = false
): { messages: AiMessage[]; shortened: number; context: string } {
  const cut = Math.max(0, messages.length - KEEP_FULL)
  let newestCtx = -1
  messages.forEach((m, i) => {
    if (m.role === 'user' && m.context) newestCtx = i
  })
  let shortened = 0
  const out = messages.map((m, i): AiMessage => {
    let content = m.content
    if (i < cut) {
      const s = shorten(content, m.role === 'user' ? OLD_QUESTION : OLD_ANSWER)
      if (s !== content) shortened++
      content = s
    }
    if (m.role !== 'user') return { role: m.role, content }
    const parts: string[] = []
    if (detach && m.context) parts.push(DETACHED_NOTE)
    else if (i === newestCtx) parts.push(`<chart_data>\n${m.context}\n</chart_data>`)
    else if (m.context) parts.push(OLD_CONTEXT_NOTE)
    if (m.knowledge && i >= cut) parts.push(m.knowledge)
    if (i === messages.length - 1 && extraContext && !detach) parts.push(`<chart_data>\n${extraContext}\n</chart_data>`)
    parts.push(content)
    return { role: 'user', content: parts.join('\n\n') }
  })
  const context = detach ? [newestCtx >= 0 ? messages[newestCtx].context! : '', extraContext].filter(Boolean).join('\n\n') : ''
  return { messages: out, shortened, context }
}

/** Chart data most recently sent in this conversation ('' if none). */
export function lastSentContext(messages: AiMessage[]): string {
  for (let i = messages.length - 1; i >= 0; i--) if (messages[i].role === 'user' && messages[i].context) return messages[i].context!
  return ''
}

/** Rough token count (Turkish and English text average ~3.5 characters a token). */
export const estimateTokens = (chars: number) => Math.ceil(chars / 3.5)

/** Approximate size of a request in tokens. */
export function requestTokens(system: string, messages: AiMessage[]): number {
  const { messages: sent } = buildConversation(messages)
  return estimateTokens(system.length + sent.reduce((n, m) => n + m.content.length + 12, 0))
}
