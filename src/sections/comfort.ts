import {
  comfortBandFromConfig,
  comfortScatterSvg,
  comfortStats,
  convertValue,
  esc,
  fmtNum,
  thresholdCompareValue,
} from "../helpers";
import type { HistoryPoint } from "../types";
import type { SectionRenderer } from "../view";

export const renderComfort: SectionRenderer = (v, ctx) => {
  if (!v.wantComfort()) return "";
  const { t } = v;
  const band = comfortBandFromConfig(v.config);
  // Pair from the full comfort series (not spark-thinned history).
  const src = v.conv(v.st("temperature"), "°F").src || "°F";
  const tempPts = (v.comfortTemp.length ? v.comfortTemp : v.history.temperature || [])
    .map((p) => {
      if (p.unavailable) return { state: Number.NaN, last_changed: p.last_changed, unavailable: true };
      const cmp = thresholdCompareValue(p.state, src);
      return cmp == null ? null : { state: cmp, last_changed: p.last_changed };
    })
    .filter((p): p is HistoryPoint => !!p);
  const humPts = v.comfortHum.length ? v.comfortHum : v.history.humidity || [];
  const win = v.historyWindow || {
    start: Date.now() - v.historyHours() * 3600_000,
    end: Date.now(),
  };
  const stats = comfortStats(tempPts, humPts, band, win);
  // Duration can be valid even when there are no scatter samples.
  if (!stats.samples.length && !(stats.hoursTotal > 0)) {
    return v.wrapSection("comfort", ctx.compact, `<div class="hint">${esc(t("comfort.empty"))}</div>`);
  }
  const target = v.config.unit_system || "native";
  const lo = convertValue(band.tempMin, "°F", target);
  const hi = convertValue(band.tempMax, "°F", target);
  const bandLabel = `${lo.value == null ? "—" : Math.round(lo.value)}–${hi.value == null ? "—" : Math.round(hi.value)}${lo.unit || "°"} · ${band.humidityMin}–${band.humidityMax}% RH`;
  const pct = stats.pct == null ? "—" : `${stats.pct}%`;
  const fill = stats.pct == null ? 0 : Math.min(100, stats.pct);
  const body = `<div class="comfort-panel">
    <div class="comfort-top">
      <div class="comfort-title">${esc(t("comfort.title"))}</div>
      <div class="comfort-pct">${esc(pct)}</div>
    </div>
    <div class="comfort-track" role="progressbar" aria-label="${esc(t("comfort.title"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${fill}"><div class="comfort-fill" style="width:${fill}%"></div></div>
    <div class="comfort-meta">${esc(t("comfort.meta", { in: fmtNum(stats.hoursIn, 1), total: fmtNum(stats.hoursTotal, 1), band: bandLabel }))}</div>
    <div role="img" aria-label="${esc(t("comfort.aria", { pct }))}">${comfortScatterSvg(stats.samples, band)}</div>
    <div class="comfort-axes" aria-hidden="true"><span>${esc(t("comfort.cooler"))}</span><span>${esc(t("comfort.temp_axis"))}</span><span>${esc(t("comfort.warmer"))}</span></div>
  </div>`;
  return v.wrapSection("comfort", ctx.compact, body);
};
