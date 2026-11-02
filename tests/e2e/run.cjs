// End-to-end test runner: starts the built app with a throwaway profile,
// runs tests/e2e/steps.cjs inside the window and exits non-zero on failure.
//   npm run test:e2e            (builds first)
//   E2E_AI=1 npm run test:e2e   (also talks to the local Claude Code / Codex CLIs)
const { app, dialog } = require('electron')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

process.env.ASTROFREE_NO_NOTIFY = '1'
const root = path.resolve(__dirname, '../..')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astrofree-e2e-'))
app.setPath('userData', path.join(tmp, 'profile'))
let n = 0
// Save dialogs answer themselves so exports can run unattended.
dialog.showSaveDialog = async (_w, o) => ({ canceled: false, filePath: path.join(tmp, `export-${n++}-${path.basename((o && o.defaultPath) || 'x')}`) })

const { steps } = require('./steps.cjs')
const results = []
const timeout = setTimeout(() => finish('timeout'), 10 * 60 * 1000)

function finish(reason) {
  clearTimeout(timeout)
  const failed = results.filter((r) => r.startsWith('FAIL'))
  for (const r of results) console.log(r)
  const passed = results.filter((r) => r.startsWith('PASS')).length
  const skipped = results.filter((r) => r.startsWith('SKIP')).length
  console.log(`\n${passed} passed, ${failed.length} failed, ${skipped} skipped${reason ? ` (${reason})` : ''}`)
  try {
    fs.rmSync(tmp, { recursive: true, force: true })
  } catch {}
  app.exit(failed.length || reason ? 1 : 0)
}

app.on('browser-window-created', (_e, win) => {
  win.webContents.on('console-message', (e) => {
    if (e.level === 'error') results.push(`FAIL console error: ${String(e.message).slice(0, 200)}`)
  })
  win.webContents.once('did-finish-load', async () => {
    await new Promise((r) => setTimeout(r, 2500))
    const ctx = { ai: process.env.E2E_AI === '1', tmp: tmp.replace(/\\/g, '/') }
    for (const s of steps(ctx)) {
      try {
        const v = await win.webContents.executeJavaScript(s.js)
        if (typeof v === 'string' && /^(PASS|FAIL|SKIP)/.test(v)) results.push(v)
      } catch (err) {
        results.push(`FAIL step error: ${s.name ?? s.js.slice(0, 60)} — ${String(err.message || err).slice(0, 200)}`)
      }
      await new Promise((r) => setTimeout(r, s.wait ?? 300))
    }
    finish()
  })
})

require(path.join(root, 'out/main/index.js'))
