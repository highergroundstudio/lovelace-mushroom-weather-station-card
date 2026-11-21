/**
 * Mushroom Weather Station Card
 * Home Assistant Lovelace custom card — HACS plugin
 *
 * type: custom:mushroom-weather-station-card
 */
import { CARD_NAME, CARD_TYPE, DEFAULT_SECTION_ORDER, SECTION_LABELS, WEATHER_ICONS } from "./const";
import {
  applyPrefix,
  available,
  batteryInfo,
  beaufort,
  colorFromThresholds,
  convertValue,
  entityAgeMs,
  entityState,
  esc,
  fmtNum,
  formatLastRain,
  iconColorVar,
  mergeThresholds,
  normalizeSectionOrder,
  num,
  parseWindDirection,
  pm25Meta,
  pressureTrendMeta,
  relativeTime,
  unitOf,
  uvMeta,
} from "./helpers";
import { CARD_STYLES } from "./styles";
import type {
  ActionConfig,
  CardConfig,
  ForecastDay,
  HassEntity,
  HomeAssistant,
  SectionId,
} from "./types";
import { CARD_VERSION } from "./version";

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

interface SparkItem {
  label: string;
  value: number | null;
}

class MushroomWeatherStationCard extends HTMLElement {
  static VERSION = CARD_VERSION;

  private _config?: CardConfig;
  private _hass?: HomeAssistant;
  private _forecastSubId: string | null = null;
  private _forecastUnsub: (() => void) | null = null;
  private _forecastDays: ForecastDay[] = [];
  private _forecastError: string | null = null;
  private _renderSignature: string | null = null;
  private _staleTimer: number | null = null;
  private _prevPressure: number | null = null;
  private _pressureSample: number | null = null;

  static getStubConfig(): CardConfig {
    return { prefix: "ws", layout: "full", name: "Weather Station", unit_system: "native" };
  }

  static async getConfigElement(): Promise<HTMLElement> {
    if (!customElements.get(`${CARD_TYPE}-editor`)) {
      await import(
        /* @vite-ignore */
        `./mushroom-weather-station-card-editor.js?v=${CARD_VERSION}`
      );
    }
    return document.createElement(`${CARD_TYPE}-editor`);
  }

  setConfig(config: CardConfig): void {
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
      stale_minutes: 30,
      forecast_days: 5,
      show_beaufort: false,
      ...config,
      section_order: normalizeSectionOrder(config.section_order ?? DEFAULT_SECTION_ORDER),
    });
    this._forecastSubId = null;
    this._renderSignature = null;
    void this._ensureForecastSub();
    this._render(true);
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    void this._ensureForecastSub();
    this._render(false);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  disconnectedCallback(): void {
    if (this._forecastUnsub) {
      try { this._forecastUnsub(); } catch { /* ignore */ }
      this._forecastUnsub = null;
    }
    if (this._staleTimer) {
      window.clearInterval(this._staleTimer);
      this._staleTimer = null;
    }
  }

  getCardSize(): number {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return 1;
    if (layout === "compact") return 4;
    return 9;
  }

  getGridOptions(): { columns: number; rows: number } {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return { columns: 12, rows: 1 };
    if (layout === "compact") return { columns: 12, rows: 4 };
    return { columns: 12, rows: 8 };
  }

  private _st(key: string): HassEntity | null {
    return entityState(this._hass, this._config?.entities?.[key]);
  }

  private _label(key: string, fallback: string): string {
    return this._config?.labels?.[key] || fallback;
  }

  private _conv(st: HassEntity | null | undefined, fallbackUnit = "") {
    const raw = num(st?.state);
    const src = this._config?.units_source?.[st?.entity_id || ""] || unitOf(st) || fallbackUnit;
    const target = this._config?.unit_system || "native";
    const out = convertValue(raw, src || fallbackUnit, target);
    return { raw, ...out, src };
  }

  private _unitStr(key: string, st: HassEntity | null | undefined, fallback = ""): string {
    return this._config?.units?.[key] || this._conv(st, fallback).unit || fallback;
  }

  private _fmt(key: string, st: HassEntity | null | undefined, digits: number, fallbackUnit = ""): string {
    const c = this._conv(st, fallbackUnit);
    if (c.value == null) return "—";
    const unit = this._config?.units?.[key] || c.unit || fallbackUnit;
    return `${fmtNum(c.value, digits)}${unit ? ` ${unit}` : ""}`.trim();
  }

  private _color(key: string, value: number | null, fallback = "grey"): string {
    return colorFromThresholds(value, mergeThresholds(this._config, key), fallback);
  }

  private _sectionVisible(hideKey: keyof CardConfig, states: Array<HassEntity | null>): boolean {
    if (this._config?.[hideKey]) return false;
    if (this._config?.show_empty) return true;
    return states.some((st) => available(st));
  }

  private _watchedSignature(): string {
    const entities = this._config?.entities || {};
    const ids = Object.values(entities).filter(Boolean);
    if (this._config?.weather_entity) ids.push(this._config.weather_entity);
    const parts = ids.map((id) => {
      const st = this._hass?.states?.[id];
      if (!st) return `${id}:missing`;
      return `${id}:${st.state}:${st.last_updated || ""}`;
    });
    parts.push(
      `cfg:${this._config?.layout}|${this._config?.unit_system}|${this._config?.show_forecast}|${this._config?.forecast_days}|${this._config?.show_updated}|${this._config?.stale_minutes}|${this._config?.show_beaufort}|${(this._config?.section_order || []).join(",")}`,
    );
    parts.push(`fc:${(this._forecastDays || []).length}:${this._forecastError || ""}`);
    return parts.join("|");
  }

  private _handleAction(actionCfg: ActionConfig | undefined, entityId: string): void {
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

  private _bindTile(el: Element, key: string, entityId: string): void {
    const acts = this._config?.actions?.[key] || {};
    const tablet = !!this._config?.tablet_mode;
    const tap = acts.tap_action || (tablet ? { action: "none" } : { action: "more-info" });
    const hold = acts.hold_action || (tablet ? { action: "more-info" } : null);
    const dbl = acts.double_tap_action;
    let holdTimer: number | null = null;
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

  private _compass(deg: number | null, card: string | null): string {
    const angle = Number.isFinite(deg as number) ? (deg as number) : 0;
    const muted = !Number.isFinite(deg as number);
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
        <div class="compass-label">${card || "—"} ${Number.isFinite(deg as number) ? `${Math.round(deg as number)}°` : ""}</div>
      </div>
    `;
  }

  private _sparkline(items: SparkItem[]): string {
    const vals = items.map((i) => i.value).filter((v): v is number => v != null && v >= 0);
    const max = Math.max(...vals, 0.01);
    const bars = items
      .map((i) => {
        const h = i.value == null ? 2 : Math.max(4, Math.round((i.value / max) * 36));
        const on = i.value != null && i.value > 0;
        return `<div class="bar-col"><div class="bar ${on ? "on" : ""}" style="height:${h}px"></div><div class="bar-lab">${esc(i.label)}</div></div>`;
      })
      .join("");
    return `<div class="spark">${bars}</div>`;
  }

  private _trackPressure(value: number | null) {
    if (value == null) return pressureTrendMeta(null, null);
    if (this._prevPressure == null || Math.abs((this._prevPressure ?? 0) - value) > 0.0001) {
      if (this._pressureSample != null && Math.abs(this._pressureSample - value) > 0.0001) {
        this._prevPressure = this._pressureSample;
      }
      this._pressureSample = value;
    }
    return pressureTrendMeta(value, this._prevPressure);
  }

  private _ensureStaleTimer(): void {
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
    }, 60000);
  }

  private async _ensureForecastSub(): Promise<void> {
    const id = this._config?.show_forecast ? this._config.weather_entity : null;
    if (!id || !this._hass) {
      if (this._forecastUnsub) {
        try { this._forecastUnsub(); } catch { /* ignore */ }
        this._forecastUnsub = null;
      }
      this._forecastSubId = null;
      return;
    }
    if (this._forecastSubId === id && this._forecastUnsub) return;
    if (this._forecastUnsub) {
      try { this._forecastUnsub(); } catch { /* ignore */ }
      this._forecastUnsub = null;
    }
    this._forecastSubId = id;
    this._forecastDays = [];
    this._forecastError = null;

    const attrDays = entityState(this._hass, id)?.attributes?.forecast;
    if (Array.isArray(attrDays) && attrDays.length) this._forecastDays = attrDays;

    try {
      if (this._hass.connection?.subscribeMessage) {
        this._forecastUnsub = await this._hass.connection.subscribeMessage(
          (ev) => {
            this._forecastDays = ev?.forecast || [];
            this._forecastError = this._forecastDays.length ? null : "empty";
            this._renderSignature = null;
            this._render(true);
          },
          { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: id },
        );
        return;
      }
    } catch {
      /* fall through */
    }

    try {
      const result = await this._hass.connection?.sendMessagePromise?.({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        service_data: { type: "daily", entity_id: id },
        return_response: true,
      });
      this._forecastDays = result?.response?.[id]?.forecast || [];
      if (!this._forecastDays.length) this._forecastError = "empty";
    } catch (err) {
      this._forecastError = (err as Error)?.message || "failed";
    }
    this._renderSignature = null;
    this._render(true);
  }

  private _sectionTitle(label: string, compact: boolean): string {
    return compact ? "" : `<div class="section-label"><span>${esc(label)}</span></div>`;
  }

  private _wrapSection(id: SectionId, compact: boolean, body: string): string {
    if (!body) return "";
    return `<section class="section" data-section="${id}">${this._sectionTitle(SECTION_LABELS[id], compact)}${body}</section>`;
  }

  private _tile(key: string, label: string, st: HassEntity | null, value: string, icon: string, color: string): string {
    if (!st && !this._config?.show_empty) return "";
    const entityId = st?.entity_id || "";
    return `
      <button class="tile" data-key="${esc(key)}" data-entity="${esc(entityId)}" ${entityId ? "" : "disabled"}>
        <ha-icon icon="${icon}" style="color:${iconColorVar(color)}"></ha-icon>
        <div class="tile-value">${esc(String(value))}</div>
        <div class="tile-label">${esc(label)}</div>
      </button>
    `;
  }

  private _chips(
    temp: HassEntity | null,
    feels: HassEntity | null,
    humidity: HassEntity | null,
    today: HassEntity | null,
    wind: HassEntity | null,
    raining: boolean,
  ): string {
    const t = this._conv(temp, "°F");
    const f = this._conv(feels, "°F");
    const chips = [
      { key: "temperature", st: temp, icon: "mdi:thermometer", text: t.value == null ? "—" : `${Math.round(t.value)}°` },
      { key: "feels_like", st: feels, icon: "mdi:sun-thermometer", text: f.value == null ? "—" : `${Math.round(f.value)}°` },
      { key: "humidity", st: humidity, icon: "mdi:water-percent", text: num(humidity?.state) == null ? "—" : `${Math.round(num(humidity?.state) as number)}%` },
      { key: "rain_today", st: today, icon: raining ? "mdi:weather-pouring" : "mdi:weather-rainy", text: this._fmt("rain_today", today, 2, "in") },
      { key: "wind_speed", st: wind, icon: "mdi:weather-windy", text: this._fmt("wind_speed", wind, 0, "mph") },
    ].filter((c) => c.st);
    return `<div class="chips">${chips
      .map((c) => `<button class="chip" data-key="${c.key}" data-entity="${esc(c.st!.entity_id)}"><ha-icon icon="${c.icon}"></ha-icon><span>${esc(c.text)}</span></button>`)
      .join("")}</div>`;
  }

  private _forecastHtml(): string {
    if (!this._config?.show_forecast) return "";
    const id = this._config.weather_entity;
    const st = entityState(this._hass, id);
    if (!id) return `<div class="hint">Pick a weather entity for forecast.</div>`;
    if (!st) return `<div class="hint">Weather entity ${esc(id)} is missing.</div>`;
    const daysWanted = Math.min(7, Math.max(1, Number(this._config.forecast_days) || 5));
    const days = (this._forecastDays || st.attributes.forecast || []).slice(0, daysWanted);
    if (!days.length) return `<div class="hint">Waiting for daily forecast from ${esc(id)}…</div>`;
    const target = this._config.unit_system || "native";
    const tempUnit = st.attributes.temperature_unit || "";
    return `
      <div class="forecast">
        ${days
          .map((d) => {
            const when = d.datetime ? new Date(d.datetime) : null;
            const day = when && !Number.isNaN(when.getTime())
              ? when.toLocaleDateString(undefined, { weekday: "short" })
              : "—";
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
          })
          .join("")}
      </div>
    `;
  }

  private _renderSection(id: SectionId, ctx: RenderCtx): string {
    const compact = ctx.compact;
    switch (id) {
      case "conditions": {
        if (!ctx.showConditions) return "";
        const body = `<div class="grid">
          ${this._tile("temperature", this._label("temperature", "Outdoor"), ctx.temp, ctx.t.value == null ? "—" : `${fmtNum(ctx.t.value, 1)}${ctx.tempUnit.includes("°") ? ctx.tempUnit : "°"}`, "mdi:thermometer", ctx.tColor)}
          ${this._tile("feels_like", this._label("feels_like", "Feels like"), ctx.feels, ctx.f.value == null ? "—" : `${fmtNum(ctx.f.value, 1)}°`, "mdi:sun-thermometer-outline", this._color("feels_like", ctx.f.raw, ctx.tColor))}
          ${this._tile("temp_high", this._label("temp_high", "High"), ctx.high, ctx.hi.value == null ? "—" : `${Math.round(ctx.hi.value)}°`, "mdi:thermometer-high", "orange")}
          ${this._tile("temp_low", this._label("temp_low", "Low"), ctx.low, ctx.lo.value == null ? "—" : `${Math.round(ctx.lo.value)}°`, "mdi:thermometer-low", "blue")}
          ${this._tile("humidity", this._label("humidity", "Humidity"), ctx.humidity, ctx.h == null ? "—" : `${Math.round(ctx.h)}${esc(this._unitStr("humidity", ctx.humidity, "%"))}`, "mdi:water-percent", this._color("humidity", ctx.h, "blue"))}
          ${this._tile("dew_point", this._label("dew_point", "Dew point"), ctx.dew, ctx.d.value == null ? "—" : `${fmtNum(ctx.d.value, 1)}°`, "mdi:molecule", this._color("dew_point", ctx.d.raw, "blue"))}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "wind": {
        if (!ctx.showWind) return "";
        const body = `<div class="wind-row">
          ${this._compass(ctx.deg, ctx.card)}
          <div class="grid wind-grid">
            ${this._tile("wind_speed", this._label("wind_speed", ctx.bf != null ? `Speed · B${ctx.bf}` : "Speed"), ctx.wind, ctx.ws.value == null ? "—" : `${fmtNum(ctx.ws.value, 1)} ${esc(this._unitStr("wind_speed", ctx.wind, ctx.ws.unit || "mph"))}`, "mdi:weather-windy", this._color("wind_speed", ctx.ws.raw, "teal"))}
            ${this._tile("wind_gust", this._label("wind_gust", "Gust"), ctx.gust, ctx.wg.value == null ? "—" : `${fmtNum(ctx.wg.value, 1)}`, "mdi:windsock", this._color("wind_gust", ctx.wg.raw, "teal"))}
            ${this._tile("max_gust", this._label("max_gust", "Max gust"), ctx.maxGust, num(ctx.maxGust?.state) == null ? "—" : this._fmt("max_gust", ctx.maxGust, 1, "mph"), "mdi:weather-windy-variant", "teal")}
          </div>
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "rain": {
        if (!ctx.showRain) return "";
        const body = `
          ${this._sparkline([
            { label: "T", value: num(ctx.today?.state) },
            { label: "E", value: num(ctx.event?.state) },
            { label: "W", value: num(ctx.week?.state) },
            { label: "M", value: num(ctx.month?.state) },
            { label: "Y", value: num(ctx.year?.state) },
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
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "soil": {
        if (!ctx.showSoil) return "";
        const body = `<div class="grid">
          ${this._tile("soil_moisture_1", this._label("soil_moisture_1", "Soil 1"), ctx.soil1, num(ctx.soil1?.state) == null ? "—" : `${Math.round(num(ctx.soil1?.state) as number)}%`, "mdi:water", this._color("soil_moisture_1", num(ctx.soil1?.state), "green"))}
          ${this._tile("soil_moisture_2", this._label("soil_moisture_2", "Soil 2"), ctx.soil2, num(ctx.soil2?.state) == null ? "—" : `${Math.round(num(ctx.soil2?.state) as number)}%`, "mdi:water", this._color("soil_moisture_2", num(ctx.soil2?.state), "green"))}
          ${this._tile("soil_moisture_3", this._label("soil_moisture_3", "Soil 3"), ctx.soil3, num(ctx.soil3?.state) == null ? "—" : `${Math.round(num(ctx.soil3?.state) as number)}%`, "mdi:water", this._color("soil_moisture_3", num(ctx.soil3?.state), "green"))}
          ${this._tile("soil_moisture_4", this._label("soil_moisture_4", "Soil 4"), ctx.soil4, num(ctx.soil4?.state) == null ? "—" : `${Math.round(num(ctx.soil4?.state) as number)}%`, "mdi:water", this._color("soil_moisture_4", num(ctx.soil4?.state), "green"))}
        </div>`;
        return this._wrapSection(id, compact, body);
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
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "station": {
        if (!ctx.showMore) return "";
        const body = `<div class="grid">
          ${this._tile("pressure", this._label("pressure", ctx.trend.label ? `Pressure · ${ctx.trend.label}` : "Pressure"), ctx.pressure, this._fmt("pressure", ctx.pressure, 2, unitOf(ctx.pressure) || "inHg"), ctx.trend.icon || "mdi:gauge", ctx.trend.color === "grey" ? "teal" : ctx.trend.color)}
          ${this._tile("pressure_abs", this._label("pressure_abs", "Abs pressure"), ctx.pressureAbs, this._fmt("pressure_abs", ctx.pressureAbs, 2, unitOf(ctx.pressureAbs) || "inHg"), "mdi:gauge", "teal")}
          ${this._tile("indoor_temperature", this._label("indoor_temperature", "Indoor"), ctx.indoorT, ctx.indoorT ? `${fmtNum(this._conv(ctx.indoorT, "°F").value, 1)}°` : "—", "mdi:home-thermometer", this._color("temperature", num(ctx.indoorT?.state), "green"))}
          ${this._tile("indoor_humidity", this._label("indoor_humidity", "Indoor RH"), ctx.indoorH, num(ctx.indoorH?.state) == null ? "—" : `${Math.round(num(ctx.indoorH?.state) as number)}%`, "mdi:water-percent", this._color("humidity", num(ctx.indoorH?.state), "cyan"))}
          ${this._tile("co2", this._label("co2", "CO₂"), ctx.co2, num(ctx.co2?.state) == null ? "—" : `${fmtNum(num(ctx.co2?.state), 0)} ${esc(this._unitStr("co2", ctx.co2, "ppm"))}`, "mdi:molecule-co2", this._color("co2", num(ctx.co2?.state), "green"))}
        </div>`;
        return this._wrapSection(id, compact, body);
      }
      case "forecast": {
        if (!this._config?.show_forecast) return "";
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

  private _render(force = false): void {
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
    const soil1 = this._st("soil_moisture_1");
    const soil2 = this._st("soil_moisture_2");
    const soil3 = this._st("soil_moisture_3");
    const soil4 = this._st("soil_moisture_4");
    const lightningCount = this._st("lightning_count");
    const lightningDistance = this._st("lightning_distance");
    const lightningTime = this._st("lightning_time");
    const battery = this._st("battery");

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
    const tColor = this._color("temperature", t.raw, "grey");
    const uvColor = this._color("uv", uvn, "grey");
    const uvm = uvMeta(uvn, uvColor);
    const pm = num(pm25?.state);
    const pmm = pm25Meta(pm, this._color("pm25", pm, "grey"));
    const pressureConv = this._conv(pressure, unitOf(pressure) || "inHg");
    const trend = this._trackPressure(pressureConv.value);
    const bf = this._config.show_beaufort ? beaufort(ws.value) : null;

    const ageMs = entityAgeMs(temp) ?? entityAgeMs(pressure) ?? entityAgeMs(wind);
    const staleLimit = Number(this._config.stale_minutes);
    const staleMinutes = Number.isFinite(staleLimit) ? staleLimit : 30;
    const isStale = ageMs != null && staleMinutes > 0 && ageMs > staleMinutes * 60000;
    const updatedLabel = ageMs == null
      ? null
      : relativeTime(new Date(Date.now() - ageMs), hass?.locale?.language);

    const heroIcon = raining
      ? (rr.raw ?? 0) >= 0.3
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
    const showSoil = this._sectionVisible("hide_soil", [soil1, soil2, soil3, soil4]);
    const showLightning = this._sectionVisible("hide_lightning", [lightningCount, lightningDistance, lightningTime]);
    const showAir = this._sectionVisible("hide_air", [pm25]);
    const showBattery = !this._config.hide_battery && !!battery;
    const showBody = layout !== "chips";
    const showExtra = layout === "full" || compact;
    const batt = batteryInfo(battery, this._config.battery_warning_threshold);
    const missing = !temp && !this._config.entities?.temperature;
    const tempUnit = this._unitStr("temperature", temp, t.unit || "°");
    const showUpdated = this._config.show_updated !== false;

    const subtitleBits: string[] = [];
    if (raining) {
      subtitleBits.push(`Raining · ${fmtNum(rr.value, 2)} ${esc(this._unitStr("rain_rate", rate, rr.unit || "in/h"))}`);
    } else {
      subtitleBits.push("Live station");
    }
    if (hi.value != null || lo.value != null) {
      subtitleBits.push(`H ${hi.value == null ? "—" : Math.round(hi.value)}° / L ${lo.value == null ? "—" : Math.round(lo.value)}°`);
    }

    const ctx: RenderCtx = {
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
      temp, feels, humidity, dew, high, low,
      wind, gust, maxGust,
      rate, today, event, week, month, year, lastRain,
      uv, irr, lux,
      pressure, pressureAbs, indoorT, indoorH, co2, pm25,
      soil1, soil2, soil3, soil4,
      lightningCount, lightningDistance, lightningTime,
      battery, batt,
      t, f, hi, lo, h, d, ws, wg, deg, card, rr, uvn, raining, tColor, uvm, pm, pmm, trend, bf, tempUnit,
    };

    const order = normalizeSectionOrder(this._config.section_order);
    const sectionsHtml = showExtra
      ? order.map((id) => this._renderSection(id, ctx)).join("")
      : "";

    const html = `
      <style>${CARD_STYLES}</style>
      <ha-card class="${compact ? "compact" : layout}${isStale ? " stale" : ""}">
        ${layout === "chips" ? this._chips(temp, feels, humidity, today, wind, raining) : ""}
        ${showBody ? `
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
          </button>
        ` : ""}
        ${sectionsHtml}
        ${missing && hass ? `<div class="hint">Set <code>prefix</code> (e.g. <code>ws</code>) or pick entities in the card editor.</div>` : ""}
      </ha-card>
    `;

    this.shadowRoot!.innerHTML = html;
    this.shadowRoot!.querySelectorAll("[data-entity]").forEach((el) => {
      const htmlEl = el as HTMLElement;
      this._bindTile(htmlEl, htmlEl.dataset.key || "", htmlEl.dataset.entity || "");
    });
  }
}

interface RenderCtx {
  compact: boolean;
  showConditions: boolean;
  showWind: boolean;
  showRain: boolean;
  showSun: boolean;
  showSoil: boolean;
  showLightning: boolean;
  showAir: boolean;
  showMore: boolean;
  showBattery: boolean;
  temp: HassEntity | null;
  feels: HassEntity | null;
  humidity: HassEntity | null;
  dew: HassEntity | null;
  high: HassEntity | null;
  low: HassEntity | null;
  wind: HassEntity | null;
  gust: HassEntity | null;
  maxGust: HassEntity | null;
  rate: HassEntity | null;
  today: HassEntity | null;
  event: HassEntity | null;
  week: HassEntity | null;
  month: HassEntity | null;
  year: HassEntity | null;
  lastRain: HassEntity | null;
  uv: HassEntity | null;
  irr: HassEntity | null;
  lux: HassEntity | null;
  pressure: HassEntity | null;
  pressureAbs: HassEntity | null;
  indoorT: HassEntity | null;
  indoorH: HassEntity | null;
  co2: HassEntity | null;
  pm25: HassEntity | null;
  soil1: HassEntity | null;
  soil2: HassEntity | null;
  soil3: HassEntity | null;
  soil4: HassEntity | null;
  lightningCount: HassEntity | null;
  lightningDistance: HassEntity | null;
  lightningTime: HassEntity | null;
  battery: HassEntity | null;
  batt: ReturnType<typeof batteryInfo>;
  t: { raw: number | null; value: number | null; unit: string; src: string };
  f: { raw: number | null; value: number | null; unit: string; src: string };
  hi: { raw: number | null; value: number | null; unit: string; src: string };
  lo: { raw: number | null; value: number | null; unit: string; src: string };
  h: number | null;
  d: { raw: number | null; value: number | null; unit: string; src: string };
  ws: { raw: number | null; value: number | null; unit: string; src: string };
  wg: { raw: number | null; value: number | null; unit: string; src: string };
  deg: number | null;
  card: string | null;
  rr: { raw: number | null; value: number | null; unit: string; src: string };
  uvn: number | null;
  raining: boolean;
  tColor: string;
  uvm: ReturnType<typeof uvMeta>;
  pm: number | null;
  pmm: ReturnType<typeof pm25Meta>;
  trend: ReturnType<typeof pressureTrendMeta>;
  bf: number | null;
  tempUnit: string;
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
  "color:#1b4d3e;background:#e8f5e9;font-weight:bold;padding:2px 6px;",
);
