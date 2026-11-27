/**
 * Mushroom Weather Station Card
 * Home Assistant Lovelace custom card — HACS plugin
 *
 * type: custom:mushroom-weather-station-card
 *
 * This file owns the element lifecycle, data fetching, events and the render
 * loop. Section markup lives in `src/sections/`, one file per section.
 */
import { CARD_NAME, CARD_TYPE, DEFAULT_SECTION_ORDER, GRAPH_KEYS, HISTORY_SPARK_KEYS } from "./const";
import {
  type StatPeriod,
  type StatRow,
  fetchHistoryRaw,
  fetchStatistics,
  ingestHistoryRaw,
  recordBookFromStatistics,
  seriesFromHistory,
  seriesFromStatistics,
} from "./data";
import { feelsLikeF, dewPointF, fromFahrenheit, toFahrenheit, toMph } from "./derived";
import { graphStats, graphSvg, nearestPoint, GRAPH_W } from "./graph";
import {
  aqiMeta,
  applyPrefix,
  available,
  batteryInfo,
  beaufort,
  buildRecordBook,
  colorFromThresholds,
  convertValue,
  currentSeason,
  downsampleHistory,
  downsampleHistoryExtrema,
  entityAgeMs,
  entityState,
  esc,
  fmtNum,
  formatSunTime,
  historyLineSpark,
  iconColorVar,
  mergeThresholds,
  moonMeta,
  normalizeSectionOrder,
  num,
  parseWindDirection,
  pm25Meta,
  precipTimelineBars,
  pressureTrendMeta,
  relativeTime,
  seasonalSkinClasses,
  setNumberLocale,
  thresholdCompareValue,
  unitOf,
  uvMeta,
} from "./helpers";
import { batteryEntityIds, batteryList } from "./health";
import { hasKey, makeTranslator, type Translate } from "./i18n";
import { morph } from "./morph";
import { SECTION_RENDERERS, renderAlerts, renderChips } from "./sections";
import { CARD_STYLES } from "./styles";
import type {
  ActionConfig,
  CardConfig,
  ForecastItem,
  HassEntity,
  HistoryPoint,
  HomeAssistant,
  PrecipBar,
  RecordBook,
  SectionId,
} from "./types";
import type { GraphSeries } from "./data";
import type { Conv, RenderCtx, TileOptions, View } from "./view";
import { CARD_VERSION } from "./version";

declare global {
  interface Window {
    customCards?: Array<Record<string, unknown>>;
  }
}

type GraphRange = "24h" | "7d" | "30d";

interface GraphState {
  key: string;
  entityId: string;
  label: string;
  range: GraphRange;
  loading: boolean;
  series: GraphSeries | null;
  window: { start: number; end: number };
  unit: string;
  opener: HTMLElement | null;
  cursor: number;
}

const RANGE_MS: Record<GraphRange, number> = {
  "24h": 24 * 3600_000,
  "7d": 7 * 86400_000,
  "30d": 30 * 86400_000,
};

/** Map HA's number_format preference to a locale for the decimal separator. */
function numberLocaleFor(hass: HomeAssistant | undefined, language: string): string {
  const pref = hass?.locale?.number_format;
  if (pref === "comma_decimal" || pref === "none") return "en";
  if (pref === "decimal_comma") return "de";
  if (pref === "space_comma") return "fr";
  if (pref === "system" && typeof navigator !== "undefined") return navigator.language;
  return language;
}

class MushroomWeatherStationCard extends HTMLElement implements View {
  static VERSION = CARD_VERSION;

  private _config?: CardConfig;
  private _hass?: HomeAssistant;
  private _card: HTMLElement | null = null;
  private _dialog: HTMLDialogElement | null = null;
  private _forecastSubId: string | null = null;
  private _forecastUnsub: (() => void) | null = null;
  private _hourlyUnsub: (() => void) | null = null;
  private _forecastError: string | null = null;
  private _forecastToken = 0;
  private _renderSignature: string | null = null;
  private _configStamp = 0;
  private _staleTimer: number | null = null;
  private _prevPressure: number | null = null;
  private _pressureSample: number | null = null;
  private _historyToken = 0;
  private _historyFetchedAt = 0;
  private _historyPending = false;
  private _recordsToken = 0;
  private _recordsFetchedAt = 0;
  private _recordsPending = false;
  private _forecastPending = false;
  private _forecastReadyKey: string | null = null;
  /** When set, setup failed because the weather entity was absent; retry after `_forecastRetryAt`. */
  private _forecastAbsentKey: string | null = null;
  private _forecastRetryAt = 0;
  private _chipsExpanded = false;
  private _graph: GraphState | null = null;
  private _graphCache = new Map<string, { at: number; series: GraphSeries; window: { start: number; end: number } }>();
  private _graphToken = 0;
  private _holdTimer: number | null = null;
  /** Element whose hold action fired; only its follow-up click is swallowed. */
  private _heldEl: HTMLElement | null = null;
  private _holdEl: HTMLElement | null = null;
  /** Locale for decimal separators; restored before any deferred formatting. */
  private _numberLocale = "en";

  // View state (read by section renderers).
  forecastDays: ForecastItem[] = [];
  forecastHours: ForecastItem[] = [];
  history: Record<string, HistoryPoint[]> = {};
  precipBars: PrecipBar[] | null = null;
  /** Full temp/humidity series for comfort (before spark/display thinning). */
  comfortTemp: HistoryPoint[] = [];
  comfortHum: HistoryPoint[] = [];
  historyWindow: { start: number; end: number } | null = null;
  recordsBook: RecordBook | null = null;
  recordsSource: "statistics" | "history" | null = null;
  t: Translate = makeTranslator("en");
  locale = "en";

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

  get config(): CardConfig {
    return this._config || {};
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
      section_order: normalizeSectionOrder(config.section_order ?? DEFAULT_SECTION_ORDER),
    });
    const nextWeather = this._config.weather_entity || null;
    this._teardownForecast(true);
    this._forecastToken++;
    this._historyToken++;
    this._recordsToken++;
    // Drop cached forecasts when the weather entity changes so old readings cannot stick.
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
    this._graphToken++;
    this._configStamp++;
    this._renderSignature = null;
    void this._ensureForecastSub();
    void this._ensureHistory();
    void this._ensureRecords();
    this._render(true);
    // An open graph was loaded with the old units/entities: reload it.
    if (this._graph) {
      this._graph = { ...this._graph, loading: true, cursor: -1 };
      this._renderGraph();
      void this._loadGraph();
    }
  }

  set hass(hass: HomeAssistant) {
    this._hass = hass;
    void this._ensureForecastSub();
    void this._ensureHistory();
    void this._ensureRecords();
    this._render(false);
  }

  get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  connectedCallback(): void {
    if (this._config) this._render(true);
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
    if (this._dialog?.open) this._dialog.close();
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

  // ---------------------------------------------------------------------------
  // View helpers
  // ---------------------------------------------------------------------------

  st(key: string): HassEntity | null {
    return entityState(this._hass, this._config?.entities?.[key]);
  }

  label(key: string, fallback: string): string {
    return this._config?.labels?.[key] || fallback;
  }

  meta(m: { key: string; label: string }): string {
    return m.key && hasKey(m.key) ? this.t(m.key) : m.label;
  }

  conv(st: HassEntity | null | undefined, fallbackUnit = ""): Conv {
    const raw = num(st?.state);
    const src = this._config?.units_source?.[st?.entity_id || ""] || unitOf(st) || fallbackUnit;
    const target = this._config?.unit_system || "native";
    const out = convertValue(raw, src || fallbackUnit, target);
    return { raw, ...out, src };
  }

  unitStr(key: string, st: HassEntity | null | undefined, fallback = ""): string {
    return this._config?.units?.[key] || this.conv(st, fallback).unit || fallback;
  }

  fmt(key: string, st: HassEntity | null | undefined, digits: number, fallbackUnit = ""): string {
    const c = this.conv(st, fallbackUnit);
    if (c.value == null) return "—";
    const unit = this._config?.units?.[key] || c.unit || fallbackUnit;
    return `${fmtNum(c.value, digits)}${unit ? ` ${unit}` : ""}`.trim();
  }

  color(key: string, value: number | null, fallback = "grey", unit = ""): string {
    const compare = unit ? thresholdCompareValue(value, unit) : value;
    return colorFromThresholds(compare, mergeThresholds(this._config, key), fallback);
  }

  tile(
    key: string,
    label: string,
    st: HassEntity | null,
    value: string,
    icon: string,
    color: string,
    spark = "",
    opts: TileOptions = {},
  ): string {
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

  histSpark(key: string): string {
    if (this._config?.show_history_sparklines === false) return "";
    const pts = this.history[key];
    if (!pts?.length) return "";
    return historyLineSpark(downsampleHistory(pts));
  }

  wrapSection(id: SectionId, compact: boolean, body: string): string {
    if (!body) return "";
    const title = this.t(`section.${id}` as "section.conditions");
    const heading = compact
      ? ""
      : `<h3 class="section-label" id="sec-${id}"><span>${esc(title)}</span></h3>`;
    const labelAttr = compact ? `aria-label="${esc(title)}"` : `aria-labelledby="sec-${id}"`;
    return `<section class="section" data-section="${id}" ${labelAttr}>${heading}${body}</section>`;
  }

  historyHours(): number {
    return Math.min(48, Math.max(6, Number(this._config?.history_hours) || 24));
  }

  wantHourly(): boolean {
    if (!this._config?.weather_entity) return false;
    return this._config.show_hourly_forecast !== false;
  }

  wantPrecipTimeline(): boolean {
    return this._config?.show_precip_timeline !== false && !this._config?.hide_rain;
  }

  wantComfort(): boolean {
    return this._config?.show_comfort !== false && !this._config?.hide_comfort;
  }

  wantRecords(): boolean {
    return this._config?.show_records !== false && !this._config?.hide_records;
  }

  private _sectionVisible(hideKey: keyof CardConfig, states: Array<HassEntity | null>): boolean {
    if (this._config?.[hideKey]) return false;
    if (this._config?.show_empty) return true;
    return states.some((st) => available(st));
  }

  private _recordsDays(): number {
    return this._config?.records_period === "year" ? 365 : 30;
  }

  // ---------------------------------------------------------------------------
  // Actions & events (delegated once on the shadow root)
  // ---------------------------------------------------------------------------

  private _handleAction(actionCfg: ActionConfig | undefined, entityId: string, key = "", el?: HTMLElement): void {
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

  private _defaultTap(key: string, el: HTMLElement): ActionConfig {
    if (this._config?.tablet_mode) return { action: "none" };
    if (this._config?.graph_popup && GRAPH_KEYS.has(key) && !el.dataset.derived) {
      const st = this._hass?.states?.[el.dataset.entity || ""];
      if (st && num(st.state) != null) return { action: "graph" };
    }
    return { action: "more-info" };
  }

  private _actionsFor(key: string, el: HTMLElement) {
    const acts = this._config?.actions?.[key] || {};
    const tablet = !!this._config?.tablet_mode;
    return {
      tap: acts.tap_action || this._defaultTap(key, el),
      hold: acts.hold_action || (tablet ? { action: "more-info" } : null),
      dbl: acts.double_tap_action,
    };
  }

  private _target(ev: Event): HTMLElement | null {
    const t = ev.target as Element | null;
    return (t?.closest?.("[data-action], [data-entity], [data-key='__chips_expand']") as HTMLElement | null) || null;
  }

  private _bindEvents(root: ShadowRoot): void {
    root.addEventListener("click", (ev) => this._onClick(ev as MouseEvent));
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
      this._heldEl = null;
      this._clearHold();
      this._holdEl = el;
      this._holdTimer = window.setTimeout(() => {
        this._heldEl = el;
        this._handleAction(hold, el.dataset.entity || "", el.dataset.key, el);
      }, 500);
    });
    root.addEventListener("pointerup", () => this._clearHold());
    root.addEventListener("pointercancel", () => {
      this._clearHold();
      this._heldEl = null;
    });
    // pointerleave does not bubble; capture it, but only for the held element itself.
    root.addEventListener("pointerleave", (ev) => {
      if (ev.target === this._holdEl) this._clearHold();
    }, true);
    root.addEventListener("keydown", (ev) => this._onKeydown(ev as KeyboardEvent));
    root.addEventListener("pointermove", (ev) => this._onGraphPointer(ev as PointerEvent));
  }

  private _clearHold(): void {
    if (this._holdTimer) window.clearTimeout(this._holdTimer);
    this._holdTimer = null;
    this._holdEl = null;
  }

  private _onClick(ev: MouseEvent): void {
    // Clicks on the dialog backdrop target the <dialog> element itself.
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
    const held = this._heldEl;
    this._heldEl = null;
    // Swallow only the click that ends the hold gesture on the same element.
    if (held && held === el) return;
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

  private _onKeydown(ev: KeyboardEvent): void {
    const target = ev.target as HTMLElement | null;
    if (target?.classList.contains("graph-chart")) {
      this._onGraphKey(ev);
      return;
    }
    if (target?.classList.contains("graph-range")) {
      this._onRangeKey(ev, target);
      return;
    }
    // Native buttons already activate on Enter/Space; ARIA buttons need help.
    if ((ev.key === "Enter" || ev.key === " ") && target && target.tagName !== "BUTTON" && target.getAttribute("role") === "button") {
      ev.preventDefault();
      target.click();
    }
  }

  // ---------------------------------------------------------------------------
  // Graph popup
  // ---------------------------------------------------------------------------

  private _openGraph(key: string, entityId: string, opener: HTMLElement | null): void {
    const st = this._hass?.states?.[entityId];
    if (!st) return;
    const fallbackLabel = hasKey(`tile.${key}`) ? this.t(`tile.${key}` as "tile.temperature") : String(st.attributes.friendly_name || entityId);
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
      cursor: -1,
    };
    this._renderGraph();
    if (this._dialog && !this._dialog.open) {
      try {
        this._dialog.showModal();
      } catch {
        this._dialog.setAttribute("open", "");
      }
    }
    (this._dialog?.querySelector(".graph-range[aria-checked='true']") as HTMLElement | null)?.focus();
    void this._loadGraph();
  }

  private _onDialogAction(action: string, el: HTMLElement): void {
    if (!this._graph) return;
    if (action === "graph-close") {
      this._dialog?.close();
    } else if (action === "graph-range") {
      const range = el.dataset.range as GraphRange;
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

  /** WAI-ARIA radio group: arrows move both selection and focus. */
  private _onRangeKey(ev: KeyboardEvent, target: HTMLElement): void {
    const ranges: GraphRange[] = ["24h", "7d", "30d"];
    const i = ranges.indexOf(target.dataset.range as GraphRange);
    let next = -1;
    if (ev.key === "ArrowRight" || ev.key === "ArrowDown") next = (i + 1) % ranges.length;
    else if (ev.key === "ArrowLeft" || ev.key === "ArrowUp") next = (i - 1 + ranges.length) % ranges.length;
    else if (ev.key === "Home") next = 0;
    else if (ev.key === "End") next = ranges.length - 1;
    if (next < 0 || i < 0) return;
    ev.preventDefault();
    const btn = this._dialog?.querySelector(`.graph-range[data-range="${ranges[next]}"]`) as HTMLElement | null;
    if (!btn) return;
    this._onDialogAction("graph-range", btn);
    btn.focus();
  }

  private _onDialogClosed(): void {
    // A queued close event can arrive after the graph was reopened.
    if (this._dialog?.open) return;
    const opener = this._graph?.opener;
    this._graph = null;
    this._graphToken++;
    if (this._dialog) morph(this._dialog, "");
    // Focus returns to the tile that opened the dialog (morph keeps it alive).
    if (opener?.isConnected) opener.focus();
  }

  private async _loadGraph(): Promise<void> {
    const g = this._graph;
    if (!g || !this._hass) return;
    const token = ++this._graphToken;
    const cacheKey = `${g.entityId}|${g.range}`;
    const cached = this._graphCache.get(cacheKey);
    let series: GraphSeries | null = null;
    let window = { start: Date.now() - RANGE_MS[g.range], end: Date.now() };
    if (cached && Date.now() - cached.at < 5 * 60_000) {
      series = cached.series;
      window = cached.window;
    } else {
      const st = this._hass.states[g.entityId];
      const src = this._config?.units_source?.[g.entityId] || unitOf(st);
      const target = this._config?.unit_system || "native";
      const cv = (n: number) => convertValue(n, src, target).value ?? n;
      let failed = false;
      if (g.range !== "24h") {
        try {
          const stats = await fetchStatistics(this._hass, [g.entityId], new Date(window.start), new Date(window.end), "hour");
          const rows = stats?.[g.entityId] || [];
          if (rows.length) series = seriesFromStatistics(rows);
        } catch {
          // Statistics unavailable — fall through to recorded states.
        }
      }
      if (!series || !series.points.length) {
        try {
          const raw = await fetchHistoryRaw(this._hass, [g.entityId], new Date(window.start), new Date(window.end), false);
          const parsed = ingestHistoryRaw(raw, { [g.entityId]: "v" }).v || [];
          series = seriesFromHistory(parsed);
        } catch {
          failed = true;
          series = { source: "history", points: [] };
        }
      }
      series = {
        source: series.source,
        points: series.points.map((p) => ({
          t: p.t,
          v: p.gap ? p.v : cv(p.v),
          ...(p.gap ? { gap: true } : {}),
          ...(p.min != null ? { min: cv(p.min) } : {}),
          ...(p.max != null ? { max: cv(p.max) } : {}),
        })),
      };
      // Only cache results this load still owns, and never cache a failed request.
      if (token === this._graphToken && !failed) {
        this._graphCache.set(cacheKey, { at: Date.now(), series, window });
      }
    }
    if (token !== this._graphToken || !this._graph) return;
    this._graph = { ...this._graph, loading: false, series, window };
    this._renderGraph();
  }

  private _fmtGraphTime(t: number, range: GraphRange): string {
    const d = new Date(t);
    try {
      return range === "24h"
        ? d.toLocaleTimeString(this.locale, { hour: "numeric", minute: "2-digit" })
        : d.toLocaleString(this.locale, { weekday: "short", day: "numeric", hour: "numeric" });
    } catch {
      return d.toISOString();
    }
  }

  private _renderGraph(): void {
    const g = this._graph;
    if (!g || !this._dialog) return;
    // Another card may have rendered since; format with this card's locale.
    setNumberLocale(this._numberLocale);
    const { t } = this;
    const unit = g.unit ? ` ${g.unit}` : "";
    const val = (n: number) => `${fmtNum(n, Math.abs(n) >= 100 ? 0 : Math.abs(n) >= 10 ? 1 : 2)}${unit}`;
    const ranges: GraphRange[] = ["24h", "7d", "30d"];
    const stats = g.series ? graphStats(g.series, g.window.end) : null;
    let body: string;
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
        ${ranges
          .map((r) => `<button class="graph-range" role="radio" aria-checked="${r === g.range}" data-action="graph-range" data-range="${r}" tabindex="${r === g.range ? 0 : -1}">${esc(t(`graph.range_${r}` as "graph.range_24h"))}</button>`)
          .join("")}
      </div>
      <div class="graph-body" aria-busy="${g.loading}">${body}</div>
      <div class="graph-foot">
        <button class="graph-more" data-action="graph-more-info">${esc(t("graph.more_info"))}</button>
      </div>
    </div>`;
    morph(this._dialog, html);
    this._paintGraphCursor();
  }

  private _paintGraphCursor(): void {
    const g = this._graph;
    if (!g?.series || !this._dialog) return;
    setNumberLocale(this._numberLocale);
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
    const x = ((p.t - g.window.start) / Math.max(1, g.window.end - g.window.start)) * GRAPH_W;
    line.setAttribute("x1", x.toFixed(1));
    line.setAttribute("x2", x.toFixed(1));
    const unit = g.unit ? ` ${g.unit}` : "";
    const range = p.min != null && p.max != null && p.max !== p.min
      ? ` (${fmtNum(p.min, 1)}–${fmtNum(p.max, 1)})`
      : "";
    readout.textContent = `${this._fmtGraphTime(p.t, g.range)} · ${fmtNum(p.v, 2)}${unit}${range}`;
  }

  private _onGraphPointer(ev: PointerEvent): void {
    const g = this._graph;
    const chart = (ev.target as Element | null)?.closest?.(".graph-chart") as HTMLElement | null;
    if (!g?.series || !chart) return;
    const rect = chart.getBoundingClientRect();
    if (!rect.width) return;
    const idx = nearestPoint(g.series, g.window, (ev.clientX - rect.left) / rect.width);
    if (idx !== g.cursor) {
      g.cursor = idx;
      this._paintGraphCursor();
    }
  }

  private _onGraphKey(ev: KeyboardEvent): void {
    const g = this._graph;
    if (!g?.series?.points.length) return;
    const last = g.series.points.length - 1;
    const step = Math.max(1, Math.round(g.series.points.length / 48));
    let next = g.cursor < 0 ? last : g.cursor;
    const pts = g.series.points;
    const real = (i: number, dir: 1 | -1) => {
      while (i >= 0 && i <= last && pts[i].gap) i += dir;
      return i < 0 || i > last ? (g.cursor < 0 ? last : g.cursor) : i;
    };
    if (ev.key === "ArrowLeft") next = real(Math.max(0, next - step), -1);
    else if (ev.key === "ArrowRight") next = real(Math.min(last, next + step), 1);
    else if (ev.key === "Home") next = real(0, 1);
    else if (ev.key === "End") next = real(last, -1);
    else return;
    ev.preventDefault();
    g.cursor = next;
    this._paintGraphCursor();
  }

  // ---------------------------------------------------------------------------
  // Data: pressure trend, forecast, history, records
  // ---------------------------------------------------------------------------

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
    // Station health classifies quiet sensors by time, so it needs ticks too.
    const healthNeedsTicks = !this._config?.hide_health && Number(this._config?.stale_minutes ?? 30) > 0;
    if (this._config?.show_updated === false && !healthNeedsTicks) {
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

  private async _ensureForecastSub(): Promise<void> {
    const wantDaily = !!this._config?.show_forecast;
    const wantHourly = this.wantHourly();
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
                this.forecastHours = ev?.forecast || [];
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
        // Latch ready for live unsubs, cached data, or a present entity (incl. empty unsupported types).
        if (
          present
          || this._forecastUnsub
          || this._hourlyUnsub
          || this.forecastDays.length
          || this.forecastHours.length
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

  private async _ensureHistory(): Promise<void> {
    if (!this._hass || !this._config) return;
    const needSparks = this._config.show_history_sparklines !== false;
    const needRose = this._config.show_wind_rose !== false;
    const needPrecip = this.wantPrecipTimeline();
    const needComfort = this.wantComfort();
    if (!needSparks && !needRose && !needPrecip && !needComfort) return;
    // Honor cache even for empty results; skip while a request is in flight.
    if (this._historyPending) return;
    if (this._historyFetchedAt && Date.now() - this._historyFetchedAt < 5 * 60 * 1000) return;

    const hours = this.historyHours();
    const end = new Date();
    const start = new Date(end.getTime() - hours * 3600 * 1000);
    const keyById: Record<string, string> = {};
    const addKey = (key: string) => {
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
    // No mapped entities — do not latch pending.
    if (!unique.length) return;

    this._historyPending = true;
    const token = ++this._historyToken;
    try {
      const raw = await fetchHistoryRaw(this._hass, unique, start, end, false);
      if (raw == null || token !== this._historyToken) return;

      const next = ingestHistoryRaw(raw, keyById);
      // Insights from the full series before any display thinning/cap.
      this.precipBars = needPrecip && next.rain_rate?.length
        ? precipTimelineBars(next.rain_rate, hours, Math.min(36, Math.max(12, hours)))
        : null;
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
      /* history optional — still mark attempt so we don't hammer the API */
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
  private async _ensureRecords(): Promise<void> {
    if (!this._hass || !this._config || !this.wantRecords()) return;
    if (this._recordsPending) return;
    if (this._recordsFetchedAt && Date.now() - this._recordsFetchedAt < 15 * 60 * 1000) return;

    const keyById: Record<string, string> = {};
    for (const key of ["temperature", "wind_gust", "rain_rate", "rain_today"]) {
      const id = this._config.entities?.[key];
      if (id && this._hass.states[id]) keyById[id] = key;
    }
    const ids = Object.keys(keyById);
    if (!ids.length) return;

    this._recordsPending = true;
    const token = ++this._recordsToken;
    const end = new Date();
    const days = this._recordsDays();
    const start = new Date(end.getTime() - days * 86400000);
    const period: StatPeriod = days > 60 ? "day" : "hour";
    try {
      let stats: Record<string, StatRow[]> | null = null;
      try {
        stats = await fetchStatistics(this._hass, ids, start, end, period);
      } catch {
        stats = null;
      }
      if (token !== this._recordsToken) return;
      const statsByKey: Record<string, StatRow[]> = {};
      const missing: string[] = [];
      for (const id of ids) {
        const rows = stats?.[id] || [];
        if (rows.length) statsByKey[keyById[id]] = rows;
        else missing.push(id);
      }

      const recent: Record<string, HistoryPoint[]> = {};
      // Sensors without statistics: raw history for the whole window (purge-limited).
      // Each raw-history call may fail on its own; keep whatever did load.
      const loadRaw = async (list: string[], from: Date, sigOnly: boolean) => {
        try {
          const raw = await fetchHistoryRaw(this._hass, list, from, end, sigOnly);
          if (token === this._recordsToken) Object.assign(recent, ingestHistoryRaw(raw, keyById));
        } catch {
          /* leave these sensors to statistics / live state */
        }
      };
      if (missing.length) await loadRaw(missing, start, true);
      if (token !== this._recordsToken) return;
      // Sensors with statistics: raw history since the last compiled hour.
      const withStats = ids.filter((id) => !missing.includes(id));
      if (withStats.length) await loadRaw(withStats, new Date(end.getTime() - 2 * 3600_000), false);
      if (token !== this._recordsToken) return;
      // The live state counts too.
      for (const id of ids) {
        const n = num(this._hass.states[id]?.state);
        if (n == null) continue;
        const key = keyById[id];
        (recent[key] ||= []).push({ state: n, last_changed: Date.now() });
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

  private _watchedSignature(): string {
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
    // Watch exactly the batteries Station health renders.
    if (!c.hide_health && this._hass) {
      for (const id of batteryEntityIds(this._hass, c.prefix, batteryList(c.battery_entities))) {
        const st = this._hass.states[id];
        parts.push(`${id}:${st?.state}:${st?.last_updated || ""}`);
      }
    }
    parts.push(
      `cfg:${this._configStamp}|lang:${this._hass?.locale?.language}|chips:${this._chipsExpanded}|hist:${this._historyFetchedAt}|rec:${this._recordsFetchedAt}`,
      `fc:${this.forecastDays.length}:${this.forecastHours.length}:${this._forecastError || ""}`,
    );
    return parts.join("|");
  }

  private _ensureShell(): void {
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
  private _derivedEntity(base: HassEntity, valueF: number, srcUnit: string): HassEntity {
    const value = fromFahrenheit(valueF, srcUnit || "°F");
    return {
      ...base,
      state: value.toFixed(2),
      attributes: { ...base.attributes, unit_of_measurement: srcUnit || "°F" },
    };
  }

  private _render(force = false): void {
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
    this._numberLocale = numberLocaleFor(hass, language);
    setNumberLocale(this._numberLocale);
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
    const soilStates: HassEntity[] = [];
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

    // Derived feels-like / dew point when the station has no such sensor.
    let feelsDerived = false;
    let dewDerived = false;
    if (this._config.derive_missing !== false && temp && available(temp)) {
      const tSrc = this.conv(temp, "°F").src || "°F";
      const tF = toFahrenheit(num(temp.state) as number, tSrc);
      const rh = num(humidity?.state);
      const mph = wind && num(wind.state) != null ? toMph(num(wind.state) as number, this.conv(wind, "mph").src || "mph") : null;
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
      (sun?.attributes?.next_rising as string) || (sun?.attributes?.rising as string),
      language,
    );
    const sunset = formatSunTime(
      (sun?.attributes?.next_setting as string) || (sun?.attributes?.setting as string),
      language,
    );

    const ageMs = entityAgeMs(temp) ?? entityAgeMs(pressure) ?? entityAgeMs(wind);
    const staleLimit = Number(this._config.stale_minutes);
    const staleMinutes = Number.isFinite(staleLimit) ? staleLimit : 30;
    const isStale = ageMs != null && staleMinutes > 0 && ageMs > staleMinutes * 60000;
    const updatedLabel = ageMs == null ? null : relativeTime(new Date(Date.now() - ageMs), language);

    const heroIcon = raining
      ? (rr.raw ?? 0) >= 0.3
        ? "mdi:weather-pouring"
        : "mdi:weather-rainy"
      : uvn != null && uvn >= 6
        ? "mdi:weather-sunny"
        : uvn != null && uvn >= 1
          ? "mdi:weather-partly-cloudy"
          : "mdi:weather-night";

    const ctx: RenderCtx = {
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
      temp, feels, feelsDerived, humidity, dew, dewDerived, high, low,
      wind, gust, maxGust, wdir,
      rate, today, event, week, month, year, lastRain,
      uv, irr, lux,
      pressure, pressureAbs, indoorT, indoorH, co2, pm25, aqi, voc, noise,
      lightningCount, lightningDistance, lightningTime, signal,
      battery, batt: batteryInfo(battery, this._config.battery_warning_threshold), sun, moon,
      sunrise: sunrise !== "—" ? sunrise : "",
      sunset: sunset !== "—" ? sunset : "",
      moonMeta: moonMeta(moon?.state),
      t: tc, f, hi, lo, h, d, ws, wg, deg: windDir.deg, card: windDir.card, rr, uvn, raining, tColor,
      uvm, pm, pmm, aqiVal, aqim, trend, bf,
      tempUnit: this.unitStr("temperature", temp, tc.unit || "°"),
    };

    const showBody = layout !== "chips";
    const showExtra = layout === "full" || compact;
    const missing = !temp && !this._config.entities?.temperature;
    const showUpdated = this._config.show_updated !== false;

    const subtitleBits: string[] = [];
    subtitleBits.push(raining
      ? t("header.raining", { rate: `${fmtNum(rr.value, 2)} ${this.unitStr("rain_rate", rate, rr.unit || "in/h")}` })
      : t("header.live"));
    if (hi.value != null || lo.value != null) {
      subtitleBits.push(t("header.hilo", {
        hi: hi.value == null ? "—" : Math.round(hi.value),
        lo: lo.value == null ? "—" : Math.round(lo.value),
      }));
    }

    const order = normalizeSectionOrder(this._config.section_order);
    const sectionsHtml = showExtra
      ? order.map((sid) => SECTION_RENDERERS[sid](this, ctx)).join("")
      : "";

    const weatherSt = entityState(hass, this._config.weather_entity);
    const skinOn = this._config.seasonal_skins !== false;
    const season = currentSeason(new Date(), this._config.hemisphere === "south" ? "south" : "north");
    const skinClass = skinOn ? seasonalSkinClasses(season, weatherSt?.state || (raining ? "rainy" : null)) : "";
    const layoutClass = compact ? "compact" : layout === "chips" ? "chips-layout" : layout;

    const heroSecondary = [
      f.value != null ? t("header.feels", { v: Math.round(f.value) }) : "",
      h != null ? t("header.rh", { v: Math.round(h) }) : "",
    ].filter(Boolean).join(" · ");
    const heroValue = tc.value == null ? "—" : `${Math.round(tc.value)}°`;
    const setupHint = esc(t("hint.setup"))
      .replace("{prefix}", "<code>prefix</code>")
      .replace("{example}", "<code>ws</code>");

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

    const card = this._card!;
    const cls = `${layoutClass}${isStale ? " stale" : ""}${skinClass ? ` ${skinClass}` : ""}`;
    if (card.className !== cls) card.className = cls;
    card.setAttribute("lang", language);
    morph(card, inner);
    if (this._graph) this._renderGraph();
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
  "color:#1b4d3e;background:#e8f5e9;font-weight:bold;padding:2px 6px;",
);
