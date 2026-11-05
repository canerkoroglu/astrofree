import { tm } from '../i18n'
import type { WebContents } from 'electron'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { PROVIDERS } from '@shared/defaults'
import { compactHistory } from '@shared/aiHistory'
import type { AiChatRequest, AiEvent, ProviderId, ProviderStatus } from '@shared/types'
import { getSecret, getSettings, secretStatus } from '../store'
import { listModels, runApi, testApiKey } from './api'
import { runCli } from './cli'
import { desktopAppInstalled, ensureShellPath, resolveCommand, runVersion } from './proc'

const running = new Map<string, AbortController>()

export function cancelChat(id: string): void {
  running.get(id)?.abort()
}

export async function startChat(req: AiChatRequest, sender: WebContents): Promise<void> {
  const send = (e: AiEvent) => {
    if (!sender.isDestroyed()) sender.send('ai:event', e)
  }
  const ctrl = new AbortController()
  running.set(req.id, ctrl)
  try {
    const settings = await getSettings()
    const cfg = settings.ai.providers[req.provider]
    const kind = PROVIDERS.find((p) => p.id === req.provider)?.kind
    const emit = (e: { type: 'delta' | 'status'; text: string }) => send({ id: req.id, ...e })
    // Long chats: older messages go shortened, the newest ones whole (src/shared/aiHistory.ts).
    req = { ...req, messages: compactHistory(req.messages).messages }
    if (kind === 'cli') {
      // Gemini CLI can authenticate with the same key as the Gemini API provider.
      const key = req.provider === 'gemini-cli' ? await getSecret('gemini') : null
      await runCli(req, cfg, key, emit, ctrl.signal)
    } else {
      await runApi(req, cfg, await getSecret(req.provider), emit, ctrl.signal)
    }
    send({ id: req.id, type: 'done' })
  } catch (e) {
    if (ctrl.signal.aborted) send({ id: req.id, type: 'done' })
    else send({ id: req.id, type: 'error', message: String((e as Error)?.message ?? e) })
  } finally {
    running.delete(req.id)
  }
}

async function codexModels(): Promise<string[]> {
  try {
    const raw = JSON.parse(await readFile(join(homedir(), '.codex', 'models_cache.json'), 'utf8'))
    return (raw.models ?? [])
      .filter((m: { visibility?: string }) => !m.visibility || m.visibility === 'list')
      .map((m: { slug?: string; id?: string }) => m.slug ?? m.id)
      .filter(Boolean)
  } catch {
    return []
  }
}

export async function detectProviders(): Promise<ProviderStatus[]> {
  // Re-read PATH each time, so a CLI installed while the app is open is found on "check again".
  await ensureShellPath(true)
  const settings = await getSettings()
  const keys = await secretStatus()
  return Promise.all(
    PROVIDERS.map(async (p): Promise<ProviderStatus> => {
      if (p.id === 'local') {
        const cfg = settings.ai.providers.local
        if (!cfg?.baseUrl) return { id: p.id, kind: 'api', available: false, detail: tm('Sunucu adresi girilmemiş (Ayarlar → Yapay zekâ).') }
        try {
          const models = await listModels(cfg.baseUrl, await getSecret('local'), cfg.headers)
          return { id: p.id, kind: 'api', available: true, detail: tm('{url} · {n} model', { url: cfg.baseUrl, n: String(models.length) }), models }
        } catch (e) {
          return { id: p.id, kind: 'api', available: false, detail: String((e as Error).message) }
        }
      }
      if (p.kind === 'api') {
        const has = !!keys[p.id]
        return { id: p.id, kind: 'api', available: has, detail: has ? tm('API anahtarı kayıtlı') : tm('API anahtarı yok') }
      }
      const cmd = settings.ai.providers[p.id as ProviderId].command || p.id.replace('-cli', '')
      const exe = resolveCommand(cmd)
      if (!exe) {
        // The chat apps people usually have are not the command line tools AstroFree drives.
        const desktop = p.id === 'claude-code' ? desktopAppInstalled('claude') : p.id === 'codex' ? desktopAppInstalled('chatgpt') : false
        return {
          id: p.id,
          kind: 'cli',
          available: false,
          detail: desktop
            ? p.id === 'claude-code'
              ? tm('Claude masaüstü uygulaması kurulu, ama AstroFree sohbet için ayrı bir araç olan Claude Code (`claude` komutu) kullanır; onu da kurmanız gerekir.')
              : tm('ChatGPT uygulaması kurulu, ama AstroFree sohbet için ayrı bir araç olan Codex CLI (`codex` komutu) kullanır; onu da kurmanız gerekir.')
            : tm('"{cmd}" komutu bu bilgisayarda bulunamadı.', { cmd })
        }
      }
      const version = await runVersion(exe)
      const models = p.id === 'codex' ? await codexModels() : undefined
      return { id: p.id, kind: 'cli', available: true, detail: version || exe, models }
    })
  )
}

/** Models of an OpenAI-compatible server, for the settings screen (key: typed or stored). */
export async function serverModels(baseUrl: string, key: string | null, headers?: string): Promise<{ models?: string[]; error?: string }> {
  try {
    return { models: await listModels(baseUrl, key || (await getSecret('local')), headers) }
  } catch (e) {
    return { error: String((e as Error).message) }
  }
}

/** Validate an API key (typed, or the stored one) for the settings screen. */
export async function apiKeyTest(provider: ProviderId, key: string | null, baseUrl?: string, headers?: string): Promise<{ models?: string[]; error?: string }> {
  const k = key?.trim() || (await getSecret(provider))
  if (!k) return { error: tm('Önce API anahtarını girin.') }
  try {
    const settings = await getSettings()
    const cfg = { ...settings.ai.providers[provider], ...(baseUrl !== undefined ? { baseUrl } : {}), ...(headers !== undefined ? { headers } : {}) }
    return { models: await testApiKey(provider, cfg, k) }
  } catch (e) {
    return { error: String((e as Error).message) }
  }
}
