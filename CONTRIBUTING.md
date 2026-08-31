# Contributing

Thanks for helping.

## Issues

Use the **bug** or **feature** templates. Include:

- Card version from the editor banner (`Mushroom Weather Station Card · vX.Y.Z`)
- Home Assistant version
- Card YAML (redact personal entity IDs if you want)

## Code

- Card: `mushroom-weather-station-card.js` (this file owns `CARD_VERSION`)
- Editor: `mushroom-weather-station-card-editor.js` (reads version from the card custom element)
- Both files must ship together in `dist/` and on the GitHub release

## Bump a version

```bash
./scripts/set-version.sh 0.4.3
```

That updates `CARD_VERSION` in the card JS, `package.json`, and the README banner. Then copy both JS files into `dist/`, commit, tag `v0.4.3`, and attach both files on the GitHub release.
