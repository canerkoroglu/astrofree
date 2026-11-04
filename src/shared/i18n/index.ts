// Language registry and the translate function shared by the main process
// and the renderer.
//
// Adding a language:
//   1. copy src/shared/i18n/en.ts to <code>.ts and translate every value
//      (keys are the Turkish source strings — leave them as they are);
//   2. import it below and add it to LOCALES;
//   3. run `npm run i18n:check` to list strings still missing.
import { en } from './en'
import { es } from './es'
import { tr } from './tr'
import type { DateOrder, Locale } from './types'

export type { DateOrder, Locale }

export const LOCALES: Locale[] = [tr, en, es]
export const SOURCE = tr

export function getLocale(code: string | undefined): Locale {
  return LOCALES.find((l) => l.code === code) ?? SOURCE
}

/** The system language if we have it, else English, else Turkish. */
export function pickLocale(preferred: readonly string[]): Locale {
  for (const p of preferred) {
    const code = p.toLowerCase().split('-')[0]
    const hit = LOCALES.find((l) => l.code === code)
    if (hit) return hit
  }
  return en
}

/** Translate a Turkish source string; `{name}` placeholders are filled from vars. */
export function translate(locale: Locale, s: string, vars?: Record<string, string | number>): string {
  let out = locale === SOURCE ? s : locale.strings[s] ?? s
  if (vars) for (const [k, v] of Object.entries(vars)) out = out.split(`{${k}}`).join(String(v))
  return out
}
