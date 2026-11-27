/**
 * Mushroom Weather Station Card — visual editor
 */
import { CARD_TYPE, DEFAULT_COMFORT, DEFAULT_SECTION_ORDER, EDITOR_FIELDS } from "./const";
import {
  applyPrefix,
  currentSeason,
  displayThresholdValue,
  esc,
  num,
  moveSection,
  moveSectionTo,
  normalizeSectionOrder,
  storeThresholdValue,
  thresholdEditorUnit,
} from "./helpers";
import { LANGUAGES, makeTranslator, type TranslationKey, type Translate } from "./i18n";
import type { CardConfig, HomeAssistant, Layout, SectionId, UnitSystem } from "./types";
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

/** Miniature wireframes for the layout picker. */
const LAYOUT_THUMBS: Record<Layout, string> = {
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
  </svg>`,
};

const SEASON_COLORS: Record<string, string> = {
  spring: "var(--green-color, #4caf50)",
  summer: "var(--amber-color, #ffc107)",
  autumn: "var(--orange-color, #ff9800)",
  winter: "var(--blue-color, #2196f3)",
};

/** Temperature × humidity chart with the comfort band highlighted. */
function comfortPreviewSvg(lo: number, hi: number, hMin: number, hMax: number, unit: string): string {
  const tMin = Math.min(lo, hi) - 15;
  const tMax = Math.max(lo, hi) + 15;
  const W = 220;
  const H = 90;
  const x = (t: number) => 24 + ((t - tMin) / Math.max(1, tMax - tMin)) * (W - 30);
  const y = (h: number) => H - 14 - (h / 100) * (H - 22);
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
  private _config: CardConfig = { entities: {}, layout: "full", labels: {}, units: {} };
  private _hass?: HomeAssistant;
  private _loaded = false;
  private _built = false;
  private _tab: "layout" | "entities" | "display" | "order" = "layout";
  private _dragFrom: number | null = null;
  private _t: Translate = makeTranslator("en");

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
      key === "show_precip_timeline" ||
      key === "show_records" ||
      key === "show_comfort" ||
      key === "seasonal_skins" ||
      key === "tablet_mode" ||
      key === "show_updated" ||
      key === "show_beaufort" ||
      key === "graph_popup" ||
      key === "derive_missing" ||
      String(key).startsWith("hide_")
    ) {
      (next as Record<string, unknown>)[key] = !!value;
    } else if (key === "comfort_temp_min" || key === "comfort_temp_max") {
      const displayed = value === "" ? NaN : Number(value);
      const system = this._unitSystem();
      const stored = Number.isFinite(displayed)
        ? storeThresholdValue(displayed, "temp", system === "native" ? "imperial" : system)
        : NaN;
      (next as Record<string, unknown>)[key] = Number.isFinite(stored) ? stored : value;
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
      key === "rain_month_normal" ||
      key === "comfort_humidity_min" ||
      key === "comfort_humidity_max"
    ) {
      const n = value === "" ? undefined : Number(value);
      (next as Record<string, unknown>)[key] = Number.isFinite(n as number) ? n : value;
    } else if (key === "battery_entities") {
      const list = String(value || "").split(",").map((v) => v.trim()).filter(Boolean);
      if (list.length) next.battery_entities = list;
      else delete next.battery_entities;
    } else if ((key === "language" || key === "layout") && !value) {
      delete (next as Record<string, unknown>)[key];
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
    this._t = makeTranslator(this._config.language || this._hass?.locale?.language || this._hass?.language);
    const t = this._t;
    if (!this._loaded) {
      this.shadowRoot!.innerHTML = `<p class="help">${esc(t("editor.loading"))}</p>`;
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
    // Prefer the blue threshold rule (always imperial); fall back to first cutoff / temp_blue_below.
    const storedTempBlue = Number(
      c.thresholds?.temperature?.find((r) => r.color === "blue" && r.below != null)?.below
        ?? c.thresholds?.temperature?.find((r) => r.below != null)?.below
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
          ${(["layout", "entities", "order", "display"] as const)
            .map((id) => `<button class="tab ${tab === id ? "on" : ""}" data-tab="${id}" aria-pressed="${tab === id}">${esc(t(`editor.tab_${id}` as TranslationKey))}</button>`)
            .join("")}
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
      const layout: Layout = c.layout || "full";
      const fmtDate = (d: Date) => d.toLocaleDateString(this._config.language || this._hass?.locale?.language, { month: "short", day: "numeric", year: "numeric" });
      const recDays = c.records_period === "year" ? 365 : 30;
      const recPreview = t("editor.records_preview", {
        start: fmtDate(new Date(Date.now() - recDays * 86400000)),
        end: fmtDate(new Date()),
      });
      const season = currentSeason(new Date(), c.hemisphere === "south" ? "south" : "north");
      const skinPreview = c.seasonal_skins === false
        ? t("editor.skin_off")
        : t("editor.skin_preview", { season: t(`editor.season_${season}` as TranslationKey) });
      body.innerHTML = `
        <label class="field">${esc(t("editor.name"))}
          <input data-key="name" value="${esc(c.name || "")}" placeholder="Weather Station" />
        </label>
        <fieldset class="layout-picker">
          <legend>${esc(t("editor.layout"))}</legend>
          ${(["full", "compact", "chips"] as Layout[])
            .map((id) => `<label class="layout-opt">
              <input type="radio" name="layout" data-key="layout" value="${id}" ${layout === id ? "checked" : ""} />
              ${LAYOUT_THUMBS[id]}
              <span>${esc(t(`editor.layout_${id}` as TranslationKey))}</span>
              <span class="opt-help">${esc(t(`editor.layout_${id}_help` as TranslationKey))}</span>
            </label>`)
            .join("")}
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
          ${order
            .map(
              (id, index) => `
            <div class="order-row" draggable="true" data-index="${index}">
              <div class="handle" aria-hidden="true">⠿</div>
              <div class="name">${index + 1}. ${esc(t(`section.${id}` as TranslationKey))}</div>
              <button type="button" data-move="up" data-index="${index}" ${index === 0 ? "disabled" : ""} aria-label="${esc(t("editor.move_up", { name: t(`section.${id}` as TranslationKey) }))}">↑</button>
              <button type="button" data-move="down" data-index="${index}" ${index === order.length - 1 ? "disabled" : ""} aria-label="${esc(t("editor.move_down", { name: t(`section.${id}` as TranslationKey) }))}">↓</button>
            </div>`,
            )
            .join("")}
        </div>
        <button type="button" id="reset-order" style="margin-top:8px;border:1px solid var(--divider-color);background:transparent;color:var(--primary-text-color);border-radius:8px;padding:8px 12px;cursor:pointer;font:inherit;">${esc(t("editor.order_reset"))}</button>
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
      body.querySelectorAll("[data-move]").forEach((btn) => {
        btn.addEventListener("click", (ev) => {
          ev.stopPropagation();
          const index = Number((btn as HTMLElement).dataset.index);
          const dir = (btn as HTMLElement).dataset.move === "up" ? -1 : 1;
          this._fire({ ...this._config, section_order: moveSection(order, index, dir as -1 | 1) });
          void this._render();
        });
      });
      body.querySelector("#reset-order")?.addEventListener("click", () => {
        this._fire({ ...this._config, section_order: [...DEFAULT_SECTION_ORDER] as SectionId[] });
        void this._render();
      });
    } else {
      body.innerHTML = `<p class="help">${esc(t("editor.entities_help"))}</p><div id="pickers"></div>${pickerReady ? "" : `<p class="help">${esc(t("editor.picker_missing"))}</p>`}`;
    }

    body.querySelectorAll("input, select").forEach((el) => {
      el.addEventListener("change", (ev) => {
        const target = ev.target as HTMLInputElement | HTMLSelectElement;
        const value = (target as HTMLInputElement).type === "checkbox" ? (target as HTMLInputElement).checked : target.value;
        this._setField(target.dataset.key || "", value, target.dataset.section);
      });
    });

    if (tab === "layout") {
      const sw = (key: string, id: string) => ({
        key,
        title: t(`editor.${id}` as TranslationKey),
        help: t(`editor.${id}_help` as TranslationKey),
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
        sw("show_beaufort", "sw_beaufort"),
      ]);
      this._fillSwitches(
        "section-switches",
        ["conditions", "wind", "rain", "sun", "soil", "lightning", "air", "more", "health", "records", "comfort", "battery"]
          .map((id) => sw(`hide_${id}`, `hide_${id}`)),
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
        <input data-section="labels" data-key="${field.key}" placeholder="${esc(t("editor.custom_label"))}" aria-label="${esc(`${field.label} · ${t("editor.custom_label")}`)}" value="${esc(labels[field.key] || "")}" />
        <input data-section="units" data-key="${field.key}" placeholder="${esc(t("editor.custom_unit"))}" aria-label="${esc(`${field.label} · ${t("editor.custom_unit")}`)}" value="${esc(units[field.key] || "")}" />
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
        "show_precip_timeline",
        "show_records",
        "show_comfort",
        "seasonal_skins",
        "derive_missing",
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
