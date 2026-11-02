// Minimal i18n: Turkish source strings are the keys; English lives in en.ts.
import { EN } from './en'

let lang: 'tr' | 'en' = 'tr'

export function setLang(l: 'tr' | 'en'): void {
  lang = l
  document.documentElement.lang = l
}
export const getLang = () => lang

/** Translate a Turkish UI string; falls back to the source. */
export function t(s: string): string {
  if (lang === 'tr') return s
  return EN[s] ?? s
}

const MONTHS_LONG = {
  tr: ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'],
  en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
}
const MONTHS_SHORT = {
  tr: ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'],
  en: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
}
const WEEKDAYS = {
  tr: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
}
const DOW_MON_FIRST = { tr: ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'], en: ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'] }

export const monthsLong = () => MONTHS_LONG[lang]
export const monthsShort = () => MONTHS_SHORT[lang]
export const weekdays = () => WEEKDAYS[lang]
export const dowMonFirst = () => DOW_MON_FIRST[lang]
