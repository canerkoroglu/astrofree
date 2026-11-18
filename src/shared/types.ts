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

/** One entry of a person's life-event journal. */
export interface JournalEntry {
  id: string
  date: { y: number; m: number; d: number }
  title: string
  note?: string
}

export interface ChartRecord {
  id: string
  name: string
  local: LocalDateTime
  tz: TzSpec
  place: Place
  notes?: string
  tags?: string[]
  /** One group for the sidebar: a preset id (family, friends, clients, famous, work) or the user's own name. */
  group?: string
  /** Person (default) or an event chart (wedding, company founding, move…). */
  kind?: 'person' | 'event'
  /** Life events the person noted ("changed jobs"), shown with that day's sky. */
  journal?: JournalEntry[]
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
  | 'astrohermes'
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

/** How the AI pitches its answers: plain everyday language, or technical for astrologers. */
export type AiLevel = 'amateur' | 'professional'

export interface AiSettings {
  provider: ProviderId
  providers: Record<ProviderId, ProviderConfig>
  /** Answer language (locale code). */
  language: string
  systemPrompt: string
  level: AiLevel
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
  /** Advanced: show the Vedic (Jyotish) tools in Natal Info. */
  showVedic?: boolean
  /** Interface mode: amateur shows the everyday tabs only, professional everything. */
  mode: AiLevel
  /** Last version whose “what's new” notes the user has seen. */
  seenVersion?: string
  /** Language code from src/shared/i18n (tr, en, …). */
  uiLanguage: string
  /** 'system' follows the computer's time zone; 'manual' uses defaultZone as set. */
  timezoneMode: 'system' | 'manual'
  dateOrder: 'auto' | 'DMY' | 'MDY' | 'YMD'
  notifications: {
    enabled: boolean
    scope: 'all' | 'tagged'
    tag: string
    /** Plain weekly summary (sky events and the person's main transit), once a week. */
    weekly?: boolean
    /** Whose chart the weekly summary is about ('' = the first saved person). */
    weeklyChart?: string
  }
  returnPlace: 'natal' | 'current'
  ai: AiSettings
}

// ---- AI IPC ----------------------------------------------------------------

export interface AiMessage {
  role: 'user' | 'assistant'
  content: string
  /** User messages: chart data sent with this question (only when it changed since the last one). */
  context?: string
  /** User messages: knowledge-base entries matched to this question. */
  knowledge?: string
  /** User messages: candidate days and periods computed for a timing question. */
  timing?: string
  /** Assistant messages: token usage reported by the provider. */
  usage?: AiUsage
}

/** Token counts as reported by the provider (cached = read from its prompt cache). */
export interface AiUsage {
  input: number
  cached: number
  output: number
}

export interface AiChatRequest {
  id: string
  provider: ProviderId
  model?: string
  /** Standing instructions (persona, rules, language). */
  system: string
  /** Extra chart data for the newest question (normally empty: chart data travels on the messages). */
  context: string
  messages: AiMessage[]
}

export type AiEvent =
  | { id: string; type: 'delta'; text: string }
  | { id: string; type: 'status'; text: string }
  | { id: string; type: 'usage'; usage: AiUsage }
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

/** Old single-conversation format (before 0.2.1); read and converted on load. */
export interface StoredChat {
  messages: AiMessage[]
  updatedAt: number
}

/** One chat session about a chart. */
export interface ChatSession {
  id: string
  title: string
  createdAt: number
  updatedAt: number
  /** Provider that answered last (for display). */
  provider?: string
  messages: AiMessage[]
}

/** All chat sessions of one chart, newest first. */
export interface ChartChats {
  sessions: ChatSession[]
  activeId: string | null
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

/** One stay of the Moon in a sign, from `start` (or the request date) until it leaves at `end`. */
export interface MoonStay {
  start: number
  end: number
  sign: number
  /** Void of course from here until `end` (its last major aspect in the sign; `start` when it makes none). */
  voc: number
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

// ---- Timing questions ("when is a good day to…") ----------------------------

/** One local day, sampled over its daytime hours (08:00–21:00). */
export interface DayFact {
  /** Local noon, as a UT Julian day. */
  jd: number
  moonLon: number
  /** Moon minus Sun, 0–360 (under 180 = waxing). */
  elong: number
  /** Daytime hours (of 14) when the Moon is not void of course. */
  freeHours: number
  /** First and last local hour of those, or null when there is none. */
  freeFrom: number | null
  freeTo: number | null
  /** Swiss ids of Mercury, Venus and Mars when retrograde at noon. */
  retro: number[]
}

export interface TimingFacts {
  days: DayFact[]
  /** Mercury, Venus and Mars stations from ~4 months before the range to ~4 months after it. */
  stations: { jd: number; body: number; retro: boolean }[]
  eclipses: { jd: number; solar: boolean }[]
}
