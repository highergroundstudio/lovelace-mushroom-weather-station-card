# Changelog

## 0.9.0 — 2026-11-27

Correctness, accessibility, and reach.

- **Record book uses long-term statistics** — month/year extremes now come from `recorder/statistics_during_period`, so they are no longer silently limited to the recorder's 10-day raw-history window. Sensors without statistics fall back to raw history and the card says so
- **No more full re-render** — updates patch the DOM in place (keyed morphing + event delegation), so the card no longer flickers, loses keyboard focus, or restarts hover/transition states on every sensor tick
- **Graph popup** — tap a tile (`graph_popup: true` or `action: graph`) for a 24h / 7d / 30d chart with min–max band, pointer and arrow-key readout, min/avg/max
- **Station health section** — offline and silent sensors, auto-discovered transmitter batteries (`battery_entities` to override), optional `signal_strength` slot
- **Calculated values** — feels-like (NWS wind chill / heat index) and dew point (Magnus) when the station has no sensor (`derive_missing`)
- **Translations** — en, de, fr, es, nl; follows HA language and number format, `language` override
- **Accessibility** — labelled tiles, charts and progress bars, keyboard-operable compass/rose/forecast, focus rings, modal dialog focus handling, reduced motion
- **Editor previews** — visual layout picker, live record-window and seasonal-skin previews, comfort-band diagram, language picker
- **Fixes** — rain month vs normal compared mm against inches in metric; lightning distance and precipitation peak were not unit-converted; Beaufort used km/h as mph in metric; hourly forecast strip could widen the card
- **Review fixes** — graph: statistics failures fall back to recorded states, failed loads are not cached, unit changes reload an open graph, outages break the line, recorded-state averages are time-weighted, range buttons work with arrow keys; derived chips no longer open a mislabelled graph; number format no longer leaks between cards; a hold on one tile no longer swallows the next tap elsewhere; record timestamps never land in the future and one failed history call no longer drops the whole record book; Station health says "online" when report times are unknown, shows unavailable batteries as unknown, watches the same batteries it shows and refreshes with the header hidden; empty hourly forecast shows a waiting message; rain total bars compare like units; morph keeps focus when nodes move; editor re-translates when the HA language arrives; Pages workflow scoped to least privilege; screenshot server path check
- **Project** — sections split into `src/sections/`, CI runs tests + build and fails on a stale `dist/`, GitHub Pages demo, real screenshots and GIF, 43 tests

## 0.8.0 — 2026-11-21

Insight surfaces for history and atmosphere.

- **Record book** — month/year extremes (hottest, coldest, peak gust, peak rain rate, wettest day) from HA history, with “Set today” badges
- **Precipitation timeline** — rain-rate intensity bars in the rain section (`show_precip_timeline`)
- **Comfort zones** — hours in a configurable temp×humidity band plus scatter plot (`show_comfort`, comfort_* options)
- **Seasonal skins** — soft HA-token accents by meteorological season and weather condition (`seasonal_skins`, `hemisphere`)

## 0.7.0 — 2026-11-21

Station dashboard upgrade.

- **Hourly forecast strip** — next 6–24h with temp + precip % (`show_hourly_forecast`, `hourly_forecast_hours`)
- **History sparklines** — mini charts on temperature, humidity, wind, pressure (HA history API)
- **Weather alerts banner** — from `weather` attributes or `alert_entity`, severity colors above the hero
- **More sensors** — leaf wetness, soil moisture/temp channels 1–8, AQI, VOC, noise
- **Sunrise / sunset / moon** — `sun_entity` + `moon_entity` in the sun section
- **Wind rose** — 24h direction distribution beside the compass (`show_wind_rose`)
- **Rain goals** — month vs `rain_month_normal` progress + days since last rain
- **Theme tokens** — deeper HA `--primary-color` / `--accent-color` integration
- **Chip glance bar** — denser chips with tap-to-expand secondary metrics
- **Editor drag-and-drop** — section Order tab uses HTML5 drag reorder
- **Unit-aware thresholds** — temp blue cutoff shown in °C/°F from `unit_system`
- **Auto-release** — GitHub Action publishes HACS release when `package.json` version changes on `main`

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

- Entity picker planned; dist still 0.1.0 on GitHub

## 0.1.0 — 2026-08-31

- Initial public card
