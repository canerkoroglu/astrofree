# FOSS lisans analizi

Bu belge AstroFree'nin kullandığı üçüncü taraf yazılım, veri ve fontları; lisanslarını, dağıtılan pakete
girip girmediklerini, getirdikleri yükümlülükleri ve AstroFree'nin lisansı (**AGPL-3.0-or-later**) ile
uyumluluğunu inceler. Analiz `package.json` ve `npm ls --omit=dev --all` çıktısına göre, sürüm 0.1.0 için
yapılmıştır (Kasım 2026).

> Bu belge hukuki görüş değildir; projenin lisans durumunu şeffaf biçimde belgelemek amacıyla hazırlanmıştır.

## Özet

| Sonuç | Açıklama |
|---|---|
| Lisans uyumu | **Uyumlu.** Tüm bileşenler AGPL-3.0 ile birlikte dağıtılabilir. Tek copyleft bağımlılık Swiss Ephemeris (AGPL-3.0) ve onun sarmalayıcısıdır (GPL-3.0); AstroFree'nin kendisi de AGPL olduğundan lisanslar birebir örtüşür. |
| Ticari kullanım | AstroFree kâr amacı gütmeyen, ücretsiz bir projedir. AGPL satışa izin verse de **kaynak kodu kapalı bir türev** (masaüstü ya da web hizmeti) mümkün değildir; bunun için hem hak sahibinin izni hem Astrodienst'ten Swiss Ephemeris Professional License gerekir. |
| Atıf yükümlülükleri | GeoNames (CC BY 4.0) için atıf; MIT/ISC/BSD/OFL bileşenleri için telif ve lisans metinlerinin korunması. `THIRD_PARTY_NOTICES.md` ve `LICENSE` pakete eklenir. |
| Kaynak kodu yükümlülüğü | GPL/AGPL gereği her ikili sürümle birlikte karşılık gelen kaynak kod sunulmalı. GitHub Releases ilgili etiketin kaynak arşivini otomatik içerir. |
| Ağ hizmeti | AGPL'nin 13. maddesi gereği AstroFree'nin değiştirilmiş bir sürümünü web hizmeti olarak sunan herkes, o hizmetin kullanıcılarına kaynak kodunu vermek zorundadır. |
| Ek koşullar | AGPL 7. madde kapsamında: garanti/sorumluluk reddi, "Hakkında" ekranındaki atfın korunması, değiştirilmiş sürümlerin işaretlenmesi, "AstroFree" adı ve logosunun lisansa dahil olmaması. Bkz. `NOTICE.md`. |

## 1. Uygulamayla dağıtılan bileşenler

### 1.1 Çalışma zamanı (ana süreç, `node_modules` içinde paketlenir)

| Paket | Sürüm | Lisans | Kullanım | Tür |
|---|---|---|---|---|
| swisseph-wasm | 0.1.0 | GPL-3.0-or-later | Swiss Ephemeris'in WebAssembly derlemesi ve JS sarmalayıcısı | Güçlü copyleft |
| └ Swiss Ephemeris (Astrodienst AG) | 2.10.03 | AGPL-3.0 **veya** Swiss Ephemeris Professional License | Gezegen, ev, sabit yıldız, tutulma hesapları; `swisseph.data` içindeki efemeris dosyaları | Güçlü copyleft (ikili lisans) |
| tz-lookup | 6.1.25 | CC0-1.0 | Koordinattan saat dilimi | Kamu malı |
| electron-updater | 6.8.11 | MIT | Otomatik güncelleme | İzin verici |
| builder-util-runtime | 9.7.0 | MIT | electron-updater bağımlılığı | İzin verici |
| debug | 4.4.3 | MIT | 〃 | İzin verici |
| fs-extra | 10.1.0 | MIT | 〃 | İzin verici |
| graceful-fs | 4.2.11 | ISC | 〃 | İzin verici |
| js-yaml | 4.3.2 | MIT | 〃 | İzin verici |
| argparse | 2.0.1 | Python-2.0 (PSF) | js-yaml bağımlılığı | İzin verici |
| jsonfile | 6.2.1 | MIT | 〃 | İzin verici |
| lazy-val | 1.0.5 | MIT | 〃 | İzin verici |
| lodash.escaperegexp | 4.1.2 | MIT | 〃 | İzin verici |
| lodash.isequal | 4.5.0 | MIT | 〃 | İzin verici |
| ms | 2.1.3 | MIT | 〃 | İzin verici |
| sax | 1.6.1 | BlueOak-1.0.0 | 〃 | İzin verici |
| semver | 7.7.4 | ISC | 〃 | İzin verici |
| tiny-typed-emitter | 2.1.0 | MIT | 〃 | İzin verici |
| universalify | 2.0.1 | MIT | 〃 | İzin verici |

### 1.2 Arayüz paketine gömülenler (Vite ile `out/renderer` içine derlenir)

| Paket | Sürüm | Lisans | Kullanım |
|---|---|---|---|
| react, react-dom | 19.3.1 | MIT | Arayüz |
| marked | 18.1.2 | MIT | Yapay zekâ yanıtlarında Markdown |
| dompurify | 3.4.17 | MPL-2.0 **veya** Apache-2.0 | Markdown çıktısının güvenli hale getirilmesi (Apache-2.0 seçilir) |
| @fontsource/public-sans | 5.3.0 | OFL-1.1 | Arayüz yazı tipi |
| @fontsource/ibm-plex-mono | 5.3.0 | OFL-1.1 | Rakamlar ve saatler |
| @fontsource/noto-sans-symbols, -2 | 5.3.0 | OFL-1.1 | Astrolojik glifler |

### 1.3 Gömülü veri

| Veri | Lisans | Dosya | Yükümlülük |
|---|---|---|---|
| GeoNames (cities5000, admin1 kodları, Türkiye ilçeleri) | CC BY 4.0 | `resources/cities.json.gz` | Atıf: "© GeoNames, geonames.org, CC BY 4.0"; değişiklik yapıldığı belirtilmeli (seçilmiş ve sadeleştirilmiş alt küme). |
| Natural Earth (ülke ve il sınırları) | Kamu malı | `src/renderer/src/assets/world*.ts` | Yok (atıf nezaketen yapılır). |
| world-atlas (Natural Earth'ün TopoJSON hali) | ISC | Yalnızca derleme betiğinde | Pakete girmez. |

### 1.4 Electron ve Chromium

Electron 45.2.1 (MIT) uygulamanın çalışma ortamıdır ve kendi içinde Chromium (BSD-3-Clause ve yüzlerce alt
bileşen), Node.js (MIT), V8 (BSD-3-Clause) ve FFmpeg (LGPL-2.1, dinamik kitaplık) taşır. electron-builder
her pakete `LICENSE.electron.txt` ve `LICENSES.chromium.html` dosyalarını otomatik ekler; bu, Chromium'un atıf
yükümlülüklerini karşılar. FFmpeg Electron'da paylaşılan kitaplık olarak gelir, LGPL koşulu (kitaplığın
değiştirilebilirliği) bu yolla sağlanır. AstroFree bunlara değişiklik yapmaz.

## 2. Yalnızca geliştirmede kullanılanlar (pakete girmez)

| Paket | Lisans |
|---|---|
| electron-builder 26.18.0, electron-vite 6.0.0, vite 8.3.5, @vitejs/plugin-react 6.2.0 | MIT |
| typescript 7.0.2 | Apache-2.0 |
| @types/node, @types/react, @types/react-dom | MIT |
| topojson-client 3.1.0, topojson-server 3.0.1, topojson-simplify 3.0.3, world-atlas 2.0.2 | ISC |
| design-taste-frontend skill (`.agents/skills/`, Leonxlnx/taste-skill) | MIT — tasarım rehberi; uygulamaya kod olarak girmez |

Derleme araçlarının lisansları üretilen çıktıya geçmez.

## 3. Lisans uyumluluğu

```
                 ┌─────────────── AstroFree (AGPL-3.0-or-later) ────────────────┐
  İzin verici →  │ MIT · ISC · BSD · Apache-2.0 · PSF-2.0 · BlueOak · CC0 · PD    │  AGPL-3.0'a dahil edilebilir
  Fontlar     →  │ OFL-1.1 (fontlar ayrı eser olarak, kendi lisanslarıyla)       │  Birlikte dağıtılabilir
  Copyleft    →  │ swisseph-wasm (GPL-3.0+)  ←→  Swiss Ephemeris (AGPL-3.0)      │  GPLv3 §13 / AGPLv3 §13
  Veri        →  │ GeoNames (CC BY 4.0)                                           │  Atıfla birlikte dağıtılabilir
                 └───────────────────────────────────────────────────────────────┘
```

- **MIT, ISC, BSD, PSF-2.0, BlueOak-1.0.0, CC0:** AGPL-3.0 ile uyumlu, yalnızca telif ve lisans bildiriminin
  korunmasını ister. npm paketleri lisans dosyalarını `node_modules` içinde taşır; arayüze gömülenler
  `THIRD_PARTY_NOTICES.md` ile bildirilir.
- **Apache-2.0** (TypeScript, DOMPurify seçeneği): GPL-3.0/AGPL-3.0 ile uyumludur (GPL-2.0 ile değil). AstroFree
  "3.0 veya sonrası" lisanslı olduğundan sorun yoktur.
- **OFL-1.1:** fontlar yazılımla birlikte dağıtılabilir; font dosyaları tek başına satılamaz ve ayrılmış
  font adları değiştirilmiş sürümlerde kullanılamaz. AstroFree fontları değiştirmez.
- **GPL-3.0 ↔ AGPL-3.0:** iki lisansın 13. maddeleri bu ikisinin tek bir eserde birleştirilmesine açıkça izin
  verir. AstroFree AGPL-3.0 lisanslı olduğundan GPL-3.0 sarmalayıcı (swisseph-wasm) ile AGPL-3.0 Swiss Ephemeris tek bir AGPL eserinde
  sorunsuz birleşir.
- **CC BY 4.0 (veri):** yazılım lisansı değil veri lisansıdır; atıf ve değişiklik bildirimi şartıyla her türlü
  kullanıma izin verir, AGPL ile çatışmaz.

## 4. Swiss Ephemeris'e özel notlar

Swiss Ephemeris, Astrodienst AG tarafından iki lisansla sunulur:

1. **AGPL-3.0** — açık kaynak projeler için ücretsiz. AstroFree bu seçeneği kullanır.
2. **Swiss Ephemeris Professional License** — ücretli; kaynağı açılmayan (kapalı) yazılımlarda kullanım için.

Sonuçları:

- AstroFree'nin AGPL-3.0 altında kaynağı açık kaldığı sürece ek lisans gerekmez.
- AstroFree'nin kaynağı kapatılmış bir sürümünü, ya da Swiss Ephemeris'i içeren kapalı bir eklentiyi dağıtmak
  isteyen biri Astrodienst'ten profesyonel lisans almalıdır.
- AstroFree'nin hesap motorunu değiştirip bir **web hizmeti** olarak sunan biri, AGPL gereği o hizmetin
  kullanıcılarına değiştirilmiş kaynak kodu sunmalıdır.
- Ana sürece gömülü `swisseph.data` dosyası Astrodienst'in efemeris dosyalarını (JPL DE431 türevli) içerir ve
  aynı lisansa tabidir.

## 5. Ağ hizmetleri (yazılım lisansı değil, kullanım koşulları)

| Hizmet | Ne zaman | Koşullar |
|---|---|---|
| Open-Meteo Geocoding API | Yerel listede bulunmayan yer adı arandığında | Ticari olmayan kullanımda ücretsiz; veriler CC BY 4.0 (GeoNames türevli) |
| GitHub REST API | Güncelleme denetimi | GitHub kullanım koşulları; anonim istek |
| Anthropic, OpenAI, Google Gemini, DeepSeek API'leri | Kullanıcı bu sağlayıcıyı seçip mesaj gönderdiğinde | Her sağlayıcının kendi koşulları; anahtar ve ücret kullanıcıya aittir |
| Claude Code, Codex, Gemini CLI | Kullanıcı kurduysa ve seçtiyse | Ayrı yazılımlardır, AstroFree ile dağıtılmaz; yalnızca alt süreç olarak çağrılır |

CLI araçları AstroFree ile birleştirilmez veya bağlanmaz (yalnızca ayrı program olarak çalıştırılır), bu nedenle
lisansları AstroFree'yi etkilemez.

## 6. Dağıtımcı için kontrol listesi

- [x] `LICENSE` (AGPL-3.0 tam metni) ve `NOTICE.md` (telif ve 7. madde ek koşulları) depoda ve pakette.
- [x] `THIRD_PARTY_NOTICES.md` depoda ve pakette.
- [x] Electron/Chromium lisans dosyaları electron-builder tarafından pakete ekleniyor.
- [x] GeoNames atfı README, THIRD_PARTY_NOTICES ve uygulama içi bilgilerde.
- [x] Her release etiketi için kaynak kodu GitHub'da (otomatik `Source code (zip/tar.gz)`).
- [ ] Değiştirilmiş bir sürüm dağıtırsanız: değişiklikleri ve tarihlerini belirtin (AGPL-3.0 §5a), farklı bir ad ve logo kullanın (`NOTICE.md` §7(c), 7(e)).
- [ ] Kapalı kaynak türev: Astrodienst profesyonel lisansı alın ve AGPL kodunu çıkarın — aksi halde mümkün değildir.

## 7. Bağımlılık listesini yenilemek

```bash
npm ls --omit=dev --all --parseable | tail -n +2 | while read d; do
  node -e 'const j=require(process.argv[1]+"/package.json");console.log(j.name+"@"+j.version, j.license)' "$d"
done | sort -u
```

Yeni bir bağımlılık eklerken lisansının AGPL-3.0 ile uyumlu olduğundan emin olun (ör. SSPL, BUSL, "Commons
Clause" eklentili veya yalnızca GPL-2.0 lisanslı paketler uyumsuzdur).
