/**
 * Mushroom Weather Station Card
 * Home Assistant Lovelace custom card — HACS plugin
 * Version 0.4.0
 *
 * type: custom:mushroom-weather-station-card
 */
const CARD_VERSION = "0.4.0";
const CARD_TYPE = "mushroom-weather-station-card";
const CARD_NAME = "Mushroom Weather Station Card";

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
  battery: "binary_sensor.{p}_battery",
};

const CARDINALS = [
  "N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE",
  "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW",
];

const DEFAULT_THRESHOLDS = {
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
  grey: "var(--disabled-text-color, #9e9e9e)",
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
  "windy-variant": "mdi:weather-windy-variant",
};

function degToCardinal(deg) {
  const n = Number(deg);
  if (!Number.isFinite(n)) return null;
  return CARDINALS[Math.round((((n % 360) + 360) % 360) / 22.5) % 16];
}

function num(state) {
  if (state == null || state === "unknown" || state === "unavailable" || state === "") return null;
  const n = parseFloat(state);
  return Number.isFinite(n) ? n : null;
}

function fmtNum(n, digits = 1) {
  if (n == null) return "—";
  return Number(n).toFixed(digits).replace(/\.0$/, "");
}

function available(st) {
  return !!(st && st.state !== "unavailable" && st.state !== "unknown");
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

function applyPrefix(config) {
  const prefix = (config.prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  if (!prefix) return { ...config };
  const entities = { ...(config.entities || {}) };
  for (const [key, template] of Object.entries(PREFIX_MAP)) {
    if (!entities[key]) entities[key] = template.replace("{p}", prefix);
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

function formatLastRain(st, hass) {
  const raw = st?.state;
  if (!raw || raw === "unknown" || raw === "unavailable") return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return raw;
  try {
    return new Intl.DateTimeFormat(hass?.locale?.language || undefined, {
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(date);
  } catch (_e) {
    return date.toLocaleString();
  }
}

function batteryInfo(st, threshold) {
  if (!st) return null;
  const n = num(st.state);
  if (n != null) {
    const limit = threshold == null || threshold === "" ? 20 : Number(threshold);
    const low = Number.isFinite(limit) && n <= limit;
    return { low, text: low ? "Low Battery" : "Station battery OK", icon: low ? "mdi:battery-alert" : "mdi:battery" };
  }
  const low = st.state === "on";
  return { low, text: low ? "Low Battery" : "Station battery OK", icon: low ? "mdi:battery-alert" : "mdi:battery" };
}

function mergeThresholds(config, key) {
  const extra = config?.thresholds?.[key];
  const base = DEFAULT_THRESHOLDS[key] || [];
  if (!extra || !extra.length) return base;
  return [...extra, ...base];
}

function unitKind(unit) {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "c"].includes(u)) return "temp";
  if (["mph", "km/h", "kmh", "kph", "m/s", "m/sec"].includes(u)) return "speed";
  if (["in", "mm", "in/h", "in/hr", "mm/h", "mm/hr"].includes(u)) return u.includes("/") ? "rate" : "rain";
  if (["inhg", "inHg", "hpa", "mbar", "mb"].includes(u) || u === "inHg".toLowerCase()) return "pressure";
  return null;
}

function sourceSystem(unit) {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "mph", "in", "in/h", "in/hr", "inhg"].includes(u)) return "imperial";
  if (["c", "km/h", "kmh", "kph", "m/s", "mm", "mm/h", "mm/hr", "hpa", "mbar", "mb"].includes(u)) return "metric";
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
    return target === "metric"
      ? { value: (value - 32) * (5 / 9), unit: "°C" }
      : { value: value * (9 / 5) + 32, unit: "°F" };
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

/* -------------------------------------------------------------------------- */
/* Card                                                                        */
/* -------------------------------------------------------------------------- */

class MushroomWeatherStationCard extends HTMLElement {
  static getStubConfig() {
    return { prefix: "ws", layout: "full", name: "Weather Station", unit_system: "native" };
  }

  static async getConfigElement() {
    if (!customElements.get(`${CARD_TYPE}-editor`)) {
      await import("./mushroom-weather-station-card-editor.js");
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
      ...config,
    });
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  get hass() {
    return this._hass;
  }

  getCardSize() {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return 1;
    if (layout === "compact") return 4;
    return 8;
  }

  getGridOptions() {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return { columns: 12, rows: 1 };
    if (layout === "compact") return { columns: 12, rows: 4 };
    return { columns: 12, rows: 7 };
  }

  _st(key) {
    return entityState(this._hass, this._config?.entities?.[key]);
  }

  _label(key, fallback) {
    return this._config?.labels?.[key] || fallback;
  }

  _conv(st, fallbackUnit = "") {
    const raw = num(st?.state);
    const src = this._config?.units_source?.[st?.entity_id] || unitOf(st) || fallbackUnit;
    const overrideUnit = fallbackUnit;
    const target = this._config?.unit_system || "native";
    const out = convertValue(raw, src || overrideUnit, target);
    if (this._config?.units && fallbackUnit && target === "native") {
      /* custom unit string only */
    }
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

  _color(key, value, fallback = "grey") {
    return colorFromThresholds(value, mergeThresholds(this._config, key), fallback);
  }

  _sectionVisible(hideKey, states) {
    if (this._config?.[hideKey]) return false;
    if (this._config?.show_empty) return true;
    return states.some((st) => available(st));
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
    if (!el) return;
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
      <div class="compass" data-key="wind_direction" data-entity="${this._esc(this._st("wind_direction")?.entity_id || "")}">
        <svg viewBox="0 0 100 100" class="compass-svg ${muted ? "muted" : ""}">
          <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-opacity="0.18" stroke-width="2"/>
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
    const bars = items
      .map((i) => {
        const h = i.value == null ? 2 : Math.max(4, Math.round((i.value / max) * 36));
        const on = i.value != null && i.value > 0;
        return `<div class="bar-col"><div class="bar ${on ? "on" : ""}" style="height:${h}px"></div><div class="bar-lab">${this._esc(i.label)}</div></div>`;
      })
      .join("");
    return `<div class="spark">${bars}</div>`;
  }

  _forecast() {
    if (!this._config.show_forecast) return "";
    const id = this._config.weather_entity;
    const st = entityState(this._hass, id);
    if (!st) return "";
    const days = (st.attributes.forecast || []).slice(0, 5);
    if (!days.length) {
      return `<div class="forecast hint">No forecast on ${this._esc(id)}. Some integrations moved forecast off attributes.</div>`;
    }
    const target = this._config.unit_system || "native";
    const tempUnit = st.attributes.temperature_unit || "";
    return `
      <div class="section-label">Forecast</div>
      <div class="forecast">
        ${days
          .map((d) => {
            const when = d.datetime ? new Date(d.datetime) : null;
            const day = when && !Number.isNaN(when.getTime())
              ? when.toLocaleDateString(undefined, { weekday: "short" })
              : "—";
            const hi = d.temperature != null ? convertValue(d.temperature, tempUnit, target) : null;
            const lo = d.templow != null ? convertValue(d.templow, tempUnit, target) : null;
            const icon = WEATHER_ICONS[d.condition] || "mdi:weather-partly-cloudy";
            return `<div class="fday" data-key="forecast" data-entity="${this._esc(id)}">
              <div class="fday-name">${this._esc(day)}</div>
              <ha-icon icon="${icon}"></ha-icon>
              <div class="fday-temp">${hi ? Math.round(hi.value) : "—"}°${lo ? ` / ${Math.round(lo.value)}°` : ""}</div>
            </div>`;
          })
          .join("")}
      </div>
    `;
  }

  _render() {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });

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
    const battery = this._st("battery");

    const t = this._conv(temp, "°F");
    const f = this._conv(feels, "°F");
    const hi = this._conv(high, "°F");
    const lo = this._conv(low, "°F");
    const h = num(humidity?.state);
    const d = this._conv(dew, "°F");
    const ws = this._conv(wind, "mph");
    const wg = this._conv(gust, "mph");
    const deg = num(wdir?.state);
    const card = degToCardinal(deg);
    const rr = this._conv(rate, unitOf(rate) || "in/h");
    const uvn = num(uv?.state);
    const raining = rr.value != null && rr.value > 0;
    const tColor = this._color("temperature", t.raw, "grey");
    const uvColor = this._color("uv", uvn, "grey");
    const uvm = uvMeta(uvn, uvColor);

    const heroIcon = raining
      ? rr.raw >= 0.3
        ? "mdi:weather-pouring"
        : "mdi:weather-rainy"
      : uvn != null && uvn >= 6
        ? "mdi:weather-sunny"
        : uvn != null && uvn >= 1
          ? "mdi:weather-partly-cloudy"
          : "mdi:weather-night";

    const showConditions = this._sectionVisible("hide_conditions", [temp, feels, humidity, dew, high, low]);
    const showWind = this._sectionVisible("hide_wind", [wind, gust, maxGust, wdir]);
    const showRain = this._sectionVisible("hide_rain", [rate, today, event, week, month, year, lastRain]);
    const showSun = this._sectionVisible("hide_sun", [uv, irr, lux]);
    const showMore = this._sectionVisible("hide_more", [pressure, pressureAbs, indoorT, indoorH, co2]);
    const showBattery = !this._config.hide_battery && !!battery;
    const showBody = layout !== "chips";
    const showExtra = layout === "full" || compact;
    const batt = batteryInfo(battery, this._config.battery_warning_threshold);
    const missing = !temp && !this._config.entities?.temperature;
    const sectionTitle = (label) => (compact ? "" : `<div class="section-label">${this._esc(label)}</div>`);
    const tempUnit = this._unitStr("temperature", temp, t.unit || "°");

    const html = `
      <style>${MushroomWeatherStationCard.styles}</style>
      <ha-card class="${compact ? "compact" : layout}">
        ${layout === "chips" ? this._chips(temp, feels, humidity, today, wind, raining) : ""}
        ${showBody ? `
          <div class="header">
            <div class="title">${this._esc(name)}</div>
            <div class="subtitle">
              ${raining ? `Raining · ${fmtNum(rr.value, 2)} ${this._esc(this._unitStr("rain_rate", rate, rr.unit || "in/h"))}` : "Station"}
              ${hi.value != null || lo.value != null ? ` · H ${hi.value == null ? "—" : Math.round(hi.value)}° / L ${lo.value == null ? "—" : Math.round(lo.value)}°` : ""}
            </div>
          </div>
          <button class="hero" data-key="temperature" data-entity="${this._esc(temp?.entity_id || "")}">
            <ha-icon icon="${heroIcon}" class="hero-icon" style="color:${iconColorVar(tColor)}"></ha-icon>
            <div class="hero-text">
              <div class="hero-primary">${t.value == null ? "—" : Math.round(t.value)}°</div>
              <div class="hero-secondary">
                ${f.value != null ? `feels ${Math.round(f.value)}°` : ""}
                ${h != null ? ` · ${Math.round(h)}% rh` : ""}
              </div>
            </div>
          </button>
          ${showConditions ? `<div class="grid">
            ${this._tile("temperature", this._label("temperature", "Outdoor"), temp, t.value == null ? "—" : `${fmtNum(t.value, 1)}${tempUnit.includes("°") ? tempUnit : "°"}`, "mdi:thermometer", tColor)}
            ${this._tile("feels_like", this._label("feels_like", "Feels like"), feels, f.value == null ? "—" : `${fmtNum(f.value, 1)}°`, "mdi:sun-thermometer-outline", this._color("feels_like", f.raw, tColor))}
            ${this._tile("temp_high", this._label("temp_high", "High"), high, hi.value == null ? "—" : `${Math.round(hi.value)}°`, "mdi:thermometer-high", "orange")}
            ${this._tile("temp_low", this._label("temp_low", "Low"), low, lo.value == null ? "—" : `${Math.round(lo.value)}°`, "mdi:thermometer-low", "blue")}
            ${this._tile("humidity", this._label("humidity", "Humidity"), humidity, h == null ? "—" : `${Math.round(h)}${this._esc(this._unitStr("humidity", humidity, "%"))}`, "mdi:water-percent", this._color("humidity", h, "blue"))}
            ${this._tile("dew_point", this._label("dew_point", "Dew point"), dew, d.value == null ? "—" : `${fmtNum(d.value, 1)}°`, "mdi:molecule", this._color("dew_point", d.raw, "blue"))}
          </div>` : ""}
        ` : ""}
        ${showExtra && showWind ? `
          ${sectionTitle("Wind")}
          <div class="wind-row">
            ${this._compass(deg, card)}
            <div class="grid wind-grid">
              ${this._tile("wind_speed", this._label("wind_speed", "Speed"), wind, ws.value == null ? "—" : `${fmtNum(ws.value, 1)} ${this._esc(this._unitStr("wind_speed", wind, ws.unit || "mph"))}`, "mdi:weather-windy", this._color("wind_speed", ws.raw, "teal"))}
              ${this._tile("wind_gust", this._label("wind_gust", "Gust"), gust, wg.value == null ? "—" : `${fmtNum(wg.value, 1)}`, "mdi:windsock", this._color("wind_gust", wg.raw, "teal"))}
              ${this._tile("max_gust", this._label("max_gust", "Max gust"), maxGust, num(maxGust?.state) == null ? "—" : this._fmt("max_gust", maxGust, 1, "mph"), "mdi:weather-windy-variant", "teal")}
            </div>
          </div>
        ` : ""}
        ${showExtra && showRain ? `
          ${sectionTitle("Rain")}
          ${this._sparkline([
            { label: "T", value: num(today?.state) },
            { label: "E", value: num(event?.state) },
            { label: "W", value: num(week?.state) },
            { label: "M", value: num(month?.state) },
            { label: "Y", value: num(year?.state) },
          ])}
          <div class="grid">
            ${this._tile("rain_rate", this._label("rain_rate", "Rate"), rate, rr.value == null ? "—" : `${fmtNum(rr.value, 2)} ${this._esc(this._unitStr("rain_rate", rate, rr.unit || ""))}`.trim(), "mdi:weather-rainy", raining ? "blue" : "grey")}
            ${this._tile("rain_today", this._label("rain_today", "Today"), today, this._fmt("rain_today", today, 2, "in"), "mdi:cup-water", num(today?.state) > 0 ? "cyan" : "grey")}
            ${this._tile("rain_event", this._label("rain_event", "Event"), event, this._fmt("rain_event", event, 2, "in"), "mdi:weather-pouring", num(event?.state) > 0 ? "blue" : "grey")}
            ${this._tile("rain_week", this._label("rain_week", "Week"), week, this._fmt("rain_week", week, 2, "in"), "mdi:calendar-week", num(week?.state) > 0 ? "blue" : "grey")}
            ${this._tile("rain_month", this._label("rain_month", "Month"), month, this._fmt("rain_month", month, 2, "in"), "mdi:calendar-month", num(month?.state) > 0 ? "blue" : "grey")}
            ${this._tile("rain_year", this._label("rain_year", "Year"), year, this._fmt("rain_year", year, 2, "in"), "mdi:calendar-star", num(year?.state) > 0 ? "blue" : "grey")}
            ${this._tile("last_rain", this._label("last_rain", "Last rain"), lastRain, formatLastRain(lastRain, hass), "mdi:clock-outline", "blue")}
          </div>
        ` : ""}
        ${showExtra && showSun ? `
          ${sectionTitle("Sun")}
          <div class="grid">
            ${this._tile("uv", this._label("uv", uvm.label), uv, uvn == null ? "—" : `${fmtNum(uvn, 0)}`, "mdi:weather-sunny-alert", uvm.color)}
            ${this._tile("irradiance", this._label("irradiance", "Solar"), irr, num(irr?.state) == null ? "—" : `${fmtNum(num(irr?.state), 0)} ${this._esc(this._unitStr("irradiance", irr, unitOf(irr)))}`.trim(), "mdi:solar-power-variant", "amber")}
            ${this._tile("illuminance", this._label("illuminance", "Light"), lux, num(lux?.state) == null ? "—" : `${fmtNum(num(lux?.state), 0)} ${this._esc(this._unitStr("illuminance", lux, "lx"))}`, "mdi:brightness-5", "amber")}
          </div>
        ` : ""}
        ${showExtra && showMore ? `
          ${sectionTitle("Station")}
          <div class="grid">
            ${this._tile("pressure", this._label("pressure", "Pressure"), pressure, this._fmt("pressure", pressure, 2, unitOf(pressure) || "inHg"), "mdi:gauge", "teal")}
            ${this._tile("pressure_abs", this._label("pressure_abs", "Abs pressure"), pressureAbs, this._fmt("pressure_abs", pressureAbs, 2, unitOf(pressureAbs) || "inHg"), "mdi:gauge", "teal")}
            ${this._tile("indoor_temperature", this._label("indoor_temperature", "Indoor"), indoorT, indoorT ? `${fmtNum(this._conv(indoorT, "°F").value, 1)}°` : "—", "mdi:home-thermometer", this._color("temperature", num(indoorT?.state), "green"))}
            ${this._tile("indoor_humidity", this._label("indoor_humidity", "Indoor RH"), indoorH, num(indoorH?.state) == null ? "—" : `${Math.round(num(indoorH?.state))}%`, "mdi:water-percent", this._color("humidity", num(indoorH?.state), "cyan"))}
            ${this._tile("co2", this._label("co2", "CO₂"), co2, num(co2?.state) == null ? "—" : `${fmtNum(num(co2?.state), 0)} ${this._esc(this._unitStr("co2", co2, "ppm"))}`, "mdi:molecule-co2", this._color("co2", num(co2?.state), "green"))}
          </div>
        ` : ""}
        ${showExtra ? this._forecast() : ""}
        ${showExtra && showBattery && batt ? `
          <div class="battery ${batt.low ? "warn" : "ok"}" data-key="battery" data-entity="${this._esc(battery.entity_id)}">
            <ha-icon icon="${batt.icon}"></ha-icon>
            ${this._esc(this._label("battery", batt.text))}
          </div>
        ` : ""}
        ${missing && hass ? `<div class="hint">Set <code>prefix</code> (e.g. <code>ws</code>) or pick entities in the card editor.</div>` : ""}
      </ha-card>
    `;

    this.shadowRoot.innerHTML = html;
    this.shadowRoot.querySelectorAll("[data-entity]").forEach((el) => {
      this._bindTile(el, el.dataset.key || "", el.dataset.entity);
    });
  }

  _chips(temp, feels, humidity, today, wind, raining) {
    const t = this._conv(temp, "°F");
    const f = this._conv(feels, "°F");
    const chips = [
      { key: "temperature", st: temp, icon: "mdi:thermometer", text: t.value == null ? "—" : `${Math.round(t.value)}°` },
      { key: "feels_like", st: feels, icon: "mdi:sun-thermometer", text: f.value == null ? "—" : `${Math.round(f.value)}°` },
      { key: "humidity", st: humidity, icon: "mdi:water-percent", text: num(humidity?.state) == null ? "—" : `${Math.round(num(humidity?.state))}%` },
      { key: "rain_today", st: today, icon: raining ? "mdi:weather-pouring" : "mdi:weather-rainy", text: this._fmt("rain_today", today, 2, "in") },
      { key: "wind_speed", st: wind, icon: "mdi:weather-windy", text: this._fmt("wind_speed", wind, 0, "mph") },
    ].filter((c) => c.st);
    return `<div class="chips">${chips
      .map((c) => `<button class="chip" data-key="${c.key}" data-entity="${this._esc(c.st.entity_id)}"><ha-icon icon="${c.icon}"></ha-icon><span>${this._esc(c.text)}</span></button>`)
      .join("")}</div>`;
  }

  _tile(key, label, st, value, icon, color) {
    if (!st && !this._config.show_empty) return "";
    const entityId = st?.entity_id || "";
    return `
      <button class="tile" data-key="${this._esc(key)}" data-entity="${this._esc(entityId)}" ${entityId ? "" : "disabled"}>
        <ha-icon icon="${icon}" style="color:${iconColorVar(color)}"></ha-icon>
        <div class="tile-value">${this._esc(String(value))}</div>
        <div class="tile-label">${this._esc(label)}</div>
      </button>
    `;
  }

  _esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }

  static get styles() {
    return `
      :host { display: block; }
      ha-card { padding: 12px 12px 8px; background: var(--ha-card-background, var(--card-background-color)); }
      ha-card.compact { padding: 8px 8px 6px; }
      .header { padding: 4px 4px 8px; }
      ha-card.compact .header { padding: 2px 2px 4px; }
      .title { font-weight: 600; font-size: 16px; color: var(--primary-text-color); }
      ha-card.compact .title { font-size: 14px; }
      .subtitle { font-size: 13px; color: var(--secondary-text-color); margin-top: 2px; }
      .hero { display: flex; align-items: center; gap: 12px; width: 100%; border: 0; background: transparent; color: inherit; text-align: left; padding: 4px 4px 12px; cursor: pointer; }
      ha-card.compact .hero { padding: 2px 2px 6px; gap: 8px; }
      .hero-icon { --mdc-icon-size: 36px; }
      ha-card.compact .hero-icon { --mdc-icon-size: 28px; }
      .hero-primary { font-size: 32px; font-weight: 600; line-height: 1.1; }
      ha-card.compact .hero-primary { font-size: 26px; }
      .hero-secondary { font-size: 13px; color: var(--secondary-text-color); }
      .section-label { font-size: 14px; font-weight: 600; padding: 10px 4px 6px; color: var(--primary-text-color); }
      .grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 6px; }
      ha-card.compact .grid { gap: 3px; }
      .wind-row { display: grid; grid-template-columns: 110px 1fr; gap: 8px; align-items: center; }
      .wind-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }
      .compass { display: flex; flex-direction: column; align-items: center; cursor: pointer; color: var(--primary-text-color); }
      .compass-svg { width: 96px; height: 96px; }
      ha-card.compact .compass-svg { width: 72px; height: 72px; }
      .compass-svg.muted { opacity: 0.45; }
      .compass-label { font-size: 12px; color: var(--secondary-text-color); margin-top: 2px; }
      .spark { display: flex; align-items: flex-end; gap: 8px; height: 56px; padding: 4px 8px 0; }
      .bar-col { display: flex; flex-direction: column; align-items: center; justify-content: flex-end; flex: 1; height: 100%; }
      .bar { width: 100%; max-width: 28px; border-radius: 4px 4px 0 0; background: var(--disabled-text-color); opacity: 0.35; }
      .bar.on { background: var(--cyan-color, #00bcd4); opacity: 1; }
      .bar-lab { font-size: 10px; color: var(--secondary-text-color); margin-top: 4px; }
      .forecast { display: flex; gap: 6px; overflow-x: auto; padding: 4px 0 8px; }
      .fday { flex: 1; min-width: 64px; text-align: center; background: var(--secondary-background-color, rgba(0,0,0,0.08)); border-radius: 12px; padding: 8px 4px; cursor: pointer; }
      .fday-name { font-size: 11px; color: var(--secondary-text-color); }
      .fday-temp { font-size: 12px; font-weight: 600; }
      .tile { display: flex; flex-direction: column; align-items: center; gap: 4px; border: 0; background: var(--secondary-background-color, rgba(0,0,0,0.08)); border-radius: 12px; padding: 10px 4px 8px; color: inherit; cursor: pointer; min-height: 88px; }
      ha-card.compact .tile { padding: 6px 2px 4px; gap: 2px; min-height: 64px; border-radius: 10px; }
      .tile[disabled] { opacity: 0.45; cursor: default; }
      .tile ha-icon { --mdc-icon-size: 22px; }
      ha-card.compact .tile ha-icon { --mdc-icon-size: 18px; }
      .tile-value { font-weight: 600; font-size: 14px; text-align: center; }
      ha-card.compact .tile-value { font-size: 12px; }
      .tile-label { font-size: 11px; color: var(--secondary-text-color); text-align: center; }
      .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 4px; }
      .chip { display: inline-flex; align-items: center; gap: 6px; border: 0; border-radius: 18px; padding: 6px 10px; background: var(--secondary-background-color, rgba(0,0,0,0.08)); color: inherit; cursor: pointer; font-size: 13px; }
      .chip ha-icon { --mdc-icon-size: 18px; }
      .battery { display: flex; align-items: center; gap: 8px; font-size: 13px; padding: 10px 6px 6px; cursor: pointer; }
      .battery.ok { color: var(--success-color, #4caf50); }
      .battery.warn { color: var(--error-color, #f44336); }
      .hint { font-size: 12px; color: var(--secondary-text-color); padding: 8px 4px; }
      @media (max-width: 520px) {
        .grid, .wind-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
        .wind-row { grid-template-columns: 1fr; }
      }
    `;
  }
}


customElements.define(CARD_TYPE, MushroomWeatherStationCard);

window.customCards = window.customCards || [];
window.customCards.push({
  type: CARD_TYPE,
  name: CARD_NAME,
  description: "Mushroom-style weather station card for Ecowitt / personal WS sensors.",
  preview: true,
  documentationURL: "https://github.com/highergroundstudio/lovelace-mushroom-weather-station-card",
});

console.info(
  `%c ${CARD_NAME} %c ${CARD_VERSION} `,
  "color:#fff;background:#1b4d3e;font-weight:bold;padding:2px 6px;",
  "color:#1b4d3e;background:#e8f5e9;font-weight:bold;padding:2px 6px;"
);
