# Contributing

Thanks for helping.

## Issues

Use the **bug** or **feature** templates. Include:

- Card version from the editor banner (`Mushroom Weather Station Card · vX.Y.Z`)
- Home Assistant version
- Card YAML (redact personal entity IDs if you want)

## Code

- Source: `src/` (TypeScript)
- Built outputs: `dist/mushroom-weather-station-card.js` and `…-editor.js` (HACS ships these)
- Version: `bash scripts/set-version.sh 0.9.1` then `npm run build`
- Tests: `npm test`
- Offline visual demo: `npm run demo` → `http://127.0.0.1:8765/demo/` (language / units / theme switchers in the header)
- Screenshots + GIF for the README: `node scripts/screenshots.mjs` (needs Playwright with Chromium, and ffmpeg)

### Layout

- `src/card.ts` — element lifecycle, data fetching, event delegation, render loop, graph dialog
- `src/sections/*.ts` — one pure string renderer per card section; add new sections here and register them in `sections/index.ts`
- `src/i18n/` — `en.ts` is the source of truth; other languages may be partial
- `src/data.ts` (history + statistics), `src/health.ts`, `src/derived.ts`, `src/graph.ts`, `src/morph.ts`

CI runs `npm test` and `npm run build`, and fails if the committed `dist/` differs from a fresh build — always commit `dist/` with source changes.

### Translations

Copy `src/i18n/de.ts` to a new language code, translate what you can, and add it to `LANGS` and `LANGUAGES` in `src/i18n/index.ts`. Untranslated keys fall back to English. `npm test` checks that every key you add exists in English.

Both dist JS files must ship together on the GitHub release.

## Release

Preferred: bump `package.json` / `src/version.ts` on `main`. The **Auto Release** workflow tags `vX.Y.Z` and attaches `dist/*.js` so HACS can update.

Manual fallback:

1. Commit source + built `dist/` to `main`
2. **Actions** → **Release** → **Run workflow**
3. Version: `0.7.1`
4. Optional notes

That stamps `CARD_VERSION`, commits, tags, and publishes a GitHub release with both JS files.
