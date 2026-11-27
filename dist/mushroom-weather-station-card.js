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
const GRAPH_KEYS = /* @__PURE__ */ new Set([
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
  { key: "battery", label: "Battery", domains: ["sensor", "binary_sensor"], classes: ["battery"] },
  { key: "signal_strength", label: "Signal strength", domains: ["sensor"], classes: ["signal_strength"] }
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
let numberLocale;
function setNumberLocale(locale) {
  numberLocale = locale || void 0;
}
function fmtNum(n, digits = 1, locale = numberLocale) {
  if (n == null || !Number.isFinite(Number(n))) return "—";
  const fixed = Number(n).toFixed(digits).replace(/\.0$/, "");
  if (!locale || locale.startsWith("en")) return fixed;
  try {
    const decimals = fixed.includes(".") ? fixed.split(".")[1].length : 0;
    return new Intl.NumberFormat(locale, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
      useGrouping: false
    }).format(Number(fixed));
  } catch {
    return fixed;
  }
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
  if (uv == null) return { label: "—", color: color || "grey", key: "tile.uv" };
  if (uv >= 11) return { label: "Extreme", color: color || "purple", key: "uv.extreme" };
  if (uv >= 8) return { label: "Very high", color: color || "purple", key: "uv.very_high" };
  if (uv >= 6) return { label: "High", color: color || "orange", key: "uv.high" };
  if (uv >= 3) return { label: "Moderate", color: color || "amber", key: "uv.moderate" };
  return { label: "Low", color: color || "green", key: "uv.low" };
}
function pm25Meta(value, color) {
  if (value == null) return { label: "PM2.5", color: color || "grey", key: "tile.pm25" };
  if (value >= 55) return { label: "Unhealthy", color: color || "red", key: "air.unhealthy" };
  if (value >= 35) return { label: "Sensitive", color: color || "orange", key: "air.sensitive" };
  if (value >= 12) return { label: "Moderate", color: color || "amber", key: "air.moderate" };
  return { label: "Good", color: color || "green", key: "air.good" };
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
function formatLastRain(st, hass, localeOverride) {
  const raw = st?.state;
  if (!raw || raw === "unknown" || raw === "unavailable") return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  const locale = localeOverride || hass?.locale?.language || void 0;
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
      icon: low2 ? "mdi:battery-alert" : batteryLevelIcon(n),
      key: low2 ? "battery.low_pct" : "battery.pct",
      pct,
      level: n
    };
  }
  const low = st.state === "on";
  return {
    low,
    text: low ? "Low Battery" : "Station battery OK",
    icon: low ? "mdi:battery-alert" : "mdi:battery",
    key: low ? "battery.low" : "battery.ok",
    pct: "",
    level: null
  };
}
function batteryLevelIcon(level) {
  if (level >= 95) return "mdi:battery";
  const step = Math.max(10, Math.min(90, Math.round(level / 10) * 10));
  return `mdi:battery-${step}`;
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
  if (["mi", "km"].includes(u)) return "distance";
  return null;
}
function sourceSystem(unit) {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "mph", "in", "in/h", "in/hr", "inhg", "mi"].includes(u)) return "imperial";
  if (["c", "km/h", "kmh", "kph", "m/s", "m/sec", "mm", "mm/h", "mm/hr", "hpa", "mbar", "mb", "km"].includes(u)) return "metric";
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
  if (kind === "distance") {
    return target === "metric" ? { value: value * 1.60934, unit: "km" } : { value: value / 1.60934, unit: "mi" };
  }
  if (kind === "pressure") {
    return target === "metric" ? { value: value * 33.8639, unit: "hPa" } : { value: value / 33.8639, unit: "inHg" };
  }
  return { value, unit: unit || "" };
}
function pressureTrendMeta(current, previous) {
  if (current == null || previous == null) return { label: "", icon: "mdi:minus", color: "grey", key: "" };
  const delta = current - previous;
  if (Math.abs(delta) < 0.02) return { label: "Steady", icon: "mdi:arrow-right", color: "grey", key: "trend.steady" };
  if (delta > 0) return { label: "Rising", icon: "mdi:arrow-top-right", color: "green", key: "trend.rising" };
  return { label: "Falling", icon: "mdi:arrow-bottom-right", color: "orange", key: "trend.falling" };
}
function normalizeSectionOrder(order) {
  const known = new Set(DEFAULT_SECTION_ORDER);
  const seen = /* @__PURE__ */ new Set();
  const out = [];
  if (Array.isArray(order)) {
    for (const item2 of order) {
      if (typeof item2 === "string" && known.has(item2) && !seen.has(item2)) {
        out.push(item2);
        seen.add(item2);
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
  if (value == null) return { label: "AQI", color: color || "grey", key: "tile.aqi" };
  if (value >= 150) return { label: "Unhealthy", color: color || "red", key: "air.unhealthy" };
  if (value >= 100) return { label: "Sensitive", color: color || "orange", key: "air.sensitive" };
  if (value >= 50) return { label: "Moderate", color: color || "amber", key: "air.moderate" };
  return { label: "Good", color: color || "green", key: "air.good" };
}
const MOON_KEY_ALIASES = { new: "new_moon", full: "full_moon", third_quarter: "last_quarter" };
function moonMeta(state) {
  const raw = String(state || "").trim().toLowerCase().replace(/\s+/g, "_");
  const icon = MOON_ICONS[raw] || "mdi:moon-waning-crescent";
  const label = raw ? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()) : "Moon";
  const phase = MOON_KEY_ALIASES[raw] || raw;
  return { label, icon, key: phase && MOON_ICONS[phase] ? `moon.${phase}` : "moon.label" };
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
function isNumericHistoryPoint(p) {
  return !p.unavailable && Number.isFinite(p.state);
}
function downsampleHistory(points, maxPoints = 36) {
  const usable = points.filter(isNumericHistoryPoint);
  if (usable.length <= maxPoints) return usable;
  const out = [];
  const step = (usable.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    out.push(usable[Math.round(i * step)]);
  }
  return out;
}
function downsampleHistoryExtrema(points, maxPoints = 72, mode = "max") {
  const usable = points.filter(isNumericHistoryPoint);
  if (usable.length <= maxPoints) return usable;
  const out = [];
  const bucket = usable.length / maxPoints;
  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucket);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
    let best = usable[start];
    for (let j = start + 1; j < end && j < usable.length; j++) {
      if (mode === "max" ? usable[j].state > best.state : usable[j].state < best.state) {
        best = usable[j];
      }
    }
    out.push(best);
  }
  return out;
}
function historyExtreme(points, mode) {
  const usable = points.filter(isNumericHistoryPoint);
  if (!usable.length) return null;
  let best = usable[0];
  for (const p of usable) {
    if (mode === "max" ? p.state > best.state : p.state < best.state) best = p;
  }
  return { value: best.state, at: best.last_changed };
}
function buildRecordBook(history) {
  return {
    hottest: historyExtreme(history.temperature || [], "max"),
    coldest: historyExtreme(history.temperature || [], "min"),
    peakGust: historyExtreme(history.wind_gust || [], "max"),
    peakRainRate: historyExtreme(history.rain_rate || [], "max"),
    wettestDay: historyExtreme(history.rain_today || [], "max")
  };
}
function sameLocalDay(a, b = Date.now()) {
  const da = new Date(a);
  const db = new Date(b);
  return da.getFullYear() === db.getFullYear() && da.getMonth() === db.getMonth() && da.getDate() === db.getDate();
}
function isRecordSetToday(record, now = Date.now()) {
  return !!record && Number.isFinite(record.at) && sameLocalDay(record.at, now);
}
function precipTimelineBars(points, hours, buckets = 24) {
  const end = Date.now();
  const start = end - hours * 3600 * 1e3;
  const span = Math.max(1, end - start);
  const width = Math.min(48, Math.max(8, buckets));
  const bars = Array.from({ length: width }, (_, i) => {
    const t0 = start + i / width * span;
    const when = new Date(t0 + span / width / 2);
    let label = "";
    try {
      label = when.toLocaleTimeString(void 0, { hour: "numeric" });
    } catch {
      label = `${when.getHours()}`;
    }
    return { label, value: 0, start: t0 };
  });
  const sorted = [...points].filter((p) => p.unavailable || Number.isFinite(p.state)).sort((a, b) => a.last_changed - b.last_changed);
  if (!sorted.length) return bars;
  const rateOf = (p) => p.unavailable || !Number.isFinite(p.state) ? null : p.state;
  let carryIdx = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].last_changed <= start) carryIdx = i;
    else break;
  }
  const paint = (t0, t1, rate) => {
    if (!(rate > 0) || !(t1 > t0)) return;
    const i0 = Math.max(0, Math.floor((t0 - start) / span * width));
    const i1 = Math.min(width - 1, Math.floor((Math.min(t1, end) - 1 - start) / span * width));
    for (let i = i0; i <= i1; i++) bars[i].value = Math.max(bars[i].value, rate);
  };
  if (carryIdx >= 0) {
    const rate = rateOf(sorted[carryIdx]);
    if (rate != null) {
      const t1 = carryIdx + 1 < sorted.length ? sorted[carryIdx + 1].last_changed : end;
      paint(start, Math.min(end, t1), rate);
    }
  }
  for (let i = Math.max(0, carryIdx + 1); i < sorted.length; i++) {
    const rate = rateOf(sorted[i]);
    if (rate == null) continue;
    const t0 = Math.max(start, sorted[i].last_changed);
    if (t0 >= end) break;
    const t1 = i + 1 < sorted.length ? Math.min(end, sorted[i + 1].last_changed) : end;
    paint(t0, t1, rate);
  }
  return bars;
}
function precipTimelineSvg(bars, width = 280, height = 44) {
  if (!bars.length) return "";
  const max = Math.max(...bars.map((b) => b.value), 0.01);
  const gap = 2;
  const barW = Math.max(2, (width - gap * (bars.length - 1)) / bars.length);
  const rects = bars.map((b, i) => {
    const h = Math.max(b.value > 0 ? 3 : 1, b.value / max * (height - 8));
    const x = i * (barW + gap);
    const y = height - h;
    const opacity = b.value > 0 ? 0.55 + b.value / max * 0.45 : 0.18;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="currentColor" opacity="${opacity.toFixed(2)}"/>`;
  }).join("");
  return `<svg class="precip-timeline-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" aria-hidden="true">${rects}</svg>`;
}
function advanceCursor(cur, seriesAsc, at) {
  while (cur.i + 1 < seriesAsc.length && seriesAsc[cur.i + 1].last_changed <= at) {
    cur.i += 1;
    const p = seriesAsc[cur.i];
    cur.value = p.unavailable || !Number.isFinite(p.state) ? null : p.state;
  }
}
function comfortBandFromConfig(config) {
  const tempMin = num(config?.comfort_temp_min);
  const tempMax = num(config?.comfort_temp_max);
  const humidityMin = num(config?.comfort_humidity_min);
  const humidityMax = num(config?.comfort_humidity_max);
  return {
    tempMin: tempMin ?? DEFAULT_COMFORT.tempMin,
    tempMax: tempMax ?? DEFAULT_COMFORT.tempMax,
    humidityMin: humidityMin ?? DEFAULT_COMFORT.humidityMin,
    humidityMax: humidityMax ?? DEFAULT_COMFORT.humidityMax
  };
}
function comfortStats(tempPoints, humidityPoints, band, window2) {
  const samples = [];
  const humidityAsc = [...humidityPoints].sort((a, b) => a.last_changed - b.last_changed);
  const tempAsc = [...tempPoints].sort((a, b) => a.last_changed - b.last_changed);
  const humScatter = { i: -1, value: null };
  for (const t of tempAsc) {
    if (!isNumericHistoryPoint(t)) continue;
    advanceCursor(humScatter, humidityAsc, t.last_changed);
    if (humScatter.value == null) continue;
    samples.push({ temp: t.state, humidity: humScatter.value });
  }
  const end = window2?.end ?? Date.now();
  let start = window2?.start;
  if (start == null || !Number.isFinite(start)) {
    const first = Math.min(
      tempAsc.find(isNumericHistoryPoint)?.last_changed ?? end,
      humidityAsc.find(isNumericHistoryPoint)?.last_changed ?? end
    );
    start = first;
  }
  const breaks = /* @__PURE__ */ new Set([start, end]);
  for (const p of tempAsc) {
    if (p.last_changed > start && p.last_changed < end) breaks.add(p.last_changed);
  }
  for (const p of humidityAsc) {
    if (p.last_changed > start && p.last_changed < end) breaks.add(p.last_changed);
  }
  const times = [...breaks].sort((a, b) => a - b);
  const tempCur = { i: -1, value: null };
  const humCur = { i: -1, value: null };
  let hoursIn = 0;
  let hoursTotal = 0;
  for (let i = 0; i < times.length - 1; i++) {
    const t0 = times[i];
    const t1 = times[i + 1];
    if (!(t1 > t0)) continue;
    advanceCursor(tempCur, tempAsc, t0);
    advanceCursor(humCur, humidityAsc, t0);
    if (tempCur.value == null || humCur.value == null) continue;
    const dtHr = (t1 - t0) / 36e5;
    hoursTotal += dtHr;
    const ok = tempCur.value >= band.tempMin && tempCur.value <= band.tempMax && humCur.value >= band.humidityMin && humCur.value <= band.humidityMax;
    if (ok) hoursIn += dtHr;
  }
  const pct = hoursTotal > 0 ? Math.round(hoursIn / hoursTotal * 100) : null;
  return { hoursIn, hoursTotal, pct, samples };
}
function comfortScatterSvg(samples, band, width = 220, height = 96) {
  if (!samples.length) return "";
  const temps = samples.map((s) => s.temp);
  const hums = samples.map((s) => s.humidity);
  const minT = Math.min(...temps, band.tempMin) - 2;
  const maxT = Math.max(...temps, band.tempMax) + 2;
  const minH = Math.min(...hums, band.humidityMin) - 5;
  const maxH = Math.max(...hums, band.humidityMax) + 5;
  const pad = 8;
  const x = (t) => pad + (t - minT) / Math.max(0.01, maxT - minT) * (width - pad * 2);
  const y = (h) => height - pad - (h - minH) / Math.max(0.01, maxH - minH) * (height - pad * 2);
  const zoneX = x(band.tempMin);
  const zoneY = y(band.humidityMax);
  const zoneW = Math.max(4, x(band.tempMax) - zoneX);
  const zoneH = Math.max(4, y(band.humidityMin) - zoneY);
  const plotted = samples.length <= 80 ? samples : Array.from({ length: 80 }, (_, i) => {
    const step = (samples.length - 1) / 79;
    return samples[Math.round(i * step)];
  });
  const dots = plotted.map((s) => {
    const inBand = s.temp >= band.tempMin && s.temp <= band.tempMax && s.humidity >= band.humidityMin && s.humidity <= band.humidityMax;
    return `<circle cx="${x(s.temp).toFixed(1)}" cy="${y(s.humidity).toFixed(1)}" r="2.2" fill="currentColor" opacity="${inBand ? 0.9 : 0.35}"/>`;
  }).join("");
  return `<svg class="comfort-scatter" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" aria-hidden="true">
    <rect x="${zoneX.toFixed(1)}" y="${zoneY.toFixed(1)}" width="${zoneW.toFixed(1)}" height="${zoneH.toFixed(1)}" fill="currentColor" opacity="0.12" rx="4"/>
    ${dots}
  </svg>`;
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
function seasonalSkinClasses(season, condition) {
  const cond = String(condition || "").toLowerCase();
  let condClass = "";
  if (cond.includes("snow")) condClass = "cond-snow";
  else if (cond.includes("lightning") || cond.includes("thunder")) condClass = "cond-storm";
  else if (cond.includes("rain") || cond.includes("pour") || cond.includes("hail")) condClass = "cond-rain";
  else if (cond === "sunny" || cond === "clear-night" || cond.includes("clear")) condClass = "cond-clear";
  else if (cond.includes("cloud") || cond.includes("fog")) condClass = "cond-cloud";
  return `skin-${season}${condClass ? ` ${condClass}` : ""}`;
}
function parseHistoryPoint(rawState, changed) {
  const t = typeof changed === "number" ? changed > 1e12 ? changed : changed * 1e3 : changed ? new Date(String(changed)).getTime() : NaN;
  if (!Number.isFinite(t)) return null;
  if (typeof rawState === "string") {
    const low = rawState.toLowerCase();
    if (low === "unavailable" || low === "unknown") {
      return { state: Number.NaN, last_changed: t, unavailable: true };
    }
  }
  let state = num(rawState);
  if (state == null && typeof rawState === "string") {
    state = parseWindDirection({ state: rawState }).deg;
  }
  return state == null ? null : { state, last_changed: t };
}
function ingestHistoryRaw(raw, keyById) {
  const next = {};
  if (Array.isArray(raw)) {
    for (const series of raw) {
      if (!Array.isArray(series) || !series.length) continue;
      const key = keyById[series[0]?.entity_id || ""];
      if (!key) continue;
      next[key] = series.map((p) => parseHistoryPoint(p.state, p.last_changed)).filter((p) => !!p);
    }
  } else if (raw && typeof raw === "object") {
    for (const [id, series] of Object.entries(raw)) {
      const key = keyById[id];
      if (!key || !Array.isArray(series)) continue;
      next[key] = series.map((p) => parseHistoryPoint(p.s ?? p.state, p.lu ?? p.last_changed)).filter((p) => !!p);
    }
  }
  return next;
}
async function fetchHistoryRaw(hass, entityIds, start, end, significantOnly) {
  if (!hass || !entityIds.length) return null;
  if (hass.connection?.sendMessagePromise) {
    return hass.connection.sendMessagePromise({
      type: "history/history_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      significant_changes_only: significantOnly,
      minimal_response: true,
      no_attributes: true,
      entity_ids: entityIds
    });
  }
  if (hass.callApi) {
    const sig = significantOnly ? 1 : 0;
    const q = `history/period/${start.toISOString()}?filter_entity_id=${entityIds.join(",")}&end_time=${encodeURIComponent(end.toISOString())}&significant_changes_only=${sig}&minimal_response`;
    return hass.callApi("GET", q);
  }
  return null;
}
function toMs(v) {
  if (typeof v === "number") return v > 1e12 ? v : v * 1e3;
  if (typeof v === "string") return new Date(v).getTime();
  return NaN;
}
const finiteOrNull = (v) => {
  const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};
function parseStatistics(raw) {
  const out = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, rows] of Object.entries(raw)) {
    if (!Array.isArray(rows)) continue;
    const parsed = [];
    for (const r of rows) {
      const start = toMs(r.start);
      if (!Number.isFinite(start)) continue;
      const endMs = toMs(r.end);
      parsed.push({
        start,
        end: Number.isFinite(endMs) ? endMs : start,
        min: finiteOrNull(r.min),
        max: finiteOrNull(r.max),
        mean: finiteOrNull(r.mean),
        state: finiteOrNull(r.state)
      });
    }
    out[id] = parsed.sort((a, b) => a.start - b.start);
  }
  return out;
}
async function fetchStatistics(hass, statisticIds, start, end, period) {
  if (!hass?.connection?.sendMessagePromise || !statisticIds.length) return null;
  const raw = await hass.connection.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    statistic_ids: statisticIds,
    period,
    types: ["min", "max", "mean", "state"]
  });
  return parseStatistics(raw);
}
function rowExtreme(rows, mode) {
  let best = null;
  for (const r of rows) {
    const v = mode === "max" ? r.max ?? r.state ?? r.mean : r.min ?? r.state ?? r.mean;
    if (v == null) continue;
    if (!best || (mode === "max" ? v > best.value : v < best.value)) {
      best = { value: v, at: r.start + Math.max(0, r.end - r.start) / 2 };
    }
  }
  return best;
}
function pickExtreme(a, b, mode) {
  if (!a) return b;
  if (!b) return a;
  if (mode === "max") return b.value > a.value ? b : a;
  return b.value < a.value ? b : a;
}
function recordBookFromStatistics(stats, recent = {}) {
  return {
    hottest: pickExtreme(rowExtreme(stats.temperature || [], "max"), recent.hottest ?? null, "max"),
    coldest: pickExtreme(rowExtreme(stats.temperature || [], "min"), recent.coldest ?? null, "min"),
    peakGust: pickExtreme(rowExtreme(stats.wind_gust || [], "max"), recent.peakGust ?? null, "max"),
    peakRainRate: pickExtreme(rowExtreme(stats.rain_rate || [], "max"), recent.peakRainRate ?? null, "max"),
    wettestDay: pickExtreme(rowExtreme(stats.rain_today || [], "max"), recent.wettestDay ?? null, "max")
  };
}
function seriesFromStatistics(rows) {
  return {
    source: "statistics",
    points: rows.map((r) => {
      const v = r.mean ?? (r.min != null && r.max != null ? (r.min + r.max) / 2 : r.max ?? r.min ?? r.state);
      if (v == null) return null;
      if (r.min == null && r.max == null) return { t: r.start, v };
      return { t: r.start, v, min: r.min ?? v, max: r.max ?? v };
    }).filter((p) => !!p)
  };
}
function seriesFromHistory(points) {
  return {
    source: "history",
    points: points.filter((p) => !p.unavailable && Number.isFinite(p.state)).map((p) => ({ t: p.last_changed, v: p.state }))
  };
}
const fToC = (f) => (f - 32) * (5 / 9);
const cToF = (c) => c * (9 / 5) + 32;
function dewPointF(tempF, rh) {
  if (tempF == null || rh == null || !Number.isFinite(tempF) || !Number.isFinite(rh)) return null;
  if (rh <= 0 || rh > 100) return null;
  const a = 17.625;
  const b = 243.04;
  const t = fToC(tempF);
  const gamma = Math.log(rh / 100) + a * t / (b + t);
  return cToF(b * gamma / (a - gamma));
}
function heatIndexF(tempF, rh) {
  if (tempF == null || rh == null || !Number.isFinite(tempF) || !Number.isFinite(rh)) return null;
  const T = tempF;
  const R = Math.max(0, Math.min(100, rh));
  const simple = 0.5 * (T + 61 + (T - 68) * 1.2 + R * 0.094);
  if ((simple + T) / 2 < 80) return simple;
  let hi = -42.379 + 2.04901523 * T + 10.14333127 * R - 0.22475541 * T * R - 683783e-8 * T * T - 0.05481717 * R * R + 122874e-8 * T * T * R + 85282e-8 * T * R * R - 199e-8 * T * T * R * R;
  if (R < 13 && T >= 80 && T <= 112) {
    hi -= (13 - R) / 4 * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (R > 85 && T >= 80 && T <= 87) {
    hi += (R - 85) / 10 * ((87 - T) / 5);
  }
  return hi;
}
function windChillF(tempF, windMph) {
  if (tempF == null || windMph == null || !Number.isFinite(tempF) || !Number.isFinite(windMph)) return null;
  if (tempF > 50 || windMph <= 3) return null;
  const v = Math.pow(windMph, 0.16);
  return 35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v;
}
function feelsLikeF(tempF, rh, windMph) {
  if (tempF == null || !Number.isFinite(tempF)) return null;
  const chill = windChillF(tempF, windMph);
  if (chill != null) return chill;
  if (tempF >= 80 && rh != null) {
    const hi = heatIndexF(tempF, rh);
    if (hi != null) return Math.max(hi, tempF);
  }
  return tempF;
}
function fromFahrenheit(valueF, unit) {
  return /c$/i.test(String(unit).replace("°", "").trim()) ? fToC(valueF) : valueF;
}
function toFahrenheit(value, unit) {
  return /c$/i.test(String(unit).replace("°", "").trim()) ? cToF(value) : value;
}
function toMph(value, unit) {
  const u = String(unit).toLowerCase().trim();
  if (u === "km/h" || u === "kmh" || u === "kph") return value / 1.60934;
  if (u === "m/s" || u === "m/sec") return value * 2.23694;
  if (u === "kn" || u === "kt" || u === "knots") return value * 1.15078;
  return value;
}
const GRAPH_W = 320;
const GRAPH_H = 140;
const PAD_Y = 8;
function graphStats(series) {
  const pts = series.points;
  if (!pts.length) return null;
  let min = Infinity;
  let max = -Infinity;
  let sum = 0;
  for (const p of pts) {
    min = Math.min(min, p.min ?? p.v);
    max = Math.max(max, p.max ?? p.v);
    sum += p.v;
  }
  return { min, max, avg: sum / pts.length, start: pts[0].t, end: pts[pts.length - 1].t };
}
function gapThreshold(times) {
  if (times.length < 3) return Infinity;
  const deltas = [];
  for (let i = 1; i < times.length; i++) deltas.push(times[i] - times[i - 1]);
  deltas.sort((a, b) => a - b);
  const median = deltas[Math.floor(deltas.length / 2)] || 0;
  return Math.max(median * 6, 3 * 36e5);
}
function graphSvg(series, window2, width = GRAPH_W, height = GRAPH_H) {
  const stats = graphStats(series);
  if (!stats) return "";
  const pts = series.points;
  const span = Math.max(1, window2.end - window2.start);
  const lo = stats.min;
  const hi = stats.max;
  const range = hi - lo || Math.max(1, Math.abs(hi) * 0.05);
  const x = (t) => (t - window2.start) / span * width;
  const y = (v) => height - PAD_Y - (v - lo) / range * (height - PAD_Y * 2);
  const gap = gapThreshold(pts.map((p) => p.t));
  const stepped = series.source === "history";
  let line = "";
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    const broken = i === 0 || p.t - pts[i - 1].t > gap;
    if (broken) line += `M${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`;
    else if (stepped) line += `H${x(p.t).toFixed(1)}V${y(p.v).toFixed(1)}`;
    else line += `L${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`;
  }
  if (stepped && pts.length) line += `H${x(Math.min(window2.end, Date.now())).toFixed(1)}`;
  let band = "";
  if (pts.some((p) => p.min != null && p.max != null && p.max !== p.min)) {
    let run = [];
    const flush = () => {
      if (run.length > 1) {
        const top = run.map((p) => `${x(p.t).toFixed(1)},${y(p.max ?? p.v).toFixed(1)}`);
        const bottom = run.slice().reverse().map((p) => `${x(p.t).toFixed(1)},${y(p.min ?? p.v).toFixed(1)}`);
        band += `<polygon class="graph-band" points="${[...top, ...bottom].join(" ")}"/>`;
      }
      run = [];
    };
    for (let i = 0; i < pts.length; i++) {
      if (i > 0 && pts[i].t - pts[i - 1].t > gap) flush();
      run.push(pts[i]);
    }
    flush();
  }
  const grid = [0.25, 0.5, 0.75].map((f) => `<line class="graph-grid" x1="0" x2="${width}" y1="${(PAD_Y + f * (height - PAD_Y * 2)).toFixed(1)}" y2="${(PAD_Y + f * (height - PAD_Y * 2)).toFixed(1)}"/>`).join("");
  return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" width="100%" height="${height}" aria-hidden="true" focusable="false">
    ${grid}
    ${band}
    <path class="graph-line" d="${line}"/>
    <line class="graph-cursor" x1="-10" x2="-10" y1="0" y2="${height}"/>
    <circle class="graph-dot" cx="-10" cy="-10" r="3.5"/>
  </svg>`;
}
function nearestPoint(series, window2, fraction) {
  const pts = series.points;
  if (!pts.length) return -1;
  const t = window2.start + Math.max(0, Math.min(1, fraction)) * (window2.end - window2.start);
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = lo + hi >> 1;
    if (pts[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(pts[lo - 1].t - t) < Math.abs(pts[lo].t - t)) lo -= 1;
  return lo;
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
function hasKey(key) {
  return Object.prototype.hasOwnProperty.call(en, key);
}
function keyOf(node) {
  if (node.nodeType !== 1) return null;
  const el = node;
  const explicit = el.getAttribute("data-morph-key");
  if (explicit) return `m:${explicit}`;
  const section = el.getAttribute("data-section");
  if (section) return `s:${section}`;
  const key = el.getAttribute("data-key");
  if (key) return `k:${el.tagName}:${key}:${el.getAttribute("data-entity") || ""}`;
  return null;
}
function sameKind(a, b) {
  if (a.nodeType !== b.nodeType) return false;
  if (a.nodeType === 1) {
    const ea = a;
    const eb = b;
    return ea.tagName === eb.tagName && ea.namespaceURI === eb.namespaceURI;
  }
  return true;
}
function syncAttributes(from, to) {
  const next = to.attributes;
  for (let i = 0; i < next.length; i++) {
    const attr = next[i];
    if (from.getAttributeNS(attr.namespaceURI, attr.localName) !== attr.value) {
      if (attr.namespaceURI) from.setAttributeNS(attr.namespaceURI, attr.name, attr.value);
      else from.setAttribute(attr.name, attr.value);
    }
  }
  const prev = from.attributes;
  for (let i = prev.length - 1; i >= 0; i--) {
    const attr = prev[i];
    if (!to.hasAttributeNS(attr.namespaceURI, attr.localName)) {
      from.removeAttributeNS(attr.namespaceURI, attr.localName);
    }
  }
  if (from instanceof HTMLInputElement && to instanceof HTMLInputElement) {
    if (from.value !== to.value) from.value = to.value;
    if (from.checked !== to.checked) from.checked = to.checked;
  }
}
function morphNode(from, to) {
  if (from.nodeType === 3 || from.nodeType === 8) {
    if (from.nodeValue !== to.nodeValue) from.nodeValue = to.nodeValue;
    return;
  }
  if (from.nodeType !== 1) return;
  syncAttributes(from, to);
  if (from.tagName.includes("-")) return;
  morphChildren(from, to);
}
function morphChildren(parent, next) {
  const oldKeyed = /* @__PURE__ */ new Map();
  for (let c = parent.firstChild; c; c = c.nextSibling) {
    const k = keyOf(c);
    if (k && !oldKeyed.has(k)) oldKeyed.set(k, c);
  }
  let cursor = parent.firstChild;
  let incoming = next.firstChild;
  while (incoming) {
    const following = incoming.nextSibling;
    const key = keyOf(incoming);
    let match = null;
    if (key) {
      const candidate = oldKeyed.get(key);
      if (candidate && sameKind(candidate, incoming)) {
        match = candidate;
        oldKeyed.delete(key);
      }
    } else if (cursor && !keyOf(cursor) && sameKind(cursor, incoming)) {
      match = cursor;
    }
    if (match) {
      if (match !== cursor) parent.insertBefore(match, cursor);
      else cursor = cursor.nextSibling;
      morphNode(match, incoming);
    } else {
      parent.insertBefore(incoming, cursor);
    }
    incoming = following;
  }
  while (cursor) {
    const after = cursor.nextSibling;
    parent.removeChild(cursor);
    cursor = after;
  }
  for (const stale of oldKeyed.values()) {
    if (stale.parentNode === parent) parent.removeChild(stale);
  }
}
function morph(target, html) {
  const tpl = document.createElement("template");
  tpl.innerHTML = html;
  morphChildren(target, tpl.content);
}
const renderAir = (v, ctx) => {
  if (!ctx.showAir) return "";
  const { t } = v;
  const voc = num(ctx.voc?.state);
  const noise = num(ctx.noise?.state);
  const body = `<div class="grid">
    ${v.tile("pm25", v.label("pm25", ctx.pm == null ? t("tile.pm25") : v.meta(ctx.pmm)), ctx.pm25, ctx.pm == null ? "—" : `${fmtNum(ctx.pm, 0)} ${esc(v.unitStr("pm25", ctx.pm25, unitOf(ctx.pm25) || "µg/m³"))}`, "mdi:air-filter", ctx.pmm.color)}
    ${v.tile("aqi", v.label("aqi", ctx.aqiVal == null ? t("tile.aqi") : v.meta(ctx.aqim)), ctx.aqi, ctx.aqiVal == null ? "—" : `${fmtNum(ctx.aqiVal, 0)}`, "mdi:air-purifier", ctx.aqim.color)}
    ${v.tile("voc", v.label("voc", t("tile.voc")), ctx.voc, voc == null ? "—" : `${fmtNum(voc, 0)} ${esc(v.unitStr("voc", ctx.voc, unitOf(ctx.voc) || "ppb"))}`, "mdi:chemical-weapon", v.color("voc", voc, "green"))}
    ${v.tile("noise", v.label("noise", t("tile.noise")), ctx.noise, noise == null ? "—" : `${fmtNum(noise, 0)} ${esc(v.unitStr("noise", ctx.noise, unitOf(ctx.noise) || "dB"))}`, "mdi:volume-high", v.color("noise", noise, "green"))}
  </div>`;
  return v.wrapSection("air", ctx.compact, body);
};
const renderBattery = (v, ctx) => {
  if (!ctx.showBattery || !ctx.batt || !ctx.battery) return "";
  const text = v.t(ctx.batt.key, { pct: ctx.batt.pct });
  const body = `<div class="battery ${ctx.batt.low ? "warn" : "ok"}" role="button" tabindex="0" data-key="battery" data-entity="${esc(ctx.battery.entity_id)}">
    <ha-icon icon="${ctx.batt.icon}" aria-hidden="true"></ha-icon>
    ${esc(v.label("battery", text))}
  </div>`;
  return v.wrapSection("battery", true, body);
};
const renderComfort = (v, ctx) => {
  if (!v.wantComfort()) return "";
  const { t } = v;
  const band = comfortBandFromConfig(v.config);
  const src = v.conv(v.st("temperature"), "°F").src || "°F";
  const tempPts = (v.comfortTemp.length ? v.comfortTemp : v.history.temperature || []).map((p) => {
    if (p.unavailable) return { state: Number.NaN, last_changed: p.last_changed, unavailable: true };
    const cmp = thresholdCompareValue(p.state, src);
    return cmp == null ? null : { state: cmp, last_changed: p.last_changed };
  }).filter((p) => !!p);
  const humPts = v.comfortHum.length ? v.comfortHum : v.history.humidity || [];
  const win = v.historyWindow || {
    start: Date.now() - v.historyHours() * 36e5,
    end: Date.now()
  };
  const stats = comfortStats(tempPts, humPts, band, win);
  if (!stats.samples.length && !(stats.hoursTotal > 0)) {
    return v.wrapSection("comfort", ctx.compact, `<div class="hint">${esc(t("comfort.empty"))}</div>`);
  }
  const target = v.config.unit_system || "native";
  const lo = convertValue(band.tempMin, "°F", target);
  const hi = convertValue(band.tempMax, "°F", target);
  const bandLabel = `${lo.value == null ? "—" : Math.round(lo.value)}–${hi.value == null ? "—" : Math.round(hi.value)}${lo.unit || "°"} · ${band.humidityMin}–${band.humidityMax}% RH`;
  const pct = stats.pct == null ? "—" : `${stats.pct}%`;
  const fill2 = stats.pct == null ? 0 : Math.min(100, stats.pct);
  const body = `<div class="comfort-panel">
    <div class="comfort-top">
      <div class="comfort-title">${esc(t("comfort.title"))}</div>
      <div class="comfort-pct">${esc(pct)}</div>
    </div>
    <div class="comfort-track" role="progressbar" aria-label="${esc(t("comfort.title"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${fill2}"><div class="comfort-fill" style="width:${fill2}%"></div></div>
    <div class="comfort-meta">${esc(t("comfort.meta", { in: fmtNum(stats.hoursIn, 1), total: fmtNum(stats.hoursTotal, 1), band: bandLabel }))}</div>
    <div role="img" aria-label="${esc(t("comfort.aria", { pct }))}">${comfortScatterSvg(stats.samples, band)}</div>
    <div class="comfort-axes" aria-hidden="true"><span>${esc(t("comfort.cooler"))}</span><span>${esc(t("comfort.temp_axis"))}</span><span>${esc(t("comfort.warmer"))}</span></div>
  </div>`;
  return v.wrapSection("comfort", ctx.compact, body);
};
const renderConditions = (v, ctx) => {
  if (!ctx.showConditions) return "";
  const { t } = v;
  const deg = ctx.tempUnit.includes("°") ? ctx.tempUnit : "°";
  const body = `<div class="grid">
    ${v.tile("temperature", v.label("temperature", t("tile.temperature")), ctx.temp, ctx.t.value == null ? "—" : `${fmtNum(ctx.t.value, 1)}${deg}`, "mdi:thermometer", ctx.tColor, v.histSpark("temperature"))}
    ${v.tile("feels_like", v.label("feels_like", t("tile.feels_like")), ctx.feels, ctx.f.value == null ? "—" : `${fmtNum(ctx.f.value, 1)}°`, "mdi:sun-thermometer-outline", v.color("feels_like", ctx.f.raw, ctx.tColor, ctx.f.src), "", { derived: ctx.feelsDerived })}
    ${v.tile("temp_high", v.label("temp_high", t("tile.temp_high")), ctx.high, ctx.hi.value == null ? "—" : `${Math.round(ctx.hi.value)}°`, "mdi:thermometer-high", "orange")}
    ${v.tile("temp_low", v.label("temp_low", t("tile.temp_low")), ctx.low, ctx.lo.value == null ? "—" : `${Math.round(ctx.lo.value)}°`, "mdi:thermometer-low", "blue")}
    ${v.tile("humidity", v.label("humidity", t("tile.humidity")), ctx.humidity, ctx.h == null ? "—" : `${Math.round(ctx.h)}${esc(v.unitStr("humidity", ctx.humidity, "%"))}`, "mdi:water-percent", v.color("humidity", ctx.h, "blue"), v.histSpark("humidity"))}
    ${v.tile("dew_point", v.label("dew_point", t("tile.dew_point")), ctx.dew, ctx.d.value == null ? "—" : `${fmtNum(ctx.d.value, 1)}°`, "mdi:molecule", v.color("dew_point", ctx.d.raw, "blue", ctx.d.src), "", { derived: ctx.dewDerived })}
  </div>`;
  return v.wrapSection("conditions", ctx.compact, body);
};
function item(v, cls, id, when, f, tempUnit) {
  const target = v.config.unit_system || "native";
  const hi = f.temperature != null ? convertValue(f.temperature, tempUnit, target) : null;
  const lo = cls === "fday" && f.templow != null ? convertValue(f.templow, tempUnit, target) : null;
  const icon = WEATHER_ICONS[f.condition || ""] || "mdi:weather-partly-cloudy";
  const pop = f.precipitation_probability != null ? Math.round(Number(f.precipitation_probability)) : null;
  const tempText = `${hi?.value != null ? Math.round(hi.value) : "—"}°${lo?.value != null ? ` / ${Math.round(lo.value)}°` : ""}`;
  const aria = v.t("forecast.item_aria", { when, temp: tempText, pop: pop != null ? `${pop}%` : "—" });
  return `<div class="${cls}" role="button" tabindex="0" aria-label="${esc(aria)}" data-key="forecast" data-entity="${esc(id)}" data-morph-key="${cls}-${esc(f.datetime || when)}">
    <div class="${cls}-name" aria-hidden="true">${esc(when)}</div>
    <ha-icon icon="${icon}" aria-hidden="true"></ha-icon>
    <div class="${cls}-temp" aria-hidden="true">${tempText}</div>
    ${pop != null ? `<div class="${cls}-pop" aria-hidden="true">${pop}%</div>` : ""}
  </div>`;
}
function hourly(v) {
  if (!v.wantHourly()) return "";
  const id = v.config.weather_entity;
  if (!id) return "";
  const wanted = Math.min(24, Math.max(6, Number(v.config.hourly_forecast_hours) || 24));
  const hours = (v.forecastHours || []).slice(0, wanted);
  if (!hours.length) return "";
  const tempUnit = entityState(v.hass, id)?.attributes?.temperature_unit || "";
  return `<div class="forecast hourly" role="group" aria-label="${esc(v.t("forecast.hourly_region"))}">
    ${hours.map((h) => {
    const d = h.datetime ? new Date(h.datetime) : null;
    const label = d && !Number.isNaN(d.getTime()) ? d.toLocaleTimeString(v.locale, { hour: "numeric" }) : "—";
    return item(v, "fhour", id, label, h, tempUnit);
  }).join("")}
  </div>`;
}
const renderForecast = (v, ctx) => {
  const showDaily = !!v.config.show_forecast;
  const hourlyExplicit = v.config.show_hourly_forecast === true;
  if (!showDaily && !v.wantHourly() && !hourlyExplicit) return "";
  const { t } = v;
  const hourlyHtml = hourly(v);
  const id = v.config.weather_entity;
  let body;
  if (!id) {
    body = `${hourlyHtml}<div class="hint">${esc(t("forecast.pick_entity"))}</div>`;
  } else {
    const st = entityState(v.hass, id);
    if (!st) {
      body = `${hourlyHtml}<div class="hint">${esc(t("forecast.missing", { id }))}</div>`;
    } else {
      let daily = "";
      if (showDaily) {
        const wanted = Math.min(7, Math.max(1, Number(v.config.forecast_days) || 5));
        const days = (v.forecastDays.length ? v.forecastDays : st.attributes.forecast || []).slice(0, wanted);
        if (!days.length) {
          daily = `<div class="hint">${esc(t("forecast.waiting", { id }))}</div>`;
        } else {
          const tempUnit = st.attributes.temperature_unit || "";
          daily = `<div class="forecast" role="group" aria-label="${esc(t("forecast.daily_region"))}">
            ${days.map((d) => {
            const when = d.datetime ? new Date(d.datetime) : null;
            const label = when && !Number.isNaN(when.getTime()) ? when.toLocaleDateString(v.locale, { weekday: "short" }) : "—";
            return item(v, "fday", id, label, d, tempUnit);
          }).join("")}
          </div>`;
        }
      }
      body = `${hourlyHtml}${daily}`;
    }
  }
  return v.wrapSection("forecast", ctx.compact, body);
};
const NON_SENSOR_KEYS = /* @__PURE__ */ new Set(["battery", "signal_strength"]);
function friendlyName(st, prefix) {
  const raw = String(st?.attributes?.friendly_name || st?.entity_id || "");
  const p = String(prefix || "").trim();
  if (!p) return raw;
  const re = new RegExp(`^${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s_-]+`, "i");
  return raw.replace(re, "") || raw;
}
function isBatteryEntity(st) {
  const dc = st.attributes?.device_class;
  if (dc === "battery") return true;
  return /_battery(_\d+)?$/.test(st.entity_id) && /^(sensor|binary_sensor)\./.test(st.entity_id);
}
function discoverBatteries(hass, prefix, explicit, threshold) {
  if (!hass) return [];
  const ids = /* @__PURE__ */ new Set();
  for (const id of explicit || []) if (id) ids.add(id.trim());
  const p = String(prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  if (!explicit?.length && p) {
    for (const st of Object.values(hass.states)) {
      const local = st.entity_id.split(".")[1] || "";
      if (local.startsWith(`${p}_`) && isBatteryEntity(st)) ids.add(st.entity_id);
    }
  }
  const limit = threshold == null || threshold === "" ? 20 : Number(threshold);
  const out = [];
  for (const id of ids) {
    const st = hass.states[id];
    if (!st) continue;
    const level = num(st.state);
    const low = level != null ? Number.isFinite(limit) && level <= limit : st.state === "on" || st.state.toLowerCase() === "low";
    const icon = !available(st) ? "mdi:battery-unknown" : low ? "mdi:battery-alert" : level == null ? "mdi:battery" : level >= 95 ? "mdi:battery" : `mdi:battery-${Math.max(10, Math.min(90, Math.round(level / 10) * 10))}`;
    out.push({ entityId: id, name: friendlyName(st, p), level, low, icon });
  }
  return out.sort((a, b) => Number(b.low) - Number(a.low) || a.name.localeCompare(b.name));
}
function lastReportMs(st) {
  const raw = st?.last_reported;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : null;
}
function healthReport(hass, entities, opts = {}) {
  const report = { total: 0, ok: 0, offline: [], stale: [], batteries: [] };
  if (!hass) return report;
  const now = opts.now ?? Date.now();
  const staleMs = (opts.staleMinutes ?? 30) > 0 ? (opts.staleMinutes ?? 30) * 6e4 : 0;
  const seen = /* @__PURE__ */ new Set();
  for (const [key, id] of Object.entries(entities || {})) {
    if (!id || seen.has(id) || NON_SENSOR_KEYS.has(key)) continue;
    const st = hass.states[id];
    if (!st) continue;
    seen.add(id);
    report.total += 1;
    const name = friendlyName(st, opts.prefix);
    if (!available(st)) {
      report.offline.push({ key, entityId: id, name });
      continue;
    }
    const reported = lastReportMs(st);
    if (staleMs && reported != null && now - reported > staleMs) {
      report.stale.push({ key, entityId: id, name, ageMs: now - reported });
      continue;
    }
    report.ok += 1;
  }
  report.batteries = discoverBatteries(hass, opts.prefix, opts.batteryEntities, opts.batteryThreshold);
  return report;
}
function batteryList(raw) {
  if (!raw) return void 0;
  const list = Array.isArray(raw) ? raw : String(raw).split(",");
  const out = list.map((s) => String(s).trim()).filter(Boolean);
  return out.length ? out : void 0;
}
const renderHealth = (v, ctx) => {
  if (!ctx.showHealth || !v.hass) return "";
  const { t } = v;
  const report = healthReport(v.hass, v.config.entities, {
    prefix: v.config.prefix,
    staleMinutes: Number.isFinite(Number(v.config.stale_minutes)) ? Number(v.config.stale_minutes) : 30,
    batteryEntities: batteryList(v.config.battery_entities),
    batteryThreshold: v.config.battery_warning_threshold
  });
  const signal = ctx.signal;
  const problems = report.offline.length + report.stale.length;
  if (!report.batteries.length && !signal && !problems) return "";
  if (!report.total && !report.batteries.length && !signal) return "";
  const ok = problems === 0;
  const summary = ok ? t("health.all_ok", { total: report.total }) : t("health.reporting", { ok: report.ok, total: report.total });
  const issues = [
    ...report.offline.map((s) => ({ ...s, note: t("health.offline"), icon: "mdi:lan-disconnect", cls: "bad" })),
    ...report.stale.map((s) => ({
      ...s,
      note: t("health.stale", { when: relativeTime(new Date(Date.now() - (s.ageMs || 0)), v.locale) }),
      icon: "mdi:clock-alert-outline",
      cls: "warn"
    }))
  ];
  const issueHtml = issues.length ? `<ul class="health-list" aria-label="${esc(t("health.offline"))}">${issues.map((s) => `<li><button class="health-row ${s.cls}" data-key="${esc(s.key)}" data-entity="${esc(s.entityId)}">
          <ha-icon icon="${s.icon}" aria-hidden="true"></ha-icon>
          <span class="health-name">${esc(s.name)}</span>
          <span class="health-note">${esc(s.note)}</span>
        </button></li>`).join("")}</ul>` : "";
  const battHtml = report.batteries.length ? `<div class="health-sub">${esc(t("health.batteries"))}</div>
      <ul class="health-batteries">${report.batteries.map((b) => {
    const value = b.level != null ? `${Math.round(b.level)}%` : b.low ? t("health.battery_low") : t("health.battery_ok");
    return `<li><button class="health-batt ${b.low ? "low" : ""}" data-key="battery_${esc(b.entityId)}" data-entity="${esc(b.entityId)}" aria-label="${esc(`${b.name}: ${value}${b.low && b.level != null ? ` (${t("health.battery_low")})` : ""}`)}">
            <ha-icon icon="${b.icon}" aria-hidden="true"></ha-icon>
            <span class="health-name">${esc(b.name)}</span>
            <span class="health-note">${esc(value)}</span>
          </button></li>`;
  }).join("")}</ul>` : "";
  const sigVal = num(signal?.state);
  const signalTile = signal ? `<div class="grid">${v.tile("signal_strength", v.label("signal_strength", t("tile.signal_strength")), signal, sigVal == null ? "—" : `${fmtNum(sigVal, 0)} ${esc(v.unitStr("signal_strength", signal, unitOf(signal)))}`.trim(), "mdi:wifi", "teal")}</div>` : "";
  const body = `<div class="health-summary ${ok ? "ok" : "warn"}" role="status">
      <ha-icon icon="${ok ? "mdi:check-network-outline" : "mdi:alert-network-outline"}" aria-hidden="true"></ha-icon>
      <span>${esc(summary)}</span>
    </div>
    ${issueHtml}
    ${signalTile}
    ${battHtml}`;
  return v.wrapSection("health", ctx.compact, body);
};
const renderLightning = (v, ctx) => {
  if (!ctx.showLightning) return "";
  const { t } = v;
  const count = num(ctx.lightningCount?.state);
  const dist = num(ctx.lightningDistance?.state);
  const distSrc = unitOf(ctx.lightningDistance) || "mi";
  const body = `<div class="grid">
    ${v.tile("lightning_count", v.label("lightning_count", t("tile.lightning_count")), ctx.lightningCount, count == null ? "—" : `${fmtNum(count, 0)}`, "mdi:flash", (count ?? 0) > 0 ? "amber" : "grey")}
    ${v.tile("lightning_distance", v.label("lightning_distance", t("tile.lightning_distance")), ctx.lightningDistance, dist == null ? "—" : v.fmt("lightning_distance", ctx.lightningDistance, 0, distSrc), "mdi:map-marker-distance", "orange")}
    ${v.tile("lightning_time", v.label("lightning_time", t("tile.lightning_time")), ctx.lightningTime, formatLastRain(ctx.lightningTime, v.hass, v.locale), "mdi:clock-outline", "amber")}
  </div>`;
  return v.wrapSection("lightning", ctx.compact, body);
};
function totalsSparkline(items, aria) {
  const vals = items.map((i) => i.value).filter((x) => x != null && x >= 0);
  const max = Math.max(...vals, 0.01);
  const bars = items.map((i) => {
    const h = i.value == null ? 2 : Math.max(4, Math.round(i.value / max * 36));
    const on = i.value != null && i.value > 0;
    return `<div class="bar-col"><div class="bar ${on ? "on" : ""}" style="height:${h}px"></div><div class="bar-lab">${esc(i.label)}</div></div>`;
  }).join("");
  return `<div class="spark" role="img" aria-label="${esc(aria)}">${bars}</div>`;
}
function precipTimeline(v) {
  if (!v.wantPrecipTimeline()) return "";
  const hours = v.historyHours();
  const bars = v.precipBars || precipTimelineBars(v.history.rain_rate || [], hours, Math.min(36, Math.max(12, hours)));
  if (!bars.length || !v.precipBars && !(v.history.rain_rate || []).length) return "";
  const peakRaw = Math.max(...bars.map((b) => b.value), 0);
  const rate = v.conv(v.st("rain_rate"), "in/h");
  const peak = convertValue(peakRaw, rate.src || "in/h", v.config.unit_system || "native");
  const peakFmt = peakRaw > 0 ? `${fmtNum(peak.value, 2)} ${peak.unit}`.trim() : "0";
  const entity = v.config.entities?.rain_rate || "";
  return `<div class="precip-timeline" role="button" tabindex="${entity ? 0 : -1}" aria-label="${esc(v.t("precip.aria", { hours, peak: peakFmt }))}" data-key="rain_rate" data-entity="${esc(entity)}">
    <div class="precip-timeline-top" aria-hidden="true">
      <span>${esc(v.t("precip.title"))}</span>
      <span class="precip-timeline-meta">${esc(v.t("precip.meta", { hours, peak: peakFmt }))}</span>
    </div>
    ${precipTimelineSvg(bars)}
  </div>`;
}
function rainGoal(v, ctx) {
  const { t } = v;
  const normal = num(v.config.rain_month_normal);
  const monthConv = v.conv(ctx.month, "in");
  const progress = rainMonthProgress(monthConv.raw, normal);
  const target = v.config.unit_system || "native";
  const monthVal = monthConv.value;
  const normalVal = normal == null ? null : convertValue(normal, monthConv.src || "in", target).value;
  const daysSince = daysSinceTimestamp(ctx.lastRain?.state);
  const daysText = daysSince == null ? "" : daysSince < 1 ? "<1" : fmtNum(daysSince, 0);
  if (progress.pct != null) {
    const since = daysSince == null ? "" : ` · ${t(daysSince >= 1.5 ? "rain.since_other" : "rain.since_one", { n: daysText })}`;
    return `<div class="rain-goal">
      <div class="rain-goal-top">
        <span>${esc(t("rain.month_vs_normal"))}</span>
        <span>${fmtNum(monthVal, 2)} / ${fmtNum(normalVal, 2)}</span>
      </div>
      <div class="rain-goal-track" role="progressbar" aria-label="${esc(t("rain.month_vs_normal"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, progress.pct)}" aria-valuetext="${esc(t("rain.pct_normal", { pct: progress.pct }))}"><div class="rain-goal-fill" style="width:${Math.min(100, progress.pct)}%"></div></div>
      <div class="rain-goal-meta">${esc(t("rain.pct_normal", { pct: progress.pct }) + since)}</div>
    </div>`;
  }
  if (daysSince != null) {
    return `<div class="rain-goal"><div class="rain-goal-top"><span>${esc(t("rain.days_since"))}</span><span>${esc(daysText)}</span></div></div>`;
  }
  return "";
}
const renderRain = (v, ctx) => {
  if (!ctx.showRain) return "";
  const { t } = v;
  const totals = {
    today: num(ctx.today?.state),
    event: num(ctx.event?.state),
    week: num(ctx.week?.state),
    month: num(ctx.month?.state),
    year: num(ctx.year?.state)
  };
  const ariaTotals = t("rain.spark_aria", {
    today: v.fmt("rain_today", ctx.today, 2, "in"),
    event: v.fmt("rain_event", ctx.event, 2, "in"),
    week: v.fmt("rain_week", ctx.week, 2, "in"),
    month: v.fmt("rain_month", ctx.month, 2, "in"),
    year: v.fmt("rain_year", ctx.year, 2, "in")
  });
  const wet = (n, on) => (n ?? 0) > 0 ? on : "grey";
  const body = `
    ${rainGoal(v, ctx)}
    ${precipTimeline(v)}
    ${totalsSparkline([
    { label: t("rain.spark_today"), value: totals.today },
    { label: t("rain.spark_event"), value: totals.event },
    { label: t("rain.spark_week"), value: totals.week },
    { label: t("rain.spark_month"), value: totals.month },
    { label: t("rain.spark_year"), value: totals.year }
  ], ariaTotals)}
    <div class="grid">
      ${v.tile("rain_rate", v.label("rain_rate", t("tile.rain_rate")), ctx.rate, ctx.rr.value == null ? "—" : `${fmtNum(ctx.rr.value, 2)} ${esc(v.unitStr("rain_rate", ctx.rate, ctx.rr.unit || ""))}`.trim(), "mdi:weather-rainy", ctx.raining ? "blue" : "grey")}
      ${v.tile("rain_today", v.label("rain_today", t("tile.rain_today")), ctx.today, v.fmt("rain_today", ctx.today, 2, "in"), "mdi:cup-water", wet(totals.today, "cyan"))}
      ${v.tile("rain_event", v.label("rain_event", t("tile.rain_event")), ctx.event, v.fmt("rain_event", ctx.event, 2, "in"), "mdi:weather-pouring", wet(totals.event, "blue"))}
      ${v.tile("rain_week", v.label("rain_week", t("tile.rain_week")), ctx.week, v.fmt("rain_week", ctx.week, 2, "in"), "mdi:calendar-week", wet(totals.week, "blue"))}
      ${v.tile("rain_month", v.label("rain_month", t("tile.rain_month")), ctx.month, v.fmt("rain_month", ctx.month, 2, "in"), "mdi:calendar-month", wet(totals.month, "blue"))}
      ${v.tile("rain_year", v.label("rain_year", t("tile.rain_year")), ctx.year, v.fmt("rain_year", ctx.year, 2, "in"), "mdi:calendar-star", wet(totals.year, "blue"))}
      ${v.tile("last_rain", v.label("last_rain", t("tile.last_rain")), ctx.lastRain, formatLastRain(ctx.lastRain, v.hass, v.locale), "mdi:clock-outline", "blue")}
    </div>`;
  return v.wrapSection("rain", ctx.compact, body);
};
const renderRecords = (v, ctx) => {
  if (!v.wantRecords()) return "";
  const { t } = v;
  const book = v.recordsBook;
  const period = v.config.records_period === "year" ? t("records.year") : t("records.month");
  const target = v.config.unit_system || "native";
  const tempSrc = v.conv(ctx.temp, "°F").src || "°F";
  const gustSrc = v.conv(ctx.gust || ctx.maxGust, "mph").src || "mph";
  const rateSrc = v.conv(ctx.rate, "in/h").src || "in/h";
  const rainSrc = v.conv(ctx.today, "in").src || "in";
  const when = (ex) => relativeTime(new Date(ex.at), v.locale);
  const fmt = (ex, src, digits, fallbackUnit, isTemp = false) => {
    if (!ex) return { value: "—", when: "" };
    const c = convertValue(ex.value, src, target);
    if (c.value == null) return { value: "—", when: when(ex) };
    const value = isTemp ? `${Math.round(c.value)}°` : `${fmtNum(c.value, digits)} ${esc(c.unit || fallbackUnit)}`.trim();
    return { value, when: when(ex) };
  };
  if (!book || !book.hottest && !book.coldest && !book.peakGust && !book.peakRainRate && !book.wettestDay) {
    return v.wrapSection("records", ctx.compact, `<div class="hint">${esc(t("records.empty", { period: period.toLowerCase() }))}</div>`);
  }
  const rows = [
    { label: t("records.hottest", { period }), ex: book.hottest, out: fmt(book.hottest, tempSrc, 0, "°", true) },
    { label: t("records.coldest", { period }), ex: book.coldest, out: fmt(book.coldest, tempSrc, 0, "°", true) },
    { label: t("records.peak_gust", { period }), ex: book.peakGust, out: fmt(book.peakGust, gustSrc, 1, "mph") },
    { label: t("records.peak_rate", { period }), ex: book.peakRainRate, out: fmt(book.peakRainRate, rateSrc, 2, "") },
    { label: t("records.wettest", { period }), ex: book.wettestDay, out: fmt(book.wettestDay, rainSrc, 2, "in") }
  ];
  const tiles = rows.map(({ label, ex, out }) => {
    const set = isRecordSetToday(ex);
    return `<div class="record-tile ${set ? "set" : ""}" role="listitem">
        <div class="record-label">${esc(label)}</div>
        <div class="record-value">${out.value}</div>
        ${out.when ? `<div class="record-when">${esc(out.when)}</div>` : ""}
        ${set ? `<span class="record-badge">${esc(t("records.set_today"))}</span>` : ""}
      </div>`;
  }).join("");
  const source = v.recordsSource === "history" ? `<div class="records-source warn">${esc(t("records.source_history"))}</div>` : "";
  return v.wrapSection(
    "records",
    ctx.compact,
    `<div class="records-grid" role="list" aria-label="${esc(t("records.title", { period }))}">${tiles}</div>${source}`
  );
};
const renderSoil = (v, ctx) => {
  if (!ctx.showSoil) return "";
  const { t } = v;
  const parts = [];
  for (let i = 1; i <= 8; i++) {
    const mKey = `soil_moisture_${i}`;
    const tKey = `soil_temperature_${i}`;
    const mSt = v.st(mKey);
    const tSt = v.st(tKey);
    const moisture = num(mSt?.state);
    const tConv = v.conv(tSt, "°F");
    parts.push(
      v.tile(mKey, v.label(mKey, t("tile.soil_moisture", { n: i })), mSt, moisture == null ? "—" : `${Math.round(moisture)}%`, "mdi:water", v.color(mKey, moisture, "green")),
      v.tile(tKey, v.label(tKey, t("tile.soil_temperature", { n: i })), tSt, tSt && tConv.value != null ? `${fmtNum(tConv.value, 1)}°` : "—", "mdi:thermometer", v.color("temperature", num(tSt?.state), "amber", tConv.src || "°F"))
    );
  }
  const leaf = v.st("leaf_wetness");
  const leafN = num(leaf?.state);
  parts.push(v.tile("leaf_wetness", v.label("leaf_wetness", t("tile.leaf_wetness")), leaf, leafN == null ? "—" : `${Math.round(leafN)}%`, "mdi:leaf", v.color("leaf_wetness", leafN, "cyan")));
  return v.wrapSection("soil", ctx.compact, `<div class="grid">${parts.join("")}</div>`);
};
const renderStation = (v, ctx) => {
  if (!ctx.showMore) return "";
  const { t } = v;
  const pressureLabel = ctx.trend.key ? t("tile.pressure_trend", { trend: v.meta(ctx.trend) }) : t("tile.pressure");
  const indoorT = v.conv(ctx.indoorT, "°F");
  const indoorH = num(ctx.indoorH?.state);
  const co2 = num(ctx.co2?.state);
  const pDigits = (st) => /inhg/i.test(v.conv(st, "inHg").unit) ? 2 : 1;
  const body = `<div class="grid">
    ${v.tile("pressure", v.label("pressure", pressureLabel), ctx.pressure, v.fmt("pressure", ctx.pressure, pDigits(ctx.pressure), unitOf(ctx.pressure) || "inHg"), ctx.trend.icon || "mdi:gauge", ctx.trend.color === "grey" ? "teal" : ctx.trend.color, v.histSpark("pressure"))}
    ${v.tile("pressure_abs", v.label("pressure_abs", t("tile.pressure_abs")), ctx.pressureAbs, v.fmt("pressure_abs", ctx.pressureAbs, pDigits(ctx.pressureAbs), unitOf(ctx.pressureAbs) || "inHg"), "mdi:gauge", "teal")}
    ${v.tile("indoor_temperature", v.label("indoor_temperature", t("tile.indoor_temperature")), ctx.indoorT, ctx.indoorT && indoorT.value != null ? `${fmtNum(indoorT.value, 1)}°` : "—", "mdi:home-thermometer", v.color("temperature", num(ctx.indoorT?.state), "green", indoorT.src || "°F"))}
    ${v.tile("indoor_humidity", v.label("indoor_humidity", t("tile.indoor_humidity")), ctx.indoorH, indoorH == null ? "—" : `${Math.round(indoorH)}%`, "mdi:water-percent", v.color("humidity", indoorH, "cyan"))}
    ${v.tile("co2", v.label("co2", t("tile.co2")), ctx.co2, co2 == null ? "—" : `${fmtNum(co2, 0)} ${esc(v.unitStr("co2", ctx.co2, "ppm"))}`, "mdi:molecule-co2", v.color("co2", co2, "green"))}
  </div>`;
  return v.wrapSection("station", ctx.compact, body);
};
const renderSun = (v, ctx) => {
  if (!ctx.showSun) return "";
  const { t } = v;
  const moonLabel = v.meta(ctx.moonMeta);
  const body = `<div class="grid">
    ${v.tile("uv", v.label("uv", ctx.uvn == null ? t("tile.uv") : v.meta(ctx.uvm)), ctx.uv, ctx.uvn == null ? "—" : `${fmtNum(ctx.uvn, 0)}`, "mdi:weather-sunny-alert", ctx.uvm.color)}
    ${v.tile("irradiance", v.label("irradiance", t("tile.irradiance")), ctx.irr, num(ctx.irr?.state) == null ? "—" : `${fmtNum(num(ctx.irr?.state), 0)} ${esc(v.unitStr("irradiance", ctx.irr, unitOf(ctx.irr)))}`.trim(), "mdi:solar-power-variant", "amber")}
    ${v.tile("illuminance", v.label("illuminance", t("tile.illuminance")), ctx.lux, num(ctx.lux?.state) == null ? "—" : `${fmtNum(num(ctx.lux?.state), 0)} ${esc(v.unitStr("illuminance", ctx.lux, "lx"))}`, "mdi:brightness-5", "amber")}
    ${ctx.sunrise ? v.tile("sunrise", t("tile.sunrise"), ctx.sun, ctx.sunrise, "mdi:weather-sunset-up", "amber") : ""}
    ${ctx.sunset ? v.tile("sunset", t("tile.sunset"), ctx.sun, ctx.sunset, "mdi:weather-sunset-down", "orange") : ""}
    ${ctx.moon ? v.tile("moon", t("moon.label"), ctx.moon, moonLabel, ctx.moonMeta.icon, "purple") : ""}
  </div>`;
  return v.wrapSection("sun", ctx.compact, body);
};
function compass(v, deg, card) {
  const valid = Number.isFinite(deg);
  const angle = valid ? deg : 0;
  const entity = v.st("wind_direction")?.entity_id || "";
  const aria = valid ? v.t("wind.compass_aria", { dir: card || "—", deg: Math.round(deg) }) : v.t("wind.compass_none");
  return `
    <div class="compass" role="button" tabindex="${entity ? 0 : -1}" aria-label="${esc(aria)}" data-key="wind_direction" data-entity="${esc(entity)}">
      <svg viewBox="0 0 100 100" class="compass-svg ${valid ? "" : "muted"}" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="2"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="1"/>
        <circle cx="50" cy="50" r="3" fill="currentColor"/>
        <text x="50" y="16" text-anchor="middle" font-size="9" fill="currentColor">N</text>
        <text x="50" y="94" text-anchor="middle" font-size="9" fill="currentColor">S</text>
        <text x="10" y="54" text-anchor="middle" font-size="9" fill="currentColor">W</text>
        <text x="90" y="54" text-anchor="middle" font-size="9" fill="currentColor">E</text>
        <g class="compass-needle" style="transform: rotate(${angle}deg)">
          <polygon points="50,12 55,48 50,42 45,48" fill="${iconColorVar("teal")}"/>
        </g>
      </svg>
      <div class="compass-label" aria-hidden="true">${esc(card || "—")} ${valid ? `${Math.round(deg)}°` : ""}</div>
    </div>
  `;
}
const renderWind = (v, ctx) => {
  if (!ctx.showWind) return "";
  const { t } = v;
  const rosePts = v.history.wind_direction || [];
  let rose = "";
  if (v.config.show_wind_rose !== false && rosePts.length) {
    const bins = windRoseBins(rosePts.map((p) => p.state));
    const top = bins.reduce((a, b) => b.count > a.count ? b : a, bins[0]);
    const hours = v.historyHours();
    rose = `<div class="wind-rose" role="button" tabindex="0" aria-label="${esc(t("wind.rose_aria", { hours, dir: top?.label || "—" }))}" data-key="wind_direction" data-entity="${esc(ctx.wdir?.entity_id || "")}">
      ${windRoseSvg(bins)}
      <div class="wind-rose-label" aria-hidden="true">${esc(t("wind.rose", { hours }))}</div>
    </div>`;
  }
  const speedLabel = ctx.bf != null ? t("tile.wind_speed_bf", { n: ctx.bf }) : t("tile.wind_speed");
  const body = `<div class="wind-row ${rose ? "with-rose" : ""}">
    ${compass(v, ctx.deg, ctx.card)}
    ${rose}
    <div class="grid wind-grid">
      ${v.tile("wind_speed", v.label("wind_speed", speedLabel), ctx.wind, ctx.ws.value == null ? "—" : `${fmtNum(ctx.ws.value, 1)} ${esc(v.unitStr("wind_speed", ctx.wind, ctx.ws.unit || "mph"))}`, "mdi:weather-windy", v.color("wind_speed", ctx.ws.raw, "teal", ctx.ws.src || "mph"), v.histSpark("wind_speed"))}
      ${v.tile("wind_gust", v.label("wind_gust", t("tile.wind_gust")), ctx.gust, ctx.wg.value == null ? "—" : `${fmtNum(ctx.wg.value, 1)}`, "mdi:windsock", v.color("wind_gust", ctx.wg.raw, "teal", ctx.wg.src || "mph"))}
      ${v.tile("max_gust", v.label("max_gust", t("tile.max_gust")), ctx.maxGust, num(ctx.maxGust?.state) == null ? "—" : v.fmt("max_gust", ctx.maxGust, 1, "mph"), "mdi:weather-windy-variant", "teal")}
    </div>
  </div>`;
  return v.wrapSection("wind", ctx.compact, body);
};
function renderAlerts(v) {
  if (v.config.show_alerts === false) return "";
  const weather = entityState(v.hass, v.config.weather_entity);
  const alertEnt = entityState(v.hass, v.config.alert_entity);
  const alerts = collectAlerts(weather, alertEnt).slice(0, 3);
  if (!alerts.length) return "";
  const entityId = v.config.alert_entity || v.config.weather_entity || "";
  return `<div class="alerts" role="region" aria-label="${esc(v.t("alerts.region"))}">${alerts.map((a, i) => {
    const sev = alertSeverityColor(a.severity);
    const title = a.title || a.event || v.t("alerts.default");
    const desc = a.description || "";
    return `<button class="alert sev-${sev}" data-key="alert" data-entity="${esc(entityId)}" data-morph-key="alert-${i}-${esc(title)}">
        <ha-icon icon="mdi:alert" style="color:${iconColorVar(sev)}" aria-hidden="true"></ha-icon>
        <div>
          <div class="alert-title">${esc(title)}</div>
          ${desc ? `<div class="alert-desc">${esc(desc)}</div>` : ""}
        </div>
      </button>`;
  }).join("")}</div>`;
}
function renderChips(v, ctx, expanded) {
  const { t } = v;
  const h = num(ctx.humidity?.state);
  const uv = num(ctx.uv?.state);
  const primary = [
    { key: "temperature", st: ctx.temp, icon: "mdi:thermometer", text: ctx.t.value == null ? "—" : `${Math.round(ctx.t.value)}°`, label: t("tile.temperature") },
    { key: "feels_like", st: ctx.feels, icon: "mdi:sun-thermometer", text: ctx.f.value == null ? "—" : `${Math.round(ctx.f.value)}°`, label: t("tile.feels_like") },
    { key: "humidity", st: ctx.humidity, icon: "mdi:water-percent", text: h == null ? "—" : `${Math.round(h)}%`, label: t("tile.humidity") },
    { key: "rain_today", st: ctx.today, icon: ctx.raining ? "mdi:weather-pouring" : "mdi:weather-rainy", text: v.fmt("rain_today", ctx.today, 2, "in"), label: t("tile.rain_today") },
    { key: "wind_speed", st: ctx.wind, icon: "mdi:weather-windy", text: v.fmt("wind_speed", ctx.wind, 0, "mph"), label: t("tile.wind_speed") }
  ].filter((c) => !!c.st);
  const extra = [
    { key: "pressure", st: ctx.pressure, icon: "mdi:gauge", text: v.fmt("pressure", ctx.pressure, 2, "inHg"), label: t("tile.pressure") },
    { key: "uv", st: ctx.uv, icon: "mdi:weather-sunny-alert", text: uv == null ? "—" : `${fmtNum(uv, 0)} UV`, label: t("tile.uv") },
    { key: "wind_gust", st: ctx.gust, icon: "mdi:windsock", text: v.fmt("wind_gust", ctx.gust, 0, "mph"), label: t("tile.wind_gust") }
  ].filter((c) => !!c.st);
  const chip = (c) => `<button class="chip" data-key="${c.key}" data-entity="${esc(c.st.entity_id)}" aria-label="${esc(`${v.label(c.key, c.label)}: ${c.text}`)}"><ha-icon icon="${c.icon}" aria-hidden="true"></ha-icon><span aria-hidden="true">${esc(c.text)}</span></button>`;
  const toggle = expanded ? t("chips.less") : t("chips.more");
  return `<div class="chips-bar ${expanded ? "expanded" : ""}" role="group" aria-label="${esc(t("chips.region"))}">
    <div class="chips">
      ${primary.map(chip).join("")}
      ${extra.length ? `<button class="chip expand" data-key="__chips_expand" data-entity="" aria-expanded="${expanded}" aria-controls="chips-extra"><ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon><span>${esc(toggle)}</span></button>` : ""}
    </div>
    ${extra.length ? `<div class="chips-extra" id="chips-extra" ${expanded ? "" : "hidden"}>${extra.map(chip).join("")}</div>` : ""}
  </div>`;
}
const SECTION_RENDERERS = {
  conditions: renderConditions,
  wind: renderWind,
  rain: renderRain,
  sun: renderSun,
  soil: renderSoil,
  lightning: renderLightning,
  air: renderAir,
  station: renderStation,
  health: renderHealth,
  records: renderRecords,
  comfort: renderComfort,
  forecast: renderForecast,
  battery: renderBattery
};
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
    display: block;
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
    /* Scroll instead of widening the card to fit every hour. */
    contain: inline-size;
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

  .precip-timeline {
    margin: 0 0 10px;
    padding: 10px 12px 8px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
    color: var(--mws-primary);
  }
  .precip-timeline-top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    font-weight: 650;
    color: var(--primary-text-color);
    margin-bottom: 6px;
  }
  .precip-timeline-meta {
    font-size: 11.5px;
    color: var(--secondary-text-color);
    font-weight: 500;
  }
  .precip-timeline-svg { display: block; color: var(--mws-primary); }

  .records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: var(--mws-gap);
  }
  .record-tile {
    display: grid;
    gap: 4px;
    padding: 10px 12px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
    text-align: left;
  }
  .record-tile.set {
    border-color: color-mix(in srgb, var(--mws-accent) 55%, transparent);
    background: color-mix(in srgb, var(--mws-accent) 12%, transparent);
  }
  .record-label {
    font-size: 11.5px;
    color: var(--secondary-text-color);
    font-weight: 650;
    letter-spacing: 0.02em;
    text-transform: uppercase;
  }
  .record-value {
    font-size: 18px;
    font-weight: 700;
    line-height: 1.15;
  }
  .record-when {
    font-size: 11.5px;
    color: var(--secondary-text-color);
  }
  .record-badge {
    display: inline-flex;
    align-items: center;
    width: fit-content;
    margin-top: 2px;
    padding: 2px 7px;
    border-radius: 999px;
    font-size: 10.5px;
    font-weight: 700;
    background: color-mix(in srgb, var(--mws-accent) 22%, transparent);
    color: var(--primary-text-color);
  }

  .comfort-panel {
    display: grid;
    gap: 10px;
    padding: 10px 12px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .comfort-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    align-items: baseline;
  }
  .comfort-title { font-size: 13px; font-weight: 650; }
  .comfort-pct { font-size: 18px; font-weight: 700; color: var(--primary-text-color); }
  .comfort-track {
    height: 8px;
    border-radius: 999px;
    background: var(--mws-surface-strong);
    overflow: hidden;
  }
  .comfort-fill {
    height: 100%;
    border-radius: inherit;
    background: linear-gradient(90deg, var(--mws-primary), var(--mws-accent));
  }
  .comfort-meta {
    font-size: 12px;
    color: var(--secondary-text-color);
  }
  .comfort-scatter {
    display: block;
    color: var(--mws-primary);
    margin-top: 2px;
  }
  .comfort-axes {
    display: flex;
    justify-content: space-between;
    font-size: 10.5px;
    color: var(--secondary-text-color);
  }

  /* Seasonal skins — soft HA-token accents by season / condition */
  ha-card.skin-spring {
    --mws-primary: var(--green-color, #66bb6a);
    --mws-accent: var(--teal-color, #26a69a);
  }
  ha-card.skin-summer {
    --mws-primary: var(--amber-color, #ffca28);
    --mws-accent: var(--orange-color, #ff9800);
  }
  ha-card.skin-autumn {
    --mws-primary: var(--orange-color, #ff9800);
    --mws-accent: var(--amber-color, #ffc107);
  }
  ha-card.skin-winter {
    --mws-primary: var(--blue-color, #42a5f5);
    --mws-accent: var(--cyan-color, #26c6da);
  }
  ha-card.cond-rain {
    box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--blue-color, #2196f3) 55%, transparent);
  }
  ha-card.cond-storm {
    box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--purple-color, #9c27b0) 55%, transparent);
  }
  ha-card.cond-snow {
    box-shadow: inset 0 -2px 0 color-mix(in srgb, var(--cyan-color, #00bcd4) 55%, transparent);
  }
  ha-card.cond-clear .hero-icon {
    filter: drop-shadow(0 0 10px color-mix(in srgb, var(--mws-accent) 45%, transparent));
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

  /* --- 0.9: headings, focus, motion ------------------------------------- */
  h2.title, h3.section-label { margin: 0; }
  h3.section-label { padding: 0 4px 8px; }
  .compass, .wind-rose, .precip-timeline, .battery, .fday, .fhour { cursor: pointer; }
  button:focus-visible,
  [role="button"]:focus-visible,
  .graph-chart:focus-visible {
    outline: 2px solid var(--mws-primary);
    outline-offset: 2px;
  }
  .compass-needle {
    transform-box: view-box;
    transform-origin: 50px 50px;
    transition: transform 420ms ease;
  }
  .tile.derived .tile-label { font-style: italic; }
  .records-source {
    margin-top: 6px;
    font-size: 11px;
    color: var(--secondary-text-color);
  }
  .records-source.warn { color: var(--warning-color, #ff9800); }
  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      transition-duration: 0.01ms !important;
      animation-duration: 0.01ms !important;
    }
  }

  /* --- Station health --------------------------------------------------- */
  .health-summary {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    font-size: 12.5px;
    font-weight: 600;
  }
  .health-summary ha-icon { --mdc-icon-size: 18px; }
  .health-summary.ok ha-icon { color: var(--success-color, #4caf50); }
  .health-summary.warn ha-icon { color: var(--warning-color, #ff9800); }
  .health-sub {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
    margin: 10px 4px 4px;
  }
  .health-list, .health-batteries {
    list-style: none;
    margin: 6px 0 0;
    padding: 0;
    display: grid;
    gap: 4px;
  }
  .health-batteries { grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); }
  .health-row, .health-batt {
    display: flex;
    align-items: center;
    gap: 8px;
    width: 100%;
    padding: 6px 8px;
    border: 1px solid var(--mws-border);
    border-radius: var(--mws-radius-sm);
    background: transparent;
    color: inherit;
    font: inherit;
    font-size: 12px;
    text-align: left;
    cursor: pointer;
  }
  .health-row ha-icon, .health-batt ha-icon { --mdc-icon-size: 16px; color: var(--secondary-text-color); }
  .health-row.bad ha-icon, .health-batt.low ha-icon { color: var(--error-color, #f44336); }
  .health-row.warn ha-icon { color: var(--warning-color, #ff9800); }
  .health-name { flex: 1; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .health-note { color: var(--secondary-text-color); font-variant-numeric: tabular-nums; }
  .health-batt.low .health-note { color: var(--error-color, #f44336); font-weight: 700; }
  .section[data-section="health"] .grid { margin-top: 6px; }

  /* --- Graph popup ------------------------------------------------------ */
  dialog.graph-dialog {
    padding: 0;
    border: 0;
    border-radius: var(--mws-radius);
    width: min(560px, calc(100vw - 24px));
    max-height: calc(100vh - 24px);
    background: var(--ha-card-background, var(--card-background-color, #fff));
    color: var(--primary-text-color);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.35);
  }
  dialog.graph-dialog::backdrop { background: rgba(0, 0, 0, 0.45); }
  .graph-inner { padding: 16px 16px 12px; display: grid; gap: 10px; }
  .graph-head { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .graph-head h2 { margin: 0; font-size: 16px; font-weight: 650; }
  .graph-icon-btn, .graph-more, .graph-range {
    border: 1px solid var(--mws-border);
    background: transparent;
    color: inherit;
    font: inherit;
    border-radius: 999px;
    cursor: pointer;
  }
  .graph-icon-btn { width: 36px; height: 36px; display: grid; place-items: center; }
  .graph-ranges { display: flex; gap: 6px; }
  .graph-range { padding: 5px 12px; font-size: 12.5px; }
  .graph-range[aria-checked="true"] {
    background: color-mix(in srgb, var(--mws-primary) 18%, transparent);
    border-color: color-mix(in srgb, var(--mws-primary) 50%, transparent);
    font-weight: 650;
  }
  .graph-body { min-height: 170px; }
  .graph-empty { display: grid; place-items: center; min-height: 160px; color: var(--secondary-text-color); font-size: 13px; }
  .graph-chart { color: var(--mws-primary); border-radius: var(--mws-radius-sm); touch-action: pan-y; }
  .graph-svg { display: block; overflow: visible; }
  .graph-line { fill: none; stroke: currentColor; stroke-width: 2; vector-effect: non-scaling-stroke; stroke-linejoin: round; }
  .graph-band { fill: currentColor; opacity: 0.16; }
  .graph-grid { stroke: var(--primary-text-color); stroke-opacity: 0.08; vector-effect: non-scaling-stroke; }
  .graph-cursor { stroke: var(--primary-text-color); stroke-opacity: 0.5; stroke-dasharray: 3 3; vector-effect: non-scaling-stroke; }
  .graph-dot { display: none; }
  .graph-axis, .graph-source { display: flex; justify-content: space-between; font-size: 11px; color: var(--secondary-text-color); }
  .graph-readout { min-height: 1.2em; font-size: 12.5px; font-weight: 600; font-variant-numeric: tabular-nums; }
  .graph-stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; margin: 0; }
  .graph-stats div { padding: 6px 8px; border-radius: var(--mws-radius-sm); background: var(--mws-surface); }
  .graph-stats dt { font-size: 11px; color: var(--secondary-text-color); }
  .graph-stats dd { margin: 2px 0 0; font-size: 14px; font-weight: 650; font-variant-numeric: tabular-nums; }
  .graph-foot { display: flex; justify-content: flex-end; }
  .graph-more { padding: 6px 14px; font-size: 12.5px; }
`;
const CARD_VERSION = "0.9.0";
const RANGE_MS = {
  "24h": 24 * 36e5,
  "7d": 7 * 864e5,
  "30d": 30 * 864e5
};
function numberLocaleFor(hass, language) {
  const pref = hass?.locale?.number_format;
  if (pref === "comma_decimal" || pref === "none") return "en";
  if (pref === "decimal_comma") return "de";
  if (pref === "space_comma") return "fr";
  if (pref === "system" && typeof navigator !== "undefined") return navigator.language;
  return language;
}
const _MushroomWeatherStationCard = class _MushroomWeatherStationCard extends HTMLElement {
  constructor() {
    super(...arguments);
    this._card = null;
    this._dialog = null;
    this._forecastSubId = null;
    this._forecastUnsub = null;
    this._hourlyUnsub = null;
    this._forecastError = null;
    this._forecastToken = 0;
    this._renderSignature = null;
    this._configStamp = 0;
    this._staleTimer = null;
    this._prevPressure = null;
    this._pressureSample = null;
    this._historyToken = 0;
    this._historyFetchedAt = 0;
    this._historyPending = false;
    this._recordsToken = 0;
    this._recordsFetchedAt = 0;
    this._recordsPending = false;
    this._forecastPending = false;
    this._forecastReadyKey = null;
    this._forecastAbsentKey = null;
    this._forecastRetryAt = 0;
    this._chipsExpanded = false;
    this._graph = null;
    this._graphCache = /* @__PURE__ */ new Map();
    this._graphToken = 0;
    this._holdTimer = null;
    this._held = false;
    this._holdEl = null;
    this.forecastDays = [];
    this.forecastHours = [];
    this.history = {};
    this.precipBars = null;
    this.comfortTemp = [];
    this.comfortHum = [];
    this.historyWindow = null;
    this.recordsBook = null;
    this.recordsSource = null;
    this.t = makeTranslator("en");
    this.locale = "en";
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
  get config() {
    return this._config || {};
  }
  setConfig(config) {
    if (!config) throw new Error("Invalid configuration");
    const prevWeather = this._config?.weather_entity || null;
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
      show_precip_timeline: true,
      show_records: true,
      show_comfort: true,
      seasonal_skins: true,
      derive_missing: true,
      graph_popup: false,
      // Hourly follows weather_entity when unset (see wantHourly).
      stale_minutes: 30,
      forecast_days: 5,
      hourly_forecast_hours: 24,
      history_hours: 24,
      records_period: "month",
      hemisphere: "north",
      show_beaufort: false,
      sun_entity: "sun.sun",
      ...config,
      section_order: normalizeSectionOrder(config.section_order ?? DEFAULT_SECTION_ORDER)
    });
    const nextWeather = this._config.weather_entity || null;
    this._teardownForecast(true);
    this._forecastToken++;
    this._historyToken++;
    this._recordsToken++;
    if (prevWeather !== nextWeather) {
      this.forecastDays = [];
      this.forecastHours = [];
      this._forecastError = null;
    }
    this.history = {};
    this.precipBars = null;
    this.comfortTemp = [];
    this.comfortHum = [];
    this.historyWindow = null;
    this._historyFetchedAt = 0;
    this._historyPending = false;
    this.recordsBook = null;
    this.recordsSource = null;
    this._recordsFetchedAt = 0;
    this._recordsPending = false;
    this._graphCache.clear();
    this._configStamp++;
    this._renderSignature = null;
    void this._ensureForecastSub();
    void this._ensureHistory();
    void this._ensureRecords();
    this._render(true);
  }
  set hass(hass) {
    this._hass = hass;
    void this._ensureForecastSub();
    void this._ensureHistory();
    void this._ensureRecords();
    this._render(false);
  }
  get hass() {
    return this._hass;
  }
  connectedCallback() {
    if (this._config) this._render(true);
  }
  disconnectedCallback() {
    this._forecastToken++;
    this._historyToken++;
    this._recordsToken++;
    this._historyPending = false;
    this._recordsPending = false;
    this._teardownForecast(true);
    if (this._staleTimer) {
      window.clearInterval(this._staleTimer);
      this._staleTimer = null;
    }
    if (this._dialog?.open) this._dialog.close();
  }
  _teardownForecast(clearReady) {
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
    this._forecastPending = false;
    if (clearReady) {
      this._forecastReadyKey = null;
      this._forecastAbsentKey = null;
      this._forecastRetryAt = 0;
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
  // ---------------------------------------------------------------------------
  // View helpers
  // ---------------------------------------------------------------------------
  st(key) {
    return entityState(this._hass, this._config?.entities?.[key]);
  }
  label(key, fallback) {
    return this._config?.labels?.[key] || fallback;
  }
  meta(m) {
    return m.key && hasKey(m.key) ? this.t(m.key) : m.label;
  }
  conv(st, fallbackUnit = "") {
    const raw = num(st?.state);
    const src = this._config?.units_source?.[st?.entity_id || ""] || unitOf(st) || fallbackUnit;
    const target = this._config?.unit_system || "native";
    const out = convertValue(raw, src || fallbackUnit, target);
    return { raw, ...out, src };
  }
  unitStr(key, st, fallback = "") {
    return this._config?.units?.[key] || this.conv(st, fallback).unit || fallback;
  }
  fmt(key, st, digits, fallbackUnit = "") {
    const c = this.conv(st, fallbackUnit);
    if (c.value == null) return "—";
    const unit = this._config?.units?.[key] || c.unit || fallbackUnit;
    return `${fmtNum(c.value, digits)}${unit ? ` ${unit}` : ""}`.trim();
  }
  color(key, value, fallback = "grey", unit = "") {
    const compare = unit ? thresholdCompareValue(value, unit) : value;
    return colorFromThresholds(compare, mergeThresholds(this._config, key), fallback);
  }
  tile(key, label, st, value, icon, color, spark = "", opts = {}) {
    if (!st && !this._config?.show_empty) return "";
    const entityId = st?.entity_id || "";
    const shown = opts.derived ? this.t("derived.suffix", { label }) : label;
    return `
      <button class="tile${opts.derived ? " derived" : ""}" data-key="${esc(key)}" data-entity="${esc(entityId)}"${opts.derived ? ` data-derived="1" title="${esc(this.t("derived.title"))}"` : ""} ${entityId ? "" : "disabled"} aria-label="${esc(`${shown}: ${value}`)}">
        <ha-icon icon="${icon}" style="color:${iconColorVar(color)}" aria-hidden="true"></ha-icon>
        <div class="tile-value" aria-hidden="true">${esc(String(value))}</div>
        <div class="tile-label" aria-hidden="true">${esc(shown)}</div>
        ${spark}
      </button>
    `;
  }
  histSpark(key) {
    if (this._config?.show_history_sparklines === false) return "";
    const pts = this.history[key];
    if (!pts?.length) return "";
    return historyLineSpark(downsampleHistory(pts));
  }
  wrapSection(id, compact, body) {
    if (!body) return "";
    const title = this.t(`section.${id}`);
    const heading = compact ? "" : `<h3 class="section-label" id="sec-${id}"><span>${esc(title)}</span></h3>`;
    const labelAttr = compact ? `aria-label="${esc(title)}"` : `aria-labelledby="sec-${id}"`;
    return `<section class="section" data-section="${id}" ${labelAttr}>${heading}${body}</section>`;
  }
  historyHours() {
    return Math.min(48, Math.max(6, Number(this._config?.history_hours) || 24));
  }
  wantHourly() {
    if (!this._config?.weather_entity) return false;
    return this._config.show_hourly_forecast !== false;
  }
  wantPrecipTimeline() {
    return this._config?.show_precip_timeline !== false && !this._config?.hide_rain;
  }
  wantComfort() {
    return this._config?.show_comfort !== false && !this._config?.hide_comfort;
  }
  wantRecords() {
    return this._config?.show_records !== false && !this._config?.hide_records;
  }
  _sectionVisible(hideKey, states) {
    if (this._config?.[hideKey]) return false;
    if (this._config?.show_empty) return true;
    return states.some((st) => available(st));
  }
  _recordsDays() {
    return this._config?.records_period === "year" ? 365 : 30;
  }
  // ---------------------------------------------------------------------------
  // Actions & events (delegated once on the shadow root)
  // ---------------------------------------------------------------------------
  _handleAction(actionCfg, entityId, key = "", el) {
    const action = actionCfg?.action || "more-info";
    if (action === "none") return;
    if (action === "graph") {
      if (entityId) this._openGraph(key, entityId, el || null);
      return;
    }
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
  _defaultTap(key, el) {
    if (this._config?.tablet_mode) return { action: "none" };
    if (this._config?.graph_popup && GRAPH_KEYS.has(key) && !el.dataset.derived) {
      const st = this._hass?.states?.[el.dataset.entity || ""];
      if (st && num(st.state) != null) return { action: "graph" };
    }
    return { action: "more-info" };
  }
  _actionsFor(key, el) {
    const acts = this._config?.actions?.[key] || {};
    const tablet = !!this._config?.tablet_mode;
    return {
      tap: acts.tap_action || this._defaultTap(key, el),
      hold: acts.hold_action || (tablet ? { action: "more-info" } : null),
      dbl: acts.double_tap_action
    };
  }
  _target(ev) {
    const t = ev.target;
    return t?.closest?.("[data-action], [data-entity], [data-key='__chips_expand']") || null;
  }
  _bindEvents(root) {
    root.addEventListener("click", (ev) => this._onClick(ev));
    root.addEventListener("dblclick", (ev) => {
      const el = this._target(ev);
      if (!el?.dataset.entity) return;
      const { dbl } = this._actionsFor(el.dataset.key || "", el);
      if (!dbl) return;
      ev.preventDefault();
      this._handleAction(dbl, el.dataset.entity, el.dataset.key, el);
    });
    root.addEventListener("pointerdown", (ev) => {
      const el = this._target(ev);
      if (!el?.dataset.entity) return;
      const { hold } = this._actionsFor(el.dataset.key || "", el);
      if (!hold) return;
      this._held = false;
      this._clearHold();
      this._holdEl = el;
      this._holdTimer = window.setTimeout(() => {
        this._held = true;
        this._handleAction(hold, el.dataset.entity || "", el.dataset.key, el);
      }, 500);
    });
    root.addEventListener("pointerup", () => this._clearHold());
    root.addEventListener("pointercancel", () => this._clearHold());
    root.addEventListener("pointerleave", (ev) => {
      if (ev.target === this._holdEl) this._clearHold();
    }, true);
    root.addEventListener("keydown", (ev) => this._onKeydown(ev));
    root.addEventListener("pointermove", (ev) => this._onGraphPointer(ev));
  }
  _clearHold() {
    if (this._holdTimer) window.clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._holdEl = null;
  }
  _onClick(ev) {
    if (this._dialog && ev.target === this._dialog) {
      this._dialog.close();
      return;
    }
    const el = this._target(ev);
    if (!el) return;
    const action = el.dataset.action;
    if (action) {
      ev.preventDefault();
      this._onDialogAction(action, el);
      return;
    }
    ev.preventDefault();
    if (this._held) {
      this._held = false;
      return;
    }
    const key = el.dataset.key || "";
    if (key === "__chips_expand") {
      this._chipsExpanded = !this._chipsExpanded;
      this._renderSignature = null;
      this._render(true);
      return;
    }
    const { tap } = this._actionsFor(key, el);
    this._handleAction(tap, el.dataset.entity || "", key, el);
  }
  _onKeydown(ev) {
    const target = ev.target;
    if (target?.classList.contains("graph-chart")) {
      this._onGraphKey(ev);
      return;
    }
    if ((ev.key === "Enter" || ev.key === " ") && target && target.tagName !== "BUTTON" && target.getAttribute("role") === "button") {
      ev.preventDefault();
      target.click();
    }
  }
  // ---------------------------------------------------------------------------
  // Graph popup
  // ---------------------------------------------------------------------------
  _openGraph(key, entityId, opener) {
    const st = this._hass?.states?.[entityId];
    if (!st) return;
    const fallbackLabel = hasKey(`tile.${key}`) ? this.t(`tile.${key}`) : String(st.attributes.friendly_name || entityId);
    const unit = this.conv(st, unitOf(st)).unit || unitOf(st);
    this._graph = {
      key,
      entityId,
      label: this.label(key, fallbackLabel),
      range: "24h",
      loading: true,
      series: null,
      window: { start: Date.now() - RANGE_MS["24h"], end: Date.now() },
      unit,
      opener,
      cursor: -1
    };
    this._renderGraph();
    if (this._dialog && !this._dialog.open) {
      try {
        this._dialog.showModal();
      } catch {
        this._dialog.setAttribute("open", "");
      }
    }
    this._dialog?.querySelector(".graph-range[aria-checked='true']")?.focus();
    void this._loadGraph();
  }
  _onDialogAction(action, el) {
    if (!this._graph) return;
    if (action === "graph-close") {
      this._dialog?.close();
    } else if (action === "graph-range") {
      const range = el.dataset.range;
      if (!RANGE_MS[range] || range === this._graph.range) return;
      this._graph = { ...this._graph, range, loading: true, cursor: -1 };
      this._renderGraph();
      void this._loadGraph();
    } else if (action === "graph-more-info") {
      const id = this._graph.entityId;
      this._dialog?.close();
      this.dispatchEvent(new CustomEvent("hass-more-info", { bubbles: true, composed: true, detail: { entityId: id } }));
    }
  }
  _onDialogClosed() {
    const opener = this._graph?.opener;
    this._graph = null;
    this._graphToken++;
    if (this._dialog) morph(this._dialog, "");
    if (opener?.isConnected) opener.focus();
  }
  async _loadGraph() {
    const g = this._graph;
    if (!g || !this._hass) return;
    const token = ++this._graphToken;
    const cacheKey = `${g.entityId}|${g.range}`;
    const cached = this._graphCache.get(cacheKey);
    let series = null;
    let window2 = { start: Date.now() - RANGE_MS[g.range], end: Date.now() };
    if (cached && Date.now() - cached.at < 5 * 6e4) {
      series = cached.series;
      window2 = cached.window;
    } else {
      const st = this._hass.states[g.entityId];
      const src = this._config?.units_source?.[g.entityId] || unitOf(st);
      const target = this._config?.unit_system || "native";
      const cv = (n) => convertValue(n, src, target).value ?? n;
      try {
        if (g.range !== "24h") {
          const stats = await fetchStatistics(this._hass, [g.entityId], new Date(window2.start), new Date(window2.end), "hour");
          const rows = stats?.[g.entityId] || [];
          if (rows.length) series = seriesFromStatistics(rows);
        }
        if (!series || !series.points.length) {
          const raw = await fetchHistoryRaw(this._hass, [g.entityId], new Date(window2.start), new Date(window2.end), false);
          const parsed = ingestHistoryRaw(raw, { [g.entityId]: "v" }).v || [];
          series = seriesFromHistory(parsed);
        }
      } catch {
        series = { source: "history", points: [] };
      }
      series = {
        source: series.source,
        points: series.points.map((p) => ({
          t: p.t,
          v: cv(p.v),
          ...p.min != null ? { min: cv(p.min) } : {},
          ...p.max != null ? { max: cv(p.max) } : {}
        }))
      };
      this._graphCache.set(cacheKey, { at: Date.now(), series, window: window2 });
    }
    if (token !== this._graphToken || !this._graph) return;
    this._graph = { ...this._graph, loading: false, series, window: window2 };
    this._renderGraph();
  }
  _fmtGraphTime(t, range) {
    const d = new Date(t);
    try {
      return range === "24h" ? d.toLocaleTimeString(this.locale, { hour: "numeric", minute: "2-digit" }) : d.toLocaleString(this.locale, { weekday: "short", day: "numeric", hour: "numeric" });
    } catch {
      return d.toISOString();
    }
  }
  _renderGraph() {
    const g = this._graph;
    if (!g || !this._dialog) return;
    const { t } = this;
    const unit = g.unit ? ` ${g.unit}` : "";
    const val = (n) => `${fmtNum(n, Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2)}${unit}`;
    const ranges = ["24h", "7d", "30d"];
    const stats = g.series ? graphStats(g.series) : null;
    let body;
    if (g.loading) {
      body = `<div class="graph-empty" role="status">${esc(t("graph.loading"))}</div>`;
    } else if (!g.series || !stats) {
      body = `<div class="graph-empty" role="status">${esc(t("graph.empty"))}</div>`;
    } else {
      const summary = t("graph.summary", { min: val(stats.min), max: val(stats.max), avg: val(stats.avg) });
      body = `
        <div class="graph-chart" tabindex="0" role="img" aria-label="${esc(summary)}" aria-describedby="graph-readout">
          ${graphSvg(g.series, g.window)}
        </div>
        <div class="graph-axis" aria-hidden="true">
          <span>${esc(this._fmtGraphTime(g.window.start, g.range))}</span>
          <span>${esc(this._fmtGraphTime(g.window.end, g.range))}</span>
        </div>
        <div class="graph-readout" id="graph-readout" aria-live="polite"></div>
        <dl class="graph-stats">
          <div><dt>${esc(t("graph.min"))}</dt><dd>${esc(val(stats.min))}</dd></div>
          <div><dt>${esc(t("graph.avg"))}</dt><dd>${esc(val(stats.avg))}</dd></div>
          <div><dt>${esc(t("graph.max"))}</dt><dd>${esc(val(stats.max))}</dd></div>
        </dl>
        <div class="graph-source">${esc(g.series.source === "statistics" ? t("graph.source_stats") : t("graph.source_history"))}</div>`;
    }
    const html = `<div class="graph-inner">
      <div class="graph-head">
        <h2 id="graph-title">${esc(t("graph.title", { name: g.label }))}</h2>
        <button class="graph-icon-btn" data-action="graph-close" aria-label="${esc(t("graph.close"))}"><ha-icon icon="mdi:close" aria-hidden="true"></ha-icon></button>
      </div>
      <div class="graph-ranges" role="radiogroup" aria-label="${esc(t("graph.range_label"))}">
        ${ranges.map((r) => `<button class="graph-range" role="radio" aria-checked="${r === g.range}" data-action="graph-range" data-range="${r}" tabindex="${r === g.range ? 0 : -1}">${esc(t(`graph.range_${r}`))}</button>`).join("")}
      </div>
      <div class="graph-body" aria-busy="${g.loading}">${body}</div>
      <div class="graph-foot">
        <button class="graph-more" data-action="graph-more-info">${esc(t("graph.more_info"))}</button>
      </div>
    </div>`;
    morph(this._dialog, html);
    this._paintGraphCursor();
  }
  _paintGraphCursor() {
    const g = this._graph;
    if (!g?.series || !this._dialog) return;
    const line = this._dialog.querySelector(".graph-cursor");
    const readout = this._dialog.querySelector(".graph-readout");
    const p = g.series.points[g.cursor];
    if (!line || !readout) return;
    if (!p) {
      line.setAttribute("x1", "-10");
      line.setAttribute("x2", "-10");
      readout.textContent = "";
      return;
    }
    const x = (p.t - g.window.start) / Math.max(1, g.window.end - g.window.start) * GRAPH_W;
    line.setAttribute("x1", x.toFixed(1));
    line.setAttribute("x2", x.toFixed(1));
    const unit = g.unit ? ` ${g.unit}` : "";
    const range = p.min != null && p.max != null && p.max !== p.min ? ` (${fmtNum(p.min, 1)}–${fmtNum(p.max, 1)})` : "";
    readout.textContent = `${this._fmtGraphTime(p.t, g.range)} · ${fmtNum(p.v, 2)}${unit}${range}`;
  }
  _onGraphPointer(ev) {
    const g = this._graph;
    const chart = ev.target?.closest?.(".graph-chart");
    if (!g?.series || !chart) return;
    const rect = chart.getBoundingClientRect();
    if (!rect.width) return;
    const idx = nearestPoint(g.series, g.window, (ev.clientX - rect.left) / rect.width);
    if (idx !== g.cursor) {
      g.cursor = idx;
      this._paintGraphCursor();
    }
  }
  _onGraphKey(ev) {
    const g = this._graph;
    if (!g?.series?.points.length) return;
    const last = g.series.points.length - 1;
    const step = Math.max(1, Math.round(g.series.points.length / 48));
    let next = g.cursor < 0 ? last : g.cursor;
    if (ev.key === "ArrowLeft") next = Math.max(0, next - step);
    else if (ev.key === "ArrowRight") next = Math.min(last, next + step);
    else if (ev.key === "Home") next = 0;
    else if (ev.key === "End") next = last;
    else return;
    ev.preventDefault();
    g.cursor = next;
    this._paintGraphCursor();
  }
  // ---------------------------------------------------------------------------
  // Data: pressure trend, forecast, history, records
  // ---------------------------------------------------------------------------
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
  async _ensureForecastSub() {
    const wantDaily = !!this._config?.show_forecast;
    const wantHourly = this.wantHourly();
    const id = wantDaily || wantHourly ? this._config?.weather_entity : null;
    if (!id || !this._hass) {
      this._teardownForecast(true);
      return;
    }
    const subKey = `${id}|d:${wantDaily ? 1 : 0}|h:${wantHourly ? 1 : 0}`;
    if (this._forecastReadyKey === subKey) return;
    if (this._forecastPending && this._forecastSubId === subKey) return;
    const entityPresent = !!entityState(this._hass, id);
    if (this._forecastAbsentKey === subKey) {
      if (entityPresent) {
        this._forecastAbsentKey = null;
        this._forecastRetryAt = 0;
      } else if (Date.now() < this._forecastRetryAt) {
        return;
      }
    }
    if (this._forecastSubId === subKey) {
      const dailyOk = !wantDaily || !!this._forecastUnsub;
      const hourlyOk = !wantHourly || !!this._hourlyUnsub;
      if (dailyOk && hourlyOk) {
        this._forecastReadyKey = subKey;
        this._forecastAbsentKey = null;
        this._forecastRetryAt = 0;
        return;
      }
    } else {
      this._teardownForecast(false);
    }
    this._forecastPending = true;
    this._forecastSubId = subKey;
    const token = ++this._forecastToken;
    this._forecastError = null;
    try {
      const attrDays = entityState(this._hass, id)?.attributes?.forecast;
      if (Array.isArray(attrDays) && attrDays.length && !this.forecastDays.length) {
        this.forecastDays = attrDays;
      }
      let dailySettled = !wantDaily;
      let hourlySettled = !wantHourly;
      if (wantDaily && !this._forecastUnsub) {
        try {
          if (this._hass.connection?.subscribeMessage) {
            const unsub = await this._hass.connection.subscribeMessage(
              (ev) => {
                if (token !== this._forecastToken) return;
                this.forecastDays = ev?.forecast || [];
                this._forecastError = this.forecastDays.length ? null : "empty";
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
              return;
            }
            this._forecastUnsub = unsub;
            dailySettled = true;
          }
        } catch {
        }
        if (token !== this._forecastToken) return;
      } else if (wantDaily) {
        dailySettled = true;
      }
      if (wantHourly && !this._hourlyUnsub) {
        try {
          if (this._hass.connection?.subscribeMessage) {
            const unsub = await this._hass.connection.subscribeMessage(
              (ev) => {
                if (token !== this._forecastToken) return;
                this.forecastHours = ev?.forecast || [];
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
              return;
            }
            this._hourlyUnsub = unsub;
            hourlySettled = true;
          }
        } catch {
        }
        if (token !== this._forecastToken) return;
      } else if (wantHourly) {
        hourlySettled = true;
      }
      if (wantDaily && !this._forecastUnsub) {
        const days = await this._fetchForecastType(id, "daily", token);
        if (token !== this._forecastToken) return;
        if (days.length) {
          this.forecastDays = days;
          this._forecastError = null;
        } else if (!this.forecastDays.length) {
          this._forecastError = "empty";
        }
        dailySettled = true;
      }
      if (wantHourly && !this._hourlyUnsub) {
        const hours = await this._fetchForecastType(id, "hourly", token);
        if (token !== this._forecastToken) return;
        if (hours.length) this.forecastHours = hours;
        hourlySettled = true;
      }
      if (token === this._forecastToken && dailySettled && hourlySettled) {
        const present = !!entityState(this._hass, id);
        if (present || this._forecastUnsub || this._hourlyUnsub || this.forecastDays.length || this.forecastHours.length) {
          this._forecastReadyKey = subKey;
          this._forecastAbsentKey = null;
          this._forecastRetryAt = 0;
        } else {
          this._forecastAbsentKey = subKey;
          this._forecastRetryAt = Date.now() + 3e4;
        }
      }
      this._renderSignature = null;
      this._render(true);
    } finally {
      if (token === this._forecastToken) this._forecastPending = false;
    }
  }
  async _ensureHistory() {
    if (!this._hass || !this._config) return;
    const needSparks = this._config.show_history_sparklines !== false;
    const needRose = this._config.show_wind_rose !== false;
    const needPrecip = this.wantPrecipTimeline();
    const needComfort = this.wantComfort();
    if (!needSparks && !needRose && !needPrecip && !needComfort) return;
    if (this._historyPending) return;
    if (this._historyFetchedAt && Date.now() - this._historyFetchedAt < 5 * 60 * 1e3) return;
    const hours = this.historyHours();
    const end = /* @__PURE__ */ new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1e3);
    const keyById = {};
    const addKey = (key) => {
      const id = this._config?.entities?.[key];
      if (id) keyById[id] = key;
    };
    if (needSparks) for (const key of HISTORY_SPARK_KEYS) addKey(key);
    if (needRose) addKey("wind_direction");
    if (needPrecip) addKey("rain_rate");
    if (needComfort) {
      addKey("temperature");
      addKey("humidity");
    }
    const unique = Object.keys(keyById);
    if (!unique.length) return;
    this._historyPending = true;
    const token = ++this._historyToken;
    try {
      const raw = await fetchHistoryRaw(this._hass, unique, start, end, false);
      if (raw == null || token !== this._historyToken) return;
      const next = ingestHistoryRaw(raw, keyById);
      this.precipBars = needPrecip && next.rain_rate?.length ? precipTimelineBars(next.rain_rate, hours, Math.min(36, Math.max(12, hours))) : null;
      this.comfortTemp = needComfort ? next.temperature || [] : [];
      this.comfortHum = needComfort ? next.humidity || [] : [];
      this.historyWindow = { start: start.getTime(), end: end.getTime() };
      for (const [key, pts] of Object.entries(next)) {
        if (key === "rain_rate") {
          next[key] = pts.length > 1200 ? pts.slice(-1200) : pts;
        } else if (key === "wind_gust") {
          next[key] = downsampleHistoryExtrema(pts, 96, "max");
        } else {
          next[key] = downsampleHistory(pts, 72);
        }
      }
      this.history = next;
      this._historyFetchedAt = Date.now();
      this._renderSignature = null;
      this._render(true);
    } catch {
      if (token === this._historyToken) this._historyFetchedAt = Date.now();
    } finally {
      if (token === this._historyToken) this._historyPending = false;
    }
  }
  /**
   * Record book from long-term statistics (kept forever, hourly min/max), so a
   * year of records survives the recorder's 10-day raw-history purge. Sensors
   * without a `state_class` have no statistics and fall back to raw history.
   * The last couple of hours always come from raw history, because statistics
   * only cover fully compiled hours.
   */
  async _ensureRecords() {
    if (!this._hass || !this._config || !this.wantRecords()) return;
    if (this._recordsPending) return;
    if (this._recordsFetchedAt && Date.now() - this._recordsFetchedAt < 15 * 60 * 1e3) return;
    const keyById = {};
    for (const key of ["temperature", "wind_gust", "rain_rate", "rain_today"]) {
      const id = this._config.entities?.[key];
      if (id && this._hass.states[id]) keyById[id] = key;
    }
    const ids = Object.keys(keyById);
    if (!ids.length) return;
    this._recordsPending = true;
    const token = ++this._recordsToken;
    const end = /* @__PURE__ */ new Date();
    const days = this._recordsDays();
    const start = new Date(end.getTime() - days * 864e5);
    const period = days > 60 ? "day" : "hour";
    try {
      let stats = null;
      try {
        stats = await fetchStatistics(this._hass, ids, start, end, period);
      } catch {
        stats = null;
      }
      if (token !== this._recordsToken) return;
      const statsByKey = {};
      const missing = [];
      for (const id of ids) {
        const rows = stats?.[id] || [];
        if (rows.length) statsByKey[keyById[id]] = rows;
        else missing.push(id);
      }
      const recent = {};
      if (missing.length) {
        const raw = await fetchHistoryRaw(this._hass, missing, start, end, true);
        if (token !== this._recordsToken) return;
        Object.assign(recent, ingestHistoryRaw(raw, keyById));
      }
      const withStats = ids.filter((id) => !missing.includes(id));
      if (withStats.length) {
        const since = new Date(end.getTime() - 2 * 36e5);
        const raw = await fetchHistoryRaw(this._hass, withStats, since, end, false);
        if (token !== this._recordsToken) return;
        Object.assign(recent, ingestHistoryRaw(raw, keyById));
      }
      for (const id of ids) {
        const n = num(this._hass.states[id]?.state);
        if (n == null) continue;
        const key = keyById[id];
        (recent[key] || (recent[key] = [])).push({ state: n, last_changed: Date.now() });
      }
      this.recordsBook = recordBookFromStatistics(statsByKey, buildRecordBook(recent));
      this.recordsSource = missing.length ? "history" : "statistics";
      this._recordsFetchedAt = Date.now();
      this._renderSignature = null;
      this._render(true);
    } catch {
      if (token === this._recordsToken) this._recordsFetchedAt = Date.now();
    } finally {
      if (token === this._recordsToken) this._recordsPending = false;
    }
  }
  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------
  _watchedSignature() {
    const c = this._config || {};
    const ids = Object.values(c.entities || {}).filter(Boolean);
    for (const extra of [c.weather_entity, c.alert_entity, c.sun_entity, c.moon_entity]) {
      if (extra) ids.push(extra);
    }
    const parts = ids.map((id) => {
      const st = this._hass?.states?.[id];
      if (!st) return `${id}:missing`;
      return `${id}:${st.state}:${st.last_updated || ""}:${st.last_reported || ""}`;
    });
    if (c.prefix && !c.hide_health && this._hass) {
      for (const st of Object.values(this._hass.states)) {
        if (st.attributes?.device_class === "battery" && st.entity_id.includes(`.${c.prefix}_`)) {
          parts.push(`${st.entity_id}:${st.state}`);
        }
      }
    }
    parts.push(
      `cfg:${this._configStamp}|lang:${this._hass?.locale?.language}|chips:${this._chipsExpanded}|hist:${this._historyFetchedAt}|rec:${this._recordsFetchedAt}`,
      `fc:${this.forecastDays.length}:${this.forecastHours.length}:${this._forecastError || ""}`
    );
    return parts.join("|");
  }
  _ensureShell() {
    if (!this.shadowRoot) {
      const root = this.attachShadow({ mode: "open" });
      const style = document.createElement("style");
      style.textContent = CARD_STYLES;
      this._card = document.createElement("ha-card");
      this._dialog = document.createElement("dialog");
      this._dialog.className = "graph-dialog";
      this._dialog.setAttribute("aria-labelledby", "graph-title");
      this._dialog.addEventListener("close", () => this._onDialogClosed());
      root.append(style, this._card, this._dialog);
      this._bindEvents(root);
    }
  }
  /** Pseudo-entity carrying a derived value in the temperature sensor's unit. */
  _derivedEntity(base, valueF, srcUnit) {
    const value = fromFahrenheit(valueF, srcUnit || "°F");
    return {
      ...base,
      state: value.toFixed(2),
      attributes: { ...base.attributes, unit_of_measurement: srcUnit || "°F" }
    };
  }
  _render(force = false) {
    if (!this._config) return;
    this._ensureShell();
    this._ensureStaleTimer();
    if (!force && this._hass) {
      const sig = this._watchedSignature();
      if (sig === this._renderSignature) return;
      this._renderSignature = sig;
    } else if (this._hass) {
      this._renderSignature = this._watchedSignature();
    }
    const hass = this._hass;
    const language = this._config.language || hass?.locale?.language || hass?.language || "en";
    this.locale = language;
    this.t = makeTranslator(language);
    setNumberLocale(numberLocaleFor(hass, language));
    const { t } = this;
    const layout = this._config.layout || "full";
    const compact = layout === "compact";
    const name = this._config.name || "Weather Station";
    const temp = this.st("temperature");
    const humidity = this.st("humidity");
    const wind = this.st("wind_speed");
    let feels = this.st("feels_like");
    let dew = this.st("dew_point");
    const high = this.st("temp_high");
    const low = this.st("temp_low");
    const gust = this.st("wind_gust");
    const maxGust = this.st("max_gust");
    const wdir = this.st("wind_direction");
    const rate = this.st("rain_rate");
    const today = this.st("rain_today");
    const event = this.st("rain_event");
    const week = this.st("rain_week");
    const month = this.st("rain_month");
    const year = this.st("rain_year");
    const lastRain = this.st("last_rain");
    const uv = this.st("uv");
    const irr = this.st("irradiance");
    const lux = this.st("illuminance");
    const pressure = this.st("pressure");
    const pressureAbs = this.st("pressure_abs");
    const indoorT = this.st("indoor_temperature");
    const indoorH = this.st("indoor_humidity");
    const co2 = this.st("co2");
    const pm25 = this.st("pm25");
    const aqi = this.st("aqi");
    const voc = this.st("voc");
    const noise = this.st("noise");
    const leaf = this.st("leaf_wetness");
    const signal = this.st("signal_strength");
    const soilStates = [];
    for (let i = 1; i <= 8; i++) {
      const m = this.st(`soil_moisture_${i}`);
      const s = this.st(`soil_temperature_${i}`);
      if (m) soilStates.push(m);
      if (s) soilStates.push(s);
    }
    if (leaf) soilStates.push(leaf);
    const lightningCount = this.st("lightning_count");
    const lightningDistance = this.st("lightning_distance");
    const lightningTime = this.st("lightning_time");
    const battery = this.st("battery");
    const sun = entityState(hass, this._config.sun_entity || "sun.sun");
    const moon = entityState(hass, this._config.moon_entity);
    let feelsDerived = false;
    let dewDerived = false;
    if (this._config.derive_missing !== false && temp && available(temp)) {
      const tSrc = this.conv(temp, "°F").src || "°F";
      const tF = toFahrenheit(num(temp.state), tSrc);
      const rh = num(humidity?.state);
      const mph = wind && num(wind.state) != null ? toMph(num(wind.state), unitOf(wind) || "mph") : null;
      if (!available(feels)) {
        const fl = feelsLikeF(tF, rh, mph);
        if (fl != null) {
          feels = this._derivedEntity(temp, fl, tSrc);
          feelsDerived = true;
        }
      }
      if (!available(dew)) {
        const dp = dewPointF(tF, rh);
        if (dp != null) {
          dew = this._derivedEntity(temp, dp, tSrc);
          dewDerived = true;
        }
      }
    }
    const tc = this.conv(temp, "°F");
    const f = this.conv(feels, "°F");
    const hi = this.conv(high, "°F");
    const lo = this.conv(low, "°F");
    const h = num(humidity?.state);
    const d = this.conv(dew, "°F");
    const ws = this.conv(wind, "mph");
    const wg = this.conv(gust, "mph");
    const windDir = parseWindDirection(wdir);
    const rr = this.conv(rate, unitOf(rate) || "in/h");
    const uvn = num(uv?.state);
    const raining = rr.value != null && rr.value > 0;
    const tColor = this.color("temperature", tc.raw, "grey", tc.src || "°F");
    const uvm = uvMeta(uvn, this.color("uv", uvn, "grey"));
    const pm = num(pm25?.state);
    const pmm = pm25Meta(pm, this.color("pm25", pm, "grey"));
    const aqiVal = num(aqi?.state);
    const aqim = aqiMeta(aqiVal, this.color("aqi", aqiVal, "grey"));
    const pressureConv = this.conv(pressure, unitOf(pressure) || "inHg");
    const trend = this._trackPressure(pressureConv.value);
    const bf = this._config.show_beaufort ? beaufort(convertValue(ws.raw, ws.src || "mph", "imperial").value) : null;
    const sunrise = formatSunTime(
      sun?.attributes?.next_rising || sun?.attributes?.rising,
      language
    );
    const sunset = formatSunTime(
      sun?.attributes?.next_setting || sun?.attributes?.setting,
      language
    );
    const ageMs = entityAgeMs(temp) ?? entityAgeMs(pressure) ?? entityAgeMs(wind);
    const staleLimit = Number(this._config.stale_minutes);
    const staleMinutes = Number.isFinite(staleLimit) ? staleLimit : 30;
    const isStale = ageMs != null && staleMinutes > 0 && ageMs > staleMinutes * 6e4;
    const updatedLabel = ageMs == null ? null : relativeTime(new Date(Date.now() - ageMs), language);
    const heroIcon = raining ? (rr.raw ?? 0) >= 0.3 ? "mdi:weather-pouring" : "mdi:weather-rainy" : uvn != null && uvn >= 6 ? "mdi:weather-sunny" : uvn != null && uvn >= 1 ? "mdi:weather-partly-cloudy" : "mdi:weather-night";
    const ctx = {
      compact,
      showConditions: this._sectionVisible("hide_conditions", [temp, feels, humidity, dew, high, low]),
      showWind: this._sectionVisible("hide_wind", [wind, gust, maxGust, wdir]),
      showRain: this._sectionVisible("hide_rain", [rate, today, event, week, month, year, lastRain]),
      showSun: this._sectionVisible("hide_sun", [uv, irr, lux, sun, moon]),
      showMore: this._sectionVisible("hide_more", [pressure, pressureAbs, indoorT, indoorH, co2]),
      showSoil: this._sectionVisible("hide_soil", soilStates),
      showLightning: this._sectionVisible("hide_lightning", [lightningCount, lightningDistance, lightningTime]),
      showAir: this._sectionVisible("hide_air", [pm25, aqi, voc, noise]),
      showHealth: !this._config.hide_health,
      showBattery: !this._config.hide_battery && !!battery,
      temp,
      feels,
      feelsDerived,
      humidity,
      dew,
      dewDerived,
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
      signal,
      battery,
      batt: batteryInfo(battery, this._config.battery_warning_threshold),
      sun,
      moon,
      sunrise: sunrise !== "—" ? sunrise : "",
      sunset: sunset !== "—" ? sunset : "",
      moonMeta: moonMeta(moon?.state),
      t: tc,
      f,
      hi,
      lo,
      h,
      d,
      ws,
      wg,
      deg: windDir.deg,
      card: windDir.card,
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
      tempUnit: this.unitStr("temperature", temp, tc.unit || "°")
    };
    const showBody = layout !== "chips";
    const showExtra = layout === "full" || compact;
    const missing = !temp && !this._config.entities?.temperature;
    const showUpdated = this._config.show_updated !== false;
    const subtitleBits = [];
    subtitleBits.push(raining ? t("header.raining", { rate: `${fmtNum(rr.value, 2)} ${this.unitStr("rain_rate", rate, rr.unit || "in/h")}` }) : t("header.live"));
    if (hi.value != null || lo.value != null) {
      subtitleBits.push(t("header.hilo", {
        hi: hi.value == null ? "—" : Math.round(hi.value),
        lo: lo.value == null ? "—" : Math.round(lo.value)
      }));
    }
    const order = normalizeSectionOrder(this._config.section_order);
    const sectionsHtml = showExtra ? order.map((sid) => SECTION_RENDERERS[sid](this, ctx)).join("") : "";
    const weatherSt = entityState(hass, this._config.weather_entity);
    const skinOn = this._config.seasonal_skins !== false;
    const season = currentSeason(/* @__PURE__ */ new Date(), this._config.hemisphere === "south" ? "south" : "north");
    const skinClass = skinOn ? seasonalSkinClasses(season, weatherSt?.state || (raining ? "rainy" : null)) : "";
    const layoutClass = compact ? "compact" : layout === "chips" ? "chips-layout" : layout;
    const heroSecondary = [
      f.value != null ? t("header.feels", { v: Math.round(f.value) }) : "",
      h != null ? t("header.rh", { v: Math.round(h) }) : ""
    ].filter(Boolean).join(" · ");
    const heroValue = tc.value == null ? "—" : `${Math.round(tc.value)}°`;
    const setupHint = esc(t("hint.setup")).replace("{prefix}", "<code>prefix</code>").replace("{example}", "<code>ws</code>");
    const inner = `
      ${layout === "chips" ? renderChips(this, ctx, this._chipsExpanded) : ""}
      ${showBody ? `
        ${renderAlerts(this)}
        <div class="header">
          <div class="header-main">
            <h2 class="title">${esc(name)}</h2>
            <div class="subtitle">${esc(subtitleBits.join(" · "))}</div>
          </div>
          ${showUpdated && updatedLabel ? `
            <div class="status-chip ${isStale ? "warn" : ""}" role="status" title="${esc(isStale ? t("status.stale_title") : t("status.updated_title"))}">
              <span class="status-dot" aria-hidden="true"></span>
              ${esc(isStale ? t("status.stale", { when: updatedLabel }) : updatedLabel)}
            </div>
          ` : ""}
        </div>
        <button class="hero" data-key="temperature" data-entity="${esc(temp?.entity_id || "")}" aria-label="${esc(`${this.label("temperature", t("tile.temperature"))}: ${heroValue}${heroSecondary ? `, ${heroSecondary}` : ""}`)}">
          <ha-icon icon="${heroIcon}" class="hero-icon" style="color:${iconColorVar(tColor)}" aria-hidden="true"></ha-icon>
          <div class="hero-text" aria-hidden="true">
            <div class="hero-primary">${heroValue}</div>
            <div class="hero-secondary">${esc(heroSecondary)}</div>
          </div>
          <div class="hero-spark" aria-hidden="true">${this.histSpark("temperature")}</div>
        </button>
      ` : ""}
      ${sectionsHtml}
      ${missing && hass ? `<div class="hint">${setupHint}</div>` : ""}
    `;
    const card = this._card;
    const cls = `${layoutClass}${isStale ? " stale" : ""}${skinClass ? ` ${skinClass}` : ""}`;
    if (card.className !== cls) card.className = cls;
    card.setAttribute("lang", language);
    morph(card, inner);
    if (this._graph) this._renderGraph();
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
