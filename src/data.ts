/**
 * Home Assistant data access: raw recorder history and long-term statistics.
 *
 * Raw history (`history/history_during_period`) is only kept for
 * `recorder.purge_keep_days` (10 days by default), so month/year features use
 * long-term statistics (`recorder/statistics_during_period`), which HA keeps
 * forever as hourly min/max/mean rows for sensors with a `state_class`.
 */
import { num, parseWindDirection } from "./helpers";
import type { HistoryExtreme, HistoryPoint, HomeAssistant, RecordBook } from "./types";

export interface StatRow {
  start: number;
  end: number;
  min: number | null;
  max: number | null;
  mean: number | null;
  /** Last state in the bucket — the only value for `total`/`total_increasing` sensors. */
  state: number | null;
}

export type StatPeriod = "5minute" | "hour" | "day" | "week" | "month";

export function parseHistoryPoint(rawState: unknown, changed: unknown): HistoryPoint | null {
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
    state = parseWindDirection({ entity_id: "", state: rawState, attributes: {} }).deg;
  }
  return state == null ? null : { state, last_changed: t };
}

/** Normalize websocket (keyed object) and REST (array of arrays) history payloads. */
export function ingestHistoryRaw(
  raw: unknown,
  keyById: Record<string, string>,
): Record<string, HistoryPoint[]> {
  const next: Record<string, HistoryPoint[]> = {};
  if (Array.isArray(raw)) {
    for (const series of raw as Array<Array<{ entity_id?: string; state?: string; last_changed?: string }>>) {
      if (!Array.isArray(series) || !series.length) continue;
      const key = keyById[series[0]?.entity_id || ""];
      if (!key) continue;
      next[key] = series
        .map((p) => parseHistoryPoint(p.state, p.last_changed))
        .filter((p): p is HistoryPoint => !!p);
    }
  } else if (raw && typeof raw === "object") {
    for (const [id, series] of Object.entries(raw as Record<string, Array<{ s?: string; state?: string; lu?: number; last_changed?: string }>>)) {
      const key = keyById[id];
      if (!key || !Array.isArray(series)) continue;
      next[key] = series
        .map((p) => parseHistoryPoint(p.s ?? p.state, p.lu ?? p.last_changed))
        .filter((p): p is HistoryPoint => !!p);
    }
  }
  return next;
}

export async function fetchHistoryRaw(
  hass: HomeAssistant | undefined,
  entityIds: string[],
  start: Date,
  end: Date,
  significantOnly: boolean,
): Promise<unknown | null> {
  if (!hass || !entityIds.length) return null;
  if (hass.connection?.sendMessagePromise) {
    return hass.connection.sendMessagePromise({
      type: "history/history_during_period",
      start_time: start.toISOString(),
      end_time: end.toISOString(),
      significant_changes_only: significantOnly,
      minimal_response: true,
      no_attributes: true,
      entity_ids: entityIds,
    });
  }
  if (hass.callApi) {
    const sig = significantOnly ? 1 : 0;
    // HA REST defaults omitted end_time to start+1 day — always pass end.
    const q =
      `history/period/${start.toISOString()}`
      + `?filter_entity_id=${entityIds.join(",")}`
      + `&end_time=${encodeURIComponent(end.toISOString())}`
      + `&significant_changes_only=${sig}&minimal_response`;
    return hass.callApi("GET", q);
  }
  return null;
}

function toMs(v: unknown): number {
  if (typeof v === "number") return v > 1e12 ? v : v * 1000;
  if (typeof v === "string") return new Date(v).getTime();
  return NaN;
}

const finiteOrNull = (v: unknown): number | null => {
  const n = typeof v === "number" ? v : v == null ? NaN : Number(v);
  return Number.isFinite(n) ? n : null;
};

/** Normalize a `recorder/statistics_during_period` response. */
export function parseStatistics(raw: unknown): Record<string, StatRow[]> {
  const out: Record<string, StatRow[]> = {};
  if (!raw || typeof raw !== "object") return out;
  for (const [id, rows] of Object.entries(raw as Record<string, unknown>)) {
    if (!Array.isArray(rows)) continue;
    const parsed: StatRow[] = [];
    for (const r of rows as Array<Record<string, unknown>>) {
      const start = toMs(r.start);
      if (!Number.isFinite(start)) continue;
      const endMs = toMs(r.end);
      parsed.push({
        start,
        end: Number.isFinite(endMs) ? endMs : start,
        min: finiteOrNull(r.min),
        max: finiteOrNull(r.max),
        mean: finiteOrNull(r.mean),
        state: finiteOrNull(r.state),
      });
    }
    out[id] = parsed.sort((a, b) => a.start - b.start);
  }
  return out;
}

export async function fetchStatistics(
  hass: HomeAssistant | undefined,
  statisticIds: string[],
  start: Date,
  end: Date,
  period: StatPeriod,
): Promise<Record<string, StatRow[]> | null> {
  if (!hass?.connection?.sendMessagePromise || !statisticIds.length) return null;
  const raw = await hass.connection.sendMessagePromise({
    type: "recorder/statistics_during_period",
    start_time: start.toISOString(),
    end_time: end.toISOString(),
    statistic_ids: statisticIds,
    period,
    types: ["min", "max", "mean", "state"],
  });
  return parseStatistics(raw);
}

function rowExtreme(rows: StatRow[], mode: "min" | "max"): HistoryExtreme | null {
  let best: HistoryExtreme | null = null;
  for (const r of rows) {
    const v = mode === "max" ? (r.max ?? r.state ?? r.mean) : (r.min ?? r.state ?? r.mean);
    if (v == null) continue;
    if (!best || (mode === "max" ? v > best.value : v < best.value)) {
      // Midpoint of the bucket is the best estimate of when it happened.
      best = { value: v, at: r.start + Math.max(0, r.end - r.start) / 2 };
    }
  }
  return best;
}

function pickExtreme(
  a: HistoryExtreme | null,
  b: HistoryExtreme | null,
  mode: "min" | "max",
): HistoryExtreme | null {
  if (!a) return b;
  if (!b) return a;
  if (mode === "max") return b.value > a.value ? b : a;
  return b.value < a.value ? b : a;
}

/**
 * Build the record book from statistics rows (by card key), merged with a
 * "recent" book from raw history / live states so the current, not yet
 * compiled hour still counts.
 */
export function recordBookFromStatistics(
  stats: Record<string, StatRow[]>,
  recent: Partial<RecordBook> = {},
): RecordBook {
  return {
    hottest: pickExtreme(rowExtreme(stats.temperature || [], "max"), recent.hottest ?? null, "max"),
    coldest: pickExtreme(rowExtreme(stats.temperature || [], "min"), recent.coldest ?? null, "min"),
    peakGust: pickExtreme(rowExtreme(stats.wind_gust || [], "max"), recent.peakGust ?? null, "max"),
    peakRainRate: pickExtreme(rowExtreme(stats.rain_rate || [], "max"), recent.peakRainRate ?? null, "max"),
    wettestDay: pickExtreme(rowExtreme(stats.rain_today || [], "max"), recent.wettestDay ?? null, "max"),
  };
}

/** Graph series: one point per row (mean) with a min/max band. */
export interface GraphSeries {
  points: Array<{ t: number; v: number; min?: number; max?: number }>;
  source: "statistics" | "history";
}

export function seriesFromStatistics(rows: StatRow[]): GraphSeries {
  return {
    source: "statistics",
    points: rows
      .map((r) => {
        const v = r.mean
          ?? (r.min != null && r.max != null ? (r.min + r.max) / 2 : r.max ?? r.min ?? r.state);
        if (v == null) return null;
        if (r.min == null && r.max == null) return { t: r.start, v };
        return { t: r.start, v, min: r.min ?? v, max: r.max ?? v };
      })
      .filter((p): p is NonNullable<typeof p> => !!p),
  };
}

export function seriesFromHistory(points: HistoryPoint[]): GraphSeries {
  return {
    source: "history",
    points: points
      .filter((p) => !p.unavailable && Number.isFinite(p.state))
      .map((p) => ({ t: p.last_changed, v: p.state })),
  };
}
