/**
 * Station health: which mapped sensors are offline or quiet, and the battery
 * level of every transmitter (auto-discovered by prefix or listed explicitly).
 */
import { available, num } from "./helpers";
import type { HassEntity, HomeAssistant } from "./types";

export interface HealthSensor {
  key: string;
  entityId: string;
  name: string;
  ageMs?: number;
}

export interface HealthBattery {
  entityId: string;
  name: string;
  level: number | null;
  low: boolean;
  icon: string;
}

export interface HealthReport {
  total: number;
  ok: number;
  offline: HealthSensor[];
  stale: HealthSensor[];
  batteries: HealthBattery[];
}

/** Keys that are not station transmitters (or only change rarely by design). */
const NON_SENSOR_KEYS = new Set(["battery", "signal_strength"]);

export function friendlyName(st: HassEntity | null | undefined, prefix?: string): string {
  const raw = String(st?.attributes?.friendly_name || st?.entity_id || "");
  const p = String(prefix || "").trim();
  if (!p) return raw;
  // "WS Soil moisture 1 battery" → "Soil moisture 1 battery"
  const re = new RegExp(`^${p.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}[\\s_-]+`, "i");
  return raw.replace(re, "") || raw;
}

function isBatteryEntity(st: HassEntity): boolean {
  const dc = st.attributes?.device_class;
  if (dc === "battery") return true;
  return /_battery(_\d+)?$/.test(st.entity_id) && /^(sensor|binary_sensor)\./.test(st.entity_id);
}

export function discoverBatteries(
  hass: HomeAssistant | undefined,
  prefix: string | undefined,
  explicit: string[] | undefined,
  threshold: number | string | undefined,
): HealthBattery[] {
  if (!hass) return [];
  const ids = new Set<string>();
  for (const id of explicit || []) if (id) ids.add(id.trim());
  const p = String(prefix || "").trim().replace(/^sensor\./, "").replace(/_+$/, "");
  if (!explicit?.length && p) {
    for (const st of Object.values(hass.states)) {
      const local = st.entity_id.split(".")[1] || "";
      if (local.startsWith(`${p}_`) && isBatteryEntity(st)) ids.add(st.entity_id);
    }
  }
  const limit = threshold == null || threshold === "" ? 20 : Number(threshold);
  const out: HealthBattery[] = [];
  for (const id of ids) {
    const st = hass.states[id];
    if (!st) continue;
    const level = num(st.state);
    const low = level != null
      ? Number.isFinite(limit) && level <= limit
      : st.state === "on" || st.state.toLowerCase() === "low";
    const icon = !available(st)
      ? "mdi:battery-unknown"
      : low
        ? "mdi:battery-alert"
        : level == null
          ? "mdi:battery"
          : level >= 95
            ? "mdi:battery"
            : `mdi:battery-${Math.max(10, Math.min(90, Math.round(level / 10) * 10))}`;
    out.push({ entityId: id, name: friendlyName(st, p), level, low, icon });
  }
  // Low batteries first, then by name.
  return out.sort((a, b) => Number(b.low) - Number(a.low) || a.name.localeCompare(b.name));
}

export function lastReportMs(st: HassEntity | null | undefined): number | null {
  const raw = st?.last_reported;
  if (!raw) return null;
  const t = new Date(raw).getTime();
  return Number.isFinite(t) ? t : null;
}

export function healthReport(
  hass: HomeAssistant | undefined,
  entities: Record<string, string> | undefined,
  opts: {
    prefix?: string;
    staleMinutes?: number;
    batteryEntities?: string[];
    batteryThreshold?: number | string;
    now?: number;
  } = {},
): HealthReport {
  const report: HealthReport = { total: 0, ok: 0, offline: [], stale: [], batteries: [] };
  if (!hass) return report;
  const now = opts.now ?? Date.now();
  const staleMs = (opts.staleMinutes ?? 30) > 0 ? (opts.staleMinutes ?? 30) * 60000 : 0;
  const seen = new Set<string>();
  for (const [key, id] of Object.entries(entities || {})) {
    if (!id || seen.has(id) || NON_SENSOR_KEYS.has(key)) continue;
    const st = hass.states[id];
    // Prefix-filled slots that do not exist are "not installed", not offline.
    if (!st) continue;
    seen.add(id);
    report.total += 1;
    const name = friendlyName(st, opts.prefix);
    if (!available(st)) {
      report.offline.push({ key, entityId: id, name });
      continue;
    }
    // `last_reported` (HA 2024.3+) moves on every report even when the value is unchanged.
    const reported = lastReportMs(st);
    if (staleMs && reported != null && now - reported > staleMs) {
      report.stale.push({ key, entityId: id, name, ageMs: now - reported });
      continue;
    }
    report.ok += 1;
  }
  report.batteries = discoverBatteries(hass, opts.prefix, opts.batteryEntities, opts.batteryThreshold);
  return report;
}
