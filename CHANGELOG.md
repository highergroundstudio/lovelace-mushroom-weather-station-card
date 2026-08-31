# Changelog

## 0.4.0 — 2026-08-31

Stable release. Split into card + editor modules (AlertTicker layout).

- Card: `mushroom-weather-station-card.js`
- Editor: `mushroom-weather-station-card-editor.js` (loaded only when Edit opens)
- Editor banner shows **v0.4.0** so you can confirm HACS upgraded the file
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
