# AstroFree — Installing on Linux

**Requirements:** 64-bit (x86_64) distribution · glibc 2.31+ (Ubuntu 20.04, Debian 11, Fedora 36 or later) ·
X11 or Wayland desktop · about 400 MB of free space.

*Türkçe: [Linux kurulumu](../linux.md)*

Open the [latest release](https://github.com/canerkoroglu/astrofree/releases/latest) and download the package for
your distribution from **Assets**.

| Package | When to use it |
|---|---|
| `AstroFree-<version>-linux-x86_64.AppImage` | Works on any distribution, needs no installation, **updates itself**. |
| `AstroFree-<version>-linux-amd64.deb` | Debian, Ubuntu, Linux Mint, Pop!_OS, elementary OS and derivatives. |

## Option A — AppImage (all distributions)

```bash
cd ~/Downloads
chmod +x AstroFree-*.AppImage
./AstroFree-*.AppImage
```

You can also do this in your file manager: right-click the file → **Properties → Permissions → "Allow executing file
as program"**, then double-click it.

If you get a **libfuse error** ("AppImages require FUSE to run"):

```bash
# Ubuntu 24.04+
sudo apt install libfuse2t64
# Ubuntu 22.04 / Debian 12 and older
sudo apt install libfuse2
# Fedora
sudo dnf install fuse-libs
```

To get a menu entry, use [Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) or AppImageLauncher, or move the
file to `~/Applications`.

## Option B — .deb package (Debian / Ubuntu)

```bash
cd ~/Downloads
sudo apt install ./AstroFree-*-linux-amd64.deb
```

After installation AstroFree appears in your application menu (category: Science). You can also start it from a
terminal with `astro-free`.

## Fedora, openSUSE, Arch

There is no official `.rpm` or AUR package yet; use the **AppImage**.

## Getting started

- On first launch a short guide lets you pick the interface language, the theme and the AI tool to use, and helps you
  add your first person.
- Use **New person** (Ctrl+N) to enter the birth details; the chart is drawn immediately.
- For AI chat, open **Settings → AI**. Claude Code or Codex installed on your system is found automatically through
  your login shell's `PATH`; for API providers, enter your own key.
- To store API keys encrypted, a keyring service (GNOME Keyring or KWallet) must be running.

## Updating

- **AppImage:** new releases download in the background; apply them with **v… ready · Restart** in the toolbar.
- **.deb:** use the **New version · Download** link, then install the new package with
  `sudo apt install ./AstroFree-*.deb`.

## Uninstalling

```bash
# .deb
sudo apt remove astro-free
# AppImage: just delete the file
rm ~/Downloads/AstroFree-*.AppImage
```

To remove your data as well (this cannot be undone; you can make a copy first with **File → Export…**):

```bash
rm -r ~/.config/AstroFree
```

## Troubleshooting

| Problem | Fix |
|---|---|
| The app does not start; the terminal shows a "sandbox" error | Some distributions restrict user namespaces (e.g. AppArmor on Ubuntu 24.04). Try `./AstroFree-*.AppImage --no-sandbox`. |
| Blurry window on Wayland | Start it with `--ozone-platform-hint=auto`. |
| No notifications | Make sure a notification service is running on your desktop (GNOME, KDE, dunst…). |
| Claude Code "not found" | `which claude` → paste into **Settings → AI → Command / path**. Details: [AI connection guide](../../en/ai-setup.md). |

Report a problem: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues) · astrofree@cklabs.tr
