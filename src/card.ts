/**
 * Mushroom Weather Station Card
 * Home Assistant Lovelace custom card — HACS plugin
 *
 * type: custom:mushroom-weather-station-card
 */
import {
  CARD_NAME,
  CARD_TYPE,
  DEFAULT_SECTION_ORDER,
  HISTORY_SPARK_KEYS,
  SECTION_LABELS,
  WEATHER_ICONS,
} from "./const";
import {
  aqiMeta,
  alertSeverityColor,
  applyPrefix,
  available,
  batteryInfo,
  beaufort,
  collectAlerts,
  colorFromThresholds,
  convertValue,
  daysSinceTimestamp,
  downsampleHistory,
  entityAgeMs,
  entityState,
  esc,
  fmtNum,
  formatLastRain,
  formatSunTime,
  historyLineSpark,
  iconColorVar,
  mergeThresholds,
  moonMeta,
  normalizeSectionOrder,
  num,
  parseWindDirection,
  pm25Meta,
  pressureTrendMeta,
  rainMonthProgress,
  relativeTime,
  thresholdCompareValue,
  unitOf,
  uvMeta,
  windRoseBins,
  windRoseSvg,
} from "./helpers";
import { CARD_STYLES } from "./styles";
import type {
  ActionConfig,
  CardConfig,
  ForecastItem,
  HassEntity,
  HistoryPoint,
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
  private _hourlyUnsub: (() => void) | null = null;
  private _forecastDays: ForecastItem[] = [];
  private _forecastHours: ForecastItem[] = [];
  private _forecastError: string | null = null;
  private _forecastToken = 0;
  private _renderSignature: string | null = null;
  private _staleTimer: number | null = null;
  private _prevPressure: number | null = null;
  private _pressureSample: number | null = null;
  private _history: Record<string, HistoryPoint[]> = {};
  private _historyToken = 0;
  private _historyFetchedAt = 0;
  private _forecastFetchedKey: string | null = null;
  private _chipsExpanded = false;

  static getStubConfig(): CardConfig {
    return {
      prefix: "ws",
      layout: "full",
      name: "Weather Station",
      unit_system: "native",
      show_hourly_forecast: true,
      show_history_sparklines: true,
      show_wind_rose: true,
      show_alerts: true,
    };
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
      section_order: normalizeSectionOrder(config.section_order ?? DEFAULT_SECTION_ORDER),
    });
    this._forecastSubId = null;
    this._forecastFetchedKey = null;
    this._forecastToken++;
    this._historyToken++;
    this._history = {};
    this._historyFetchedAt = 0;
    this._renderSignature = null;
    void this._ensureForecastSub();
    void this._ensureHistory();
    this._render(true);
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    void this._ensureForecastSub();
    void this._ensureHistory();
    this._render(false);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  disconnectedCallback(): void {
    this._forecastToken++;
    this._historyToken++;
    this._forecastSubId = null;
    this._forecastFetchedKey = null;
    if (this._forecastUnsub) {
      try { this._forecastUnsub(); } catch { /* ignore */ }
      this._forecastUnsub = null;
    }
    if (this._hourlyUnsub) {
      try { this._hourlyUnsub(); } catch { /* ignore */ }
      this._hourlyUnsub = null;
    }
    if (this._staleTimer) {
      window.clearInterval(this._staleTimer);
      this._staleTimer = null;
    }
  }

  getCardSize(): number {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return this._chipsExpanded ? 3 : 1;
    if (layout === "compact") return 5;
    return 10;
  }

  getGridOptions(): { columns: number; rows: number } {
    const layout = this._config?.layout || "full";
    if (layout === "chips") return { columns: 12, rows: this._chipsExpanded ? 3 : 1 };
    if (layout === "compact") return { columns: 12, rows: 5 };
    return { columns: 12, rows: 9 };
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

  private _color(key: string, value: number | null, fallback = "grey", unit = ""): string {
    const compare = unit ? thresholdCompareValue(value, unit) : value;
    return colorFromThresholds(compare, mergeThresholds(this._config, key), fallback);
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
    if (this._config?.alert_entity) ids.push(this._config.alert_entity);
    if (this._config?.sun_entity) ids.push(this._config.sun_entity);
    if (this._config?.moon_entity) ids.push(this._config.moon_entity);
    const parts = ids.map((id) => {
      const st = this._hass?.states?.[id];
      if (!st) return `${id}:missing`;
      return `${id}:${st.state}:${st.last_updated || ""}`;
    });
    parts.push(
      `cfg:${this._config?.layout}|${this._config?.unit_system}|${this._config?.show_forecast}|${this._config?.show_hourly_forecast}|${this._config?.forecast_days}|${this._config?.hourly_forecast_hours}|${this._config?.show_updated}|${this._config?.stale_minutes}|${this._config?.show_beaufort}|${this._config?.show_history_sparklines}|${this._config?.show_wind_rose}|${this._config?.show_alerts}|${this._config?.rain_month_normal}|${(this._config?.section_order || []).join(",")}|chips:${this._chipsExpanded}`,
    );
    parts.push(`fc:${(this._forecastDays || []).length}:${(this._forecastHours || []).length}:${this._forecastError || ""}`);
    parts.push(`hist:${Object.keys(this._history).map((k) => `${k}:${this._history[k]?.length || 0}`).join(",")}`);
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

  private _histSpark(key: string): string {
    if (this._config?.show_history_sparklines === false) return "";
    const pts = this._history[key];
    if (!pts?.length) return "";
    return historyLineSpark(downsampleHistory(pts));
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

  private async _fetchForecastType(
    id: string,
    forecastType: "daily" | "hourly",
    token: number,
  ): Promise<ForecastItem[]> {
    try {
      if (this._hass?.connection?.subscribeMessage && forecastType === "daily") {
        /* subscribe handled separately */
      }
      const result = await this._hass?.connection?.sendMessagePromise?.({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        service_data: { type: forecastType, entity_id: id },
        return_response: true,
      });
      if (token !== this._forecastToken) return [];
      return result?.response?.[id]?.forecast || [];
    } catch {
      return [];
    }
  }

  private _wantHourly(): boolean {
    if (!this._config?.weather_entity) return false;
    if (this._config.show_hourly_forecast === false) return false;
    if (this._config.show_hourly_forecast === true) return true;
    // Unset: enable hourly when a weather entity is already configured.
    return true;
  }

  private async _ensureForecastSub(): Promise<void> {
    const wantDaily = !!this._config?.show_forecast;
    const wantHourly = this._wantHourly();
    const id = wantDaily || wantHourly ? this._config?.weather_entity : null;
    if (!id || !this._hass) {
      if (this._forecastUnsub) {
        try { this._forecastUnsub(); } catch { /* ignore */ }
        this._forecastUnsub = null;
      }
      if (this._hourlyUnsub) {
        try { this._hourlyUnsub(); } catch { /* ignore */ }
        this._hourlyUnsub = null;
      }
      this._forecastSubId = null;
      return;
    }
    const subKey = `${id}|d:${wantDaily ? 1 : 0}|h:${wantHourly ? 1 : 0}`;
    // Skip only when live subscriptions (or a completed one-shot) already cover this key.
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
      try { this._forecastUnsub(); } catch { /* ignore */ }
      this._forecastUnsub = null;
    }
    if (this._hourlyUnsub) {
      try { this._hourlyUnsub(); } catch { /* ignore */ }
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
            { type: "weather/subscribe_forecast", forecast_type: "daily", entity_id: id },
          );
          if (token !== this._forecastToken) {
            try { unsub(); } catch { /* ignore */ }
          } else {
            this._forecastUnsub = unsub;
          }
        }
      } catch {
        /* fall through */
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
            { type: "weather/subscribe_forecast", forecast_type: "hourly", entity_id: id },
          );
          if (token !== this._forecastToken) {
            try { unsub(); } catch { /* ignore */ }
          } else {
            this._hourlyUnsub = unsub;
          }
        }
      } catch {
        /* fall through to service */
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
      // Mark one-shot complete when websocket subscribe is unavailable.
      if (!this._hass.connection?.subscribeMessage) this._forecastFetchedKey = subKey;
    }

    this._renderSignature = null;
    this._render(true);
  }

  private async _ensureHistory(): Promise<void> {
    if (!this._hass || !this._config) return;
    const needSparks = this._config.show_history_sparklines !== false;
    const needRose = this._config.show_wind_rose !== false;
    if (!needSparks && !needRose) return;
    if (Date.now() - this._historyFetchedAt < 5 * 60 * 1000 && Object.keys(this._history).length) return;

    const token = ++this._historyToken;
    const hours = Math.min(48, Math.max(6, Number(this._config.history_hours) || 24));
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    const entityIds: string[] = [];
    const keyById: Record<string, string> = {};

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
      let raw: unknown;
      if (this._hass.connection?.sendMessagePromise) {
        raw = await this._hass.connection.sendMessagePromise({
          type: "history/history_during_period",
          start_time: start.toISOString(),
          end_time: end.toISOString(),
          significant_changes_only: false,
          minimal_response: true,
          no_attributes: true,
          entity_ids: unique,
        });
      } else if (this._hass.callApi) {
        raw = await this._hass.callApi(
          "GET",
          `history/period/${start.toISOString()}?filter_entity_id=${unique.join(",")}&significant_changes_only=0&minimal_response`,
        );
      } else {
        return;
      }
      if (token !== this._historyToken) return;

      const next: Record<string, HistoryPoint[]> = {};
      const asRecord = raw as Record<string, Array<{ s?: string; state?: string; lu?: number; last_changed?: string }>> | Array<Array<{ entity_id?: string; state?: string; last_changed?: string }>>;

      const parsePoint = (rawState: unknown, changed: unknown): HistoryPoint | null => {
        let state = num(rawState);
        if (state == null && typeof rawState === "string") {
          const parsed = parseWindDirection({
            entity_id: "",
            state: rawState,
            attributes: {},
          });
          state = parsed.deg;
        }
        const t = typeof changed === "number"
          ? (changed > 1e12 ? changed : changed * 1000)
          : changed
            ? new Date(String(changed)).getTime()
            : NaN;
        return state == null || !Number.isFinite(t) ? null : { state, last_changed: t };
      };

      if (Array.isArray(asRecord)) {
        for (const series of asRecord) {
          if (!Array.isArray(series) || !series.length) continue;
          const id = series[0]?.entity_id || "";
          const key = keyById[id];
          if (!key) continue;
          next[key] = series
            .map((p) => parsePoint(p.state, p.last_changed))
            .filter((p): p is HistoryPoint => !!p);
        }
      } else if (asRecord && typeof asRecord === "object") {
        for (const [id, series] of Object.entries(asRecord)) {
          const key = keyById[id];
          if (!key || !Array.isArray(series)) continue;
          next[key] = series
            .map((p) => parsePoint(p.s ?? p.state, p.lu ?? p.last_changed))
            .filter((p): p is HistoryPoint => !!p);
        }
      }

      this._history = next;
      this._historyFetchedAt = Date.now();
      this._renderSignature = null;
      this._render(true);
    } catch {
      /* history optional */
    }
  }

  private _sectionTitle(label: string, compact: boolean): string {
    return compact ? "" : `<div class="section-label"><span>${esc(label)}</span></div>`;
  }

  private _wrapSection(id: SectionId, compact: boolean, body: string): string {
    if (!body) return "";
    return `<section class="section" data-section="${id}">${this._sectionTitle(SECTION_LABELS[id], compact)}${body}</section>`;
  }

  private _tile(key: string, label: string, st: HassEntity | null, value: string, icon: string, color: string, spark = ""): string {
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

  private _alertsHtml(): string {
    if (this._config?.show_alerts === false) return "";
    const weather = entityState(this._hass, this._config?.weather_entity);
    const alertEnt = entityState(this._hass, this._config?.alert_entity);
    const alerts = collectAlerts(weather, alertEnt).slice(0, 3);
    if (!alerts.length) return "";
    const entityId = this._config?.alert_entity || this._config?.weather_entity || "";
    return `<div class="alerts">${alerts
      .map((a) => {
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
      })
      .join("")}</div>`;
  }

  private _chips(
    temp: HassEntity | null,
    feels: HassEntity | null,
    humidity: HassEntity | null,
    today: HassEntity | null,
    wind: HassEntity | null,
    pressure: HassEntity | null,
    uv: HassEntity | null,
    gust: HassEntity | null,
    raining: boolean,
  ): string {
    const t = this._conv(temp, "°F");
    const f = this._conv(feels, "°F");
    type ChipItem = { key: string; st: HassEntity; icon: string; text: string };
    const primary: ChipItem[] = [
      { key: "temperature", st: temp, icon: "mdi:thermometer", text: t.value == null ? "—" : `${Math.round(t.value)}°` },
      { key: "feels_like", st: feels, icon: "mdi:sun-thermometer", text: f.value == null ? "—" : `${Math.round(f.value)}°` },
      { key: "humidity", st: humidity, icon: "mdi:water-percent", text: num(humidity?.state) == null ? "—" : `${Math.round(num(humidity?.state) as number)}%` },
      { key: "rain_today", st: today, icon: raining ? "mdi:weather-pouring" : "mdi:weather-rainy", text: this._fmt("rain_today", today, 2, "in") },
      { key: "wind_speed", st: wind, icon: "mdi:weather-windy", text: this._fmt("wind_speed", wind, 0, "mph") },
    ].filter((c): c is ChipItem => !!c.st);
    const extra: ChipItem[] = [
      { key: "pressure", st: pressure, icon: "mdi:gauge", text: this._fmt("pressure", pressure, 2, "inHg") },
      { key: "uv", st: uv, icon: "mdi:weather-sunny-alert", text: num(uv?.state) == null ? "—" : `${fmtNum(num(uv?.state), 0)} UV` },
      { key: "wind_gust", st: gust, icon: "mdi:windsock", text: this._fmt("wind_gust", gust, 0, "mph") },
    ].filter((c): c is ChipItem => !!c.st);
    const chipHtml = (c: ChipItem) =>
      `<button class="chip" data-key="${c.key}" data-entity="${esc(c.st.entity_id)}"><ha-icon icon="${c.icon}"></ha-icon><span>${esc(c.text)}</span></button>`;
    return `<div class="chips-bar ${this._chipsExpanded ? "expanded" : ""}">
      <div class="chips">
        ${primary.map(chipHtml).join("")}
        ${extra.length ? `<button class="chip expand" data-key="__chips_expand" data-entity="" title="More"><ha-icon icon="mdi:chevron-down"></ha-icon><span>${this._chipsExpanded ? "Less" : "More"}</span></button>` : ""}
      </div>
      ${extra.length ? `<div class="chips-extra">${extra.map(chipHtml).join("")}</div>` : ""}
    </div>`;
  }

  private _hourlyHtml(): string {
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
        ${hours
          .map((h) => {
            const when = h.datetime ? new Date(h.datetime) : null;
            const label = when && !Number.isNaN(when.getTime())
              ? when.toLocaleTimeString(undefined, { hour: "numeric" })
              : "—";
            const temp = h.temperature != null ? convertValue(h.temperature, tempUnit, target) : null;
            const icon = WEATHER_ICONS[h.condition || ""] || "mdi:weather-partly-cloudy";
            const pop = h.precipitation_probability != null ? Math.round(Number(h.precipitation_probability)) : null;
            return `<div class="fhour" data-key="forecast" data-entity="${esc(id)}">
              <div class="fhour-name">${esc(label)}</div>
              <ha-icon icon="${icon}"></ha-icon>
              <div class="fhour-temp">${temp?.value != null ? Math.round(temp.value) : "—"}°</div>
              ${pop != null ? `<div class="fhour-pop">${pop}%</div>` : ""}
            </div>`;
          })
          .join("")}
      </div>
    `;
  }

  private _forecastHtml(): string {
    const hourly = this._hourlyHtml();
    const showDaily = !!this._config?.show_forecast;
    if (!showDaily && !hourly) return "";
    const id = this._config?.weather_entity;
    if (!id) {
      // Only nudge when the user opted into a forecast feature that needs an entity.
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
    }
    return `${hourly}${daily}`;
  }

  private _soilTiles(): string {
    const parts: string[] = [];
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
          num(mSt?.state) == null ? "—" : `${Math.round(num(mSt?.state) as number)}%`,
          "mdi:water",
          this._color(mKey, num(mSt?.state), "green"),
        ),
      );
      parts.push(
        this._tile(
          tKey,
          this._label(tKey, `Soil ${i} °`),
          tSt,
          tSt ? `${fmtNum(this._conv(tSt, "°F").value, 1)}°` : "—",
          "mdi:thermometer",
          this._color("temperature", num(tSt?.state), "amber", this._conv(tSt, "°F").src || "°F"),
        ),
      );
    }
    const leaf = this._st("leaf_wetness");
    parts.push(
      this._tile(
        "leaf_wetness",
        this._label("leaf_wetness", "Leaf wet"),
        leaf,
        num(leaf?.state) == null ? "—" : `${Math.round(num(leaf?.state) as number)}%`,
        "mdi:leaf",
        this._color("leaf_wetness", num(leaf?.state), "cyan"),
      ),
    );
    return parts.join("");
  }

  private _renderSection(id: SectionId, ctx: RenderCtx): string {
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
        const rose = this._config?.show_wind_rose !== false && rosePts.length
          ? `<div class="wind-rose" data-key="wind_direction" data-entity="${esc(ctx.wdir?.entity_id || "")}">
              ${windRoseSvg(windRoseBins(rosePts.map((p) => p.state)))}
              <div class="wind-rose-label">24h rose</div>
            </div>`
          : "";
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
        const goal = progress.pct != null
          ? `<div class="rain-goal">
              <div class="rain-goal-top">
                <span>Month vs normal</span>
                <span>${fmtNum(monthVal, 2)} / ${fmtNum(normal, 2)}</span>
              </div>
              <div class="rain-goal-track"><div class="rain-goal-fill" style="width:${Math.min(100, progress.pct)}%"></div></div>
              <div class="rain-goal-meta">${esc(progress.label)}${daysSince != null ? ` · ${daysSince < 1 ? "<1" : fmtNum(daysSince, 0)} day${daysSince >= 1.5 ? "s" : ""} since rain` : ""}</div>
            </div>`
          : daysSince != null
            ? `<div class="rain-goal"><div class="rain-goal-top"><span>Days since rain</span><span>${daysSince < 1 ? "<1" : fmtNum(daysSince, 0)}</span></div></div>`
            : "";
        const body = `
          ${goal}
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
          ${this._tile("indoor_humidity", this._label("indoor_humidity", "Indoor RH"), ctx.indoorH, num(ctx.indoorH?.state) == null ? "—" : `${Math.round(num(ctx.indoorH?.state) as number)}%`, "mdi:water-percent", this._color("humidity", num(ctx.indoorH?.state), "cyan"))}
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
    const aqi = this._st("aqi");
    const voc = this._st("voc");
    const noise = this._st("noise");
    const leaf = this._st("leaf_wetness");
    const soilStates: HassEntity[] = [];
    for (let i = 1; i <= 8; i++) {
      const m = this._st(`soil_moisture_${i}`);
      const t = this._st(`soil_temperature_${i}`);
      if (m) soilStates.push(m);
      if (t) soilStates.push(t);
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
      (sun?.attributes?.next_rising as string) || (sun?.attributes?.rising as string),
      locale,
    );
    const sunset = formatSunTime(
      (sun?.attributes?.next_setting as string) || (sun?.attributes?.setting as string),
      locale,
    );
    const moonMetaInfo = moonMeta(moon?.state);

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
      wind, gust, maxGust, wdir,
      rate, today, event, week, month, year, lastRain,
      uv, irr, lux,
      pressure, pressureAbs, indoorT, indoorH, co2, pm25, aqi, voc, noise,
      lightningCount, lightningDistance, lightningTime,
      battery, batt, sun, moon,
      sunrise: sunrise !== "—" ? sunrise : "",
      sunset: sunset !== "—" ? sunset : "",
      moonMeta: moonMetaInfo,
      t, f, hi, lo, h, d, ws, wg, deg, card, rr, uvn, raining, tColor, uvm, pm, pmm, aqiVal, aqim, trend, bf, tempUnit,
    };

    const order = normalizeSectionOrder(this._config.section_order);
    const sectionsHtml = showExtra
      ? order.map((sid) => this._renderSection(sid, ctx)).join("")
      : "";

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

    this.shadowRoot!.innerHTML = html;
    this.shadowRoot!.querySelectorAll("[data-entity], [data-key='__chips_expand']").forEach((el) => {
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
  wdir: HassEntity | null;
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
  aqi: HassEntity | null;
  voc: HassEntity | null;
  noise: HassEntity | null;
  lightningCount: HassEntity | null;
  lightningDistance: HassEntity | null;
  lightningTime: HassEntity | null;
  battery: HassEntity | null;
  batt: ReturnType<typeof batteryInfo>;
  sun: HassEntity | null;
  moon: HassEntity | null;
  sunrise: string;
  sunset: string;
  moonMeta: ReturnType<typeof moonMeta>;
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
  aqiVal: number | null;
  aqim: ReturnType<typeof aqiMeta>;
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
