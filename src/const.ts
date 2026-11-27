import type { SectionId, ThresholdRule } from "./types";

export const CARD_TYPE = "mushroom-weather-station-card";
export const CARD_NAME = "Mushroom Weather Station Card";

const soilMoisture: Record<string, string> = {};
const soilTemp: Record<string, string> = {};
for (let i = 1; i <= 8; i++) {
  soilMoisture[`soil_moisture_${i}`] = `sensor.{p}_soil_moisture_${i}`;
  soilTemp[`soil_temperature_${i}`] = `sensor.{p}_soil_temperature_${i}`;
}

export const PREFIX_MAP: Record<string, string> = {
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
  battery: "binary_sensor.{p}_battery",
};

export const CARDINALS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
] as const;

export const WIND_ROSE_LABELS = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;

export const DEFAULT_SECTION_ORDER: SectionId[] = [
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
  "battery",
];

/** Default outdoor comfort band in imperial units (°F / %RH). */
export const DEFAULT_COMFORT = {
  tempMin: 65,
  tempMax: 78,
  humidityMin: 30,
  humidityMax: 60,
} as const;

export const DEFAULT_THRESHOLDS: Record<string, ThresholdRule[]> = {
  temperature: [
    { above: 115, color: "purple" },
    { above: 105, color: "red" },
    { above: 95, color: "orange" },
    { above: 80, color: "amber" },
    { above: 60, color: "green" },
    { below: 32, color: "blue" },
  ],
  feels_like: [
    { above: 115, color: "purple" },
    { above: 105, color: "red" },
    { above: 95, color: "orange" },
    { above: 80, color: "amber" },
    { above: 60, color: "green" },
    { below: 32, color: "blue" },
  ],
  uv: [
    { above: 11, color: "purple" },
    { above: 8, color: "purple" },
    { above: 6, color: "orange" },
    { above: 3, color: "amber" },
    { below: 3, color: "green" },
  ],
  humidity: [{ above: 50, color: "cyan" }, { below: 50, color: "blue" }],
  dew_point: [{ above: 70, color: "red" }, { above: 60, color: "orange" }, { below: 60, color: "blue" }],
  wind_speed: [{ above: 20, color: "orange" }],
  wind_gust: [{ above: 25, color: "orange" }],
  co2: [{ above: 1200, color: "red" }, { above: 800, color: "orange" }, { below: 800, color: "green" }],
  pm25: [{ above: 55, color: "red" }, { above: 35, color: "orange" }, { above: 12, color: "amber" }, { below: 12, color: "green" }],
  aqi: [{ above: 150, color: "red" }, { above: 100, color: "orange" }, { above: 50, color: "amber" }, { below: 50, color: "green" }],
  voc: [{ above: 1000, color: "red" }, { above: 500, color: "orange" }, { below: 500, color: "green" }],
  noise: [{ above: 70, color: "orange" }, { above: 55, color: "amber" }, { below: 55, color: "green" }],
  leaf_wetness: [{ above: 70, color: "blue" }, { above: 30, color: "cyan" }, { below: 30, color: "grey" }],
  soil_moisture_1: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_2: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_3: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_4: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_5: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_6: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_7: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
  soil_moisture_8: [{ below: 20, color: "red" }, { below: 35, color: "orange" }, { above: 35, color: "green" }],
};

export const COLOR_VARS: Record<string, string> = {
  purple: "var(--purple-color, #9c27b0)",
  red: "var(--red-color, #f44336)",
  orange: "var(--orange-color, #ff9800)",
  amber: "var(--amber-color, #ffc107)",
  green: "var(--green-color, #4caf50)",
  blue: "var(--blue-color, #2196f3)",
  cyan: "var(--cyan-color, #00bcd4)",
  teal: "var(--teal-color, #009688)",
  grey: "var(--disabled-text-color, #9e9e9e)",
};

export const WEATHER_ICONS: Record<string, string> = {
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
  "windy-variant": "mdi:weather-windy-variant",
};

export const MOON_ICONS: Record<string, string> = {
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
  waning_crescent: "mdi:moon-waning-crescent",
};

export const ALERT_SEVERITY_COLOR: Record<string, string> = {
  extreme: "red",
  severe: "orange",
  moderate: "amber",
  minor: "blue",
  unknown: "grey",
};

/** Tiles that can open the graph popup (numeric, history-friendly sensors). */
export const GRAPH_KEYS = new Set<string>([
  "temperature", "feels_like", "humidity", "dew_point", "temp_high", "temp_low",
  "wind_speed", "wind_gust", "max_gust", "rain_rate", "rain_today", "rain_event",
  "rain_week", "rain_month", "rain_year", "uv", "irradiance", "illuminance",
  "pressure", "pressure_abs", "indoor_temperature", "indoor_humidity", "co2",
  "pm25", "aqi", "voc", "noise", "leaf_wetness", "lightning_count",
  "lightning_distance", "signal_strength",
  ...Array.from({ length: 8 }, (_, i) => `soil_moisture_${i + 1}`),
  ...Array.from({ length: 8 }, (_, i) => `soil_temperature_${i + 1}`),
]);

export const HISTORY_SPARK_KEYS = ["temperature", "humidity", "wind_speed", "pressure"] as const;

export const EDITOR_FIELDS = [
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
  { key: "uv", label: "UV index", domains: ["sensor"], classes: [] as string[] },
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
    domains: ["sensor"] as string[],
    classes: ["moisture", "humidity"],
  })),
  ...Array.from({ length: 8 }, (_, i) => ({
    key: `soil_temperature_${i + 1}`,
    label: `Soil temperature ${i + 1}`,
    domains: ["sensor"] as string[],
    classes: ["temperature"],
  })),
  { key: "lightning_count", label: "Lightning strikes", domains: ["sensor"], classes: [] as string[] },
  { key: "lightning_distance", label: "Lightning distance", domains: ["sensor"], classes: ["distance"] },
  { key: "lightning_time", label: "Last lightning", domains: ["sensor"], classes: ["timestamp"] },
  { key: "battery", label: "Battery", domains: ["sensor", "binary_sensor"], classes: ["battery"] },
  { key: "signal_strength", label: "Signal strength", domains: ["sensor"], classes: ["signal_strength"] },
] as const;
