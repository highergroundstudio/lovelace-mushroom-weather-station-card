/**
 * Derived meteorology for stations that do not report feels-like or dew point.
 * All inputs and outputs are imperial (°F, mph) unless a function says otherwise.
 */

const fToC = (f: number) => (f - 32) * (5 / 9);
const cToF = (c: number) => c * (9 / 5) + 32;

/** Dew point via the Magnus–Tetens formula (Alduchov & Eskridge constants). */
export function dewPointF(tempF: number | null, rh: number | null): number | null {
  if (tempF == null || rh == null || !Number.isFinite(tempF) || !Number.isFinite(rh)) return null;
  if (rh <= 0 || rh > 100) return null;
  const a = 17.625;
  const b = 243.04;
  const t = fToC(tempF);
  const gamma = Math.log(rh / 100) + (a * t) / (b + t);
  return cToF((b * gamma) / (a - gamma));
}

/**
 * NOAA heat index (Rothfusz regression with the NWS low/high humidity
 * adjustments). Below 80 °F the simple Steadman form is used, as NWS does.
 */
export function heatIndexF(tempF: number | null, rh: number | null): number | null {
  if (tempF == null || rh == null || !Number.isFinite(tempF) || !Number.isFinite(rh)) return null;
  const T = tempF;
  const R = Math.max(0, Math.min(100, rh));
  const simple = 0.5 * (T + 61 + (T - 68) * 1.2 + R * 0.094);
  if ((simple + T) / 2 < 80) return simple;
  let hi =
    -42.379
    + 2.04901523 * T
    + 10.14333127 * R
    - 0.22475541 * T * R
    - 0.00683783 * T * T
    - 0.05481717 * R * R
    + 0.00122874 * T * T * R
    + 0.00085282 * T * R * R
    - 0.00000199 * T * T * R * R;
  if (R < 13 && T >= 80 && T <= 112) {
    hi -= ((13 - R) / 4) * Math.sqrt((17 - Math.abs(T - 95)) / 17);
  } else if (R > 85 && T >= 80 && T <= 87) {
    hi += ((R - 85) / 10) * ((87 - T) / 5);
  }
  return hi;
}

/** NWS (2001) wind chill. Only defined at or below 50 °F with wind above 3 mph. */
export function windChillF(tempF: number | null, windMph: number | null): number | null {
  if (tempF == null || windMph == null || !Number.isFinite(tempF) || !Number.isFinite(windMph)) return null;
  if (tempF > 50 || windMph <= 3) return null;
  const v = Math.pow(windMph, 0.16);
  return 35.74 + 0.6215 * tempF - 35.75 * v + 0.4275 * tempF * v;
}

/**
 * Apparent ("feels like") temperature the way most station consoles compute it:
 * wind chill when cold and windy, heat index when hot, otherwise the air temperature.
 */
export function feelsLikeF(
  tempF: number | null,
  rh: number | null,
  windMph: number | null,
): number | null {
  if (tempF == null || !Number.isFinite(tempF)) return null;
  const chill = windChillF(tempF, windMph);
  if (chill != null) return chill;
  if (tempF >= 80 && rh != null) {
    const hi = heatIndexF(tempF, rh);
    if (hi != null) return Math.max(hi, tempF);
  }
  return tempF;
}

/** Convert a °F value into the unit a temperature sensor reports in. */
export function fromFahrenheit(valueF: number, unit: string): number {
  return /c$/i.test(String(unit || "").replace("°", "").trim()) ? fToC(valueF) : valueF;
}

/** Convert a temperature in the sensor's unit to °F. */
export function toFahrenheit(value: number, unit: string): number {
  return /c$/i.test(String(unit || "").replace("°", "").trim()) ? cToF(value) : value;
}

/** Convert a wind speed in the sensor's unit to mph. */
export function toMph(value: number, unit: string): number {
  const u = String(unit || "").toLowerCase().trim();
  if (u === "km/h" || u === "kmh" || u === "kph") return value / 1.60934;
  if (u === "m/s" || u === "m/sec") return value * 2.23694;
  if (u === "kn" || u === "kt" || u === "knots") return value * 1.15078;
  return value;
}
