# AstroFree

**Ücretsiz, açık kaynak ve çevrimdışı çalışan masaüstü astroloji programı.**
Doğum haritası, transit, progresyon, solar ark, sinastri, kompozit/Davison, Güneş/Ay dönüşü, astrokartografi ve
daha fazlası; haritayı **Claude Code, Codex, Gemini, DeepSeek** veya diğer yapay zekâ servisleriyle yorumlatıp
üzerine sohbet edebilirsiniz. macOS, Windows ve Linux'ta çalışır.

> **English:** AstroFree is a free, open-source, offline-first desktop astrology app (macOS / Windows / Linux)
> built on the Swiss Ephemeris. It draws natal, transit, progressed, solar-arc, synastry, composite/Davison and
> return charts, steps time minute by minute with a live-updating wheel, and lets you discuss the chart on
> screen with Claude Code, Codex, Gemini, DeepSeek or any OpenAI-compatible API. The interface is fully
> available in Turkish, English, Spanish, Portuguese, German, French, Russian and Hindi (Settings → General → Language). It is free, non-commercial and licensed under
> AGPL-3.0-or-later. Website: https://astrofree.cklabs.tr · Installation guides:
> [macOS](docs/install/en/macos.md) · [Windows](docs/install/en/windows.md) · [Linux](docs/install/en/linux.md).

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

Hazır paketler [GitHub Releases](https://github.com/canerkoroglu/astrofree/releases/latest) sayfasındadır; web sitesi: https://astrofree.cklabs.tr

| İşletim sistemi | Dosya | Ayrıntılı rehber / Guide |
|---|---|---|
| macOS 12+ (Apple Silicon) | `AstroFree-<sürüm>-mac-arm64.dmg` | [Türkçe](docs/install/macos.md) · [English](docs/install/en/macos.md) |
| macOS 12+ (Intel) | `AstroFree-<sürüm>-mac-x64.dmg` | [Türkçe](docs/install/macos.md) · [English](docs/install/en/macos.md) |
| Windows 10 / 11 (64 bit) | `AstroFree-<sürüm>-win-x64.exe` (kurulum) veya `AstroFree-<sürüm>-win-portable.exe` | [Türkçe](docs/install/windows.md) · [English](docs/install/en/windows.md) |
| Linux (x86_64) | `.AppImage` veya `.deb` | [Türkçe](docs/install/linux.md) · [English](docs/install/en/linux.md) |

Uygulama henüz ücretli kod imzası taşımadığı için macOS'ta ilk açılışta **sağ tık → Aç**, Windows'ta
SmartScreen uyarısında **Ek bilgi → Yine de çalıştır** gerekir. Rehberler bunu adım adım anlatır.

## Öne çıkanlar

- **Swiss Ephemeris doğruluğu** — astro.com ile ark-saniye düzeyinde aynı sonuçlar.
- **Canlı zaman** — dakika, saat, gün, ay, yıl adımlarıyla ileri/geri; çark ve tüm tablolar anında güncellenir.
- **Tamamen çevrimdışı** — efemeris, ~70.000 şehir + Türkiye ilçeleri, saat dilimleri, dünya haritası ve
  fontlar uygulamanın içinde. İnternet yalnızca yapay zekâ sohbeti ve güncelleme denetimi için gerekir.
- **Yapay zekâ ile sohbet** — ekrandaki haritanın tam verisi her mesajla gönderilir; zamanı oynattıkça
  yorum güncel transitleri izler.
- **İki kullanım modu** — Amatör: sade sekmeler, kısa ve gündelik yanıtlar, yapay zekâsız **Uygun Günler** ve
  **Ay Takvimi**; Profesyonel: tüm teknikler, ayrıntılı yanıtlar ve danışan kayıtları.
- **Doğum saatini bul** — hayatınızdaki olayların tarihlerinden, olası doğum saatlerini gerekçeleriyle sıralar.
- **Hesap yok, abonelik yok, reklam yok** — verileriniz yalnızca kendi bilgisayarınızda durur.
- **8 dilde arayüz:** Türkçe, İngilizce, İspanyolca, Portekizce, Almanca, Fransızca, Rusça ve Hintçe; yapay zekâ
  varsayılan olarak arayüz dilinde yanıt verir. Yeni dil eklemek tek dosya.

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
- "Doğum zamanı" kipinde doğum saati oynatılır (elle rektifikasyon); otomatik arama için **Doğum saatini bul**
  (Kişiler ve olaylar bölümünde).
- **Saat dilimleri:** IANA bölgeleri (tarihsel yaz saati dahil), sabit fark veya Yerel Ortalama Zaman (LMT);
  1582 öncesi için Jülyen takvimi.

### Kişiler ve olaylar
- Kişi veya olay (evlilik, kuruluş, taşınma…) kaydı; yazarken canlı Güneş–Ay–Yükselen önizlemesi.
- "Doğum saati bilinmiyor" seçeneği, **Rodden** veri güvenilirliği, etiketler ve notlar. Saat bilinmiyorsa kısa bir
  rehber açılır: neyin doğru kaldığı (Güneş burcu, çoğu gezegen), Ay'ın o gün burç değiştirip değiştirmediği (gün başı
  ve sonu hesaplanır), yükselen ve evlerin neden gösterilmediği, saatin nerede bulunabileceği.
- **Olaylarım:** kişinin hayat olayları (iş değişikliği, taşınma, bir tanışma…) tarihiyle kaydedilir; her olayda o
  günün Ay'ı ve yavaş gezegenlerin (Mars–Plüton) haritaya açıları sade dille ve teknik etiketiyle görünür. Birden çok
  olayda tekrar eden gezegenler özetlenir; "Yapay zekâya sor" tüm olayları transitleriyle gönderir. Kayıtlar haritanın
  içinde saklanır ve yedeğe girer. Olaylara tür verilebilir (ilişki, iş, ev, aile, sağlık, kayıp, eğitim, yolculuk);
  liste türe göre süzülür.
- **Doğum saatini bul (rektifikasyon):** en az 3 (tercihen 5–10) olay girildiğinde, seçilen saat aralığındaki her aday
  saat (2–4 dakika arayla) için yavaş gezegen transitlerinin (Jüpiter–Plüton), Güneş yayı direksiyonlarının ve
  ilerletilmiş Ay'ın o tarihlerde köşelere (ASC, MC, DSC, IC) yakınlığı puanlanır; olay türü ilgili köşeyi öne çıkarır
  (iş → MC, ilişki → ASC/DSC…). En uyumlu üç saat, olay olay gerekçeleriyle ve puan eğrisiyle gösterilir; tek tıkla
  haritaya uygulanır (saat kaynağı "C"). Yaklaşık bir yöntemdir ve böyle sunulur.
- **Kişiler ve olaylar penceresi** (kenar çubuğundaki ☰, ⌘⇧P): aksan duyarsız arama (isim, yer, yıl, not, etiket,
  olaylar ve seanslar içinde), tür/grup/etiket/saati bilinmeyen süzgeçleri, isim, doğum tarihi, son değişen ya da son
  eklenen sıralaması, üste sabitleme; birden çok kayıtta grup ve etiket değiştirme, silme, dışa aktarma; aynı kişinin
  kopyalarını bulup birleştirme (etiket, not, olay ve seanslar korunur); yaklaşan doğum günleri.
- **Danışan kartı** (Profesyonel mod): e-posta ve telefon, notlar, tarihli seans kayıtları ve sonraki görüşme tarihi;
  yaklaşan görüşmeler pencerenin başında listelenir. Ayarlar → Genel → *Raporlarda adınız* doldurulursa PDF
  raporların başına astroloğun adı ve iletişim satırı yazılır. Tüm bu bilgiler yalnızca bu bilgisayarda tutulur.
- Şehir/ilçe araması (çevrimdışı), `38n15`, `41K01`, `38°15'30" N` gibi koordinat biçimleri ya da dünya
  haritasından tıklayarak seçim; en yakın yerleşim ve saat dilimi otomatik bulunur.
- **İçe aktarma** (önizlemeli): AAF (astro.com, Solar Fire, AstroGold, Janus; Solar Fire'da *Charts → Export → AAF*)
  ve CSV, dosyadan ya da yapıştırarak. AAF'ta `g`/`j` takvim harfi, Jülyen takvimi tarihleri ve `#COM` notları
  okunur; Jülyen günü verilmişse an birebir korunur. CSV'de ondalık virgül, IANA bölgesi ya da sabit fark (`+3:00`),
  tür/grup/etiket/rodden sütunları; koordinat yoksa yer adı şehir listesinde aranır. Listede zaten olan kayıtlar
  işaretlenir ve tekrar eklenmez; okunamayan satırlar sayılır. **Dışa aktarma:** AAF, CSV ve JSON (tümü ya da
  seçilenler).

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
- **Ay Takvimi:** ay ay her günün Ay evresi, burcu, burç geçiş saati ve boşluk saatleri; Yeni Ay, İlk Dördün, Dolunay
  ve Son Dördün anları, tutulmalar. Geleneksel bahçe takvimlerinin kök/yaprak/çiçek/meyve günleri (Ay'ın burcunun
  elementine göre) ve büyüyen/küçülen Ay'ın ekim, budama ve saç kesimiyle ilişkilendirilmesi, bilimsel dayanağı
  olmadığı belirtilerek. Güney yarımkürede Ay simgeleri ters döner. PDF ve `.ics` olarak alınabilir.
- **Bu gece gökyüzünde** (kenar çubuğundaki 🔭): bulunduğunuz yerden gün batımı, tam karanlık ve gün doğumu; çıplak
  gözle görülebilecek Ay ve gezegenlerin hangi saatler arasında, hangi yönde ve ne yükseklikte görülebileceği,
  parlaklıkları ve bulundukları burç; birbirine 4°'den yakın görünen çiftler; yaklaşan meteor yağmurları ve oradan
  görülebilecek bir sonraki Güneş ve Ay tutulması. Ok tuşlarıyla sonraki gecelere geçilir.
- **Haftalık özet:** haftada bir sade bir bildirim: haftanın gökyüzü olayları (Merkür/Venüs/Mars retro başlangıç ve
  bitişleri, Yeni Ay/Dolunay, tutulmalar) ve seçilen kişinin haftadaki başlıca transiti, olasılık diliyle
  (Ayarlar → Bildirimler'den açılıp kapanır, kişi seçilir).
- **Masaüstü bildirimleri** (Profesyonel modda): kayıtlı kişilere yaklaşan önemli tam transitler.

### Bilgi bankası
- Kendi ders notlarınızı, kitap özetlerinizi ve yorum kurallarınızı Markdown dosyaları olarak ekleyin
  (**Bilgi Bankası** sekmesi → Dosya ekle). Her `### Başlık` bir kayıttır.
- Kayda `- anahtarlar: durak:5, yildiz:algol, burc:boga, derece:25-27` gibi bir satır eklenirse kayıt haritayla
  **otomatik eşleşir**: Ay durağı, sabit yıldız kavuşumları, hassas dereceler, Ay fazı, Ay'a göre harita lordu.
- Sohbette eşleşen kayıtlar (ve sorunuzda geçen konular) yapay zekâya bağlam olarak gönderilir; böylece yorumlar
  kendi okulunuzun kurallarına göre yapılır. Dosyalar kullanıcı veri klasöründe `knowledge/` altında durur ve yedeğe dahildir.
- Natal Bilgiler'de **28 Ay durağı** ve **Ay'a göre harita lordu**, gökyüzü panelinde günün Ay durağı gösterilir.

### Diğer
- Yapay zekâ yanıtlarını kişiye **yorum** olarak kaydetme ve düzenleme.
- **PNG** (çark) ve **PDF** rapor (çark + natal bilgiler + kayıtlı yorumlar).
- **Doğum günü raporu** (Temel Yorum ya da Dışa aktar menüsü; yapay zekâ gerekmez): bir doğum gününden ötekine
  tek sayfalık sade özet. Güneş dönüşüne göre yılın odağı (Güneş ve Ay'ın evi, yükselenin tonu; doğum saati
  bilinmiyorsa atlanır), yıl içinde Jüpiter ve Satürn'ün haritaya açıları (aylarıyla), Merkür retroları ve tutulmalar.
  Yıllar arasında gezinme, PDF olarak kaydetme, "Yapay zekâya sor".
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
| AstroHermes | Astrolojiye özel, ücretli, ayrı bir servis; OpenAI uyumlu akış, adres hazır | AstroHermes aboneliğinden `ahr_live_…` anahtarı |
| Yerel sunucu | OpenAI uyumlu `/v1/chat/completions` akışı | Ollama, llama.cpp, LM Studio, LiteLLM, vLLM vb.; anahtar isteğe bağlı |

Adım adım kurulum ve "bulunamadı" sorunları için: [Yapay zekâ bağlantı rehberi](docs/ai-setup.md) ·
[AI connection guide](docs/en/ai-setup.md). Not: Claude masaüstü uygulaması Claude Code değildir; `claude` komutunun
ayrıca kurulması gerekir.

- Gönder düğmesinin yanındaki **yanıt düzeyi**: **Amatör** (varsayılan) kısa (yaklaşık 150 kelime), sade ve teknik terimsiz
  yanıt verir: önce bir iki cümlelik doğrudan yanıt, sonra en çok 3–5 madde; "ne zaman?" sorularında en çok 3–5 tarih ve
  her birinin sade nedeni. Yanıtın altındaki **Biraz daha ayrıntılı** düğmesi aynı konuyu biraz açar. Kısayollar gündelik
  sorulardır (Aşk, İş ve para, Merkür retrosu, Uygun günler…). **Profesyonel** teknik terimler, dereceler, orb'lar ve
  tekniklerle ayrıntılı yanıt verir. Her iki düzeyde de yanıtlar olasılık diliyle kurulur, "yap/yapma" gibi yönlendirme
  ve sağlık, hukuk, finans konularında tahmin ya da öneri içermez; her yanıt kısa bir hatırlatmayla biter. Düzey talimatı
  ve kriz anları için güvenlik kuralı, kendi sistem talimatınızı yazsanız da eklenir.
- **Amatör / Profesyonel mod** (üst çubuk, Ayarlar → Genel ve ilk açılış rehberi): Amatör modda yalnızca gündelik
  sekmeler (Harita, Bugün, Temel Yorum, Uygun Günler, Yorumlar, Bilgi Bankası), Transit ve Sinastri katmanları ve konum
  tablosu görünür; yapay zekâ kısa ve sade yanıt verir. Profesyonel mod tüm araçları (progresyon, dönüşler, solar ark,
  harmonikler, ev sistemi, Natal Bilgiler, Transit Takvimi, efemeris, astrokartografi, Zaman Seçimi) ve teknik yanıtları
  açar. Yeni kurulumlar Amatör, önceki sürümden gelenler Profesyonel başlar.
- **Uygun Günler** sekmesi (yapay zekâ gerekmez): nikâh, yeni iş, sözleşme, alışveriş/cihaz, yolculuk, taşınma, saç ya da
  diyet için 30 gün – 12 ay ya da gelecek yıl boyunca günler ay takviminde işaretlenir (öne çıkan / ölçütlere uyuyor /
  uymuyor). Bir güne tıklayınca nedenleri ve "Yapay zekâya sor" düğmesi; "Bugün" değerlendirmesi, aralıktaki retrolar ve
  tutulmalar. **Takvime aktar** öne çıkan günleri, retro dönemlerini ve tutulmaları `.ics` dosyası olarak kaydeder
  (telefon, Google, Apple ya da Outlook takvimine eklenebilir). Sohbetteki "ne zaman?" yanıtlarıyla aynı hesaplamayı kullanır.
- **Yanıt denetimi** (Amatör): son yanıtta yönlendirici bir ifade ("mutlaka", "yapmalısınız", "you should"… 8 dilde)
  ya da ~260 kelimeyi aşan uzunluk (ayrıntı istenmediyse) olursa yanıtın altında kısa bir not ve **Kısalt ve yumuşat**
  düğmesi çıkar. Talimatı tam tutmayan (özellikle küçük yerel) modeller için bir güvencedir.
- **Dil:** yapay zekânın talimatı, yanıt düzeyi ve güvenlik kuralı her istekte yanıt dilinde (varsayılan: arayüz dili)
  yeniden kurulur; arayüz dili değişince talimatlar da değişir. Kendi sistem talimatınızı yazdıysanız o metin olduğu
  gibi kalır, ama sonuna yanıt dilinin satırı ("Answer in English." gibi) her zaman eklenir. Kısayollar, harita ve
  zamanlama verisi arayüz dilindedir.
- **Zamanlama soruları** ("2027'de ne zaman nikâh günü alabiliriz?", "saç boyatmak için uygun bir zaman mı?", "Merkür
  retrosunda telefon yenilesem?", "önümüzdeki 3 ay"): soru gönderilirken konusu (nikâh, diyet, saç, alışveriş/cihaz,
  sözleşme, yeni iş, yolculuk, taşınma, sağlık) ve tarih aralığı (yıl, ay adı, "önümüzdeki 3 ay", "gelecek ay"; 8 dilde,
  en çok 18 ay) bulunur. Aralıktaki her gün geleneksel seçim ölçütleriyle (Ay fazı ve boşluğu, Merkür/Venüs retro ve
  durakları, tutulmalara uzaklık, Ay burcu, Ay'ın doğum haritasıyla ve varsa sinastri partnerinin haritasıyla açıları)
  puanlanır; aylara yayılmış birkaç aday gün, "bugün" değerlendirmesi, aralıktaki retro dönemleri ve tutulmalar yalnızca
  o soruya eklenerek gönderilir. Sağlık ve tıbbi işlem sorularında aday gün hesaplanmaz.
- Zamanlama soruları için her haritayla bugünden itibaren yaklaşan günler de gönderilir: 60 günlük gökyüzü olayları
  (retrolar, burç geçişleri, ay evreleri, tutulmalar) ve haritaya transitler, 30 günlük Ay takvimi (burçlar ve boşluk
  zamanları). Yapay zekâ böylece somut tarih verebilir; bu veri günde bir kez değişir. Maliyeti düşük tutmak için hızlı
  gezegenlerin (Güneş, Merkür, Venüs) transitleri 30 günle ve toplam 40 satırla sınırlıdır.
- Yanıt düzeyi ilk açılış rehberinde de sorulur (Amatör önceden seçili). Ücretli API'lerde varsayılan modeller uygun
  fiyatlıdır (Claude Sonnet, GPT-5 mini, Gemini Flash); daha güçlü modeller sohbetteki model listesinden seçilebilir.
- Sohbetler harita başına **oturumlar** olarak saklanır (yeni sohbet, ad değiştirme, silme) ve otomatik yedeğe dahildir.
- Uzun sohbetlerde son 12 mesaj tam, daha eskileri kısaltılarak gönderilir; talimat ve geçmiş isteğin başında sabit
  durduğu için sağlayıcıların önbelleği (prompt caching) tekrar eden kısmı daha hızlı ve ucuz işler. Gönder düğmesinin
  yanında bir sonraki isteğin yaklaşık token boyutu görünür.
- CLI sağlayıcıları bilgisayarınızdaki mevcut oturumu kullanır; AstroFree hiçbir kimlik bilgisini görmez.
  Ajanlar boş bir çalışma klasöründe, dosya erişimi ve araçları kapalı olarak çalıştırılır.
- API anahtarları işletim sisteminin anahtar zinciriyle (Electron `safeStorage`) şifrelenip yalnızca yerel olarak saklanır.
- Komut yolu, ek argümanlar, model, yanıt dili ve sistem talimatı Ayarlar → Yapay zekâ bölümünden değiştirilebilir.

### Yerel modeller (Ollama, llama.cpp, LM Studio, LiteLLM, vLLM)

İnternete veri göndermeden, bilgisayarınızda ya da ağınızda çalışan bir modelle (ör. Qwen) sohbet edebilirsiniz.

1. Sunucuyu başlatın, örneğin `ollama serve` ve `ollama pull qwen3:8b`.
2. **Ayarlar → Yapay zekâ → Yerel sunucu**: sunucu türünü seçin (adres ve port kendiliğinden dolar) ya da
   protokol, sunucu, port ve yolu elle girin.
3. **Bağlantıyı test et ve modelleri getir** ile modeli seçin; sohbet panelinde sağlayıcı olarak "Yerel sunucu"yu seçin.

| Sunucu | Varsayılan adres |
|---|---|
| Ollama | `http://localhost:11434/v1` |
| llama.cpp (`llama-server`) | `http://localhost:8080/v1` |
| LM Studio | `http://localhost:1234/v1` |
| LiteLLM proxy | `http://localhost:4000/v1` (API anahtarı: master key) |
| vLLM | `http://localhost:8000/v1` |

**Gelişmiş** bölümünde sıcaklık, en fazla yanıt uzunluğu, zaman aşımı, ek HTTP başlıkları, gönderilen veri sınırı
(bağlam penceresi küçük modeller için) ve `<think>…</think>` düşünme bloklarını gizleme seçenekleri bulunur. Sıcaklık,
yanıt uzunluğu, zaman aşımı ve veri sınırı diğer API sağlayıcıları için de ayarlanabilir.

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
| `npm run test:timing` | Zamanlama motoru (8 dilde konu ve tarih algılama, gün kuralları) ve Amatör yanıt denetimi testleri |
| `npm run test:import` | AAF/CSV okuma ve yazma (yaz-oku), kopya tespiti ve arama testleri |
| `npm run test:tools` | Ay evreleri, bu gecenin gökyüzü ve doğum saati bulma (bilinen saatli bir haritada) testleri |
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

Copyright © 2026 Caner Köroğlu · **https://astrofree.cklabs.tr** · iletişim: astrofree@cklabs.tr

AstroFree kâr amacı gütmeyen, ücretsiz bir projedir. Özgür yazılımdır: Free Software Foundation tarafından
yayımlanan **GNU Affero Genel Kamu Lisansı'nın 3. sürümü veya (seçiminize göre) daha sonraki bir sürümü**
(AGPL-3.0-or-later) koşullarına göre dağıtabilir ve/veya değiştirebilirsiniz. Lisansın tam metni
[LICENSE](LICENSE), telif bildirimi ve AGPL 7. madde kapsamındaki ek koşullar [NOTICE.md](NOTICE.md) dosyasındadır.
Program faydalı olacağı umuduyla, ancak HİÇBİR GARANTİ olmaksızın dağıtılmaktadır.

Ek koşulların özeti (`NOTICE.md`):
- Astrolojik hesaplar, yorumlar ve yapay zekâ çıktıları kişisel keşif amaçlıdır; profesyonel tavsiye değildir.
- Değiştirilmiş sürümler "Hakkında" ekranındaki AstroFree atfını, web sitesi ve kaynak bağlantısını korumalı, açıkça
  değiştirilmiş olarak işaretlenmeli ve resmi sürüm gibi sunulmamalıdır.
- "AstroFree" adı ve sekiz köşeli yıldız logosu lisansa dahil değildir; başkalarına dağıtılan değiştirilmiş sürümler
  farklı bir ad ve logo kullanmalıdır.

Neden AGPL: gezegen hesapları [Swiss Ephemeris](https://www.astro.com/swisseph/) (Astrodienst AG) ile yapılır ve
Swiss Ephemeris AGPL-3.0 (ya da ücretli profesyonel lisans) ile dağıtılır. AstroFree'nin de AGPL olması tüm
bileşenlerle tam uyum sağlar ve değiştirilmiş bir sürümü web hizmeti olarak sunanların da kaynak kodunu paylaşmasını
gerektirir. Kapalı kaynak bir türev mümkün değildir.

Üçüncü taraf bileşenlerin listesi [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md), tam lisans metinleri
[THIRD_PARTY_LICENSES.txt](THIRD_PARTY_LICENSES.txt), lisans uyumluluğu
analizi [docs/FOSS-ANALYSIS.md](docs/FOSS-ANALYSIS.md) dosyasındadır.

Şehir verisi © GeoNames (CC BY 4.0) · Çevrimiçi yer arama: Open-Meteo (CC BY 4.0) · Harita verisi: Natural Earth (kamu malı).
