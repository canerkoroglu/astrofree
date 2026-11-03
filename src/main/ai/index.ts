import { tm } from '../i18n'
import type { WebContents } from 'electron'
import { readFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join } from 'node:path'
import { PROVIDERS } from '@shared/defaults'
import type { AiChatRequest, AiEvent, ProviderId, ProviderStatus } from '@shared/types'
import { getSecret, getSettings, secretStatus } from '../store'
import { runApi } from './api'
import { runCli } from './cli'
import { ensureShellPath, resolveCommand, runVersion } from './proc'

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
  await ensureShellPath()
  const settings = await getSettings()
  const keys = await secretStatus()
  return Promise.all(
    PROVIDERS.map(async (p): Promise<ProviderStatus> => {
      if (p.kind === 'api') {
        const has = !!keys[p.id]
        return { id: p.id, kind: 'api', available: has, detail: has ? tm('API anahtarı kayıtlı') : tm('API anahtarı yok') }
      }
      const cmd = settings.ai.providers[p.id as ProviderId].command || p.id.replace('-cli', '')
      const exe = resolveCommand(cmd)
      if (!exe) return { id: p.id, kind: 'cli', available: false, detail: tm('"{cmd}" bulunamadı', { cmd }) }
      const version = await runVersion(exe)
      const models = p.id === 'codex' ? await codexModels() : undefined
      return { id: p.id, kind: 'cli', available: true, detail: version || exe, models }
    })
  )
}
