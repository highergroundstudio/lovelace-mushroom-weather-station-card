import { fmtNum, formatLastRain, num, unitOf } from "../helpers";
import type { SectionRenderer } from "../view";

export const renderLightning: SectionRenderer = (v, ctx) => {
  if (!ctx.showLightning) return "";
  const { t } = v;
  const count = num(ctx.lightningCount?.state);
  const dist = num(ctx.lightningDistance?.state);
  const distSrc = unitOf(ctx.lightningDistance) || "mi";
  const body = `<div class="grid">
    ${v.tile("lightning_count", v.label("lightning_count", t("tile.lightning_count")), ctx.lightningCount, count == null ? "—" : `${fmtNum(count, 0)}`, "mdi:flash", (count ?? 0) > 0 ? "amber" : "grey")}
    ${v.tile("lightning_distance", v.label("lightning_distance", t("tile.lightning_distance")), ctx.lightningDistance, dist == null ? "—" : v.fmt("lightning_distance", ctx.lightningDistance, 0, distSrc), "mdi:map-marker-distance", "orange")}
    ${v.tile("lightning_time", v.label("lightning_time", t("tile.lightning_time")), ctx.lightningTime, formatLastRain(ctx.lightningTime, v.hass, v.locale), "mdi:clock-outline", "amber")}
  </div>`;
  return v.wrapSection("lightning", ctx.compact, body);
};
