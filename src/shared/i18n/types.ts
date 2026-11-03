// A language for AstroFree. Turkish is the source language: every UI string
// is written in Turkish in the code and looked up in `strings` by that text.

export type DateOrder = 'DMY' | 'MDY' | 'YMD'

export interface Locale {
  /** BCP 47 code: 'tr', 'en', 'de', … */
  code: string
  /** Name of the language in itself: 'Türkçe', 'English', 'Deutsch'. */
  name: string
  /** Locale for Intl (country names, number formats). */
  intl: string
  /** Default date order for this language (the user can override it). */
  dateOrder: DateOrder
  /** UI strings keyed by the Turkish source text. Missing keys fall back to Turkish. */
  strings: Record<string, string>
  /** Point names [long, short] by key (sun, moon, …, asc, mc). */
  points: Record<string, [string, string]>
  /** Aries … Pisces */
  signs: string[]
  /** conjunction, opposition, … */
  aspects: Record<string, string>
  /** New Moon … Balsamic (8 phases) */
  phases: string[]
  monthsLong: string[]
  monthsShort: string[]
  /** Sunday … Saturday */
  weekdays: string[]
  /** Two-letter weekday heads, Monday first */
  weekdaysMin: string[]
  /** Elements and modalities: fire, earth, air, water, cardinal, fixed, mutable */
  elements: Record<'fire' | 'earth' | 'air' | 'water' | 'cardinal' | 'fixed' | 'mutable', string>
  /** Compass letters for coordinates: north, south, east, west. */
  compass: { n: string; s: string; e: string; w: string }
  /** Instructions for the AI interpreter in this language. */
  systemPrompt: string
}
