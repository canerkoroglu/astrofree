// Renderer side of i18n: the current locale plus helpers. The registry and
// the language files live in src/shared/i18n.
import { getLocale, translate, type DateOrder, type Locale } from '@shared/i18n'
import { setDateOrder } from './time'

let locale: Locale = getLocale('tr')

/** Switch language; a date order of 'auto' (or none) follows the language. */
export function setLang(code: string, order?: DateOrder | 'auto'): void {
  locale = getLocale(code)
  setDateOrder(!order || order === 'auto' ? locale.dateOrder : order)
  document.documentElement.lang = locale.code
}
export const getLang = () => locale.code
export const getLocaleData = () => locale

/** Translate a Turkish UI string; `{name}` placeholders come from vars. */
export function t(s: string, vars?: Record<string, string | number>): string {
  return translate(locale, s, vars)
}

export const monthsLong = () => locale.monthsLong
export const monthsShort = () => locale.monthsShort
export const weekdays = () => locale.weekdays
export const dowMonFirst = () => locale.weekdaysMin
