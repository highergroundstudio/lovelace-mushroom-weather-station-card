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
  buildRecordBook,
  collectAlerts,
  colorFromThresholds,
  comfortBandFromConfig,
  comfortScatterSvg,
  comfortStats,
  convertValue,
  currentSeason,
  daysSinceTimestamp,
  downsampleHistory,
  downsampleHistoryExtrema,
  entityAgeMs,
  entityState,
  esc,
  fmtNum,
  formatLastRain,
  formatSunTime,
  historyLineSpark,
  iconColorVar,
  isRecordSetToday,
  mergeThresholds,
  moonMeta,
  normalizeSectionOrder,
  num,
  parseWindDirection,
  pm25Meta,
  precipTimelineBars,
  precipTimelineSvg,
  pressureTrendMeta,
  rainMonthProgress,
  relativeTime,
  seasonalSkinClasses,
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
  private _precipBars: ReturnType<typeof precipTimelineBars> | null = null;
  private _historyToken = 0;
  private _historyFetchedAt = 0;
  private _historyPending = false;
  private _recordsHistory: Record<string, HistoryPoint[]> = {};
  private _recordsBook: ReturnType<typeof buildRecordBook> | null = null;
  private _recordsToken = 0;
  private _recordsFetchedAt = 0;
  private _recordsPending = false;
  private _forecastPending = false;
  private _forecastReadyKey: string | null = null;
  /** When set, setup failed because the weather entity was absent; retry after `_forecastRetryAt`. */
  private _forecastAbsentKey: string | null = null;
  private _forecastRetryAt = 0;
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
      // Hourly follows weather_entity when unset (see _wantHourly).
      stale_minutes: 30,
      forecast_days: 5,
      hourly_forecast_hours: 24,
      history_hours: 24,
      records_period: "month",
      hemisphere: "north",
      show_beaufort: false,
      sun_entity: "sun.sun",
      ...config,
      section_order: normalizeSectionOrder(config.section_order ?? DEFAULT_SECTION_ORDER),
    });
    const nextWeather = this._config.weather_entity || null;
    this._teardownForecast(true);
    this._forecastToken++;
    this._historyToken++;
    this._recordsToken++;
    // Drop cached forecasts when the weather entity changes so old readings cannot stick.
    if (prevWeather !== nextWeather) {
      this._forecastDays = [];
      this._forecastHours = [];
      this._forecastError = null;
    }
    this._history = {};
    this._precipBars = null;
    this._historyFetchedAt = 0;
    this._historyPending = false;
    this._recordsHistory = {};
    this._recordsBook = null;
    this._recordsFetchedAt = 0;
    this._recordsPending = false;
    this._renderSignature = null;
    void this._ensureForecastSub();
    void this._ensureHistory();
    void this._ensureRecordsHistory();
    this._render(true);
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    void this._ensureForecastSub();
    void this._ensureHistory();
    void this._ensureRecordsHistory();
    this._render(false);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  disconnectedCallback(): void {
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
  }

  private _teardownForecast(clearReady: boolean): void {
    if (this._forecastUnsub) {
      try { this._forecastUnsub(); } catch { /* ignore */ }
      this._forecastUnsub = null;
    }
    if (this._hourlyUnsub) {
      try { this._hourlyUnsub(); } catch { /* ignore */ }
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
      `cfg:${this._config?.layout}|${this._config?.unit_system}|${this._config?.show_forecast}|${this._config?.show_hourly_forecast}|${this._config?.forecast_days}|${this._config?.hourly_forecast_hours}|${this._config?.show_updated}|${this._config?.stale_minutes}|${this._config?.show_beaufort}|${this._config?.show_history_sparklines}|${this._config?.show_wind_rose}|${this._config?.show_alerts}|${this._config?.show_precip_timeline}|${this._config?.show_records}|${this._config?.show_comfort}|${this._config?.seasonal_skins}|${this._config?.records_period}|${this._config?.hemisphere}|${this._config?.rain_month_normal}|${(this._config?.section_order || []).join(",")}|chips:${this._chipsExpanded}|hist:${this._historyFetchedAt}|rec:${this._recordsFetchedAt}`,
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
        // Restore keyboard focus after the disclosure control is rebuilt.
        (this.shadowRoot?.querySelector('[data-key="__chips_expand"]') as HTMLElement | null)?.focus();
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
      this._teardownForecast(true);
      return;
    }
    const subKey = `${id}|d:${wantDaily ? 1 : 0}|h:${wantHourly ? 1 : 0}`;
    // Completed setup for this intent — do not resubscribe on every hass tick.
    if (this._forecastReadyKey === subKey) return;
    // Setup already running for this key.
    if (this._forecastPending && this._forecastSubId === subKey) return;

    const entityPresent = !!entityState(this._hass, id);
    // Missing-entity backoff: retry immediately when the entity appears, otherwise wait.
    if (this._forecastAbsentKey === subKey) {
      if (entityPresent) {
        this._forecastAbsentKey = null;
        this._forecastRetryAt = 0;
      } else if (Date.now() < this._forecastRetryAt) {
        return;
      }
    }

    // Live websocket handlers already cover what we want.
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
      // Intent changed — drop previous handlers but keep cached arrays to avoid flicker.
      this._teardownForecast(false);
    }

    this._forecastPending = true;
    this._forecastSubId = subKey;
    const token = ++this._forecastToken;
    this._forecastError = null;

    try {
      const attrDays = entityState(this._hass, id)?.attributes?.forecast;
      if (Array.isArray(attrDays) && attrDays.length && !this._forecastDays.length) {
        this._forecastDays = attrDays;
      }

      let dailySettled = !wantDaily;
      let hourlySettled = !wantHourly;

      if (wantDaily && !this._forecastUnsub) {
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
              return;
            }
            this._forecastUnsub = unsub;
            dailySettled = true;
          }
        } catch {
          /* fall through to get_forecasts */
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
                this._forecastHours = ev?.forecast || [];
                this._renderSignature = null;
                this._render(true);
              },
              { type: "weather/subscribe_forecast", forecast_type: "hourly", entity_id: id },
            );
            if (token !== this._forecastToken) {
              try { unsub(); } catch { /* ignore */ }
              return;
            }
            this._hourlyUnsub = unsub;
            hourlySettled = true;
          }
        } catch {
          /* hourly often unsupported — fall through to get_forecasts */
        }
        if (token !== this._forecastToken) return;
      } else if (wantHourly) {
        hourlySettled = true;
      }

      // One-shot fallbacks. Mark settled even on empty so hass ticks do not retry forever
      // once the weather entity is present (empty hourly usually means unsupported).
      if (wantDaily && !this._forecastUnsub) {
        const days = await this._fetchForecastType(id, "daily", token);
        if (token !== this._forecastToken) return;
        if (days.length) {
          this._forecastDays = days;
          this._forecastError = null;
        } else if (!this._forecastDays.length) {
          this._forecastError = "empty";
        }
        dailySettled = true;
      }

      if (wantHourly && !this._hourlyUnsub) {
        const hours = await this._fetchForecastType(id, "hourly", token);
        if (token !== this._forecastToken) return;
        if (hours.length) this._forecastHours = hours;
        hourlySettled = true;
      }

      if (token === this._forecastToken && dailySettled && hourlySettled) {
        const present = !!entityState(this._hass, id);
        // Latch ready for live unsubs, cached data, or a present entity (incl. empty unsupported types).
        if (
          present
          || this._forecastUnsub
          || this._hourlyUnsub
          || this._forecastDays.length
          || this._forecastHours.length
        ) {
          this._forecastReadyKey = subKey;
          this._forecastAbsentKey = null;
          this._forecastRetryAt = 0;
        } else {
          // Entity still missing — back off so hass ticks do not flood websockets.
          this._forecastAbsentKey = subKey;
          this._forecastRetryAt = Date.now() + 30_000;
        }
      }

      this._renderSignature = null;
      this._render(true);
    } finally {
      if (token === this._forecastToken) this._forecastPending = false;
    }
  }

  private _historyHours(): number {
    return Math.min(48, Math.max(6, Number(this._config?.history_hours) || 24));
  }

  private _wantPrecipTimeline(): boolean {
    return this._config?.show_precip_timeline !== false && !this._config?.hide_rain;
  }

  private _wantComfort(): boolean {
    return this._config?.show_comfort !== false && !this._config?.hide_comfort;
  }

  private _wantRecords(): boolean {
    return this._config?.show_records !== false && !this._config?.hide_records;
  }

  private _recordsDays(): number {
    return this._config?.records_period === "year" ? 365 : 30;
  }

  private _parseHistoryPoint(rawState: unknown, changed: unknown): HistoryPoint | null {
    const t = typeof changed === "number"
      ? (changed > 1e12 ? changed : changed * 1000)
      : changed
        ? new Date(String(changed)).getTime()
        : NaN;
    if (!Number.isFinite(t)) return null;

    if (typeof rawState === "string") {
      const low = rawState.toLowerCase();
      if (low === "unavailable" || low === "unknown") {
        // Keep the transition so comfort humidity does not carry through gaps.
        return { state: Number.NaN, last_changed: t, unavailable: true };
      }
    }

    let state = num(rawState);
    if (state == null && typeof rawState === "string") {
      const parsed = parseWindDirection({
        entity_id: "",
        state: rawState,
        attributes: {},
      });
      state = parsed.deg;
    }
    return state == null ? null : { state, last_changed: t };
  }

  private _ingestHistoryRaw(
    raw: unknown,
    keyById: Record<string, string>,
  ): Record<string, HistoryPoint[]> {
    const next: Record<string, HistoryPoint[]> = {};
    const asRecord = raw as Record<string, Array<{ s?: string; state?: string; lu?: number; last_changed?: string }>> | Array<Array<{ entity_id?: string; state?: string; last_changed?: string }>>;
    if (Array.isArray(asRecord)) {
      for (const series of asRecord) {
        if (!Array.isArray(series) || !series.length) continue;
        const id = series[0]?.entity_id || "";
        const key = keyById[id];
        if (!key) continue;
        next[key] = series
          .map((p) => this._parseHistoryPoint(p.state, p.last_changed))
          .filter((p): p is HistoryPoint => !!p);
      }
    } else if (asRecord && typeof asRecord === "object") {
      for (const [id, series] of Object.entries(asRecord)) {
        const key = keyById[id];
        if (!key || !Array.isArray(series)) continue;
        next[key] = series
          .map((p) => this._parseHistoryPoint(p.s ?? p.state, p.lu ?? p.last_changed))
          .filter((p): p is HistoryPoint => !!p);
      }
    }
    return next;
  }

  private async _fetchHistoryRaw(
    entityIds: string[],
    start: Date,
    end: Date,
    significantOnly: boolean,
  ): Promise<unknown | null> {
    if (!this._hass) return null;
    if (this._hass.connection?.sendMessagePromise) {
      return this._hass.connection.sendMessagePromise({
        type: "history/history_during_period",
        start_time: start.toISOString(),
        end_time: end.toISOString(),
        significant_changes_only: significantOnly,
        minimal_response: true,
        no_attributes: true,
        entity_ids: entityIds,
      });
    }
    if (this._hass.callApi) {
      const sig = significantOnly ? 1 : 0;
      // HA REST defaults omitted end_time to start+1 day — always pass end.
      const q =
        `history/period/${start.toISOString()}`
        + `?filter_entity_id=${entityIds.join(",")}`
        + `&end_time=${encodeURIComponent(end.toISOString())}`
        + `&significant_changes_only=${sig}&minimal_response`;
      return this._hass.callApi("GET", q);
    }
    return null;
  }

  private async _ensureHistory(): Promise<void> {
    if (!this._hass || !this._config) return;
    const needSparks = this._config.show_history_sparklines !== false;
    const needRose = this._config.show_wind_rose !== false;
    const needPrecip = this._wantPrecipTimeline();
    const needComfort = this._wantComfort();
    if (!needSparks && !needRose && !needPrecip && !needComfort) return;
    // Honor cache even for empty results; skip while a request is in flight.
    if (this._historyPending) return;
    if (this._historyFetchedAt && Date.now() - this._historyFetchedAt < 5 * 60 * 1000) return;

    const hours = this._historyHours();
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    const entityIds: string[] = [];
    const keyById: Record<string, string> = {};

    const addKey = (key: string) => {
      const id = this._config?.entities?.[key];
      if (!id) return;
      entityIds.push(id);
      keyById[id] = key;
    };

    if (needSparks) {
      for (const key of HISTORY_SPARK_KEYS) addKey(key);
    }
    if (needRose) addKey("wind_direction");
    if (needPrecip) addKey("rain_rate");
    if (needComfort) {
      addKey("temperature");
      addKey("humidity");
    }
    const unique = [...new Set(entityIds)];
    // No mapped entities — do not latch pending (there is no try/finally below).
    if (!unique.length) return;

    this._historyPending = true;
    const token = ++this._historyToken;

    try {
      const raw = await this._fetchHistoryRaw(unique, start, end, false);
      if (raw == null || token !== this._historyToken) return;

      const next = this._ingestHistoryRaw(raw, keyById);
      // Bucket precip from the full series before any display cap.
      this._precipBars = needPrecip && (next.rain_rate?.length)
        ? precipTimelineBars(next.rain_rate, hours, Math.min(36, Math.max(12, hours)))
        : null;
      for (const [key, pts] of Object.entries(next)) {
        if (key === "rain_rate") {
          // Cap only after timeline bars are computed.
          next[key] = pts.length > 1200 ? pts.slice(-1200) : pts;
        } else if (key === "humidity") {
          // Keep unavailable markers for comfort pairing (do not uniform-downsample).
          next[key] = pts.length > 2000 ? pts.slice(-2000) : pts;
        } else if (key === "wind_gust") {
          next[key] = downsampleHistoryExtrema(pts, 96, "max");
        } else {
          next[key] = downsampleHistory(pts, 72);
        }
      }

      this._history = next;
      this._historyFetchedAt = Date.now();
      this._renderSignature = null;
      this._render(true);
    } catch {
      /* history optional — still mark attempt so we don't hammer the API */
      if (token === this._historyToken) this._historyFetchedAt = Date.now();
    } finally {
      if (token === this._historyToken) this._historyPending = false;
    }
  }

  private async _ensureRecordsHistory(): Promise<void> {
    if (!this._hass || !this._config || !this._wantRecords()) return;
    if (this._recordsPending) return;
    if (this._recordsFetchedAt && Date.now() - this._recordsFetchedAt < 15 * 60 * 1000) return;

    const end = new Date();
    const start = new Date(end.getTime() - this._recordsDays() * 86400000);
    const entityIds: string[] = [];
    const keyById: Record<string, string> = {};
    for (const key of ["temperature", "wind_gust", "rain_rate", "rain_today"] as const) {
      const id = this._config.entities?.[key];
      if (!id) continue;
      entityIds.push(id);
      keyById[id] = key;
    }
    const unique = [...new Set(entityIds)];
    if (!unique.length) return;

    this._recordsPending = true;
    const token = ++this._recordsToken;
    try {
      // Significant-only keeps month/year payloads manageable.
      const raw = await this._fetchHistoryRaw(unique, start, end, true);
      if (raw == null || token !== this._recordsToken) return;
      const full = this._ingestHistoryRaw(raw, keyById);
      // Extremes from the full series — never after uniform downsample.
      this._recordsBook = buildRecordBook(full);
      // Slim copy is only a fallback if the book is cleared; keep peaks (and temp troughs).
      const slim: Record<string, HistoryPoint[]> = {};
      for (const [key, pts] of Object.entries(full)) {
        if (key === "temperature") {
          const highs = downsampleHistoryExtrema(pts, 120, "max");
          const lows = downsampleHistoryExtrema(pts, 120, "min");
          const byTs = new Map<number, HistoryPoint>();
          for (const p of [...highs, ...lows]) byTs.set(p.last_changed, p);
          slim[key] = [...byTs.values()].sort((a, b) => a.last_changed - b.last_changed);
        } else {
          slim[key] = downsampleHistoryExtrema(pts, 240, "max");
        }
      }
      this._recordsHistory = slim;
      this._recordsFetchedAt = Date.now();
      this._renderSignature = null;
      this._render(true);
    } catch {
      if (token === this._recordsToken) this._recordsFetchedAt = Date.now();
    } finally {
      if (token === this._recordsToken) this._recordsPending = false;
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
    const hourlyExplicit = this._config?.show_hourly_forecast === true;
    if (!showDaily && !hourly && !hourlyExplicit) return "";
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

  private _precipTimelineHtml(): string {
    if (!this._wantPrecipTimeline()) return "";
    const hours = this._historyHours();
    const bars = this._precipBars
      || precipTimelineBars(this._history.rain_rate || [], hours, Math.min(36, Math.max(12, hours)));
    if (!bars.length || (!this._precipBars && !(this._history.rain_rate || []).length)) return "";
    const peak = Math.max(...bars.map((b) => b.value), 0);
    const peakFmt = peak > 0 ? fmtNum(peak, 2) : "0";
    return `<div class="precip-timeline" data-key="rain_rate" data-entity="${esc(this._config?.entities?.rain_rate || "")}">
      <div class="precip-timeline-top">
        <span>Precipitation timeline</span>
        <span class="precip-timeline-meta">${hours}h · peak ${esc(peakFmt)}</span>
      </div>
      ${precipTimelineSvg(bars)}
    </div>`;
  }

  private _recordsHtml(ctx: RenderCtx): string {
    const book = this._recordsBook || buildRecordBook(this._recordsHistory);
    const period = this._config?.records_period === "year" ? "Year" : "Month";
    const target = this._config?.unit_system || "native";
    const tempSrc = this._conv(ctx.temp, "°F").src || "°F";
    const gustSrc = this._conv(ctx.gust || ctx.maxGust, "mph").src || "mph";
    const rateSrc = this._conv(ctx.rate, "in/h").src || "in/h";
    const rainSrc = this._conv(ctx.today, "in").src || "in";

    const fmtTemp = (ex: { value: number; at: number } | null) => {
      if (!ex) return { value: "—", when: "" };
      const c = convertValue(ex.value, tempSrc, target);
      return {
        value: `${c.value == null ? "—" : Math.round(c.value)}°`,
        when: relativeTime(new Date(ex.at), this._hass?.locale?.language),
      };
    };
    const fmtGust = (ex: { value: number; at: number } | null) => {
      if (!ex) return { value: "—", when: "" };
      const c = convertValue(ex.value, gustSrc, target);
      return {
        value: c.value == null ? "—" : `${fmtNum(c.value, 1)} ${esc(c.unit || "mph")}`,
        when: relativeTime(new Date(ex.at), this._hass?.locale?.language),
      };
    };
    const fmtRate = (ex: { value: number; at: number } | null) => {
      if (!ex) return { value: "—", when: "" };
      const c = convertValue(ex.value, rateSrc, target);
      return {
        value: c.value == null ? "—" : `${fmtNum(c.value, 2)} ${esc(c.unit || "")}`.trim(),
        when: relativeTime(new Date(ex.at), this._hass?.locale?.language),
      };
    };
    const fmtRain = (ex: { value: number; at: number } | null) => {
      if (!ex) return { value: "—", when: "" };
      const c = convertValue(ex.value, rainSrc, target);
      return {
        value: c.value == null ? "—" : `${fmtNum(c.value, 2)} ${esc(c.unit || "in")}`,
        when: relativeTime(new Date(ex.at), this._hass?.locale?.language),
      };
    };

    const hot = fmtTemp(book.hottest);
    const cold = fmtTemp(book.coldest);
    const gust = fmtGust(book.peakGust);
    const rate = fmtRate(book.peakRainRate);
    const wet = fmtRain(book.wettestDay);

    // Badge only when the extreme itself landed on today's local calendar day.
    const setHot = isRecordSetToday(book.hottest);
    const setCold = isRecordSetToday(book.coldest);
    const setGust = isRecordSetToday(book.peakGust);
    const setRate = isRecordSetToday(book.peakRainRate);
    const setWet = isRecordSetToday(book.wettestDay);

    const tile = (label: string, value: string, when: string, set: boolean) => `
      <div class="record-tile ${set ? "set" : ""}">
        <div class="record-label">${esc(label)}</div>
        <div class="record-value">${value}</div>
        ${when ? `<div class="record-when">${esc(when)}</div>` : ""}
        ${set ? `<span class="record-badge">Set today</span>` : ""}
      </div>`;

    if (!book.hottest && !book.coldest && !book.peakGust && !book.peakRainRate && !book.wettestDay) {
      return `<div class="hint">Record book needs history for temperature, gust, or rain sensors (${period.toLowerCase()} window).</div>`;
    }

    return `<div class="records-grid" title="${esc(period)} extremes">
      ${tile(`Hottest · ${period}`, hot.value, hot.when, setHot)}
      ${tile(`Coldest · ${period}`, cold.value, cold.when, setCold)}
      ${tile(`Peak gust · ${period}`, gust.value, gust.when, setGust)}
      ${tile(`Peak rain rate · ${period}`, rate.value, rate.when, setRate)}
      ${tile(`Wettest day · ${period}`, wet.value, wet.when, setWet)}
    </div>`;
  }

  private _comfortHtml(): string {
    const band = comfortBandFromConfig(this._config);
    // History values are in the sensor's native units; compare in °F via threshold helper path.
    const tempPts = (this._history.temperature || []).map((p) => {
      const src = this._conv(this._st("temperature"), "°F").src || "°F";
      const cmp = thresholdCompareValue(p.state, src);
      return cmp == null ? null : { state: cmp, last_changed: p.last_changed };
    }).filter((p): p is HistoryPoint => !!p);
    const humPts = this._history.humidity || [];
    const stats = comfortStats(tempPts, humPts, band);
    if (!stats.samples.length) {
      return `<div class="hint">Comfort zones need temperature and humidity history.</div>`;
    }
    const target = this._config?.unit_system || "native";
    const lo = convertValue(band.tempMin, "°F", target);
    const hi = convertValue(band.tempMax, "°F", target);
    const bandLabel = `${lo.value == null ? "—" : Math.round(lo.value)}–${hi.value == null ? "—" : Math.round(hi.value)}${lo.unit || "°"} · ${band.humidityMin}–${band.humidityMax}% RH`;
    const pct = stats.pct == null ? "—" : `${stats.pct}%`;
    return `<div class="comfort-panel">
      <div class="comfort-top">
        <div class="comfort-title">Hours in comfort</div>
        <div class="comfort-pct">${esc(pct)}</div>
      </div>
      <div class="comfort-track"><div class="comfort-fill" style="width:${stats.pct == null ? 0 : Math.min(100, stats.pct)}%"></div></div>
      <div class="comfort-meta">${fmtNum(stats.hoursIn, 1)}h of ${fmtNum(stats.hoursTotal, 1)}h in band · ${esc(bandLabel)}</div>
      ${comfortScatterSvg(stats.samples, band)}
      <div class="comfort-axes"><span>Cooler</span><span>Temp →</span><span>Warmer</span></div>
    </div>`;
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
              <div class="wind-rose-label">${this._historyHours()}h rose</div>
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
          ${this._precipTimelineHtml()}
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
      case "records": {
        if (!this._wantRecords()) return "";
        return this._wrapSection(id, compact, this._recordsHtml(ctx));
      }
      case "comfort": {
        if (!this._wantComfort()) return "";
        return this._wrapSection(id, compact, this._comfortHtml());
      }
      case "forecast": {
        const showDaily = !!this._config?.show_forecast;
        // Explicit hourly enable still shows the section (hint) even without a weather entity.
        const showHourly = this._wantHourly() || this._config?.show_hourly_forecast === true;
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

    const weatherSt = entityState(this._hass, this._config.weather_entity);
    const skinOn = this._config.seasonal_skins !== false;
    const season = currentSeason(new Date(), this._config.hemisphere === "south" ? "south" : "north");
    const skinClass = skinOn
      ? seasonalSkinClasses(season, weatherSt?.state || (raining ? "rainy" : null))
      : "";
    const layoutClass = compact ? "compact" : layout === "chips" ? "chips-layout" : layout;

    const html = `
      <style>${CARD_STYLES}</style>
      <ha-card class="${layoutClass}${isStale ? " stale" : ""}${skinClass ? ` ${skinClass}` : ""}">
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
