import {
  convertValue,
  daysSinceTimestamp,
  esc,
  fmtNum,
  formatLastRain,
  num,
  precipTimelineBars,
  precipTimelineSvg,
  rainMonthProgress,
} from "../helpers";
import type { RenderCtx, SectionRenderer, View } from "../view";

interface SparkItem {
  label: string;
  value: number | null;
}

function totalsSparkline(items: SparkItem[], aria: string): string {
  const vals = items.map((i) => i.value).filter((x): x is number => x != null && x >= 0);
  const max = Math.max(...vals, 0.01);
  const bars = items
    .map((i) => {
      const h = i.value == null ? 2 : Math.max(4, Math.round((i.value / max) * 36));
      const on = i.value != null && i.value > 0;
      return `<div class="bar-col"><div class="bar ${on ? "on" : ""}" style="height:${h}px"></div><div class="bar-lab">${esc(i.label)}</div></div>`;
    })
    .join("");
  return `<div class="spark" role="img" aria-label="${esc(aria)}">${bars}</div>`;
}

function precipTimeline(v: View): string {
  if (!v.wantPrecipTimeline()) return "";
  const hours = v.historyHours();
  const bars = v.precipBars
    || precipTimelineBars(v.history.rain_rate || [], hours, Math.min(36, Math.max(12, hours)));
  if (!bars.length || (!v.precipBars && !(v.history.rain_rate || []).length)) return "";
  const peakRaw = Math.max(...bars.map((b) => b.value), 0);
  const rate = v.conv(v.st("rain_rate"), "in/h");
  const peak = convertValue(peakRaw, rate.src || "in/h", v.config.unit_system || "native");
  const peakFmt = peakRaw > 0 ? `${fmtNum(peak.value, 2)} ${peak.unit}`.trim() : "0";
  const entity = v.config.entities?.rain_rate || "";
  return `<div class="precip-timeline" role="button" tabindex="${entity ? 0 : -1}" aria-label="${esc(v.t("precip.aria", { hours, peak: peakFmt }))}" data-key="rain_rate" data-entity="${esc(entity)}">
    <div class="precip-timeline-top" aria-hidden="true">
      <span>${esc(v.t("precip.title"))}</span>
      <span class="precip-timeline-meta">${esc(v.t("precip.meta", { hours, peak: peakFmt }))}</span>
    </div>
    ${precipTimelineSvg(bars)}
  </div>`;
}

function rainGoal(v: View, ctx: RenderCtx): string {
  const { t } = v;
  // rain_month_normal is in the month sensor's own unit; compare like for like,
  // then convert both for display.
  const normal = num(v.config.rain_month_normal);
  const monthConv = v.conv(ctx.month, "in");
  const progress = rainMonthProgress(monthConv.raw, normal);
  const target = v.config.unit_system || "native";
  const monthVal = monthConv.value;
  const normalVal = normal == null ? null : convertValue(normal, monthConv.src || "in", target).value;
  const daysSince = daysSinceTimestamp(ctx.lastRain?.state);
  const daysText = daysSince == null ? "" : daysSince < 1 ? "<1" : fmtNum(daysSince, 0);
  if (progress.pct != null) {
    const since = daysSince == null
      ? ""
      : ` · ${t(daysSince >= 1.5 ? "rain.since_other" : "rain.since_one", { n: daysText })}`;
    return `<div class="rain-goal">
      <div class="rain-goal-top">
        <span>${esc(t("rain.month_vs_normal"))}</span>
        <span>${fmtNum(monthVal, 2)} / ${fmtNum(normalVal, 2)}</span>
      </div>
      <div class="rain-goal-track" role="progressbar" aria-label="${esc(t("rain.month_vs_normal"))}" aria-valuemin="0" aria-valuemax="100" aria-valuenow="${Math.min(100, progress.pct)}" aria-valuetext="${esc(t("rain.pct_normal", { pct: progress.pct }))}"><div class="rain-goal-fill" style="width:${Math.min(100, progress.pct)}%"></div></div>
      <div class="rain-goal-meta">${esc(t("rain.pct_normal", { pct: progress.pct }) + since)}</div>
    </div>`;
  }
  if (daysSince != null) {
    return `<div class="rain-goal"><div class="rain-goal-top"><span>${esc(t("rain.days_since"))}</span><span>${esc(daysText)}</span></div></div>`;
  }
  return "";
}

export const renderRain: SectionRenderer = (v, ctx) => {
  if (!ctx.showRain) return "";
  const { t } = v;
  // Bars compare totals, so put them in one unit first (sensors may mix mm and in).
  const inInches = (st: typeof ctx.today) => {
    const c = v.conv(st, "in");
    return c.raw == null ? null : convertValue(c.raw, c.src || "in", "imperial").value;
  };
  const totals = {
    today: inInches(ctx.today),
    event: inInches(ctx.event),
    week: inInches(ctx.week),
    month: inInches(ctx.month),
    year: inInches(ctx.year),
  };
  const ariaTotals = t("rain.spark_aria", {
    today: v.fmt("rain_today", ctx.today, 2, "in"),
    event: v.fmt("rain_event", ctx.event, 2, "in"),
    week: v.fmt("rain_week", ctx.week, 2, "in"),
    month: v.fmt("rain_month", ctx.month, 2, "in"),
    year: v.fmt("rain_year", ctx.year, 2, "in"),
  });
  const wet = (n: number | null, on: string) => ((n ?? 0) > 0 ? on : "grey");
  const body = `
    ${rainGoal(v, ctx)}
    ${precipTimeline(v)}
    ${totalsSparkline([
      { label: t("rain.spark_today"), value: totals.today },
      { label: t("rain.spark_event"), value: totals.event },
      { label: t("rain.spark_week"), value: totals.week },
      { label: t("rain.spark_month"), value: totals.month },
      { label: t("rain.spark_year"), value: totals.year },
    ], ariaTotals)}
    <div class="grid">
      ${v.tile("rain_rate", v.label("rain_rate", t("tile.rain_rate")), ctx.rate, ctx.rr.value == null ? "—" : `${fmtNum(ctx.rr.value, 2)} ${esc(v.unitStr("rain_rate", ctx.rate, ctx.rr.unit || ""))}`.trim(), "mdi:weather-rainy", ctx.raining ? "blue" : "grey")}
      ${v.tile("rain_today", v.label("rain_today", t("tile.rain_today")), ctx.today, v.fmt("rain_today", ctx.today, 2, "in"), "mdi:cup-water", wet(totals.today, "cyan"))}
      ${v.tile("rain_event", v.label("rain_event", t("tile.rain_event")), ctx.event, v.fmt("rain_event", ctx.event, 2, "in"), "mdi:weather-pouring", wet(totals.event, "blue"))}
      ${v.tile("rain_week", v.label("rain_week", t("tile.rain_week")), ctx.week, v.fmt("rain_week", ctx.week, 2, "in"), "mdi:calendar-week", wet(totals.week, "blue"))}
      ${v.tile("rain_month", v.label("rain_month", t("tile.rain_month")), ctx.month, v.fmt("rain_month", ctx.month, 2, "in"), "mdi:calendar-month", wet(totals.month, "blue"))}
      ${v.tile("rain_year", v.label("rain_year", t("tile.rain_year")), ctx.year, v.fmt("rain_year", ctx.year, 2, "in"), "mdi:calendar-star", wet(totals.year, "blue"))}
      ${v.tile("last_rain", v.label("last_rain", t("tile.last_rain")), ctx.lastRain, formatLastRain(ctx.lastRain, v.hass, v.locale), "mdi:clock-outline", "blue")}
    </div>`;
  return v.wrapSection("rain", ctx.compact, body);
};
