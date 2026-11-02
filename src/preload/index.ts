import { contextBridge, ipcRenderer } from 'electron'
import type {
  AiChatRequest,
  AiEvent,
  AppSettings,
  ChartRecord,
  EphemRequest,
  EphemResult,
  GeoResult,
  ProviderId,
  FixedStarPos,
  Interpretation,
  PlanetaryHours,
  ProviderStatus,
  SkyReport,
  TransitHit,
  TransitSearchRequest,
  StoredChat
} from '@shared/types'

const api = {
  compute: (reqs: EphemRequest[]): Promise<EphemResult[]> => ipcRenderer.invoke('ephem:compute', reqs),
  sky: (jd: number, days: number, sidMode: number | null): Promise<SkyReport> => ipcRenderer.invoke('ephem:sky', jd, days, sidMode),

  tools: {
    transits: (req: TransitSearchRequest): Promise<TransitHit[]> => ipcRenderer.invoke('tools:transits', req),
    returnTime: (body: number, lon: number, jd: number, sid: number | null): Promise<number | null> =>
      ipcRenderer.invoke('tools:return', body, lon, jd, sid),
    stars: (jd: number, sid: number | null): Promise<FixedStarPos[]> => ipcRenderer.invoke('tools:stars', jd, sid),
    hours: (jd: number, lat: number, lon: number, tzOffset: number): Promise<PlanetaryHours | null> =>
      ipcRenderer.invoke('tools:hours', jd, lat, lon, tzOffset)
  },

  interp: {
    list: (): Promise<Interpretation[]> => ipcRenderer.invoke('interp:list'),
    add: (it: Interpretation): Promise<Interpretation[]> => ipcRenderer.invoke('interp:add', it),
    update: (id: string, patch: Partial<Interpretation>): Promise<Interpretation[]> => ipcRenderer.invoke('interp:update', id, patch),
    remove: (id: string): Promise<Interpretation[]> => ipcRenderer.invoke('interp:remove', id)
  },

  backup: {
    choose: (): Promise<string | null> => ipcRenderer.invoke('backup:choose'),
    run: (dir?: string): Promise<string | null> => ipcRenderer.invoke('backup:run', dir),
    reveal: (path: string): Promise<void> => ipcRenderer.invoke('app:reveal', path)
  },

  exporter: {
    png: (rect: { x: number; y: number; width: number; height: number }, name: string): Promise<boolean> =>
      ipcRenderer.invoke('export:png', rect, name),
    pdf: (name: string): Promise<boolean> => ipcRenderer.invoke('export:pdf', name)
  },

  charts: {
    list: (): Promise<ChartRecord[]> => ipcRenderer.invoke('charts:list'),
    save: (rec: ChartRecord): Promise<ChartRecord[]> => ipcRenderer.invoke('charts:save', rec),
    remove: (id: string): Promise<ChartRecord[]> => ipcRenderer.invoke('charts:remove', id),
    exportAll: (recs: ChartRecord[]): Promise<boolean> => ipcRenderer.invoke('charts:export', recs),
    importFile: (): Promise<ChartRecord[] | null> => ipcRenderer.invoke('charts:import')
  },

  settings: {
    get: (): Promise<AppSettings> => ipcRenderer.invoke('settings:get'),
    set: (s: AppSettings): Promise<AppSettings> => ipcRenderer.invoke('settings:set', s)
  },

  secrets: {
    set: (p: ProviderId, key: string): Promise<void> => ipcRenderer.invoke('secrets:set', p, key),
    status: (): Promise<Record<string, boolean>> => ipcRenderer.invoke('secrets:status')
  },

  chats: {
    get: (key: string): Promise<StoredChat | null> => ipcRenderer.invoke('chats:get', key),
    set: (key: string, chat: StoredChat | null): Promise<void> => ipcRenderer.invoke('chats:set', key, chat)
  },

  geo: {
    search: (q: string, lang: string): Promise<GeoResult[]> => ipcRenderer.invoke('geo:search', q, lang),
    zone: (lat: number, lon: number): Promise<string | null> => ipcRenderer.invoke('geo:zone', lat, lon),
    nearest: (lat: number, lon: number): Promise<(GeoResult & { km: number }) | null> => ipcRenderer.invoke('geo:nearest', lat, lon)
  },

  ai: {
    detect: (): Promise<ProviderStatus[]> => ipcRenderer.invoke('ai:detect'),
    start: (req: AiChatRequest): void => ipcRenderer.send('ai:start', req),
    cancel: (id: string): void => ipcRenderer.send('ai:cancel', id),
    onEvent: (fn: (e: AiEvent) => void): (() => void) => {
      const listener = (_: unknown, e: AiEvent) => fn(e)
      ipcRenderer.on('ai:event', listener)
      return () => ipcRenderer.removeListener('ai:event', listener)
    }
  },

  onMenu: (fn: (cmd: string) => void): (() => void) => {
    const listener = (_: unknown, cmd: string) => fn(cmd)
    ipcRenderer.on('menu', listener)
    return () => ipcRenderer.removeListener('menu', listener)
  },

  info: (): Promise<{ version: string; platform: string; userData: string }> => ipcRenderer.invoke('app:info')
}

export type AstroApi = typeof api

contextBridge.exposeInMainWorld('astro', api)
