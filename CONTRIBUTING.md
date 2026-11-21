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
- Version: `bash scripts/set-version.sh 0.7.1` then `npm run build`
- Tests: `npm test`
- Offline visual demo: `npm run demo` → `http://127.0.0.1:8765/demo/`

Both dist JS files must ship together on the GitHub release.

## Release

Preferred: bump `package.json` / `src/version.ts` on `main`. The **Auto Release** workflow tags `vX.Y.Z` and attaches `dist/*.js` so HACS can update.

Manual fallback:

1. Commit source + built `dist/` to `main`
2. **Actions** → **Release** → **Run workflow**
3. Version: `0.7.1`
4. Optional notes

That stamps `CARD_VERSION`, commits, tags, and publishes a GitHub release with both JS files.
