# AstroFree

Doğum haritası, transit, ikincil progresyon, solar ark ve sinastri çarklarını çizen; haritayı
Claude Code, Codex, Gemini veya DeepSeek ile yorumlatıp sohbet etmeyi sağlayan
macOS / Windows / Linux masaüstü uygulaması (Electron + React + Swiss Ephemeris).

## Çalıştırma

```bash
npm install
npm run dev          # geliştirme modu
npm run build        # derleme
npm run test:engine  # efemeris doğruluk testi (astro.com değerleriyle karşılaştırır)
```

Paketleme (her işletim sistemi kendi üzerinde derlenmelidir). macOS'ta `dist/` altında .dmg ve .zip oluşur;
uygulama makinedeki geliştirici sertifikasıyla imzalanır ama notarize edilmez — başka bir Mac'te ilk açılışta
sağ tık → Aç gerekir. Uyarısız dağıtım için Apple Developer ID sertifikası ve notarizasyon ayarı gerekir.

```bash
npm run dist:mac    # .dmg + .zip
npm run dist:win    # NSIS kurulum + portable .exe
npm run dist:linux  # AppImage + .deb
```

## Özellikler

- **Swiss Ephemeris (WASM)**: 1800–2400 arası ark-saniye doğruluğunda gezegenler, Chiron, asteroitler,
  ortalama/gerçek Ay düğümü, Lilith; 11 ev sistemi; tropikal veya sidereal (Lahiri vb.).
- **Çarklar**: natal + en fazla iki dış halka (Transit, Progresyon, Solar Ark, Sinastri).
  Glif çakışma önleme, açı çizgileri (sıkı orb = kalın çizgi), üzerine gelince ayrıntı balonu.
- **Zaman kontrolü**: ±dakika/saat/gün/ay/yıl, seçilebilir adım, ← → tuşları (Shift ×10),
  ↑ ↓ adım boyu, boşluk = animasyon, fare tekerleği ile ilerletme, "Canlı" mod (gerçek saat).
  "Doğum zamanı" seçilirse doğum saati oynatılır (rektifikasyon).
- **Saat dilimi**: IANA bölgesi (tarihsel yaz saati dahil), sabit fark veya LMT. 1582 öncesi Jülyen takvimi.
- **Çevrimdışı çalışma**: Efemeris, fontlar, saat dilimleri ve ~70.000 şehir + Türkiye ilçeleri uygulamanın
  içinde gelir; internet gerekmez. Yerel listede bulunamayan yer için (varsa) Open-Meteo'ya sorulur,
  koordinatlar elle de girilebilir. Yalnızca AI sohbeti internet ister.
- **Ev sistemi**: varsayılan Alcabitius; araç çubuğundan veya Ayarlar'dan değiştirilebilir.
- **Kişi kısayolları**: listede isme tıklamak doğum haritasını açar; altında Natal / Bilgiler / Transit /
  Progresyon kısayolları vardır. "Bugün" düğmesi canlı gökyüzü haritasını açar.
- **Natal Bilgiler** sekmesi: Güneş-Ay-Yükselen, harita yöneticisi, ay fazı, element/nitelik dağılımı,
  gezegen tablosu (burç, derece, ev, günlük hız), açılar (orb, yaklaşan/ayrılan), asaletler, evler.
- **Gökyüzü paneli**: seçili tarihteki retro gezegenler (başlangıç → bitiş), önümüzdeki 45 günün durakları,
  burç geçişleri, yeni ay/dolunaylar ve sonraki tutulmalar. Bir olaya tıklamak zamanı o ana götürür.
- **Tablolar**: konumlar (ev, hız, deklinasyon, yönetim/yücelim), açı listesi (yaklaşan/ayrılan),
  açı tablosu, evler ve yöneticileri.
- **Transit takvimi**: seçilen tarihten itibaren 1–36 ay; her transitin orb'a giriş, tam isabet(ler) (retro
  geçişleri ℞ ile) ve çıkış tarihleri. Tarihe tıklamak haritayı o ana götürür; liste AI'a da gönderilir.
- **Güneş / Ay dönüşü**: dış halka olarak veya "ayrı harita olarak aç" ile kendi evleriyle. Dönüş yeri:
  doğum yeri veya varsayılan konum (Ayarlar).
- **Açı kalıpları**: Büyük Üçgen, T-Kare, Büyük Haç, Yod, Uçurtma, Mistik Dikdörtgen, burç/ev stelyumları.
- **Geleneksel teknikler**: tam esas asalet tablosu (Mısır sınırları, Dorotheus üçlüleri, Kalde yüzleri,
  Lilly puanı), sekt, ASC/MC almuteni, yıllık/aylık profeksiyon, firdaria, 7 Hermetik nokta.
- **Sabit yıldızlar**: 33 parlak yıldızın natal gezegen/köşelere 1° içindeki kavuşumları (Swiss Ephemeris kataloğu).
- **Gökyüzü paneli**: boşluktaki Ay (void of course) ve gezegen günü/saatleri (24 saatlik liste).
- **Doğum yeri**: şehir/ilçe arama, `38n15`, `85w46`, `38°15'K`, `41K01` gibi biçimlerde koordinat,
  ya da çevrimdışı dünya haritasından tıklayarak seçim (en yakın yerleşim ve saat dilimi otomatik).
- **Yorum arşivi**: sohbetteki yanıtlar "Yoruma kaydet" ile kişinin "Yorumlar" sekmesine kaydedilir,
  düzenlenebilir. Kişilere etiket ve not eklenip listede etikete göre süzülebilir.
- **Dışa aktarma**: çarkı PNG, ya da çark + natal bilgiler + kayıtlı yorumlarla PDF rapor.
- **Otomatik yedek**: Ayarlar → Genel'de seçilen klasöre (iCloud Drive, Dropbox…) her değişiklikte günlük
  yedek; son 30 gün tutulur. Geri yükleme: Dosya → İçe aktar.

## Yapay zekâ entegrasyonu

Sohbet panelindeki her mesajla ekrandaki haritanın tam verisi (konumlar, evler, yöneticiler,
açılar, transit→natal açılar, progresyonlar…) gönderilir. Zamanı ilerlettiğinizde sonraki
mesajlar güncel transitlerle gider. "Gönderilen veri" bağlantısı tam metni gösterir.

| Sağlayıcı | Nasıl çalışır | Gereken |
|---|---|---|
| Claude Code (CLI) | `claude -p` alt süreç; araçsız, yalın mod | `claude` kurulu ve giriş yapılmış |
| Codex (CLI) | `codex exec --json`, salt-okunur | `codex login` |
| Gemini (CLI) | `gemini -o stream-json` | `gemini` ile giriş ya da Gemini API anahtarı |
| Claude / OpenAI / Gemini / DeepSeek API | HTTPS akış | Ayarlar'dan API anahtarı |

CLI sağlayıcıları bilgisayarınızdaki mevcut oturumu kullanır; uygulama hiçbir kimlik bilgisini
görmez. API anahtarları işletim sistemi anahtar zinciriyle (Electron `safeStorage`) şifrelenip
yerel olarak saklanır. Komut yolu, ek argümanlar ve model Ayarlar → Yapay zekâ bölümünden
değiştirilebilir; Codex modelleri `~/.codex/models_cache.json` dosyasından otomatik listelenir.

## Şehir veritabanını yenileme

```bash
# GeoNames dosyaları: cities5000.zip, admin1CodesASCII.txt, TR.zip (download.geonames.org/export/dump)
node scripts/build-cities.mjs cities5000.txt admin1CodesASCII.txt TR.txt
```

Şehir verisi: GeoNames (geonames.org), CC-BY 4.0. Dünya haritası: Natural Earth (kamu malı), `node scripts/build-worldmap.mjs`.

## Veriler

Haritalar, ayarlar ve sohbetler kullanıcı veri klasöründe JSON olarak tutulur
(macOS: `~/Library/Application Support/astro-free`). Dosya menüsünden içe/dışa aktarılabilir.

## Lisans

Swiss Ephemeris, GPL ya da Astrodienst ticari lisansıyla dağıtılır; bu proje GPL-3.0-or-later'dır.
Ticari dağıtım için Astrodienst'ten lisans gerekir.
