/**
 * Mushroom Weather Station Card — visual editor
 */
import { CARD_TYPE, DEFAULT_SECTION_ORDER, EDITOR_FIELDS, SECTION_LABELS } from "./const";
import {
  applyPrefix,
  displayThresholdValue,
  esc,
  moveSectionTo,
  normalizeSectionOrder,
  storeThresholdValue,
  thresholdEditorUnit,
} from "./helpers";
import type { CardConfig, HomeAssistant, SectionId, UnitSystem } from "./types";
import { CARD_VERSION as FALLBACK_VERSION } from "./version";

const CARD_VERSION =
  (customElements.get(CARD_TYPE) as (CustomElementConstructor & { VERSION?: string }) | undefined)?.VERSION ||
  (customElements.get(CARD_TYPE) as (CustomElementConstructor & { constructor?: { VERSION?: string } }) | undefined)?.constructor?.VERSION ||
  FALLBACK_VERSION;

async function loadHaComponents(): Promise<void> {
  if (customElements.get("ha-entity-picker")) return;
  try {
    const loadHelpers = (window as unknown as { loadCardHelpers?: () => Promise<{ createCardElement: (cfg: Record<string, unknown>) => Promise<{ constructor?: { getConfigElement?: () => Promise<unknown> } }> }> }).loadCardHelpers;
    if (typeof loadHelpers === "function") {
      const helpers = await loadHelpers();
      const el = await helpers.createCardElement({ type: "entities", entities: ["sun.sun"] });
      if (el?.constructor?.getConfigElement) await el.constructor.getConfigElement();
    }
  } catch {
    /* fallback */
  }
  if (customElements.get("ha-entity-picker")) return;
  for (const tag of ["hui-entities-card", "hui-glance-card", "hui-entity-card"]) {
    const Card = customElements.get(tag) as (CustomElementConstructor & { getConfigElement?: () => Promise<unknown> }) | undefined;
    if (Card?.getConfigElement) {
      try { await Card.getConfigElement(); } catch { /* next */ }
      if (customElements.get("ha-entity-picker")) return;
    }
  }
}

class MushroomWeatherStationCardEditor extends HTMLElement {
  private _config: CardConfig = { entities: {}, layout: "full", labels: {}, units: {} };
  private _hass?: HomeAssistant;
  private _loaded = false;
  private _built = false;
  private _tab: "layout" | "entities" | "display" | "order" = "layout";
  private _dragFrom: number | null = null;

  setConfig(config: CardConfig): void {
    this._config = { entities: {}, layout: "full", labels: {}, units: {}, ...config };
    this._built = false;
    void this._render();
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    if (this._built && this.shadowRoot) {
      this.shadowRoot.querySelectorAll("ha-entity-picker").forEach((p) => {
        (p as HTMLElement & { hass: HomeAssistant }).hass = hass;
      });
      return;
    }
    void this._render();
  }

  connectedCallback(): void {
    void this._render();
  }

  private _fire(next: CardConfig): void {
    this._config = next;
    this.dispatchEvent(new CustomEvent("config-changed", { detail: { config: next }, bubbles: true, composed: true }));
  }

  private _unitSystem(): UnitSystem {
    return this._config.unit_system || "native";
  }

  private _setField(key: string, value: unknown, section?: string): void {
    const next: CardConfig = {
      ...this._config,
      entities: { ...(this._config.entities || {}) },
      labels: { ...(this._config.labels || {}) },
      units: { ...(this._config.units || {}) },
    };
    if (section === "entities") {
      if (value) next.entities![key] = String(value);
      else delete next.entities![key];
    } else if (section === "labels") {
      if (value) next.labels![key] = String(value);
      else delete next.labels![key];
    } else if (section === "units") {
      if (value) next.units![key] = String(value);
      else delete next.units![key];
    } else if (
      key === "show_empty" ||
      key === "show_forecast" ||
      key === "show_hourly_forecast" ||
      key === "show_history_sparklines" ||
      key === "show_wind_rose" ||
      key === "show_alerts" ||
      key === "tablet_mode" ||
      key === "show_updated" ||
      key === "show_beaufort" ||
      String(key).startsWith("hide_")
    ) {
      (next as Record<string, unknown>)[key] = !!value;
    } else if (key === "uv_purple_above" || key === "temp_blue_below") {
      const thresholds = { ...(next.thresholds || {}) };
      const system = this._unitSystem();
      if (key === "uv_purple_above") {
        const n = value === "" ? NaN : Number(value);
        thresholds.uv = Number.isFinite(n) ? [{ above: n, color: "purple" }] : [];
      } else {
        const displayed = value === "" ? NaN : Number(value);
        const stored = Number.isFinite(displayed)
          ? storeThresholdValue(displayed, "temp", system === "native" ? "imperial" : system)
          : NaN;
        thresholds.temperature = Number.isFinite(stored) ? [{ below: stored, color: "blue" }] : [];
        thresholds.feels_like = thresholds.temperature;
        // Persist imperial so re-display does not double-convert metric inputs.
        (next as Record<string, unknown>)[key] = Number.isFinite(stored) ? stored : value;
      }
      next.thresholds = thresholds;
      if (key === "uv_purple_above") (next as Record<string, unknown>)[key] = value;
    } else if (
      key === "stale_minutes" ||
      key === "forecast_days" ||
      key === "hourly_forecast_hours" ||
      key === "history_hours" ||
      key === "battery_warning_threshold" ||
      key === "rain_month_normal"
    ) {
      const n = value === "" ? undefined : Number(value);
      (next as Record<string, unknown>)[key] = Number.isFinite(n as number) ? n : value;
    } else {
      (next as Record<string, unknown>)[key] = value;
    }
    if (key === "prefix") {
      next.entities = applyPrefix(next, this._config.prefix).entities;
    }
    this._fire(next);
    void this._render();
  }

  private async _render(): Promise<void> {
    if (!this._config) return;
    if (!this.shadowRoot) this.attachShadow({ mode: "open" });
    if (!this._loaded) {
      this.shadowRoot!.innerHTML = `<p class="help">Loading Home Assistant pickers…</p>`;
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
    // Prefer the threshold rule (always imperial); fall back to temp_blue_below which is also stored imperial.
    const storedTempBlue = Number(
      c.thresholds?.temperature?.find((r) => r.below != null)?.below
        ?? c.temp_blue_below
        ?? 32,
    );
    const displayTempBlue = displayThresholdValue(
      Number.isFinite(storedTempBlue) ? storedTempBlue : 32,
      "temp",
      system === "native" ? "imperial" : system,
    );

    this.shadowRoot!.innerHTML = `
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
          grid-template-columns: 28px 1fr;
          gap: 10px;
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
        @media (max-width: 520px) { .row, .slot-extra { grid-template-columns: 1fr; } }
      </style>
      <div class="wrap">
        <div class="version">Mushroom Weather Station Card · v${CARD_VERSION}</div>
        <div class="tabs">
          <button class="tab ${tab === "layout" ? "on" : ""}" data-tab="layout">Layout</button>
          <button class="tab ${tab === "entities" ? "on" : ""}" data-tab="entities">Entities</button>
          <button class="tab ${tab === "order" ? "on" : ""}" data-tab="order">Order</button>
          <button class="tab ${tab === "display" ? "on" : ""}" data-tab="display">Display</button>
        </div>
        <div id="tab-body"></div>
      </div>
    `;

    this.shadowRoot!.querySelectorAll(".tab").forEach((btn) => {
      btn.addEventListener("click", () => {
        this._tab = (btn as HTMLElement).dataset.tab as typeof this._tab;
        this._built = false;
        void this._render();
      });
    });

    const body = this.shadowRoot!.getElementById("tab-body")!;
    if (tab === "layout") {
      body.innerHTML = `
        <div class="row">
          <label class="field">Name
            <input data-key="name" value="${esc(c.name || "")}" placeholder="Weather Station" />
          </label>
          <label class="field">Layout
            <select data-key="layout">
              <option value="full" ${c.layout === "full" || !c.layout ? "selected" : ""}>Full station</option>
              <option value="compact" ${c.layout === "compact" ? "selected" : ""}>Compact</option>
              <option value="chips" ${c.layout === "chips" ? "selected" : ""}>Chips glance bar</option>
            </select>
          </label>
        </div>
        <label class="field">Entity prefix
          <input data-key="prefix" value="${esc(c.prefix || "")}" placeholder="ws" />
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
            <input data-key="forecast_days" type="number" min="1" max="7" value="${esc(c.forecast_days ?? "5")}" placeholder="5" />
          </label>
          <label class="field">Hourly hours
            <input data-key="hourly_forecast_hours" type="number" min="6" max="24" value="${esc(c.hourly_forecast_hours ?? "24")}" placeholder="24" />
          </label>
        </div>
        <div class="row">
          <label class="field">Stale after (minutes)
            <input data-key="stale_minutes" type="number" min="0" value="${esc(c.stale_minutes ?? "30")}" placeholder="30" />
          </label>
          <label class="field">History window (hours)
            <input data-key="history_hours" type="number" min="6" max="48" value="${esc(c.history_hours ?? "24")}" placeholder="24" />
          </label>
        </div>
        <label class="field">Rain month normal
          <input data-key="rain_month_normal" type="number" min="0" step="0.01" value="${esc(c.rain_month_normal ?? "")}" placeholder="e.g. 2.5" />
        </label>
        <div id="weather-picker"></div>
        <div id="alert-picker"></div>
        <div id="sun-picker"></div>
        <div id="moon-picker"></div>
        <h3>Sections</h3>
        <p class="help">Off = show the section when it has data. On = hide it even if sensors exist.</p>
        <div id="section-switches" class="switch-list"></div>
      `;
    } else if (tab === "display") {
      body.innerHTML = `
        <div class="row">
          <label class="field">Battery warning threshold
            <input data-key="battery_warning_threshold" type="number" value="${esc(c.battery_warning_threshold ?? "")}" placeholder="20" />
          </label>
          <label class="field">UV purple at / above
            <input data-key="uv_purple_above" type="number" value="${esc(c.uv_purple_above ?? "8")}" placeholder="8" />
          </label>
        </div>
        <label class="field">Temperature blue at / below (${esc(tempUnit)})
          <input data-key="temp_blue_below" type="number" value="${esc(Number(displayTempBlue.toFixed(1)))}" placeholder="${tempUnit === "°C" ? "0" : "32"}" />
        </label>
        <p class="help">Threshold cutoffs follow the selected unit system (${esc(system)}). Stored rules stay compatible with imperial defaults. Per-slot labels and units are under Entities.</p>
      `;
    } else if (tab === "order") {
      body.innerHTML = `
        <p class="help">Drag sections to reorder. Hidden sections stay listed but do not render.</p>
        <div class="order-list" id="order-list">
          ${order
            .map(
              (id, index) => `
            <div class="order-row" draggable="true" data-index="${index}">
              <div class="handle" aria-hidden="true">⠿</div>
              <div class="name">${index + 1}. ${esc(SECTION_LABELS[id])}</div>
            </div>`,
            )
            .join("")}
        </div>
        <button type="button" id="reset-order" style="margin-top:8px;border:1px solid var(--divider-color);background:transparent;color:var(--primary-text-color);border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit;">Reset to default order</button>
      `;
      const rows = [...body.querySelectorAll(".order-row")] as HTMLElement[];
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
      body.querySelector("#reset-order")?.addEventListener("click", () => {
        this._fire({ ...this._config, section_order: [...DEFAULT_SECTION_ORDER] as SectionId[] });
        void this._render();
      });
    } else {
      body.innerHTML = `<p class="help">Prefix auto-fills empty slots. Pickers override one sensor at a time.</p><div id="pickers"></div>${pickerReady ? "" : `<p class="help">Entity picker did not load. Reload Lovelace resources.</p>`}`;
    }

    body.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const target = ev.target as HTMLInputElement | HTMLSelectElement;
        const value = (target as HTMLInputElement).type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
        this._setField(target.dataset.key || "", value, target.dataset.section);
      });
    });

    if (tab === "layout") {
      this._fillSwitches("options-switches", [
        { key: "tablet_mode", title: "Tablet mode", help: "Tap does nothing. Hold a tile for more-info." },
        { key: "show_empty", title: "Show empty tiles", help: "Keep tiles visible when the entity is missing." },
        { key: "show_forecast", title: "Show daily forecast", help: "Needs a weather entity below." },
        { key: "show_hourly_forecast", title: "Show hourly forecast", help: "12–24h strip with precip % and temp." },
        { key: "show_history_sparklines", title: "History sparklines", help: "Mini charts on temp, humidity, wind, pressure." },
        { key: "show_wind_rose", title: "Wind rose", help: "Direction distribution from history." },
        { key: "show_alerts", title: "Weather alerts banner", help: "From weather attributes or alert entity." },
        { key: "show_updated", title: "Show last updated", help: "Status chip with relative update time." },
        { key: "show_beaufort", title: "Show Beaufort scale", help: "Add Beaufort number on the wind speed tile." },
      ]);
      this._fillSwitches("section-switches", [
        { key: "hide_conditions", title: "Hide conditions", help: "Outdoor, feels like, high / low, humidity, dew point" },
        { key: "hide_wind", title: "Hide wind", help: "Compass, rose, speed, gust, max gust" },
        { key: "hide_rain", title: "Hide rain", help: "Goals, sparkline, and rain totals" },
        { key: "hide_sun", title: "Hide sun & moon", help: "UV, solar, light, sunrise/sunset, moon" },
        { key: "hide_soil", title: "Hide soil", help: "Moisture/temp channels 1–8 and leaf wetness" },
        { key: "hide_lightning", title: "Hide lightning", help: "Strike count, distance, last strike" },
        { key: "hide_air", title: "Hide air quality", help: "PM2.5, AQI, VOC, noise" },
        { key: "hide_more", title: "Hide station extras", help: "Pressure, indoor, CO₂" },
        { key: "hide_battery", title: "Hide battery", help: "Status line at the bottom" },
      ]);
    }

    if (tab === "layout" && pickerReady && this._hass) {
      this._mountPicker("weather-picker", "Forecast weather entity", c.weather_entity || "", ["weather"], "weather_entity");
      this._mountPicker("alert-picker", "Alert entity (optional)", c.alert_entity || "", ["sensor", "binary_sensor", "event"], "alert_entity");
      this._mountPicker("sun-picker", "Sun entity", c.sun_entity || "sun.sun", ["sun"], "sun_entity");
      this._mountPicker("moon-picker", "Moon entity (optional)", c.moon_entity || "", ["sensor"], "moon_entity");
    }

    if (tab !== "entities" || !pickerReady || !this._hass) {
      this._built = true;
      return;
    }

    const host = this.shadowRoot!.getElementById("pickers")!;
    EDITOR_FIELDS.forEach((field) => {
      const wrap = document.createElement("div");
      wrap.className = "slot";
      const picker = document.createElement("ha-entity-picker") as HTMLElement & {
        hass: HomeAssistant;
        label: string;
        value: string;
        allowCustomEntity: boolean;
        includeDomains: readonly string[];
        includeDeviceClasses?: readonly string[];
        entityFilter?: (state: { attributes?: { device_class?: string } }) => boolean;
      };
      picker.hass = this._hass!;
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
        this._setField(field.key, (ev as CustomEvent).detail?.value || "", "entities");
      });
      wrap.appendChild(picker);
      const extra = document.createElement("div");
      extra.className = "slot-extra";
      extra.innerHTML = `
        <input data-section="labels" data-key="${field.key}" placeholder="Custom label" value="${esc(labels[field.key] || "")}" />
        <input data-section="units" data-key="${field.key}" placeholder="Custom unit" value="${esc(units[field.key] || "")}" />
      `;
      extra.querySelectorAll("input").forEach((inp) => {
        inp.addEventListener("change", (ev) => {
          const t = ev.target as HTMLInputElement;
          this._setField(t.dataset.key || "", t.value, t.dataset.section);
        });
      });
      wrap.appendChild(extra);
      host.appendChild(wrap);
    });
    this._built = true;
  }

  private _mountPicker(
    hostId: string,
    label: string,
    value: string,
    domains: string[],
    key: string,
  ): void {
    const host = this.shadowRoot!.getElementById(hostId);
    if (!host || !this._hass) return;
    const picker = document.createElement("ha-entity-picker") as HTMLElement & {
      hass: HomeAssistant;
      label: string;
      value: string;
      allowCustomEntity: boolean;
      includeDomains: string[];
    };
    picker.hass = this._hass;
    picker.label = label;
    picker.value = value;
    picker.allowCustomEntity = true;
    picker.includeDomains = domains;
    picker.addEventListener("value-changed", (ev) => {
      ev.stopPropagation();
      this._setField(key, (ev as CustomEvent).detail?.value || "");
    });
    host.appendChild(picker);
  }

  private _fillSwitches(hostId: string, items: Array<{ key: string; title: string; help?: string }>): void {
    const host = this.shadowRoot!.getElementById(hostId);
    if (!host) return;
    host.replaceChildren();
    items.forEach((item) => {
      const row = document.createElement("div");
      row.className = "switch-row";
      const copy = document.createElement("div");
      copy.className = "switch-copy";
      copy.innerHTML = `<span class="switch-title">${esc(item.title)}</span>${item.help ? `<span class="switch-help">${esc(item.help)}</span>` : ""}`;
      const useHaSwitch = !!customElements.get("ha-switch");
      const sw = document.createElement(useHaSwitch ? "ha-switch" : "input") as HTMLInputElement;
      if (!useHaSwitch) {
        sw.type = "checkbox";
        sw.style.width = "20px";
        sw.style.height = "20px";
        sw.style.flexShrink = "0";
      }
      const defaultsOn = new Set([
        "show_updated",
        "show_history_sparklines",
        "show_wind_rose",
        "show_alerts",
      ]);
      if (item.key === "show_hourly_forecast") {
        // Match card: unset + weather_entity ⇒ on; explicit false ⇒ off.
        const raw = this._config.show_hourly_forecast;
        sw.checked = raw === false ? false : raw === true ? true : !!this._config.weather_entity;
      } else if (defaultsOn.has(item.key)) {
        const raw = (this._config as Record<string, unknown>)[item.key];
        sw.checked = raw !== false;
      } else {
        sw.checked = !!(this._config as Record<string, unknown>)[item.key];
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
}

customElements.define(`${CARD_TYPE}-editor`, MushroomWeatherStationCardEditor);
