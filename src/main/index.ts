import { app, BrowserWindow, clipboard, ClipboardItem, dialog, ipcMain, Menu, nativeImage, nativeTheme, shell } from 'electron'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { basename, join } from 'node:path'
import type {
  AiChatRequest,
  AppSettings,
  ChartRecord,
  ElectionRequest,
  EphemRequest,
  Interpretation,
  ProviderId,
  StoredChat,
  TransitSearchRequest
} from '@shared/types'
import { apiKeyTest, cancelChat, detectProviders, serverModels, startChat } from './ai'
import { ensureShellPath } from './ai/proc'
import { computeMany } from './ephemeris'
import { skyReport } from './events'
import { nearestPlace, placeForZone, searchPlaces, zoneAt } from './geo'
import { setMainLang, tm } from './i18n'
import { parseChartsFile } from './importers'
import { startNotifier } from './notifier'
import { startAutoUpdate } from './updater'
import * as store from './store'
import { issueUrl, logError, reportInfo, watchErrors } from './errorlog'
import { electionalSearch, ephemSeries, findReturn, fixedStars, planetaryHours, transitSearch } from './tools'

/** LICENSE and notices ship as extraResources; in dev they sit in the project root. */
const bundledDoc = (name: string) => join(app.isPackaged ? process.resourcesPath : join(__dirname, '../..'), name)
// The star icon: in development Electron would otherwise show its own icon.
const appIcon = () => nativeImage.createFromPath(app.isPackaged ? join(process.resourcesPath, 'icon.png') : join(__dirname, '../../build/icon.png'))

let win: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'AstroFree',
    ...(process.platform !== 'darwin' ? { icon: appIcon() } : {}),
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#14151a' : '#f7f5f0',
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      // Automated tests run the window hidden; keep it rendering at full speed.
      backgroundThrottling: !process.env.ASTROFREE_HIDDEN
    }
  })
  win.once('ready-to-show', () => {
    if (!process.env.ASTROFREE_HIDDEN) win?.show()
    if (win) startAutoUpdate(win)
  })

  // Links in AI answers open in the system browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
  watchErrors(win)
  win.webContents.on('will-navigate', (e, url) => {
    if (url !== win?.webContents.getURL()) {
      e.preventDefault()
      if (/^https?:\/\//.test(url)) shell.openExternal(url)
    }
  })

  if (process.env.ELECTRON_RENDERER_URL) win.loadURL(process.env.ELECTRON_RENDERER_URL)
  else win.loadFile(join(__dirname, '../renderer/index.html'))
}

function registerIpc(): void {
  ipcMain.handle('ephem:compute', (_e, reqs: EphemRequest[]) => computeMany(reqs))
  ipcMain.handle('ephem:sky', (_e, jd: number, days: number, sidMode: number | null) => skyReport(jd, days, sidMode))

  ipcMain.handle('charts:list', () => store.listCharts())
  ipcMain.handle('charts:save', (_e, rec: ChartRecord) => store.saveChart(rec))
  ipcMain.handle('charts:remove', (_e, id: string) => store.removeChart(id))

  ipcMain.handle('charts:export', async (_e, recs: ChartRecord[]) => {
    const r = await dialog.showSaveDialog(win!, {
      title: tm('Haritaları dışa aktar'),
      defaultPath: tm('astrofree-haritalar') + '.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, JSON.stringify(recs, null, 2), 'utf8')
    return true
  })
  ipcMain.handle('charts:import', async () => {
    const r = await dialog.showOpenDialog(win!, {
      title: tm('Harita içe aktar'),
      properties: ['openFile'],
      filters: [
        { name: tm('Desteklenenler (AstroFree, AAF, CSV)'), extensions: ['json', 'aaf', 'csv', 'tsv', 'txt'] },
        { name: tm('AstroFree / yedek (JSON)'), extensions: ['json'] },
        { name: 'AAF — astro.com, AstroGold, Solar Fire', extensions: ['aaf', 'txt'] },
        { name: 'CSV', extensions: ['csv', 'tsv'] }
      ]
    })
    if (r.canceled || !r.filePaths[0]) return null
    const path = r.filePaths[0]
    const buf = await readFile(path)
    // AAF files from older programs are often Latin-1.
    let text = buf.toString('utf8')
    if (text.includes('\uFFFD')) text = buf.toString('latin1')
    return store.importData(parseChartsFile(path, text))
  })

  ipcMain.handle('tools:transits', (_e, req: TransitSearchRequest) => transitSearch(req))
  ipcMain.handle('tools:return', (_e, body: number, lon: number, jd: number, sid: number | null) => findReturn(body, lon, jd, sid))
  ipcMain.handle('tools:series', (_e, start: number, days: number, step: number, bodies: number[], sid: number | null) =>
    ephemSeries(start, days, step, bodies, sid)
  )
  ipcMain.handle('tools:election', (_e, req: ElectionRequest) => electionalSearch(req))
  ipcMain.handle('tools:stars', (_e, jd: number, sid: number | null) => fixedStars(jd, sid))
  ipcMain.handle('tools:hours', (_e, jd: number, lat: number, lon: number, tz: number) => planetaryHours(jd, lat, lon, tz))

  ipcMain.handle('interp:list', () => store.listInterpretations())
  ipcMain.handle('interp:add', (_e, it: Interpretation) => store.addInterpretation(it))
  ipcMain.handle('interp:update', (_e, id: string, patch: Partial<Interpretation>) => store.updateInterpretation(id, patch))
  ipcMain.handle('interp:remove', (_e, id: string) => store.removeInterpretation(id))

  ipcMain.handle('kb:list', () => store.listKnowledge())
  ipcMain.handle('kb:save', (_e, name: string, text: string) => store.saveKnowledge(name, text))
  ipcMain.handle('kb:import', async () => {
    const r = await dialog.showOpenDialog(win!, {
      title: tm('Bilgi bankasına dosya ekle'),
      properties: ['openFile', 'multiSelections'],
      filters: [{ name: tm('Markdown veya metin'), extensions: ['md', 'txt'] }]
    })
    return r.canceled ? [] : store.importKnowledge(r.filePaths)
  })
  ipcMain.handle('kb:openDir', async () => {
    await mkdir(store.knowledgeDir(), { recursive: true })
    return shell.openPath(store.knowledgeDir())
  })
  ipcMain.handle('kb:trash', (_e, name: string) => shell.trashItem(join(store.knowledgeDir(), basename(name))))

  ipcMain.handle('backup:choose', async () => {
    const r = await dialog.showOpenDialog(win!, { title: tm('Yedek klasörü seçin'), properties: ['openDirectory', 'createDirectory'] })
    return r.canceled ? null : (r.filePaths[0] ?? null)
  })
  ipcMain.handle('backup:run', (_e, dir?: string) => store.runBackup(dir))
  ipcMain.handle('app:reveal', (_e, path: string) => shell.showItemInFolder(path))

  ipcMain.handle('export:png', async (_e, rect: Electron.Rectangle, name: string) => {
    const img = await win!.webContents.capturePage({
      x: Math.round(rect.x),
      y: Math.round(rect.y),
      width: Math.round(rect.width),
      height: Math.round(rect.height)
    })
    const r = await dialog.showSaveDialog(win!, { title: tm('Haritayı kaydet'), defaultPath: `${name}.png`, filters: [{ name: 'PNG', extensions: ['png'] }] })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, img.toPNG())
    return true
  })
  ipcMain.handle('app:reportInfo', () => reportInfo())
  ipcMain.handle('app:logError', (_e, source: string, message: string) => logError(String(source).slice(0, 40), String(message).slice(0, 4000)))
  // Opens a new GitHub issue with the text the user saw and edited; only this fixed address is allowed.
  ipcMain.handle('app:openIssue', (_e, title: string, body: string) => {
    void shell.openExternal(issueUrl(REPO, title, body))
  })
  ipcMain.handle('export:pngData', async (_e, dataUrl: string, name: string) => {
    const img = nativeImage.createFromDataURL(dataUrl)
    if (img.isEmpty()) return false
    const r = await dialog.showSaveDialog(win!, { title: tm('Görseli kaydet'), defaultPath: `${name}.png`, filters: [{ name: 'PNG', extensions: ['png'] }] })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, img.toPNG())
    return true
  })
  ipcMain.handle('export:copyImage', async (_e, dataUrl: string) => {
    const img = nativeImage.createFromDataURL(dataUrl)
    if (img.isEmpty()) return false
    await clipboard.write([new ClipboardItem({ 'image/png': new Blob([new Uint8Array(img.toPNG())], { type: 'image/png' }) })])
    return true
  })
  ipcMain.handle('export:pdf', async (_e, name: string) => {
    const pdf = await win!.webContents.printToPDF({ printBackground: true, pageSize: 'A4', margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 } })
    const r = await dialog.showSaveDialog(win!, { title: tm('Raporu kaydet'), defaultPath: `${name}.pdf`, filters: [{ name: 'PDF', extensions: ['pdf'] }] })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, pdf)
    return true
  })

  ipcMain.handle('settings:get', () => store.getSettings())
  ipcMain.handle('settings:set', async (_e, s: AppSettings) => {
    const saved = await store.setSettings(s)
    setMainLang(s.uiLanguage)
    buildMenu()
    return saved
  })

  ipcMain.handle('secrets:set', (_e, p: ProviderId, key: string) => store.setSecret(p, key))
  ipcMain.handle('secrets:status', () => store.secretStatus())

  ipcMain.handle('chats:get', (_e, key: string) => store.getChat(key))
  ipcMain.handle('chats:set', (_e, key: string, chat: StoredChat | null) => store.setChat(key, chat))

  ipcMain.handle('geo:search', (_e, q: string, lang: string) => searchPlaces(q, lang))
  ipcMain.handle('geo:zone', (_e, lat: number, lon: number) => zoneAt(lat, lon))
  ipcMain.handle('geo:placeForZone', (_e, zone: string) => placeForZone(zone))
  ipcMain.handle('geo:nearest', (_e, lat: number, lon: number) => nearestPlace(lat, lon))

  ipcMain.handle('ai:detect', () => detectProviders())
  ipcMain.handle('ai:models', (_e, baseUrl: string, key: string | null, headers?: string) => serverModels(baseUrl, key, headers))
  ipcMain.handle('ai:testKey', (_e, provider: ProviderId, key: string | null, baseUrl?: string, headers?: string) => apiKeyTest(provider, key, baseUrl, headers))
  ipcMain.on('ai:start', (e, req: AiChatRequest) => void startChat(req, e.sender))
  ipcMain.on('ai:cancel', (_e, id: string) => cancelChat(id))

  // Newer GitHub release than the running version, if any (silent when offline).
  ipcMain.handle('app:checkUpdate', async () => {
    try {
      const res = await fetch('https://api.github.com/repos/canerkoroglu/astrofree/releases/latest', {
        headers: { accept: 'application/vnd.github+json' },
        signal: AbortSignal.timeout(8000)
      })
      if (!res.ok) return null
      const r = (await res.json()) as { tag_name?: string; html_url?: string }
      const latest = (r.tag_name ?? '').replace(/^v/, '')
      const newer = (a: string, b: string) => {
        const pa = a.split('.').map(Number)
        const pb = b.split('.').map(Number)
        for (let i = 0; i < 3; i++) if ((pa[i] ?? 0) !== (pb[i] ?? 0)) return (pa[i] ?? 0) > (pb[i] ?? 0)
        return false
      }
      return latest && newer(latest, app.getVersion()) ? { version: latest, url: r.html_url ?? '' } : null
    } catch {
      return null
    }
  })

  ipcMain.handle('app:openDoc', (_e, name: string) =>
    ['LICENSE', 'NOTICE.md', 'THIRD_PARTY_NOTICES.md', 'THIRD_PARTY_LICENSES.txt'].includes(name) ? shell.openPath(bundledDoc(name)) : 'not allowed'
  )
  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    userData: app.getPath('userData')
  }))
}

const WEBSITE = 'https://astrofree.cklabs.tr'
const REPO = 'https://github.com/canerkoroglu/astrofree'

function buildMenu(): void {
  const isMac = process.platform === 'darwin'
  app.setAboutPanelOptions({
    applicationName: 'AstroFree',
    applicationVersion: app.getVersion(),
    version: '',
    copyright: `© 2026 Caner Köroğlu · ${WEBSITE}\n${tm('Lisans')}: AGPL-3.0-or-later`,
    credits: `${tm('Kaynak kod')}: ${REPO}\nSwiss Ephemeris © Astrodienst AG`,
    website: WEBSITE
  })
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    {
      label: tm('Dosya'),
      submenu: [
        { label: tm('Yeni harita'), accelerator: 'CmdOrCtrl+N', click: () => win?.webContents.send('menu', 'new') },
        { label: tm('Kaydet'), accelerator: 'CmdOrCtrl+S', click: () => win?.webContents.send('menu', 'save') },
        { type: 'separator' },
        { label: tm('İçe aktar…'), click: () => win?.webContents.send('menu', 'import') },
        { label: tm('Dışa aktar…'), click: () => win?.webContents.send('menu', 'export') },
        { type: 'separator' },
        isMac ? { role: 'close', label: tm('Kapat') } : { role: 'quit', label: tm('Çıkış') }
      ]
    },
    { role: 'editMenu', label: tm('Düzen') },
    {
      label: tm('Görünüm'),
      submenu: [
        { role: 'reload', label: tm('Yenile') },
        { role: 'toggleDevTools', label: tm('Geliştirici araçları') },
        { type: 'separator' },
        { role: 'resetZoom', label: tm('Gerçek boyut') },
        { role: 'zoomIn', label: tm('Yakınlaştır') },
        { role: 'zoomOut', label: tm('Uzaklaştır') },
        { type: 'separator' },
        { role: 'togglefullscreen', label: tm('Tam ekran') }
      ]
    },
    { role: 'windowMenu', label: tm('Pencere') },
    {
      role: 'help',
      label: tm('Yardım'),
      submenu: [
        { label: tm('Klavye kısayolları') + '   ?', click: () => win?.webContents.send('menu', 'shortcuts') },
        { label: tm('Sorun bildir…'), click: () => win?.webContents.send('menu', 'report') },
        { label: tm('AstroFree hakkında'), click: () => win?.webContents.send('menu', 'about') },
        { label: tm('Web sitesi'), click: () => void shell.openExternal(WEBSITE) },
        { label: tm('GitHub sayfası'), click: () => void shell.openExternal(REPO) },
        { type: 'separator' },
        { label: tm('Lisans'), click: () => void shell.openPath(bundledDoc('LICENSE')) },
        { label: tm('Telif ve ek koşullar'), click: () => void shell.openPath(bundledDoc('NOTICE.md')) },
        { label: tm('Üçüncü taraf lisansları ve atıflar'), click: () => void shell.openPath(bundledDoc('THIRD_PARTY_LICENSES.txt')) }
      ]
    }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

watchErrors()

app.whenReady().then(async () => {
  await store.snapshotOnUpgrade(app.getVersion())
  setMainLang((await store.getSettings()).uiLanguage)
  void ensureShellPath()
  registerIpc()
  buildMenu()
  if (process.platform === 'darwin' && !app.isPackaged) app.dock?.setIcon(appIcon())
  createWindow()
  if (!process.env.ASTROFREE_NO_NOTIFY) startNotifier()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
