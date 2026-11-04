// macOS shows the app menu title and Dock name from the Electron binary's own Info.plist, so `npm run dev`
// says "Electron" there. Rename the local development copy to AstroFree (packaged builds are named by
// electron-builder and are not affected). Safe to run repeatedly; does nothing on other systems.
import { execFileSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

if (process.platform === 'darwin') {
  const require = createRequire(import.meta.url)
  const app = join(dirname(require.resolve('electron/package.json')), 'dist', 'Electron.app')
  const plist = join(app, 'Contents', 'Info.plist')
  if (existsSync(plist)) {
    const pb = (cmd) => execFileSync('/usr/libexec/PlistBuddy', ['-c', cmd, plist], { encoding: 'utf8' }).trim()
    const name = 'AstroFree'
    let current = ''
    try {
      current = pb('Print CFBundleName')
    } catch {}
    if (current !== name) {
      pb(`Set CFBundleName ${name}`)
      try {
        pb(`Set CFBundleDisplayName ${name}`)
      } catch {
        pb(`Add CFBundleDisplayName string ${name}`)
      }
      // Editing Info.plist breaks the bundle's ad-hoc signature; sign it again locally.
      try {
        execFileSync('codesign', ['--force', '--deep', '--sign', '-', app], { stdio: 'ignore' })
      } catch {}
      console.log(`dev: Electron.app renamed to ${name}`)
    }
  }
}
