// Local error log for "Report a problem". Nothing is sent anywhere: errors are
// kept in memory and in <userData>/logs/errors.log, and the user decides what
// to paste into an issue. Home-folder paths are shortened to "~".
import { app, type BrowserWindow } from 'electron'
import { appendFileSync, mkdirSync, readFileSync, renameSync, statSync } from 'node:fs'
import { release } from 'node:os'
import { join } from 'node:path'
import { scrub } from './scrub'

export { issueUrl } from './scrub'

const MAX_LINES = 60
const MAX_BYTES = 256 * 1024
const recent: string[] = []

const logFile = () => join(app.getPath('userData'), 'logs', 'errors.log')

export function logError(source: string, err: unknown): void {
  const text = err instanceof Error ? `${err.name}: ${err.message}\n${err.stack ?? ''}` : String(err)
  const line = `${new Date().toISOString()} [${source}] ${scrub(text)}`
  recent.push(line)
  if (recent.length > MAX_LINES) recent.shift()
  try {
    const f = logFile()
    mkdirSync(join(f, '..'), { recursive: true })
    try {
      if (statSync(f).size > MAX_BYTES) renameSync(f, f + '.1')
    } catch {
      /* no log yet */
    }
    appendFileSync(f, line + '\n')
  } catch {
    /* logging must never break the app */
  }
}

/** Catch main-process errors and renderer errors/crashes of the window. */
export function watchErrors(win?: BrowserWindow): void {
  if (!win) {
    process.on('uncaughtException', (e) => logError('main', e))
    process.on('unhandledRejection', (e) => logError('main', e))
    return
  }
  win.webContents.on('console-message', (e) => {
    if (e.level === 'error') logError('renderer', `${e.message} (${scrub(e.sourceId ?? '')}:${e.lineNumber ?? ''})`)
  })
  win.webContents.on('render-process-gone', (_e, d) => logError('renderer', `process gone: ${d.reason} (exit ${d.exitCode})`))
  win.webContents.on('preload-error', (_e, path, err) => logError('preload', `${scrub(path)}: ${err.message}`))
}

/** What "Report a problem" shows the user (they can edit it before sending). */
export function reportInfo(): { system: string; errors: string } {
  let errors = recent.slice(-25)
  if (!errors.length) {
    try {
      errors = readFileSync(logFile(), 'utf8').trim().split('\n').slice(-25)
    } catch {
      errors = []
    }
  }
  const system = [
    `AstroFree ${app.getVersion()}${app.isPackaged ? '' : ' (dev)'}`,
    `${process.platform} ${process.arch} · ${release()}`,
    `Electron ${process.versions.electron} · Chrome ${process.versions.chrome}`,
    `${app.getLocale()}`
  ].join('\n')
  return { system, errors: scrub(errors.join('\n'), 6000) }
}
