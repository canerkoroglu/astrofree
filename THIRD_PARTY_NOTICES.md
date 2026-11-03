# Third-party notices

AstroFree is licensed under AGPL-3.0-or-later (see [`LICENSE`](LICENSE) and [`NOTICE.md`](NOTICE.md)). It ships the
third-party work below under their own licences. The **full licence texts** are in
[`THIRD_PARTY_LICENSES.txt`](THIRD_PARTY_LICENSES.txt) (regenerate with `node scripts/third-party-licenses.mjs`);
Electron's and Chromium's are in `LICENSE.electron.txt` and `LICENSES.chromium.html` inside every package.

| Component | Used for | Licence |
|---|---|---|
| [Swiss Ephemeris](https://www.astro.com/swisseph/) © Astrodienst AG, via [swisseph-wasm](https://github.com/prolaxu/swisseph-wasm) | Planets, houses, fixed stars, eclipses | AGPL-3.0 (wrapper: GPL-3.0-or-later) |
| [GeoNames](https://www.geonames.org/) | Offline cities and districts (filtered and reduced) | CC BY 4.0 |
| [Open-Meteo Geocoding API](https://open-meteo.com/) | Online place search when a place is not in the offline list | CC BY 4.0 (data) |
| [Natural Earth](https://www.naturalearthdata.com/) | World map, country and province borders | Public domain |
| [tz-lookup](https://github.com/darkskyapp/tz-lookup-oss) | Time zone from coordinates | CC0-1.0 |
| Public Sans, IBM Plex Mono, Noto Sans Symbols 1/2 (via Fontsource) | Interface and astrological glyph fonts | SIL OFL 1.1 |
| React, marked, electron-updater and their dependencies | Interface, Markdown, updates | MIT / ISC / BSD-style |
| DOMPurify | Sanitising AI answers | Apache-2.0 (chosen of Apache-2.0 / MPL-2.0) |
| Electron (Chromium, Node.js, V8, FFmpeg) | Application runtime | MIT and the licences listed by Chromium |

Development-only tools (TypeScript, Vite, electron-builder, the `design-taste-frontend` skill in `.agents/`, MIT) are
not shipped in the app.
