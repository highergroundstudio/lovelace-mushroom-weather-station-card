import { describe, expect, it } from "vitest";
import { batteryEntityIds, discoverBatteries, friendlyName, healthReport } from "./health";
import type { HassEntity, HomeAssistant } from "./types";

const now = Date.UTC(2026, 10, 27, 12);
const iso = (ms: number) => new Date(ms).toISOString();

function ent(id: string, state: string, attrs: Record<string, unknown> = {}, reported = now): HassEntity {
  return { entity_id: id, state, last_reported: iso(reported), attributes: { friendly_name: id, ...attrs } };
}

function hass(list: HassEntity[]): HomeAssistant {
  return { states: Object.fromEntries(list.map((e) => [e.entity_id, e])), callService: () => {} };
}

describe("station health", () => {
  const h = hass([
    ent("sensor.ws_temperature", "70"),
    ent("sensor.ws_humidity", "unavailable"),
    ent("sensor.ws_wind_speed", "4", {}, now - 2 * 3600_000),
    ent("sensor.ws_wh65_battery", "80", { device_class: "battery", friendly_name: "WS Outdoor battery" }),
    ent("sensor.ws_wh51_battery", "9", { device_class: "battery", friendly_name: "WS Soil battery" }),
    ent("binary_sensor.ws_wh57_battery", "on", { friendly_name: "WS Lightning battery" }),
    ent("sensor.other_battery", "5", { device_class: "battery" }),
  ]);

  it("separates offline, quiet, and healthy sensors", () => {
    const r = healthReport(h, {
      temperature: "sensor.ws_temperature",
      humidity: "sensor.ws_humidity",
      wind_speed: "sensor.ws_wind_speed",
      rain_rate: "sensor.ws_not_installed",
    }, { prefix: "ws", staleMinutes: 30, now });
    expect(r.total).toBe(3);
    expect(r.ok).toBe(1);
    expect(r.offline.map((s) => s.key)).toEqual(["humidity"]);
    expect(r.stale.map((s) => s.key)).toEqual(["wind_speed"]);
  });

  it("auto-discovers prefixed batteries, low first", () => {
    const b = discoverBatteries(h, "ws", undefined, 20);
    expect(b.map((x) => x.entityId)).toEqual([
      "binary_sensor.ws_wh57_battery",
      "sensor.ws_wh51_battery",
      "sensor.ws_wh65_battery",
    ]);
    expect(b.map((x) => x.low)).toEqual([true, true, false]);
    expect(b[2].name).toBe("Outdoor battery");
  });

  it("uses an explicit list when given", () => {
    expect(discoverBatteries(h, "ws", ["sensor.other_battery"], 20).map((x) => x.entityId)).toEqual(["sensor.other_battery"]);
  });

  it("strips the prefix from names", () => {
    expect(friendlyName(ent("sensor.x", "1", { friendly_name: "WS Soil moisture 1" }), "ws")).toBe("Soil moisture 1");
  });
});

describe("station health without last_reported", () => {
  it("does not claim freshness it cannot know", () => {
    const st = { entity_id: "sensor.ws_temperature", state: "70", attributes: {} };
    const r = healthReport({ states: { [st.entity_id]: st }, callService: () => {} }, { temperature: st.entity_id }, { now });
    expect(r.freshnessKnown).toBe(false);
    expect(r.ok).toBe(1);
    expect(r.stale).toEqual([]);
  });

  it("reports unavailable batteries as unknown, not OK", () => {
    const h = hass([ent("sensor.ws_wh65_battery", "unavailable", { device_class: "battery" })]);
    const [b] = discoverBatteries(h, "ws", undefined, 20);
    expect(b).toMatchObject({ known: false, low: false, icon: "mdi:battery-unknown" });
  });

  it("shares one battery selection for rendering and change detection", () => {
    const h = hass([
      ent("sensor.ws_wh65_battery", "80", { device_class: "battery" }),
      ent("sensor.garden_battery", "50", { device_class: "battery" }),
    ]);
    expect(batteryEntityIds(h, "ws", undefined)).toEqual(["sensor.ws_wh65_battery"]);
    expect(batteryEntityIds(h, "ws", ["sensor.garden_battery"])).toEqual(["sensor.garden_battery"]);
  });
});
