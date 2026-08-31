# Mushroom Weather Station Card

A Home Assistant Lovelace card for **personal weather station** sensors (Ecowitt, Ambient, Fine Offset, and similar). Mushroom-style tiles, heat/UV coloring, and a one-field prefix mapper so you are not wiring 20+ entities by hand.

![Mushroom Weather Station Card](images/card-preview.svg)

![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.8+-41BDF5.svg)
![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Install with HACS (custom repository)

1. HACS → **Custom repositories**
2. Repository: `https://github.com/highergroundstudio/lovelace-mushroom-weather-station-card`
3. Type: **Dashboard** (Lovelace / plugin)
4. Download **Mushroom Weather Station Card**
5. Hard-refresh the browser

```yaml
url: /hacsfiles/lovelace-mushroom-weather-station-card/mushroom-weather-station-card.js
type: module
```

Mushroom itself is **not required**.

Confirm the install in the card editor banner: `Mushroom Weather Station Card · v0.4.0`.

## Add the card

```yaml
type: custom:mushroom-weather-station-card
name: Backyard Station
prefix: ws
layout: full
unit_system: native
```

`prefix: ws` fills Ecowitt-style IDs such as `sensor.ws_temperature` and `sensor.ws_daily_rain`.

Layouts: `full`, `compact`, `chips`.

## Useful options

```yaml
unit_system: imperial   # or metric | native
tablet_mode: true
show_forecast: true
weather_entity: weather.home
battery_warning_threshold: 20
hide_sun: false
thresholds:
  uv:
    - above: 8
      color: purple
  temperature:
    - below: 32
      color: blue
labels:
  temperature: Outside
units:
  rain_today: in
```

Visual editor tabs: **Layout**, **Entities**, **Display**.

## License

MIT
