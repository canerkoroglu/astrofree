# Third-party notices

AstroFree is licensed under AGPL-3.0-or-later (see `LICENSE` and `NOTICE.md`). It bundles or uses the following
third-party work under their own licences.

| Component | Use | Licence |
|---|---|---|
| [Swiss Ephemeris](https://www.astro.com/swisseph/) 2.10 (Astrodienst AG), via [swisseph-wasm](https://www.npmjs.com/package/swisseph-wasm) | Planet, house, star and eclipse calculations | AGPL-3.0 or Swiss Ephemeris Professional License; wrapper GPL-3.0-or-later |
| [GeoNames](https://www.geonames.org/) | Offline city and district database (`resources/cities.json.gz`) | CC BY 4.0 |
| [Natural Earth](https://www.naturalearthdata.com/) via [world-atlas](https://github.com/topojson/world-atlas) | World map, country and province borders | Public domain |
| [tz-lookup](https://github.com/darkskyapp/tz-lookup-oss) | Offline time zone lookup by coordinates | CC0-1.0 |
| [Noto Sans Symbols / Symbols 2](https://fonts.google.com/noto) | Astrological glyphs | SIL Open Font License 1.1 |
| [Public Sans](https://public-sans.digital.gov/) | Interface typeface | SIL Open Font License 1.1 |
| [IBM Plex Mono](https://www.ibm.com/plex/) | Figures and times | SIL Open Font License 1.1 |
| [Electron](https://www.electronjs.org/), [React](https://react.dev/), [marked](https://marked.js.org/), [DOMPurify](https://github.com/cure53/DOMPurify), [electron-updater](https://www.electron.build/) | Application runtime and UI | MIT (DOMPurify: Apache-2.0 or MPL-2.0) |
| [taste-skill / design-taste-frontend](https://github.com/Leonxlnx/taste-skill) (`.agents/skills/design-taste-frontend`) | Design guidance used during development; not shipped in the app | MIT (see the folder's `LICENSE`). Library photographs referenced by the skill are Unsplash-licensed via Lorem Picsum. |

## Attributions

- City and district data © [GeoNames](https://www.geonames.org/), licensed under
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). The data was filtered and reduced for AstroFree.
- Made with [Natural Earth](https://www.naturalearthdata.com/). Free vector and raster map data.
- Swiss Ephemeris © Astrodienst AG, Zurich, Switzerland. Used under the GNU Affero General Public License v3.

## Bundled support libraries

electron-updater pulls in builder-util-runtime, debug, fs-extra, graceful-fs, js-yaml, jsonfile, lazy-val,
lodash.escaperegexp, lodash.isequal, ms, semver, tiny-typed-emitter and universalify (MIT / ISC),
argparse (Python-2.0) and sax (BlueOak-1.0.0). Their licence files ship inside the app archive under
`node_modules/`. Electron's own licences are in `LICENSE.electron.txt` and `LICENSES.chromium.html`
next to the application.

A full compatibility analysis is in [`docs/FOSS-ANALYSIS.md`](docs/FOSS-ANALYSIS.md).
