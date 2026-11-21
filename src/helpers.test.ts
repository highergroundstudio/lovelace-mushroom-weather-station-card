import { describe, expect, it } from "vitest";
import {
  applyPrefix,
  batteryInfo,
  beaufort,
  cardinalToDeg,
  convertValue,
  degToCardinal,
  esc,
  mergeThresholds,
  moveSection,
  normalizeSectionOrder,
  parseWindDirection,
  pm25Meta,
  pressureTrendMeta,
  thresholdCompareValue,
  uvMeta,
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
