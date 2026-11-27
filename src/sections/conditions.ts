import { esc, fmtNum } from "../helpers";
import type { SectionRenderer } from "../view";

export const renderConditions: SectionRenderer = (v, ctx) => {
  if (!ctx.showConditions) return "";
  const { t } = v;
  const deg = ctx.tempUnit.includes("°") ? ctx.tempUnit : "°";
  const body = `<div class="grid">
    ${v.tile("temperature", v.label("temperature", t("tile.temperature")), ctx.temp, ctx.t.value == null ? "—" : `${fmtNum(ctx.t.value, 1)}${deg}`, "mdi:thermometer", ctx.tColor, v.histSpark("temperature"))}
    ${v.tile("feels_like", v.label("feels_like", t("tile.feels_like")), ctx.feels, ctx.f.value == null ? "—" : `${fmtNum(ctx.f.value, 1)}°`, "mdi:sun-thermometer-outline", v.color("feels_like", ctx.f.raw, ctx.tColor, ctx.f.src), "", { derived: ctx.feelsDerived })}
    ${v.tile("temp_high", v.label("temp_high", t("tile.temp_high")), ctx.high, ctx.hi.value == null ? "—" : `${Math.round(ctx.hi.value)}°`, "mdi:thermometer-high", "orange")}
    ${v.tile("temp_low", v.label("temp_low", t("tile.temp_low")), ctx.low, ctx.lo.value == null ? "—" : `${Math.round(ctx.lo.value)}°`, "mdi:thermometer-low", "blue")}
    ${v.tile("humidity", v.label("humidity", t("tile.humidity")), ctx.humidity, ctx.h == null ? "—" : `${Math.round(ctx.h)}${esc(v.unitStr("humidity", ctx.humidity, "%"))}`, "mdi:water-percent", v.color("humidity", ctx.h, "blue"), v.histSpark("humidity"))}
    ${v.tile("dew_point", v.label("dew_point", t("tile.dew_point")), ctx.dew, ctx.d.value == null ? "—" : `${fmtNum(ctx.d.value, 1)}°`, "mdi:molecule", v.color("dew_point", ctx.d.raw, "blue", ctx.d.src), "", { derived: ctx.dewDerived })}
  </div>`;
  return v.wrapSection("conditions", ctx.compact, body);
};
