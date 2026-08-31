# Contributing

Thanks for helping.

## Issues

Use the **bug** or **feature** templates. Include:

- Card version from the editor banner (`Mushroom Weather Station Card · vX.Y.Z`)
- Home Assistant version
- Card YAML (redact personal entity IDs if you want)

## Code

- Card: `dist/mushroom-weather-station-card.js` (owns `CARD_VERSION`)
- Editor: `dist/mushroom-weather-station-card-editor.js` (reads version from the card)
- Both files must ship together on the GitHub release

## Release from github.com

1. Commit the JS changes to `main` first (the workflow tags whatever is on `main`).
2. **Actions** → **Release** → **Run workflow**
3. Version: `0.4.3`
4. Optional notes
5. Leave pre-release off unless you want a beta

That stamps `CARD_VERSION`, commits, tags `v0.4.3`, and publishes a GitHub release with both `dist/` JS files attached. HACS picks that release up as an update.
