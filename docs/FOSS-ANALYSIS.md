# FOSS lisans analizi

AstroFree'nin kullandığı üçüncü taraf yazılım, veri ve yazı tiplerinin lisanslarını ve AstroFree'nin lisansıyla
(**AGPL-3.0-or-later**) uyumunu özetler. Sürüm 0.1.1, Kasım 2026. Hukuki görüş değildir.

## Sonuç

| | |
|---|---|
| Uyum | Tüm bileşenler AGPL-3.0 ile birlikte dağıtılabilir. |
| Tek copyleft bileşen | Swiss Ephemeris (AGPL-3.0) ve sarmalayıcısı swisseph-wasm (GPL-3.0). AGPL-3.0, GPL-3.0 kodla birleştirmeye izin verir (her iki lisansın 13. maddesi). |
| Kaynak kod yükümlülüğü | Her sürümün kaynak kodu GitHub'da, sürümle aynı etikette. swisseph-wasm'ın kaynağı: github.com/prolaxu/swisseph-wasm. |
| Lisans metinleri | Pakette `LICENSE`, `NOTICE.md`, `THIRD_PARTY_NOTICES.md`, `THIRD_PARTY_LICENSES.txt` (tam metinler), Electron'un `LICENSE.electron.txt` ve `LICENSES.chromium.html` dosyaları var. |
| Atıflar | GeoNames, Open-Meteo, Natural Earth, Swiss Ephemeris: Hakkında ekranında ve `THIRD_PARTY_LICENSES.txt`'de. |
| Kapalı kaynak türev | Mümkün değil. Hem hak sahibinin izni hem Astrodienst'ten ücretli Swiss Ephemeris lisansı gerekir. |

## Uygulamayla dağıtılanlar

| Bileşen | Lisans | Yükümlülük |
|---|---|---|
| Swiss Ephemeris 2.10 (Astrodienst AG) | AGPL-3.0 veya ücretli lisans | Kaynak açık kalmalı; web hizmeti olarak sunan da kaynağı paylaşmalı (AGPL §13). |
| swisseph-wasm 0.1.0 | GPL-3.0-or-later | Kaynak açık kalmalı. |
| GeoNames verisi | CC BY 4.0 | Atıf ve değiştirildiğinin belirtilmesi. |
| Open-Meteo yer arama (çevrimiçi) | Veri CC BY 4.0; API ticari olmayan kullanımda ücretsiz | Atıf. Uygulama kâr amacı gütmediği için ücretsiz kullanım koşuluna uyar. |
| Natural Earth | Kamu malı | Yok. |
| tz-lookup | CC0-1.0 | Yok. |
| Public Sans, IBM Plex Mono, Noto Sans Symbols | SIL OFL 1.1 | Lisans metni yazı tipiyle birlikte dağıtılmalı; yazı tipleri tek başına satılamaz. |
| React, react-dom, scheduler, marked | MIT | Telif ve lisans metni korunmalı. |
| DOMPurify | Apache-2.0 / MPL-2.0 (Apache seçildi) | Lisans metni korunmalı. |
| electron-updater ve bağımlılıkları | MIT, ISC, BlueOak-1.0.0, Python-2.0 | Telif ve lisans metni korunmalı. |
| Electron 45 (Chromium, Node.js, V8, FFmpeg) | MIT; Chromium bileşenleri kendi lisanslarıyla (FFmpeg LGPL-2.1, paylaşılan kitaplık) | electron-builder lisans dosyalarını her pakete ekler. |

İzin verici lisansların hepsi (MIT, ISC, BSD, Apache-2.0, BlueOak, Python-2.0, CC0) GPL-3.0/AGPL-3.0 ile uyumludur;
yalnızca lisans metinlerinin dağıtımla birlikte taşınmasını ister. Bu `THIRD_PARTY_LICENSES.txt` ile sağlanır.

Yalnızca geliştirmede kullanılanlar (TypeScript, Vite, electron-vite, electron-builder, topojson, world-atlas,
`.agents/` altındaki tasarım skill'i) pakete girmez.

## AstroFree'nin ek koşulları

`NOTICE.md`, AGPL'nin 7. maddesinin izin verdiği ek koşulları içerir: garanti ve sorumluluk reddi (7a), "Hakkında"
ekranındaki atfın korunması (7b), değiştirilmiş sürümlerin işaretlenmesi (7c), "AstroFree" adı ve logosunun lisansa
dahil olmaması (7e). Bunlar lisansın verdiği hakları kısıtlamaz. Uygulamadaki onay kutusu da yalnızca bu bildirimi
onaylatır.

## Ağ hizmetleri (yazılım lisansı değil)

| Hizmet | Ne zaman | Koşul |
|---|---|---|
| Open-Meteo Geocoding | Çevrimdışı listede olmayan yer arandığında | Ticari olmayan kullanım; CC BY 4.0 atıf |
| GitHub API | Güncelleme denetimi | GitHub kullanım koşulları |
| Anthropic, OpenAI, Google, DeepSeek | Kullanıcı bu sağlayıcıya mesaj gönderdiğinde | Sağlayıcının kendi koşulları ve ücretleri |
| Claude Code, Codex CLI | Kullanıcı kurduysa | Ayrı programlardır, AstroFree ile dağıtılmaz |

## Bakım

- Yeni bağımlılık eklerken lisansının AGPL-3.0 ile uyumlu olduğunu kontrol edin. SSPL, BUSL, "Commons Clause"
  eklentili veya yalnızca GPL-2.0 lisanslı paketler uyumsuzdur.
- Bağımlılıklar değişince `node scripts/third-party-licenses.mjs` ile `THIRD_PARTY_LICENSES.txt`'i yenileyin.
- Değiştirilmiş bir sürüm dağıtan, değişiklikleri ve tarihlerini belirtmeli (AGPL §5a) ve farklı bir ad ve logo
  kullanmalıdır (`NOTICE.md`).
