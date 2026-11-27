import { esc, fmtNum, iconColorVar, num, windRoseBins, windRoseSvg } from "../helpers";
import type { SectionRenderer, View } from "../view";

function compass(v: View, deg: number | null, card: string | null): string {
  const valid = Number.isFinite(deg as number);
  const angle = valid ? (deg as number) : 0;
  const entity = v.st("wind_direction")?.entity_id || "";
  const aria = valid
    ? v.t("wind.compass_aria", { dir: card || "—", deg: Math.round(deg as number) })
    : v.t("wind.compass_none");
  return `
    <div class="compass" role="button" tabindex="${entity ? 0 : -1}" aria-label="${esc(aria)}" data-key="wind_direction" data-entity="${esc(entity)}">
      <svg viewBox="0 0 100 100" class="compass-svg ${valid ? "" : "muted"}" aria-hidden="true" focusable="false">
        <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" stroke-opacity="0.16" stroke-width="2"/>
        <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" stroke-opacity="0.08" stroke-width="1"/>
        <circle cx="50" cy="50" r="3" fill="currentColor"/>
        <text x="50" y="16" text-anchor="middle" font-size="9" fill="currentColor">N</text>
        <text x="50" y="94" text-anchor="middle" font-size="9" fill="currentColor">S</text>
        <text x="10" y="54" text-anchor="middle" font-size="9" fill="currentColor">W</text>
        <text x="90" y="54" text-anchor="middle" font-size="9" fill="currentColor">E</text>
        <g class="compass-needle" style="transform: rotate(${angle}deg)">
          <polygon points="50,12 55,48 50,42 45,48" fill="${iconColorVar("teal")}"/>
        </g>
      </svg>
      <div class="compass-label" aria-hidden="true">${esc(card || "—")} ${valid ? `${Math.round(deg as number)}°` : ""}</div>
    </div>
  `;
}

export const renderWind: SectionRenderer = (v, ctx) => {
  if (!ctx.showWind) return "";
  const { t } = v;
  const rosePts = v.history.wind_direction || [];
  let rose = "";
  if (v.config.show_wind_rose !== false && rosePts.length) {
    const bins = windRoseBins(rosePts.map((p) => p.state));
    const top = bins.reduce((a, b) => (b.count > a.count ? b : a), bins[0]);
    const hours = v.historyHours();
    rose = `<div class="wind-rose" role="button" tabindex="0" aria-label="${esc(t("wind.rose_aria", { hours, dir: top?.label || "—" }))}" data-key="wind_direction" data-entity="${esc(ctx.wdir?.entity_id || "")}">
      ${windRoseSvg(bins)}
      <div class="wind-rose-label" aria-hidden="true">${esc(t("wind.rose", { hours }))}</div>
    </div>`;
  }
  const speedLabel = ctx.bf != null ? t("tile.wind_speed_bf", { n: ctx.bf }) : t("tile.wind_speed");
  const body = `<div class="wind-row ${rose ? "with-rose" : ""}">
    ${compass(v, ctx.deg, ctx.card)}
    ${rose}
    <div class="grid wind-grid">
      ${v.tile("wind_speed", v.label("wind_speed", speedLabel), ctx.wind, ctx.ws.value == null ? "—" : `${fmtNum(ctx.ws.value, 1)} ${esc(v.unitStr("wind_speed", ctx.wind, ctx.ws.unit || "mph"))}`, "mdi:weather-windy", v.color("wind_speed", ctx.ws.raw, "teal", ctx.ws.src || "mph"), v.histSpark("wind_speed"))}
      ${v.tile("wind_gust", v.label("wind_gust", t("tile.wind_gust")), ctx.gust, ctx.wg.value == null ? "—" : `${fmtNum(ctx.wg.value, 1)}`, "mdi:windsock", v.color("wind_gust", ctx.wg.raw, "teal", ctx.wg.src || "mph"))}
      ${v.tile("max_gust", v.label("max_gust", t("tile.max_gust")), ctx.maxGust, num(ctx.maxGust?.state) == null ? "—" : v.fmt("max_gust", ctx.maxGust, 1, "mph"), "mdi:weather-windy-variant", "teal")}
    </div>
  </div>`;
  return v.wrapSection("wind", ctx.compact, body);
};
