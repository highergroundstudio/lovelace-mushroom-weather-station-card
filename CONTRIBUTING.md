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
- Version: `src/version.ts` via `npm run version -- 0.6.1` then `npm run build`
- Tests: `npm test`
- Offline visual demo: `npm run demo` → `http://127.0.0.1:8765/demo/`

Both dist JS files must ship together on the GitHub release.

## Release from github.com

1. Commit the source + built `dist/` changes to `main` first (the workflow tags whatever is on `main`).
2. **Actions** → **Release** → **Run workflow**
3. Version: `0.6.1`
4. Optional notes
5. Leave pre-release off unless you want a beta

That stamps `CARD_VERSION`, commits, tags `v0.6.1`, and publishes a GitHub release with both `dist/` JS files attached. HACS picks that release up as an update.
