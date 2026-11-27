import { esc, fmtNum, num, unitOf } from "../helpers";
import type { SectionRenderer } from "../view";

export const renderAir: SectionRenderer = (v, ctx) => {
  if (!ctx.showAir) return "";
  const { t } = v;
  const voc = num(ctx.voc?.state);
  const noise = num(ctx.noise?.state);
  const body = `<div class="grid">
    ${v.tile("pm25", v.label("pm25", ctx.pm == null ? t("tile.pm25") : v.meta(ctx.pmm)), ctx.pm25, ctx.pm == null ? "—" : `${fmtNum(ctx.pm, 0)} ${esc(v.unitStr("pm25", ctx.pm25, unitOf(ctx.pm25) || "µg/m³"))}`, "mdi:air-filter", ctx.pmm.color)}
    ${v.tile("aqi", v.label("aqi", ctx.aqiVal == null ? t("tile.aqi") : v.meta(ctx.aqim)), ctx.aqi, ctx.aqiVal == null ? "—" : `${fmtNum(ctx.aqiVal, 0)}`, "mdi:air-purifier", ctx.aqim.color)}
    ${v.tile("voc", v.label("voc", t("tile.voc")), ctx.voc, voc == null ? "—" : `${fmtNum(voc, 0)} ${esc(v.unitStr("voc", ctx.voc, unitOf(ctx.voc) || "ppb"))}`, "mdi:chemical-weapon", v.color("voc", voc, "green"))}
    ${v.tile("noise", v.label("noise", t("tile.noise")), ctx.noise, noise == null ? "—" : `${fmtNum(noise, 0)} ${esc(v.unitStr("noise", ctx.noise, unitOf(ctx.noise) || "dB"))}`, "mdi:volume-high", v.color("noise", noise, "green"))}
  </div>`;
  return v.wrapSection("air", ctx.compact, body);
};
