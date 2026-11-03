// Main-process side of i18n: menus, dialogs, notifications and error texts
// follow the UI language chosen in settings.
import { getLocale, translate, type Locale } from '@shared/i18n'

let current: Locale = getLocale('tr')

export function setMainLang(code: string | undefined): void {
  current = getLocale(code)
}
export const mainLocale = () => current

/** Translate a Turkish source string for the current UI language. */
export const tm = (s: string, vars?: Record<string, string | number>) => translate(current, s, vars)
