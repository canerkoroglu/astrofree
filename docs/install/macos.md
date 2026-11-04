# AstroFree — macOS kurulumu

**Gereksinim:** macOS 12 Monterey veya üzeri · Apple Silicon (M1–M5) ya da Intel işlemci · ~400 MB boş alan.

*English: [Installing on macOS](en/macos.md)*

## 1. Doğru dosyayı indirin

[Son sürüm sayfasını](https://github.com/canerkoroglu/astrofree/releases/latest) açın ve **Assets** bölümünden
Mac'inize uygun dosyayı indirin:

| Mac'iniz | İndirilecek dosya |
|---|---|
| Apple Silicon (M1, M2, M3, M4, M5) | `AstroFree-<sürüm>-mac-arm64.dmg` |
| Intel işlemcili | `AstroFree-<sürüm>-mac-x64.dmg` |

Hangisine sahip olduğunuzu öğrenmek için:  menüsü → **Bu Mac Hakkında**. "Yonga: Apple M…" yazıyorsa
arm64, "İşlemci: Intel" yazıyorsa x64 dosyasını seçin.

`.zip` dosyaları otomatik güncelleme içindir; elle kurulumda `.dmg` kullanın.

## 2. Kurun

1. İndirilen `.dmg` dosyasına çift tıklayın.
2. Açılan pencerede **AstroFree** simgesini **Applications (Uygulamalar)** klasörüne sürükleyin.
3. Diski çıkarın (Finder kenar çubuğunda ⏏).

## 3. İlk açılış

AstroFree henüz Apple tarafından notarize edilmediği için macOS ilk açılışta uyarı verir. Bir kez onaylamanız yeterlidir.

**macOS 15 Sequoia ve sonrası**

1. Uygulamalar klasöründe AstroFree'ye çift tıklayın; "Apple doğrulayamadı" uyarısında **Bitti**'ye basın.
2.  → **Sistem Ayarları** → **Gizlilik ve Güvenlik**'i açın.
3. Aşağıda "AstroFree engellendi" satırındaki **Yine de Aç** düğmesine basın ve parolanızla onaylayın.

**macOS 12–14**

1. Uygulamalar klasöründe AstroFree'ye **sağ tıklayın** (veya Control + tık) → **Aç**.
2. Uyarı penceresinde yeniden **Aç**'a basın.

### "AstroFree hasarlı ve açılamıyor" uyarısı

Bu, internetten indirilen dosyaya eklenen karantina işaretinden kaynaklanır; dosya bozuk değildir.
Terminal'i açıp şu komutu çalıştırın, ardından uygulamayı normal şekilde açın:

```bash
xattr -cr /Applications/AstroFree.app
```

## 4. İlk kullanım

- İlk açılışta kısa bir rehber arayüz dilini, temayı ve kullanılacak yapay zekâ aracını seçtirir, ilk kişiyi eklemenize yardım eder.
- **Yeni kişi** (⌘N) ile doğum tarihi, saati ve yerini girin; harita anında çizilir.
- Yapay zekâ sohbeti için Ayarlar → **Yapay zekâ** bölümünden bir sağlayıcı seçin. Claude Code veya Codex
  kuruluysa ek ayar gerekmez; API sağlayıcıları için anahtarınızı girin.

## 5. Güncelleme

Yeni bir sürüm çıktığında araç çubuğunda **Yeni sürüm · İndir** bağlantısı görünür. Yeni `.dmg`'yi indirip
Uygulamalar klasöründeki eski sürümün üzerine sürükleyin ("Değiştir"). Verileriniz korunur.

## 6. Kaldırma

1. Uygulamalar klasöründen AstroFree'yi Çöp Sepeti'ne sürükleyin.
2. Verilerinizi de silmek isterseniz (haritalar, ayarlar, sohbetler — geri alınamaz, önce Dosya → Dışa aktar
   ile yedek alabilirsiniz) Finder'da ⇧⌘G ile şu klasöre gidip silin:

```
~/Library/Application Support/AstroFree
```

## Sorun giderme

| Sorun | Çözüm |
|---|---|
| Uygulama açılmıyor, simge zıplayıp kayboluyor | Yanlış mimari indirilmiş olabilir; arm64/x64 dosyasını kontrol edin. |
| Astrolojik semboller kare görünüyor | Uygulamayı tamamen kapatıp açın; sorun sürerse bir hata kaydı açın. |
| Claude Code / Codex "bulunamadı" | `which claude` çıktısını Ayarlar → Yapay zekâ → Komut / yol alanına yazın. Claude masaüstü uygulaması Claude Code değildir; ayrıntı: [Yapay zekâ bağlantı rehberi](../ai-setup.md). |
| Bildirimler gelmiyor |  → Sistem Ayarları → Bildirimler → AstroFree → İzin Ver. |

Hata bildirmek için: [GitHub Issues](https://github.com/canerkoroglu/astrofree/issues) · astrofree@cklabs.tr
