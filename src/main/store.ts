// Small JSON-file persistence in the app's userData folder.
import { app, safeStorage } from 'electron'
import { promises as fs } from 'node:fs'
import { basename } from 'node:path'
import { join } from 'node:path'
import { mergeSettings } from '@shared/defaults'
import type { AppSettings, ChartRecord, Interpretation, ProviderId, StoredChat } from '@shared/types'

const dir = () => app.getPath('userData')
const file = (name: string) => join(dir(), name)

/**
 * Read a data file. A missing file gives the fallback. A file that exists but
 * cannot be parsed is never treated as empty (the next save would overwrite
 * the user's records): it is moved aside as <name>.corrupt-<time> and the
 * previous good copy (<name>.bak) is restored.
 */
async function readJson<T>(name: string, fallback: T): Promise<T> {
  const target = file(name)
  let text: string
  try {
    text = await fs.readFile(target, 'utf8')
  } catch (e) {
    if ((e as NodeJS.ErrnoException).code === 'ENOENT') return restoreFromBak(name, fallback)
    throw e
  }
  try {
    return JSON.parse(text) as T
  } catch {
    const aside = `${target}.corrupt-${new Date().toISOString().replace(/[:.]/g, '-')}`
    await fs.rename(target, aside).catch(() => undefined)
    console.error(`[store] ${name} okunamadı; ${basename(aside)} olarak saklandı`)
    return restoreFromBak(name, fallback)
  }
}

/** Use <name>.bak when the main file is gone or broken; put it back in place. */
async function restoreFromBak<T>(name: string, fallback: T): Promise<T> {
  try {
    const text = await fs.readFile(`${file(name)}.bak`, 'utf8')
    const data = JSON.parse(text) as T
    await fs.writeFile(file(name), text, 'utf8')
    console.error(`[store] ${name} yedeğinden (.bak) geri yüklendi`)
    return data
  } catch {
    return fallback
  }
}

/** fs.rename with a few retries: on Windows antivirus or indexers can hold the file briefly. */
async function renameRetry(from: string, to: string): Promise<void> {
  for (let i = 0; ; i++) {
    try {
      return await fs.rename(from, to)
    } catch (e) {
      const code = (e as NodeJS.ErrnoException).code
      if (i >= 5 || !['EPERM', 'EBUSY', 'EACCES'].includes(code ?? '')) throw e
      await new Promise((r) => setTimeout(r, 50 * (i + 1)))
    }
  }
}

// Write to a temp file and rename so a crash never leaves half a file behind.
// The previous version is kept as <name>.bak.
async function writeJson(name: string, data: unknown): Promise<void> {
  await fs.mkdir(dir(), { recursive: true })
  const target = file(name)
  const tmp = `${target}.${process.pid}.tmp`
  await fs.writeFile(tmp, JSON.stringify(data, null, 2), 'utf8')
  await fs.copyFile(target, `${target}.bak`).catch(() => undefined)
  await renameRetry(tmp, target)
}

const DATA_FILES = ['charts.json', 'interpretations.json', 'settings.json', 'chats.json']

/**
 * Before a new version runs for the first time, copy the data files to
 * snapshots/<old>-to-<new>/ (the last 5 are kept). Data lives in the user
 * folder, which installers and updates do not touch; this is an extra net.
 */
export async function snapshotOnUpgrade(version: string): Promise<void> {
  try {
    const meta = await readJson<{ lastVersion?: string }>('meta.json', {})
    if (meta.lastVersion === version) return
    if (meta.lastVersion) {
      const root = join(dir(), 'snapshots')
      const dest = join(root, `${meta.lastVersion}-to-${version}`)
      await fs.mkdir(dest, { recursive: true })
      for (const f of DATA_FILES) await fs.copyFile(file(f), join(dest, f)).catch(() => undefined)
      const all = (await fs.readdir(root)).sort()
      const stats = await Promise.all(all.map(async (n) => ({ n, t: (await fs.stat(join(root, n))).mtimeMs })))
      for (const { n } of stats.sort((a, b) => b.t - a.t).slice(5)) await fs.rm(join(root, n), { recursive: true, force: true })
    }
    await writeJson('meta.json', { ...meta, lastVersion: version })
  } catch (e) {
    console.error('[store] sürüm öncesi kopya alınamadı', e) // i18n-ignore
  }
}

// Every read-modify-write goes through one queue so concurrent IPC calls
// cannot interleave and drop each other's changes.
let chain: Promise<unknown> = Promise.resolve()
function serial<T>(fn: () => Promise<T>): Promise<T> {
  const p = chain.then(fn, fn)
  chain = p.catch(() => undefined)
  return p
}

// ---- charts --------------------------------------------------------------

export const listCharts = () => readJson<ChartRecord[]>('charts.json', [])

export const saveChart = (rec: ChartRecord) =>
  serial(async () => {
    const all = await listCharts()
    const i = all.findIndex((c) => c.id === rec.id)
    const next = { ...rec, updatedAt: Date.now() }
    if (i >= 0) all[i] = next
    else all.push(next)
    await writeJson('charts.json', all)
    scheduleBackup()
    return all
  })

export const removeChart = (id: string) =>
  serial(async () => {
    const all = (await listCharts()).filter((c) => c.id !== id)
    await writeJson('charts.json', all)
    const chats = await readJson<Record<string, StoredChat>>('chats.json', {})
    if (chats[id]) {
      delete chats[id]
      await writeJson('chats.json', chats)
    }
    scheduleBackup()
    return all
  })

/** Import a chart list or a full backup file ({ charts, interpretations }). */
export const importData = (data: unknown) =>
  serial(async () => {
    const backup = data && typeof data === 'object' && !Array.isArray(data) && 'charts' in data ? (data as { charts: ChartRecord[]; interpretations?: Interpretation[]; knowledge?: { name: string; text: string }[] }) : null
    const recs: ChartRecord[] = backup ? backup.charts : Array.isArray(data) ? data : [data as ChartRecord]
    const all = await listCharts()
    const ids = new Set(all.map((c) => c.id))
    const remap = new Map<string, string>()
    for (const r of recs) {
      if (!r || typeof r !== 'object' || !r.local || !r.place) continue
      if (ids.has(r.id)) {
        // Same chart already present (restoring a backup): keep the existing one.
        if (JSON.stringify(all.find((c) => c.id === r.id)?.local) === JSON.stringify(r.local)) continue
        const id = crypto.randomUUID()
        remap.set(r.id, id)
        all.push({ ...r, id })
      } else all.push(r)
      ids.add(r.id)
    }
    await writeJson('charts.json', all)
    if (backup?.interpretations?.length) {
      const existing = await listInterpretations()
      const have = new Set(existing.map((i) => i.id))
      for (const it of backup.interpretations) {
        if (have.has(it.id)) continue
        existing.push({ ...it, chartId: remap.get(it.chartId) ?? it.chartId })
      }
      await writeJson('interpretations.json', existing)
    }
    if (backup?.knowledge?.length) {
      // Restore knowledge files that are missing; never overwrite the user's current ones.
      await fs.mkdir(knowledgeDir(), { recursive: true })
      const have = new Set(await fs.readdir(knowledgeDir()))
      for (const k of backup.knowledge) {
        if (typeof k?.text !== 'string' || have.has(basename(k.name))) continue
        await fs.writeFile(join(knowledgeDir(), kbName(k.name)), k.text, 'utf8').catch(() => undefined)
      }
    }
    scheduleBackup()
    return all
  })

// ---- settings ------------------------------------------------------------

export async function getSettings(): Promise<AppSettings> {
  return mergeSettings(await readJson<Partial<AppSettings> | null>('settings.json', null))
}

export const setSettings = (s: AppSettings) =>
  serial(async () => {
    await writeJson('settings.json', s)
    return s
  })

// ---- chats ---------------------------------------------------------------

export async function getChat(key: string): Promise<StoredChat | null> {
  const chats = await readJson<Record<string, StoredChat>>('chats.json', {})
  return chats[key] ?? null
}

export const setChat = (key: string, chat: StoredChat | null) =>
  serial(async () => {
    const chats = await readJson<Record<string, StoredChat>>('chats.json', {})
    if (chat && chat.messages.length) chats[key] = chat
    else delete chats[key]
    await writeJson('chats.json', chats)
  })

// ---- API keys (encrypted with the OS keychain when available) ------------

type SecretFile = Record<string, { enc: boolean; value: string }>

export const setSecret = (provider: ProviderId, key: string) =>
  serial(async () => {
    const secrets = await readJson<SecretFile>('secrets.json', {})
    if (!key) delete secrets[provider]
    else if (safeStorage.isEncryptionAvailable()) {
      secrets[provider] = { enc: true, value: safeStorage.encryptString(key).toString('base64') }
    } else {
      secrets[provider] = { enc: false, value: key }
    }
    await writeJson('secrets.json', secrets)
  })

export async function getSecret(provider: ProviderId): Promise<string | null> {
  const secrets = await readJson<SecretFile>('secrets.json', {})
  const s = secrets[provider]
  if (!s) return null
  if (!s.enc) return s.value
  try {
    return safeStorage.decryptString(Buffer.from(s.value, 'base64'))
  } catch {
    return null
  }
}

export async function secretStatus(): Promise<Record<string, boolean>> {
  const secrets = await readJson<SecretFile>('secrets.json', {})
  return Object.fromEntries(Object.keys(secrets).map((k) => [k, true]))
}

// ---- interpretations (saved AI answers per chart) -------------------------

export const listInterpretations = () => readJson<Interpretation[]>('interpretations.json', [])

export const addInterpretation = (it: Interpretation) =>
  serial(async () => {
    const all = await listInterpretations()
    all.push(it)
    await writeJson('interpretations.json', all)
    scheduleBackup()
    return all
  })

export const updateInterpretation = (id: string, patch: Partial<Interpretation>) =>
  serial(async () => {
    const all = (await listInterpretations()).map((i) => (i.id === id ? { ...i, ...patch, id } : i))
    await writeJson('interpretations.json', all)
    scheduleBackup()
    return all
  })

export const removeInterpretation = (id: string) =>
  serial(async () => {
    const all = (await listInterpretations()).filter((i) => i.id !== id)
    await writeJson('interpretations.json', all)
    scheduleBackup()
    return all
  })

// ---- knowledge base -------------------------------------------------------------
// Plain Markdown files the user owns and may edit in any editor.

export const knowledgeDir = () => join(dir(), 'knowledge')
const kbName = (name: string) => {
  const n = basename(name)
  if (!/\.(md|txt)$/i.test(n)) throw new Error('Only .md or .txt files')
  return n
}

export async function listKnowledge(): Promise<{ name: string; text: string }[]> {
  try {
    const names = (await fs.readdir(knowledgeDir())).filter((f) => /\.(md|txt)$/i.test(f)).sort((a, b) => a.localeCompare(b))
    return Promise.all(names.map(async (name) => ({ name, text: await fs.readFile(join(knowledgeDir(), name), 'utf8') })))
  } catch {
    return []
  }
}

export async function saveKnowledge(name: string, text: string): Promise<void> {
  await fs.mkdir(knowledgeDir(), { recursive: true })
  const target = join(knowledgeDir(), kbName(name))
  const tmp = `${target}.${process.pid}.tmp`
  await fs.writeFile(tmp, text, 'utf8')
  await fs.rename(tmp, target)
  scheduleBackup()
}

/** Copy files in; an existing file of the same name is kept and the new one numbered. */
export async function importKnowledge(paths: string[]): Promise<string[]> {
  await fs.mkdir(knowledgeDir(), { recursive: true })
  const existing = new Set(await fs.readdir(knowledgeDir()))
  const added: string[] = []
  for (const p of paths) {
    let name = kbName(p)
    for (let i = 2; existing.has(name); i++) name = kbName(p).replace(/(\.\w+)$/, ` (${i})$1`)
    await fs.copyFile(p, join(knowledgeDir(), name))
    existing.add(name)
    added.push(name)
  }
  if (added.length) scheduleBackup()
  return added
}

// ---- automatic backups ---------------------------------------------------------

const BACKUP_PREFIX = 'astrofree-yedek-'
const KEEP_BACKUPS = 30
let backupTimer: NodeJS.Timeout | null = null

export async function backupData() {
  return {
    app: 'AstroFree',
    format: 1,
    createdAt: new Date().toISOString(),
    charts: await listCharts(),
    interpretations: await listInterpretations(),
    knowledge: await listKnowledge()
  }
}

/** Write today's backup into the chosen folder and prune old ones. Returns the file path. */
export async function runBackup(dirOverride?: string): Promise<string | null> {
  const settings = await getSettings()
  const target = dirOverride || settings.backupDir
  if (!target) return null
  await fs.mkdir(target, { recursive: true })
  const day = new Date().toISOString().slice(0, 10)
  const path = join(target, `${BACKUP_PREFIX}${day}.json`)
  const tmp = `${path}.tmp`
  await fs.writeFile(tmp, JSON.stringify(await backupData(), null, 2), 'utf8')
  await fs.rename(tmp, path)
  // Only our own dated files are ever removed.
  const ours = (await fs.readdir(target)).filter((f) => /^astrofree-yedek-\d{4}-\d\d-\d\d\.json$/.test(f)).sort()
  for (const old of ours.slice(0, Math.max(0, ours.length - KEEP_BACKUPS))) {
    await fs.unlink(join(target, basename(old))).catch(() => undefined)
  }
  return path
}

function scheduleBackup() {
  if (backupTimer) clearTimeout(backupTimer)
  backupTimer = setTimeout(() => void runBackup().catch(() => undefined), 3000)
}
