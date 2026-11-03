// Collects the full licence texts of everything AstroFree ships into THIRD_PARTY_LICENSES.txt:
// the production dependency tree (main process) plus the libraries and fonts bundled into the
// renderer. MIT, BSD, ISC, Apache and OFL all require their text to travel with each copy.
//   node scripts/third-party-licenses.mjs
import { execFileSync } from 'node:child_process'
import { readFileSync, readdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const root = new URL('..', import.meta.url).pathname
// Bundled into out/renderer by Vite (imports in src/renderer and their runtime dependencies).
const RENDERER = ['react', 'react-dom', 'scheduler', 'marked', 'dompurify', '@fontsource/public-sans', '@fontsource/ibm-plex-mono', '@fontsource/noto-sans-symbols', '@fontsource/noto-sans-symbols-2']

const prod = execFileSync('npm', ['ls', '--omit=dev', '--all', '--parseable'], { cwd: root, encoding: 'utf8' })
  .trim()
  .split('\n')
  .slice(1)
const dirs = [...new Set([...prod, ...RENDERER.map((p) => join(root, 'node_modules', p))])]

const entries = dirs
  .map((dir) => {
    const pkg = JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'))
    const files = readdirSync(dir).filter((f) => /^(licen[cs]e|copying|notice)/i.test(f)).sort()
    const text = files.map((f) => readFileSync(join(dir, f), 'utf8').trim()).join('\n\n')
    return { name: pkg.name, version: pkg.version, license: typeof pkg.license === 'string' ? pkg.license : JSON.stringify(pkg.license), url: pkg.homepage || pkg.repository?.url || '', text }
  })
  .sort((a, b) => a.name.localeCompare(b.name))

const missing = entries.filter((e) => !e.text)
const out = [
  'AstroFree — third-party licences',
  '',
  'AstroFree is licensed under AGPL-3.0-or-later (see LICENSE and NOTICE.md).',
  'This file reproduces the licence texts of the third-party software and fonts shipped with it.',
  'Electron and Chromium licences are in LICENSE.electron.txt and LICENSES.chromium.html next to the app.',
  'Data credits: city data © GeoNames (CC BY 4.0, modified); online place search by Open-Meteo',
  '(https://open-meteo.com, CC BY 4.0); map data: Natural Earth (public domain);',
  'Swiss Ephemeris © Astrodienst AG (AGPL-3.0).',
  '',
  ...entries.flatMap((e) => ['='.repeat(78), `${e.name} ${e.version} — ${e.license}`, e.url, '-'.repeat(78), e.text || `(no licence file in the package; licence: ${e.license})`, '']),
].join('\n')
writeFileSync(join(root, 'THIRD_PARTY_LICENSES.txt'), out)
console.log(`${entries.length} packages, ${missing.length} without a licence file${missing.length ? ': ' + missing.map((e) => e.name).join(', ') : ''}`)
