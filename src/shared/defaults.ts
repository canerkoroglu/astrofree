import { getLocale } from './i18n'
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
  },
  {
    id: 'astrohermes',
    label: 'AstroHermes',
    kind: 'api',
    hint: 'Astrolojiye özel, ücretli bir yapay zekâ servisi. AstroHermes aboneliğinizden aldığınız API anahtarını (ahr_live_…) yapıştırmanız yeterli; adres hazır.',
    models: ['astrohermes-1-fast', 'astrohermes-1']
  },
  {
    id: 'local',
    label: 'Yerel sunucu',
    kind: 'api',
    hint: 'Ollama, llama.cpp, LM Studio, LiteLLM, vLLM gibi OpenAI uyumlu bir sunucu; bilgisayarınızda ya da ağınızda çalışan modeller (ör. Qwen). API anahtarı isteğe bağlıdır.',
    models: []
  }
]

/** AstroHermes, the paid astrology model service (a separate product): live address, and staging for ahr_test_ keys. */
export const ASTROHERMES_URL = 'https://astrohermes.cklabs.tr/v1'
export const ASTROHERMES_STAGING_URL = 'https://astrohermes-staging.cklabs.tr/v1'
export const astrohermesUrl = (key: string | null) => (key?.trim().startsWith('ahr_test_') ? ASTROHERMES_STAGING_URL : ASTROHERMES_URL)

/** Common OpenAI-compatible servers and their default addresses. */
export const LOCAL_PRESETS: { id: string; label: string; url: string; hint: string }[] = [
  { id: 'ollama', label: 'Ollama', url: 'http://localhost:11434/v1', hint: 'ollama serve · model ör. qwen3:8b' },
  { id: 'llamacpp', label: 'llama.cpp (llama-server)', url: 'http://localhost:8080/v1', hint: 'llama-server -m model.gguf --port 8080' },
  { id: 'lmstudio', label: 'LM Studio', url: 'http://localhost:1234/v1', hint: 'Developer → Start Server' },
  { id: 'litellm', label: 'LiteLLM proxy', url: 'http://localhost:4000/v1', hint: 'litellm --config config.yaml · anahtar: master key' },
  { id: 'vllm', label: 'vLLM', url: 'http://localhost:8000/v1', hint: 'vllm serve Qwen/Qwen3-8B' },
  { id: 'custom', label: 'Özel', url: '', hint: 'OpenAI uyumlu herhangi bir /v1 adresi' }
]

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

/** Bump when NOTICE.md's terms change: everyone is asked to acknowledge them again. */
export const TERMS_VERSION = '2026-11-03'

export const DEFAULT_SETTINGS: AppSettings = {
  settingsVersion: 5,
  mode: 'amateur',
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
  aspectColors: {},
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
    language: 'auto',
    systemPrompt: '',
    level: 'amateur',
    useKnowledge: true,
    providers: {
      'claude-code': { model: '', command: 'claude', extraArgs: '' },
      codex: { model: '', command: 'codex', extraArgs: '' },
      'gemini-cli': { model: '', command: 'gemini', extraArgs: '' },
      // Cost-effective defaults for pay-per-token APIs; stronger models are one click away in the chat's model list.
      anthropic: { model: 'claude-sonnet-5-5', baseUrl: 'https://api.anthropic.com' },
      openai: { model: 'gpt-5-mini', baseUrl: 'https://api.openai.com/v1' },
      gemini: { model: 'gemini-2.5-flash', baseUrl: 'https://generativelanguage.googleapis.com/v1beta' },
      deepseek: { model: 'deepseek-chat', baseUrl: 'https://api.deepseek.com' },
      // The address is fixed (ASTROHERMES_URL); only the subscription key is entered.
      astrohermes: { model: 'astrohermes-1-fast' },
      local: { model: '', baseUrl: 'http://localhost:11434/v1', preset: 'ollama', timeoutSec: 300, hideThinking: true }
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
    // v5 added the interface mode: earlier installs keep the full interface they know.
    ...(v < 5 && !stored.mode ? { mode: 'professional' as const } : {}),
    settingsVersion: 5
  }
  // v4: the AI answers in the interface language unless the user picked another one.
  const aiLanguage = v < 4 && (!ai.language || ai.language === (stored.uiLanguage ?? 'tr')) ? 'auto' : ai.language
  return {
    ...structuredClone(d),
    ...stored,
    ...migrated,
    points: { ...d.points, ...(stored.points ?? {}) },
    aspects,
    aspectColors: { ...(stored.aspectColors ?? {}) },
    defaultPlace: { ...d.defaultPlace, ...(stored.defaultPlace ?? {}) },
    ai: { ...d.ai, ...ai, language: aiLanguage ?? 'auto', providers }
  }
}

/** Language the AI answers in: the chosen one, or the interface language ('auto'). */
export const aiLanguageOf = (s: Pick<AppSettings, 'uiLanguage' | 'ai'>) => (!s.ai.language || s.ai.language === 'auto' ? s.uiLanguage : s.ai.language)

/** Standing instructions sent to the AI: the user's own or the language's default, the answer level and the safety rule. */
export function aiSystemPrompt(s: Pick<AppSettings, 'uiLanguage' | 'ai'>): string {
  const loc = getLocale(aiLanguageOf(s))
  return `${s.ai.systemPrompt.trim() || loc.systemPrompt}\n\n${loc.aiLevel[s.ai.level]}\n\n${loc.aiSafety}`
}
