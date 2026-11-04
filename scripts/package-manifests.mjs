// Generates package-manager manifests (winget, Scoop, Homebrew cask) for a
// published release from its SHA256SUMS.txt.
//
//   node scripts/package-manifests.mjs <version> <SHA256SUMS.txt> [outDir]
//
// CI runs this after every release and attaches the result to the workflow run
// ("package-manifests"). Submitting them is described in docs/packaging.md.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const [version, sumsFile, outDir = 'packaging/out'] = process.argv.slice(2)
if (!version || !sumsFile) {
  console.error('kullanım: node scripts/package-manifests.mjs <sürüm> <SHA256SUMS.txt> [çıktı klasörü]')
  process.exit(1)
}

const sums = new Map()
for (const line of readFileSync(sumsFile, 'utf8').split('\n')) {
  const m = line.trim().match(/^([0-9a-f]{64})\s+\*?(.+)$/i)
  if (m) sums.set(m[2].trim(), m[1].toLowerCase())
}
const sha = (file) => {
  const s = sums.get(file)
  if (!s) throw new Error(`${file} için SHA-256 yok (${sumsFile})`)
  return s
}

const REPO = 'canerkoroglu/astrofree'
const base = `https://github.com/${REPO}/releases/download/v${version}`
const files = {
  win: `AstroFree-${version}-win-x64.exe`,
  macArm: `AstroFree-${version}-mac-arm64.dmg`,
  macX64: `AstroFree-${version}-mac-x64.dmg`
}
const DESC_EN =
  'Free, open-source and offline desktop astrology app built on the Swiss Ephemeris: natal, transit, progressed, ' +
  'solar arc, synastry, composite and return charts, astrocartography, traditional techniques, and optional AI chat ' +
  'about the chart (Claude Code, Codex, Gemini, DeepSeek or a local model).'
const SHORT_EN = 'Free, open-source, offline desktop astrology app'
const TAGS = ['astrology', 'horoscope', 'natal-chart', 'ephemeris', 'swiss-ephemeris', 'transits', 'offline']

// ── winget (multi-file manifest, schema 1.9.0) ───────────────────────────────
const ID = 'CanerKoroglu.AstroFree'
const wingetDir = join(outDir, 'winget', 'manifests', 'c', 'CanerKoroglu', 'AstroFree', version)
mkdirSync(wingetDir, { recursive: true })
const head = (type) =>
  `# yaml-language-server: $schema=https://aka.ms/winget-manifest.${type}.1.9.0.schema.json\n\n`
writeFileSync(
  join(wingetDir, `${ID}.yaml`),
  head('version') +
    `PackageIdentifier: ${ID}\nPackageVersion: ${version}\nDefaultLocale: en-US\nManifestType: version\nManifestVersion: 1.9.0\n`
)
writeFileSync(
  join(wingetDir, `${ID}.installer.yaml`),
  head('installer') +
    `PackageIdentifier: ${ID}
PackageVersion: ${version}
InstallerLocale: en-US
InstallerType: nullsoft
Scope: user
InstallModes:
- interactive
- silent
UpgradeBehavior: install
ReleaseDate: ${new Date().toISOString().slice(0, 10)}
Installers:
- Architecture: x64
  InstallerUrl: ${base}/${files.win}
  InstallerSha256: ${sha(files.win).toUpperCase()}
  InstallerSwitches:
    Silent: /S
    SilentWithProgress: /S
ManifestType: installer
ManifestVersion: 1.9.0
`
)
const locale = (loc, short, desc, notesUrl) =>
  head(loc === 'en-US' ? 'defaultLocale' : 'locale') +
  `PackageIdentifier: ${ID}
PackageVersion: ${version}
PackageLocale: ${loc}
Publisher: Caner Köroğlu
PublisherUrl: https://github.com/canerkoroglu
PublisherSupportUrl: https://github.com/${REPO}/issues
PackageName: AstroFree
PackageUrl: https://astrofree.cklabs.tr
License: AGPL-3.0-or-later
LicenseUrl: https://github.com/${REPO}/blob/main/LICENSE
Copyright: Copyright (c) 2026 Caner Köroğlu
ShortDescription: ${JSON.stringify(short)}
Description: ${JSON.stringify(desc)}
Moniker: astrofree
Tags:
${TAGS.map((t) => `- ${t}`).join('\n')}
ReleaseNotesUrl: ${notesUrl}
ManifestType: ${loc === 'en-US' ? 'defaultLocale' : 'locale'}
ManifestVersion: 1.9.0
`
const notesUrl = `https://github.com/${REPO}/releases/tag/v${version}`
writeFileSync(join(wingetDir, `${ID}.locale.en-US.yaml`), locale('en-US', SHORT_EN, DESC_EN, notesUrl))
writeFileSync(
  join(wingetDir, `${ID}.locale.tr-TR.yaml`),
  locale(
    'tr-TR',
    'Ücretsiz, açık kaynak ve çevrimdışı masaüstü astroloji programı',
    'Swiss Ephemeris tabanlı ücretsiz ve açık kaynak astroloji programı: doğum haritası, transit, progresyon, solar ark, ' +
      'sinastri, kompozit ve dönüş haritaları, astrokartografi, geleneksel teknikler ve isteğe bağlı yapay zekâ sohbeti.',
    notesUrl
  )
    .replace(/^Tags:\n(- .*\n)+/m, '')
    .replace(/^Moniker: .*\n/m, '')
)

// ── Scoop (extracts the NSIS payload, no installer runs) ─────────────────────
mkdirSync(join(outDir, 'scoop'), { recursive: true })
writeFileSync(
  join(outDir, 'scoop', 'astrofree.json'),
  JSON.stringify(
    {
      version,
      description: SHORT_EN,
      homepage: 'https://astrofree.cklabs.tr',
      license: 'AGPL-3.0-or-later',
      architecture: {
        '64bit': { url: `${base}/${files.win}#/dl.7z`, hash: sha(files.win) }
      },
      pre_install: [
        'Expand-7zipArchive "$dir\\`$PLUGINSDIR\\app-64.7z" "$dir"',
        'Remove-Item "$dir\\`$PLUGINSDIR", "$dir\\Uninstall*" -Force -Recurse'
      ],
      shortcuts: [['AstroFree.exe', 'AstroFree']],
      checkver: { github: `https://github.com/${REPO}` },
      autoupdate: {
        architecture: {
          '64bit': { url: `https://github.com/${REPO}/releases/download/v$version/AstroFree-$version-win-x64.exe#/dl.7z` }
        }
      }
    },
    null,
    2
  ) + '\n'
)

// ── Homebrew cask (for the canerkoroglu/homebrew-astrofree tap) ──────────────
mkdirSync(join(outDir, 'homebrew', 'Casks'), { recursive: true })
writeFileSync(
  join(outDir, 'homebrew', 'Casks', 'astrofree.rb'),
  `cask "astrofree" do
  arch arm: "arm64", intel: "x64"

  version "${version}"
  sha256 arm:   "${sha(files.macArm)}",
         intel: "${sha(files.macX64)}"

  url "https://github.com/${REPO}/releases/download/v#{version}/AstroFree-#{version}-mac-#{arch}.dmg",
      verified: "github.com/${REPO}/"
  name "AstroFree"
  desc "${SHORT_EN}"
  homepage "https://astrofree.cklabs.tr"

  livecheck do
    url :url
    strategy :github_latest
  end

  depends_on macos: ">= :monterey"

  app "AstroFree.app"

  # The app is ad-hoc signed (not notarized yet); without this Gatekeeper
  # refuses to open it.
  postflight do
    system_command "/usr/bin/xattr", args: ["-dr", "com.apple.quarantine", "#{appdir}/AstroFree.app"]
  end

  zap trash: [
    "~/Library/Application Support/AstroFree",
    "~/Library/Logs/AstroFree",
    "~/Library/Preferences/app.astrofree.desktop.plist",
    "~/Library/Saved Application State/app.astrofree.desktop.savedState",
  ]
end
`
)
console.log(`manifestler yazıldı: ${outDir}`)
