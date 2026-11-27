import { describe, expect, it } from "vitest";
import { graphStats, graphSvg, nearestPoint } from "./graph";
import {
  ingestHistoryRaw,
  parseStatistics,
  recordBookFromStatistics,
  seriesFromHistory,
  seriesFromStatistics,
} from "./data";

const H = 3600_000;

describe("long-term statistics", () => {
  it("parses ms and ISO timestamps and nulls", () => {
    const out = parseStatistics({
      "sensor.t": [
        { start: "2026-01-01T01:00:00Z", end: "2026-01-01T02:00:00Z", min: 1, max: 3, mean: 2 },
        { start: Date.UTC(2026, 0, 1, 0), end: Date.UTC(2026, 0, 1, 1), min: null, max: "4", mean: 2.5 },
      ],
      "sensor.bad": "nope",
    });
    expect(out["sensor.t"].map((r) => r.start)).toEqual([Date.UTC(2026, 0, 1, 0), Date.UTC(2026, 0, 1, 1)]);
    expect(out["sensor.t"][0]).toMatchObject({ min: null, max: 4, mean: 2.5, state: null });
    expect(out["sensor.bad"]).toBeUndefined();
  });

  it("builds a year of records beyond the raw-history purge window", () => {
    const longAgo = Date.now() - 200 * 24 * H;
    const stats = {
      temperature: [
        { start: longAgo, end: longAgo + H, min: 10, max: 98, mean: 50, state: null },
        { start: longAgo + H, end: longAgo + 2 * H, min: -4, max: 20, mean: 5, state: null },
      ],
      // total_increasing sensors only carry `state`.
      rain_today: [
        { start: longAgo, end: longAgo + H, min: null, max: null, mean: null, state: 1.8 },
        { start: longAgo + H, end: longAgo + 2 * H, min: null, max: null, mean: null, state: 0.2 },
      ],
    };
    const book = recordBookFromStatistics(stats, {
      peakGust: { value: 31, at: Date.now() },
      hottest: { value: 70, at: Date.now() },
    });
    expect(book.hottest?.value).toBe(98);
    expect(book.coldest?.value).toBe(-4);
    expect(book.wettestDay?.value).toBe(1.8);
    expect(book.peakGust?.value).toBe(31);
    expect(book.peakRainRate).toBeNull();
    // Timestamp is the bucket midpoint.
    expect(book.hottest?.at).toBe(longAgo + H / 2);
  });

  it("lets a fresh reading beat compiled statistics", () => {
    const book = recordBookFromStatistics(
      { temperature: [{ start: 0, end: H, min: 40, max: 80, mean: 60, state: null }] },
      { hottest: { value: 85, at: 123 } },
    );
    expect(book.hottest).toEqual({ value: 85, at: 123 });
  });

  it("converts rows and history into graph series", () => {
    const s = seriesFromStatistics([
      { start: 0, end: H, min: 1, max: 3, mean: 2, state: null },
      { start: H, end: 2 * H, min: null, max: null, mean: null, state: 5 },
      { start: 2 * H, end: 3 * H, min: null, max: null, mean: null, state: null },
    ]);
    expect(s.source).toBe("statistics");
    expect(s.points).toEqual([{ t: 0, v: 2, min: 1, max: 3 }, { t: H, v: 5 }]);
    const h = seriesFromHistory(ingestHistoryRaw({ "sensor.x": [{ s: "1", lu: 1 }, { s: "unavailable", lu: 2 }, { s: "3", lu: 3 }] }, { "sensor.x": "x" }).x);
    // The outage stays in the series as a break marker.
    expect(h.points).toEqual([{ t: 1000, v: 1 }, { t: 2000, v: 0, gap: true }, { t: 3000, v: 3 }]);
  });

  it("never dates a record after now, and prefers exact raw timestamps on ties", () => {
    const now = Date.now();
    const dayStart = now - 3600_000; // a daily bucket still running
    const book = recordBookFromStatistics({
      temperature: [{ start: dayStart, end: dayStart + 86400_000, min: 40, max: 80, mean: 60, state: null }],
    });
    expect(book.hottest!.at).toBeLessThanOrEqual(Date.now());
    expect(book.hottest!.at).toBeGreaterThanOrEqual(dayStart);
    const tie = recordBookFromStatistics(
      { temperature: [{ start: dayStart, end: dayStart + 86400_000, min: 40, max: 80, mean: 60, state: null }] },
      { hottest: { value: 80, at: now - 600_000 } },
    );
    expect(tie.hottest).toEqual({ value: 80, at: now - 600_000 });
  });
});

describe("graph series", () => {
  const win = { start: 0, end: 24 * H };

  it("weights recorded-state averages by duration", () => {
    // 10 for 23 hours, then 30 for the last hour.
    const s = { source: "history" as const, points: [{ t: 0, v: 10 }, { t: 23 * H, v: 30 }] };
    expect(graphStats(s, win.end)!.avg).toBeCloseTo(10.833, 2);
    // Equal-length statistics buckets keep a plain mean.
    expect(graphStats({ source: "statistics", points: s.points })!.avg).toBe(20);
  });

  it("excludes outages from stats and breaks the line there", () => {
    const s = {
      source: "history" as const,
      points: [{ t: 0, v: 10 }, { t: 2 * H, v: 0, gap: true }, { t: 4 * H, v: 20 }],
    };
    const st = graphStats(s, 6 * H)!;
    expect(st.min).toBe(10);
    // 10 for 2h, outage 2h (ignored), 20 for 2h.
    expect(st.avg).toBeCloseTo(15, 5);
    const d = /class="graph-line" d="([^"]+)"/.exec(graphSvg(s, { start: 0, end: 6 * H }))![1];
    expect(d.match(/M/g)!.length).toBe(2);
    // Cursor skips the outage marker.
    expect(nearestPoint(s, { start: 0, end: 4 * H }, 0.5)).not.toBe(1);
  });
});
