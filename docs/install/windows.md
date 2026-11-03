# AstroFree — Windows kurulumu

**Gereksinim:** Windows 10 (1809+) veya Windows 11 · 64 bit (x64) · ~400 MB boş alan.

## 1. Kurulum türünü seçin

[Son sürüm sayfasını](https://github.com/canerkoroglu/astrofree/releases/latest) açın ve **Assets** bölümünden
birini indirin:

| Dosya | Ne zaman |
|---|---|
| `AstroFree-<sürüm>-win-x64.exe` | **Önerilen.** Normal kurulum; Başlat menüsü kısayolu ve **otomatik güncelleme** içerir. |
| `AstroFree-<sürüm>-win-portable.exe` | Kurulumsuz; USB bellekten veya yönetici izni olmayan bilgisayarlarda çalıştırmak için. Otomatik güncellenmez. |

## 2. Kurulum (önerilen)

1. İndirilen `AstroFree-<sürüm>-win-x64.exe` dosyasına çift tıklayın.
2. **Windows kişisel bilgisayarınızı korudu** (SmartScreen) penceresi çıkarsa **Ek bilgi**'ye, ardından
   **Yine de çalıştır**'a tıklayın. Bu uyarı, uygulama henüz ücretli bir kod imzalama sertifikası taşımadığı
   için görünür.
3. Kurulumun yalnızca sizin için mi yoksa tüm kullanıcılar için mi yapılacağını seçin.
4. İsterseniz kurulum klasörünü değiştirin, **Yükle**'ye basın.
5. Kurulum bitince AstroFree'yi Başlat menüsünden veya masaüstü kısayolundan açın.

### Portable sürüm

`AstroFree-<sürüm>-win-portable.exe` dosyasını istediğiniz bir klasöre koyup çift tıklayın (SmartScreen
uyarısında yine **Ek bilgi → Yine de çalıştır**). Kurulum yapılmaz; verileriniz yine kullanıcı klasörünüzde
(`%APPDATA%\AstroFree`) tutulur.

## 3. İlk kullanım

- İlk açılışta kısa bir rehber arayüz dilini, temayı ve kullanılacak yapay zekâ aracını seçtirir, ilk kişiyi eklemenize yardım eder.
- **Yeni kişi** (Ctrl+N) ile doğum bilgilerini girin; harita anında çizilir.
- Yapay zekâ sohbeti için **Ayarlar → Yapay zekâ**. Claude Code / Codex / Gemini CLI kuruluysa (npm ile
  `npm install -g @anthropic-ai/claude-code` vb.) otomatik bulunur; API sağlayıcıları için anahtar girin.

## 4. Güncelleme

Kurulumlu sürüm yeni sürümleri arka planda indirir ve araç çubuğunda **v… hazır · Yeniden başlat**
seçeneği sunar. Portable sürümde **Yeni sürüm · İndir** bağlantısından yeni dosyayı indirin.

## 5. Kaldırma

1. **Ayarlar → Uygulamalar → Yüklü uygulamalar** → AstroFree → **Kaldır**.
2. Verilerinizi de silmek isterseniz (geri alınamaz; önce Dosya → Dışa aktar ile yedek alabilirsiniz)
   Win+R → `%APPDATA%\AstroFree` yazıp açılan klasörü silin.

Portable sürüm için `.exe` dosyasını silmeniz yeterlidir.

## Sorun giderme

| Sorun | Çözüm |
|---|---|
| "Yine de çalıştır" düğmesi yok | Kurumsal bilgisayarlarda SmartScreen politikası engelliyor olabilir; BT yöneticinize danışın veya portable sürümü deneyin. |
| Antivirüs dosyayı karantinaya aldı | İmzasız yeni sürümlerde yanlış alarm görülebilir. Dosyayı yalnızca resmi GitHub sayfasından indirdiğinizden emin olup istisna ekleyin. |
| Claude Code / Codex "bulunamadı" | PowerShell'de `where.exe claude` çıktısını Ayarlar → Yapay zekâ → Komut alanına yazın. |
| Ekran bulanık görünüyor | .exe → Özellikler → Uyumluluk → Yüksek DPI ayarları → "Uygulama" ölçeklendirmesini seçin. |

Hata bildirmek için: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues)
