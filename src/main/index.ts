import { app, BrowserWindow, dialog, ipcMain, Menu, nativeTheme, shell } from 'electron'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type {
  AiChatRequest,
  AppSettings,
  ChartRecord,
  EphemRequest,
  Interpretation,
  ProviderId,
  StoredChat,
  TransitSearchRequest
} from '@shared/types'
import { cancelChat, detectProviders, startChat } from './ai'
import { ensureShellPath } from './ai/proc'
import { computeMany } from './ephemeris'
import { skyReport } from './events'
import { nearestPlace, searchPlaces, zoneAt } from './geo'
import * as store from './store'
import { findReturn, fixedStars, planetaryHours, transitSearch } from './tools'

let win: BrowserWindow | null = null

function createWindow(): void {
  win = new BrowserWindow({
    width: 1480,
    height: 940,
    minWidth: 1024,
    minHeight: 680,
    show: false,
    title: 'AstroFree',
    backgroundColor: nativeTheme.shouldUseDarkColors ? '#14151a' : '#f7f5f0',
    autoHideMenuBar: process.platform !== 'darwin',
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  })
  win.once('ready-to-show', () => win?.show())

  // Links in AI answers open in the system browser, never inside the app.
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (/^https?:\/\//.test(url)) shell.openExternal(url)
    return { action: 'deny' }
  })
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
      title: 'Haritaları dışa aktar',
      defaultPath: 'astrofree-haritalar.json',
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, JSON.stringify(recs, null, 2), 'utf8')
    return true
  })
  ipcMain.handle('charts:import', async () => {
    const r = await dialog.showOpenDialog(win!, {
      title: 'Harita içe aktar',
      properties: ['openFile'],
      filters: [{ name: 'JSON', extensions: ['json'] }]
    })
    if (r.canceled || !r.filePaths[0]) return null
    const data = JSON.parse(await readFile(r.filePaths[0], 'utf8'))
    return store.importData(data)
  })

  ipcMain.handle('tools:transits', (_e, req: TransitSearchRequest) => transitSearch(req))
  ipcMain.handle('tools:return', (_e, body: number, lon: number, jd: number, sid: number | null) => findReturn(body, lon, jd, sid))
  ipcMain.handle('tools:stars', (_e, jd: number, sid: number | null) => fixedStars(jd, sid))
  ipcMain.handle('tools:hours', (_e, jd: number, lat: number, lon: number, tz: number) => planetaryHours(jd, lat, lon, tz))

  ipcMain.handle('interp:list', () => store.listInterpretations())
  ipcMain.handle('interp:add', (_e, it: Interpretation) => store.addInterpretation(it))
  ipcMain.handle('interp:update', (_e, id: string, patch: Partial<Interpretation>) => store.updateInterpretation(id, patch))
  ipcMain.handle('interp:remove', (_e, id: string) => store.removeInterpretation(id))

  ipcMain.handle('backup:choose', async () => {
    const r = await dialog.showOpenDialog(win!, { title: 'Yedek klasörü seçin', properties: ['openDirectory', 'createDirectory'] })
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
    const r = await dialog.showSaveDialog(win!, { title: 'Haritayı kaydet', defaultPath: `${name}.png`, filters: [{ name: 'PNG', extensions: ['png'] }] })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, img.toPNG())
    return true
  })
  ipcMain.handle('export:pdf', async (_e, name: string) => {
    const pdf = await win!.webContents.printToPDF({ printBackground: true, pageSize: 'A4', margins: { top: 0.4, bottom: 0.4, left: 0.4, right: 0.4 } })
    const r = await dialog.showSaveDialog(win!, { title: 'Raporu kaydet', defaultPath: `${name}.pdf`, filters: [{ name: 'PDF', extensions: ['pdf'] }] })
    if (r.canceled || !r.filePath) return false
    await writeFile(r.filePath, pdf)
    return true
  })

  ipcMain.handle('settings:get', () => store.getSettings())
  ipcMain.handle('settings:set', (_e, s: AppSettings) => store.setSettings(s))

  ipcMain.handle('secrets:set', (_e, p: ProviderId, key: string) => store.setSecret(p, key))
  ipcMain.handle('secrets:status', () => store.secretStatus())

  ipcMain.handle('chats:get', (_e, key: string) => store.getChat(key))
  ipcMain.handle('chats:set', (_e, key: string, chat: StoredChat | null) => store.setChat(key, chat))

  ipcMain.handle('geo:search', (_e, q: string, lang: string) => searchPlaces(q, lang))
  ipcMain.handle('geo:zone', (_e, lat: number, lon: number) => zoneAt(lat, lon))
  ipcMain.handle('geo:nearest', (_e, lat: number, lon: number) => nearestPlace(lat, lon))

  ipcMain.handle('ai:detect', () => detectProviders())
  ipcMain.on('ai:start', (e, req: AiChatRequest) => void startChat(req, e.sender))
  ipcMain.on('ai:cancel', (_e, id: string) => cancelChat(id))

  ipcMain.handle('app:info', () => ({
    version: app.getVersion(),
    platform: process.platform,
    userData: app.getPath('userData')
  }))
}

function buildMenu(): void {
  const isMac = process.platform === 'darwin'
  const template: Electron.MenuItemConstructorOptions[] = [
    ...(isMac ? [{ role: 'appMenu' as const }] : []),
    {
      label: 'Dosya',
      submenu: [
        { label: 'Yeni harita', accelerator: 'CmdOrCtrl+N', click: () => win?.webContents.send('menu', 'new') },
        { label: 'Kaydet', accelerator: 'CmdOrCtrl+S', click: () => win?.webContents.send('menu', 'save') },
        { type: 'separator' },
        { label: 'İçe aktar…', click: () => win?.webContents.send('menu', 'import') },
        { label: 'Dışa aktar…', click: () => win?.webContents.send('menu', 'export') },
        { type: 'separator' },
        isMac ? { role: 'close', label: 'Kapat' } : { role: 'quit', label: 'Çıkış' }
      ]
    },
    { role: 'editMenu', label: 'Düzen' },
    {
      label: 'Görünüm',
      submenu: [
        { role: 'reload', label: 'Yenile' },
        { role: 'toggleDevTools', label: 'Geliştirici araçları' },
        { type: 'separator' },
        { role: 'resetZoom', label: 'Gerçek boyut' },
        { role: 'zoomIn', label: 'Yakınlaştır' },
        { role: 'zoomOut', label: 'Uzaklaştır' },
        { type: 'separator' },
        { role: 'togglefullscreen', label: 'Tam ekran' }
      ]
    },
    { role: 'windowMenu', label: 'Pencere' }
  ]
  Menu.setApplicationMenu(Menu.buildFromTemplate(template))
}

app.whenReady().then(() => {
  void ensureShellPath()
  registerIpc()
  buildMenu()
  createWindow()
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
