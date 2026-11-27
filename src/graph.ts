/**
 * SVG history chart for the graph popup: mean line, optional min–max band,
 * gaps where data is missing, and light horizontal grid lines.
 */
import type { GraphSeries } from "./data";

export interface GraphStats {
  min: number;
  max: number;
  avg: number;
  start: number;
  end: number;
}

export const GRAPH_W = 320;
export const GRAPH_H = 140;
const PAD_Y = 8;

/**
 * Min / max / average of a series, ignoring outage markers. Statistics rows are
 * equal-length buckets, so their mean is a plain average. Recorded states hold
 * until the next change, so their average is weighted by how long each lasted
 * (up to `windowEnd`, or the last sample).
 */
export function graphStats(series: GraphSeries, windowEnd?: number): GraphStats | null {
  const pts = series.points;
  const real = pts.filter((p) => !p.gap);
  if (!real.length) return null;
  let min = Infinity;
  let max = -Infinity;
  for (const p of real) {
    min = Math.min(min, p.min ?? p.v);
    max = Math.max(max, p.max ?? p.v);
  }
  let avg: number;
  if (series.source === "history") {
    const end = Math.max(windowEnd ?? pts[pts.length - 1].t, pts[pts.length - 1].t);
    let weighted = 0;
    let dur = 0;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].gap) continue;
      const until = i + 1 < pts.length ? pts[i + 1].t : end;
      const d = Math.max(0, until - pts[i].t);
      weighted += pts[i].v * d;
      dur += d;
    }
    avg = dur > 0 ? weighted / dur : real.reduce((a, p) => a + p.v, 0) / real.length;
  } else {
    avg = real.reduce((a, p) => a + p.v, 0) / real.length;
  }
  return { min, max, avg, start: real[0].t, end: real[real.length - 1].t };
}

/** Break the line where the gap between samples is far above the typical spacing. */
function gapThreshold(times: number[]): number {
  if (times.length < 3) return Infinity;
  const deltas: number[] = [];
  for (let i = 1; i < times.length; i++) deltas.push(times[i] - times[i - 1]);
  deltas.sort((a, b) => a - b);
  const median = deltas[Math.floor(deltas.length / 2)] || 0;
  // Change-only history can be sparse when values are stable; stay generous.
  return Math.max(median * 6, 3 * 3600_000);
}

export function graphSvg(
  series: GraphSeries,
  window: { start: number; end: number },
  width = GRAPH_W,
  height = GRAPH_H,
): string {
  const stats = graphStats(series, window.end);
  if (!stats) return "";
  const pts = series.points;
  const span = Math.max(1, window.end - window.start);
  const lo = stats.min;
  const hi = stats.max;
  const range = hi - lo || Math.max(1, Math.abs(hi) * 0.05);
  const x = (t: number) => ((t - window.start) / span) * width;
  const y = (v: number) => height - PAD_Y - ((v - lo) / range) * (height - PAD_Y * 2);

  const gap = gapThreshold(pts.map((p) => p.t));
  // Change-only history holds each value until the next sample: draw steps.
  const stepped = series.source === "history";
  let line = "";
  let drawing = false;
  for (let i = 0; i < pts.length; i++) {
    const p = pts[i];
    if (p.gap) {
      // Outage: hold the last value up to when it went unavailable, then stop.
      if (drawing && stepped) line += `H${x(p.t).toFixed(1)}`;
      drawing = false;
      continue;
    }
    const broken = !drawing || p.t - pts[i - 1].t > gap;
    if (broken) line += `M${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`;
    else if (stepped) line += `H${x(p.t).toFixed(1)}V${y(p.v).toFixed(1)}`;
    else line += `L${x(p.t).toFixed(1)},${y(p.v).toFixed(1)}`;
    drawing = true;
  }
  if (stepped && drawing) line += `H${x(Math.min(window.end, Date.now())).toFixed(1)}`;

  let band = "";
  if (pts.some((p) => p.min != null && p.max != null && p.max !== p.min)) {
    // One polygon per unbroken run.
    let run: typeof pts = [];
    const flush = () => {
      if (run.length > 1) {
        const top = run.map((p) => `${x(p.t).toFixed(1)},${y(p.max ?? p.v).toFixed(1)}`);
        const bottom = run.slice().reverse().map((p) => `${x(p.t).toFixed(1)},${y(p.min ?? p.v).toFixed(1)}`);
        band += `<polygon class="graph-band" points="${[...top, ...bottom].join(" ")}"/>`;
      }
      run = [];
    };
    for (let i = 0; i < pts.length; i++) {
      if (pts[i].gap) {
        flush();
        continue;
      }
      if (run.length && pts[i].t - run[run.length - 1].t > gap) flush();
      run.push(pts[i]);
    }
    flush();
  }

  const grid = [0.25, 0.5, 0.75]
    .map((f) => `<line class="graph-grid" x1="0" x2="${width}" y1="${(PAD_Y + f * (height - PAD_Y * 2)).toFixed(1)}" y2="${(PAD_Y + f * (height - PAD_Y * 2)).toFixed(1)}"/>`)
    .join("");

  return `<svg class="graph-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" width="100%" height="${height}" aria-hidden="true" focusable="false">
    ${grid}
    ${band}
    <path class="graph-line" d="${line}"/>
    <line class="graph-cursor" x1="-10" x2="-10" y1="0" y2="${height}"/>
    <circle class="graph-dot" cx="-10" cy="-10" r="3.5"/>
  </svg>`;
}

/** Index of the sample closest to a horizontal fraction of the chart (0–1). */
export function nearestPoint(series: GraphSeries, window: { start: number; end: number }, fraction: number): number {
  const pts = series.points;
  if (!pts.length) return -1;
  const t = window.start + Math.max(0, Math.min(1, fraction)) * (window.end - window.start);
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi) >> 1;
    if (pts[mid].t < t) lo = mid + 1;
    else hi = mid;
  }
  if (lo > 0 && Math.abs(pts[lo - 1].t - t) < Math.abs(pts[lo].t - t)) lo -= 1;
  // Outage markers have no value; step to the nearest real sample.
  for (let d = 0; d < pts.length; d++) {
    if (lo - d >= 0 && !pts[lo - d].gap) return lo - d;
    if (lo + d < pts.length && !pts[lo + d].gap) return lo + d;
  }
  return -1;
}

/** Chart y position for a value, matching `graphSvg` scaling. */
export function graphY(series: GraphSeries, v: number, height = GRAPH_H): number {
  const stats = graphStats(series);
  if (!stats) return height / 2;
  const range = stats.max - stats.min || Math.max(1, Math.abs(stats.max) * 0.05);
  return height - PAD_Y - ((v - stats.min) / range) * (height - PAD_Y * 2);
}
