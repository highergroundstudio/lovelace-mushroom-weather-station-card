# Mushroom Weather Station Card

A Home Assistant Lovelace card for **personal weather station** sensors (Ecowitt, Ambient, Fine Offset, and similar). Mushroom-style tiles, heat/UV coloring, and a one-field prefix mapper so you are not wiring 19 entities by hand.

![Home Assistant](https://img.shields.io/badge/Home%20Assistant-2024.8+-41BDF5.svg)
![HACS](https://img.shields.io/badge/HACS-Custom-orange.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)

## Install with HACS (custom repository)

This card ships as a HACS **Dashboard** plugin. Until it is in the default store:

1. HACS → **Custom repositories**
2. Repository: `https://github.com/highergroundstudio/lovelace-mushroom-weather-station-card`
3. Type: **Dashboard** (Lovelace / plugin)
4. Download **Mushroom Weather Station Card**
5. Refresh the browser

```yaml
url: /hacsfiles/lovelace-mushroom-weather-station-card/mushroom-weather-station-card.js
type: module
```

Mushroom itself is **not required**.

## Add the card

```yaml
type: custom:mushroom-weather-station-card
name: Backyard Station
prefix: ws
layout: full
```

`prefix: ws` fills Ecowitt-style entity IDs such as `sensor.ws_temperature` and `sensor.ws_daily_rain`.

Layouts: `full`, `compact`, `chips`.

## License

MIT
