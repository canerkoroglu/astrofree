import type { AppSettings, AspectKey, AspectSetting, ProviderId } from './types'

export const PROVIDERS: {
  id: ProviderId
  label: string
  kind: 'cli' | 'api'
  hint: string
  models: string[]
}[] = [
  {
    id: 'claude-code',
    label: 'Claude Code (CLI)',
    kind: 'cli',
    hint: 'Yerel `claude` komutunu kullanır; Claude aboneliğinizle çalışır.',
    models: ['', 'opus', 'sonnet', 'haiku', 'claude-opus-5-5', 'claude-sonnet-5-5', 'claude-fable-5-1']
  },
  {
    id: 'codex',
    label: 'Codex (CLI)',
    kind: 'cli',
    hint: 'Yerel `codex exec` komutunu kullanır; ChatGPT/OpenAI hesabınızla çalışır.',
    models: [''] // filled at runtime from ~/.codex/models_cache.json
  },
  {
    id: 'gemini-cli',
    label: 'Gemini (CLI)',
    kind: 'cli',
    hint: 'Yerel `gemini` komutunu kullanır. İlk kullanımdan önce terminalde `gemini` ile giriş yapın.',
    models: ['', 'gemini-2.5-pro', 'gemini-2.5-flash']
  },
  {
    id: 'anthropic',
    label: 'Claude API',
    kind: 'api',
    hint: 'Anthropic API anahtarı gerekir (console.anthropic.com).',
    models: ['claude-opus-5-5', 'claude-sonnet-5-5', 'claude-haiku-5-5', 'claude-fable-5-1']
  },
  {
    id: 'openai',
    label: 'OpenAI API',
    kind: 'api',
    hint: 'OpenAI API anahtarı gerekir. Base URL ile OpenAI uyumlu başka sunucular da kullanılabilir.',
    models: ['gpt-5.5', 'gpt-5', 'gpt-5-mini']
  },
  {
    id: 'gemini',
    label: 'Gemini API',
    kind: 'api',
    hint: 'Google AI Studio API anahtarı gerekir.',
    models: ['gemini-2.5-pro', 'gemini-2.5-flash']
  },
  {
    id: 'deepseek',
    label: 'DeepSeek API',
    kind: 'api',
    hint: 'DeepSeek API anahtarı gerekir (platform.deepseek.com).',
    models: ['deepseek-chat', 'deepseek-reasoner']
  }
]

export const SYSTEM_PROMPT_TR = `Sen deneyimli, psikolojik ve geleneksel tekniklere hâkim bir astrologsun.
Kullanıcıya verilen harita verilerini (gezegen konumları, evler, açılar, transitler, progresyonlar) temel alarak yorum yaparsın.
Kurallar:
- Yalnızca sağlanan verilere dayan; veride olmayan konum veya açı uydurma. Hesaplama gerekiyorsa verilen sayıları kullan.
- Önce en güçlü temaları (sıkı orb'lu açılar, köşe evlerdeki gezegenler, yöneticiler) öne çıkar, sonra ayrıntıya in.
- Transitlerde yaklaşan/ayrılan bilgisini ve orb'u dikkate alarak zamanlama hakkında konuş.
- Kesin kehanet yerine eğilim ve potansiyel dilini kullan; sağlık, hukuk ve finans konularında profesyonel desteğe yönlendir.
- Başlıklar ve maddelerle düzenli, okunaklı Markdown kullan.
- Türkçe yanıt ver.`

export const SYSTEM_PROMPT_EN = `You are an experienced astrologer fluent in both psychological and traditional techniques.
You interpret the chart data the user provides (planet positions, houses, aspects, transits, progressions).
Rules:
- Rely only on the data provided; never invent positions or aspects. Use the given numbers when calculation is needed.
- Lead with the strongest themes (tight aspects, angular planets, rulers), then go into detail.
- For transits, use the applying/separating flag and orb to talk about timing.
- Use the language of tendencies and potential rather than certain prediction; refer health, legal and financial questions to professionals.
- Use tidy, readable Markdown with headings and bullet points.
- Answer in English.`

function asp(enabled: boolean, orb: number, outerOrb: number): AspectSetting {
  return { enabled, orb, outerOrb }
}

export const DEFAULT_ASPECTS: Record<AspectKey, AspectSetting> = {
  conjunction: asp(true, 8, 2),
  opposition: asp(true, 8, 2),
  trine: asp(true, 7, 2),
  square: asp(true, 7, 2),
  sextile: asp(true, 5, 1.5),
  quincunx: asp(true, 3, 1),
  semisextile: asp(false, 2, 1),
  semisquare: asp(false, 2, 1),
  sesquiquadrate: asp(false, 2, 1),
  quintile: asp(false, 1.5, 1),
  biquintile: asp(false, 1.5, 1)
}

export const DEFAULT_SETTINGS: AppSettings = {
  settingsVersion: 3,
  houseSystem: 'B',
  zodiac: 'tropical',
  sidMode: 1,
  nodeType: 'mean',
  lilithType: 'mean',
  orientation: 'asc',
  progressedAngles: 'naibod',
  points: {
    chiron: true,
    lilith: false,
    snode: true,
    fortune: false,
    vertex: false,
    ceres: false,
    pallas: false,
    juno: false,
    vesta: false
  },
  aspects: DEFAULT_ASPECTS,
  showNatalAspectsInBiwheel: false,
// i18n-ignore-start (default names; the UI reads them from src/shared/i18n)
  defaultPlace: { name: 'İstanbul, Türkiye', lat: 41.01384, lon: 28.94966, country: 'Türkiye', cc: 'TR', zone: 'Europe/Istanbul' },
// i18n-ignore-end
  defaultZone: 'Europe/Istanbul',
  theme: 'system',
  backupDir: '',
  onboarded: false,
  uiLanguage: 'tr',
  timezoneMode: 'system',
  dateOrder: 'auto',
  notifications: { enabled: true, scope: 'all', tag: 'takip' },
  returnPlace: 'natal',
  ai: {
    provider: 'claude-code',
    language: 'tr',
    systemPrompt: '',
    useKnowledge: true,
    providers: {
      'claude-code': { model: '', command: 'claude', extraArgs: '' },
      codex: { model: '', command: 'codex', extraArgs: '' },
      'gemini-cli': { model: '', command: 'gemini', extraArgs: '' },
      anthropic: { model: 'claude-opus-5-5', baseUrl: 'https://api.anthropic.com' },
      openai: { model: 'gpt-5.5', baseUrl: 'https://api.openai.com/v1' },
      gemini: { model: 'gemini-2.5-pro', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
      deepseek: { model: 'deepseek-chat', baseUrl: 'https://api.deepseek.com' }
    }
  }
}

/** Deep-merge stored settings over defaults so new keys appear after upgrades. */
export function mergeSettings(stored: Partial<AppSettings> | null | undefined): AppSettings {
  const d = DEFAULT_SETTINGS
  if (!stored) return structuredClone(d)
  const ai = stored.ai ?? d.ai
  const providers = { ...d.ai.providers }
  for (const k of Object.keys(providers) as ProviderId[]) {
    providers[k] = { ...d.ai.providers[k], ...(ai.providers?.[k] ?? {}) }
  }
  const aspects = { ...d.aspects }
  for (const k of Object.keys(aspects) as AspectKey[]) {
    aspects[k] = { ...d.aspects[k], ...(stored.aspects?.[k] ?? {}) }
  }
  // v2 made Alcabitius the house system; move older settings over once.
  const v = stored.settingsVersion ?? 1
  const migrated = {
    ...(v < 2 ? { houseSystem: 'B' } : {}),
    // v3 added the time zone mode: earlier installs follow the system zone.
    ...(v < 3 ? { timezoneMode: 'system' as const, dateOrder: 'auto' as const } : {}),
    settingsVersion: 3
  }
  return {
    ...structuredClone(d),
    ...stored,
    ...migrated,
    points: { ...d.points, ...(stored.points ?? {}) },
    aspects,
    defaultPlace: { ...d.defaultPlace, ...(stored.defaultPlace ?? {}) },
    ai: { ...d.ai, ...ai, providers }
  }
}
