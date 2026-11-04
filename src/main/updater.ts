// Background auto-update from GitHub Releases (electron-updater). Windows
// installer and Linux AppImage only: macOS needs a Developer ID signature for
// Squirrel.Mac, and the portable .exe cannot replace itself. Store and Scoop
// installs are updated by their package manager.
import { app, ipcMain, type BrowserWindow } from 'electron'

export function startAutoUpdate(win: BrowserWindow): void {
  const supported =
    app.isPackaged &&
    (process.platform === 'win32'
      ? !process.env.PORTABLE_EXECUTABLE_DIR && !process.windowsStore && !/[\\/]scoop[\\/]apps[\\/]/i.test(app.getPath('exe'))
      : process.platform === 'linux' && !!process.env.APPIMAGE)
  if (!supported) return
  void (async () => {
    try {
      const { autoUpdater } = (await import('electron-updater')).default ?? (await import('electron-updater'))
      autoUpdater.autoDownload = true
      autoUpdater.on('update-downloaded', (info: { version: string }) => {
        if (!win.isDestroyed()) win.webContents.send('update-ready', info.version)
      })
      ipcMain.handle('app:installUpdate', () => autoUpdater.quitAndInstall())
      await autoUpdater.checkForUpdates()
      setInterval(() => void autoUpdater.checkForUpdates().catch(() => undefined), 6 * 60 * 60 * 1000)
    } catch {
      /* offline or no release metadata: stay quiet */
    }
  })()
}
