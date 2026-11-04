import { en } from './en'
import { es } from './es'
import { tr } from './tr'
import type { MeaningSet } from './types'

export type { MeaningSet }

const SETS: Record<string, MeaningSet> = { tr, en, es }

/** Built-in readings for a language; languages without their own set use English. */
export const meaningsFor = (code: string): MeaningSet => SETS[code] ?? en
