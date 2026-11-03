# AstroFree — Installing on Windows

**Requirements:** Windows 10 (1809+) or Windows 11 · 64-bit (x64) · about 400 MB of free space.

*Türkçe: [Windows kurulumu](../windows.md)*

## 1. Choose an installer

Open the [latest release](https://github.com/canerkoroglu/astrofree/releases/latest) and download one of these from
**Assets**:

| File | When to use it |
|---|---|
| `AstroFree-<version>-win-x64.exe` | **Recommended.** Regular installer with a Start menu shortcut and **automatic updates**. |
| `AstroFree-<version>-win-portable.exe` | No installation; runs from a USB stick or on computers without admin rights. Does not update itself. |

## 2. Install (recommended)

1. Double-click the downloaded `AstroFree-<version>-win-x64.exe`.
2. If **Windows protected your PC** (SmartScreen) appears, click **More info**, then **Run anyway**. This warning
   shows because the app does not carry a paid code-signing certificate yet.
3. Choose whether to install for yourself only or for all users.
4. Change the install folder if you like and click **Install**.
5. When it finishes, open AstroFree from the Start menu or the desktop shortcut.

### Portable version

Put `AstroFree-<version>-win-portable.exe` in any folder and double-click it (on the SmartScreen prompt, again choose
**More info → Run anyway**). Nothing is installed; your data is still kept in your user folder
(`%APPDATA%\AstroFree`).

## 3. Getting started

- On first launch a short guide lets you pick the interface language, the theme and the AI tool to use, and helps you
  add your first person.
- Use **New person** (Ctrl+N) to enter the birth details; the chart is drawn immediately.
- For AI chat, open **Settings → AI**. Claude Code or Codex installed on your computer (for example with
  `npm install -g @anthropic-ai/claude-code`) is found automatically; for API providers, enter your own key.

## 4. Updating

The installed version downloads new releases in the background and offers **v… ready · Restart** in the toolbar.
For the portable version, use the **New version · Download** link and replace the `.exe`.

## 5. Uninstalling

1. **Settings → Apps → Installed apps** → AstroFree → **Uninstall**.
2. To remove your data as well (this cannot be undone; you can make a copy first with **File → Export…**), press
   Win+R, type `%APPDATA%\AstroFree` and delete the folder that opens.

For the portable version, just delete the `.exe`.

## Troubleshooting

| Problem | Fix |
|---|---|
| There is no "Run anyway" button | SmartScreen may be locked down by company policy; ask your IT administrator or try the portable version. |
| Antivirus quarantined the file | New unsigned releases can trigger false positives. Make sure you downloaded it from the official GitHub page, then add an exception. |
| Claude Code / Codex "not found" | Run `where.exe claude` in PowerShell and paste the result into **Settings → AI → Command**. |
| The window looks blurry | .exe → Properties → Compatibility → Change high DPI settings → scaling performed by "Application". |

Report a problem: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues) · astrofree@cklabs.tr
