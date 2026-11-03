// Renders the AstroFree application icon (build/icon.png, 1024×1024) and an SVG copy.
// electron-builder derives the macOS, Windows and Linux icons from the PNG.
//   npx electron scripts/build-icon.cjs
const { app, BrowserWindow } = require('electron')
const fs = require('node:fs')
const path = require('node:path')

const SIZE = 1024
// Same geometry as src/renderer/src/components/Logo.tsx: eight points, inner radius 0.42.
function star(c, r, inner = 0.42) {
  const pts = []
  for (let i = 0; i < 16; i++) {
    const rad = i % 2 === 0 ? r : r * inner
    const a = (Math.PI / 8) * i - Math.PI / 2
    pts.push(`${(c + rad * Math.cos(a)).toFixed(2)},${(c + rad * Math.sin(a)).toFixed(2)}`)
  }
  return pts.join(' ')
}
// macOS icon grid: an 824 px rounded square centred on a 1024 canvas.
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <rect x="100" y="100" width="824" height="824" rx="185" fill="#14161d"/>
  <rect x="100.5" y="100.5" width="823" height="823" rx="184.5" fill="none" stroke="#2a2e3a" stroke-width="1"/>
  <polygon points="${star(512, 300)}" fill="#6fa8f0"/>
</svg>`

const out = path.resolve(__dirname, '../build')
fs.mkdirSync(out, { recursive: true })
fs.writeFileSync(path.join(out, 'icon.svg'), svg)

app.dock?.hide()
app.whenReady().then(async () => {
  const win = new BrowserWindow({ width: SIZE, height: SIZE, show: false, transparent: true, frame: false, webPreferences: { offscreen: true } })
  await win.loadURL('data:text/html,' + encodeURIComponent(`<html><body style="margin:0;background:transparent">${svg}</body></html>`))
  await new Promise((r) => setTimeout(r, 300))
  const img = (await win.webContents.capturePage()).resize({ width: SIZE, height: SIZE, quality: 'best' })
  fs.writeFileSync(path.join(out, 'icon.png'), img.toPNG())
  console.log('build/icon.png', img.getSize())
  app.exit(0)
})
