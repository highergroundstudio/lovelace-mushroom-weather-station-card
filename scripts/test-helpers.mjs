#!/usr/bin/env node
/**
 * Lightweight unit checks for card helper logic (no HA runtime).
 * Run: node scripts/test-helpers.mjs
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import vm from "node:vm";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const src = fs.readFileSync(path.join(root, "dist/mushroom-weather-station-card.js"), "utf8");

// Evaluate helpers by stripping the custom element registration side effects.
const helpersSrc = src
  .replace(/customElements\.define[\s\S]*$/, "")
  .replace(/window\.customCards[\s\S]*$/, "")
  .replace(/console\.info\([\s\S]*?\);\s*$/, "");

const sandbox = {
  customElements: { define() {}, get() { return null; } },
  window: { customCards: [], setInterval() { return 0; }, clearInterval() {}, setTimeout() { return 0; }, clearTimeout() {} },
  console,
  Date,
  Math,
  Number,
  String,
  Array,
  Object,
  JSON,
  Intl,
  parseFloat,
  HTMLElement: class HTMLElement {},
};
vm.runInNewContext(`${helpersSrc}\nthis.__exports = { degToCardinal, cardinalToDeg, parseWindDirection, convertValue, pressureTrendMeta, beaufort, uvMeta, pm25Meta, batteryInfo, applyPrefix, CARD_VERSION, PREFIX_MAP };`, sandbox);

const {
  degToCardinal,
  cardinalToDeg,
  parseWindDirection,
  convertValue,
  pressureTrendMeta,
  beaufort,
  uvMeta,
  pm25Meta,
  batteryInfo,
  applyPrefix,
  CARD_VERSION,
  PREFIX_MAP,
} = sandbox.__exports;

assert.equal(CARD_VERSION, "0.5.0");
assert.ok(PREFIX_MAP.soil_moisture_1);
assert.ok(PREFIX_MAP.lightning_count);
assert.ok(PREFIX_MAP.pm25);

assert.equal(degToCardinal(0), "N");
assert.equal(degToCardinal(45), "NE");
assert.equal(degToCardinal(180), "S");
assert.equal(cardinalToDeg("NNW"), 337.5);

const textDir = parseWindDirection({ state: "NW", attributes: {} });
assert.equal(textDir.card, "NW");
assert.equal(textDir.deg, 315);

const degDir = parseWindDirection({ state: "90", attributes: {} });
assert.equal(degDir.card, "E");
assert.equal(degDir.deg, 90);

const c = convertValue(32, "°F", "metric");
assert.ok(Math.abs(c.value) < 0.01);
assert.equal(c.unit, "°C");

const mph = convertValue(10, "mph", "metric");
assert.ok(Math.abs(mph.value - 16.0934) < 0.01);

assert.equal(pressureTrendMeta(30.1, 30.0).label, "Rising");
assert.equal(pressureTrendMeta(29.9, 30.0).label, "Falling");
assert.equal(pressureTrendMeta(30.0, 30.005).label, "Steady");

assert.equal(beaufort(0), 0);
assert.equal(beaufort(12), 3);
assert.equal(beaufort(40), 8);

assert.equal(uvMeta(9).label, "Very high");
assert.equal(pm25Meta(10).label, "Good");
assert.equal(pm25Meta(40).label, "Sensitive");

const batt = batteryInfo({ state: "15" }, 20);
assert.equal(batt.low, true);
assert.match(batt.text, /15%/);

const cfg = applyPrefix({ prefix: "ws", entities: {} });
assert.equal(cfg.entities.temperature, "sensor.ws_temperature");
assert.equal(cfg.entities.soil_moisture_2, "sensor.ws_soil_moisture_2");
assert.equal(cfg.entities.lightning_count, "sensor.ws_lightning_num");
assert.equal(cfg.entities.pm25, "sensor.ws_pm25");

console.log("All helper tests passed.");
