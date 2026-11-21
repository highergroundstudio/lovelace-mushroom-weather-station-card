import { CARDINALS, COLOR_VARS, DEFAULT_SECTION_ORDER, DEFAULT_THRESHOLDS, PREFIX_MAP } from "./const";
import type { CardConfig, HassEntity, HomeAssistant, SectionId, ThresholdRule } from "./types";

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
  if (!prefix) return { ...config };
  const prev = (previousPrefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  const entities = { ...(config.entities || {}) };
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
