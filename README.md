# AstroFree

**Ücretsiz, açık kaynak ve çevrimdışı çalışan masaüstü astroloji programı.**
Doğum haritası, transit, progresyon, solar ark, sinastri, kompozit/Davison, Güneş/Ay dönüşü, astrokartografi ve
daha fazlası; haritayı **Claude Code, Codex, Gemini, DeepSeek** veya diğer yapay zekâ servisleriyle yorumlatıp
üzerine sohbet edebilirsiniz. macOS, Windows ve Linux'ta çalışır.

> **English:** AstroFree is a free, open-source, offline-first desktop astrology app (macOS / Windows / Linux)
> built on the Swiss Ephemeris. It draws natal, transit, progressed, solar-arc, synastry, composite/Davison and
> return charts, steps time minute by minute with a live-updating wheel, and lets you discuss the chart on
> screen with Claude Code, Codex, Gemini, DeepSeek or any OpenAI-compatible API. The interface is fully
> available in Turkish and English (Settings → General → Language). Installation guides:
> [macOS](docs/install/macos.md) · [Windows](docs/install/windows.md) · [Linux](docs/install/linux.md).

---

## İçindekiler

- [İndirme ve kurulum](#i̇ndirme-ve-kurulum)
- [Öne çıkanlar](#öne-çıkanlar)
- [Özellikler](#özellikler)
- [Yapay zekâ entegrasyonu](#yapay-zekâ-entegrasyonu)
- [Klavye kısayolları](#klavye-kısayolları)
- [Veriler, gizlilik ve yedekleme](#veriler-gizlilik-ve-yedekleme)
- [Hesap doğruluğu](#hesap-doğruluğu)
- [Geliştirme](#geliştirme)
- [Yeni bir dil eklemek](#yeni-bir-dil-eklemek)
- [Sürüm yayınlama](#sürüm-yayınlama)
- [Proje yapısı](#proje-yapısı)
- [Lisans](#lisans)

---

## İndirme ve kurulum

Hazır paketler [GitHub Releases](https://github.com/canerkoroglu/astrofree/releases/latest) sayfasındadır.

| İşletim sistemi | Dosya | Ayrıntılı rehber |
|---|---|---|
| macOS 12+ (Apple Silicon) | `AstroFree-<sürüm>-mac-arm64.dmg` | [docs/install/macos.md](docs/install/macos.md) |
| macOS 12+ (Intel) | `AstroFree-<sürüm>-mac-x64.dmg` | [docs/install/macos.md](docs/install/macos.md) |
| Windows 10 / 11 (64 bit) | `AstroFree-<sürüm>-win-x64.exe` (kurulum) veya `AstroFree-<sürüm>-win-portable.exe` | [docs/install/windows.md](docs/install/windows.md) |
| Linux (x86_64) | `.AppImage` veya `.deb` | [docs/install/linux.md](docs/install/linux.md) |

Uygulama henüz ücretli kod imzası taşımadığı için macOS'ta ilk açılışta **sağ tık → Aç**, Windows'ta
SmartScreen uyarısında **Ek bilgi → Yine de çalıştır** gerekir. Rehberler bunu adım adım anlatır.

## Öne çıkanlar

- **Swiss Ephemeris doğruluğu** — astro.com ile ark-saniye düzeyinde aynı sonuçlar.
- **Canlı zaman** — dakika, saat, gün, ay, yıl adımlarıyla ileri/geri; çark ve tüm tablolar anında güncellenir.
- **Tamamen çevrimdışı** — efemeris, ~70.000 şehir + Türkiye ilçeleri, saat dilimleri, dünya haritası ve
  fontlar uygulamanın içinde. İnternet yalnızca yapay zekâ sohbeti ve güncelleme denetimi için gerekir.
- **Yapay zekâ ile sohbet** — ekrandaki haritanın tam verisi her mesajla gönderilir; zamanı oynattıkça
  yorum güncel transitleri izler.
- **Hesap yok, abonelik yok, reklam yok** — verileriniz yalnızca kendi bilgisayarınızda durur.
- **Türkçe ve İngilizce arayüz**, yeni dil eklemek tek dosya.

## Özellikler

### Haritalar
- **Natal çark** ve en fazla **üç dış halka**: Transit, İkincil progresyon (Naibod MC), Solar ark, Sinastri,
  Kompozit (orta nokta) ve Davison (zaman ve yer orta noktası).
- **Güneş ve Ay dönüşü** — yıl alanı ve ◀ ▶ ile istenen dönüş; dış halka olarak ya da kendi evleriyle ayrı harita.
- **Harmonik haritalar** (H1–H16) ve Ebertin tarzı **orta nokta** listesi.
- 11 **ev sistemi** (varsayılan Alcabitius; Placidus, Koch, Eşit, Tam Burç, Regiomontanus, Campanus…),
  **tropikal veya sidereal** zodyak (Lahiri, Fagan-Bradley ve diğer ayanamsalar).
- Chiron, büyük asteroitler, ortalama/gerçek Ay düğümü, ortalama/oskülasyonlu Lilith, Şans Noktası.
- Glif çakışma önleme, orb'a göre kalınlaşan açı çizgileri; gezegene tıklayınca ayrıntı kartı, açı
  çizgisine tıklayınca o açının yapay zekâ yorumu.

### Zaman
- ±saniye / dakika / saat / gün / hafta / ay / yıl adımları, ← → tuşları, Shift ile ×10, boşluk tuşuyla animasyon,
  **Alt (⌥) + fare tekerleği** ile çark üzerinde zaman kaydırma, **Canlı** mod (gerçek saat).
- Tarih alanına `17.01.1942 18:35`, `17 Ocak 1942` gibi serbest yazım ya da açılır takvim.
- "Doğum zamanı" kipinde doğum saati oynatılır (rektifikasyon).
- **Saat dilimleri:** IANA bölgeleri (tarihsel yaz saati dahil), sabit fark veya Yerel Ortalama Zaman (LMT);
  1582 öncesi için Jülyen takvimi.

### Kişiler ve olaylar
- Kişi veya olay (evlilik, kuruluş, taşınma…) kaydı; yazarken canlı Güneş–Ay–Yükselen önizlemesi.
- "Doğum saati bilinmiyor" seçeneği, **Rodden** veri güvenilirliği, etiketler ve notlar.
- Şehir/ilçe araması (çevrimdışı), `38n15`, `41K01`, `38°15'30" N` gibi koordinat biçimleri ya da dünya
  haritasından tıklayarak seçim; en yakın yerleşim ve saat dilimi otomatik bulunur.
- **İçe aktarma:** AAF (astro.com, AstroGold, Solar Fire, Janus) ve CSV. Dışa aktarma: JSON.

### Analiz
- **Natal Bilgiler:** Güneş–Ay–Yükselen, harita yöneticisi, ay evresi, element/nitelik dengesi, gezegen
  tablosu (burç, ev, hız, deklinasyon), açılar (yaklaşan/ayrılan), asaletler, evler ve yöneticileri.
- **Açı kalıpları:** Büyük Üçgen, T-Kare, Büyük Haç, Yod, Uçurtma, Mistik Dikdörtgen, stelyumlar.
- **Geleneksel teknikler:** esas asalet tablosu (Mısır sınırları, Dorotheus üçlüleri, Kalde yüzleri, Lilly puanı),
  sekt, almuten, yıllık/aylık profeksiyon, firdaria, 7 Hermetik nokta.
- **Sabit yıldızlar:** 33 parlak yıldızın gezegen ve köşelerle kavuşumları.

### Zaman araçları
- **Gökyüzü paneli:** ay evresi, boşluktaki Ay, gezegen günü ve saatleri, retrolar (ilerleme çubuğuyla),
  duraklar, burç geçişleri, yeni ay/dolunay ve tutulmalar; bir olaya tıklamak zamanı oraya taşır.
- **Transit takvimi:** 1–36 ay için her transitin orb'a giriş, tam isabet (retro geçişleri dahil) ve çıkış tarihleri.
- **Grafik efemeris:** 360° / 90° / 45° / 30° kiplerinde transit eğrileri.
- **Zaman seçimi (elektif):** Ay burcu, boşluk, büyüyen Ay, retro olmayan gezegenler, açı ve köşe koşullarını
  birlikte sağlayan zaman aralıklarını bulur.
- **Astrokartografi:** MC/IC/ASC/DSC çizgileri dünya haritasında; bir yere tıklayınca yakın çizgiler ve
  o yere taşınmış harita.
- **Masaüstü bildirimleri:** kayıtlı kişilere yaklaşan önemli transitler.

### Diğer
- Yapay zekâ yanıtlarını kişiye **yorum** olarak kaydetme ve düzenleme.
- **PNG** (çark) ve **PDF** rapor (çark + natal bilgiler + kayıtlı yorumlar).
- **Açık / koyu / sistem** teması, ilk açılış rehberi.
- **Otomatik yedek** (iCloud Drive, Dropbox vb. bir klasöre günlük, 30 gün saklanır).
- **Otomatik güncelleme** (Windows kurulumu ve Linux AppImage); macOS ve portable sürümde bildirim.

## Yapay zekâ entegrasyonu

Sohbet panelinde her mesajla ekrandaki haritanın tam verisi (konumlar, evler, yöneticiler, açılar,
transit→natal açılar, progresyonlar…) gönderilir. "Gönderilen veri" bağlantısı tam metni gösterir.

| Sağlayıcı | Nasıl çalışır | Gereken |
|---|---|---|
| Claude Code (CLI) | `claude -p`, araçsız ve oturum kaydetmeyen yalın kip | `claude` kurulu ve giriş yapılmış |
| Codex (CLI) | `codex exec --json`, salt okunur, kalıcı oturum yok | `codex login` |
| Gemini (CLI) | `gemini -o stream-json` | `gemini` ile giriş ya da Gemini API anahtarı |
| Claude, OpenAI, Gemini, DeepSeek API | HTTPS akışı | Ayarlar → Yapay zekâ'dan API anahtarı |

- CLI sağlayıcıları bilgisayarınızdaki mevcut oturumu kullanır; AstroFree hiçbir kimlik bilgisini görmez.
  Ajanlar boş bir çalışma klasöründe, dosya erişimi ve araçları kapalı olarak çalıştırılır.
- API anahtarları işletim sisteminin anahtar zinciriyle (Electron `safeStorage`) şifrelenip yalnızca yerel olarak saklanır.
- Komut yolu, ek argümanlar, model, yanıt dili ve sistem talimatı Ayarlar → Yapay zekâ bölümünden değiştirilebilir.
- OpenAI uyumlu herhangi bir uç nokta (ör. yerel bir LM Studio / Ollama sunucusu) "Temel URL" ile kullanılabilir.

Yapay zekâ yorumları eğlence ve kişisel keşif amaçlıdır; tıbbi, hukuki veya finansal tavsiye yerine geçmez.

## Klavye kısayolları

| Tuş | İşlev |
|---|---|
| ← → | Seçili adım kadar geri / ileri (Shift ile 10 adım) |
| ↑ ↓ | Adım boyunu değiştir |
| Alt/⌥ + tekerlek | Çark üzerinde zamanı kaydır |
| Boşluk | Animasyonu başlat / durdur |
| N | Şimdiki zamana git |
| Ctrl/⌘ + N | Yeni kişi |
| Ctrl/⌘ + S | Kaydet |
| Ctrl/⌘ + Enter | Formu kaydet |
| Esc | Pencereyi kapat |
| ? | Tüm kısayollar |

## Veriler, gizlilik ve yedekleme

Haritalar, ayarlar, sohbetler ve yorumlar kullanıcı veri klasöründe JSON olarak tutulur:

| Sistem | Klasör |
|---|---|
| macOS | `~/Library/Application Support/AstroFree` |
| Windows | `%APPDATA%\AstroFree` |
| Linux | `~/.config/AstroFree` |

AstroFree telemetri, analitik veya reklam içermez. Ağ bağlantısı yalnızca şu durumlarda kurulur:
seçtiğiniz yapay zekâ sağlayıcısına mesaj gönderdiğinizde, yerel listede bulunmayan bir yer adı arandığında
(Open-Meteo geocoding) ve GitHub'da yeni sürüm denetiminde.

## Hesap doğruluğu

`npm run test:engine`, efemeris sonuçlarını astro.com'dan alınmış değerlerle karşılaştırır (gezegenler, köşeler,
ev başlangıçları, Naibod progresyonu). Uygulamaya gömülü Swiss Ephemeris dosyaları 1800–2400 yıllarını
ark-saniyenin altında doğrulukla kapsar; bu aralığın dışında Swiss Ephemeris kendiliğinden Moshier analitik
çözümüne geçer (gezegenlerde ~1″ civarı).

## Geliştirme

Gereksinimler: **Node.js 24+**, npm.

```bash
git clone https://github.com/canerkoroglu/astrofree.git
cd astrofree
npm install
npm run dev
```

| Komut | Açıklama |
|---|---|
| `npm run dev` | Geliştirme kipi (anında yeniden yükleme) |
| `npm run build` | Derleme (`out/`) |
| `npm start` | Derlenmiş uygulamayı çalıştır |
| `npm run typecheck` | TypeScript denetimi |
| `npm run test:engine` | Efemeris doğruluk testi |
| `npm run test:e2e` | Uçtan uca arayüz testleri (`E2E_AI=1` ile yerel Claude Code / Codex de denenir) |
| `npm run i18n:check` | Dillerdeki eksik çevirileri listeler |
| `npm run dist:mac` / `dist:win` / `dist:linux` | Paketleme (her sistem kendi üzerinde) |

Şehir veritabanını ve dünya haritasını yenilemek için:

```bash
# GeoNames: cities5000.zip, admin1CodesASCII.txt, TR.zip (download.geonames.org/export/dump)
node scripts/build-cities.mjs cities5000.txt admin1CodesASCII.txt TR.txt
# Natural Earth: ne_50m_admin_0_countries, ne_10m_admin_1_states_provinces (GeoJSON)
node scripts/build-worldmap.mjs ne_50m_admin_0_countries.geojson ne_10m_admin_1_states_provinces.geojson
```

## Yeni bir dil eklemek

Bütün diller tek bir kayıttan gelir (`src/shared/i18n`). Kaynak dil Türkçedir; çeviriler Türkçe metni anahtar alır.

1. `src/shared/i18n/en.ts` dosyasını `src/shared/i18n/<kod>.ts` olarak kopyalayın (ör. `de.ts`).
2. `code`, `name`, `intl`, `dateOrder`, gezegen/burç/açı/ay/gün adlarını, pusula harflerini ve `systemPrompt`'u çevirin.
3. `strings` içindeki değerleri çevirin (anahtarlara dokunmayın).
4. `src/shared/i18n/index.ts` içindeki `LOCALES` dizisine ekleyin.
5. `npm run i18n:check` ile eksik metin kalmadığını doğrulayın.

Yeni dil Ayarlar'daki arayüz dili ve yapay zekâ yanıt dili listelerinde kendiliğinden görünür.

## Sürüm yayınlama

`main`'e her push'ta `.github/workflows/release.yml` tip denetimi, efemeris testi, derleme ve uçtan uca testleri
çalıştırır. `package.json`'daki sürüm için henüz bir release yoksa macOS (arm64 + x64), Windows ve Linux paketleri
derlenir ve `v<sürüm>` olarak yayınlanır.

```bash
npm version patch   # 0.1.0 → 0.1.1
git push --follow-tags
```

CI'daki macOS paketi ad-hoc imzalıdır (notarize edilmez). Apple Developer ID ile imzalama ve notarizasyon
için `CSC_LINK`, `CSC_KEY_PASSWORD`, `APPLE_ID`, `APPLE_APP_SPECIFIC_PASSWORD`, `APPLE_TEAM_ID` gizli
değişkenlerinin eklenmesi ve iş akışındaki ad-hoc bayraklarının kaldırılması yeterlidir.

## Proje yapısı

```
src/
  main/        Electron ana süreç: efemeris (Swiss Ephemeris WASM), gökyüzü olayları, arama araçları,
               depolama, yer arama, yapay zekâ sağlayıcıları, bildirimler, güncelleme
  preload/     Güvenli köprü (window.astro)
  renderer/    React arayüzü: çark, tablolar, paneller, sohbet
  shared/      Ortak tipler, varsayılanlar, dil dosyaları (i18n)
resources/     Çevrimdışı şehir veritabanı
scripts/       Veri üretimi, doğruluk testi, i18n denetimi
tests/e2e/     Uçtan uca testler
docs/          Kurulum rehberleri ve FOSS analizi
```

## Lisans

Copyright © 2026 Caner Köroğlu

AstroFree özgür yazılımdır: Free Software Foundation tarafından yayımlanan **GNU Genel Kamu Lisansı'nın
3. sürümü veya (seçiminize göre) daha sonraki bir sürümü** (GPL-3.0-or-later) koşullarına göre dağıtabilir
ve/veya değiştirebilirsiniz. Lisansın tam metni [LICENSE](LICENSE) dosyasındadır. Program faydalı olacağı
umuduyla, ancak HİÇBİR GARANTİ olmaksızın dağıtılmaktadır.

Gezegen hesapları [Swiss Ephemeris](https://www.astro.com/swisseph/) (Astrodienst AG) ile yapılır; Swiss
Ephemeris AGPL-3.0 veya ücretli profesyonel lisansla dağıtılır. Açık kaynak AstroFree için ücretsizdir;
**kapalı kaynak veya ticari bir türev dağıtmak isteyenlerin Astrodienst'ten profesyonel lisans alması gerekir.**

Üçüncü taraf bileşenlerin listesi [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), lisans uyumluluğu
analizi [docs/FOSS-ANALYSIS.md](docs/FOSS-ANALYSIS.md) dosyasındadır.

Şehir verisi © GeoNames (CC BY 4.0) · Harita verisi: Natural Earth (kamu malı).
