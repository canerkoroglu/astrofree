// Types shared by the main process, preload bridge and renderer.

export interface LocalDateTime {
  y: number
  m: number // 1-12
  d: number
  h: number
  mi: number
  s: number
}

/** How local clock time maps to UT for a chart. */
export type TzSpec =
  | { kind: 'zone'; zone: string } // IANA zone, historical DST rules via Intl
  | { kind: 'offset'; minutes: number } // fixed offset east of Greenwich
  | { kind: 'lmt' } // local mean time from longitude

export interface Place {
  name: string
  /** ISO 3166 country code, for the flag. */
  cc?: string
  lat: number // north positive
  lon: number // east positive
  country?: string
  admin?: string
  zone?: string
}

export interface ChartRecord {
  id: string
  name: string
  local: LocalDateTime
  tz: TzSpec
  place: Place
  notes?: string
  tags?: string[]
  /** Person (default) or an event chart (wedding, company founding, move…). */
  kind?: 'person' | 'event'
  /** Birth time unknown: noon is used and houses/angles are unreliable. */
  timeUnknown?: boolean
  /** Rodden rating of the time source: AA, A, B, C, DD, X. */
  rodden?: string
  /** Composite chart of two saved charts (midpoints); local/place hold the Davison moment for display. */
  composite?: { a: ChartRecord; b: ChartRecord }
  createdAt: number
  updatedAt: number
}

// ---- Ephemeris IPC -------------------------------------------------------

export interface EphemRequest {
  jdUT: number
  lat: number
  lon: number
  houseSystem: string
  /** Swiss Ephemeris SE_SIDM_* constant, or null for tropical. */
  sidMode: number | null
  /** Override the ARMC (degrees) used for houses, e.g. progressed angles. */
  armc?: number
  bodies: number[]
}

export interface EphemBody {
  id: number
  lon: number
  lat: number
  dist: number
  speed: number
  decl: number
}

export interface EphemResult {
  jdUT: number
  bodies: EphemBody[]
  cusps: number[] // 12 entries, house 1..12
  asc: number
  mc: number
  armc: number
  vertex: number
  eps: number
  ayanamsa: number
  /** House system actually used when the requested one is undefined here (polar circles → 'O' Porphyry). */
  houseFallback?: string
  error?: string
}

// ---- Settings ------------------------------------------------------------

export type AspectKey =
  | 'conjunction'
  | 'opposition'
  | 'trine'
  | 'square'
  | 'sextile'
  | 'quincunx'
  | 'semisextile'
  | 'semisquare'
  | 'sesquiquadrate'
  | 'quintile'
  | 'biquintile'

export interface AspectSetting {
  enabled: boolean
  orb: number // natal-natal orb in degrees
  outerOrb: number // transit / progression / synastry to natal orb
}

export type ProviderId =
  | 'claude-code'
  | 'codex'
  | 'gemini-cli'
  | 'anthropic'
  | 'openai'
  | 'gemini'
  | 'deepseek'
  | 'local'

export interface ProviderConfig {
  model: string
  /** CLI providers: executable name or absolute path. */
  command?: string
  /** CLI providers: extra arguments, whitespace separated. */
  extraArgs?: string
  /** API providers: override base URL (proxies, OpenAI-compatible hosts). */
  baseUrl?: string
  /** Local/custom server preset the address came from (ollama, llamacpp, lmstudio, litellm, vllm, custom). */
  preset?: string
  /** Sampling temperature; empty uses the server's default. */
  temperature?: number
  /** Upper limit for the answer length in tokens; empty uses the provider default. */
  maxTokens?: number
  /** Give up waiting after this many seconds (local models can be slow). */
  timeoutSec?: number
  /** Extra HTTP headers, one "Name: value" per line (OpenAI-compatible providers). */
  headers?: string
  /** Send at most this many characters of chart and knowledge data (small local context windows). */
  contextLimit?: number
  /** Drop <think>…</think> reasoning blocks from answers (Qwen, DeepSeek-R1 and similar). */
  hideThinking?: boolean
}

export interface AiSettings {
  provider: ProviderId
  providers: Record<ProviderId, ProviderConfig>
  /** Answer language (locale code). */
  language: string
  systemPrompt: string
  /** Add matching knowledge-base entries to what is sent with each message. */
  useKnowledge: boolean
}

export interface AppSettings {
  settingsVersion: number
  houseSystem: string
  zodiac: 'tropical' | 'sidereal'
  sidMode: number
  nodeType: 'mean' | 'true'
  lilithType: 'mean' | 'true'
  orientation: 'asc' | 'aries'
  progressedAngles: 'naibod' | 'solarArc'
  points: Record<string, boolean>
  aspects: Record<AspectKey, AspectSetting>
  /** Version of the licence/disclaimer notice the user acknowledged, and when. */
  termsAccepted?: string
  termsAcceptedAt?: string
  /** User colours for aspect lines and glyphs (hex); missing keys use the theme default. */
  aspectColors: Partial<Record<AspectKey, string>>
  showNatalAspectsInBiwheel: boolean
  defaultPlace: Place
  defaultZone: string
  theme: 'light' | 'dark' | 'system'
  backupDir: string
  onboarded: boolean
  /** Last version whose “what's new” notes the user has seen. */
  seenVersion?: string
  /** Language code from src/shared/i18n (tr, en, …). */
  uiLanguage: string
  /** 'system' follows the computer's time zone; 'manual' uses defaultZone as set. */
  timezoneMode: 'system' | 'manual'
  dateOrder: 'auto' | 'DMY' | 'MDY' | 'YMD'
  notifications: { enabled: boolean; scope: 'all' | 'tagged'; tag: string }
  returnPlace: 'natal' | 'current'
  ai: AiSettings
}

// ---- AI IPC ----------------------------------------------------------------

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
}

export interface AiChatRequest {
  id: string
  provider: ProviderId
  model?: string
  /** Standing instructions (persona, rules, language). */
  system: string
  /** Chart data for the current screen, refreshed on every turn. */
  context: string
  messages: AiMessage[]
}

export type AiEvent =
  | { id: string; type: 'delta'; text: string }
  | { id: string; type: 'status'; text: string }
  | { id: string; type: 'done' }
  | { id: string; type: 'error'; message: string }

export interface ProviderStatus {
  id: ProviderId
  kind: 'cli' | 'api'
  available: boolean
  detail: string
  models?: string[]
}

export interface GeoResult extends Place {
  population?: number
}

export interface StoredChat {
  messages: AiMessage[]
  updatedAt: number
}

// ---- Sky events ------------------------------------------------------------

export type SkyEventKind =
  | 'station-r'
  | 'station-d'
  | 'ingress'
  | 'new-moon'
  | 'full-moon'
  | 'solar-eclipse'
  | 'lunar-eclipse'

export interface SkyEvent {
  jd: number
  kind: SkyEventKind
  /** Swiss Ephemeris body id (0 Sun, 1 Moon, ...). */
  body: number
  lon: number
  /** Eclipse type: total, annular, partial, penumbral, hybrid. */
  detail?: string
}

export interface RetroPeriod {
  body: number
  /** Station retrograde before the reference date (null if not found). */
  start: number | null
  /** Station direct after the reference date. */
  end: number | null
  startLon: number | null
  endLon: number | null
}

export interface SkyReport {
  jd: number
  retro: RetroPeriod[]
  events: SkyEvent[]
  previousLunation: SkyEvent | null
  nextEclipses: SkyEvent[]
  moonLon: number
  sunLon: number
  /** Void-of-course Moon: last major aspect before the next sign change. */
  voc: { start: number; end: number; lastBody: number; lastAspect: number } | null
}

// ---- Searches ----------------------------------------------------------------

export interface TransitSearchRequest {
  start: number
  end: number
  bodies: number[]
  natal: { key: string; lon: number }[]
  aspects: { key: AspectKey; angle: number; orb: number }[]
  sidMode: number | null
}

export interface TransitHit {
  body: number
  natalKey: string
  aspect: AspectKey
  /** Entering orb (or the search start when already in orb). */
  start: number
  /** Leaving orb (or the search end when still in orb). */
  end: number
  exacts: { jd: number; retro: boolean }[]
  startsBefore?: boolean
  endsAfter?: boolean
}

export interface FixedStarPos {
  name: string
  lon: number
  lat: number
}

export interface PlanetaryHours {
  sunrise: number
  sunset: number
  nextSunrise: number
  dayRuler: number
  weekday: number
  hours: { start: number; end: number; ruler: number; night: boolean }[]
}

export interface Interpretation {
  id: string
  chartId: string
  title: string
  content: string
  provider: string
  createdAt: number
}

// ---- Electional search -------------------------------------------------------

export interface ElectionConditions {
  moonSigns: number[] // empty = any
  moonNotVoc: boolean
  moonWaxing: boolean
  notRetro: number[] // swiss ids
  aspect: { a: number; b: number; aspects: number[]; orb: number } | null
  angular: { body: number; orb: number } | null
}

export interface ElectionRequest {
  start: number
  end: number
  stepMinutes: number
  lat: number
  lon: number
  sidMode: number | null
  cond: ElectionConditions
}

export interface ElectionWindow {
  start: number
  end: number
  moonLon: number
}
