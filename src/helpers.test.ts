import { describe, expect, it } from "vitest";
import {
  aqiMeta,
  applyPrefix,
  batteryInfo,
  beaufort,
  buildRecordBook,
  cardinalToDeg,
  collectAlerts,
  comfortStats,
  convertValue,
  currentSeason,
  daysSinceTimestamp,
  degToCardinal,
  displayThresholdValue,
  downsampleHistory,
  downsampleHistoryExtrema,
  esc,
  historyLineSpark,
  isRecordSetToday,
  mergeThresholds,
  moonMeta,
  moveSection,
  moveSectionTo,
  normalizeSectionOrder,
  parseWindDirection,
  pm25Meta,
  precipTimelineBars,
  pressureTrendMeta,
  rainMonthProgress,
  seasonalSkinClasses,
  comfortScatterSvg,
  storeThresholdValue,
  thresholdCompareValue,
  uvMeta,
  windRoseBins,
} from "./helpers";
import { CARD_VERSION } from "./version";
import { DEFAULT_SECTION_ORDER } from "./const";
import pkg from "../package.json";

describe("version", () => {
  it("matches package.json", () => {
    expect(CARD_VERSION).toBe(pkg.version);
  });
});

describe("wind helpers", () => {
  it("converts degrees and cardinals", () => {
    expect(degToCardinal(0)).toBe("N");
    expect(degToCardinal(45)).toBe("NE");
    expect(cardinalToDeg("NNW")).toBe(337.5);
    expect(parseWindDirection({ entity_id: "x", state: "NW", attributes: {} }).card).toBe("NW");
    expect(parseWindDirection({ entity_id: "x", state: "90", attributes: {} }).card).toBe("E");
  });
});

describe("units", () => {
  it("converts temperature and speed", () => {
    const c = convertValue(32, "°F", "metric");
    expect(Math.abs(c.value ?? 99)).toBeLessThan(0.01);
    expect(c.unit).toBe("°C");
    const mph = convertValue(10, "mph", "metric");
    expect(Math.abs((mph.value ?? 0) - 16.0934)).toBeLessThan(0.01);
  });

  it("normalizes threshold compare values to imperial bands", () => {
    expect(thresholdCompareValue(0, "°C")).toBe(32);
    expect(Math.abs((thresholdCompareValue(25, "km/h") ?? 0) - 15.534)).toBeLessThan(0.01);
    expect(Math.abs((thresholdCompareValue(10, "m/sec") ?? 0) - 22.3694)).toBeLessThan(0.01);
    expect(thresholdCompareValue(70, "°F")).toBe(70);
  });
});

describe("meta helpers", () => {
  it("reports trends, beaufort, uv, pm25, battery", () => {
    expect(pressureTrendMeta(30.1, 30.0).label).toBe("Rising");
    expect(pressureTrendMeta(29.9, 30.0).label).toBe("Falling");
    expect(beaufort(6.4)).toBe(2);
    expect(uvMeta(9).label).toBe("Very high");
    expect(pm25Meta(18).label).toBe("Moderate");
    const batt = batteryInfo({ entity_id: "b", state: "15", attributes: {} }, 20);
    expect(batt?.low).toBe(true);
    expect(batt?.text).toMatch(/15%/);
  });
});

describe("prefix and section order", () => {
  it("fills and refreshes prefix entities", () => {
    const cfg = applyPrefix({ prefix: "ws", entities: {} });
    expect(cfg.entities?.temperature).toBe("sensor.ws_temperature");
    expect(cfg.entities?.soil_moisture_2).toBe("sensor.ws_soil_moisture_2");
    expect(cfg.entities?.pm25).toBe("sensor.ws_pm25");

    const renamed = applyPrefix(
      {
        prefix: "station",
        entities: {
          temperature: "sensor.ws_temperature",
          humidity: "sensor.custom_outside_rh",
          dew_point: "sensor.outdoor_dew_point",
        },
      },
      "ws",
    );
    expect(renamed.entities?.temperature).toBe("sensor.station_temperature");
    expect(renamed.entities?.humidity).toBe("sensor.custom_outside_rh");
    // Lookalike override must not be rewritten without previousPrefix match.
    expect(renamed.entities?.dew_point).toBe("sensor.outdoor_dew_point");

    const untouched = applyPrefix({
      prefix: "station",
      entities: { temperature: "sensor.outdoor_temperature" },
    });
    expect(untouched.entities?.temperature).toBe("sensor.outdoor_temperature");

    // Clear then re-prefix: derived IDs are removed on clear, then refilled.
    const cleared = applyPrefix(
      {
        prefix: "",
        entities: {
          temperature: "sensor.ws_temperature",
          humidity: "sensor.custom_outside_rh",
        },
      },
      "ws",
    );
    expect(cleared.entities?.temperature).toBeUndefined();
    expect(cleared.entities?.humidity).toBe("sensor.custom_outside_rh");
    const afterClear = applyPrefix({ prefix: "station", entities: { ...cleared.entities } });
    expect(afterClear.entities?.temperature).toBe("sensor.station_temperature");
    expect(afterClear.entities?.humidity).toBe("sensor.custom_outside_rh");
  });

  it("normalizes and moves section order", () => {
    const order = normalizeSectionOrder(["rain", "wind", "bogus"]);
    expect(order[0]).toBe("rain");
    expect(order[1]).toBe("wind");
    expect(order).toContain("forecast");
    expect(order).toHaveLength(DEFAULT_SECTION_ORDER.length);
    const moved = moveSection(order, 0, 1);
    expect(moved[0]).toBe("wind");
    expect(moved[1]).toBe("rain");
    const dragged = moveSectionTo(order, 0, 2);
    expect(dragged[2]).toBe("rain");
  });
});

describe("0.7 helpers", () => {
  it("formats moon, rain goals, alerts, sparklines, and threshold units", () => {
    expect(moonMeta("waning_gibbous").icon).toBe("mdi:moon-waning-gibbous");
    expect(aqiMeta(40).label).toBe("Good");
    expect(rainMonthProgress(1.2, 2.4).pct).toBe(50);
    expect(daysSinceTimestamp(new Date(Date.now() - 2.5 * 86400000).toISOString())).toBeGreaterThan(2);
    const alerts = collectAlerts(
      {
        entity_id: "weather.home",
        state: "rainy",
        attributes: { alerts: [{ title: "Flood Watch", severity: "moderate", description: "Rising creeks" }] },
      },
      null,
    );
    expect(alerts[0]?.title).toBe("Flood Watch");
    expect(historyLineSpark([{ state: 1, last_changed: 1 }, { state: 3, last_changed: 2 }])).toContain("polyline");
    expect(windRoseBins([0, 10, 180, 185]).find((b) => b.label === "N")?.count).toBe(2);
    expect(Math.round(displayThresholdValue(32, "temp", "metric"))).toBe(0);
    expect(Math.round(storeThresholdValue(0, "temp", "metric"))).toBe(32);
    // Round-trip with a nonzero Celsius threshold (0°C/32°F is too easy).
    const stored = storeThresholdValue(12.5, "temp", "metric");
    expect(stored).toBeCloseTo(54.5, 5);
    expect(displayThresholdValue(stored, "temp", "metric")).toBeCloseTo(12.5, 5);
  });
});

describe("0.8 helpers", () => {
  it("builds record book, precip timeline, comfort, and seasonal skins", () => {
    const now = Date.now();
    const book = buildRecordBook({
      temperature: [
        { state: 40, last_changed: now - 1000 },
        { state: 95, last_changed: now },
      ],
      wind_gust: [{ state: 22, last_changed: now }],
      rain_rate: [{ state: 0.4, last_changed: now }],
      rain_today: [{ state: 1.1, last_changed: now }],
    });
    expect(book.hottest?.value).toBe(95);
    expect(book.coldest?.value).toBe(40);
    expect(book.peakGust?.value).toBe(22);
    expect(isRecordSetToday(book.hottest, now)).toBe(true);
    expect(isRecordSetToday({ value: 99, at: now - 2 * 86400000 }, now)).toBe(false);

    // Uniform downsample can miss a mid-series spike; extrema mode keeps it.
    const spikeSeries = Array.from({ length: 100 }, (_, i) => ({
      state: i === 48 ? 9.5 : 0.1,
      last_changed: now - (100 - i) * 60_000,
    }));
    expect(Math.max(...downsampleHistory(spikeSeries, 20).map((p) => p.state))).toBe(0.1);
    expect(Math.max(...downsampleHistoryExtrema(spikeSeries, 20, "max").map((p) => p.state))).toBe(9.5);

    const bars = precipTimelineBars(
      [
        { state: 0.1, last_changed: now - 3600_000 },
        { state: 0.5, last_changed: now - 600_000 },
      ],
      6,
      12,
    );
    expect(bars.length).toBe(12);
    expect(Math.max(...bars.map((b) => b.value))).toBeGreaterThan(0);

    // Sustained rate with only a start+stop transition fills intervening buckets.
    const sustained = precipTimelineBars(
      [
        { state: 0.4, last_changed: now - 3 * 3600_000 },
        { state: 0, last_changed: now - 3600_000 },
      ],
      6,
      12,
    );
    const wetBuckets = sustained.filter((b) => b.value > 0).length;
    expect(wetBuckets).toBeGreaterThan(2);

    // Cap-after-compute: early spike survives on the full series, vanishes if capped first.
    const dense = Array.from({ length: 1500 }, (_, i) => ({
      state: i === 0 ? 0.8 : 0,
      last_changed: now - (1500 - i) * 1000,
    }));
    expect(Math.max(...precipTimelineBars(dense, 1, 24).map((b) => b.value))).toBe(0.8);
    expect(Math.max(...precipTimelineBars(dense.slice(-1200), 1, 24).map((b) => b.value))).toBe(0);

    const comfort = comfortStats(
      [
        { state: 70, last_changed: now - 3600_000 },
        { state: 72, last_changed: now - 1800_000 },
        { state: 90, last_changed: now },
      ],
      [
        // Unchanged humidity for 90m — still valid at the mid temp sample.
        { state: 45, last_changed: now - 3600_000 },
        { state: 80, last_changed: now },
      ],
      { tempMin: 65, tempMax: 78, humidityMin: 30, humidityMax: 60 },
      { start: now - 3600_000, end: now },
    );
    expect(comfort.samples.length).toBe(3);
    expect(comfort.samples[1]?.humidity).toBe(45);
    expect(comfort.hoursIn).toBeGreaterThan(0);

    // Humidity change mid-temp-interval splits dwell (5 min in-band of 30).
    const splitStart = now - 3600_000;
    const split = comfortStats(
      [
        { state: 70, last_changed: splitStart },
        { state: 71, last_changed: splitStart + 30 * 60_000 },
      ],
      [
        { state: 45, last_changed: splitStart },
        { state: 80, last_changed: splitStart + 5 * 60_000 },
      ],
      { tempMin: 65, tempMax: 78, humidityMin: 30, humidityMax: 60 },
      { start: splitStart, end: splitStart + 30 * 60_000 },
    );
    expect(split.hoursIn).toBeCloseTo(5 / 60, 3);
    expect(split.hoursTotal).toBeCloseTo(0.5, 3);

    // Scatter thins uniformly across the series (keeps the first sample), not just the tail.
    const denseSamples = Array.from({ length: 200 }, (_, i) => ({
      temp: i === 0 ? 50 : 70,
      humidity: 40,
    }));
    const svg = comfortScatterSvg(denseSamples, {
      tempMin: 65,
      tempMax: 78,
      humidityMin: 30,
      humidityMax: 60,
    });
    expect((svg.match(/<circle/g) || []).length).toBe(80);
    // temp 50 → cx ≈ 20.8 on the default scale; tail-only thinning would omit it.
    expect(svg).toContain('cx="20.8"');

    // Unavailable humidity clears validity until a later recovery sample.
    const gap = comfortStats(
      [
        { state: 70, last_changed: now - 3600_000 },
        { state: 71, last_changed: now - 1800_000 },
        { state: 72, last_changed: now - 600_000 },
      ],
      [
        { state: 45, last_changed: now - 3600_000 },
        { state: Number.NaN, last_changed: now - 2700_000, unavailable: true },
        { state: 50, last_changed: now - 900_000 },
      ],
      { tempMin: 65, tempMax: 78, humidityMin: 30, humidityMax: 60 },
    );
    expect(gap.samples.map((s) => s.temp)).toEqual([70, 72]);
    expect(gap.samples.find((s) => s.temp === 71)).toBeUndefined();

    // Unavailable rain-rate must not extend the previous wet rate across the gap.
    const outage = precipTimelineBars(
      [
        { state: 0.6, last_changed: now - 4 * 3600_000 },
        { state: Number.NaN, last_changed: now - 3 * 3600_000, unavailable: true },
        { state: 0.2, last_changed: now - 1 * 3600_000 },
      ],
      6,
      12,
    );
    expect(outage.some((b) => b.value >= 0.6)).toBe(true);
    expect(outage.some((b) => b.value > 0 && b.value < 0.6)).toBe(true);
    // Bucket ~now-2h sits in the unavailable gap (index 8 of 12 over 6h).
    expect(outage[8]?.value ?? -1).toBe(0);

    expect(currentSeason(new Date("2026-07-15T12:00:00Z"), "north")).toBe("summer");
    expect(currentSeason(new Date("2026-07-15T12:00:00Z"), "south")).toBe("winter");
    expect(seasonalSkinClasses("winter", "rainy")).toContain("skin-winter");
    expect(seasonalSkinClasses("winter", "rainy")).toContain("cond-rain");
  });
});

describe("thresholds and escaping", () => {
  it("lets user rules replace matching default color/direction", () => {
    const merged = mergeThresholds(
      { thresholds: { uv: [{ above: 10, color: "purple" }] } },
      "uv",
    );
    expect(merged.some((r) => r.above === 8 && r.color === "purple")).toBe(false);
    expect(merged.some((r) => r.above === 10 && r.color === "purple")).toBe(true);
    expect(merged.some((r) => r.above === 3 && r.color === "amber")).toBe(true);
  });

  it("preserves numeric zero in esc", () => {
    expect(esc(0)).toBe("0");
    expect(esc(null)).toBe("");
    expect(esc(undefined)).toBe("");
  });
});
