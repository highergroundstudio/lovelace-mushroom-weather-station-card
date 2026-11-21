# Mushroom Weather Station Card

A Lovelace card for **personal weather station** sensors (Ecowitt, Ambient, Fine Offset, and similar). Prefix auto-fill, Home Assistant entity pickers, heat/UV coloring, wind compass, and rain sparkline.

![Mushroom Weather Station Card](images/card-preview.svg)

[![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.8+-41BDF5.svg)](https://www.home-assistant.io)
[![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)](https://hacs.xyz)
[![Release](https://img.shields.io/github/v/release/highergroundstudio/lovelace-mushroom-weather-station-card.svg)](https://github.com/highergroundstudio/lovelace-mushroom-weather-station-card/releases)
[![License](https://img.shields.io/badge/license-MIT-green.svg)](LICENSE)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=highergroundstudio&repository=lovelace-mushroom-weather-station-card&category=plugin)

## About

One `prefix` field maps Ecowitt-style entity IDs (`sensor.ws_temperature`, `sensor.ws_daily_rain`, …). Override any slot with a real Home Assistant entity picker. Mushroom itself is **not required**.

Confirm the install in the card editor banner: **Mushroom Weather Station Card · v0.6.0**.

## Install with HACS

1. HACS → **Custom repositories**
2. URL: `https://github.com/highergroundstudio/lovelace-mushroom-weather-station-card`
3. Type: **Dashboard**
4. Download **Mushroom Weather Station Card**
5. Hard-refresh the browser (Ctrl+F5)

```yaml
url: /hacsfiles/lovelace-mushroom-weather-station-card/mushroom-weather-station-card.js
type: module
```

Both of these files must be in the same folder after install:

- `mushroom-weather-station-card.js` — card
- `mushroom-weather-station-card-editor.js` — visual editor (loaded when you open Edit)

## Add the card

```yaml
type: custom:mushroom-weather-station-card
name: Backyard Station
prefix: ws
layout: full
unit_system: native
```

Layouts: `full`, `compact`, `chips`.

## Options

```yaml
unit_system: imperial   # or metric | native
tablet_mode: true
show_forecast: true
weather_entity: weather.home
forecast_days: 5
show_updated: true
stale_minutes: 30
show_beaufort: false
battery_warning_threshold: 20
section_order:
  - conditions
  - rain
  - wind
  - sun
  - soil
  - lightning
  - air
  - station
  - forecast
  - battery
hide_sun: false
hide_soil: false
hide_lightning: false
hide_air: false
thresholds:
  uv:
    - above: 8
      color: purple
  temperature:
    - below: 32
      color: blue
labels:
  temperature: Outside
  soil_moisture_1: Raised bed
units:
  rain_today: in
```

### Section order

Use `section_order` (or the editor **Order** tab) to rearrange blocks after the hero. Valid ids: `conditions`, `wind`, `rain`, `sun`, `soil`, `lightning`, `air`, `station`, `forecast`, `battery`.

Visual editor tabs: **Layout** · **Entities** · **Order** · **Display**.

## Develop

```bash
npm install
npm test
npm run build   # writes dist/*.js
npm run demo    # http://127.0.0.1:8765/demo/
```

Source lives in `src/`. HACS still ships the built files in `dist/`.

## Just to be clear

This project is **not affiliated with, endorsed, or supported by** the Home Assistant project or by the Mushroom Cards authors. It is provided as-is.

## Contributing

Bugs and ideas: use the GitHub issue templates (bug / feature). Pull requests against `main` are welcome.

## License

MIT — see [LICENSE](LICENSE).
