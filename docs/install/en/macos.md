# AstroFree — Installing on macOS

**Requirements:** macOS 12 Monterey or later · Apple Silicon (M1–M5) or Intel · about 400 MB of free space.

*Türkçe: [macOS kurulumu](../macos.md)*

## 1. Download the right file

Open the [latest release](https://github.com/canerkoroglu/astrofree/releases/latest) and, under **Assets**, download
the file that matches your Mac:

| Your Mac | File to download |
|---|---|
| Apple Silicon (M1, M2, M3, M4, M5) | `AstroFree-<version>-mac-arm64.dmg` |
| Intel | `AstroFree-<version>-mac-x64.dmg` |

Not sure which one you have? Open the  menu → **About This Mac**. If it says "Chip: Apple M…", choose arm64; if it
says "Processor: Intel", choose x64.

The `.zip` files are used by automatic updates; for a manual install use the `.dmg`.

## 2. Install

1. Double-click the downloaded `.dmg`.
2. In the window that opens, drag the **AstroFree** icon onto the **Applications** folder.
3. Eject the disk image (⏏ in the Finder sidebar).

## 3. First launch

AstroFree is not notarized by Apple yet, so macOS shows a warning the first time you open it. You only need to
approve it once.

**macOS 15 Sequoia and later**

1. Double-click AstroFree in Applications; when macOS says it "could not verify" the app, click **Done**.
2. Open  → **System Settings** → **Privacy & Security**.
3. Scroll down to "AstroFree was blocked…" and click **Open Anyway**, then confirm with your password.

**macOS 12–14**

1. In Applications, **right-click** AstroFree (or Control-click) → **Open**.
2. Click **Open** again in the dialog.

### "AstroFree is damaged and can't be opened"

This comes from the quarantine flag macOS adds to downloaded files; the app is not actually damaged. Open Terminal,
run the command below, then open the app as usual:

```bash
xattr -cr /Applications/AstroFree.app
```

## 4. Getting started

- On first launch a short guide lets you pick the interface language, the theme and the AI tool to use, and helps you
  add your first person.
- Use **New person** (⌘N) to enter a date, time and place of birth; the chart is drawn immediately.
- For AI chat, choose a provider in **Settings → AI**. If Claude Code or Codex is installed on your Mac, nothing else
  is needed; for API providers, enter your own key.

## 5. Updating

When a new version is out, a **New version · Download** link appears in the toolbar. Download the new `.dmg` and drag
AstroFree onto the old copy in Applications (choose **Replace**). Your data is kept.

## 6. Uninstalling

1. Drag AstroFree from Applications to the Trash.
2. To remove your data as well (charts, settings, chats — this cannot be undone; you can make a copy first with
   **File → Export…**), press ⇧⌘G in Finder, go to the folder below and delete it:

```
~/Library/Application Support/AstroFree
```

## Troubleshooting

| Problem | Fix |
|---|---|
| The app does not open; the Dock icon bounces and disappears | You may have downloaded the wrong architecture; check arm64 vs x64. |
| Astrological symbols show as boxes | Quit the app completely and reopen it; if it persists, open an issue. |
| Claude Code / Codex "not found" | Run `which claude` or `which codex` in Terminal and paste the result into **Settings → AI → Command**. |
| No notifications |  → System Settings → Notifications → AstroFree → Allow notifications. |

Report a problem: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues) · astrofree@cklabs.tr
