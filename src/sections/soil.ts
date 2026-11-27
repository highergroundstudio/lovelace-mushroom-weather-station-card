import { fmtNum, num } from "../helpers";
import type { SectionRenderer } from "../view";

export const renderSoil: SectionRenderer = (v, ctx) => {
  if (!ctx.showSoil) return "";
  const { t } = v;
  const parts: string[] = [];
  for (let i = 1; i <= 8; i++) {
    const mKey = `soil_moisture_${i}`;
    const tKey = `soil_temperature_${i}`;
    const mSt = v.st(mKey);
    const tSt = v.st(tKey);
    const moisture = num(mSt?.state);
    const tConv = v.conv(tSt, "°F");
    parts.push(
      v.tile(mKey, v.label(mKey, t("tile.soil_moisture", { n: i })), mSt, moisture == null ? "—" : `${Math.round(moisture)}%`, "mdi:water", v.color(mKey, moisture, "green")),
      v.tile(tKey, v.label(tKey, t("tile.soil_temperature", { n: i })), tSt, tSt && tConv.value != null ? `${fmtNum(tConv.value, 1)}°` : "—", "mdi:thermometer", v.color("temperature", num(tSt?.state), "amber", tConv.src || "°F")),
    );
  }
  const leaf = v.st("leaf_wetness");
  const leafN = num(leaf?.state);
  parts.push(v.tile("leaf_wetness", v.label("leaf_wetness", t("tile.leaf_wetness")), leaf, leafN == null ? "—" : `${Math.round(leafN)}%`, "mdi:leaf", v.color("leaf_wetness", leafN, "cyan")));
  return v.wrapSection("soil", ctx.compact, `<div class="grid">${parts.join("")}</div>`);
};
