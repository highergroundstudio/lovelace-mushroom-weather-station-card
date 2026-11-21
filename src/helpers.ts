import {
  ALERT_SEVERITY_COLOR,
  CARDINALS,
  COLOR_VARS,
  DEFAULT_COMFORT,
  DEFAULT_SECTION_ORDER,
  DEFAULT_THRESHOLDS,
  MOON_ICONS,
  PREFIX_MAP,
  WIND_ROSE_LABELS,
} from "./const";
import type {
  CardConfig,
  ComfortStats,
  HassEntity,
  Hemisphere,
  HistoryExtreme,
  HistoryPoint,
  HomeAssistant,
  PrecipBar,
  RecordBook,
  Season,
  SectionId,
  ThresholdRule,
  UnitSystem,
  WeatherAlert,
  WindRoseBin,
} from "./types";

export function degToCardinal(deg: number): string | null {
  const n = Number(deg);
  if (!Number.isFinite(n)) return null;
  return CARDINALS[Math.round((((n % 360) + 360) % 360) / 22.5) % 16];
}

export function cardinalToDeg(cardinal: string): number | null {
  if (!cardinal) return null;
  const key = String(cardinal).trim().toUpperCase();
  const idx = (CARDINALS as readonly string[]).indexOf(key);
  return idx >= 0 ? idx * 22.5 : null;
}

export function num(state: unknown): number | null {
  if (state == null || state === "unknown" || state === "unavailable" || state === "") return null;
  const n = parseFloat(String(state));
  return Number.isFinite(n) ? n : null;
}

export function available(st: HassEntity | null | undefined): boolean {
  return !!(st && st.state !== "unavailable" && st.state !== "unknown");
}

export function parseWindDirection(st: HassEntity | null | undefined): { deg: number | null; card: string | null } {
  if (!st || !available(st)) return { deg: null, card: null };
  const raw = st.state;
  const asNum = num(raw);
  if (asNum != null) return { deg: asNum, card: degToCardinal(asNum) };
  const card = String(raw || "").trim().toUpperCase();
  if ((CARDINALS as readonly string[]).includes(card)) return { deg: cardinalToDeg(card), card };
  return { deg: null, card: null };
}

export function fmtNum(n: number | null | undefined, digits = 1): string {
  if (n == null) return "—";
  return Number(n).toFixed(digits).replace(/\.0$/, "");
}

export function colorFromThresholds(value: number | null, rules: ThresholdRule[] | undefined, fallback = "grey"): string {
  if (value == null || !rules || !rules.length) return fallback;
  const aboves = rules.filter((r) => r && r.above != null && r.color).slice().sort((a, b) => Number(b.above) - Number(a.above));
  for (const rule of aboves) if (value >= Number(rule.above)) return rule.color;
  const belows = rules.filter((r) => r && r.below != null && r.color).slice().sort((a, b) => Number(a.below) - Number(b.below));
  for (const rule of belows) if (value <= Number(rule.below)) return rule.color;
  return fallback;
}

export function iconColorVar(colorName: string | undefined): string {
  if (!colorName) return COLOR_VARS.grey;
  if (String(colorName).startsWith("#") || String(colorName).startsWith("var(")) return colorName;
  return COLOR_VARS[colorName] || colorName;
}

export function uvMeta(uv: number | null, color?: string): { label: string; color: string } {
  if (uv == null) return { label: "—", color: color || "grey" };
  if (uv >= 11) return { label: "Extreme", color: color || "purple" };
  if (uv >= 8) return { label: "Very high", color: color || "purple" };
  if (uv >= 6) return { label: "High", color: color || "orange" };
  if (uv >= 3) return { label: "Moderate", color: color || "amber" };
  return { label: "Low", color: color || "green" };
}

export function pm25Meta(value: number | null, color?: string): { label: string; color: string } {
  if (value == null) return { label: "PM2.5", color: color || "grey" };
  if (value >= 55) return { label: "Unhealthy", color: color || "red" };
  if (value >= 35) return { label: "Sensitive", color: color || "orange" };
  if (value >= 12) return { label: "Moderate", color: color || "amber" };
  return { label: "Good", color: color || "green" };
}

export function beaufort(mph: number | null | undefined): number | null {
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

export function applyPrefix(config: CardConfig, previousPrefix?: string): CardConfig {
  const prefix = (config.prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  const prev = (previousPrefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  const entities = { ...(config.entities || {}) };

  // Clearing the prefix: drop only IDs that exactly match the previous template
  // so a later prefix can fill empty slots without leaving stale station IDs.
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
    // Only rewrite IDs that exactly match the previous prefix template.
    // Do not pattern-match arbitrary overrides like sensor.outdoor_temperature.
    if (prev) {
      const oldDerived = template.replace("{p}", prev);
      if (current === oldDerived) entities[key] = derived;
    }
  }
  return { ...config, entities };
}

export function entityState(hass: HomeAssistant | undefined, entityId: string | undefined): HassEntity | null {
  if (!hass || !entityId) return null;
  return hass.states[entityId] || null;
}

export function unitOf(st: HassEntity | null | undefined): string {
  return st?.attributes?.unit_of_measurement || "";
}

export function relativeTime(date: Date, locale?: string): string {
  const diffMs = date.getTime() - Date.now();
  const diffSec = Math.round(diffMs / 1000);
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

export function formatLastRain(st: HassEntity | null | undefined, hass?: HomeAssistant): string {
  const raw = st?.state;
  if (!raw || raw === "unknown" || raw === "unavailable") return "—";
  const date = new Date(raw);
  if (Number.isNaN(date.getTime())) return String(raw);
  const locale = hass?.locale?.language || undefined;
  try {
    return relativeTime(date, locale);
  } catch {
    return date.toLocaleString();
  }
}

export function entityAgeMs(st: HassEntity | null | undefined): number | null {
  if (!st) return null;
  const raw = st.last_updated || st.last_changed;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? Date.now() - t : null;
}

export function batteryInfo(st: HassEntity | null | undefined, threshold: number | string | undefined): {
  low: boolean;
  text: string;
  icon: string;
} | null {
  if (!st) return null;
  const n = num(st.state);
  if (n != null) {
    const limit = threshold == null || threshold === "" ? 20 : Number(threshold);
    const low = Number.isFinite(limit) && n <= limit;
    const pct = `${Math.round(n)}%`;
    return {
      low,
      text: low ? `Low Battery · ${pct}` : `Station battery ${pct}`,
      icon: low ? "mdi:battery-alert" : "mdi:battery",
    };
  }
  const low = st.state === "on";
  return { low, text: low ? "Low Battery" : "Station battery OK", icon: low ? "mdi:battery-alert" : "mdi:battery" };
}

export function mergeThresholds(config: CardConfig | undefined, key: string): ThresholdRule[] {
  const extra = config?.thresholds?.[key];
  const base = DEFAULT_THRESHOLDS[key] || [];
  if (!extra || !extra.length) return base;
  // User rules replace defaults that share the same color + direction (above/below).
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

function unitKind(unit: string): string | null {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "c"].includes(u)) return "temp";
  if (["mph", "km/h", "kmh", "kph", "m/s", "m/sec"].includes(u)) return "speed";
  if (["in", "mm", "in/h", "in/hr", "mm/h", "mm/hr"].includes(u)) return u.includes("/") ? "rate" : "rain";
  if (["inhg", "hpa", "mbar", "mb"].includes(u)) return "pressure";
  return null;
}

function sourceSystem(unit: string): "imperial" | "metric" | null {
  const u = String(unit || "").toLowerCase().replace("°", "");
  if (["f", "mph", "in", "in/h", "in/hr", "inhg"].includes(u)) return "imperial";
  if (["c", "km/h", "kmh", "kph", "m/s", "m/sec", "mm", "mm/h", "mm/hr", "hpa", "mbar", "mb"].includes(u)) return "metric";
  return null;
}

export function convertValue(
  value: number | null,
  unit: string,
  target: string | undefined,
): { value: number | null; unit: string } {
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

export function pressureTrendMeta(
  current: number | null,
  previous: number | null | undefined,
): { label: string; icon: string; color: string } {
  if (current == null || previous == null) return { label: "", icon: "mdi:minus", color: "grey" };
  const delta = current - previous;
  if (Math.abs(delta) < 0.02) return { label: "Steady", icon: "mdi:arrow-right", color: "grey" };
  if (delta > 0) return { label: "Rising", icon: "mdi:arrow-top-right", color: "green" };
  return { label: "Falling", icon: "mdi:arrow-bottom-right", color: "orange" };
}

export function normalizeSectionOrder(order: unknown): SectionId[] {
  const known = new Set(DEFAULT_SECTION_ORDER);
  const seen = new Set<SectionId>();
  const out: SectionId[] = [];
  if (Array.isArray(order)) {
    for (const item of order) {
      if (typeof item === "string" && known.has(item as SectionId) && !seen.has(item as SectionId)) {
        out.push(item as SectionId);
        seen.add(item as SectionId);
      }
    }
  }
  for (const id of DEFAULT_SECTION_ORDER) {
    if (!seen.has(id)) out.push(id);
  }
  return out;
}

export function moveSection(order: SectionId[], index: number, direction: -1 | 1): SectionId[] {
  const next = [...order];
  const target = index + direction;
  if (index < 0 || target < 0 || index >= next.length || target >= next.length) return next;
  const tmp = next[index];
  next[index] = next[target];
  next[target] = tmp;
  return next;
}

export function esc(s: unknown): string {
  return String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/"/g, "&quot;");
}

/** Convert a sensor reading into the unit system used by DEFAULT_THRESHOLDS (°F / mph). */
export function thresholdCompareValue(raw: number | null, unit: string): number | null {
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

export function moveSectionTo(order: SectionId[], from: number, to: number): SectionId[] {
  if (from === to || from < 0 || to < 0 || from >= order.length || to >= order.length) return [...order];
  const next = [...order];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export function aqiMeta(value: number | null, color?: string): { label: string; color: string } {
  if (value == null) return { label: "AQI", color: color || "grey" };
  if (value >= 150) return { label: "Unhealthy", color: color || "red" };
  if (value >= 100) return { label: "Sensitive", color: color || "orange" };
  if (value >= 50) return { label: "Moderate", color: color || "amber" };
  return { label: "Good", color: color || "green" };
}

export function moonMeta(state: string | undefined): { label: string; icon: string } {
  const raw = String(state || "").trim().toLowerCase().replace(/\s+/g, "_");
  const icon = MOON_ICONS[raw] || "mdi:moon-waning-crescent";
  const label = raw
    ? raw.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())
    : "Moon";
  return { label, icon };
}

export function daysSinceTimestamp(raw: string | undefined): number | null {
  if (!raw || raw === "unknown" || raw === "unavailable") return null;
  const t = new Date(raw).getTime();
  if (!Number.isFinite(t)) return null;
  return Math.max(0, (Date.now() - t) / 86400000);
}

export function rainMonthProgress(monthValue: number | null, normal: number | null): {
  pct: number | null;
  label: string;
} {
  if (monthValue == null || normal == null || normal <= 0) return { pct: null, label: "" };
  const pct = Math.min(999, Math.round((monthValue / normal) * 100));
  return { pct, label: `${pct}% of normal` };
}

export function alertSeverityColor(severity: string | undefined): string {
  const key = String(severity || "unknown").toLowerCase();
  return ALERT_SEVERITY_COLOR[key] || ALERT_SEVERITY_COLOR.unknown;
}

export function collectAlerts(
  weather: HassEntity | null | undefined,
  alertEntity: HassEntity | null | undefined,
): WeatherAlert[] {
  const out: WeatherAlert[] = [];
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
        sender: String(attrs.attribution || attrs.sender || ""),
      });
    }
  }
  return out;
}

export function historyLineSpark(points: HistoryPoint[], width = 64, height = 22): string {
  if (!points.length) return "";
  const vals = points.map((p) => p.state).filter((v) => Number.isFinite(v));
  if (!vals.length) return "";
  const min = Math.min(...vals);
  const max = Math.max(...vals);
  const span = Math.max(0.01, max - min);
  const step = points.length === 1 ? width : width / (points.length - 1);
  const coords = points
    .map((p, i) => {
      const x = i * step;
      const y = height - ((p.state - min) / span) * (height - 2) - 1;
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return `<svg class="hist-spark" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}" aria-hidden="true"><polyline fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" points="${coords}"/></svg>`;
}

export function windRoseBins(degrees: number[]): WindRoseBin[] {
  const counts = new Array(WIND_ROSE_LABELS.length).fill(0) as number[];
  for (const deg of degrees) {
    if (!Number.isFinite(deg)) continue;
    const idx = Math.round((((deg % 360) + 360) % 360) / 45) % WIND_ROSE_LABELS.length;
    counts[idx]++;
  }
  const total = counts.reduce((a, b) => a + b, 0) || 1;
  return WIND_ROSE_LABELS.map((label, i) => ({
    label,
    deg: i * 45,
    count: counts[i],
    share: counts[i] / total,
  }));
}

export function windRoseSvg(bins: WindRoseBin[], size = 96): string {
  const cx = size / 2;
  const cy = size / 2;
  const maxR = size * 0.4;
  const maxShare = Math.max(...bins.map((b) => b.share), 0.01);
  const petals = bins
    .filter((b) => b.count > 0)
    .map((b) => {
      const r = Math.max(10, (b.share / maxShare) * maxR);
      const rad = ((b.deg - 90) * Math.PI) / 180;
      const x = cx + Math.cos(rad) * r;
      const y = cy + Math.sin(rad) * r;
      const opacity = 0.45 + (b.share / maxShare) * 0.55;
      return `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="currentColor" stroke-width="7" stroke-linecap="round" opacity="${opacity.toFixed(2)}"/>`;
    })
    .join("");
  return `<svg class="wind-rose-svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" aria-hidden="true">
    <circle cx="${cx}" cy="${cy}" r="${maxR}" fill="none" stroke="currentColor" stroke-opacity="0.16"/>
    <circle cx="${cx}" cy="${cy}" r="${maxR * 0.5}" fill="none" stroke="currentColor" stroke-opacity="0.1"/>
    ${petals}
    <circle cx="${cx}" cy="${cy}" r="2.5" fill="currentColor"/>
    <text x="${cx}" y="12" text-anchor="middle" font-size="9" fill="currentColor">N</text>
  </svg>`;
}

/** Threshold editor helpers — defaults are stored as imperial (°F / mph). */
export function thresholdEditorUnit(kind: "temp" | "speed", system: UnitSystem | undefined): string {
  if (system === "metric") return kind === "temp" ? "°C" : "km/h";
  return kind === "temp" ? "°F" : "mph";
}

export function displayThresholdValue(
  value: number,
  kind: "temp" | "speed",
  system: UnitSystem | undefined,
): number {
  if (system !== "metric") return value;
  return kind === "temp" ? (value - 32) * (5 / 9) : value * 1.60934;
}

export function storeThresholdValue(
  value: number,
  kind: "temp" | "speed",
  system: UnitSystem | undefined,
): number {
  if (system !== "metric") return value;
  return kind === "temp" ? value * (9 / 5) + 32 : value / 1.60934;
}

export function formatSunTime(iso: string | undefined, locale?: string): string {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  try {
    return d.toLocaleTimeString(locale, { hour: "numeric", minute: "2-digit" });
  } catch {
    return d.toLocaleTimeString();
  }
}

export function downsampleHistory(points: HistoryPoint[], maxPoints = 36): HistoryPoint[] {
  if (points.length <= maxPoints) return points;
  const out: HistoryPoint[] = [];
  const step = (points.length - 1) / (maxPoints - 1);
  for (let i = 0; i < maxPoints; i++) {
    out.push(points[Math.round(i * step)]);
  }
  return out;
}

/** Keep the max (or min) sample in each bucket so peaks survive thinning. */
export function downsampleHistoryExtrema(
  points: HistoryPoint[],
  maxPoints = 72,
  mode: "max" | "min" = "max",
): HistoryPoint[] {
  if (points.length <= maxPoints) return points;
  const out: HistoryPoint[] = [];
  const bucket = points.length / maxPoints;
  for (let i = 0; i < maxPoints; i++) {
    const start = Math.floor(i * bucket);
    const end = Math.max(start + 1, Math.floor((i + 1) * bucket));
    let best = points[start];
    for (let j = start + 1; j < end && j < points.length; j++) {
      if (mode === "max" ? points[j].state > best.state : points[j].state < best.state) {
        best = points[j];
      }
    }
    out.push(best);
  }
  return out;
}

export function historyExtreme(
  points: HistoryPoint[],
  mode: "min" | "max",
): HistoryExtreme | null {
  if (!points.length) return null;
  let best = points[0];
  for (const p of points) {
    if (mode === "max" ? p.state > best.state : p.state < best.state) best = p;
  }
  return { value: best.state, at: best.last_changed };
}

export function buildRecordBook(history: Record<string, HistoryPoint[]>): RecordBook {
  return {
    hottest: historyExtreme(history.temperature || [], "max"),
    coldest: historyExtreme(history.temperature || [], "min"),
    peakGust: historyExtreme(history.wind_gust || [], "max"),
    peakRainRate: historyExtreme(history.rain_rate || [], "max"),
    wettestDay: historyExtreme(history.rain_today || [], "max"),
  };
}

function sameLocalDay(a: number, b = Date.now()): boolean {
  const da = new Date(a);
  const db = new Date(b);
  return (
    da.getFullYear() === db.getFullYear()
    && da.getMonth() === db.getMonth()
    && da.getDate() === db.getDate()
  );
}

/** True only when the extreme itself was recorded today (local calendar day). */
export function isRecordSetToday(record: HistoryExtreme | null, now = Date.now()): boolean {
  return !!record && Number.isFinite(record.at) && sameLocalDay(record.at, now);
}

export function precipTimelineBars(points: HistoryPoint[], hours: number, buckets = 24): PrecipBar[] {
  const end = Date.now();
  const start = end - hours * 3600 * 1000;
  const span = Math.max(1, end - start);
  const width = Math.min(48, Math.max(8, buckets));
  const bars: PrecipBar[] = Array.from({ length: width }, (_, i) => {
    const t0 = start + (i / width) * span;
    const when = new Date(t0 + span / width / 2);
    let label = "";
    try {
      label = when.toLocaleTimeString(undefined, { hour: "numeric" });
    } catch {
      label = `${when.getHours()}`;
    }
    return { label, value: 0, start: t0 };
  });

  // Minimal/significant history only records transitions. Apply each rate from its
  // change until the next change (clipped to the window) so sustained rain fills
  // every overlapping bucket; zero-rate intervals stay dry.
  const sorted = [...points]
    .filter((p) => Number.isFinite(p.state))
    .sort((a, b) => a.last_changed - b.last_changed);
  if (!sorted.length) return bars;

  let carryIdx = -1;
  for (let i = 0; i < sorted.length; i++) {
    if (sorted[i].last_changed <= start) carryIdx = i;
    else break;
  }

  const paint = (t0: number, t1: number, rate: number) => {
    if (!(rate > 0) || !(t1 > t0)) return;
    const i0 = Math.max(0, Math.floor(((t0 - start) / span) * width));
    const i1 = Math.min(width - 1, Math.floor(((Math.min(t1, end) - 1 - start) / span) * width));
    for (let i = i0; i <= i1; i++) bars[i].value = Math.max(bars[i].value, rate);
  };

  if (carryIdx >= 0) {
    const t1 = carryIdx + 1 < sorted.length ? sorted[carryIdx + 1].last_changed : end;
    paint(start, Math.min(end, t1), sorted[carryIdx].state);
  }
  for (let i = Math.max(0, carryIdx + 1); i < sorted.length; i++) {
    const t0 = Math.max(start, sorted[i].last_changed);
    if (t0 >= end) break;
    const t1 = i + 1 < sorted.length ? Math.min(end, sorted[i + 1].last_changed) : end;
    paint(t0, t1, sorted[i].state);
  }
  return bars;
}

export function precipTimelineSvg(bars: PrecipBar[], width = 280, height = 44): string {
  if (!bars.length) return "";
  const max = Math.max(...bars.map((b) => b.value), 0.01);
  const gap = 2;
  const barW = Math.max(2, (width - gap * (bars.length - 1)) / bars.length);
  const rects = bars
    .map((b, i) => {
      const h = Math.max(b.value > 0 ? 3 : 1, (b.value / max) * (height - 8));
      const x = i * (barW + gap);
      const y = height - h;
      const opacity = b.value > 0 ? 0.55 + (b.value / max) * 0.45 : 0.18;
      return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW.toFixed(1)}" height="${h.toFixed(1)}" rx="1.5" fill="currentColor" opacity="${opacity.toFixed(2)}"/>`;
    })
    .join("");
  return `<svg class="precip-timeline-svg" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="none" aria-hidden="true">${rects}</svg>`;
}

/**
 * Humidity valid at `at`: last sample at or before that time.
 * HA minimal history omits unchanged duplicates, so a reading hours earlier is
 * still the live value — do not require proximity or pick a future change.
 */
function humidityAt(at: number, humidityAsc: HistoryPoint[]): number | null {
  if (!humidityAsc.length) return null;
  let best: HistoryPoint | null = null;
  for (const p of humidityAsc) {
    if (p.last_changed <= at) best = p;
    else break;
  }
  return best ? best.state : null;
}

export function comfortBandFromConfig(config: CardConfig | undefined): {
  tempMin: number;
  tempMax: number;
  humidityMin: number;
  humidityMax: number;
} {
  const tempMin = num(config?.comfort_temp_min);
  const tempMax = num(config?.comfort_temp_max);
  const humidityMin = num(config?.comfort_humidity_min);
  const humidityMax = num(config?.comfort_humidity_max);
  return {
    tempMin: tempMin ?? DEFAULT_COMFORT.tempMin,
    tempMax: tempMax ?? DEFAULT_COMFORT.tempMax,
    humidityMin: humidityMin ?? DEFAULT_COMFORT.humidityMin,
    humidityMax: humidityMax ?? DEFAULT_COMFORT.humidityMax,
  };
}

export function comfortStats(
  tempPoints: HistoryPoint[],
  humidityPoints: HistoryPoint[],
  band: { tempMin: number; tempMax: number; humidityMin: number; humidityMax: number },
): ComfortStats {
  const samples: Array<{ temp: number; humidity: number }> = [];
  let hoursIn = 0;
  let hoursTotal = 0;
  const humidityAsc = [...humidityPoints].sort((a, b) => a.last_changed - b.last_changed);
  // Approximate dwell time from consecutive samples (capped at 30 minutes each).
  for (let i = 0; i < tempPoints.length; i++) {
    const t = tempPoints[i];
    const h = humidityAt(t.last_changed, humidityAsc);
    if (h == null) continue;
    samples.push({ temp: t.state, humidity: h });
    const next = tempPoints[i + 1];
    const dtHr = next
      ? Math.min(0.5, Math.max(0, (next.last_changed - t.last_changed) / 3600000))
      : 0.25;
    hoursTotal += dtHr;
    const ok =
      t.state >= band.tempMin
      && t.state <= band.tempMax
      && h >= band.humidityMin
      && h <= band.humidityMax;
    if (ok) hoursIn += dtHr;
  }
  const pct = hoursTotal > 0 ? Math.round((hoursIn / hoursTotal) * 100) : null;
  return { hoursIn, hoursTotal, pct, samples };
}

export function comfortScatterSvg(
  samples: Array<{ temp: number; humidity: number }>,
  band: { tempMin: number; tempMax: number; humidityMin: number; humidityMax: number },
  width = 220,
  height = 96,
): string {
  if (!samples.length) return "";
  const temps = samples.map((s) => s.temp);
  const hums = samples.map((s) => s.humidity);
  const minT = Math.min(...temps, band.tempMin) - 2;
  const maxT = Math.max(...temps, band.tempMax) + 2;
  const minH = Math.min(...hums, band.humidityMin) - 5;
  const maxH = Math.max(...hums, band.humidityMax) + 5;
  const pad = 8;
  const x = (t: number) => pad + ((t - minT) / Math.max(0.01, maxT - minT)) * (width - pad * 2);
  const y = (h: number) => height - pad - ((h - minH) / Math.max(0.01, maxH - minH)) * (height - pad * 2);
  const zoneX = x(band.tempMin);
  const zoneY = y(band.humidityMax);
  const zoneW = Math.max(4, x(band.tempMax) - zoneX);
  const zoneH = Math.max(4, y(band.humidityMin) - zoneY);
  const dots = samples
    .slice(-80)
    .map((s) => {
      const inBand =
        s.temp >= band.tempMin
        && s.temp <= band.tempMax
        && s.humidity >= band.humidityMin
        && s.humidity <= band.humidityMax;
      return `<circle cx="${x(s.temp).toFixed(1)}" cy="${y(s.humidity).toFixed(1)}" r="2.2" fill="currentColor" opacity="${inBand ? 0.9 : 0.35}"/>`;
    })
    .join("");
  return `<svg class="comfort-scatter" viewBox="0 0 ${width} ${height}" width="100%" height="${height}" aria-hidden="true">
    <rect x="${zoneX.toFixed(1)}" y="${zoneY.toFixed(1)}" width="${zoneW.toFixed(1)}" height="${zoneH.toFixed(1)}" fill="currentColor" opacity="0.12" rx="4"/>
    ${dots}
  </svg>`;
}

/** Meteorological seasons (Mar–May spring in the northern hemisphere). */
export function currentSeason(date = new Date(), hemisphere: Hemisphere = "north"): Season {
  const m = date.getMonth();
  let season: Season;
  if (m >= 2 && m <= 4) season = "spring";
  else if (m >= 5 && m <= 7) season = "summer";
  else if (m >= 8 && m <= 10) season = "autumn";
  else season = "winter";
  if (hemisphere === "south") {
    const flip: Record<Season, Season> = {
      spring: "autumn",
      summer: "winter",
      autumn: "spring",
      winter: "summer",
    };
    return flip[season];
  }
  return season;
}

export function seasonalSkinClasses(
  season: Season,
  condition?: string | null,
): string {
  const cond = String(condition || "").toLowerCase();
  let condClass = "";
  if (cond.includes("snow")) condClass = "cond-snow";
  else if (cond.includes("lightning") || cond.includes("thunder")) condClass = "cond-storm";
  else if (cond.includes("rain") || cond.includes("pour") || cond.includes("hail")) condClass = "cond-rain";
  else if (cond === "sunny" || cond === "clear-night" || cond.includes("clear")) condClass = "cond-clear";
  else if (cond.includes("cloud") || cond.includes("fog")) condClass = "cond-cloud";
  return `skin-${season}${condClass ? ` ${condClass}` : ""}`;
}
