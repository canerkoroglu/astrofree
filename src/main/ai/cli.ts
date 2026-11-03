// Chat through locally installed agent CLIs. Each call is stateless: the
// chart context and the whole conversation are sent on stdin every turn, so
// the chat follows the chart as the user steps through time.
import { tm } from '../i18n'
import { app } from 'electron'
import { mkdirSync } from 'node:fs'
import { join } from 'node:path'
import type { AiChatRequest, ProviderConfig } from '@shared/types'
import { ensureShellPath, resolveCommand, spawnCommand, splitArgs } from './proc'

export type Emit = (e: { type: 'delta' | 'status'; text: string }) => void

function workDir(): string {
  // An empty folder, so the agents have no project files to wander into.
  const dir = join(app.getPath('userData'), 'ai-workdir')
  mkdirSync(dir, { recursive: true })
  return dir
}

export function buildTranscript(req: AiChatRequest, includeSystem: boolean): string {
  const parts: string[] = []
  if (includeSystem) parts.push(`<instructions>\n${req.system}\n</instructions>`)
  if (req.context) parts.push(`<chart_data>\n${req.context}\n</chart_data>`)
  const history = req.messages.slice(0, -1)
  if (history.length) {
    parts.push(
      '<previous_conversation>\n' +
        history.map((m) => `${m.role === 'user' ? 'USER' : 'ASSISTANT'}:\n${m.content}`).join('\n\n') +
        '\n</previous_conversation>'
    )
  }
  const last = req.messages[req.messages.length - 1]
  parts.push(last ? last.content : '')
  return parts.join('\n\n')
}

interface CliSpec {
  args: string[]
  stdin: string
  env?: Record<string, string | undefined>
  parse: (line: string, emit: Emit, state: ParseState) => void
  explain?: (stderr: string) => string | null
}

interface ParseState {
  gotText: boolean
  error?: string
  final?: string
}

function tryJson(line: string): Record<string, unknown> | null {
  try {
    const v = JSON.parse(line)
    return v && typeof v === 'object' ? v : null
  } catch {
    return null
  }
}

// ---- Claude Code --------------------------------------------------------

function claudeSpec(req: AiChatRequest, cfg: ProviderConfig): CliSpec {
  const args = [
    '-p',
    '--output-format', 'stream-json',
    '--verbose',
    '--include-partial-messages',
    // Plain chat: no tools, MCP servers, skills, settings or session files.
    '--tools', '',
    '--strict-mcp-config',
    '--disable-slash-commands',
    '--no-session-persistence',
    '--setting-sources', '',
    '--system-prompt', req.system
  ]
  if (req.model) args.push('--model', req.model)
  args.push(...splitArgs(cfg.extraArgs))
  return {
    args,
    stdin: buildTranscript(req, false),
    // Allow launching while the app itself runs inside a Claude Code session.
    env: { CLAUDECODE: undefined, CLAUDE_CODE_ENTRYPOINT: undefined },
    parse(line, emit, st) {
      const o = tryJson(line) as any
      if (!o) return
      if (o.type === 'stream_event') {
        const ev = o.event
        if (ev?.type === 'content_block_delta' && ev.delta?.type === 'text_delta' && ev.delta.text) {
          st.gotText = true
          emit({ type: 'delta', text: ev.delta.text })
        }
      } else if (o.type === 'system' && o.subtype === 'init') {
        emit({ type: 'status', text: `Claude Code · ${o.model ?? ''}`.trim() })
      } else if (o.type === 'result') {
        if (o.is_error) st.error = String(o.result || o.subtype || tm('Claude Code hatası'))
        else if (typeof o.result === 'string') st.final = o.result
      }
    },
    explain(stderr) {
      if (/not logged in|login|authenticat/i.test(stderr)) {
        return tm('Claude Code oturumu açık değil. Terminalde `claude` çalıştırıp giriş yapın.')
      }
      return null
    }
  }
}

// ---- Codex ----------------------------------------------------------------

function codexSpec(req: AiChatRequest, cfg: ProviderConfig): CliSpec {
  const args = ['exec', '--skip-git-repo-check', '--ephemeral', '--json', '--color', 'never', '-s', 'read-only']
  if (req.model) args.push('-m', req.model)
  args.push(...splitArgs(cfg.extraArgs), '-')
  return {
    args,
    stdin: buildTranscript(req, true),
    parse(line, emit, st) {
      const o = tryJson(line) as any
      if (!o) return
      if (o.type === 'item.completed' && o.item?.type === 'agent_message' && o.item.text) {
        // Codex reports whole messages rather than token deltas.
        emit({ type: 'delta', text: (st.gotText ? '\n\n' : '') + o.item.text })
        st.gotText = true
      } else if (o.type === 'item.started' && o.item?.type === 'reasoning') {
        emit({ type: 'status', text: tm('Codex düşünüyor…') })
      } else if (o.type === 'error' || o.type === 'turn.failed') {
        const raw = String(o.message ?? o.error?.message ?? tm('Codex hatası'))
        const inner = tryJson(raw) as any
        st.error = inner?.error?.message ?? raw
      }
    },
    explain(stderr) {
      if (/not logged in|login|unauthor/i.test(stderr)) {
        return tm('Codex oturumu açık değil. Terminalde `codex login` çalıştırın.')
      }
      return null
    }
  }
}

// ---- Gemini CLI -------------------------------------------------------------

function geminiSpec(req: AiChatRequest, cfg: ProviderConfig, apiKey: string | null): CliSpec {
  const args = ['--skip-trust', '-o', 'stream-json']
  if (req.model) args.push('-m', req.model)
  args.push(...splitArgs(cfg.extraArgs), '-p', 'Follow the instructions above and answer the last user message.')
  return {
    args,
    stdin: buildTranscript(req, true),
    env: { NO_BROWSER: 'true', ...(apiKey ? { GEMINI_API_KEY: apiKey } : {}) },
    parse(line, emit, st) {
      const o = tryJson(line) as any
      if (!o) {
        // Older versions without stream-json print plain text.
        if (line.trim() && !st.error) {
          emit({ type: 'delta', text: line + '\n' })
          st.gotText = true
        }
        return
      }
      if (o.type === 'message' && o.role === 'assistant' && typeof o.content === 'string') {
        st.gotText = true
        emit({ type: 'delta', text: o.content })
      } else if (o.type === 'init') {
        emit({ type: 'status', text: `Gemini CLI · ${o.model ?? ''}`.trim() })
      } else if (o.type === 'error') {
        st.error = String(o.message ?? o.error?.message ?? tm('Gemini hatası'))
      } else if (o.type === 'result' && o.status && o.status !== 'success') {
        st.error = String(o.error?.message ?? o.status)
      }
    },
    explain(stderr) {
      if (/authenticat|Opening authentication page|login/i.test(stderr)) {
        return tm('Gemini CLI oturumu açık değil. Terminalde bir kez `gemini` çalıştırıp giriş yapın ya da Ayarlar → Gemini API anahtarı girin.')
      }
      return null
    }
  }
}

// ---- runner -------------------------------------------------------------------

export async function runCli(
  req: AiChatRequest,
  cfg: ProviderConfig,
  apiKey: string | null,
  emit: Emit,
  signal: AbortSignal
): Promise<void> {
  await ensureShellPath()
  const defaults = { 'claude-code': 'claude', codex: 'codex', 'gemini-cli': 'gemini' } as const
  const name = cfg.command?.trim() || defaults[req.provider as keyof typeof defaults]
  const exe = resolveCommand(name)
  if (!exe) throw new Error(tm('"{cmd}" komutu bulunamadı. Kurulu olduğundan emin olun veya Ayarlar\'dan tam yolunu girin.', { cmd: name }))

  const spec =
    req.provider === 'claude-code'
      ? claudeSpec(req, cfg)
      : req.provider === 'codex'
        ? codexSpec(req, cfg)
        : geminiSpec(req, cfg, apiKey)

  const env: NodeJS.ProcessEnv = { ...process.env }
  for (const [k, v] of Object.entries(spec.env ?? {})) {
    if (v === undefined) delete env[k]
    else env[k] = v
  }

  const child = spawnCommand(exe, spec.args, { cwd: workDir(), env, stdio: ['pipe', 'pipe', 'pipe'] })
  const st: ParseState = { gotText: false }
  let stderr = ''
  let buf = ''

  const onAbort = () => {
    if (process.platform === 'win32' && child.pid) {
      spawnCommand('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
    } else child.kill('SIGTERM')
  }
  signal.addEventListener('abort', onAbort, { once: true })

  child.stdout?.setEncoding('utf8')
  child.stdout?.on('data', (chunk: string) => {
    buf += chunk
    let nl: number
    while ((nl = buf.indexOf('\n')) >= 0) {
      const line = buf.slice(0, nl).replace(/\r$/, '')
      buf = buf.slice(nl + 1)
      if (line) spec.parse(line, emit, st)
    }
  })
  child.stderr?.setEncoding('utf8')
  child.stderr?.on('data', (chunk: string) => {
    stderr = (stderr + chunk).slice(-8000)
  })
  child.stdin?.on('error', () => undefined)
  child.stdin?.end(spec.stdin, 'utf8')

  const code: number | null = await new Promise((resolve, reject) => {
    child.on('error', reject)
    child.on('close', (c) => resolve(c))
  })
  signal.removeEventListener('abort', onAbort)
  if (buf.trim()) spec.parse(buf.trim(), emit, st)
  if (signal.aborted) return

  if (!st.gotText && st.final) {
    emit({ type: 'delta', text: st.final })
    st.gotText = true
  }
  if (st.error) throw new Error(st.error)
  if (!st.gotText) {
    const hint = spec.explain?.(stderr)
    const tail = stderr.trim().split('\n').slice(-6).join('\n')
    throw new Error(hint ?? tm('Komut yanıt vermeden bitti (çıkış kodu {code}).', { code: String(code) }) + (tail ? '\n' + tail : ''))
  }
}
