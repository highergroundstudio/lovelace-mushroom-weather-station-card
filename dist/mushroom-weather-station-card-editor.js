/**
 * Mushroom Weather Station Card — visual editor
 * Version 0.5.0
 */
const CARD_TYPE = "mushroom-weather-station-card";
const CARD_VERSION =
  customElements.get(CARD_TYPE)?.VERSION ||
  customElements.get(CARD_TYPE)?.constructor?.VERSION ||
  "dev";

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
  soil_moisture_1: "sensor.{p}_soil_moisture_1",
  soil_moisture_2: "sensor.{p}_soil_moisture_2",
  soil_moisture_3: "sensor.{p}_soil_moisture_3",
  soil_moisture_4: "sensor.{p}_soil_moisture_4",
  lightning_count: "sensor.{p}_lightning_num",
  lightning_distance: "sensor.{p}_lightning",
  lightning_time: "sensor.{p}_lightning_time",
  battery: "binary_sensor.{p}_battery",
};

function applyPrefix(config) {
  const prefix = (config.prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  if (!prefix) return { ...config };
  const entities = { ...(config.entities || {}) };
  for (const [key, template] of Object.entries(PREFIX_MAP)) {
    if (!entities[key]) entities[key] = template.replace("{p}", prefix);
  }
  return { ...config, entities };
}

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
  { key: "soil_moisture_1", label: "Soil moisture 1", domains: ["sensor"], classes: ["moisture", "humidity"] },
  { key: "soil_moisture_2", label: "Soil moisture 2", domains: ["sensor"], classes: ["moisture", "humidity"] },
  { key: "soil_moisture_3", label: "Soil moisture 3", domains: ["sensor"], classes: ["moisture", "humidity"] },
  { key: "soil_moisture_4", label: "Soil moisture 4", domains: ["sensor"], classes: ["moisture", "humidity"] },
  { key: "lightning_count", label: "Lightning strikes", domains: ["sensor"], classes: [] },
  { key: "lightning_distance", label: "Lightning distance", domains: ["sensor"], classes: ["distance"] },
  { key: "lightning_time", label: "Last lightning", domains: ["sensor"], classes: ["timestamp"] },
  { key: "battery", label: "Battery", domains: ["sensor", "binary_sensor"], classes: ["battery"] },
];

async function loadHaComponents() {
  if (customElements.get("ha-entity-picker")) return;
  try {
    if (typeof window.loadCardHelpers === "function") {
      const helpers = await window.loadCardHelpers();
      const el = await helpers.createCardElement({ type: "entities", entities: ["sun.sun"] });
      if (el?.constructor?.getConfigElement) await el.constructor.getConfigElement();
    }
  } catch (_err) {
    /* fallback */
  }
  if (customElements.get("ha-entity-picker")) return;
  for (const tag of ["hui-entities-card", "hui-glance-card", "hui-entity-card"]) {
    const Card = customElements.get(tag);
    if (Card?.getConfigElement) {
      try { await Card.getConfigElement(); } catch (_err) { /* next */ }
      if (customElements.get("ha-entity-picker")) return;
    }
  }
}

class MushroomWeatherStationCardEditor extends HTMLElement {
  constructor() {
    super();
    this._config = { entities: {}, layout: "full", labels: {}, units: {} };
    this._loaded = false;
    this._tab = "layout";
  }

  setConfig(config) {
    this._config = { entities: {}, layout: "full", labels: {}, units: {}, ...config };
    this._built = false;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    if (this._built && this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((p) => { p.hass = hass; });
      return;
    }
    this._render();
  }

  connectedCallback() {
    this._render();
  }

  _fire(next) {
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }

  _setField(key, value, section) {
    const next = {
      ...this._config,
      entities: { ...(this._config.entities || {}) },
      labels: { ...(this._config.labels || {}) },
      units: { ...(this._config.units || {}) },
    };
    if (section === "entities") {
      if (value) next.entities[key] = value;
      else delete next.entities[key];
    } else if (section === "labels") {
      if (value) next.labels[key] = value;
      else delete next.labels[key];
    } else if (section === "units") {
      if (value) next.units[key] = value;
      else delete next.units[key];
    } else if (
      key === "show_empty" ||
      key === "show_forecast" ||
      key === "tablet_mode" ||
      key === "show_updated" ||
      key === "show_beaufort" ||
      String(key).startsWith("hide_")
    ) {
      next[key] = !!value;
    } else if (key === "uv_purple_above" || key === "temp_blue_below") {
      const thresholds = { ...(next.thresholds || {}) };
      if (key === "uv_purple_above") {
        const n = Number(value);
        thresholds.uv = Number.isFinite(n) ? [{ above: n, color: "purple" }] : [];
      } else {
        const n = Number(value);
        thresholds.temperature = Number.isFinite(n) ? [{ below: n, color: "blue" }] : [];
        thresholds.feels_like = thresholds.temperature;
      }
      next.thresholds = thresholds;
      next[key] = value;
    } else if (key === "stale_minutes" || key === "forecast_days" || key === "battery_warning_threshold") {
      next[key] = value === "" ? undefined : Number(value);
      if (!Number.isFinite(next[key])) next[key] = value;
    } else {
      next[key] = value;
    }
    if (key === "prefix") next.entities = applyPrefix(next).entities;
    this._fire(next);
    this._render();
  }

  async _render() {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (!this._loaded) {
      this.shadowRoot.innerHTML = `<p class="help">Loading Home Assistant pickers…</p>`;
      await loadHaComponents();
      this._loaded = true;
    }

    const c = this._config;
    const e = c.entities || {};
    const labels = c.labels || {};
    const units = c.units || {};
    const pickerReady = !!customElements.get("ha-entity-picker");
    const tab = this._tab || "layout";

    this.shadowRoot.innerHTML = `
      <style>
        .wrap { display: grid; gap: 14px; padding: 4px 0 8px; }
        .row { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .help { font-size: 13px; color: var(--secondary-text-color); line-height: 1.45; margin: 0; }
        .version { font-size: 12px; font-weight: 600; color: var(--secondary-text-color); padding: 6px 10px; border-radius: 8px; background: var(--secondary-background-color, rgba(0,0,0,0.08)); }
        .tabs { display: flex; gap: 6px; }
        .tab { border: 1px solid var(--divider-color); background: transparent; color: var(--primary-text-color); border-radius: 8px; padding: 6px 10px; cursor: pointer; font: inherit; }
        .tab.on { background: var(--secondary-background-color, rgba(0,0,0,0.08)); font-weight: 600; }
        h3 { margin: 4px 0 0; font-size: 15px; font-weight: 600; }
        label.field { display: grid; gap: 6px; font-size: 13px; color: var(--primary-text-color); }
        input, select { width: 100%; box-sizing: border-box; padding: 10px 12px; border-radius: 8px; border: 1px solid var(--divider-color); background: var(--mdc-text-field-fill-color, var(--card-background-color)); color: var(--primary-text-color); font: inherit; }
        ha-entity-picker { display: block; width: 100%; }
        ha-form { display: block; }
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
        @media (max-width: 520px) { .row, .slot-extra { grid-template-columns: 1fr; } }
      </style>
      <div class="wrap">
        <div class="version">Mushroom Weather Station Card · v${CARD_VERSION}</div>
        <div class="tabs">
          <button class="tab ${tab === "layout" ? "on" : ""}" data-tab="layout">Layout</button>
          <button class="tab ${tab === "entities" ? "on" : ""}" data-tab="entities">Entities</button>
          <button class="tab ${tab === "display" ? "on" : ""}" data-tab="display">Display</button>
        </div>
        <div id="tab-body"></div>
      </div>
    `;

    this.shadowRoot.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._tab = btn.dataset.tab;
        this._built = false;
        this._render();
      });
    });

    const body = this.shadowRoot.getElementById("tab-body");
    if (tab === "layout") {
      body.innerHTML = `
        <div class="row">
          <label class="field">Name
            <input data-key="name" value="${this._esc(c.name || "")}" placeholder="Weather Station" />
          </label>
          <label class="field">Layout
            <select data-key="layout">
              <option value="full" ${c.layout === "full" || !c.layout ? "selected" : ""}>Full station</option>
              <option value="compact" ${c.layout === "compact" ? "selected" : ""}>Compact</option>
              <option value="chips" ${c.layout === "chips" ? "selected" : ""}>Chips strip</option>
            </select>
          </label>
        </div>
        <label class="field">Entity prefix
          <input data-key="prefix" value="${this._esc(c.prefix || "")}" placeholder="ws" />
        </label>
        <label class="field">Unit system
          <select data-key="unit_system">
            <option value="native" ${!c.unit_system || c.unit_system === "native" ? "selected" : ""}>Native (as reported)</option>
            <option value="imperial" ${c.unit_system === "imperial" ? "selected" : ""}>Imperial (°F, mph, in)</option>
            <option value="metric" ${c.unit_system === "metric" ? "selected" : ""}>Metric (°C, km/h, mm)</option>
          </select>
        </label>
        <div id="options-switches" class="switch-list"></div>
        <div class="row">
          <label class="field">Forecast days
            <input data-key="forecast_days" type="number" min="1" max="7" value="${this._esc(c.forecast_days ?? "5")}" placeholder="5" />
          </label>
          <label class="field">Stale after (minutes)
            <input data-key="stale_minutes" type="number" min="0" value="${this._esc(c.stale_minutes ?? "30")}" placeholder="30" />
          </label>
        </div>
        <div id="weather-picker"></div>
        <h3>Sections</h3>
        <p class="help">Off = show the section when it has data. On = hide it even if sensors exist.</p>
        <div id="section-switches" class="switch-list"></div>
      `;
    } else if (tab === "display") {
      body.innerHTML = `
        <div class="row">
          <label class="field">Battery warning threshold
            <input data-key="battery_warning_threshold" type="number" value="${this._esc(c.battery_warning_threshold ?? "")}" placeholder="20" />
          </label>
          <label class="field">UV purple at / above
            <input data-key="uv_purple_above" type="number" value="${this._esc(c.uv_purple_above ?? "8")}" placeholder="8" />
          </label>
        </div>
        <label class="field">Temperature blue at / below
          <input data-key="temp_blue_below" type="number" value="${this._esc(c.temp_blue_below ?? "32")}" placeholder="32" />
        </label>
        <p class="help">Per-slot labels and units are under Entities. Advanced <code>thresholds</code> and <code>actions</code> stay in YAML.</p>
      `;
    } else {
      body.innerHTML = `<p class="help">Prefix auto-fills empty slots. Pickers override one sensor at a time.</p><div id="pickers"></div>${pickerReady ? "" : `<p class="help">Entity picker did not load. Reload Lovelace resources.</p>`}`;
    }

    body.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const target = ev.target;
        const value = target.type === "checkbox" ? target.checked : target.value;
        this._setField(target.dataset.key, value, target.dataset.section);
      });
    });

    if (tab === "layout") {
      this._fillSwitches("options-switches", [
        { key: "tablet_mode", title: "Tablet mode", help: "Tap does nothing. Hold a tile for more-info." },
        { key: "show_empty", title: "Show empty tiles", help: "Keep tiles visible when the entity is missing." },
        { key: "show_forecast", title: "Show forecast row", help: "Needs a weather entity below." },
        { key: "show_updated", title: "Show last updated", help: "Append relative update time in the subtitle." },
        { key: "show_beaufort", title: "Show Beaufort scale", help: "Add Beaufort number on the wind speed tile." },
      ]);
      this._fillSwitches("section-switches", [
        { key: "hide_conditions", title: "Hide conditions", help: "Outdoor, feels like, high / low, humidity, dew point" },
        { key: "hide_wind", title: "Hide wind", help: "Compass, speed, gust, max gust" },
        { key: "hide_rain", title: "Hide rain", help: "Sparkline and rain totals" },
        { key: "hide_sun", title: "Hide sun", help: "UV, solar, light" },
        { key: "hide_soil", title: "Hide soil", help: "Soil moisture channels 1–4" },
        { key: "hide_lightning", title: "Hide lightning", help: "Strike count, distance, last strike" },
        { key: "hide_air", title: "Hide air quality", help: "PM2.5 tile" },
        { key: "hide_more", title: "Hide station extras", help: "Pressure, indoor, CO₂" },
        { key: "hide_battery", title: "Hide battery", help: "Status line at the bottom" },
      ]);
    }

    if (tab === "layout" && pickerReady && this._hass) {
      const host = this.shadowRoot.getElementById("weather-picker");
      if (host) {
        const picker = document.createElement("ha-entity-picker");
        picker.hass = this._hass;
        picker.label = "Forecast weather entity";
        picker.value = c.weather_entity || "";
        picker.allowCustomEntity = true;
        picker.includeDomains = ["weather"];
        picker.addEventListener("value-changed", (ev) => {
          ev.stopPropagation();
          this._setField("weather_entity", ev.detail?.value || "");
        });
        host.appendChild(picker);
      }
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
        picker.entityFilter = (state) => {
          const dc = state?.attributes?.device_class;
          return !dc || field.classes.includes(dc);
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
        <input data-section="labels" data-key="${field.key}" placeholder="Custom label" value="${this._esc(labels[field.key] || "")}" />
        <input data-section="units" data-key="${field.key}" placeholder="Custom unit" value="${this._esc(units[field.key] || "")}" />
      `;
      extra.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("change", (ev) => {
          const t = ev.target;
          this._setField(t.dataset.key, t.value, t.dataset.section);
        });
      });
      wrap.appendChild(extra);
      host.appendChild(wrap);
    });
    this._built = true;
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
      copy.innerHTML = `<span class="switch-title">${this._esc(item.title)}</span>${item.help ? `<span class="switch-help">${this._esc(item.help)}</span>` : ""}`;
      const useHaSwitch = !!customElements.get("ha-switch");
      const sw = document.createElement(useHaSwitch ? "ha-switch" : "input");
      if (!useHaSwitch) {
        sw.type = "checkbox";
        sw.style.width = "20px";
        sw.style.height = "20px";
        sw.style.flexShrink = "0";
      }
      // show_updated defaults to true when unset
      if (item.key === "show_updated") {
        sw.checked = this._config.show_updated !== false;
      } else {
        sw.checked = !!this._config[item.key];
      }
      sw.addEventListener("change", (ev) => {
        ev.stopPropagation();
        this._setField(item.key, !!sw.checked);
      });
      row.appendChild(copy);
      row.appendChild(sw);
      host.appendChild(row);
    });
  }

  _esc(s) {
    return String(s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
  }
}

customElements.define(`${CARD_TYPE}-editor`, MushroomWeatherStationCardEditor);
