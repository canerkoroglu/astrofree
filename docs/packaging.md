# Paket yöneticileri ve mağazalar

Her sürümde CI iki şey üretir:

- Release sayfasına **`SHA256SUMS.txt`** (bütün dosyaların SHA-256 özetleri);
- iş akışı çalışmasına **`package-manifests-<sürüm>`** eki: winget, Scoop ve Homebrew manifestleri.

Elle üretmek için:

```bash
node scripts/package-manifests.mjs 0.1.6 SHA256SUMS.txt packaging/out
```

Aşağıdaki gönderimler GitHub hesabınızla yapılır; CI bunları kendiliğinden göndermez.

## winget (Windows)

Kullanıcılar `winget install CanerKoroglu.AstroFree` ile kurar; uygulama Microsoft'un arama sonuçlarında da çıkar.

1. https://github.com/microsoft/winget-pkgs deposunu fork edin.
2. `package-manifests` ekindeki `winget/manifests/...` klasörünü fork'unuzda aynı yola koyun.
3. Pull request açın. Microsoft'un otomatik doğrulaması kurulumu sanal makinede dener; birkaç gün içinde birleşir.

Kolay yol: `winget install wingetcreate`, sonra her yeni sürümde

```powershell
wingetcreate update CanerKoroglu.AstroFree -v 0.1.6 -u https://github.com/canerkoroglu/astrofree/releases/download/v0.1.6/AstroFree-0.1.6-win-x64.exe --submit
```

İlk gönderimde SmartScreen uyarısı devam eder; winget dosyayı kendi indirdiği için kullanıcı uyarıyı görmez.

## Scoop (Windows)

Kendi "bucket" deponuzla: `canerkoroglu/scoop-astrofree` adlı bir depo açıp `astrofree.json` dosyasını
köküne koyun. Kullanıcılar:

```powershell
scoop bucket add astrofree https://github.com/canerkoroglu/scoop-astrofree
scoop install astrofree
```

Manifestte `checkver`/`autoupdate` olduğu için sonraki sürümler Scoop'un kendi aracıyla da güncellenebilir.
Uygulama tanındıktan sonra resmî [Extras](https://github.com/ScoopInstaller/Extras) bucket'ına da önerilebilir.

## Homebrew (macOS)

Homebrew'un ana cask deposu 2026'dan itibaren notarize edilmemiş uygulamaları kabul etmiyor; bu yüzden kendi
"tap" deponuz kullanılır.

1. GitHub'da **`canerkoroglu/homebrew-astrofree`** adlı herkese açık bir depo oluşturun (adın `homebrew-` ile başlaması şart).
2. `package-manifests` ekindeki `homebrew/Casks/astrofree.rb` dosyasını depoda `Casks/astrofree.rb` olarak yükleyin.
3. Kullanıcılar:

```bash
brew install --cask canerkoroglu/astrofree/astrofree
```

Cask, uygulama ad-hoc imzalı olduğu için kurulumdan sonra karantina işaretini kaldırır; kullanıcı "sağ tık → Aç"
adımını yaşamaz.

## Microsoft Store (Windows) — SmartScreen uyarısını tamamen kaldırır

Store'a gönderilen paketi Microsoft kendisi imzalar; bu yüzden uyarı hiç çıkmaz. Bireysel geliştirici hesabı ücretsizdir.

1. https://storedeveloper.microsoft.com adresinden bireysel geliştirici olarak kaydolun.
2. Partner Center'da **AstroFree** adını ayırın (Apps and games → New product → MSIX or PWA app).
3. **Product identity** sayfasındaki üç değeri not edin: `Package/Identity/Name`,
   `Package/Identity/Publisher` (`CN=...` biçiminde) ve `Package/Properties/PublisherDisplayName`.
4. Bu değerler `electron-builder.yml` içindeki `appx` bölümüne yazılır ve CI `appx` hedefini de üretir;
   oluşan `.appx` dosyası Partner Center'a yüklenir. (Bu değerler gelince yapılandırma eklenecek.)

Store sürümü kendi güncelleme sistemini kullanır; uygulamadaki GitHub güncelleme denetimi Store kurulumunda kapatılmalıdır.

## Flathub (Linux)

Flathub kaynak koddan derleme ve ayrı bir inceleme süreci ister. Uygulama yeterince kullanıcıya ulaştıktan sonra
önerilir; o zamana kadar `.AppImage` ve `.deb` yeterlidir.
