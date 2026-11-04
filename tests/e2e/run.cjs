// End-to-end test runner: starts the built app with a throwaway profile,
// runs tests/e2e/steps.cjs inside the window and exits non-zero on failure.
//   npm run test:e2e            (builds first)
//   E2E_AI=1 npm run test:e2e   (also talks to the local Claude Code / Codex CLIs)
const { app, dialog } = require('electron')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')

process.env.ASTROFREE_NO_NOTIFY = '1'
// Run without a visible window or Dock icon (E2E_SHOW=1 to watch).
if (!process.env.E2E_SHOW) {
  process.env.ASTROFREE_HIDDEN = '1'
  app.dock?.hide()
}
// The suite's selectors are Turkish: start the app as a Turkish system would.
app.commandLine.appendSwitch('lang', process.env.E2E_LANG || 'tr')
const root = path.resolve(__dirname, '../..')
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'astrofree-e2e-'))
app.setPath('userData', path.join(tmp, 'profile'))
// Data-safety check: a broken data file with a good .bak must be recovered
// (interpretations.json here, so the first-run flow for an empty chart list still runs),
// and a version change must leave a snapshot of the data files.
const profile = path.join(tmp, 'profile')
fs.mkdirSync(profile, { recursive: true })
const RECOVERED = { id: 'recovered-1', chartId: 'nobody', title: 'Kurtarılan yorum', content: 'x', provider: 'test', createdAt: 1 }
fs.writeFileSync(path.join(profile, 'interpretations.json'), '[{"id": "half-writ')
fs.writeFileSync(path.join(profile, 'interpretations.json.bak'), JSON.stringify([RECOVERED]))
fs.writeFileSync(path.join(profile, 'meta.json'), JSON.stringify({ lastVersion: '0.0.1' }))
let n = 0
// Save dialogs answer themselves so exports can run unattended.
dialog.showSaveDialog = async (_w, o) => ({ canceled: false, filePath: path.join(tmp, `export-${n++}-${path.basename((o && o.defaultPath) || 'x')}`) })

// A fake AI server that answers /<status>/models with that HTTP status, for the error-message checks.
const mock = require('node:http').createServer((req, res) => {
  const status = Number(req.url.split('/')[1]) || 200
  const bodies = {
    401: { error: { message: 'Incorrect API key provided' } },
    402: { error: { message: 'Insufficient Balance' } },
    429: { error: { message: 'Rate limit reached' } },
    400: { error: { message: 'User location is not supported for the API use.' } },
    200: { data: [{ id: 'gpt-5.5' }, { id: 'text-embedding-3-small' }, { id: 'gpt-5-mini' }] }
  }
  res.writeHead(status, { 'content-type': 'application/json' })
  res.end(JSON.stringify(bodies[status] ?? {}))
})
mock.listen(0, '127.0.0.1')
process.env.E2E_MOCK_PORT = ''
mock.on('listening', () => (process.env.E2E_MOCK_PORT = String(mock.address().port)))

const { steps } = require('./steps.cjs')
const results = []
const timeout = setTimeout(() => finish('timeout'), 10 * 60 * 1000)

function finish(reason) {
  clearTimeout(timeout)
  try {
    const files = fs.readdirSync(profile)
    const snap = path.join(profile, 'snapshots')
    const snaps = fs.existsSync(snap) ? fs.readdirSync(snap) : []
    const interps = JSON.parse(fs.readFileSync(path.join(profile, 'interpretations.json'), 'utf8'))
    results.push(
      (files.some((f) => f.startsWith('interpretations.json.corrupt-')) && interps.some((c) => c.id === 'recovered-1') ? 'PASS' : 'FAIL') +
        ' Bozuk veri dosyası kenara alındı, .bak yedeğinden kurtarıldı'
    )
    results.push((snaps.some((n) => n.startsWith('0.0.1-to-')) && files.includes('charts.json.bak') ? 'PASS' : 'FAIL') + ' Sürüm yükseltmesinde veri kopyası ve .bak — ' + snaps.join(','))
  } catch (e) {
    results.push('FAIL veri güvenliği denetimi: ' + e.message)
  }
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
    const ctx = { ai: process.env.E2E_AI === '1', tmp: tmp.replace(/\\/g, '/'), mock: Number(process.env.E2E_MOCK_PORT) }
    for (const s of steps(ctx)) {
      try {
        const v = await win.webContents.executeJavaScript(s.js)
        if (typeof v === 'string' && /^(PASS|FAIL|SKIP)/.test(v)) results.push(v)
      } catch (err) {
        results.push(`FAIL step error: ${s.name ?? s.js.slice(0, 60)} — ${String(err.message || err).slice(0, 200)}`)
      }
      await new Promise((r) => setTimeout(r, s.wait ?? 300))
      // E2E_SHOTS=dir saves a PNG after each step named in E2E_SHOT_STEPS (comma separated).
      if (process.env.E2E_SHOTS && (process.env.E2E_SHOT_STEPS ?? '').split(',').includes(s.name)) {
        const img = await win.webContents.capturePage()
        require('node:fs').writeFileSync(path.join(process.env.E2E_SHOTS, s.name.replace(/\W+/g, '-') + '.png'), img.toPNG())
      }
    }
    finish()
  })
})

require(path.join(root, 'out/main/index.js'))
