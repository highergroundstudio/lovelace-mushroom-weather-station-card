import { describe, expect, it } from "vitest";
import { dewPointF, feelsLikeF, fromFahrenheit, heatIndexF, toFahrenheit, toMph, windChillF } from "./derived";

describe("derived meteorology", () => {
  it("computes dew point (Magnus)", () => {
    expect(dewPointF(70, 50)).toBeCloseTo(50.5, 0);
    expect(dewPointF(86, 70)).toBeCloseTo(75.1, 0);
    expect(dewPointF(70, 0)).toBeNull();
    expect(dewPointF(null, 50)).toBeNull();
  });

  it("matches the NWS heat index table", () => {
    expect(Math.round(heatIndexF(90, 60) as number)).toBe(100);
    expect(Math.round(heatIndexF(96, 40) as number)).toBe(101);
    // Below 80 °F the simple Steadman form applies.
    expect(heatIndexF(70, 50)).toBeCloseTo(69.1, 0);
  });

  it("matches the NWS wind chill table", () => {
    expect(Math.round(windChillF(30, 10) as number)).toBe(21);
    expect(Math.round(windChillF(0, 15) as number)).toBe(-19);
    expect(windChillF(55, 10)).toBeNull();
    expect(windChillF(30, 2)).toBeNull();
  });

  it("picks wind chill, heat index, or air temperature for feels-like", () => {
    expect(Math.round(feelsLikeF(30, 50, 10) as number)).toBe(21);
    expect(Math.round(feelsLikeF(90, 60, 5) as number)).toBe(100);
    expect(feelsLikeF(65, 50, 5)).toBe(65);
    expect(feelsLikeF(null, 50, 5)).toBeNull();
  });

  it("converts units", () => {
    expect(fromFahrenheit(212, "°C")).toBeCloseTo(100);
    expect(fromFahrenheit(50, "°F")).toBe(50);
    expect(toFahrenheit(0, "°C")).toBeCloseTo(32);
    expect(toMph(1.60934, "km/h")).toBeCloseTo(1);
    expect(toMph(1, "m/s")).toBeCloseTo(2.237, 2);
  });
});
