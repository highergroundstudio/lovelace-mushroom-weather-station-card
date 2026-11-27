import { esc, fmtNum, num, unitOf } from "../helpers";
import type { SectionRenderer } from "../view";

export const renderSun: SectionRenderer = (v, ctx) => {
  if (!ctx.showSun) return "";
  const { t } = v;
  const moonLabel = v.meta(ctx.moonMeta);
  const body = `<div class="grid">
    ${v.tile("uv", v.label("uv", ctx.uvn == null ? t("tile.uv") : v.meta(ctx.uvm)), ctx.uv, ctx.uvn == null ? "—" : `${fmtNum(ctx.uvn, 0)}`, "mdi:weather-sunny-alert", ctx.uvm.color)}
    ${v.tile("irradiance", v.label("irradiance", t("tile.irradiance")), ctx.irr, num(ctx.irr?.state) == null ? "—" : `${fmtNum(num(ctx.irr?.state), 0)} ${esc(v.unitStr("irradiance", ctx.irr, unitOf(ctx.irr)))}`.trim(), "mdi:solar-power-variant", "amber")}
    ${v.tile("illuminance", v.label("illuminance", t("tile.illuminance")), ctx.lux, num(ctx.lux?.state) == null ? "—" : `${fmtNum(num(ctx.lux?.state), 0)} ${esc(v.unitStr("illuminance", ctx.lux, "lx"))}`, "mdi:brightness-5", "amber")}
    ${ctx.sunrise ? v.tile("sunrise", t("tile.sunrise"), ctx.sun, ctx.sunrise, "mdi:weather-sunset-up", "amber") : ""}
    ${ctx.sunset ? v.tile("sunset", t("tile.sunset"), ctx.sun, ctx.sunset, "mdi:weather-sunset-down", "orange") : ""}
    ${ctx.moon ? v.tile("moon", t("moon.label"), ctx.moon, moonLabel, ctx.moonMeta.icon, "purple") : ""}
  </div>`;
  return v.wrapSection("sun", ctx.compact, body);
};
