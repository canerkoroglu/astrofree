// Chart groups for the sidebar ("Aile", "Danışanlar"…). Presets are stored by
// id so they follow the interface language; anything else is the user's text.
import type { ChartRecord } from '@shared/types'
import { t } from './i18n'

// i18n-ignore-start (labels go through t() where shown)
export const GROUP_PRESETS: [string, string][] = [
  ['family', 'Aile'],
  ['friends', 'Arkadaşlar'],
  ['clients', 'Danışanlar'],
  ['famous', 'Ünlüler'],
  ['work', 'İş']
]
// i18n-ignore-end

export const groupLabel = (g: string) => {
  const p = GROUP_PRESETS.find(([id]) => id === g)
  return p ? t(p[1]) : g
}

/** Groups in use besides the presets, alphabetical. */
export const customGroups = (charts: ChartRecord[]) =>
  [...new Set(charts.map((c) => c.group).filter((g): g is string => !!g && !GROUP_PRESETS.some(([id]) => id === g)))].sort((a, b) =>
    a.localeCompare(b)
  )
