# Changelog

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
