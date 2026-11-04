// Built-in, offline interpretation texts. They give every user a basic
// reading without an AI provider. One file per language; missing languages
// fall back to English.
//
// Sentences are composed from parts, so each part must read well in the
// template it is used in. Never state anything about the person as certain:
// use "-abilir/-ebilir, olabilir" / "may, can, might". Templates (see src/renderer/src/lib/meanings.ts):
//   sign:   "{planet.what} {sign.how}."
//   house:  "{planet.subject} {house.where}."

export interface PlanetMeaning {
  /** One or two words: "kimlik, irade" */
  keywords: string
  /** Object of the sign sentence, e.g. "Kimliğinizi ve yaşam enerjinizi" / "You may express your identity and vitality" */
  what: string
  /** Subject of the house sentence, e.g. "Kimliğiniz ve yaşam enerjiniz" / "Your identity and vitality" */
  subject: string
  /** What the planet means, one sentence (glossary). */
  about: string
}

export interface SignMeaning {
  keywords: string
  /** Completes the sign sentence: "cesur, doğrudan ve girişken bir tavırla ortaya koyabilirsiniz" / "boldly, directly and with initiative" */
  how: string
  about: string
}

export interface HouseMeaning {
  keywords: string
  /** Completes the house sentence: "en çok para … konularında kendini gösterebilir" */
  where: string
  about: string
}

export interface MeaningSet {
  planets: Record<string, PlanetMeaning>
  signs: SignMeaning[]
  houses: HouseMeaning[]
  aspects: Record<string, string>
  /** Hand-written texts for the most read placements, by sign index. */
  sunSign: string[]
  moonSign: string[]
  ascSign: string[]
  /** Element emphasis: [strong, weak] per element. */
  elements: Record<'fire' | 'earth' | 'air' | 'water', [string, string]>
  retro: string
  glossary: [string, string][]
  /** Shown under every built-in reading. */
  disclaimer: string
}
