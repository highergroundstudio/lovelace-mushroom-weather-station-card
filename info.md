# Mushroom Weather Station Card

Lovelace card for personal weather station sensors (Ecowitt, Ambient, Fine Offset, and similar).

![Mushroom Weather Station Card](https://raw.githubusercontent.com/highergroundstudio/lovelace-mushroom-weather-station-card/main/images/card-preview.svg)

## Highlights

- One `prefix` field maps Ecowitt-style entities
- Home Assistant entity pickers for every override
- Layouts: `full`, `compact`, glance `chips` with expand
- Custom section order (drag-and-drop in the editor)
- Hourly + daily forecast with precip %
- History sparklines and wind rose
- Weather alerts banner
- Soil moisture/temp 1–8, leaf wetness, AQI, VOC, noise
- Sunrise / sunset / moon phase
- Rain month vs normal + days since rain
- Stale-data warning and pressure trend
- Mushroom is not required

## Confirm version

Card editor banner should show **v0.7.0** after HACS update + hard refresh.

## Example

```yaml
type: custom:mushroom-weather-station-card
name: Backyard Station
prefix: ws
layout: full
show_hourly_forecast: true
show_history_sparklines: true
show_wind_rose: true
show_alerts: true
weather_entity: weather.home
rain_month_normal: 2.5
section_order:
  - conditions
  - rain
  - wind
  - forecast
```
