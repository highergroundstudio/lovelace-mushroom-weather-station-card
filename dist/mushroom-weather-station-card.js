const CARD_TYPE = "mushroom-weather-station-card";
const CARD_NAME = "Mushroom Weather Station Card";
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
const CARDINALS = [
  "N",
  "NNE",
  "NE",
  "ENE",
  "E",
  "ESE",
  "SE",
  "SSE",
  "S",
  "SSW",
  "SW",
  "WSW",
  "W",
  "WNW",
  "NW",
  "NNW"
];
const WIND_ROSE_LABELS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"];
const DEFAULT_SECTION_ORDER = [
  "conditions",
  "wind",
  "rain",
  "sun",
  "soil",
  "lightning",
  "air",
  "station",
  "forecast",
  "battery"
];
const SECTION_LABELS = {
  conditions: "Conditions",
  wind: "Wind",
  rain: "Rain",
  sun: "Sun & moon",
  soil: "Soil",
  lightning: "Lightning",
  air: "Air quality",
  station: "Station",
  forecast: "Forecast",
  battery: "Battery"
};
const DEFAULT_THRESHOLDS = {
  temperature: [
    { above: 115, color: "purple" },
    { above: 105, color: "red" },
    { above: 95, color: "orange" },
    { above: 80, color: "amber" },
    { above: 60, color: "green" },
    { below: 32, color: "blue" }
  ],
  feels_like: [
    { above: 115, color: "purple" },
    { above: 105, color: "red" },
    { above: 95, color: "orange" },
    { above: 80, color: "amber" },
    { above: 60, color: "green" },
    { below: 32, color: "blue" }
  ],
  uv: [
    { above: 11, color: "purple" },
    { above: 8, color: "purple" },
    { above: 6, color: "orange" },
    { above: 3, color: "amber" },
    { below: 3, color: "green" }
  ],
  humidity: [{ above: 50, color: "cyan" }, { below: 50, color: "blue" }],
  dew_point: [{ above: 70, color: "red" }, { above: 60, color: "orange" }, { below: 60, color: "blue" }],
  wind_speed: [{ above: 20, color: "orange" }],
  wind_gust: [{ above: 25, color: "orange" }],
  co2: [{ above: 1200, color: "red" }, { above: 800, color: "orange" }, { below: 800, color: "green" }],
  pm25: [{ above: 55, color: "red" }, { above: 35, color: "orange" }, { above: 12, color: "amber" }, { below: 12, color: "green" }],
  aqi: [{ above: 150, color: "red" }, { above: 100, color: "orange" }, { above: 50, color: "amber" }, { below: 50, color: "green" }],
  voc: [{ above: 1e3, color: "red" }, { above: 500, color: "orange" }, { below: 500, color: "green" }],
  noise: [{ above: 70, color: "orange" }, { above: 55, color: "amber" }, { below: 55, color: "green" }],
  leaf_wetness: [{ above: 70, color: "blue" }, { above: 30, color: "cyan" }, { below: 30, color: "grey" }],
  soil_moisture_1: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_2: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_3: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_4: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_5: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_6: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_7: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_8: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }]
};
const COLOR_VARS = {
  purple: "var(--purple-color, #9c27b0)",
  red: "var(--red-color, #f44336)",
  orange: "var(--orange-color, #ff9800)",
  amber: "var(--amber-color, #ffc107)",
  green: "var(--green-color, #4caf50)",
  blue: "var(--blue-color, #2196f3)",
  cyan: "var(--cyan-color, #00bcd4)",
  teal: "var(--teal-color, #009688)",
  grey: "var(--disabled-text-color, #9e9e9e)"
};
const WEATHER_ICONS = {
  "clear-night": "mdi:weather-night",
  cloudy: "mdi:weather-cloudy",
  exceptional: "mdi:alert-circle-outline",
  fog: "mdi:weather-fog",
  hail: "mdi:weather-hail",
  lightning: "mdi:weather-lightning",
  "lightning-rainy": "mdi:weather-lightning-rainy",
  partlycloudy: "mdi:weather-partly-cloudy",
  pouring: "mdi:weather-pouring",
  rainy: "mdi:weather-rainy",
  snowy: "mdi:weather-snowy",
  "snowy-rainy": "mdi:weather-snowy-rainy",
  sunny: "mdi:weather-sunny",
  windy: "mdi:weather-windy",
  "windy-variant": "mdi:weather-windy-variant"
};
const MOON_ICONS = {
  new_moon: "mdi:moon-new",
  new: "mdi:moon-new",
  waxing_crescent: "mdi:moon-waxing-crescent",
  first_quarter: "mdi:moon-first-quarter",
  waxing_gibbous: "mdi:moon-waxing-gibbous",
  full_moon: "mdi:moon-full",
  full: "mdi:moon-full",
  waning_gibbous: "mdi:moon-waning-gibbous",
  last_quarter: "mdi:moon-last-quarter",
  third_quarter: "mdi:moon-last-quarter",
  waning_crescent: "mdi:moon-waning-crescent"
};
const ALERT_SEVERITY_COLOR = {
  extreme: "red",
  severe: "orange",
  moderate: "amber",
  minor: "blue",
  unknown: "grey"
};
const HISTORY_SPARK_KEYS = ["temperature", "humidity", "wind_speed", "pressure"];
[
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
  { key: "battery", label: "Battery", domains: ["sensor", "binary_sensor"], classes: ["battery"] }
];
function degToCardinal(deg) {
  const n = Number(deg);
  if (!Number.isFinite(n)) return null;
  return CARDINALS[Math.round((n % 360 + 360) % 360 / 22.5) % 16];
}
function cardinalToDeg(cardinal) {
  if (!cardinal) return null;
  const key = String(cardinal).trim().toUpperCase();
  const idx = CARDINALS.indexOf(key);
  return idx >= 0 ? idx * 22.5 : null;
}
function num(state) {
  if (state == null || state === "unknown" || state === "unavailable" || state === "") return null;
  const n = parseFloat(String(state));
  return Number.isFinite(n) ? n : null;
}
function available(st) {
  return !!(st && st.state !== "unavailable" && st.state !== "unknown");
}
function parseWindDirection(st) {
  if (!st || !available(st)) return { deg: null, card: null };
  const raw = st.state;
  const asNum = num(raw);
  if (asNum != null) return { deg: asNum, card: degToCardinal(asNum) };
  const card = String(raw || "").trim().toUpperCase();
  if (CARDINALS.includes(card)) return { deg: cardinalToDeg(card), card };
  return { deg: null, card: null };
}
function fmtNum(n, digits = 1) {
  if (n == null) return "—";
  return Number(n).toFixed(digits).replace(/\.0$/, "");
}
function colorFromThresholds(value, rules, fallback = "grey") {
  if (value == null || !rules || !rules.length) return fallback;
  const aboves = rules.filter((r) => r && r.above != null && r.color).slice().sort((a, b) => Number(b.above) - Number(a.above));
  for (const rule of aboves) if (value >= Number(rule.above)) return rule.color;
  const belows = rules.filter((r) => r && r.below != null && r.color).slice().sort((a, b) => Number(a.below) - Number(b.below));
  for (const rule of belows) if (value <= Number(rule.below)) return rule.color;
  return fallback;
}
function iconColorVar(colorName) {
  if (!colorName) return COLOR_VARS.grey;
  if (String(colorName).startsWith("#") || String(colorName).startsWith("var(")) return colorName;
  return COLOR_VARS[colorName] || colorName;
}
function uvMeta(uv, color) {
  if (uv == null) return { label: "—", color: color || "grey" };
  if (uv >= 11) return { label: "Extreme", color: color || "purple" };
  if (uv >= 8) return { label: "Very high", color: color || "purple" };
  if (uv >= 6) return { label: "High", color: color || "orange" };
  if (uv >= 3) return { label: "Moderate", color: color || "amber" };
  return { label: "Low", color: color || "green" };
}
function pm25Meta(value, color) {
  if (value == null) return { label: "PM2.5", color: color || "grey" };
  if (value >= 55) return { label: "Unhealthy", color: color || "red" };
  if (value >= 35) return { label: "Sensitive", color: color || "orange" };
  if (value >= 12) return { label: "Moderate", color: color || "amber" };
  return { label: "Good", color: color || "green" };
}
function beaufort(mph) {
  if (mph == null) return null;
  const s = Number(mph);
  if (!Number.isFinite(s)) return null;
  if (s < 1) return 0;
  if (s < 4) return 1;
  if (s < 8) return 2;
  if (s < 13) return 3;
  if (s < 19) return 4;
  if (s < 25) return 5;
  if (s < 32) return 6;
  if (s < 39) return 7;
  if (s < 47) return 8;
  if (s < 55) return 9;
  if (s < 64) return 10;
  if (s < 73) return 11;
  return 12;
}
function applyPrefix(config, previousPrefix) {
  const prefix = (config.prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  const prev = "".trim().replace(/^sensor\./, "").replace(/_+$/, "");
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
function entityState(hass, entityId) {
  if (!hass || !entityId) return null;
  return hass.states[entityId] || null;
}
function unitOf(st) {
  return st?.attributes?.unit_of_measurement || "";
}
function relativeTime(date, locale) {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1e3);
  const abs = Math.abs(diffSec);
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });
  if (abs < 45) return rtf.format(0, "second");
  if (abs < 90) return rtf.format(Math.sign(diffSec) || -1, "minute");
  if (abs < 3600) return rtf.format(Math.round(diffSec / 60), "minute");
  if (abs < 3600 * 36) return rtf.format(Math.round(diffSec / 3600), "hour");
  if (abs < 86400 * 14) return rtf.format(Math.round(diffSec / 86400), "day");
  if (abs < 86400 * 60) return rtf.format(Math.round(diffSec / (86400 * 7)), "week");
  return rtf.format(Math.round(diffSec / (86400 * 30)), "month");
}
function formatLastRain(st, hass) {
  const raw = st?.state;
  if (!raw || raw === "unknown" || raw === "unavailable") return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  const locale = hass?.locale?.language || void 0;
  try {
    return relativeTime(date, locale);
  } catch {
    return date.toLocaleString();
  }
}
function entityAgeMs(st) {
  if (!st) return null;
  const raw = st.last_updated || st.last_changed;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? Date.now() - t : null;
}
function batteryInfo(st, threshold) {
  if (!st) return null;
  const n = num(st.state);
  if (n != null) {
    const limit = threshold == null || threshold === "" ? 20 : Number(threshold);
    const low2 = Number.isFinite(limit) && n <= limit;
    const pct = `${Math.round(n)}%`;
    return {
      low: low2,
      text: low2 ? `Low Battery · ${pct}` : `Station battery ${pct}`,
      icon: low2 ? "mdi:battery-alert" : "mdi:battery"
    };
  }
  const low = st.state === "on";
  return { low, text: low ? "Low Battery" : "Station battery OK", icon: low ? "mdi:battery-alert" : "mdi:battery" };
}
function mergeThresholds(config, key) {
  const extra = config?.thresholds?.[key];
  const base = DEFAULT_THRESHOLDS[key] || [];
  if (!extra || !extra.length) return base;
  const filtered = base.filter((b) => {
    return !extra.some((e) => {
      if (!e || e.color !== b.color) return false;
      if (e.above != null && b.above != null) return true;
      if (e.below != null && b.below != null) return true;
      return false;
    });
  });
  return [...extra, ...filtered];
}
function unitKind(unit) {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "c"].includes(u)) return "temp";
  if (["mph", "km/h", "kmh", "kph", "m/s", "m/sec"].includes(u)) return "speed";
  if (["in", "mm", "in/h", "in/hr", "mm/h", "mm/hr"].includes(u)) return u.includes("/") ? "rate" : "rain";
  if (["inhg", "hpa", "mbar", "mb"].includes(u)) return "pressure";
  return null;
}
function sourceSystem(unit) {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "mph", "in", "in/h", "in/hr", "inhg"].includes(u)) return "imperial";
  if (["c", "km/h", "kmh", "kph", "m/s", "m/sec", "mm", "mm/h", "mm/hr", "hpa", "mbar", "mb"].includes(u)) return "metric";
  return null;
}
function convertValue(value, unit, target) {
  if (value == null || !target || target === "native") return { value, unit: unit || "" };
  const kind = unitKind(unit);
  const from = sourceSystem(unit);
  if (!kind || !from || from === target) {
    if (target === "metric" && kind === "temp") return { value, unit: "°C" };
    if (target === "imperial" && kind === "temp") return { value, unit: "°F" };
    return { value, unit: unit || "" };
  }
  if (kind === "temp") {
    return target === "metric" ? { value: (value - 32) * (5 / 9), unit: "°C" } : { value: value * (9 / 5) + 32, unit: "°F" };
  }
  if (kind === "speed") {
    if (from === "imperial" && target === "metric") return { value: value * 1.60934, unit: "km/h" };
    if (from === "metric") {
      const mph = String(unit).toLowerCase().includes("m/s") ? value * 2.23694 : value / 1.60934;
      return { value: mph, unit: "mph" };
    }
  }
  if (kind === "rain") {
    return target === "metric" ? { value: value * 25.4, unit: "mm" } : { value: value / 25.4, unit: "in" };
  }
  if (kind === "rate") {
    return target === "metric" ? { value: value * 25.4, unit: "mm/h" } : { value: value / 25.4, unit: "in/h" };
  }
  if (kind === "pressure") {
    return target === "metric" ? { value: value * 33.8639, unit: "hPa" } : { value: value / 33.8639, unit: "inHg" };
  }
  return { value, unit: unit || "" };
}
function pressureTrendMeta(current, previous) {
  if (current == null || previous == null) return { label: "", icon: "mdi:minus", color: "grey" };
  const delta = current - previous;
  if (Math.abs(delta) < 0.02) return { label: "Steady", icon: "mdi:arrow-right", color: "grey" };
  if (delta > 0) return { label: "Rising", icon: "mdi:arrow-top-right", color: "green" };
  return { label: "Falling", icon: "mdi:arrow-bottom-right", color: "orange" };
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
function esc(s) {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}
function thresholdCompareValue(raw, unit) {
  if (raw == null) return null;
  const kind = unitKind(unit);
  const from = sourceSystem(unit);
  if (!kind || !from || from === "imperial") return raw;
  if (kind === "temp") return raw * (9 / 5) + 32;
  if (kind === "speed") {
    return String(unit).toLowerCase().includes("m/s") ? raw * 2.23694 : raw / 1.60934;
  }
  return raw;
}
function aqiMeta(value, color) {
  if (value == null) return { label: "AQI", color: color || "grey" };
  if (value >= 150) return { label: "Unhealthy", color: color || "red" };
  if (value >= 100) return { label: "Sensitive", color: color || "orange" };
  if (value >= 50) return { label: "Moderate", color: color || "amber" };
  return { label: "Good", color: color || "green" };
}
function moonMeta(state) {
  const raw = String(state || "").trim().toLowerCase().replace(/\s+/g, "_");
  const icon = MOON_ICONS[raw] || "mdi:moon-waning-crescent";
  const label = raw ? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Moon";
  return { label, icon };
}
function daysSinceTimestamp(raw) {
  if (!raw || raw === "unknown" || raw === "unavailable") return null;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, (Date.now() - t) / 864e5);
}
function rainMonthProgress(monthValue, normal) {
  if (monthValue == null || normal == null || normal <= 0) return { pct: null, label: "" };
  const pct = Math.min(999, Math.round(monthValue / normal * 100));
  return { pct, label: `${pct}% of normal` };
}
function alertSeverityColor(severity) {
  const key = String(severity || "unknown").toLowerCase();
  return ALERT_SEVERITY_COLOR[key] || ALERT_SEVERITY_COLOR.unknown;
}
function collectAlerts(weather, alertEntity) {
  const out = [];
  const fromWeather = weather?.attributes?.alerts;
  if (Array.isArray(fromWeather)) {
    for (const a of fromWeather) {
      if (a && (a.title || a.event || a.description)) out.push(a);
    }
  }
  if (alertEntity && available(alertEntity)) {
    const state = String(alertEntity.state || "");
    const attrs = alertEntity.attributes || {};
    const active = state !== "off" && state !== "unavailable" && state !== "unknown" && state !== "none";
    if (active) {
      out.push({
        title: String(attrs.friendly_name || attrs.event || state),
        event: String(attrs.event || state),
        description: String(attrs.description || attrs.message || ""),
        severity: String(attrs.severity || (state === "on" ? "moderate" : state)),
        sender: String(attrs.attribution || attrs.sender || "")
      });
    }
  }
  return out;
}
function historyLineSpark(points, width = 64, height = 22) {
  if (!points.length) return "";
  const vals = points.map((p) => p.state).filter((v) => Number.isFinite(v));
  if (!vals.length) return "";
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(0.01, max - min);
  const step = points.length === 1 ? width : width / (points.length - 1);
  const coords = points.map((p, i) => {
    const x = i * step;
    const y = height - (p.state - min) / span * (height - 2) - 1;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");
  return `<svg class="hist-spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" points="${coords}"/></svg>`;
}
function windRoseBins(degrees) {
  const counts = new Array(WIND_ROSE_LABELS.length).fill(0);
  for (const deg of degrees) {
    if (!Number.isFinite(deg)) continue;
    const idx = Math.round((deg % 360 + 360) % 360 / 45) % WIND_ROSE_LABELS.length;
    counts[idx]++;
  }
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return WIND_ROSE_LABELS.map((label, i) => ({
    label,
    deg: i * 45,
    count: counts[i],
    share: counts[i] / total
  }));
}
function windRoseSvg(bins, size = 96) {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.4;
  const maxShare = Math.max(...bins.map((b) => b.share), 0.01);
  const petals = bins.filter((b) => b.count > 0).map((b) => {
    const r = Math.max(10, b.share / maxShare * maxR);
    const rad = (b.deg - 90) * Math.PI / 180;
    const x = cx + Math.cos(rad) * r;
    const y = cy + Math.sin(rad) * r;
    const opacity = 0.45 + b.share / maxShare * 0.55;
    return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="currentColor" stroke-width="7" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>`;
  }).join("");
  return `<svg class="wind-rose-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="${maxR}" fill="none" stroke="currentColor" stroke-opacity="0.16"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR * 0.5}" fill="none" stroke="currentColor" stroke-opacity="0.1"/>
    ${petals}
    <circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>
    <text x="${cx}" y="12" text-anchor="middle" font-size="9" fill="currentColor">N</text>
  </svg>`;
}
function formatSunTime(iso, locale) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  } catch {
    return d.toLocaleTimeString();
  }
}
function downsampleHistory(points, maxPoints = 36) {
  if (points.length <= maxPoints) return points;
  const out = [];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.round(i * step)]);
  }
  return out;
}
const CARD_STYLES = `
  :host {
    display: block;
    --mws-radius: var(--ha-card-border-radius, 14px);
    --mws-radius-sm: calc(var(--mws-radius) - 4px);
    --mws-gap: 8px;
    --mws-pad: 14px;
    --mws-primary: var(--primary-color, #03a9f4);
    --mws-accent: var(--accent-color, var(--primary-color, #03a9f4));
    --mws-surface: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    --mws-surface-strong: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    --mws-border: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
    --mws-chip-bg: color-mix(in srgb, var(--mws-primary) 10%, var(--ha-card-background, var(--card-background-color)));
  }
  ha-card {
    padding: var(--mws-pad) var(--mws-pad) 10px;
    background: var(--ha-card-background, var(--card-background-color));
    overflow: hidden;
    border-radius: var(--mws-radius);
  }
  ha-card.compact {
    padding: 10px 10px 8px;
    --mws-gap: 6px;
    --mws-pad: 10px;
  }
  ha-card.chips-layout {
    padding: 10px 12px;
  }
  ha-card.stale {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--warning-color, #ff9800) 70%, transparent);
  }

  .alerts {
    display: grid;
    gap: 6px;
    margin: 0 0 10px;
  }
  .alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--mws-radius-sm);
    border: 1px solid transparent;
    font-size: 12.5px;
    line-height: 1.35;
    cursor: pointer;
    text-align: left;
    width: 100%;
    color: inherit;
    background: var(--mws-surface);
  }
  .alert.sev-red {
    background: color-mix(in srgb, var(--error-color, #f44336) 14%, transparent);
    border-color: color-mix(in srgb, var(--error-color, #f44336) 40%, transparent);
  }
  .alert.sev-orange {
    background: color-mix(in srgb, var(--orange-color, #ff9800) 14%, transparent);
    border-color: color-mix(in srgb, var(--orange-color, #ff9800) 40%, transparent);
  }
  .alert.sev-amber {
    background: color-mix(in srgb, var(--warning-color, #ffc107) 14%, transparent);
    border-color: color-mix(in srgb, var(--warning-color, #ffc107) 40%, transparent);
  }
  .alert.sev-blue {
    background: color-mix(in srgb, var(--info-color, var(--blue-color, #2196f3)) 14%, transparent);
    border-color: color-mix(in srgb, var(--blue-color, #2196f3) 35%, transparent);
  }
  .alert-title { font-weight: 700; }
  .alert-desc {
    color: var(--secondary-text-color);
    margin-top: 2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 2px 2px 10px;
  }
  ha-card.compact .header { padding: 0 0 6px; }
  .header-main { min-width: 0; flex: 1; }
  .title {
    font-weight: 650;
    font-size: 15px;
    letter-spacing: 0.01em;
    color: var(--primary-text-color);
    line-height: 1.25;
  }
  ha-card.compact .title { font-size: 13.5px; }
  .subtitle {
    font-size: 12.5px;
    color: var(--secondary-text-color);
    margin-top: 3px;
    line-height: 1.35;
  }
  .status-chip {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--mws-surface);
    color: var(--secondary-text-color);
    border: 1px solid var(--mws-border);
    white-space: nowrap;
  }
  .status-chip.warn {
    color: var(--warning-color, #ff9800);
    border-color: color-mix(in srgb, var(--warning-color, #ff9800) 35%, transparent);
    background: color-mix(in srgb, var(--warning-color, #ff9800) 12%, transparent);
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--success-color, #4caf50);
  }
  .status-chip.warn .status-dot { background: var(--warning-color, #ff9800); }

  .hero {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    border: 0;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--mws-primary) 14%, transparent),
      var(--mws-surface-strong) 55%,
      transparent
    );
    color: inherit;
    text-align: left;
    padding: 12px 12px 14px;
    margin: 0 0 6px;
    border-radius: var(--mws-radius);
    cursor: pointer;
    transition: background 140ms ease;
  }
  .hero:hover { background: var(--mws-surface-strong); }
  ha-card.compact .hero { padding: 8px 10px 10px; gap: 10px; margin-bottom: 4px; }
  .hero-icon { --mdc-icon-size: 38px; }
  ha-card.compact .hero-icon { --mdc-icon-size: 28px; }
  .hero-text { flex: 1; min-width: 0; }
  .hero-primary {
    font-size: 34px;
    font-weight: 650;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  ha-card.compact .hero-primary { font-size: 26px; }
  .hero-secondary {
    font-size: 12.5px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .hero-spark {
    color: var(--mws-accent);
    opacity: 0.9;
  }

  .section {
    margin-top: 4px;
    padding-top: 8px;
  }
  .section + .section {
    border-top: 1px solid var(--mws-border);
    margin-top: 10px;
    padding-top: 10px;
  }
  .section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0 4px 8px;
    color: var(--secondary-text-color);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--mws-gap);
  }
  ha-card.compact .grid { gap: 5px; }
  .wind-row {
    display: grid;
    grid-template-columns: 108px 1fr;
    gap: 10px;
    align-items: center;
  }
  .wind-row.with-rose {
    grid-template-columns: 96px 96px 1fr;
  }
  .wind-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  .compass, .wind-rose {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    color: var(--primary-text-color);
    padding: 6px;
    border-radius: var(--mws-radius);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .compass-svg, .wind-rose-svg { width: 88px; height: 88px; }
  ha-card.compact .compass-svg,
  ha-card.compact .wind-rose-svg { width: 68px; height: 68px; }
  .compass-svg.muted { opacity: 0.45; }
  .compass-label, .wind-rose-label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--secondary-text-color);
    margin-top: 2px;
    text-align: center;
  }
  .wind-rose { color: var(--mws-primary); }

  .spark {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 58px;
    padding: 6px 8px 2px;
    margin-bottom: 8px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    height: 100%;
  }
  .bar {
    width: 100%;
    max-width: 26px;
    border-radius: 5px 5px 2px 2px;
    background: var(--disabled-text-color);
    opacity: 0.28;
  }
  .bar.on {
    background: linear-gradient(180deg, var(--cyan-color, #00bcd4), color-mix(in srgb, var(--cyan-color, #00bcd4) 60%, var(--mws-primary)));
    opacity: 1;
  }
  .bar-lab {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .rain-goal {
    display: grid;
    gap: 6px;
    padding: 10px 12px;
    margin-bottom: 8px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .rain-goal-top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
  }
  .rain-goal-track {
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    overflow: hidden;
  }
  .rain-goal-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--cyan-color, #00bcd4), var(--mws-primary));
    transition: width 200ms ease;
  }
  .rain-goal-meta {
    font-size: 11.5px;
    color: var(--secondary-text-color);
  }

  .forecast {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 2px 0 4px;
    scrollbar-width: thin;
  }
  .forecast.hourly { margin-bottom: 8px; }
  .fday, .fhour {
    flex: 1;
    min-width: 68px;
    text-align: center;
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
    border-radius: var(--mws-radius-sm);
    padding: 10px 6px 8px;
    cursor: pointer;
    transition: background 140ms ease, border-color 140ms ease;
  }
  .fhour { min-width: 56px; padding: 8px 4px; }
  .fday:hover, .fhour:hover {
    background: var(--mws-surface-strong);
    border-color: color-mix(in srgb, var(--mws-primary) 35%, transparent);
  }
  .fday-name, .fhour-name {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .fday ha-icon, .fhour ha-icon { --mdc-icon-size: 22px; margin: 6px 0; }
  .fhour ha-icon { --mdc-icon-size: 18px; margin: 4px 0; }
  .fday-temp, .fhour-temp { font-size: 12.5px; font-weight: 650; }
  .fday-pop, .fhour-pop {
    font-size: 11px;
    font-weight: 600;
    color: var(--cyan-color, #00bcd4);
    margin-top: 3px;
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--mws-border);
    background: var(--mws-surface);
    border-radius: var(--mws-radius-sm);
    padding: 11px 6px 9px;
    color: inherit;
    cursor: pointer;
    min-height: 86px;
    transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
  }
  .tile:hover:not([disabled]) {
    background: var(--mws-surface-strong);
    border-color: color-mix(in srgb, var(--mws-primary) 35%, transparent);
  }
  ha-card.compact .tile {
    padding: 7px 4px 6px;
    gap: 3px;
    min-height: 64px;
  }
  .tile[disabled] { opacity: 0.42; cursor: default; }
  .tile ha-icon { --mdc-icon-size: 20px; }
  ha-card.compact .tile ha-icon { --mdc-icon-size: 17px; }
  .tile-value {
    font-weight: 650;
    font-size: 13.5px;
    text-align: center;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }
  ha-card.compact .tile-value { font-size: 12px; }
  .tile-label {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-align: center;
    line-height: 1.2;
  }
  .tile .hist-spark {
    color: var(--mws-accent);
    margin-top: 2px;
  }

  .chips-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .chips {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 2px;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .chips.wrap { flex-wrap: wrap; }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--mws-border);
    border-radius: 999px;
    padding: 8px 12px;
    background: var(--mws-chip-bg);
    color: inherit;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 600;
    transition: background 140ms ease, border-color 140ms ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .chip:hover {
    background: color-mix(in srgb, var(--mws-primary) 18%, transparent);
    border-color: color-mix(in srgb, var(--mws-primary) 40%, transparent);
  }
  .chip ha-icon { --mdc-icon-size: 16px; color: var(--mws-primary); }
  .chip.expand {
    margin-left: auto;
    background: transparent;
  }
  .chips-extra {
    display: none;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 2px 2px;
  }
  .chips-bar.expanded .chips-extra { display: flex; }
  .chips-bar.expanded .chip.expand ha-icon { transform: rotate(180deg); }

  .battery {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    padding: 10px 8px 4px;
    cursor: pointer;
  }
  .battery.ok { color: var(--success-color, #4caf50); }
  .battery.warn { color: var(--error-color, #f44336); }

  .hint {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding: 10px 4px 2px;
    line-height: 1.4;
  }

  @media (max-width: 520px) {
    .grid, .wind-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .wind-row, .wind-row.with-rose { grid-template-columns: 1fr; }
    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .header-main {
      flex: none;
      width: 100%;
      min-width: 0;
    }
    .status-chip {
      width: fit-content;
      max-width: 100%;
    }
  }
`;
const CARD_VERSION = "0.7.0";
const _MushroomWeatherStationCard = class _MushroomWeatherStationCard extends HTMLElement {
  constructor() {
    super(...arguments);
    this._forecastSubId = null;
    this._forecastUnsub = null;
    this._hourlyUnsub = null;
    this._forecastDays = [];
    this._forecastHours = [];
    this._forecastError = null;
    this._forecastToken = 0;
    this._renderSignature = null;
    this._staleTimer = null;
    this._prevPressure = null;
    this._pressureSample = null;
    this._history = {};
    this._historyToken = 0;
    this._historyFetchedAt = 0;
    this._historyPending = false;
    this._forecastFetchedKey = null;
    this._chipsExpanded = false;
  }
  static getStubConfig() {
    return {
      prefix: "ws",
      layout: "full",
      name: "Weather Station",
      unit_system: "native",
      show_hourly_forecast: true,
      show_history_sparklines: true,
      show_wind_rose: true,
      show_alerts: true
    };
  }
  static async getConfigElement() {
    if (!customElements.get(`${CARD_TYPE}-editor`)) {
      await import(
        /* @vite-ignore */
        `./mushroom-weather-station-card-editor.js?v=${CARD_VERSION}`
      );
    }
    return document.createElement(`${CARD_TYPE}-editor`);
  }
  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    this._config = applyPrefix({
      layout: "full",
      name: "Weather Station",
      unit_system: "native",
      entities: {},
      labels: {},
      units: {},
      actions: {},
      thresholds: {},
      show_updated: true,
      show_history_sparklines: true,
      show_wind_rose: true,
      show_alerts: true,
      // Hourly follows weather_entity when unset (see _wantHourly).
      stale_minutes: 30,
      forecast_days: 5,
      hourly_forecast_hours: 24,
      history_hours: 24,
      show_beaufort: false,
      sun_entity: "sun.sun",
      ...config,
      section_order: normalizeSectionOrder(config.section_order ?? DEFAULT_SECTION_ORDER)
    });
    this._forecastSubId = null;
    this._forecastFetchedKey = null;
    this._forecastToken++;
    this._historyToken++;
    this._history = {};
    this._historyFetchedAt = 0;
    this._historyPending = false;
    this._renderSignature = null;
    void this._ensureForecastSub();
    void this._ensureHistory();
    this._render(true);
  }
  set hass(hass) {
    this._hass = hass;
    void this._ensureForecastSub();
    void this._ensureHistory();
    this._render(false);
  }
  get hass() {
    return this._hass;
  }
  disconnectedCallback() {
    this._forecastToken++;
    this._historyToken++;
    this._forecastSubId = null;
    this._forecastFetchedKey = null;
    if (this._forecastUnsub) {
      try {
        this._forecastUnsub();
      } catch {
      }
      this._forecastUnsub = null;
    }
    if (this._hourlyUnsub) {
      try {
        this._hourlyUnsub();
      } catch {
      }
      this._hourlyUnsub = null;
    }
    if (this._staleTimer) {
      window.clearInterval(this._staleTimer);
      this._staleTimer = null;
    }
  }
  getCardSize() {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return this._chipsExpanded ? 3 : 1;
    if (layout === "compact") return 5;
    return 10;
  }
  getGridOptions() {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return { columns: 12, rows: this._chipsExpanded ? 3 : 1 };
    if (layout === "compact") return { columns: 12, rows: 5 };
    return { columns: 12, rows: 9 };
  }
  _st(key) {
    return entityState(this._hass, this._config?.entities?.[key]);
  }
  _label(key, fallback) {
    return this._config?.labels?.[key] || fallback;
  }
  _conv(st, fallbackUnit = "") {
    const raw = num(st?.state);
    const src = this._config?.units_source?.[st?.entity_id || ""] || unitOf(st) || fallbackUnit;
    const target = this._config?.unit_system || "native";
    const out = convertValue(raw, src || fallbackUnit, target);
    return { raw, ...out, src };
  }
  _unitStr(key, st, fallback = "") {
    return this._config?.units?.[key] || this._conv(st, fallback).unit || fallback;
  }
  _fmt(key, st, digits, fallbackUnit = "") {
    const c = this._conv(st, fallbackUnit);
    if (c.value == null) return "—";
    const unit = this._config?.units?.[key] || c.unit || fallbackUnit;
    return `${fmtNum(c.value, digits)}${unit ? ` ${unit}` : ""}`.trim();
  }
  _color(key, value, fallback = "grey", unit = "") {
    const compare = unit ? thresholdCompareValue(value, unit) : value;
    return colorFromThresholds(compare, mergeThresholds(this._config, key), fallback);
  }
  _sectionVisible(hideKey, states) {
    if (this._config?.[hideKey]) return false;
    if (this._config?.show_empty) return true;
    return states.some((st) => available(st));
  }
  _watchedSignature() {
    const entities = this._config?.entities || {};
    const ids = Object.values(entities).filter(Boolean);
    if (this._config?.weather_entity) ids.push(this._config.weather_entity);
    if (this._config?.alert_entity) ids.push(this._config.alert_entity);
    if (this._config?.sun_entity) ids.push(this._config.sun_entity);
    if (this._config?.moon_entity) ids.push(this._config.moon_entity);
    const parts = ids.map((id) => {
      const st = this._hass?.states?.[id];
      if (!st) return `${id}:missing`;
      return `${id}:${st.state}:${st.last_updated || ""}`;
    });
    parts.push(
      `cfg:${this._config?.layout}|${this._config?.unit_system}|${this._config?.show_forecast}|${this._config?.show_hourly_forecast}|${this._config?.forecast_days}|${this._config?.hourly_forecast_hours}|${this._config?.show_updated}|${this._config?.stale_minutes}|${this._config?.show_beaufort}|${this._config?.show_history_sparklines}|${this._config?.show_wind_rose}|${this._config?.show_alerts}|${this._config?.rain_month_normal}|${(this._config?.section_order || []).join(",")}|chips:${this._chipsExpanded}`
    );
    parts.push(`fc:${(this._forecastDays || []).length}:${(this._forecastHours || []).length}:${this._forecastError || ""}`);
    parts.push(`hist:${Object.keys(this._history).map((k) => `${k}:${this._history[k]?.length || 0}`).join(",")}`);
    return parts.join("|");
  }
  _handleAction(actionCfg, entityId) {
    const action = actionCfg?.action || "more-info";
    if (action === "none") return;
    if (action === "more-info" || !actionCfg) {
      if (!entityId) return;
      this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId } }));
      return;
    }
    if (action === "navigate" && actionCfg.navigation_path) {
      window.history.pushState(null, "", actionCfg.navigation_path);
      window.dispatchEvent(new CustomEvent("location-changed", { bubbles: true, composed: true, detail: { replace: false } }));
      return;
    }
    if (action === "url" && actionCfg.url_path) {
      window.open(actionCfg.url_path, actionCfg.new_tab === false ? "_self" : "_blank");
      return;
    }
    if (action === "call-service" && actionCfg.service && this._hass) {
      const [domain, service] = actionCfg.service.split(".", 2);
      this._hass.callService(domain, service, actionCfg.service_data || actionCfg.data || {});
    }
  }
  _bindTile(el, key, entityId) {
    const acts = this._config?.actions?.[key] || {};
    const tablet = !!this._config?.tablet_mode;
    const tap = acts.tap_action || (tablet ? { action: "none" } : { action: "more-info" });
    const hold = acts.hold_action || (tablet ? { action: "more-info" } : null);
    const dbl = acts.double_tap_action;
    let holdTimer = null;
    let held = false;
    el.addEventListener("click", (ev) => {
      ev.preventDefault();
      if (held) {
        held = false;
        return;
      }
      if (key === "__chips_expand") {
        this._chipsExpanded = !this._chipsExpanded;
        this._renderSignature = null;
        this._render(true);
        return;
      }
      this._handleAction(tap, entityId);
    });
    el.addEventListener("dblclick", (ev) => {
      if (!dbl) return;
      ev.preventDefault();
      this._handleAction(dbl, entityId);
    });
    el.addEventListener("pointerdown", () => {
      if (!hold) return;
      held = false;
      holdTimer = window.setTimeout(() => {
        held = true;
        this._handleAction(hold, entityId);
      }, 500);
    });
    const clear = () => {
      if (holdTimer) window.clearTimeout(holdTimer);
      holdTimer = null;
    };
    el.addEventListener("pointerup", clear);
    el.addEventListener("pointerleave", clear);
  }
  _compass(deg, card) {
    const angle = Number.isFinite(deg) ? deg : 0;
    const muted = !Number.isFinite(deg);
    return `
      <div class="compass" data-key="wind_direction" data-entity="${esc(this._st("wind_direction")?.entity_id || "")}">
        <svg viewBox="0 0 100 100" class="compass-svg ${muted ? "muted" : ""}" aria-hidden="true">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="2"/>
          <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="1"/>
          <circle cx="50" cy="50" r="3" fill="currentColor"/>
          <text x="50" y="16" text-anchor="middle" font-size="9" fill="currentColor">N</text>
          <text x="50" y="94" text-anchor="middle" font-size="9" fill="currentColor">S</text>
          <text x="10" y="54" text-anchor="middle" font-size="9" fill="currentColor">W</text>
          <text x="90" y="54" text-anchor="middle" font-size="9" fill="currentColor">E</text>
          <g transform="rotate(${angle} 50 50)">
            <polygon points="50,12 55,48 50,42 45,48" fill="${iconColorVar("teal")}"/>
          </g>
        </svg>
        <div class="compass-label">${card || "—"} ${Number.isFinite(deg) ? `${Math.round(deg)}°` : ""}</div>
      </div>
    `;
  }
  _sparkline(items) {
    const vals = items.map((i) => i.value).filter((v) => v != null && v >= 0);
    const max = Math.max(...vals, 0.01);
    const bars = items.map((i) => {
      const h = i.value == null ? 2 : Math.max(4, Math.round(i.value / max * 36));
      const on = i.value != null && i.value > 0;
      return `<div class="bar-col"><div class="bar ${on ? "on" : ""}" style="height:${h}px"></div><div class="bar-lab">${esc(i.label)}</div></div>`;
    }).join("");
    return `<div class="spark">${bars}</div>`;
  }
  _histSpark(key) {
    if (this._config?.show_history_sparklines === false) return "";
    const pts = this._history[key];
    if (!pts?.length) return "";
    return historyLineSpark(downsampleHistory(pts));
  }
  _trackPressure(value) {
    if (value == null) return pressureTrendMeta(null, null);
    if (this._prevPressure == null || Math.abs((this._prevPressure ?? 0) - value) > 1e-4) {
      if (this._pressureSample != null && Math.abs(this._pressureSample - value) > 1e-4) {
        this._prevPressure = this._pressureSample;
      }
      this._pressureSample = value;
    }
    return pressureTrendMeta(value, this._prevPressure);
  }
  _ensureStaleTimer() {
    if (this._config?.show_updated === false) {
      if (this._staleTimer) {
        window.clearInterval(this._staleTimer);
        this._staleTimer = null;
      }
      return;
    }
    if (this._staleTimer) return;
    this._staleTimer = window.setInterval(() => {
      this._renderSignature = null;
      this._render(true);
    }, 6e4);
  }
  async _fetchForecastType(id, forecastType, token) {
    try {
      if (this._hass?.connection?.subscribeMessage && forecastType === "daily") {
      }
      const result = await this._hass?.connection?.sendMessagePromise?.({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        service_data: { type: forecastType, entity_id: id },
        return_response: true
      });
      if (token !== this._forecastToken) return [];
      return result?.response?.[id]?.forecast || [];
    } catch {
      return [];
    }
  }
  _wantHourly() {
    if (!this._config?.weather_entity) return false;
    if (this._config.show_hourly_forecast === false) return false;
    if (this._config.show_hourly_forecast === true) return true;
    return true;
  }
  async _ensureForecastSub() {
    const wantDaily = !!this._config?.show_forecast;
    const wantHourly = this._wantHourly();
    const id = wantDaily || wantHourly ? this._config?.weather_entity : null;
    if (!id || !this._hass) {
      if (this._forecastUnsub) {
        try {
          this._forecastUnsub();
        } catch {
        }
        this._forecastUnsub = null;
      }
      if (this._hourlyUnsub) {
        try {
          this._hourlyUnsub();
        } catch {
        }
        this._hourlyUnsub = null;
      }
      this._forecastSubId = null;
      return;
    }
    const subKey = `${id}|d:${wantDaily ? 1 : 0}|h:${wantHourly ? 1 : 0}`;
    if (this._forecastSubId === subKey) {
      const canSubscribe = !!this._hass.connection?.subscribeMessage;
      if (canSubscribe) {
        const dailyReady = !wantDaily || !!this._forecastUnsub;
        const hourlyReady = !wantHourly || !!this._hourlyUnsub;
        if (dailyReady && hourlyReady) return;
      } else if (this._forecastFetchedKey === subKey) {
        return;
      }
    }
    if (this._forecastUnsub) {
      try {
        this._forecastUnsub();
      } catch {
      }
      this._forecastUnsub = null;
    }
    if (this._hourlyUnsub) {
      try {
        this._hourlyUnsub();
      } catch {
      }
      this._hourlyUnsub = null;
    }
    this._forecastSubId = subKey;
    const token = ++this._forecastToken;
    this._forecastDays = [];
    this._forecastHours = [];
    this._forecastError = null;
    const attrDays = entityState(this._hass, id)?.attributes?.forecast;
    if (Array.isArray(attrDays) && attrDays.length) this._forecastDays = attrDays;
    if (wantDaily) {
      try {
        if (this._hass.connection?.subscribeMessage) {
          const unsub = await this._hass.connection.subscribeMessage(
            (ev) => {
              if (token !== this._forecastToken) return;
              this._forecastDays = ev?.forecast || [];
              this._forecastError = this._forecastDays.length ? null : "empty";
              this._renderSignature = null;
              this._render(true);
            },
            { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: id }
          );
          if (token !== this._forecastToken) {
            try {
              unsub();
            } catch {
            }
          } else {
            this._forecastUnsub = unsub;
          }
        }
      } catch {
      }
    }
    if (wantHourly) {
      try {
        if (this._hass.connection?.subscribeMessage) {
          const unsub = await this._hass.connection.subscribeMessage(
            (ev) => {
              if (token !== this._forecastToken) return;
              this._forecastHours = ev?.forecast || [];
              this._renderSignature = null;
              this._render(true);
            },
            { type: "weather/subscribe_forecast", forecast_type: "hourly", entity_id: id }
          );
          if (token !== this._forecastToken) {
            try {
              unsub();
            } catch {
            }
          } else {
            this._hourlyUnsub = unsub;
          }
        }
      } catch {
      }
    }
    if (!this._forecastDays.length && wantDaily) {
      const days = await this._fetchForecastType(id, "daily", token);
      if (token !== this._forecastToken) return;
      if (days.length) {
        this._forecastDays = days;
        this._forecastError = null;
      } else if (!this._forecastDays.length) {
        this._forecastError = "empty";
      }
    }
    if (!this._forecastHours.length && wantHourly) {
      const hours = await this._fetchForecastType(id, "hourly", token);
      if (token !== this._forecastToken) return;
      if (hours.length) this._forecastHours = hours;
    }
    if (token === this._forecastToken) {
      if (!this._hass.connection?.subscribeMessage) this._forecastFetchedKey = subKey;
    }
    this._renderSignature = null;
    this._render(true);
  }
  _historyHours() {
    return Math.min(48, Math.max(6, Number(this._config?.history_hours) || 24));
  }
  async _ensureHistory() {
    if (!this._hass || !this._config) return;
    const needSparks = this._config.show_history_sparklines !== false;
    const needRose = this._config.show_wind_rose !== false;
    if (!needSparks && !needRose) return;
    if (this._historyPending) return;
    if (this._historyFetchedAt && Date.now() - this._historyFetchedAt < 5 * 60 * 1e3) return;
    this._historyPending = true;
    const token = ++this._historyToken;
    const hours = this._historyHours();
    const end = /* @__PURE__ */ new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1e3);
    const entityIds = [];
    const keyById = {};
    if (needSparks) {
      for (const key of HISTORY_SPARK_KEYS) {
        const id = this._config.entities?.[key];
        if (id) {
          entityIds.push(id);
          keyById[id] = key;
        }
      }
    }
    if (needRose) {
      const dirId = this._config.entities?.wind_direction;
      if (dirId) {
        entityIds.push(dirId);
        keyById[dirId] = "wind_direction";
      }
    }
    const unique = [...new Set(entityIds)];
    if (!unique.length) return;
    try {
      let raw;
      if (this._hass.connection?.sendMessagePromise) {
        raw = await this._hass.connection.sendMessagePromise({
          type: "history/history_during_period",
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          significant_changes_only: false,
          minimal_response: true,
          no_attributes: true,
          entity_ids: unique
        });
      } else if (this._hass.callApi) {
        raw = await this._hass.callApi(
          "GET",
          `history/period/${start.toISOString()}?filter_entity_id=${unique.join(",")}&significant_changes_only=0&minimal_response`
        );
      } else {
        return;
      }
      if (token !== this._historyToken) return;
      const next = {};
      const asRecord = raw;
      const parsePoint = (rawState, changed) => {
        let state = num(rawState);
        if (state == null && typeof rawState === "string") {
          const parsed = parseWindDirection({
            entity_id: "",
            state: rawState,
            attributes: {}
          });
          state = parsed.deg;
        }
        const t = typeof changed === "number" ? changed > 1e12 ? changed : changed * 1e3 : changed ? new Date(String(changed)).getTime() : NaN;
        return state == null || !Number.isFinite(t) ? null : { state, last_changed: t };
      };
      if (Array.isArray(asRecord)) {
        for (const series of asRecord) {
          if (!Array.isArray(series) || !series.length) continue;
          const id = series[0]?.entity_id || "";
          const key = keyById[id];
          if (!key) continue;
          next[key] = series.map((p) => parsePoint(p.state, p.last_changed)).filter((p) => !!p);
        }
      } else if (asRecord && typeof asRecord === "object") {
        for (const [id, series] of Object.entries(asRecord)) {
          const key = keyById[id];
          if (!key || !Array.isArray(series)) continue;
          next[key] = series.map((p) => parsePoint(p.s ?? p.state, p.lu ?? p.last_changed)).filter((p) => !!p);
        }
      }
      this._history = next;
      this._historyFetchedAt = Date.now();
      this._renderSignature = null;
      this._render(true);
    } catch {
      if (token === this._historyToken) this._historyFetchedAt = Date.now();
    } finally {
      if (token === this._historyToken) this._historyPending = false;
    }
  }
  _sectionTitle(label, compact) {
    return compact ? "" : `<div class="section-label"><span>${esc(label)}</span></div>`;
  }
  _wrapSection(id, compact, body) {
    if (!body) return "";
    return `<section class="section" data-section="${id}">${this._sectionTitle(SECTION_LABELS[id], compact)}${body}</section>`;
  }
  _tile(key, label, st, value, icon, color, spark = "") {
    if (!st && !this._config?.show_empty) return "";
    const entityId = st?.entity_id || "";
    return `
      <button class="tile" data-key="${esc(key)}" data-entity="${esc(entityId)}" ${entityId ? "" : "disabled"}>
        <ha-icon icon="${icon}" style="color:${iconColorVar(color)}"></ha-icon>
        <div class="tile-value">${esc(String(value))}</div>
        <div class="tile-label">${esc(label)}</div>
        ${spark}
      </button>
    `;
  }
  _alertsHtml() {
    if (this._config?.show_alerts === false) return "";
    const weather = entityState(this._hass, this._config?.weather_entity);
    const alertEnt = entityState(this._hass, this._config?.alert_entity);
    const alerts = collectAlerts(weather, alertEnt).slice(0, 3);
    if (!alerts.length) return "";
    const entityId = this._config?.alert_entity || this._config?.weather_entity || "";
    return `<div class="alerts">${alerts.map((a) => {
      const sev = alertSeverityColor(a.severity);
      const title = a.title || a.event || "Weather alert";
      const desc = a.description || "";
      return `<button class="alert sev-${sev}" data-key="alert" data-entity="${esc(entityId)}">
          <ha-icon icon="mdi:alert" style="color:${iconColorVar(sev)}"></ha-icon>
          <div>
            <div class="alert-title">${esc(title)}</div>
            ${desc ? `<div class="alert-desc">${esc(desc)}</div>` : ""}
          </div>
        </button>`;
    }).join("")}</div>`;
  }
  _chips(temp, feels, humidity, today, wind, pressure, uv, gust, raining) {
    const t = this._conv(temp, "°F");
    const f = this._conv(feels, "°F");
    const primary = [
      { key: "temperature", st: temp, icon: "mdi:thermometer", text: t.value == null ? "—" : `${Math.round(t.value)}°` },
      { key: "feels_like", st: feels, icon: "mdi:sun-thermometer", text: f.value == null ? "—" : `${Math.round(f.value)}°` },
      { key: "humidity", st: humidity, icon: "mdi:water-percent", text: num(humidity?.state) == null ? "—" : `${Math.round(num(humidity?.state))}%` },
      { key: "rain_today", st: today, icon: raining ? "mdi:weather-pouring" : "mdi:weather-rainy", text: this._fmt("rain_today", today, 2, "in") },
      { key: "wind_speed", st: wind, icon: "mdi:weather-windy", text: this._fmt("wind_speed", wind, 0, "mph") }
    ].filter((c) => !!c.st);
    const extra = [
      { key: "pressure", st: pressure, icon: "mdi:gauge", text: this._fmt("pressure", pressure, 2, "inHg") },
      { key: "uv", st: uv, icon: "mdi:weather-sunny-alert", text: num(uv?.state) == null ? "—" : `${fmtNum(num(uv?.state), 0)} UV` },
      { key: "wind_gust", st: gust, icon: "mdi:windsock", text: this._fmt("wind_gust", gust, 0, "mph") }
    ].filter((c) => !!c.st);
    const chipHtml = (c) => `<button class="chip" data-key="${c.key}" data-entity="${esc(c.st.entity_id)}"><ha-icon icon="${c.icon}"></ha-icon><span>${esc(c.text)}</span></button>`;
    return `<div class="chips-bar ${this._chipsExpanded ? "expanded" : ""}">
      <div class="chips">
        ${primary.map(chipHtml).join("")}
        ${extra.length ? `<button class="chip expand" data-key="__chips_expand" data-entity="" title="More"><ha-icon icon="mdi:chevron-down"></ha-icon><span>${this._chipsExpanded ? "Less" : "More"}</span></button>` : ""}
      </div>
      ${extra.length ? `<div class="chips-extra">${extra.map(chipHtml).join("")}</div>` : ""}
    </div>`;
  }
  _hourlyHtml() {
    if (!this._wantHourly()) return "";
    const id = this._config?.weather_entity;
    if (!id) return "";
    const hoursWanted = Math.min(24, Math.max(6, Number(this._config?.hourly_forecast_hours) || 24));
    const hours = (this._forecastHours || []).slice(0, hoursWanted);
    if (!hours.length) return "";
    const st = entityState(this._hass, id);
    const target = this._config?.unit_system || "native";
    const tempUnit = st?.attributes?.temperature_unit || "";
    return `
      <div class="forecast hourly">
        ${hours.map((h) => {
      const when = h.datetime ? new Date(h.datetime) : null;
      const label = when && !Number.isNaN(when.getTime()) ? when.toLocaleTimeString(void 0, { hour: "numeric" }) : "—";
      const temp = h.temperature != null ? convertValue(h.temperature, tempUnit, target) : null;
      const icon = WEATHER_ICONS[h.condition || ""] || "mdi:weather-partly-cloudy";
      const pop = h.precipitation_probability != null ? Math.round(Number(h.precipitation_probability)) : null;
      return `<div class="fhour" data-key="forecast" data-entity="${esc(id)}">
              <div class="fhour-name">${esc(label)}</div>
              <ha-icon icon="${icon}"></ha-icon>
              <div class="fhour-temp">${temp?.value != null ? Math.round(temp.value) : "—"}°</div>
              ${pop != null ? `<div class="fhour-pop">${pop}%</div>` : ""}
            </div>`;
    }).join("")}
      </div>
    `;
  }
  _forecastHtml() {
    const hourly = this._hourlyHtml();
    const showDaily = !!this._config?.show_forecast;
    if (!showDaily && !hourly) return "";
    const id = this._config?.weather_entity;
    if (!id) {
      return `${hourly}<div class="hint">Pick a weather entity for forecast.</div>`;
    }
    const st = entityState(this._hass, id);
    if (!st) return `${hourly}<div class="hint">Weather entity ${esc(id)} is missing.</div>`;
    let daily = "";
    if (showDaily) {
      const daysWanted = Math.min(7, Math.max(1, Number(this._config?.forecast_days) || 5));
      const days = (this._forecastDays || st.attributes.forecast || []).slice(0, daysWanted);
      if (!days.length) {
        daily = `<div class="hint">Waiting for daily forecast from ${esc(id)}…</div>`;
      } else {
        const target = this._config?.unit_system || "native";
        const tempUnit = st.attributes.temperature_unit || "";
        daily = `
          <div class="forecast">
            ${days.map((d) => {
          const when = d.datetime ? new Date(d.datetime) : null;
          const day = when && !Number.isNaN(when.getTime()) ? when.toLocaleDateString(void 0, { weekday: "short" }) : "—";
          const hi = d.temperature != null ? convertValue(d.temperature, tempUnit, target) : null;
          const lo = d.templow != null ? convertValue(d.templow, tempUnit, target) : null;
          const icon = WEATHER_ICONS[d.condition || ""] || "mdi:weather-partly-cloudy";
          const pop = d.precipitation_probability != null ? Math.round(Number(d.precipitation_probability)) : null;
          return `<div class="fday" data-key="forecast" data-entity="${esc(id)}">
                  <div class="fday-name">${esc(day)}</div>
                  <ha-icon icon="${icon}"></ha-icon>
                  <div class="fday-temp">${hi?.value != null ? Math.round(hi.value) : "—"}°${lo?.value != null ? ` / ${Math.round(lo.value)}°` : ""}</div>
                  ${pop != null ? `<div class="fday-pop">${pop}%</div>` : ""}
                </div>`;
        }).join("")}
          </div>
        `;
      }
    }
    return `${hourly}${daily}`;
  }
  _soilTiles() {
    const parts = [];
    for (let i = 1; i <= 8; i++) {
      const mKey = `soil_moisture_${i}`;
      const tKey = `soil_temperature_${i}`;
      const mSt = this._st(mKey);
      const tSt = this._st(tKey);
      parts.push(
        this._tile(
          mKey,
          this._label(mKey, `Soil ${i}`),
          mSt,
          num(mSt?.state) == null ? "—" : `${Math.round(num(mSt?.state))}%`,
          "mdi:water",
          this._color(mKey, num(mSt?.state), "green")
        )
      );
      parts.push(
        this._tile(
          tKey,
          this._label(tKey, `Soil ${i} °`),
          tSt,
          tSt ? `${fmtNum(this._conv(tSt, "°F").value, 1)}°` : "—",
          "mdi:thermometer",
          this._color("temperature", num(tSt?.state), "amber", this._conv(tSt, "°F").src || "°F")
        )
      );
    }
    const leaf = this._st("leaf_wetness");
    parts.push(
      this._tile(
        "leaf_wetness",
        this._label("leaf_wetness", "Leaf wet"),
        leaf,
        num(leaf?.state) == null ? "—" : `${Math.round(num(leaf?.state))}%`,
        "mdi:leaf",
        this._color("leaf_wetness", num(leaf?.state), "cyan")
      )
    );
    return parts.join("");
  }
  _renderSection(id, ctx) {
    const compact = ctx.compact;
    switch (id) {
      case "conditions": {
        if (!ctx.showConditions) return "";
        const body = `<div class="grid">
          ${this._tile("temperature", this._label("temperature", "Outdoor"), ctx.temp, ctx.t.value == null ? "—" : `${fmtNum(ctx.t.value, 1)}${ctx.tempUnit.includes("°") ? ctx.tempUnit : "°"}`, "mdi:thermometer", ctx.tColor, this._histSpark("temperature"))}
          ${this._tile("feels_like", this._label("feels_like", "Feels like"), ctx.feels, ctx.f.value == null ? "—" : `${fmtNum(ctx.f.value, 1)}°`, "mdi:sun-thermometer-outline", this._color("feels_like", ctx.f.raw, ctx.tColor, ctx.f.src))}
          ${this._tile("temp_high", this._label("temp_high", "High"), ctx.high, ctx.hi.value == null ? "—" : `${Math.round(ctx.hi.value)}°`, "mdi:thermometer-high", "orange")}
          ${this._tile("temp_low", this._label("temp_low", "Low"), ctx.low, ctx.lo.value == null ? "—" : `${Math.round(ctx.lo.value)}°`, "mdi:thermometer-low", "blue")}
          ${this._tile("humidity", this._label("humidity", "Humidity"), ctx.humidity, ctx.h == null ? "—" : `${Math.round(ctx.h)}${esc(this._unitStr("humidity", ctx.humidity, "%"))}`, "mdi:water-percent", this._color("humidity", ctx.h, "blue"), this._histSpark("humidity"))}
          ${this._tile("dew_point", this._label("dew_point", "Dew point"), ctx.dew, ctx.d.value == null ? "—" : `${fmtNum(ctx.d.value, 1)}°`, "mdi:molecule", this._color("dew_point", ctx.d.raw, "blue", ctx.d.src))}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "wind": {
        if (!ctx.showWind) return "";
        const rosePts = this._history.wind_direction || [];
        const rose = this._config?.show_wind_rose !== false && rosePts.length ? `<div class="wind-rose" data-key="wind_direction" data-entity="${esc(ctx.wdir?.entity_id || "")}">
              ${windRoseSvg(windRoseBins(rosePts.map((p) => p.state)))}
              <div class="wind-rose-label">${this._historyHours()}h rose</div>
            </div>` : "";
        const body = `<div class="wind-row ${rose ? "with-rose" : ""}">
          ${this._compass(ctx.deg, ctx.card)}
          ${rose}
          <div class="grid wind-grid">
            ${this._tile("wind_speed", this._label("wind_speed", ctx.bf != null ? `Speed · B${ctx.bf}` : "Speed"), ctx.wind, ctx.ws.value == null ? "—" : `${fmtNum(ctx.ws.value, 1)} ${esc(this._unitStr("wind_speed", ctx.wind, ctx.ws.unit || "mph"))}`, "mdi:weather-windy", this._color("wind_speed", ctx.ws.raw, "teal", ctx.ws.src || "mph"), this._histSpark("wind_speed"))}
            ${this._tile("wind_gust", this._label("wind_gust", "Gust"), ctx.gust, ctx.wg.value == null ? "—" : `${fmtNum(ctx.wg.value, 1)}`, "mdi:windsock", this._color("wind_gust", ctx.wg.raw, "teal", ctx.wg.src || "mph"))}
            ${this._tile("max_gust", this._label("max_gust", "Max gust"), ctx.maxGust, num(ctx.maxGust?.state) == null ? "—" : this._fmt("max_gust", ctx.maxGust, 1, "mph"), "mdi:weather-windy-variant", "teal")}
          </div>
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "rain": {
        if (!ctx.showRain) return "";
        const normal = num(this._config?.rain_month_normal);
        const monthVal = this._conv(ctx.month, "in").value;
        const progress = rainMonthProgress(monthVal, normal);
        const daysSince = daysSinceTimestamp(ctx.lastRain?.state);
        const goal = progress.pct != null ? `<div class="rain-goal">
              <div class="rain-goal-top">
                <span>Month vs normal</span>
                <span>${fmtNum(monthVal, 2)} / ${fmtNum(normal, 2)}</span>
              </div>
              <div class="rain-goal-track"><div class="rain-goal-fill" style="width:${Math.min(100, progress.pct)}%"></div></div>
              <div class="rain-goal-meta">${esc(progress.label)}${daysSince != null ? ` · ${daysSince < 1 ? "<1" : fmtNum(daysSince, 0)} day${daysSince >= 1.5 ? "s" : ""} since rain` : ""}</div>
            </div>` : daysSince != null ? `<div class="rain-goal"><div class="rain-goal-top"><span>Days since rain</span><span>${daysSince < 1 ? "<1" : fmtNum(daysSince, 0)}</span></div></div>` : "";
        const body = `
          ${goal}
          ${this._sparkline([
          { label: "T", value: num(ctx.today?.state) },
          { label: "E", value: num(ctx.event?.state) },
          { label: "W", value: num(ctx.week?.state) },
          { label: "M", value: num(ctx.month?.state) },
          { label: "Y", value: num(ctx.year?.state) }
        ])}
          <div class="grid">
            ${this._tile("rain_rate", this._label("rain_rate", "Rate"), ctx.rate, ctx.rr.value == null ? "—" : `${fmtNum(ctx.rr.value, 2)} ${esc(this._unitStr("rain_rate", ctx.rate, ctx.rr.unit || ""))}`.trim(), "mdi:weather-rainy", ctx.raining ? "blue" : "grey")}
            ${this._tile("rain_today", this._label("rain_today", "Today"), ctx.today, this._fmt("rain_today", ctx.today, 2, "in"), "mdi:cup-water", (num(ctx.today?.state) ?? 0) > 0 ? "cyan" : "grey")}
            ${this._tile("rain_event", this._label("rain_event", "Event"), ctx.event, this._fmt("rain_event", ctx.event, 2, "in"), "mdi:weather-pouring", (num(ctx.event?.state) ?? 0) > 0 ? "blue" : "grey")}
            ${this._tile("rain_week", this._label("rain_week", "Week"), ctx.week, this._fmt("rain_week", ctx.week, 2, "in"), "mdi:calendar-week", (num(ctx.week?.state) ?? 0) > 0 ? "blue" : "grey")}
            ${this._tile("rain_month", this._label("rain_month", "Month"), ctx.month, this._fmt("rain_month", ctx.month, 2, "in"), "mdi:calendar-month", (num(ctx.month?.state) ?? 0) > 0 ? "blue" : "grey")}
            ${this._tile("rain_year", this._label("rain_year", "Year"), ctx.year, this._fmt("rain_year", ctx.year, 2, "in"), "mdi:calendar-star", (num(ctx.year?.state) ?? 0) > 0 ? "blue" : "grey")}
            ${this._tile("last_rain", this._label("last_rain", "Last rain"), ctx.lastRain, formatLastRain(ctx.lastRain, this._hass), "mdi:clock-outline", "blue")}
          </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "sun": {
        if (!ctx.showSun) return "";
        const body = `<div class="grid">
          ${this._tile("uv", this._label("uv", ctx.uvm.label), ctx.uv, ctx.uvn == null ? "—" : `${fmtNum(ctx.uvn, 0)}`, "mdi:weather-sunny-alert", ctx.uvm.color)}
          ${this._tile("irradiance", this._label("irradiance", "Solar"), ctx.irr, num(ctx.irr?.state) == null ? "—" : `${fmtNum(num(ctx.irr?.state), 0)} ${esc(this._unitStr("irradiance", ctx.irr, unitOf(ctx.irr)))}`.trim(), "mdi:solar-power-variant", "amber")}
          ${this._tile("illuminance", this._label("illuminance", "Light"), ctx.lux, num(ctx.lux?.state) == null ? "—" : `${fmtNum(num(ctx.lux?.state), 0)} ${esc(this._unitStr("illuminance", ctx.lux, "lx"))}`, "mdi:brightness-5", "amber")}
          ${ctx.sunrise ? this._tile("sunrise", "Sunrise", ctx.sun, ctx.sunrise, "mdi:weather-sunset-up", "amber") : ""}
          ${ctx.sunset ? this._tile("sunset", "Sunset", ctx.sun, ctx.sunset, "mdi:weather-sunset-down", "orange") : ""}
          ${ctx.moon ? this._tile("moon", ctx.moonMeta.label, ctx.moon, ctx.moonMeta.label, ctx.moonMeta.icon, "purple") : ""}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "soil": {
        if (!ctx.showSoil) return "";
        return this._wrapSection(id, compact, `<div class="grid">${this._soilTiles()}</div>`);
      }
      case "lightning": {
        if (!ctx.showLightning) return "";
        const body = `<div class="grid">
          ${this._tile("lightning_count", this._label("lightning_count", "Strikes"), ctx.lightningCount, num(ctx.lightningCount?.state) == null ? "—" : `${fmtNum(num(ctx.lightningCount?.state), 0)}`, "mdi:flash", (num(ctx.lightningCount?.state) ?? 0) > 0 ? "amber" : "grey")}
          ${this._tile("lightning_distance", this._label("lightning_distance", "Distance"), ctx.lightningDistance, num(ctx.lightningDistance?.state) == null ? "—" : `${fmtNum(num(ctx.lightningDistance?.state), 0)} ${esc(this._unitStr("lightning_distance", ctx.lightningDistance, unitOf(ctx.lightningDistance) || "mi"))}`, "mdi:map-marker-distance", "orange")}
          ${this._tile("lightning_time", this._label("lightning_time", "Last strike"), ctx.lightningTime, formatLastRain(ctx.lightningTime, this._hass), "mdi:clock-outline", "amber")}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "air": {
        if (!ctx.showAir) return "";
        const body = `<div class="grid">
          ${this._tile("pm25", this._label("pm25", ctx.pmm.label), ctx.pm25, ctx.pm == null ? "—" : `${fmtNum(ctx.pm, 0)} ${esc(this._unitStr("pm25", ctx.pm25, unitOf(ctx.pm25) || "µg/m³"))}`, "mdi:air-filter", ctx.pmm.color)}
          ${this._tile("aqi", this._label("aqi", ctx.aqim.label), ctx.aqi, ctx.aqiVal == null ? "—" : `${fmtNum(ctx.aqiVal, 0)}`, "mdi:air-purifier", ctx.aqim.color)}
          ${this._tile("voc", this._label("voc", "VOC"), ctx.voc, num(ctx.voc?.state) == null ? "—" : `${fmtNum(num(ctx.voc?.state), 0)} ${esc(this._unitStr("voc", ctx.voc, unitOf(ctx.voc) || "ppb"))}`, "mdi:chemical-weapon", this._color("voc", num(ctx.voc?.state), "green"))}
          ${this._tile("noise", this._label("noise", "Noise"), ctx.noise, num(ctx.noise?.state) == null ? "—" : `${fmtNum(num(ctx.noise?.state), 0)} ${esc(this._unitStr("noise", ctx.noise, unitOf(ctx.noise) || "dB"))}`, "mdi:volume-high", this._color("noise", num(ctx.noise?.state), "green"))}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "station": {
        if (!ctx.showMore) return "";
        const body = `<div class="grid">
          ${this._tile("pressure", this._label("pressure", ctx.trend.label ? `Pressure · ${ctx.trend.label}` : "Pressure"), ctx.pressure, this._fmt("pressure", ctx.pressure, 2, unitOf(ctx.pressure) || "inHg"), ctx.trend.icon || "mdi:gauge", ctx.trend.color === "grey" ? "teal" : ctx.trend.color, this._histSpark("pressure"))}
          ${this._tile("pressure_abs", this._label("pressure_abs", "Abs pressure"), ctx.pressureAbs, this._fmt("pressure_abs", ctx.pressureAbs, 2, unitOf(ctx.pressureAbs) || "inHg"), "mdi:gauge", "teal")}
          ${this._tile("indoor_temperature", this._label("indoor_temperature", "Indoor"), ctx.indoorT, ctx.indoorT ? `${fmtNum(this._conv(ctx.indoorT, "°F").value, 1)}°` : "—", "mdi:home-thermometer", this._color("temperature", num(ctx.indoorT?.state), "green", this._conv(ctx.indoorT, "°F").src || "°F"))}
          ${this._tile("indoor_humidity", this._label("indoor_humidity", "Indoor RH"), ctx.indoorH, num(ctx.indoorH?.state) == null ? "—" : `${Math.round(num(ctx.indoorH?.state))}%`, "mdi:water-percent", this._color("humidity", num(ctx.indoorH?.state), "cyan"))}
          ${this._tile("co2", this._label("co2", "CO₂"), ctx.co2, num(ctx.co2?.state) == null ? "—" : `${fmtNum(num(ctx.co2?.state), 0)} ${esc(this._unitStr("co2", ctx.co2, "ppm"))}`, "mdi:molecule-co2", this._color("co2", num(ctx.co2?.state), "green"))}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "forecast": {
        const showDaily = !!this._config?.show_forecast;
        const showHourly = this._wantHourly();
        if (!showDaily && !showHourly) return "";
        return this._wrapSection(id, compact, this._forecastHtml());
      }
      case "battery": {
        if (!ctx.showBattery || !ctx.batt || !ctx.battery) return "";
        const body = `<div class="battery ${ctx.batt.low ? "warn" : "ok"}" data-key="battery" data-entity="${esc(ctx.battery.entity_id)}">
          <ha-icon icon="${ctx.batt.icon}"></ha-icon>
          ${esc(this._label("battery", ctx.batt.text))}
        </div>`;
        return this._wrapSection(id, true, body);
      }
      default:
        return "";
    }
  }
  _render(force = false) {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    this._ensureStaleTimer();
    if (!force && this._hass) {
      const sig = this._watchedSignature();
      if (sig === this._renderSignature) return;
      this._renderSignature = sig;
    } else if (this._hass) {
      this._renderSignature = this._watchedSignature();
    }
    const layout = this._config.layout || "full";
    const compact = layout === "compact";
    const name = this._config.name || "Weather Station";
    const hass = this._hass;
    const temp = this._st("temperature");
    const feels = this._st("feels_like");
    const humidity = this._st("humidity");
    const dew = this._st("dew_point");
    const high = this._st("temp_high");
    const low = this._st("temp_low");
    const wind = this._st("wind_speed");
    const gust = this._st("wind_gust");
    const maxGust = this._st("max_gust");
    const wdir = this._st("wind_direction");
    const rate = this._st("rain_rate");
    const today = this._st("rain_today");
    const event = this._st("rain_event");
    const week = this._st("rain_week");
    const month = this._st("rain_month");
    const year = this._st("rain_year");
    const lastRain = this._st("last_rain");
    const uv = this._st("uv");
    const irr = this._st("irradiance");
    const lux = this._st("illuminance");
    const pressure = this._st("pressure");
    const pressureAbs = this._st("pressure_abs");
    const indoorT = this._st("indoor_temperature");
    const indoorH = this._st("indoor_humidity");
    const co2 = this._st("co2");
    const pm25 = this._st("pm25");
    const aqi = this._st("aqi");
    const voc = this._st("voc");
    const noise = this._st("noise");
    const leaf = this._st("leaf_wetness");
    const soilStates = [];
    for (let i = 1; i <= 8; i++) {
      const m = this._st(`soil_moisture_${i}`);
      const t2 = this._st(`soil_temperature_${i}`);
      if (m) soilStates.push(m);
      if (t2) soilStates.push(t2);
    }
    if (leaf) soilStates.push(leaf);
    const lightningCount = this._st("lightning_count");
    const lightningDistance = this._st("lightning_distance");
    const lightningTime = this._st("lightning_time");
    const battery = this._st("battery");
    const sun = entityState(this._hass, this._config.sun_entity || "sun.sun");
    const moon = entityState(this._hass, this._config.moon_entity);
    const t = this._conv(temp, "°F");
    const f = this._conv(feels, "°F");
    const hi = this._conv(high, "°F");
    const lo = this._conv(low, "°F");
    const h = num(humidity?.state);
    const d = this._conv(dew, "°F");
    const ws = this._conv(wind, "mph");
    const wg = this._conv(gust, "mph");
    const windDir = parseWindDirection(wdir);
    const deg = windDir.deg;
    const card = windDir.card;
    const rr = this._conv(rate, unitOf(rate) || "in/h");
    const uvn = num(uv?.state);
    const raining = rr.value != null && rr.value > 0;
    const tColor = this._color("temperature", t.raw, "grey", t.src || "°F");
    const uvColor = this._color("uv", uvn, "grey");
    const uvm = uvMeta(uvn, uvColor);
    const pm = num(pm25?.state);
    const pmm = pm25Meta(pm, this._color("pm25", pm, "grey"));
    const aqiVal = num(aqi?.state);
    const aqim = aqiMeta(aqiVal, this._color("aqi", aqiVal, "grey"));
    const pressureConv = this._conv(pressure, unitOf(pressure) || "inHg");
    const trend = this._trackPressure(pressureConv.value);
    const bf = this._config.show_beaufort ? beaufort(ws.value) : null;
    const locale = hass?.locale?.language;
    const sunrise = formatSunTime(
      sun?.attributes?.next_rising || sun?.attributes?.rising,
      locale
    );
    const sunset = formatSunTime(
      sun?.attributes?.next_setting || sun?.attributes?.setting,
      locale
    );
    const moonMetaInfo = moonMeta(moon?.state);
    const ageMs = entityAgeMs(temp) ?? entityAgeMs(pressure) ?? entityAgeMs(wind);
    const staleLimit = Number(this._config.stale_minutes);
    const staleMinutes = Number.isFinite(staleLimit) ? staleLimit : 30;
    const isStale = ageMs != null && staleMinutes > 0 && ageMs > staleMinutes * 6e4;
    const updatedLabel = ageMs == null ? null : relativeTime(new Date(Date.now() - ageMs), hass?.locale?.language);
    const heroIcon = raining ? (rr.raw ?? 0) >= 0.3 ? "mdi:weather-pouring" : "mdi:weather-rainy" : uvn != null && uvn >= 6 ? "mdi:weather-sunny" : uvn != null && uvn >= 1 ? "mdi:weather-partly-cloudy" : "mdi:weather-night";
    const showConditions = this._sectionVisible("hide_conditions", [temp, feels, humidity, dew, high, low]);
    const showWind = this._sectionVisible("hide_wind", [wind, gust, maxGust, wdir]);
    const showRain = this._sectionVisible("hide_rain", [rate, today, event, week, month, year, lastRain]);
    const showSun = this._sectionVisible("hide_sun", [uv, irr, lux, sun, moon]);
    const showMore = this._sectionVisible("hide_more", [pressure, pressureAbs, indoorT, indoorH, co2]);
    const showSoil = this._sectionVisible("hide_soil", soilStates);
    const showLightning = this._sectionVisible("hide_lightning", [lightningCount, lightningDistance, lightningTime]);
    const showAir = this._sectionVisible("hide_air", [pm25, aqi, voc, noise]);
    const showBattery = !this._config.hide_battery && !!battery;
    const showBody = layout !== "chips";
    const showExtra = layout === "full" || compact;
    const batt = batteryInfo(battery, this._config.battery_warning_threshold);
    const missing = !temp && !this._config.entities?.temperature;
    const tempUnit = this._unitStr("temperature", temp, t.unit || "°");
    const showUpdated = this._config.show_updated !== false;
    const subtitleBits = [];
    if (raining) {
      subtitleBits.push(`Raining · ${fmtNum(rr.value, 2)} ${esc(this._unitStr("rain_rate", rate, rr.unit || "in/h"))}`);
    } else {
      subtitleBits.push("Live station");
    }
    if (hi.value != null || lo.value != null) {
      subtitleBits.push(`H ${hi.value == null ? "—" : Math.round(hi.value)}° / L ${lo.value == null ? "—" : Math.round(lo.value)}°`);
    }
    const ctx = {
      compact,
      showConditions,
      showWind,
      showRain,
      showSun,
      showSoil,
      showLightning,
      showAir,
      showMore,
      showBattery,
      temp,
      feels,
      humidity,
      dew,
      high,
      low,
      wind,
      gust,
      maxGust,
      wdir,
      rate,
      today,
      event,
      week,
      month,
      year,
      lastRain,
      uv,
      irr,
      lux,
      pressure,
      pressureAbs,
      indoorT,
      indoorH,
      co2,
      pm25,
      aqi,
      voc,
      noise,
      lightningCount,
      lightningDistance,
      lightningTime,
      battery,
      batt,
      sun,
      moon,
      sunrise: sunrise !== "—" ? sunrise : "",
      sunset: sunset !== "—" ? sunset : "",
      moonMeta: moonMetaInfo,
      t,
      f,
      hi,
      lo,
      h,
      d,
      ws,
      wg,
      deg,
      card,
      rr,
      uvn,
      raining,
      tColor,
      uvm,
      pm,
      pmm,
      aqiVal,
      aqim,
      trend,
      bf,
      tempUnit
    };
    const order = normalizeSectionOrder(this._config.section_order);
    const sectionsHtml = showExtra ? order.map((sid) => this._renderSection(sid, ctx)).join("") : "";
    const html = `
      <style>${CARD_STYLES}</style>
      <ha-card class="${compact ? "compact" : layout === "chips" ? "chips-layout" : layout}${isStale ? " stale" : ""}">
        ${layout === "chips" ? this._chips(temp, feels, humidity, today, wind, pressure, uv, gust, raining) : ""}
        ${showBody ? `
          ${this._alertsHtml()}
          <div class="header">
            <div class="header-main">
              <div class="title">${esc(name)}</div>
              <div class="subtitle">${subtitleBits.join(" · ")}</div>
            </div>
            ${showUpdated && updatedLabel ? `
              <div class="status-chip ${isStale ? "warn" : ""}" title="${isStale ? "Data may be stale" : "Last sensor update"}">
                <span class="status-dot"></span>
                ${isStale ? `Stale · ${esc(updatedLabel)}` : esc(updatedLabel)}
              </div>
            ` : ""}
          </div>
          <button class="hero" data-key="temperature" data-entity="${esc(temp?.entity_id || "")}">
            <ha-icon icon="${heroIcon}" class="hero-icon" style="color:${iconColorVar(tColor)}"></ha-icon>
            <div class="hero-text">
              <div class="hero-primary">${t.value == null ? "—" : Math.round(t.value)}°</div>
              <div class="hero-secondary">
                ${f.value != null ? `Feels ${Math.round(f.value)}°` : ""}
                ${h != null ? ` · ${Math.round(h)}% RH` : ""}
              </div>
            </div>
            <div class="hero-spark">${this._histSpark("temperature")}</div>
          </button>
        ` : ""}
        ${sectionsHtml}
        ${missing && hass ? `<div class="hint">Set <code>prefix</code> (e.g. <code>ws</code>) or pick entities in the card editor.</div>` : ""}
      </ha-card>
    `;
    this.shadowRoot.innerHTML = html;
    this.shadowRoot.querySelectorAll("[data-entity], [data-key='__chips_expand']").forEach((el) => {
      const htmlEl = el;
      this._bindTile(htmlEl, htmlEl.dataset.key || "", htmlEl.dataset.entity || "");
    });
  }
};
_MushroomWeatherStationCard.VERSION = CARD_VERSION;
let MushroomWeatherStationCard = _MushroomWeatherStationCard;
customElements.define(CARD_TYPE, MushroomWeatherStationCard);
window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TYPE,
  name: CARD_NAME,
  description: "Mushroom-style weather station card for Ecowitt / personal WS sensors.",
  preview: true,
  documentationURL: "https://github.com/highergroundstudio/lovelace-mushroom-weather-station-card"
});
console.info(
  `%c ${CARD_NAME} %c ${CARD_VERSION} `,
  "color:#fff;background:#1b4d3e;font-weight:bold;padding:2px 6px;",
  "color:#1b4d3e;background:#e8f5e9;font-weight:bold;padding:2px 6px;"
);
//# sourceMappingURL=mushroom-weather-station-card.js.map
