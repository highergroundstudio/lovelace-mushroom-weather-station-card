# Changelog

## 0.3.0 — 2026-08-31

- Dynamic icon colors from `thresholds` (`above` / `below` → CSS color vars on `ha-icon`)
- Compact layout hides section headers and tightens tile padding/gap
- Section visibility: hide empty groups, plus `hide_conditions` / `hide_wind` / `hide_rain` / `hide_sun` / `hide_battery`
- Per-tile `tap_action`, `hold_action`, `double_tap_action` (default tap opens more-info)
- `battery_warning_threshold` flips the footer to Low Battery + `mdi:battery-alert`
- `labels` and `units` overrides per sensor slot

## 0.2.0 — 2026-08-31

- Entity overrides use Home Assistant `ha-entity-picker` (search, area/device, domain filter)
- Loads the picker the same way as AlertTicker (`loadCardHelpers` + entities/glance editor)
- Prefix still auto-fills empty slots; pickers override individual sensors
- Device-class filters per slot (temperature, precipitation, wind, battery, …)

## 0.1.0 — 2026-08-31

- Initial public card
- Layouts: full, compact, chips
- Prefix auto-map for Ecowitt-style `sensor.{prefix}_*` entities
- Heat / humidity / dew / UV / rain coloring
- Wind degrees → cardinal + arrow
- Visual editor
