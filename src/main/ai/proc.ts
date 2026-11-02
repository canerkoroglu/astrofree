// Process helpers for running the user's AI CLIs (claude, codex, gemini) from a
// GUI app: recover the login-shell PATH and resolve Windows .cmd shims.
import { execFile, spawn, type ChildProcess, type SpawnOptions } from 'node:child_process'
import { existsSync, statSync } from 'node:fs'
import { homedir } from 'node:os'
import { delimiter, isAbsolute, join } from 'node:path'

const isWin = process.platform === 'win32'

let pathReady: Promise<void> | null = null

/**
 * Apps started from Finder / a desktop launcher get a minimal PATH, so tools
 * installed via Homebrew, npm or nvm are invisible. Ask the login shell for
 * its PATH once and merge it with common install locations.
 */
export function ensureShellPath(): Promise<void> {
  if (pathReady) return pathReady
  pathReady = new Promise<void>((resolve) => {
    const home = homedir()
    const extra = isWin
      ? [join(process.env.APPDATA ?? '', 'npm'), join(home, '.local', 'bin'), join(home, 'AppData', 'Local', 'Programs')]
      : [
          '/opt/homebrew/bin',
          '/usr/local/bin',
          join(home, '.local', 'bin'),
          join(home, '.npm-global', 'bin'),
          join(home, '.claude', 'local'),
          join(home, '.bun', 'bin'),
          join(home, '.volta', 'bin')
        ]
    const merge = (shellPath: string) => {
      const parts = [...shellPath.split(delimiter), ...(process.env.PATH ?? '').split(delimiter), ...extra]
      process.env.PATH = [...new Set(parts.filter(Boolean))].join(delimiter)
      resolve()
    }
    if (isWin) return merge('')
    const shell = process.env.SHELL || '/bin/zsh'
    execFile(
      shell,
      ['-ilc', 'printf "__AF_PATH__%s__AF_PATH__" "$PATH"'],
      { timeout: 6000, encoding: 'utf8' },
      (_err, stdout) => {
        const m = /__AF_PATH__(.*)__AF_PATH__/.exec(stdout ?? '')
        merge(m ? m[1] : '')
      }
    )
  })
  return pathReady
}

/** Find an executable on PATH (honouring PATHEXT on Windows). */
export function resolveCommand(cmd: string): string | null {
  if (!cmd) return null
  const exts = isWin ? (process.env.PATHEXT ?? '.EXE;.CMD;.BAT;.COM').split(';').map((e) => e.toLowerCase()) : ['']
  const candidates = (base: string) => (isWin && !/\.[a-z0-9]+$/i.test(base) ? exts.map((e) => base + e) : [base])
  const isFile = (p: string) => {
    try {
      return existsSync(p) && statSync(p).isFile()
    } catch {
      return false
    }
  }
  if (isAbsolute(cmd) || cmd.includes('/') || cmd.includes('\\')) {
    return candidates(cmd).find(isFile) ?? null
  }
  for (const dir of (process.env.PATH ?? '').split(delimiter)) {
    if (!dir) continue
    const hit = candidates(join(dir, cmd)).find(isFile)
    if (hit) return hit
  }
  return null
}

// cmd.exe quoting for .cmd/.bat shims, which cannot be spawned without a shell.
function winQuote(arg: string): string {
  if (arg === '') return '""'
  if (!/[\s"&|<>^%]/.test(arg)) return arg
  return '"' + arg.replace(/(\\*)"/g, '$1$1\\"').replace(/(\\+)$/, '$1$1') + '"'
}

export function spawnCommand(exe: string, args: string[], opts: SpawnOptions): ChildProcess {
  if (isWin && /\.(cmd|bat)$/i.test(exe)) {
    const line = [winQuote(exe), ...args.map(winQuote)].join(' ')
    return spawn(process.env.ComSpec || 'cmd.exe', ['/d', '/s', '/c', `"${line}"`], {
      ...opts,
      windowsVerbatimArguments: true
    })
  }
  return spawn(exe, args, opts)
}

/** Split a user-provided argument string, respecting simple quotes. */
export function splitArgs(s: string | undefined): string[] {
  if (!s) return []
  const out: string[] = []
  const re = /"([^"]*)"|'([^']*)'|(\S+)/g
  let m: RegExpExecArray | null
  while ((m = re.exec(s))) out.push(m[1] ?? m[2] ?? m[3])
  return out
}

export function runVersion(exe: string): Promise<string> {
  return new Promise((resolve) => {
    let out = ''
    const child = spawnCommand(exe, ['--version'], { stdio: ['ignore', 'pipe', 'pipe'], env: process.env })
    const timer = setTimeout(() => child.kill(), 15000)
    child.stdout?.on('data', (d) => (out += d))
    child.stderr?.on('data', (d) => (out += d))
    child.on('error', () => resolve(''))
    child.on('close', () => {
      clearTimeout(timer)
      resolve(out.trim().split('\n')[0] ?? '')
    })
  })
}
