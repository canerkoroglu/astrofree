// Kinds of life event in "Olaylarım" (also used by the birth-time check).
import type { JournalCategory } from '@shared/types'

// i18n-ignore-start (labels go through t() where shown)
export const JOURNAL_CATEGORIES: [JournalCategory, string, string][] = [
  ['relationship', 'İlişki / evlilik', '💞'],
  ['career', 'İş / kariyer', '💼'],
  ['home', 'Ev / taşınma', '🏠'],
  ['family', 'Aile (doğum, ebeveyn)', '👪'],
  ['health', 'Sağlık / kaza', '🩺'],
  ['loss', 'Kayıp / yas', '🕯️'],
  ['education', 'Eğitim', '🎓'],
  ['travel', 'Yolculuk / yurt dışı', '✈️'],
  ['other', 'Diğer', '•']
]
// i18n-ignore-end

export const categoryIcon = (c?: JournalCategory) => JOURNAL_CATEGORIES.find(([k]) => k === c)?.[2] ?? ''
export const categoryLabel = (c?: JournalCategory) => JOURNAL_CATEGORIES.find(([k]) => k === c)?.[1] ?? ''
