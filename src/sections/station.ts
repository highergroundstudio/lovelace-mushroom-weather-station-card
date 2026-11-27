import { esc, fmtNum, num, unitOf } from "../helpers";
import type { SectionRenderer } from "../view";

export const renderStation: SectionRenderer = (v, ctx) => {
  if (!ctx.showMore) return "";
  const { t } = v;
  const pressureLabel = ctx.trend.key ? t("tile.pressure_trend", { trend: v.meta(ctx.trend) }) : t("tile.pressure");
  const indoorT = v.conv(ctx.indoorT, "°F");
  const indoorH = num(ctx.indoorH?.state);
  const co2 = num(ctx.co2?.state);
  // inHg needs two decimals; hPa/mbar read better with one.
  const pDigits = (st: typeof ctx.pressure) => (/inhg/i.test(v.conv(st, "inHg").unit) ? 2 : 1);
  const body = `<div class="grid">
    ${v.tile("pressure", v.label("pressure", pressureLabel), ctx.pressure, v.fmt("pressure", ctx.pressure, pDigits(ctx.pressure), unitOf(ctx.pressure) || "inHg"), ctx.trend.icon || "mdi:gauge", ctx.trend.color === "grey" ? "teal" : ctx.trend.color, v.histSpark("pressure"))}
    ${v.tile("pressure_abs", v.label("pressure_abs", t("tile.pressure_abs")), ctx.pressureAbs, v.fmt("pressure_abs", ctx.pressureAbs, pDigits(ctx.pressureAbs), unitOf(ctx.pressureAbs) || "inHg"), "mdi:gauge", "teal")}
    ${v.tile("indoor_temperature", v.label("indoor_temperature", t("tile.indoor_temperature")), ctx.indoorT, ctx.indoorT && indoorT.value != null ? `${fmtNum(indoorT.value, 1)}°` : "—", "mdi:home-thermometer", v.color("temperature", num(ctx.indoorT?.state), "green", indoorT.src || "°F"))}
    ${v.tile("indoor_humidity", v.label("indoor_humidity", t("tile.indoor_humidity")), ctx.indoorH, indoorH == null ? "—" : `${Math.round(indoorH)}%`, "mdi:water-percent", v.color("humidity", indoorH, "cyan"))}
    ${v.tile("co2", v.label("co2", t("tile.co2")), ctx.co2, co2 == null ? "—" : `${fmtNum(co2, 0)} ${esc(v.unitStr("co2", ctx.co2, "ppm"))}`, "mdi:molecule-co2", v.color("co2", co2, "green"))}
  </div>`;
  return v.wrapSection("station", ctx.compact, body);
};
