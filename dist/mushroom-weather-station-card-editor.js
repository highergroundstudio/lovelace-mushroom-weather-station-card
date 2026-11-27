const CARD_TYPE = "mushroom-weather-station-card";
const soilMoisture = {};
const soilTemp = {};
for (let i = 1; i <= 8; i++) {
  soilMoisture[`soil_moisture_${i}`] = `sensor.{p}_soil_moisture_${i}`;
  soilTemp[`soil_temperature_${i}`] = `sensor.{p}_soil_temperature_${i}`;
}
const PREFIX_MAP = {
  temperature: "sensor.{p}_temperature",
  feels_like: "sensor.{p}_feels_like",
  humidity: "sensor.{p}_humidity",
  dew_point: "sensor.{p}_dew_point",
  temp_high: "sensor.{p}_temp_max",
  temp_low: "sensor.{p}_temp_min",
  wind_speed: "sensor.{p}_wind_speed",
  wind_gust: "sensor.{p}_wind_gust",
  max_gust: "sensor.{p}_max_gust",
  wind_direction: "sensor.{p}_wind_direction",
  rain_rate: "sensor.{p}_precipitation_intensity",
  rain_today: "sensor.{p}_daily_rain",
  rain_event: "sensor.{p}_event_rain",
  rain_week: "sensor.{p}_weekly_rain",
  rain_month: "sensor.{p}_monthly_rain",
  rain_year: "sensor.{p}_yearly_rain",
  last_rain: "sensor.{p}_last_rain",
  uv: "sensor.{p}_uv_index",
  irradiance: "sensor.{p}_irradiance",
  illuminance: "sensor.{p}_solar_rad_lx",
  pressure: "sensor.{p}_relative_pressure",
  pressure_abs: "sensor.{p}_absolute_pressure",
  indoor_temperature: "sensor.{p}_indoor_temperature",
  indoor_humidity: "sensor.{p}_indoor_humidity",
  co2: "sensor.{p}_co2",
  pm25: "sensor.{p}_pm25",
  aqi: "sensor.{p}_aqi",
  voc: "sensor.{p}_voc",
  noise: "sensor.{p}_noise",
  leaf_wetness: "sensor.{p}_leaf_wetness",
  ...soilMoisture,
  ...soilTemp,
  lightning_count: "sensor.{p}_lightning_num",
  lightning_distance: "sensor.{p}_lightning",
  lightning_time: "sensor.{p}_lightning_time",
  battery: "binary_sensor.{p}_battery"
};
const DEFAULT_SECTION_ORDER = [
  "conditions",
  "wind",
  "rain",
  "sun",
  "soil",
  "lightning",
  "air",
  "station",
  "health",
  "records",
  "comfort",
  "forecast",
  "battery"
];
const DEFAULT_COMFORT = {
  tempMin: 65,
  tempMax: 78,
  humidityMin: 30,
  humidityMax: 60
};
/* @__PURE__ */ new Set([
  "temperature",
  "feels_like",
  "humidity",
  "dew_point",
  "temp_high",
  "temp_low",
  "wind_speed",
  "wind_gust",
  "max_gust",
  "rain_rate",
  "rain_today",
  "rain_event",
  "rain_week",
  "rain_month",
  "rain_year",
  "uv",
  "irradiance",
  "illuminance",
  "pressure",
  "pressure_abs",
  "indoor_temperature",
  "indoor_humidity",
  "co2",
  "pm25",
  "aqi",
  "voc",
  "noise",
  "leaf_wetness",
  "lightning_count",
  "lightning_distance",
  "signal_strength",
  ...Array.from({ length: 8 }, (_, i) => `soil_moisture_${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) => `soil_temperature_${i + 1}`)
]);
const EDITOR_FIELDS = [
  { key: "temperature", label: "Temperature", domains: ["sensor"], classes: ["temperature"] },
  { key: "feels_like", label: "Feels like", domains: ["sensor"], classes: ["temperature"] },
  { key: "temp_high", label: "High today", domains: ["sensor"], classes: ["temperature"] },
  { key: "temp_low", label: "Low today", domains: ["sensor"], classes: ["temperature"] },
  { key: "humidity", label: "Humidity", domains: ["sensor"], classes: ["humidity"] },
  { key: "dew_point", label: "Dew point", domains: ["sensor"], classes: ["temperature"] },
  { key: "wind_speed", label: "Wind speed", domains: ["sensor"], classes: ["wind_speed"] },
  { key: "wind_gust", label: "Wind gust", domains: ["sensor"], classes: ["wind_speed"] },
  { key: "max_gust", label: "Max gust", domains: ["sensor"], classes: ["wind_speed"] },
  { key: "wind_direction", label: "Wind direction", domains: ["sensor"], classes: ["wind_direction"] },
  { key: "rain_rate", label: "Rain rate", domains: ["sensor"], classes: ["precipitation_intensity", "precipitation"] },
  { key: "rain_today", label: "Rain today", domains: ["sensor"], classes: ["precipitation"] },
  { key: "rain_event", label: "Rain event", domains: ["sensor"], classes: ["precipitation"] },
  { key: "rain_week", label: "Rain week", domains: ["sensor"], classes: ["precipitation"] },
  { key: "rain_month", label: "Rain month", domains: ["sensor"], classes: ["precipitation"] },
  { key: "rain_year", label: "Rain year", domains: ["sensor"], classes: ["precipitation"] },
  { key: "last_rain", label: "Last rain", domains: ["sensor"], classes: ["timestamp"] },
  { key: "uv", label: "UV index", domains: ["sensor"], classes: [] },
  { key: "irradiance", label: "Solar / irradiance", domains: ["sensor"], classes: ["irradiance"] },
  { key: "illuminance", label: "Illuminance", domains: ["sensor"], classes: ["illuminance"] },
  { key: "pressure", label: "Relative pressure", domains: ["sensor"], classes: ["pressure"] },
  { key: "pressure_abs", label: "Absolute pressure", domains: ["sensor"], classes: ["pressure"] },
  { key: "indoor_temperature", label: "Indoor temperature", domains: ["sensor"], classes: ["temperature"] },
  { key: "indoor_humidity", label: "Indoor humidity", domains: ["sensor"], classes: ["humidity"] },
  { key: "co2", label: "CO₂", domains: ["sensor"], classes: ["carbon_dioxide"] },
  { key: "pm25", label: "PM2.5", domains: ["sensor"], classes: ["pm25"] },
  { key: "aqi", label: "AQI", domains: ["sensor"], classes: ["aqi"] },
  { key: "voc", label: "VOC", domains: ["sensor"], classes: ["volatile_organic_compounds"] },
  { key: "noise", label: "Noise", domains: ["sensor"], classes: ["sound_pressure"] },
  { key: "leaf_wetness", label: "Leaf wetness", domains: ["sensor"], classes: ["moisture", "humidity"] },
  ...Array.from({ length: 8 }, (_, i) => ({
    key: `soil_moisture_${i + 1}`,
    label: `Soil moisture ${i + 1}`,
    domains: ["sensor"],
    classes: ["moisture", "humidity"]
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    key: `soil_temperature_${i + 1}`,
    label: `Soil temperature ${i + 1}`,
    domains: ["sensor"],
    classes: ["temperature"]
  })),
  { key: "lightning_count", label: "Lightning strikes", domains: ["sensor"], classes: [] },
  { key: "lightning_distance", label: "Lightning distance", domains: ["sensor"], classes: ["distance"] },
  { key: "lightning_time", label: "Last lightning", domains: ["sensor"], classes: ["timestamp"] },
  { key: "battery", label: "Battery", domains: ["sensor", "binary_sensor"], classes: ["battery"] },
  { key: "signal_strength", label: "Signal strength", domains: ["sensor"], classes: ["signal_strength"] }
];
function num(state) {
  if (state == null || state === "unknown" || state === "unavailable" || state === "") return null;
  const n = parseFloat(String(state));
  return Number.isFinite(n) ? n : null;
}
function applyPrefix(config, previousPrefix) {
  const prefix = (config.prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  const prev = (previousPrefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  const entities = { ...config.entities || {} };
  if (!prefix) {
    if (!prev) return { ...config };
    for (const [key, template] of Object.entries(PREFIX_MAP)) {
      if (entities[key] === template.replace("{p}", prev)) delete entities[key];
    }
    return { ...config, entities };
  }
  for (const [key, template] of Object.entries(PREFIX_MAP)) {
    const derived = template.replace("{p}", prefix);
    const current = entities[key];
    if (!current) {
      entities[key] = derived;
      continue;
    }
    if (prev) {
      const oldDerived = template.replace("{p}", prev);
      if (current === oldDerived) entities[key] = derived;
    }
  }
  return { ...config, entities };
}
function normalizeSectionOrder(order) {
  const known = new Set(DEFAULT_SECTION_ORDER);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  if (Array.isArray(order)) {
    for (const item of order) {
      if (typeof item === "string" && known.has(item) && !seen.has(item)) {
        out.push(item);
        seen.add(item);
      }
    }
  }
  for (const id of DEFAULT_SECTION_ORDER) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}
function moveSection(order, index, direction) {
  const next = [...order];
  const target = index + direction;
  if (index < 0 || target < 0 || index >= next.length || target >= next.length) return next;
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next;
}
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
function moveSectionTo(order, from, to) {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return [...order];
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}
function thresholdEditorUnit(kind, system) {
  if (system === "metric") return "°C";
  return "°F";
}
function displayThresholdValue(value, kind, system) {
  if (system !== "metric") return value;
  return (value - 32) * (5 / 9);
}
function storeThresholdValue(value, kind, system) {
  if (system !== "metric") return value;
  return value * (9 / 5) + 32;
}
function currentSeason(date = /* @__PURE__ */ new Date(), hemisphere = "north") {
  const m = date.getMonth();
  let season;
  if (m >= 2 && m <= 4) season = "spring";
  else if (m >= 5 && m <= 7) season = "summer";
  else if (m >= 8 && m <= 10) season = "autumn";
  else season = "winter";
  if (hemisphere === "south") {
    const flip = {
      spring: "autumn",
      summer: "winter",
      autumn: "spring",
      winter: "summer"
    };
    return flip[season];
  }
  return season;
}
const de = {
  "section.conditions": "Bedingungen",
  "section.wind": "Wind",
  "section.rain": "Regen",
  "section.sun": "Sonne & Mond",
  "section.soil": "Boden",
  "section.lightning": "Blitze",
  "section.air": "Luftqualität",
  "section.station": "Station",
  "section.health": "Stationszustand",
  "section.records": "Rekorde",
  "section.comfort": "Komfort",
  "section.forecast": "Vorhersage",
  "section.battery": "Batterie",
  "tile.temperature": "Außen",
  "tile.feels_like": "Gefühlt",
  "tile.temp_high": "Max",
  "tile.temp_low": "Min",
  "tile.humidity": "Luftfeuchte",
  "tile.dew_point": "Taupunkt",
  "tile.wind_speed": "Wind",
  "tile.wind_speed_bf": "Wind · B{n}",
  "tile.wind_gust": "Böe",
  "tile.max_gust": "Max. Böe",
  "tile.rain_rate": "Rate",
  "tile.rain_today": "Heute",
  "tile.rain_event": "Ereignis",
  "tile.rain_week": "Woche",
  "tile.rain_month": "Monat",
  "tile.rain_year": "Jahr",
  "tile.last_rain": "Letzter Regen",
  "tile.uv": "UV",
  "tile.irradiance": "Solar",
  "tile.illuminance": "Licht",
  "tile.sunrise": "Sonnenaufgang",
  "tile.sunset": "Sonnenuntergang",
  "tile.soil_moisture": "Boden {n}",
  "tile.soil_temperature": "Boden {n} °",
  "tile.leaf_wetness": "Blattnässe",
  "tile.lightning_count": "Einschläge",
  "tile.lightning_distance": "Entfernung",
  "tile.lightning_time": "Letzter Blitz",
  "tile.noise": "Lärm",
  "tile.pressure": "Luftdruck",
  "tile.pressure_trend": "Luftdruck · {trend}",
  "tile.pressure_abs": "Abs. Druck",
  "tile.indoor_temperature": "Innen",
  "tile.indoor_humidity": "Innen rF",
  "tile.signal_strength": "Signal",
  "derived.suffix": "{label} · ber.",
  "derived.title": "Berechnet aus Temperatur, Luftfeuchte und Wind",
  "uv.low": "Niedrig",
  "uv.moderate": "Mäßig",
  "uv.high": "Hoch",
  "uv.very_high": "Sehr hoch",
  "uv.extreme": "Extrem",
  "air.good": "Gut",
  "air.moderate": "Mäßig",
  "air.sensitive": "Empfindlich",
  "air.unhealthy": "Ungesund",
  "trend.rising": "Steigend",
  "trend.steady": "Stabil",
  "trend.falling": "Fallend",
  "moon.label": "Mond",
  "moon.new_moon": "Neumond",
  "moon.waxing_crescent": "Zunehmende Sichel",
  "moon.first_quarter": "Erstes Viertel",
  "moon.waxing_gibbous": "Zunehmender Mond",
  "moon.full_moon": "Vollmond",
  "moon.waning_gibbous": "Abnehmender Mond",
  "moon.last_quarter": "Letztes Viertel",
  "moon.waning_crescent": "Abnehmende Sichel",
  "battery.low": "Batterie schwach",
  "battery.low_pct": "Batterie schwach · {pct}",
  "battery.ok": "Stationsbatterie OK",
  "battery.pct": "Stationsbatterie {pct}",
  "header.live": "Live-Station",
  "header.raining": "Regen · {rate}",
  "header.hilo": "H {hi}° / T {lo}°",
  "header.feels": "Gefühlt {v}°",
  "header.rh": "{v}% rF",
  "status.stale": "Veraltet · {when}",
  "status.stale_title": "Daten sind möglicherweise veraltet",
  "status.updated_title": "Letzte Sensoraktualisierung",
  "hint.setup": "{prefix} setzen (z. B. {example}) oder Entitäten im Karteneditor wählen.",
  "chips.more": "Mehr",
  "chips.less": "Weniger",
  "chips.region": "Wetter-Überblick",
  "forecast.pick_entity": "Wetter-Entität für die Vorhersage wählen.",
  "forecast.missing": "Wetter-Entität {id} fehlt.",
  "forecast.waiting": "Warte auf Tagesvorhersage von {id}…",
  "forecast.waiting_hourly": "Warte auf stündliche Vorhersage von {id}…",
  "forecast.hourly_region": "Stündliche Vorhersage",
  "forecast.daily_region": "Tägliche Vorhersage",
  "forecast.item_aria": "{when}: {temp}, {pop} Niederschlagswahrscheinlichkeit",
  "rain.month_vs_normal": "Monat vs. Normal",
  "rain.pct_normal": "{pct}% vom Normal",
  "rain.days_since": "Tage seit Regen",
  "rain.since_one": "{n} Tag seit Regen",
  "rain.since_other": "{n} Tage seit Regen",
  "rain.spark_today": "H",
  "rain.spark_event": "E",
  "rain.spark_week": "W",
  "rain.spark_month": "M",
  "rain.spark_year": "J",
  "rain.spark_aria": "Regensummen: heute {today}, Ereignis {event}, Woche {week}, Monat {month}, Jahr {year}",
  "precip.title": "Niederschlagsverlauf",
  "precip.meta": "{hours} h · Spitze {peak}",
  "precip.aria": "Regenrate der letzten {hours} Stunden, Spitze {peak}",
  "wind.rose": "{hours}-h-Rose",
  "wind.compass_aria": "Wind aus {dir} bei {deg}°",
  "wind.compass_none": "Windrichtung nicht verfügbar",
  "wind.rose_aria": "Windrichtungsverteilung der letzten {hours} Stunden. Am häufigsten: {dir}",
  "records.month": "Monat",
  "records.year": "Jahr",
  "records.hottest": "Am heißesten · {period}",
  "records.coldest": "Am kältesten · {period}",
  "records.peak_gust": "Stärkste Böe · {period}",
  "records.peak_rate": "Max. Regenrate · {period}",
  "records.wettest": "Nassester Tag · {period}",
  "records.set_today": "Heute",
  "records.empty": "Rekorde benötigen Verlauf für Temperatur-, Böen- oder Regensensoren ({period}).",
  "records.title": "Extremwerte · {period}",
  "records.source_stats": "Langzeitstatistik",
  "records.source_history": "Nur jüngster Verlauf — state_class an den Sensoren ergänzen",
  "comfort.title": "Stunden im Komfortbereich",
  "comfort.meta": "{in} h von {total} h im Bereich · {band}",
  "comfort.empty": "Komfortzonen benötigen Temperatur- und Feuchteverlauf.",
  "comfort.cooler": "Kühler",
  "comfort.temp_axis": "Temp →",
  "comfort.warmer": "Wärmer",
  "comfort.aria": "{pct} der erfassten Zeit lag im Komfortbereich",
  "alerts.default": "Wetterwarnung",
  "alerts.region": "Wetterwarnungen",
  "health.all_online": "Alle {total} Sensoren online",
  "health.online": "{ok} von {total} Sensoren online",
  "health.battery_unknown": "unbekannt",
  "health.all_ok": "Alle {total} Sensoren melden",
  "health.reporting": "{ok} von {total} Sensoren melden",
  "health.offline": "Offline",
  "health.stale": "Still {when}",
  "health.batteries": "Batterien",
  "health.battery_low": "schwach",
  "health.battery_ok": "OK",
  "health.signal": "Signal",
  "graph.title": "Verlauf: {name}",
  "graph.range_24h": "24 h",
  "graph.range_7d": "7 T",
  "graph.range_30d": "30 T",
  "graph.range_label": "Zeitraum",
  "graph.loading": "Lädt…",
  "graph.empty": "Kein Verlauf für diesen Zeitraum.",
  "graph.min": "Min",
  "graph.max": "Max",
  "graph.avg": "Mittel",
  "graph.more_info": "Details",
  "graph.close": "Schließen",
  "graph.summary": "Minimum {min}, Maximum {max}, Mittel {avg}.",
  "graph.source_stats": "Stündliche Statistik (Min–Max-Band, Mittelwert)",
  "graph.source_history": "Aufgezeichnete Zustände",
  "editor.loading": "Home-Assistant-Auswahl wird geladen…",
  "editor.tab_layout": "Layout",
  "editor.tab_entities": "Entitäten",
  "editor.tab_order": "Reihenfolge",
  "editor.tab_display": "Anzeige",
  "editor.name": "Name",
  "editor.layout": "Layout",
  "editor.layout_full": "Volle Station",
  "editor.layout_compact": "Kompakt",
  "editor.layout_chips": "Chip-Leiste",
  "editor.prefix": "Entitätspräfix",
  "editor.unit_system": "Einheitensystem",
  "editor.unit_native": "Nativ (wie gemeldet)",
  "editor.unit_imperial": "Imperial (°F, mph, in)",
  "editor.unit_metric": "Metrisch (°C, km/h, mm)",
  "editor.language": "Sprache",
  "editor.language_auto": "Wie Home Assistant",
  "editor.forecast_days": "Vorhersagetage",
  "editor.hourly_hours": "Stunden (stündlich)",
  "editor.stale_minutes": "Veraltet nach (Minuten)",
  "editor.history_hours": "Verlaufsfenster (Stunden)",
  "editor.records_period": "Rekordzeitraum",
  "editor.records_month": "Monat (30 Tage)",
  "editor.records_year": "Jahr (365 Tage)",
  "editor.hemisphere": "Hemisphäre (Jahreszeiten-Skins)",
  "editor.hemisphere_north": "Nord",
  "editor.hemisphere_south": "Süd",
  "editor.rain_normal": "Normaler Monatsregen",
  "editor.weather_entity": "Wetter-Entität für Vorhersage",
  "editor.alert_entity": "Warn-Entität (optional)",
  "editor.sun_entity": "Sonnen-Entität",
  "editor.moon_entity": "Mond-Entität (optional)",
  "editor.sections": "Abschnitte",
  "editor.comfort_band": "Komfortbereich",
  "editor.order_reset": "Standardreihenfolge",
  "editor.custom_label": "Eigene Beschriftung",
  "editor.custom_unit": "Eigene Einheit",
  "editor.sw_tablet": "Tablet-Modus",
  "editor.sw_graph": "Diagramm-Popup",
  "editor.sw_derive": "Fehlende Werte berechnen",
  "editor.sw_daily": "Tagesvorhersage",
  "editor.sw_hourly": "Stündliche Vorhersage",
  "editor.sw_sparks": "Verlaufs-Sparklines",
  "editor.sw_rose": "Windrose",
  "editor.sw_alerts": "Wetterwarnungen",
  "editor.sw_precip": "Niederschlagsverlauf",
  "editor.sw_records": "Rekorde",
  "editor.sw_comfort": "Komfortzonen",
  "editor.sw_skins": "Jahreszeiten-Skins",
  "editor.sw_updated": "Letzte Aktualisierung",
  "editor.sw_beaufort": "Beaufort-Skala"
};
const en = {
  // Sections
  "section.conditions": "Conditions",
  "section.wind": "Wind",
  "section.rain": "Rain",
  "section.sun": "Sun & moon",
  "section.soil": "Soil",
  "section.lightning": "Lightning",
  "section.air": "Air quality",
  "section.station": "Station",
  "section.health": "Station health",
  "section.records": "Record book",
  "section.comfort": "Comfort",
  "section.forecast": "Forecast",
  "section.battery": "Battery",
  // Tiles
  "tile.temperature": "Outdoor",
  "tile.feels_like": "Feels like",
  "tile.temp_high": "High",
  "tile.temp_low": "Low",
  "tile.humidity": "Humidity",
  "tile.dew_point": "Dew point",
  "tile.wind_speed": "Speed",
  "tile.wind_speed_bf": "Speed · B{n}",
  "tile.wind_gust": "Gust",
  "tile.max_gust": "Max gust",
  "tile.rain_rate": "Rate",
  "tile.rain_today": "Today",
  "tile.rain_event": "Event",
  "tile.rain_week": "Week",
  "tile.rain_month": "Month",
  "tile.rain_year": "Year",
  "tile.last_rain": "Last rain",
  "tile.uv": "UV",
  "tile.irradiance": "Solar",
  "tile.illuminance": "Light",
  "tile.sunrise": "Sunrise",
  "tile.sunset": "Sunset",
  "tile.soil_moisture": "Soil {n}",
  "tile.soil_temperature": "Soil {n} °",
  "tile.leaf_wetness": "Leaf wet",
  "tile.lightning_count": "Strikes",
  "tile.lightning_distance": "Distance",
  "tile.lightning_time": "Last strike",
  "tile.pm25": "PM2.5",
  "tile.aqi": "AQI",
  "tile.voc": "VOC",
  "tile.noise": "Noise",
  "tile.pressure": "Pressure",
  "tile.pressure_trend": "Pressure · {trend}",
  "tile.pressure_abs": "Abs pressure",
  "tile.indoor_temperature": "Indoor",
  "tile.indoor_humidity": "Indoor RH",
  "tile.co2": "CO₂",
  "tile.signal_strength": "Signal",
  "derived.suffix": "{label} · calc",
  "derived.title": "Calculated from temperature, humidity and wind",
  // Meta labels
  "uv.low": "Low",
  "uv.moderate": "Moderate",
  "uv.high": "High",
  "uv.very_high": "Very high",
  "uv.extreme": "Extreme",
  "air.good": "Good",
  "air.moderate": "Moderate",
  "air.sensitive": "Sensitive",
  "air.unhealthy": "Unhealthy",
  "trend.rising": "Rising",
  "trend.steady": "Steady",
  "trend.falling": "Falling",
  "moon.label": "Moon",
  "moon.new_moon": "New moon",
  "moon.waxing_crescent": "Waxing crescent",
  "moon.first_quarter": "First quarter",
  "moon.waxing_gibbous": "Waxing gibbous",
  "moon.full_moon": "Full moon",
  "moon.waning_gibbous": "Waning gibbous",
  "moon.last_quarter": "Last quarter",
  "moon.waning_crescent": "Waning crescent",
  "battery.low": "Low battery",
  "battery.low_pct": "Low battery · {pct}",
  "battery.ok": "Station battery OK",
  "battery.pct": "Station battery {pct}",
  // Header / status
  "header.live": "Live station",
  "header.raining": "Raining · {rate}",
  "header.hilo": "H {hi}° / L {lo}°",
  "header.feels": "Feels {v}°",
  "header.rh": "{v}% RH",
  "status.stale": "Stale · {when}",
  "status.stale_title": "Data may be stale",
  "status.updated_title": "Last sensor update",
  "hint.setup": "Set {prefix} (e.g. {example}) or pick entities in the card editor.",
  "chips.more": "More",
  "chips.less": "Less",
  "chips.region": "Weather glance",
  // Forecast
  "forecast.pick_entity": "Pick a weather entity for forecast.",
  "forecast.missing": "Weather entity {id} is missing.",
  "forecast.waiting": "Waiting for daily forecast from {id}…",
  "forecast.waiting_hourly": "Waiting for hourly forecast from {id}…",
  "forecast.hourly_region": "Hourly forecast",
  "forecast.daily_region": "Daily forecast",
  "forecast.item_aria": "{when}: {temp}, {pop} chance of precipitation",
  // Rain
  "rain.month_vs_normal": "Month vs normal",
  "rain.pct_normal": "{pct}% of normal",
  "rain.days_since": "Days since rain",
  "rain.since_one": "{n} day since rain",
  "rain.since_other": "{n} days since rain",
  "rain.spark_today": "T",
  "rain.spark_event": "E",
  "rain.spark_week": "W",
  "rain.spark_month": "M",
  "rain.spark_year": "Y",
  "rain.spark_aria": "Rain totals: today {today}, event {event}, week {week}, month {month}, year {year}",
  "precip.title": "Precipitation timeline",
  "precip.meta": "{hours}h · peak {peak}",
  "precip.aria": "Rain rate over the last {hours} hours, peak {peak}",
  // Wind
  "wind.rose": "{hours}h rose",
  "wind.compass_aria": "Wind from {dir} at {deg}°",
  "wind.compass_none": "Wind direction unavailable",
  "wind.rose_aria": "Wind direction distribution over the last {hours} hours. Most common: {dir}",
  // Records
  "records.month": "Month",
  "records.year": "Year",
  "records.hottest": "Hottest · {period}",
  "records.coldest": "Coldest · {period}",
  "records.peak_gust": "Peak gust · {period}",
  "records.peak_rate": "Peak rain rate · {period}",
  "records.wettest": "Wettest day · {period}",
  "records.set_today": "Set today",
  "records.empty": "Record book needs history for temperature, gust, or rain sensors ({period} window).",
  "records.title": "{period} extremes",
  "records.source_stats": "Long-term statistics",
  "records.source_history": "Recent history only — add state_class to sensors for full records",
  // Comfort
  "comfort.title": "Hours in comfort",
  "comfort.meta": "{in}h of {total}h in band · {band}",
  "comfort.empty": "Comfort zones need temperature and humidity history.",
  "comfort.cooler": "Cooler",
  "comfort.temp_axis": "Temp →",
  "comfort.warmer": "Warmer",
  "comfort.aria": "{pct} of the tracked time was inside the comfort band",
  // Alerts
  "alerts.default": "Weather alert",
  "alerts.region": "Weather alerts",
  // Station health
  "health.all_online": "All {total} sensors online",
  "health.online": "{ok} of {total} sensors online",
  "health.battery_unknown": "unknown",
  "health.all_ok": "All {total} sensors reporting",
  "health.reporting": "{ok} of {total} sensors reporting",
  "health.offline": "Offline",
  "health.stale": "Quiet {when}",
  "health.batteries": "Batteries",
  "health.battery_low": "low",
  "health.battery_ok": "OK",
  "health.signal": "Signal",
  // Graph popup
  "graph.title": "{name} history",
  "graph.range_24h": "24h",
  "graph.range_7d": "7d",
  "graph.range_30d": "30d",
  "graph.range_label": "History range",
  "graph.loading": "Loading…",
  "graph.empty": "No history available for this range.",
  "graph.min": "Min",
  "graph.max": "Max",
  "graph.avg": "Avg",
  "graph.more_info": "More info",
  "graph.close": "Close",
  "graph.summary": "Minimum {min}, maximum {max}, average {avg}.",
  "graph.source_stats": "Hourly statistics (min–max band, mean line)",
  "graph.source_history": "Recorded states",
  // Editor
  "editor.loading": "Loading Home Assistant pickers…",
  "editor.tab_layout": "Layout",
  "editor.tab_entities": "Entities",
  "editor.tab_order": "Order",
  "editor.tab_display": "Display",
  "editor.name": "Name",
  "editor.layout": "Layout",
  "editor.layout_full": "Full station",
  "editor.layout_compact": "Compact",
  "editor.layout_chips": "Chips glance bar",
  "editor.layout_full_help": "Hero, every section, forecast",
  "editor.layout_compact_help": "Denser tiles, no section titles",
  "editor.layout_chips_help": "One-line glance, tap to expand",
  "editor.prefix": "Entity prefix",
  "editor.unit_system": "Unit system",
  "editor.unit_native": "Native (as reported)",
  "editor.unit_imperial": "Imperial (°F, mph, in)",
  "editor.unit_metric": "Metric (°C, km/h, mm)",
  "editor.language": "Language",
  "editor.language_auto": "Follow Home Assistant",
  "editor.forecast_days": "Forecast days",
  "editor.hourly_hours": "Hourly hours",
  "editor.stale_minutes": "Stale after (minutes)",
  "editor.history_hours": "History window (hours)",
  "editor.records_period": "Record book period",
  "editor.records_month": "Month (30 days)",
  "editor.records_year": "Year (365 days)",
  "editor.records_preview": "Covers {start} – {end}. Uses long-term statistics, so it is not limited by recorder purge_keep_days.",
  "editor.hemisphere": "Hemisphere (seasonal skins)",
  "editor.hemisphere_north": "Northern",
  "editor.hemisphere_south": "Southern",
  "editor.skin_preview": "Today the card uses the {season} skin.",
  "editor.skin_off": "Seasonal skins are off.",
  "editor.season_spring": "spring",
  "editor.season_summer": "summer",
  "editor.season_autumn": "autumn",
  "editor.season_winter": "winter",
  "editor.rain_normal": "Rain month normal",
  "editor.weather_entity": "Forecast weather entity",
  "editor.alert_entity": "Alert entity (optional)",
  "editor.sun_entity": "Sun entity",
  "editor.moon_entity": "Moon entity (optional)",
  "editor.sections": "Sections",
  "editor.sections_help": "Off = show the section when it has data. On = hide it even if sensors exist.",
  "editor.battery_threshold": "Battery warning threshold",
  "editor.uv_purple": "UV purple at / above",
  "editor.temp_blue": "Temperature blue at / below ({unit})",
  "editor.comfort_band": "Comfort band",
  "editor.comfort_help": "Outdoor comfort hours use this temp×humidity window. Temperatures follow the selected unit system; humidity is %RH.",
  "editor.comfort_temp_min": "Comfort temp min ({unit})",
  "editor.comfort_temp_max": "Comfort temp max ({unit})",
  "editor.comfort_hum_min": "Comfort humidity min (%)",
  "editor.comfort_hum_max": "Comfort humidity max (%)",
  "editor.comfort_preview_aria": "Comfort band preview: {band}",
  "editor.thresholds_help": "Threshold cutoffs follow the selected unit system ({system}). Stored rules stay compatible with imperial defaults. Per-slot labels and units are under Entities.",
  "editor.order_help": "Drag sections to reorder, or use ↑ / ↓. Hidden sections stay listed but do not render.",
  "editor.order_reset": "Reset to default order",
  "editor.move_up": "Move {name} up",
  "editor.move_down": "Move {name} down",
  "editor.entities_help": "Prefix auto-fills empty slots. Pickers override one sensor at a time.",
  "editor.picker_missing": "Entity picker did not load. Reload Lovelace resources.",
  "editor.custom_label": "Custom label",
  "editor.custom_unit": "Custom unit",
  "editor.battery_entities": "Extra battery entities (comma separated)",
  "editor.battery_entities_help": "Leave empty to auto-detect battery sensors that share the prefix.",
  "editor.sw_tablet": "Tablet mode",
  "editor.sw_tablet_help": "Tap does nothing. Hold a tile for more-info.",
  "editor.sw_graph": "Graph popup",
  "editor.sw_graph_help": "Tap a sensor tile for a 24h / 7d / 30d history chart.",
  "editor.sw_derive": "Calculate missing values",
  "editor.sw_derive_help": "Feels-like and dew point from temperature, humidity and wind when the station has no sensor.",
  "editor.sw_empty": "Show empty tiles",
  "editor.sw_empty_help": "Keep tiles visible when the entity is missing.",
  "editor.sw_daily": "Show daily forecast",
  "editor.sw_daily_help": "Needs a weather entity below.",
  "editor.sw_hourly": "Show hourly forecast",
  "editor.sw_hourly_help": "12–24h strip with precip % and temp.",
  "editor.sw_sparks": "History sparklines",
  "editor.sw_sparks_help": "Mini charts on temp, humidity, wind, pressure.",
  "editor.sw_rose": "Wind rose",
  "editor.sw_rose_help": "Direction distribution from history.",
  "editor.sw_alerts": "Weather alerts banner",
  "editor.sw_alerts_help": "From weather attributes or alert entity.",
  "editor.sw_precip": "Precipitation timeline",
  "editor.sw_precip_help": "Hourly rain-rate intensity bars in the rain section.",
  "editor.sw_records": "Record book",
  "editor.sw_records_help": "Month/year extremes from long-term statistics.",
  "editor.sw_comfort": "Comfort zones",
  "editor.sw_comfort_help": "Hours in temp×humidity comfort band + scatter.",
  "editor.sw_skins": "Seasonal skins",
  "editor.sw_skins_help": "Accent the card by season and weather condition.",
  "editor.sw_updated": "Show last updated",
  "editor.sw_updated_help": "Status chip with relative update time.",
  "editor.sw_beaufort": "Show Beaufort scale",
  "editor.sw_beaufort_help": "Add Beaufort number on the wind speed tile.",
  "editor.hide_conditions": "Hide conditions",
  "editor.hide_conditions_help": "Outdoor, feels like, high / low, humidity, dew point",
  "editor.hide_wind": "Hide wind",
  "editor.hide_wind_help": "Compass, rose, speed, gust, max gust",
  "editor.hide_rain": "Hide rain",
  "editor.hide_rain_help": "Goals, timeline, sparkline, and rain totals",
  "editor.hide_sun": "Hide sun & moon",
  "editor.hide_sun_help": "UV, solar, light, sunrise/sunset, moon",
  "editor.hide_soil": "Hide soil",
  "editor.hide_soil_help": "Moisture/temp channels 1–8 and leaf wetness",
  "editor.hide_lightning": "Hide lightning",
  "editor.hide_lightning_help": "Strike count, distance, last strike",
  "editor.hide_air": "Hide air quality",
  "editor.hide_air_help": "PM2.5, AQI, VOC, noise",
  "editor.hide_more": "Hide station extras",
  "editor.hide_more_help": "Pressure, indoor, CO₂",
  "editor.hide_health": "Hide station health",
  "editor.hide_health_help": "Offline sensors, battery list, signal",
  "editor.hide_records": "Hide record book",
  "editor.hide_records_help": "Month/year extremes grid",
  "editor.hide_comfort": "Hide comfort zones",
  "editor.hide_comfort_help": "Comfort hours and scatter",
  "editor.hide_battery": "Hide battery",
  "editor.hide_battery_help": "Status line at the bottom"
};
const es = {
  "section.conditions": "Condiciones",
  "section.wind": "Viento",
  "section.rain": "Lluvia",
  "section.sun": "Sol y luna",
  "section.soil": "Suelo",
  "section.lightning": "Rayos",
  "section.air": "Calidad del aire",
  "section.station": "Estación",
  "section.health": "Estado de la estación",
  "section.records": "Récords",
  "section.comfort": "Confort",
  "section.forecast": "Pronóstico",
  "section.battery": "Batería",
  "tile.temperature": "Exterior",
  "tile.feels_like": "Sensación",
  "tile.temp_high": "Máx",
  "tile.temp_low": "Mín",
  "tile.humidity": "Humedad",
  "tile.dew_point": "Punto de rocío",
  "tile.wind_speed": "Velocidad",
  "tile.wind_speed_bf": "Velocidad · B{n}",
  "tile.wind_gust": "Ráfaga",
  "tile.max_gust": "Ráfaga máx",
  "tile.rain_rate": "Intensidad",
  "tile.rain_today": "Hoy",
  "tile.rain_event": "Evento",
  "tile.rain_week": "Semana",
  "tile.rain_month": "Mes",
  "tile.rain_year": "Año",
  "tile.last_rain": "Última lluvia",
  "tile.uv": "UV",
  "tile.irradiance": "Solar",
  "tile.illuminance": "Luz",
  "tile.sunrise": "Amanecer",
  "tile.sunset": "Atardecer",
  "tile.soil_moisture": "Suelo {n}",
  "tile.soil_temperature": "Suelo {n} °",
  "tile.leaf_wetness": "Humedad hoja",
  "tile.lightning_count": "Rayos",
  "tile.lightning_distance": "Distancia",
  "tile.lightning_time": "Último rayo",
  "tile.voc": "COV",
  "tile.noise": "Ruido",
  "tile.pressure": "Presión",
  "tile.pressure_trend": "Presión · {trend}",
  "tile.pressure_abs": "Presión abs.",
  "tile.indoor_temperature": "Interior",
  "tile.indoor_humidity": "HR interior",
  "tile.signal_strength": "Señal",
  "derived.suffix": "{label} · calc.",
  "derived.title": "Calculado a partir de temperatura, humedad y viento",
  "uv.low": "Bajo",
  "uv.moderate": "Moderado",
  "uv.high": "Alto",
  "uv.very_high": "Muy alto",
  "uv.extreme": "Extremo",
  "air.good": "Buena",
  "air.moderate": "Moderada",
  "air.sensitive": "Sensibles",
  "air.unhealthy": "Mala",
  "trend.rising": "Subiendo",
  "trend.steady": "Estable",
  "trend.falling": "Bajando",
  "moon.label": "Luna",
  "moon.new_moon": "Luna nueva",
  "moon.waxing_crescent": "Creciente",
  "moon.first_quarter": "Cuarto creciente",
  "moon.waxing_gibbous": "Gibosa creciente",
  "moon.full_moon": "Luna llena",
  "moon.waning_gibbous": "Gibosa menguante",
  "moon.last_quarter": "Cuarto menguante",
  "moon.waning_crescent": "Menguante",
  "battery.low": "Batería baja",
  "battery.low_pct": "Batería baja · {pct}",
  "battery.ok": "Batería de la estación OK",
  "battery.pct": "Batería de la estación {pct}",
  "header.live": "Estación en vivo",
  "header.raining": "Lloviendo · {rate}",
  "header.hilo": "Máx {hi}° / Mín {lo}°",
  "header.feels": "Sensación {v}°",
  "header.rh": "{v}% HR",
  "status.stale": "Antiguo · {when}",
  "status.stale_title": "Los datos pueden estar desactualizados",
  "status.updated_title": "Última actualización",
  "hint.setup": "Define {prefix} (p. ej. {example}) o elige entidades en el editor.",
  "chips.more": "Más",
  "chips.less": "Menos",
  "chips.region": "Resumen del tiempo",
  "forecast.pick_entity": "Elige una entidad meteorológica para el pronóstico.",
  "forecast.missing": "Falta la entidad meteorológica {id}.",
  "forecast.waiting": "Esperando el pronóstico diario de {id}…",
  "forecast.waiting_hourly": "Esperando el pronóstico por horas de {id}…",
  "forecast.hourly_region": "Pronóstico por horas",
  "forecast.daily_region": "Pronóstico diario",
  "forecast.item_aria": "{when}: {temp}, {pop} de probabilidad de precipitación",
  "rain.month_vs_normal": "Mes vs normal",
  "rain.pct_normal": "{pct}% de lo normal",
  "rain.days_since": "Días sin lluvia",
  "rain.since_one": "{n} día sin lluvia",
  "rain.since_other": "{n} días sin lluvia",
  "rain.spark_today": "H",
  "rain.spark_event": "E",
  "rain.spark_week": "S",
  "rain.spark_month": "M",
  "rain.spark_year": "A",
  "rain.spark_aria": "Acumulados: hoy {today}, evento {event}, semana {week}, mes {month}, año {year}",
  "precip.title": "Cronología de precipitación",
  "precip.meta": "{hours} h · pico {peak}",
  "precip.aria": "Intensidad de lluvia en las últimas {hours} horas, pico {peak}",
  "wind.rose": "Rosa {hours} h",
  "wind.compass_aria": "Viento del {dir} a {deg}°",
  "wind.compass_none": "Dirección del viento no disponible",
  "wind.rose_aria": "Distribución de direcciones en las últimas {hours} horas. Más frecuente: {dir}",
  "records.month": "Mes",
  "records.year": "Año",
  "records.hottest": "Más calor · {period}",
  "records.coldest": "Más frío · {period}",
  "records.peak_gust": "Ráfaga máx · {period}",
  "records.peak_rate": "Intensidad máx · {period}",
  "records.wettest": "Día más lluvioso · {period}",
  "records.set_today": "Hoy",
  "records.empty": "Los récords necesitan historial de temperatura, ráfagas o lluvia ({period}).",
  "records.title": "Extremos · {period}",
  "records.source_stats": "Estadísticas a largo plazo",
  "records.source_history": "Solo historial reciente — añade state_class a los sensores",
  "comfort.title": "Horas de confort",
  "comfort.meta": "{in} h de {total} h en la zona · {band}",
  "comfort.empty": "Las zonas de confort necesitan historial de temperatura y humedad.",
  "comfort.cooler": "Más fresco",
  "comfort.temp_axis": "Temp →",
  "comfort.warmer": "Más cálido",
  "comfort.aria": "{pct} del tiempo registrado estuvo en la zona de confort",
  "alerts.default": "Aviso meteorológico",
  "alerts.region": "Avisos meteorológicos",
  "health.all_online": "Los {total} sensores en línea",
  "health.online": "{ok} de {total} sensores en línea",
  "health.battery_unknown": "desconocido",
  "health.all_ok": "Los {total} sensores informan",
  "health.reporting": "{ok} de {total} sensores informan",
  "health.offline": "Sin conexión",
  "health.stale": "Sin datos {when}",
  "health.batteries": "Baterías",
  "health.battery_low": "baja",
  "health.battery_ok": "OK",
  "health.signal": "Señal",
  "graph.title": "Historial: {name}",
  "graph.range_24h": "24 h",
  "graph.range_7d": "7 d",
  "graph.range_30d": "30 d",
  "graph.range_label": "Periodo",
  "graph.loading": "Cargando…",
  "graph.empty": "No hay historial para este periodo.",
  "graph.min": "Mín",
  "graph.max": "Máx",
  "graph.avg": "Media",
  "graph.more_info": "Detalles",
  "graph.close": "Cerrar",
  "graph.summary": "Mínimo {min}, máximo {max}, media {avg}.",
  "graph.source_stats": "Estadísticas horarias (banda mín–máx, media)",
  "graph.source_history": "Estados registrados",
  "editor.loading": "Cargando selectores de Home Assistant…",
  "editor.tab_layout": "Diseño",
  "editor.tab_entities": "Entidades",
  "editor.tab_order": "Orden",
  "editor.tab_display": "Visualización",
  "editor.name": "Nombre",
  "editor.layout": "Diseño",
  "editor.layout_full": "Estación completa",
  "editor.layout_compact": "Compacto",
  "editor.layout_chips": "Barra de chips",
  "editor.prefix": "Prefijo de entidad",
  "editor.unit_system": "Sistema de unidades",
  "editor.unit_native": "Nativo (como llega)",
  "editor.unit_imperial": "Imperial (°F, mph, in)",
  "editor.unit_metric": "Métrico (°C, km/h, mm)",
  "editor.language": "Idioma",
  "editor.language_auto": "Igual que Home Assistant",
  "editor.forecast_days": "Días de pronóstico",
  "editor.hourly_hours": "Horas (por horas)",
  "editor.stale_minutes": "Antiguo tras (minutos)",
  "editor.history_hours": "Ventana de historial (horas)",
  "editor.records_period": "Periodo de récords",
  "editor.records_month": "Mes (30 días)",
  "editor.records_year": "Año (365 días)",
  "editor.hemisphere": "Hemisferio (temas de estación)",
  "editor.hemisphere_north": "Norte",
  "editor.hemisphere_south": "Sur",
  "editor.rain_normal": "Lluvia mensual normal",
  "editor.weather_entity": "Entidad meteorológica",
  "editor.alert_entity": "Entidad de avisos (opcional)",
  "editor.sun_entity": "Entidad del sol",
  "editor.moon_entity": "Entidad de la luna (opcional)",
  "editor.sections": "Secciones",
  "editor.comfort_band": "Zona de confort",
  "editor.order_reset": "Orden predeterminado",
  "editor.custom_label": "Etiqueta propia",
  "editor.custom_unit": "Unidad propia",
  "editor.sw_tablet": "Modo tableta",
  "editor.sw_graph": "Gráfico emergente",
  "editor.sw_derive": "Calcular valores que faltan",
  "editor.sw_daily": "Pronóstico diario",
  "editor.sw_hourly": "Pronóstico por horas",
  "editor.sw_sparks": "Minigráficos",
  "editor.sw_rose": "Rosa de los vientos",
  "editor.sw_alerts": "Avisos meteorológicos",
  "editor.sw_precip": "Cronología de precipitación",
  "editor.sw_records": "Récords",
  "editor.sw_comfort": "Zonas de confort",
  "editor.sw_skins": "Temas de estación",
  "editor.sw_updated": "Última actualización",
  "editor.sw_beaufort": "Escala de Beaufort"
};
const fr = {
  "section.conditions": "Conditions",
  "section.wind": "Vent",
  "section.rain": "Pluie",
  "section.sun": "Soleil & lune",
  "section.soil": "Sol",
  "section.lightning": "Foudre",
  "section.air": "Qualité de l’air",
  "section.station": "Station",
  "section.health": "État de la station",
  "section.records": "Records",
  "section.comfort": "Confort",
  "section.forecast": "Prévisions",
  "section.battery": "Batterie",
  "tile.temperature": "Extérieur",
  "tile.feels_like": "Ressenti",
  "tile.temp_high": "Max",
  "tile.temp_low": "Min",
  "tile.humidity": "Humidité",
  "tile.dew_point": "Point de rosée",
  "tile.wind_speed": "Vitesse",
  "tile.wind_speed_bf": "Vitesse · B{n}",
  "tile.wind_gust": "Rafale",
  "tile.max_gust": "Rafale max",
  "tile.rain_rate": "Intensité",
  "tile.rain_today": "Aujourd’hui",
  "tile.rain_event": "Épisode",
  "tile.rain_week": "Semaine",
  "tile.rain_month": "Mois",
  "tile.rain_year": "Année",
  "tile.last_rain": "Dernière pluie",
  "tile.uv": "UV",
  "tile.irradiance": "Solaire",
  "tile.illuminance": "Lumière",
  "tile.sunrise": "Lever",
  "tile.sunset": "Coucher",
  "tile.soil_moisture": "Sol {n}",
  "tile.soil_temperature": "Sol {n} °",
  "tile.leaf_wetness": "Humect. feuille",
  "tile.lightning_count": "Impacts",
  "tile.lightning_distance": "Distance",
  "tile.lightning_time": "Dernier impact",
  "tile.voc": "COV",
  "tile.noise": "Bruit",
  "tile.pressure": "Pression",
  "tile.pressure_trend": "Pression · {trend}",
  "tile.pressure_abs": "Pression abs.",
  "tile.indoor_temperature": "Intérieur",
  "tile.indoor_humidity": "HR intérieure",
  "tile.signal_strength": "Signal",
  "derived.suffix": "{label} · calc.",
  "derived.title": "Calculé à partir de la température, de l’humidité et du vent",
  "uv.low": "Faible",
  "uv.moderate": "Modéré",
  "uv.high": "Élevé",
  "uv.very_high": "Très élevé",
  "uv.extreme": "Extrême",
  "air.good": "Bon",
  "air.moderate": "Moyen",
  "air.sensitive": "Sensibles",
  "air.unhealthy": "Mauvais",
  "trend.rising": "En hausse",
  "trend.steady": "Stable",
  "trend.falling": "En baisse",
  "moon.label": "Lune",
  "moon.new_moon": "Nouvelle lune",
  "moon.waxing_crescent": "Premier croissant",
  "moon.first_quarter": "Premier quartier",
  "moon.waxing_gibbous": "Gibbeuse croissante",
  "moon.full_moon": "Pleine lune",
  "moon.waning_gibbous": "Gibbeuse décroissante",
  "moon.last_quarter": "Dernier quartier",
  "moon.waning_crescent": "Dernier croissant",
  "battery.low": "Batterie faible",
  "battery.low_pct": "Batterie faible · {pct}",
  "battery.ok": "Batterie station OK",
  "battery.pct": "Batterie station {pct}",
  "header.live": "Station en direct",
  "header.raining": "Pluie · {rate}",
  "header.hilo": "Max {hi}° / Min {lo}°",
  "header.feels": "Ressenti {v}°",
  "header.rh": "{v}% HR",
  "status.stale": "Ancien · {when}",
  "status.stale_title": "Les données peuvent être anciennes",
  "status.updated_title": "Dernière mise à jour",
  "hint.setup": "Définissez {prefix} (ex. {example}) ou choisissez les entités dans l’éditeur.",
  "chips.more": "Plus",
  "chips.less": "Moins",
  "chips.region": "Aperçu météo",
  "forecast.pick_entity": "Choisissez une entité météo pour les prévisions.",
  "forecast.missing": "L’entité météo {id} est introuvable.",
  "forecast.waiting": "En attente des prévisions de {id}…",
  "forecast.waiting_hourly": "En attente des prévisions horaires de {id}…",
  "forecast.hourly_region": "Prévisions horaires",
  "forecast.daily_region": "Prévisions quotidiennes",
  "forecast.item_aria": "{when} : {temp}, {pop} de risque de précipitations",
  "rain.month_vs_normal": "Mois vs normale",
  "rain.pct_normal": "{pct}% de la normale",
  "rain.days_since": "Jours sans pluie",
  "rain.since_one": "{n} jour sans pluie",
  "rain.since_other": "{n} jours sans pluie",
  "rain.spark_today": "J",
  "rain.spark_event": "É",
  "rain.spark_week": "S",
  "rain.spark_month": "M",
  "rain.spark_year": "A",
  "rain.spark_aria": "Cumuls : aujourd’hui {today}, épisode {event}, semaine {week}, mois {month}, année {year}",
  "precip.title": "Chronologie des précipitations",
  "precip.meta": "{hours} h · pic {peak}",
  "precip.aria": "Intensité de pluie sur les {hours} dernières heures, pic {peak}",
  "wind.rose": "Rose {hours} h",
  "wind.compass_aria": "Vent de {dir} à {deg}°",
  "wind.compass_none": "Direction du vent indisponible",
  "wind.rose_aria": "Répartition des directions sur les {hours} dernières heures. La plus fréquente : {dir}",
  "records.month": "Mois",
  "records.year": "Année",
  "records.hottest": "Plus chaud · {period}",
  "records.coldest": "Plus froid · {period}",
  "records.peak_gust": "Rafale max · {period}",
  "records.peak_rate": "Intensité max · {period}",
  "records.wettest": "Jour le plus humide · {period}",
  "records.set_today": "Aujourd’hui",
  "records.empty": "Les records nécessitent l’historique des capteurs de température, rafale ou pluie ({period}).",
  "records.title": "Extrêmes · {period}",
  "records.source_stats": "Statistiques long terme",
  "records.source_history": "Historique récent seulement — ajoutez state_class aux capteurs",
  "comfort.title": "Heures de confort",
  "comfort.meta": "{in} h sur {total} h dans la zone · {band}",
  "comfort.empty": "Les zones de confort nécessitent l’historique de température et d’humidité.",
  "comfort.cooler": "Plus frais",
  "comfort.temp_axis": "Temp →",
  "comfort.warmer": "Plus chaud",
  "comfort.aria": "{pct} du temps suivi était dans la zone de confort",
  "alerts.default": "Alerte météo",
  "alerts.region": "Alertes météo",
  "health.all_online": "Les {total} capteurs sont en ligne",
  "health.online": "{ok} capteurs sur {total} en ligne",
  "health.battery_unknown": "inconnu",
  "health.all_ok": "Les {total} capteurs répondent",
  "health.reporting": "{ok} capteurs sur {total} répondent",
  "health.offline": "Hors ligne",
  "health.stale": "Silencieux {when}",
  "health.batteries": "Batteries",
  "health.battery_low": "faible",
  "health.battery_ok": "OK",
  "health.signal": "Signal",
  "graph.title": "Historique : {name}",
  "graph.range_24h": "24 h",
  "graph.range_7d": "7 j",
  "graph.range_30d": "30 j",
  "graph.range_label": "Période",
  "graph.loading": "Chargement…",
  "graph.empty": "Aucun historique pour cette période.",
  "graph.min": "Min",
  "graph.max": "Max",
  "graph.avg": "Moy.",
  "graph.more_info": "Détails",
  "graph.close": "Fermer",
  "graph.summary": "Minimum {min}, maximum {max}, moyenne {avg}.",
  "graph.source_stats": "Statistiques horaires (bande min–max, moyenne)",
  "graph.source_history": "États enregistrés",
  "editor.loading": "Chargement des sélecteurs Home Assistant…",
  "editor.tab_layout": "Disposition",
  "editor.tab_entities": "Entités",
  "editor.tab_order": "Ordre",
  "editor.tab_display": "Affichage",
  "editor.name": "Nom",
  "editor.layout": "Disposition",
  "editor.layout_full": "Station complète",
  "editor.layout_compact": "Compacte",
  "editor.layout_chips": "Barre de puces",
  "editor.prefix": "Préfixe d’entité",
  "editor.unit_system": "Système d’unités",
  "editor.unit_native": "Natif (tel que reçu)",
  "editor.unit_imperial": "Impérial (°F, mph, in)",
  "editor.unit_metric": "Métrique (°C, km/h, mm)",
  "editor.language": "Langue",
  "editor.language_auto": "Comme Home Assistant",
  "editor.forecast_days": "Jours de prévision",
  "editor.hourly_hours": "Heures (horaire)",
  "editor.stale_minutes": "Ancien après (minutes)",
  "editor.history_hours": "Fenêtre d’historique (heures)",
  "editor.records_period": "Période des records",
  "editor.records_month": "Mois (30 jours)",
  "editor.records_year": "Année (365 jours)",
  "editor.hemisphere": "Hémisphère (thèmes saisonniers)",
  "editor.hemisphere_north": "Nord",
  "editor.hemisphere_south": "Sud",
  "editor.rain_normal": "Normale mensuelle de pluie",
  "editor.weather_entity": "Entité météo des prévisions",
  "editor.alert_entity": "Entité d’alerte (optionnelle)",
  "editor.sun_entity": "Entité soleil",
  "editor.moon_entity": "Entité lune (optionnelle)",
  "editor.sections": "Sections",
  "editor.comfort_band": "Zone de confort",
  "editor.order_reset": "Ordre par défaut",
  "editor.custom_label": "Libellé personnalisé",
  "editor.custom_unit": "Unité personnalisée",
  "editor.sw_tablet": "Mode tablette",
  "editor.sw_graph": "Graphique en popup",
  "editor.sw_derive": "Calculer les valeurs manquantes",
  "editor.sw_daily": "Prévisions quotidiennes",
  "editor.sw_hourly": "Prévisions horaires",
  "editor.sw_sparks": "Mini-graphiques",
  "editor.sw_rose": "Rose des vents",
  "editor.sw_alerts": "Alertes météo",
  "editor.sw_precip": "Chronologie des précipitations",
  "editor.sw_records": "Records",
  "editor.sw_comfort": "Zones de confort",
  "editor.sw_skins": "Thèmes saisonniers",
  "editor.sw_updated": "Dernière mise à jour",
  "editor.sw_beaufort": "Échelle de Beaufort"
};
const nl = {
  "section.conditions": "Omstandigheden",
  "section.wind": "Wind",
  "section.rain": "Regen",
  "section.sun": "Zon & maan",
  "section.soil": "Bodem",
  "section.lightning": "Bliksem",
  "section.air": "Luchtkwaliteit",
  "section.station": "Station",
  "section.health": "Stationsstatus",
  "section.records": "Records",
  "section.comfort": "Comfort",
  "section.forecast": "Verwachting",
  "section.battery": "Batterij",
  "tile.temperature": "Buiten",
  "tile.feels_like": "Gevoel",
  "tile.temp_high": "Max",
  "tile.temp_low": "Min",
  "tile.humidity": "Luchtvochtigheid",
  "tile.dew_point": "Dauwpunt",
  "tile.wind_speed": "Snelheid",
  "tile.wind_speed_bf": "Snelheid · B{n}",
  "tile.wind_gust": "Windstoot",
  "tile.max_gust": "Max. stoot",
  "tile.rain_rate": "Intensiteit",
  "tile.rain_today": "Vandaag",
  "tile.rain_event": "Bui",
  "tile.rain_week": "Week",
  "tile.rain_month": "Maand",
  "tile.rain_year": "Jaar",
  "tile.last_rain": "Laatste regen",
  "tile.uv": "UV",
  "tile.irradiance": "Zon",
  "tile.illuminance": "Licht",
  "tile.sunrise": "Zonsopkomst",
  "tile.sunset": "Zonsondergang",
  "tile.soil_moisture": "Bodem {n}",
  "tile.soil_temperature": "Bodem {n} °",
  "tile.leaf_wetness": "Bladnat",
  "tile.lightning_count": "Inslagen",
  "tile.lightning_distance": "Afstand",
  "tile.lightning_time": "Laatste inslag",
  "tile.noise": "Geluid",
  "tile.pressure": "Luchtdruk",
  "tile.pressure_trend": "Luchtdruk · {trend}",
  "tile.pressure_abs": "Abs. druk",
  "tile.indoor_temperature": "Binnen",
  "tile.indoor_humidity": "Binnen RV",
  "tile.signal_strength": "Signaal",
  "derived.suffix": "{label} · ber.",
  "derived.title": "Berekend uit temperatuur, luchtvochtigheid en wind",
  "uv.low": "Laag",
  "uv.moderate": "Matig",
  "uv.high": "Hoog",
  "uv.very_high": "Zeer hoog",
  "uv.extreme": "Extreem",
  "air.good": "Goed",
  "air.moderate": "Matig",
  "air.sensitive": "Gevoelig",
  "air.unhealthy": "Ongezond",
  "trend.rising": "Stijgend",
  "trend.steady": "Stabiel",
  "trend.falling": "Dalend",
  "moon.label": "Maan",
  "moon.new_moon": "Nieuwe maan",
  "moon.waxing_crescent": "Wassende sikkel",
  "moon.first_quarter": "Eerste kwartier",
  "moon.waxing_gibbous": "Wassende maan",
  "moon.full_moon": "Volle maan",
  "moon.waning_gibbous": "Afnemende maan",
  "moon.last_quarter": "Laatste kwartier",
  "moon.waning_crescent": "Afnemende sikkel",
  "battery.low": "Batterij bijna leeg",
  "battery.low_pct": "Batterij bijna leeg · {pct}",
  "battery.ok": "Stationsbatterij OK",
  "battery.pct": "Stationsbatterij {pct}",
  "header.live": "Live station",
  "header.raining": "Regen · {rate}",
  "header.hilo": "H {hi}° / L {lo}°",
  "header.feels": "Gevoel {v}°",
  "header.rh": "{v}% RV",
  "status.stale": "Verouderd · {when}",
  "status.stale_title": "Gegevens kunnen verouderd zijn",
  "status.updated_title": "Laatste sensorupdate",
  "hint.setup": "Stel {prefix} in (bv. {example}) of kies entiteiten in de editor.",
  "chips.more": "Meer",
  "chips.less": "Minder",
  "chips.region": "Weeroverzicht",
  "forecast.pick_entity": "Kies een weerentiteit voor de verwachting.",
  "forecast.missing": "Weerentiteit {id} ontbreekt.",
  "forecast.waiting": "Wachten op dagverwachting van {id}…",
  "forecast.waiting_hourly": "Wachten op uurverwachting van {id}…",
  "forecast.hourly_region": "Uurverwachting",
  "forecast.daily_region": "Dagverwachting",
  "forecast.item_aria": "{when}: {temp}, {pop} kans op neerslag",
  "rain.month_vs_normal": "Maand vs normaal",
  "rain.pct_normal": "{pct}% van normaal",
  "rain.days_since": "Dagen zonder regen",
  "rain.since_one": "{n} dag zonder regen",
  "rain.since_other": "{n} dagen zonder regen",
  "rain.spark_today": "V",
  "rain.spark_event": "B",
  "rain.spark_week": "W",
  "rain.spark_month": "M",
  "rain.spark_year": "J",
  "rain.spark_aria": "Regentotalen: vandaag {today}, bui {event}, week {week}, maand {month}, jaar {year}",
  "precip.title": "Neerslagverloop",
  "precip.meta": "{hours} u · piek {peak}",
  "precip.aria": "Regenintensiteit over de laatste {hours} uur, piek {peak}",
  "wind.rose": "{hours}u-roos",
  "wind.compass_aria": "Wind uit {dir} op {deg}°",
  "wind.compass_none": "Windrichting niet beschikbaar",
  "wind.rose_aria": "Verdeling windrichting over de laatste {hours} uur. Meest voorkomend: {dir}",
  "records.month": "Maand",
  "records.year": "Jaar",
  "records.hottest": "Warmst · {period}",
  "records.coldest": "Koudst · {period}",
  "records.peak_gust": "Zwaarste stoot · {period}",
  "records.peak_rate": "Max. regenintensiteit · {period}",
  "records.wettest": "Natste dag · {period}",
  "records.set_today": "Vandaag",
  "records.empty": "Records hebben geschiedenis nodig van temperatuur-, wind- of regensensoren ({period}).",
  "records.title": "Extremen · {period}",
  "records.source_stats": "Langetermijnstatistieken",
  "records.source_history": "Alleen recente geschiedenis — voeg state_class toe aan sensoren",
  "comfort.title": "Uren in comfort",
  "comfort.meta": "{in} u van {total} u in zone · {band}",
  "comfort.empty": "Comfortzones hebben temperatuur- en vochtgeschiedenis nodig.",
  "comfort.cooler": "Koeler",
  "comfort.temp_axis": "Temp →",
  "comfort.warmer": "Warmer",
  "comfort.aria": "{pct} van de gemeten tijd lag in de comfortzone",
  "alerts.default": "Weerwaarschuwing",
  "alerts.region": "Weerwaarschuwingen",
  "health.all_online": "Alle {total} sensoren online",
  "health.online": "{ok} van {total} sensoren online",
  "health.battery_unknown": "onbekend",
  "health.all_ok": "Alle {total} sensoren melden",
  "health.reporting": "{ok} van {total} sensoren melden",
  "health.offline": "Offline",
  "health.stale": "Stil {when}",
  "health.batteries": "Batterijen",
  "health.battery_low": "laag",
  "health.battery_ok": "OK",
  "health.signal": "Signaal",
  "graph.title": "Geschiedenis: {name}",
  "graph.range_24h": "24 u",
  "graph.range_7d": "7 d",
  "graph.range_30d": "30 d",
  "graph.range_label": "Periode",
  "graph.loading": "Laden…",
  "graph.empty": "Geen geschiedenis voor deze periode.",
  "graph.min": "Min",
  "graph.max": "Max",
  "graph.avg": "Gem.",
  "graph.more_info": "Details",
  "graph.close": "Sluiten",
  "graph.summary": "Minimum {min}, maximum {max}, gemiddeld {avg}.",
  "graph.source_stats": "Uurstatistieken (min–max-band, gemiddelde)",
  "graph.source_history": "Vastgelegde statussen",
  "editor.loading": "Home Assistant-kiezers laden…",
  "editor.tab_layout": "Indeling",
  "editor.tab_entities": "Entiteiten",
  "editor.tab_order": "Volgorde",
  "editor.tab_display": "Weergave",
  "editor.name": "Naam",
  "editor.layout": "Indeling",
  "editor.layout_full": "Volledig station",
  "editor.layout_compact": "Compact",
  "editor.layout_chips": "Chipbalk",
  "editor.prefix": "Entiteitsprefix",
  "editor.unit_system": "Eenhedenstelsel",
  "editor.unit_native": "Origineel (zoals gemeld)",
  "editor.unit_imperial": "Imperiaal (°F, mph, in)",
  "editor.unit_metric": "Metrisch (°C, km/h, mm)",
  "editor.language": "Taal",
  "editor.language_auto": "Volg Home Assistant",
  "editor.forecast_days": "Verwachtingsdagen",
  "editor.hourly_hours": "Uren (per uur)",
  "editor.stale_minutes": "Verouderd na (minuten)",
  "editor.history_hours": "Geschiedenisvenster (uren)",
  "editor.records_period": "Recordperiode",
  "editor.records_month": "Maand (30 dagen)",
  "editor.records_year": "Jaar (365 dagen)",
  "editor.hemisphere": "Halfrond (seizoensthema's)",
  "editor.hemisphere_north": "Noord",
  "editor.hemisphere_south": "Zuid",
  "editor.rain_normal": "Normale maandneerslag",
  "editor.weather_entity": "Weerentiteit voor verwachting",
  "editor.alert_entity": "Waarschuwingsentiteit (optioneel)",
  "editor.sun_entity": "Zonentiteit",
  "editor.moon_entity": "Maanentiteit (optioneel)",
  "editor.sections": "Secties",
  "editor.comfort_band": "Comfortzone",
  "editor.order_reset": "Standaardvolgorde",
  "editor.custom_label": "Eigen label",
  "editor.custom_unit": "Eigen eenheid",
  "editor.sw_tablet": "Tabletmodus",
  "editor.sw_graph": "Grafiek-pop-up",
  "editor.sw_derive": "Ontbrekende waarden berekenen",
  "editor.sw_daily": "Dagverwachting",
  "editor.sw_hourly": "Uurverwachting",
  "editor.sw_sparks": "Mini-grafieken",
  "editor.sw_rose": "Windroos",
  "editor.sw_alerts": "Weerwaarschuwingen",
  "editor.sw_precip": "Neerslagverloop",
  "editor.sw_records": "Records",
  "editor.sw_comfort": "Comfortzones",
  "editor.sw_skins": "Seizoensthema's",
  "editor.sw_updated": "Laatste update",
  "editor.sw_beaufort": "Schaal van Beaufort"
};
const LANGS = { en, de, fr, es, nl };
const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "de", name: "Deutsch" },
  { code: "fr", name: "Français" },
  { code: "es", name: "Español" },
  { code: "nl", name: "Nederlands" }
];
function resolveLanguage(lang) {
  const base = String(lang || "").toLowerCase().split(/[-_]/)[0];
  return base && LANGS[base] ? base : "en";
}
function fill(template, vars) {
  if (!vars) return template;
  return template.replace(
    /\{(\w+)\}/g,
    (match, name) => Object.prototype.hasOwnProperty.call(vars, name) ? String(vars[name]) : match
  );
}
function translate(lang, key, vars) {
  const table = LANGS[resolveLanguage(lang)];
  const template = table[key] ?? en[key] ?? key;
  return fill(template, vars);
}
function makeTranslator(lang) {
  const code = resolveLanguage(lang);
  return (key, vars) => translate(code, key, vars);
}
const CARD_VERSION$1 = "0.9.0";
const CARD_VERSION = customElements.get(CARD_TYPE)?.VERSION || customElements.get(CARD_TYPE)?.constructor?.VERSION || CARD_VERSION$1;
async function loadHaComponents() {
  if (customElements.get("ha-entity-picker")) return;
  try {
    const loadHelpers = window.loadCardHelpers;
    if (typeof loadHelpers === "function") {
      const helpers = await loadHelpers();
      const el = await helpers.createCardElement({ type: "entities", entities: ["sun.sun"] });
      if (el?.constructor?.getConfigElement) await el.constructor.getConfigElement();
    }
  } catch {
  }
  if (customElements.get("ha-entity-picker")) return;
  for (const tag of ["hui-entities-card", "hui-glance-card", "hui-entity-card"]) {
    const Card = customElements.get(tag);
    if (Card?.getConfigElement) {
      try {
        await Card.getConfigElement();
      } catch {
      }
      if (customElements.get("ha-entity-picker")) return;
    }
  }
}
const LAYOUT_THUMBS = {
  full: `<svg viewBox="0 0 60 44" aria-hidden="true">
    <rect x="2" y="2" width="56" height="10" rx="3" class="t-hero"/>
    ${[0, 1, 2, 3].map((i) => `<rect x="${2 + i * 14.5}" y="15" width="12" height="8" rx="2"/>`).join("")}
    ${[0, 1, 2, 3].map((i) => `<rect x="${2 + i * 14.5}" y="25" width="12" height="8" rx="2"/>`).join("")}
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${2 + i * 11.6}" y="36" width="9.6" height="6" rx="2"/>`).join("")}
  </svg>`,
  compact: `<svg viewBox="0 0 60 44" aria-hidden="true">
    <rect x="2" y="2" width="56" height="7" rx="2" class="t-hero"/>
    ${[0, 1].map((r) => [0, 1, 2, 3, 4].map((i) => `<rect x="${2 + i * 11.6}" y="${12 + r * 8}" width="9.6" height="6" rx="1.5"/>`).join("")).join("")}
  </svg>`,
  chips: `<svg viewBox="0 0 60 44" aria-hidden="true">
    ${[0, 1, 2, 3].map((i) => `<rect x="${2 + i * 12}" y="17" width="10" height="9" rx="4.5"/>`).join("")}
    <rect x="50" y="17" width="8" height="9" rx="4.5" class="t-hero"/>
  </svg>`
};
const SEASON_COLORS = {
  spring: "var(--green-color, #4caf50)",
  summer: "var(--amber-color, #ffc107)",
  autumn: "var(--orange-color, #ff9800)",
  winter: "var(--blue-color, #2196f3)"
};
function comfortPreviewSvg(lo, hi, hMin, hMax, unit) {
  const tMin = Math.min(lo, hi) - 15;
  const tMax = Math.max(lo, hi) + 15;
  const W = 220;
  const H = 90;
  const x = (t) => 24 + (t - tMin) / Math.max(1, tMax - tMin) * (W - 30);
  const y = (h) => H - 14 - h / 100 * (H - 22);
  const bx = x(Math.min(lo, hi));
  const bw = Math.max(3, x(Math.max(lo, hi)) - bx);
  const by = y(Math.max(hMin, hMax));
  const bh = Math.max(3, y(Math.min(hMin, hMax)) - by);
  return `<svg class="comfort-preview" viewBox="0 0 ${W} ${H}" width="100%" height="${H}" aria-hidden="true">
    <line x1="24" y1="${H - 14}" x2="${W - 4}" y2="${H - 14}" class="axis"/>
    <line x1="24" y1="6" x2="24" y2="${H - 14}" class="axis"/>
    <rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" rx="4" class="band"/>
    <text x="${(bx + bw / 2).toFixed(1)}" y="${H - 3}" text-anchor="middle">${Math.round(lo)}–${Math.round(hi)}${unit}</text>
    <text x="20" y="${(by + 4).toFixed(1)}" text-anchor="end">${Math.round(Math.max(hMin, hMax))}%</text>
    <text x="20" y="${(by + bh).toFixed(1)}" text-anchor="end">${Math.round(Math.min(hMin, hMax))}%</text>
  </svg>`;
}
class MushroomWeatherStationCardEditor extends HTMLElement {
  constructor() {
    super(...arguments);
    this._config = { entities: {}, layout: "full", labels: {}, units: {} };
    this._loaded = false;
    this._built = false;
    this._tab = "layout";
    this._dragFrom = null;
    this._t = makeTranslator("en");
    this._lang = "en";
  }
  setConfig(config) {
    this._config = { entities: {}, layout: "full", labels: {}, units: {}, ...config };
    this._built = false;
    void this._render();
  }
  set hass(hass) {
    this._hass = hass;
    const lang = resolveLanguage(this._config.language || hass?.locale?.language || hass?.language);
    if (lang !== this._lang) this._built = false;
    if (this._built && this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((p) => {
        p.hass = hass;
      });
      return;
    }
    void this._render();
  }
  connectedCallback() {
    void this._render();
  }
  _fire(next) {
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }
  _unitSystem() {
    return this._config.unit_system || "native";
  }
  _setField(key, value, section) {
    const next = {
      ...this._config,
      entities: { ...this._config.entities || {} },
      labels: { ...this._config.labels || {} },
      units: { ...this._config.units || {} }
    };
    if (section === "entities") {
      if (value) next.entities[key] = String(value);
      else delete next.entities[key];
    } else if (section === "labels") {
      if (value) next.labels[key] = String(value);
      else delete next.labels[key];
    } else if (section === "units") {
      if (value) next.units[key] = String(value);
      else delete next.units[key];
    } else if (key === "show_empty" || key === "show_forecast" || key === "show_hourly_forecast" || key === "show_history_sparklines" || key === "show_wind_rose" || key === "show_alerts" || key === "show_precip_timeline" || key === "show_records" || key === "show_comfort" || key === "seasonal_skins" || key === "tablet_mode" || key === "show_updated" || key === "show_beaufort" || key === "graph_popup" || key === "derive_missing" || String(key).startsWith("hide_")) {
      next[key] = !!value;
    } else if (key === "comfort_temp_min" || key === "comfort_temp_max") {
      const displayed = value === "" ? NaN : Number(value);
      const system = this._unitSystem();
      const stored = Number.isFinite(displayed) ? storeThresholdValue(displayed, "temp", system === "native" ? "imperial" : system) : NaN;
      next[key] = Number.isFinite(stored) ? stored : value;
    } else if (key === "uv_purple_above" || key === "temp_blue_below") {
      const thresholds = { ...next.thresholds || {} };
      const system = this._unitSystem();
      if (key === "uv_purple_above") {
        const n = value === "" ? NaN : Number(value);
        thresholds.uv = Number.isFinite(n) ? [{ above: n, color: "purple" }] : [];
      } else {
        const displayed = value === "" ? NaN : Number(value);
        const stored = Number.isFinite(displayed) ? storeThresholdValue(displayed, "temp", system === "native" ? "imperial" : system) : NaN;
        thresholds.temperature = Number.isFinite(stored) ? [{ below: stored, color: "blue" }] : [];
        thresholds.feels_like = thresholds.temperature;
        next[key] = Number.isFinite(stored) ? stored : value;
      }
      next.thresholds = thresholds;
      if (key === "uv_purple_above") next[key] = value;
    } else if (key === "stale_minutes" || key === "forecast_days" || key === "hourly_forecast_hours" || key === "history_hours" || key === "battery_warning_threshold" || key === "rain_month_normal" || key === "comfort_humidity_min" || key === "comfort_humidity_max") {
      const n = value === "" ? void 0 : Number(value);
      next[key] = Number.isFinite(n) ? n : value;
    } else if (key === "battery_entities") {
      const list = String(value || "").split(",").map((v) => v.trim()).filter(Boolean);
      if (list.length) next.battery_entities = list;
      else delete next.battery_entities;
    } else if ((key === "language" || key === "layout") && !value) {
      delete next[key];
    } else {
      next[key] = value;
    }
    if (key === "prefix") {
      next.entities = applyPrefix(next, this._config.prefix).entities;
    }
    this._fire(next);
    void this._render();
  }
  async _render() {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._lang = resolveLanguage(this._config.language || this._hass?.locale?.language || this._hass?.language);
    this._t = makeTranslator(this._lang);
    const t = this._t;
    if (!this._loaded) {
      this.shadowRoot.innerHTML = `<p class="help">${esc(t("editor.loading"))}</p>`;
      await loadHaComponents();
      this._loaded = true;
    }
    const c = this._config;
    const e = c.entities || {};
    const labels = c.labels || {};
    const units = c.units || {};
    const pickerReady = !!customElements.get("ha-entity-picker");
    const tab = this._tab || "layout";
    const order = normalizeSectionOrder(c.section_order);
    const system = this._unitSystem();
    const tempUnit = thresholdEditorUnit("temp", system === "native" ? "imperial" : system);
    const storedTempBlue = Number(
      c.thresholds?.temperature?.find((r) => r.color === "blue" && r.below != null)?.below ?? c.thresholds?.temperature?.find((r) => r.below != null)?.below ?? c.temp_blue_below ?? 32
    );
    const displayTempBlue = displayThresholdValue(
      Number.isFinite(storedTempBlue) ? storedTempBlue : 32,
      "temp",
      system === "native" ? "imperial" : system
    );
    this.shadowRoot.innerHTML = `
      <style>
        .wrap { display: grid; gap: 14px; padding: 4px 0 8px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .help { font-size: 13px; color: var(--secondary-text-color); line-height: 1.45; margin: 0; }
        .version { font-size: 12px; font-weight: 600; color: var(--secondary-text-color); padding: 6px 10px; border-radius: 8px; background: var(--secondary-background-color, rgba(0,0,0,0.08)); }
        .tabs { display: flex; flex-wrap: wrap; gap: 6px; }
        .tab { border: 1px solid var(--divider-color); background: transparent; color: var(--primary-text-color); border-radius: 8px; padding: 6px 10px; cursor: pointer; font: inherit; }
        .tab.on { background: var(--secondary-background-color, rgba(0,0,0,0.08)); font-weight: 600; }
        h3 { margin: 4px 0 0; font-size: 15px; font-weight: 600; }
        label.field { display: grid; gap: 6px; font-size: 13px; color: var(--primary-text-color); }
        input, select { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--mdc-text-field-fill-color, var(--card-background-color)); color: var(--primary-text-color); font: inherit; }
        ha-entity-picker { display: block; width: 100%; }
        .switch-list { display: flex; flex-direction: column; gap: 0; }
        .switch-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          min-height: 48px;
          padding: 4px 0;
          border-bottom: 1px solid var(--divider-color);
        }
        .switch-row .switch-copy { display: flex; flex-direction: column; gap: 2px; flex: 1; min-width: 0; }
        .switch-row .switch-title { font-size: 14px; color: var(--primary-text-color); }
        .switch-row .switch-help { font-size: 12px; color: var(--secondary-text-color); }
        ha-switch { flex-shrink: 0; }
        .slot { display: grid; gap: 6px; padding: 8px 0; border-bottom: 1px solid var(--divider-color); }
        .slot-extra { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
        .order-list { display: grid; gap: 6px; }
        .order-row {
          display: grid;
          grid-template-columns: 28px 1fr auto auto;
          gap: 8px;
          align-items: center;
          padding: 10px 12px;
          border: 1px solid var(--divider-color);
          border-radius: 10px;
          background: var(--secondary-background-color, rgba(0,0,0,0.04));
          cursor: grab;
          user-select: none;
        }
        .order-row.dragging { opacity: 0.45; }
        .order-row.drag-over { border-color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
        .order-row .handle { color: var(--secondary-text-color); font-size: 16px; letter-spacing: -1px; }
        .order-row .name { font-size: 13px; font-weight: 600; }
        .order-row button {
          border: 1px solid var(--divider-color);
          background: transparent;
          color: var(--primary-text-color);
          border-radius: 8px;
          width: 34px;
          height: 34px;
          cursor: pointer;
          font: inherit;
        }
        .order-row button:disabled { opacity: 0.35; cursor: default; }
        .layout-picker { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; border: 0; padding: 0; margin: 0; }
        .layout-picker legend { font-size: 13px; padding: 0 0 6px; }
        .layout-opt { position: relative; display: grid; gap: 4px; padding: 8px; border: 1px solid var(--divider-color); border-radius: 10px; cursor: pointer; font-size: 12.5px; }
        .layout-opt input { position: absolute; opacity: 0; width: 1px; height: 1px; }
        .layout-opt svg { width: 100%; height: auto; }
        .layout-opt svg rect { fill: color-mix(in srgb, var(--primary-text-color) 14%, transparent); }
        .layout-opt svg rect.t-hero { fill: color-mix(in srgb, var(--primary-color) 45%, transparent); }
        .layout-opt .opt-help { font-size: 11px; color: var(--secondary-text-color); }
        .layout-opt:has(input:checked) { border-color: var(--primary-color); box-shadow: inset 0 0 0 1px var(--primary-color); }
        .layout-opt:has(input:focus-visible) { outline: 2px solid var(--primary-color); outline-offset: 2px; }
        .preview { display: flex; align-items: center; gap: 8px; font-size: 12px; color: var(--secondary-text-color); line-height: 1.4; margin-top: -4px; }
        .swatch { width: 14px; height: 14px; border-radius: 4px; flex-shrink: 0; }
        .comfort-preview { display: block; color: var(--secondary-text-color); }
        .comfort-preview .axis { stroke: var(--divider-color); }
        .comfort-preview .band { fill: color-mix(in srgb, var(--primary-color) 28%, transparent); stroke: var(--primary-color); }
        .comfort-preview text { font-size: 9px; fill: currentColor; }
        @media (max-width: 520px) { .row, .slot-extra { grid-template-columns: 1fr; } }
      </style>
      <div class="wrap">
        <div class="version">Mushroom Weather Station Card · v${CARD_VERSION}</div>
        <div class="tabs">
          ${["layout", "entities", "order", "display"].map((id) => `<button class="tab ${tab === id ? "on" : ""}" data-tab="${id}" aria-pressed="${tab === id}">${esc(t(`editor.tab_${id}`))}</button>`).join("")}
        </div>
        <div id="tab-body"></div>
      </div>
    `;
    this.shadowRoot.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._tab = btn.dataset.tab;
        this._built = false;
        void this._render();
      });
    });
    const body = this.shadowRoot.getElementById("tab-body");
    if (tab === "layout") {
      const layout = c.layout || "full";
      const fmtDate = (d) => d.toLocaleDateString(this._config.language || this._hass?.locale?.language, { month: "short", day: "numeric", year: "numeric" });
      const recDays = c.records_period === "year" ? 365 : 30;
      const recPreview = t("editor.records_preview", {
        start: fmtDate(new Date(Date.now() - recDays * 864e5)),
        end: fmtDate(/* @__PURE__ */ new Date())
      });
      const season = currentSeason(/* @__PURE__ */ new Date(), c.hemisphere === "south" ? "south" : "north");
      const skinPreview = c.seasonal_skins === false ? t("editor.skin_off") : t("editor.skin_preview", { season: t(`editor.season_${season}`) });
      body.innerHTML = `
        <label class="field">${esc(t("editor.name"))}
          <input data-key="name" value="${esc(c.name || "")}" placeholder="Weather Station" />
        </label>
        <fieldset class="layout-picker">
          <legend>${esc(t("editor.layout"))}</legend>
          ${["full", "compact", "chips"].map((id) => `<label class="layout-opt">
              <input type="radio" name="layout" data-key="layout" value="${id}" ${layout === id ? "checked" : ""} />
              ${LAYOUT_THUMBS[id]}
              <span>${esc(t(`editor.layout_${id}`))}</span>
              <span class="opt-help">${esc(t(`editor.layout_${id}_help`))}</span>
            </label>`).join("")}
        </fieldset>
        <label class="field">${esc(t("editor.prefix"))}
          <input data-key="prefix" value="${esc(c.prefix || "")}" placeholder="ws" />
        </label>
        <div class="row">
          <label class="field">${esc(t("editor.unit_system"))}
            <select data-key="unit_system">
              <option value="native" ${!c.unit_system || c.unit_system === "native" ? "selected" : ""}>${esc(t("editor.unit_native"))}</option>
              <option value="imperial" ${c.unit_system === "imperial" ? "selected" : ""}>${esc(t("editor.unit_imperial"))}</option>
              <option value="metric" ${c.unit_system === "metric" ? "selected" : ""}>${esc(t("editor.unit_metric"))}</option>
            </select>
          </label>
          <label class="field">${esc(t("editor.language"))}
            <select data-key="language">
              <option value="" ${!c.language ? "selected" : ""}>${esc(t("editor.language_auto"))}</option>
              ${LANGUAGES.map((l) => `<option value="${l.code}" ${c.language === l.code ? "selected" : ""}>${esc(l.name)}</option>`).join("")}
            </select>
          </label>
        </div>
        <div id="options-switches" class="switch-list"></div>
        <div class="row">
          <label class="field">${esc(t("editor.forecast_days"))}
            <input data-key="forecast_days" type="number" min="1" max="7" value="${esc(c.forecast_days ?? "5")}" placeholder="5" />
          </label>
          <label class="field">${esc(t("editor.hourly_hours"))}
            <input data-key="hourly_forecast_hours" type="number" min="6" max="24" value="${esc(c.hourly_forecast_hours ?? "24")}" placeholder="24" />
          </label>
        </div>
        <div class="row">
          <label class="field">${esc(t("editor.stale_minutes"))}
            <input data-key="stale_minutes" type="number" min="0" value="${esc(c.stale_minutes ?? "30")}" placeholder="30" />
          </label>
          <label class="field">${esc(t("editor.history_hours"))}
            <input data-key="history_hours" type="number" min="6" max="48" value="${esc(c.history_hours ?? "24")}" placeholder="24" />
          </label>
        </div>
        <div class="row">
          <label class="field">${esc(t("editor.records_period"))}
            <select data-key="records_period">
              <option value="month" ${!c.records_period || c.records_period === "month" ? "selected" : ""}>${esc(t("editor.records_month"))}</option>
              <option value="year" ${c.records_period === "year" ? "selected" : ""}>${esc(t("editor.records_year"))}</option>
            </select>
          </label>
          <label class="field">${esc(t("editor.hemisphere"))}
            <select data-key="hemisphere">
              <option value="north" ${!c.hemisphere || c.hemisphere === "north" ? "selected" : ""}>${esc(t("editor.hemisphere_north"))}</option>
              <option value="south" ${c.hemisphere === "south" ? "selected" : ""}>${esc(t("editor.hemisphere_south"))}</option>
            </select>
          </label>
        </div>
        <div class="row">
          <p class="preview">${esc(recPreview)}</p>
          <p class="preview"><span class="swatch" style="background:${c.seasonal_skins === false ? "var(--divider-color)" : SEASON_COLORS[season]}"></span>${esc(skinPreview)}</p>
        </div>
        <label class="field">${esc(t("editor.battery_entities"))}
          <input data-key="battery_entities" value="${esc(Array.isArray(c.battery_entities) ? c.battery_entities.join(", ") : c.battery_entities || "")}" placeholder="sensor.ws_wh65_battery, …" />
          <span class="help">${esc(t("editor.battery_entities_help"))}</span>
        </label>
        <label class="field">${esc(t("editor.rain_normal"))}
          <input data-key="rain_month_normal" type="number" min="0" step="0.01" value="${esc(c.rain_month_normal ?? "")}" placeholder="e.g. 2.5" />
        </label>
        <div id="weather-picker"></div>
        <div id="alert-picker"></div>
        <div id="sun-picker"></div>
        <div id="moon-picker"></div>
        <h3>${esc(t("editor.sections"))}</h3>
        <p class="help">${esc(t("editor.sections_help"))}</p>
        <div id="section-switches" class="switch-list"></div>
      `;
    } else if (tab === "display") {
      const bandSystem = system === "native" ? "imperial" : system;
      const comfortLo = displayThresholdValue(Number(c.comfort_temp_min ?? 65), "temp", bandSystem);
      const comfortHi = displayThresholdValue(Number(c.comfort_temp_max ?? 78), "temp", bandSystem);
      const loN = num(c.comfort_temp_min) ?? DEFAULT_COMFORT.tempMin;
      const hiN = num(c.comfort_temp_max) ?? DEFAULT_COMFORT.tempMax;
      const hMinN = num(c.comfort_humidity_min) ?? DEFAULT_COMFORT.humidityMin;
      const hMaxN = num(c.comfort_humidity_max) ?? DEFAULT_COMFORT.humidityMax;
      const bandText = `${Math.round(displayThresholdValue(loN, "temp", bandSystem))}–${Math.round(displayThresholdValue(hiN, "temp", bandSystem))}${tempUnit} · ${hMinN}–${hMaxN}% RH`;
      body.innerHTML = `
        <div class="row">
          <label class="field">${esc(t("editor.battery_threshold"))}
            <input data-key="battery_warning_threshold" type="number" value="${esc(c.battery_warning_threshold ?? "")}" placeholder="20" />
          </label>
          <label class="field">${esc(t("editor.uv_purple"))}
            <input data-key="uv_purple_above" type="number" value="${esc(c.uv_purple_above ?? "8")}" placeholder="8" />
          </label>
        </div>
        <label class="field">${esc(t("editor.temp_blue", { unit: tempUnit }))}
          <input data-key="temp_blue_below" type="number" value="${esc(Number(displayTempBlue.toFixed(1)))}" placeholder="${tempUnit === "°C" ? "0" : "32"}" />
        </label>
        <h3>${esc(t("editor.comfort_band"))}</h3>
        <p class="help">${esc(t("editor.comfort_help"))}</p>
        <div role="img" aria-label="${esc(t("editor.comfort_preview_aria", { band: bandText }))}">
          ${comfortPreviewSvg(displayThresholdValue(loN, "temp", bandSystem), displayThresholdValue(hiN, "temp", bandSystem), hMinN, hMaxN, tempUnit)}
        </div>
        <div class="row">
          <label class="field">${esc(t("editor.comfort_temp_min", { unit: tempUnit }))}
            <input data-key="comfort_temp_min" type="number" value="${esc(Number(comfortLo.toFixed(1)))}" />
          </label>
          <label class="field">${esc(t("editor.comfort_temp_max", { unit: tempUnit }))}
            <input data-key="comfort_temp_max" type="number" value="${esc(Number(comfortHi.toFixed(1)))}" />
          </label>
        </div>
        <div class="row">
          <label class="field">${esc(t("editor.comfort_hum_min"))}
            <input data-key="comfort_humidity_min" type="number" min="0" max="100" value="${esc(c.comfort_humidity_min ?? "30")}" />
          </label>
          <label class="field">${esc(t("editor.comfort_hum_max"))}
            <input data-key="comfort_humidity_max" type="number" min="0" max="100" value="${esc(c.comfort_humidity_max ?? "60")}" />
          </label>
        </div>
        <p class="help">${esc(t("editor.thresholds_help", { system }))}</p>
      `;
    } else if (tab === "order") {
      body.innerHTML = `
        <p class="help">${esc(t("editor.order_help"))}</p>
        <div class="order-list" id="order-list">
          ${order.map(
        (id, index) => `
            <div class="order-row" draggable="true" data-index="${index}">
              <div class="handle" aria-hidden="true">⠿</div>
              <div class="name">${index + 1}. ${esc(t(`section.${id}`))}</div>
              <button type="button" data-move="up" data-index="${index}" ${index === 0 ? "disabled" : ""} aria-label="${esc(t("editor.move_up", { name: t(`section.${id}`) }))}">↑</button>
              <button type="button" data-move="down" data-index="${index}" ${index === order.length - 1 ? "disabled" : ""} aria-label="${esc(t("editor.move_down", { name: t(`section.${id}`) }))}">↓</button>
            </div>`
      ).join("")}
        </div>
        <button type="button" id="reset-order" style="margin-top:8px;border:1px solid var(--divider-color);background:transparent;color:var(--primary-text-color);border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit;">${esc(t("editor.order_reset"))}</button>
      `;
      const rows = [...body.querySelectorAll(".order-row")];
      rows.forEach((row) => {
        row.addEventListener("dragstart", () => {
          this._dragFrom = Number(row.dataset.index);
          row.classList.add("dragging");
        });
        row.addEventListener("dragend", () => {
          this._dragFrom = null;
          rows.forEach((r) => r.classList.remove("dragging", "drag-over"));
        });
        row.addEventListener("dragover", (ev) => {
          ev.preventDefault();
          row.classList.add("drag-over");
        });
        row.addEventListener("dragleave", () => row.classList.remove("drag-over"));
        row.addEventListener("drop", (ev) => {
          ev.preventDefault();
          row.classList.remove("drag-over");
          const to = Number(row.dataset.index);
          const from = this._dragFrom;
          if (from == null || Number.isNaN(to) || from === to) return;
          const nextOrder = moveSectionTo(order, from, to);
          this._fire({ ...this._config, section_order: nextOrder });
          void this._render();
        });
      });
      body.querySelectorAll("[data-move]").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const index = Number(btn.dataset.index);
          const dir = btn.dataset.move === "up" ? -1 : 1;
          this._fire({ ...this._config, section_order: moveSection(order, index, dir) });
          void this._render();
        });
      });
      body.querySelector("#reset-order")?.addEventListener("click", () => {
        this._fire({ ...this._config, section_order: [...DEFAULT_SECTION_ORDER] });
        void this._render();
      });
    } else {
      body.innerHTML = `<p class="help">${esc(t("editor.entities_help"))}</p><div id="pickers"></div>${pickerReady ? "" : `<p class="help">${esc(t("editor.picker_missing"))}</p>`}`;
    }
    body.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const target = ev.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        this._setField(target.dataset.key || "", value, target.dataset.section);
      });
    });
    if (tab === "layout") {
      const sw = (key, id) => ({
        key,
        title: t(`editor.${id}`),
        help: t(`editor.${id}_help`)
      });
      this._fillSwitches("options-switches", [
        sw("tablet_mode", "sw_tablet"),
        sw("graph_popup", "sw_graph"),
        sw("derive_missing", "sw_derive"),
        sw("show_empty", "sw_empty"),
        sw("show_forecast", "sw_daily"),
        sw("show_hourly_forecast", "sw_hourly"),
        sw("show_history_sparklines", "sw_sparks"),
        sw("show_wind_rose", "sw_rose"),
        sw("show_alerts", "sw_alerts"),
        sw("show_precip_timeline", "sw_precip"),
        sw("show_records", "sw_records"),
        sw("show_comfort", "sw_comfort"),
        sw("seasonal_skins", "sw_skins"),
        sw("show_updated", "sw_updated"),
        sw("show_beaufort", "sw_beaufort")
      ]);
      this._fillSwitches(
        "section-switches",
        ["conditions", "wind", "rain", "sun", "soil", "lightning", "air", "more", "health", "records", "comfort", "battery"].map((id) => sw(`hide_${id}`, `hide_${id}`))
      );
    }
    if (tab === "layout" && pickerReady && this._hass) {
      this._mountPicker("weather-picker", t("editor.weather_entity"), c.weather_entity || "", ["weather"], "weather_entity");
      this._mountPicker("alert-picker", t("editor.alert_entity"), c.alert_entity || "", ["sensor", "binary_sensor", "event"], "alert_entity");
      this._mountPicker("sun-picker", t("editor.sun_entity"), c.sun_entity || "sun.sun", ["sun"], "sun_entity");
      this._mountPicker("moon-picker", t("editor.moon_entity"), c.moon_entity || "", ["sensor"], "moon_entity");
    }
    if (tab !== "entities" || !pickerReady || !this._hass) {
      this._built = true;
      return;
    }
    const host = this.shadowRoot.getElementById("pickers");
    EDITOR_FIELDS.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "slot";
      const picker = document.createElement("ha-entity-picker");
      picker.hass = this._hass;
      picker.label = field.label;
      picker.value = e[field.key] || "";
      picker.allowCustomEntity = true;
      picker.includeDomains = field.domains;
      if (field.classes?.length === 1) picker.includeDeviceClasses = field.classes;
      if (field.classes?.length > 1) {
        const classes = [...field.classes];
        picker.entityFilter = (state) => {
          const dc = state?.attributes?.device_class;
          return !dc || classes.includes(dc);
        };
      }
      picker.addEventListener("value-changed", (ev) => {
        ev.stopPropagation();
        this._setField(field.key, ev.detail?.value || "", "entities");
      });
      wrap.appendChild(picker);
      const extra = document.createElement("div");
      extra.className = "slot-extra";
      extra.innerHTML = `
        <input data-section="labels" data-key="${field.key}" placeholder="${esc(t("editor.custom_label"))}" aria-label="${esc(`${field.label} · ${t("editor.custom_label")}`)}" value="${esc(labels[field.key] || "")}" />
        <input data-section="units" data-key="${field.key}" placeholder="${esc(t("editor.custom_unit"))}" aria-label="${esc(`${field.label} · ${t("editor.custom_unit")}`)}" value="${esc(units[field.key] || "")}" />
      `;
      extra.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("change", (ev) => {
          const t2 = ev.target;
          this._setField(t2.dataset.key || "", t2.value, t2.dataset.section);
        });
      });
      wrap.appendChild(extra);
      host.appendChild(wrap);
    });
    this._built = true;
  }
  _mountPicker(hostId, label, value, domains, key) {
    const host = this.shadowRoot.getElementById(hostId);
    if (!host || !this._hass) return;
    const picker = document.createElement("ha-entity-picker");
    picker.hass = this._hass;
    picker.label = label;
    picker.value = value;
    picker.allowCustomEntity = true;
    picker.includeDomains = domains;
    picker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._setField(key, ev.detail?.value || "");
    });
    host.appendChild(picker);
  }
  _fillSwitches(hostId, items) {
    const host = this.shadowRoot.getElementById(hostId);
    if (!host) return;
    host.replaceChildren();
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "switch-row";
      const copy = document.createElement("div");
      copy.className = "switch-copy";
      copy.innerHTML = `<span class="switch-title">${esc(item.title)}</span>${item.help ? `<span class="switch-help">${esc(item.help)}</span>` : ""}`;
      const useHaSwitch = !!customElements.get("ha-switch");
      const sw = document.createElement(useHaSwitch ? "ha-switch" : "input");
      if (!useHaSwitch) {
        sw.type = "checkbox";
        sw.style.width = "20px";
        sw.style.height = "20px";
        sw.style.flexShrink = "0";
      }
      const defaultsOn = /* @__PURE__ */ new Set([
        "show_updated",
        "show_history_sparklines",
        "show_wind_rose",
        "show_alerts",
        "show_precip_timeline",
        "show_records",
        "show_comfort",
        "seasonal_skins",
        "derive_missing"
      ]);
      if (item.key === "show_hourly_forecast") {
        const raw = this._config.show_hourly_forecast;
        sw.checked = raw === false ? false : raw === true ? true : !!this._config.weather_entity;
      } else if (defaultsOn.has(item.key)) {
        const raw = this._config[item.key];
        sw.checked = raw !== false;
      } else {
        sw.checked = !!this._config[item.key];
      }
      sw.setAttribute("aria-label", item.title);
      sw.addEventListener("change", (ev) => {
        ev.stopPropagation();
        this._setField(item.key, !!sw.checked);
      });
      row.appendChild(copy);
      row.appendChild(sw);
      host.appendChild(row);
    });
  }
}
customElements.define(`${CARD_TYPE}-editor`, MushroomWeatherStationCardEditor);
//# sourceMappingURL=mushroom-weather-station-card-editor.js.map
