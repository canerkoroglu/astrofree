// How a conversation is sent to the AI, shared by the main process (which
// sends it) and the chat panel (which shows its size).
//
// - The last KEEP_FULL messages go as they are; older ones are shortened
//   (questions to ~400 characters, answers to their first ~600), so a long
//   chat stops growing without bound.
// - The chart data is attached to the newest question, after the history.
//   The instructions and earlier messages then form a prefix that stays the
//   same from one request to the next, which providers cache (cheaper and
//   faster); only the changing chart data and the new question are new.
import type { AiMessage } from './types'

export const KEEP_FULL = 12
const OLD_QUESTION = 400
const OLD_ANSWER = 600

function shorten(text: string, max: number): string {
  if (text.length <= max) return text
  // Cut at a paragraph or sentence end near the limit when there is one.
  const cut = text.slice(0, max)
  const at = Math.max(cut.lastIndexOf('\n\n'), cut.lastIndexOf('. '))
  return (at > max * 0.5 ? cut.slice(0, at + 1) : cut).trimEnd() + ' […]'
}

/** The conversation as sent: old messages shortened, the newest KEEP_FULL kept whole. */
export function compactHistory(messages: AiMessage[]): { messages: AiMessage[]; shortened: number } {
  const cut = Math.max(0, messages.length - KEEP_FULL)
  let shortened = 0
  const out = messages.map((m, i) => {
    if (i >= cut) return m
    const content = shorten(m.content, m.role === 'user' ? OLD_QUESTION : OLD_ANSWER)
    if (content !== m.content) shortened++
    return { ...m, content }
  })
  return { messages: out, shortened }
}

/** The newest question with the chart data in front of it. */
export const questionWithContext = (question: string, context: string) =>
  context ? `<chart_data>\n${context}\n</chart_data>\n\n${question}` : question

/** Rough token count (Turkish and English text average ~3.5 characters a token). */
export const estimateTokens = (chars: number) => Math.ceil(chars / 3.5)

/** Approximate size of the next request in tokens. */
export function requestTokens(system: string, context: string, messages: AiMessage[]): number {
  const { messages: sent } = compactHistory(messages)
  return estimateTokens(system.length + context.length + sent.reduce((n, m) => n + m.content.length + 12, 0))
}
