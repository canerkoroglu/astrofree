// A light check of a beginner-level answer against the rules the AI was given: about 150
// words, no instructions ("you should", "mutlaka"), tentative wording. Some models (especially
// small local ones) do not keep to the instructions; the chat then offers a one-click rewrite.
// Patterns are kept narrow: a false alarm costs the user a needless click.

// i18n-ignore-start (phrases matched in answers, per language)
const DIRECTIVE: Record<string, RegExp> = {
  tr: /\b(yapmalısınız|yapmalısın|etmelisiniz|etmelisin|almalısınız|almalısın|kaçınmalısınız|kaçınmalısın|mutlaka|kesinlikle|asla\s+\S+mayın|sakın)\b/iu,
  en: /\b(you should|you must|you need to|make sure (to|you)|definitely|be sure to)\b/iu,
  es: /\b(debes|deberías|tienes que|sin duda|asegúrate)\b/iu,
  pt: /\b(você deve|você precisa|tem que|com certeza|certifique-se)\b/iu,
  de: /\b(du solltest|sie sollten|du musst|sie müssen|unbedingt|auf jeden fall)\b/iu,
  fr: /\b(tu dois|vous devez|il faut absolument|absolument|assurez-vous|assure-toi)\b/iu,
  ru: /(тебе следует|вам следует|ты должен|вы должны|нужно обязательно|обязательно|ни в коем случае|избегай(те)?)/iu,
  hi: /(आपको चाहिए|तुम्हें चाहिए|ज़रूर करें|अवश्य|कभी मत|बिल्कुल)/u
}
// i18n-ignore-end

export const AMATEUR_MAX_WORDS = 260

export interface AnswerCheck {
  tooLong: boolean
  directive: string | null
  words: number
}

/** Words of an answer, without Markdown punctuation. */
export const countWords = (text: string) => text.replace(/[#*_`>|-]/g, ' ').split(/\s+/).filter(Boolean).length

export function checkAnswer(text: string, lang: string): AnswerCheck | null {
  const words = countWords(text)
  const m = (DIRECTIVE[lang] ?? DIRECTIVE.en).exec(text)
  const res = { tooLong: words > AMATEUR_MAX_WORDS, directive: m ? m[0] : null, words }
  return res.tooLong || res.directive ? res : null
}
