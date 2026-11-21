# Changelog

## 0.6.0 — 2026-11-21

Developer and UI upgrade.

- **TypeScript source + Vite build** — `src/` modules, `npm run build`, Vitest helpers
- **Custom section order** — `section_order` YAML + Order tab in the editor (↑ / ↓)
- **Visual polish** — status chip, section dividers, refined tiles/hero/forecast, softer surfaces

## 0.5.0 — 2026-11-21

Feature update for personal weather stations (Ecowitt-style add-ons and freshness).

- **Stale data warning** — subtitle shows relative last-updated time; warning style when older than `stale_minutes` (default 30)
- **Soil moisture** — channels 1–4 with moisture thresholds (`hide_soil`)
- **Lightning** — strike count, distance, last strike (`hide_lightning`)
- **Air quality** — PM2.5 tile with Good / Moderate / Sensitive / Unhealthy labels (`hide_air`)
- **Pressure trend** — Rising / Steady / Falling from successive readings
- **Wind direction text** — accepts cardinal strings (e.g. `NNW`) as well as degrees
- **Beaufort scale** — optional `show_beaufort` on the wind speed tile
- **Forecast** — precipitation probability per day; configurable `forecast_days` (1–7)
- **Battery %** — percentage sensors show the value in the status line
- **Render skip** — re-renders only when watched entities or forecast change
- Editor: new entity slots, section toggles, stale / forecast / Beaufort options

## 0.4.7 — 2026-08-31

- Enhance date formatting for last-rain relative times

## 0.4.2 — 2026-08-31

- Editor toggles use Home Assistant `ha-switch` rows instead of raw checkboxes
- Each option is label + help on the left, switch on the right
- Section hide switches explain what they cover

## 0.4.1 — 2026-08-31

- HACS store polish (README badges, Open in HACS, contributing, security)

## 0.4.0 — 2026-08-31

Stable release. Split into card + editor modules (AlertTicker layout).

- Card: `mushroom-weather-station-card.js`
- Editor: `mushroom-weather-station-card-editor.js` (loaded only when Edit opens)
- Editor banner shows version so you can confirm HACS upgraded the file
- `ha-entity-picker` overrides + prefix auto-fill
- Threshold icon colors, compact layout, hide-section toggles
- Per-tile tap / hold / double-tap actions
- `battery_warning_threshold`, custom `labels` and `units`
- Today high / low tiles (`temp_high` / `temp_low`)
- Wind compass from degrees
- Rain T/E/W/M/Y sparkline
- `unit_system`: native | imperial | metric
- `tablet_mode` (hold for more-info)
- Optional forecast row from a `weather.*` entity
- Pressure, indoor temp/humidity, CO₂ slots
- Editor tabs: Layout | Entities | Display

## 0.3.0 — 2026-08-31

Documented only — JS was not published to `dist/`.

## 0.2.0 — 2026-08-31

- Entity pickers planned; dist still 0.1.0 on GitHub

## 0.1.0 — 2026-08-31

- Initial public card
