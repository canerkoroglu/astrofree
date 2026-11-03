# AstroFree — Linux kurulumu

**Gereksinim:** 64 bit (x86_64) dağıtım · glibc 2.31+ (Ubuntu 20.04, Debian 11, Fedora 36 ve sonrası) ·
X11 veya Wayland masaüstü · ~400 MB boş alan.

[Son sürüm sayfasını](https://github.com/canerkoroglu/astrofree/releases/latest) açın ve **Assets**
bölümünden dağıtımınıza uygun paketi indirin.

| Paket | Ne zaman |
|---|---|
| `AstroFree-<sürüm>-linux-x86_64.AppImage` | Her dağıtımda çalışır, kurulum gerektirmez, **otomatik güncellenir**. |
| `AstroFree-<sürüm>-linux-amd64.deb` | Debian, Ubuntu, Linux Mint, Pop!_OS, elementary OS ve türevleri. |

## Seçenek A — AppImage (tüm dağıtımlar)

```bash
cd ~/Downloads
chmod +x AstroFree-*.AppImage
./AstroFree-*.AppImage
```

Dosya yöneticisinden de yapılabilir: dosyaya sağ tık → **Özellikler → İzinler → "Program olarak çalıştır"**,
ardından çift tık.

**libfuse hatası** ("AppImages require FUSE to run") alırsanız:

```bash
# Ubuntu 22.04+ / Debian 12+
sudo apt install libfuse2t64   # Ubuntu 24.04+; daha eskilerde: sudo apt install libfuse2
# Fedora
sudo dnf install fuse-libs
```

Menüde görünmesi için [Gear Lever](https://flathub.org/apps/it.mijorus.gearlever) veya AppImageLauncher
kullanabilir ya da dosyayı `~/Applications` klasörüne taşıyabilirsiniz.

## Seçenek B — .deb paketi (Debian / Ubuntu)

```bash
cd ~/Downloads
sudo apt install ./AstroFree-*-linux-amd64.deb
```

Kurulumdan sonra uygulama menüsünde **AstroFree** olarak görünür (kategori: Bilim). Terminalden
`astro-free` komutuyla da başlatılabilir.

## Fedora, openSUSE, Arch

Şimdilik resmi `.rpm` veya AUR paketi yoktur; **AppImage** kullanın.

## İlk kullanım

- İlk açılışta kısa bir rehber arayüz dilini, temayı ve kullanılacak yapay zekâ aracını seçtirir, ilk kişiyi eklemenize yardım eder.
- **Yeni kişi** (Ctrl+N) ile doğum bilgilerini girin; harita anında çizilir.
- Yapay zekâ sohbeti için **Ayarlar → Yapay zekâ**. Claude Code / Codex / Gemini CLI kuruluysa giriş
  kabuğunuzdaki `PATH` üzerinden otomatik bulunur.
- API anahtarlarının şifreli saklanması için bir anahtar zinciri hizmeti (GNOME Keyring veya KWallet) çalışıyor olmalıdır.

## Güncelleme

- **AppImage:** yeni sürüm arka planda indirilir; araç çubuğundaki **v… hazır · Yeniden başlat** ile uygulanır.
- **.deb:** **Yeni sürüm · İndir** bağlantısından yeni paketi indirip `sudo apt install ./AstroFree-*.deb` ile kurun.

## Kaldırma

```bash
# .deb
sudo apt remove astro-free
# AppImage: dosyayı silmeniz yeterli
rm ~/Downloads/AstroFree-*.AppImage
```

Verilerinizi de silmek isterseniz (geri alınamaz; önce Dosya → Dışa aktar ile yedek alabilirsiniz):

```bash
rm -r ~/.config/AstroFree
```

## Sorun giderme

| Sorun | Çözüm |
|---|---|
| Uygulama açılmıyor, terminalde "sandbox" hatası | Bazı dağıtımlar kullanıcı ad alanlarını kısıtlar (Ubuntu 24.04 AppArmor). `./AstroFree-*.AppImage --no-sandbox` ile deneyin. |
| Wayland'da bulanık görünüm | `--ozone-platform-hint=auto` bayrağıyla başlatın. |
| Bildirimler gelmiyor | Masaüstünüzde bir bildirim hizmeti (ör. GNOME, KDE, dunst) çalıştığından emin olun. |
| Claude Code "bulunamadı" | `which claude` çıktısını Ayarlar → Yapay zekâ → Komut alanına yazın. |

Hata bildirmek için: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues)
