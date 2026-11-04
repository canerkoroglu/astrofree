// Built-in astrology glossary shown in the knowledge base. One list per
// language; languages without their own list use English.
import { glossaryEn } from './glossary-en'
import { glossaryTr } from './glossary-tr'

export interface GlossaryGroup {
  title: string
  /** [term, definition] */
  terms: [string, string][]
}

const SETS: Record<string, GlossaryGroup[]> = { tr: glossaryTr, en: glossaryEn }

export const glossaryFor = (code: string): GlossaryGroup[] => SETS[code] ?? glossaryEn
