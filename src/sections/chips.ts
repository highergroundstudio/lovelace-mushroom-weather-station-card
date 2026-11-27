import { esc, fmtNum, num } from "../helpers";
import type { HassEntity } from "../types";
import type { RenderCtx, View } from "../view";

type ChipItem = { key: string; st: HassEntity; icon: string; text: string; label: string; derived?: boolean };

export function renderChips(v: View, ctx: RenderCtx, expanded: boolean): string {
  const { t } = v;
  const h = num(ctx.humidity?.state);
  const uv = num(ctx.uv?.state);
  const primary = ([
    { key: "temperature", st: ctx.temp, icon: "mdi:thermometer", text: ctx.t.value == null ? "—" : `${Math.round(ctx.t.value)}°`, label: t("tile.temperature") },
    { key: "feels_like", st: ctx.feels, icon: "mdi:sun-thermometer", text: ctx.f.value == null ? "—" : `${Math.round(ctx.f.value)}°`, label: ctx.feelsDerived ? t("derived.suffix", { label: t("tile.feels_like") }) : t("tile.feels_like"), derived: ctx.feelsDerived },
    { key: "humidity", st: ctx.humidity, icon: "mdi:water-percent", text: h == null ? "—" : `${Math.round(h)}%`, label: t("tile.humidity") },
    { key: "rain_today", st: ctx.today, icon: ctx.raining ? "mdi:weather-pouring" : "mdi:weather-rainy", text: v.fmt("rain_today", ctx.today, 2, "in"), label: t("tile.rain_today") },
    { key: "wind_speed", st: ctx.wind, icon: "mdi:weather-windy", text: v.fmt("wind_speed", ctx.wind, 0, "mph"), label: t("tile.wind_speed") },
  ] as Array<Omit<ChipItem, "st"> & { st: HassEntity | null }>).filter((c): c is ChipItem => !!c.st);
  const extra = ([
    { key: "pressure", st: ctx.pressure, icon: "mdi:gauge", text: v.fmt("pressure", ctx.pressure, 2, "inHg"), label: t("tile.pressure") },
    { key: "uv", st: ctx.uv, icon: "mdi:weather-sunny-alert", text: uv == null ? "—" : `${fmtNum(uv, 0)} UV`, label: t("tile.uv") },
    { key: "wind_gust", st: ctx.gust, icon: "mdi:windsock", text: v.fmt("wind_gust", ctx.gust, 0, "mph"), label: t("tile.wind_gust") },
  ] as Array<Omit<ChipItem, "st"> & { st: HassEntity | null }>).filter((c): c is ChipItem => !!c.st);
  const chip = (c: ChipItem) =>
    `<button class="chip" data-key="${c.key}" data-entity="${esc(c.st.entity_id)}"${c.derived ? ` data-derived="1" title="${esc(t("derived.title"))}"` : ""} aria-label="${esc(`${v.label(c.key, c.label)}: ${c.text}`)}"><ha-icon icon="${c.icon}" aria-hidden="true"></ha-icon><span aria-hidden="true">${esc(c.text)}</span></button>`;
  const toggle = expanded ? t("chips.less") : t("chips.more");
  return `<div class="chips-bar ${expanded ? "expanded" : ""}" role="group" aria-label="${esc(t("chips.region"))}">
    <div class="chips">
      ${primary.map(chip).join("")}
      ${extra.length ? `<button class="chip expand" data-key="__chips_expand" data-entity="" aria-expanded="${expanded}" aria-controls="chips-extra"><ha-icon icon="mdi:chevron-down" aria-hidden="true"></ha-icon><span>${esc(toggle)}</span></button>` : ""}
    </div>
    ${extra.length ? `<div class="chips-extra" id="chips-extra" ${expanded ? "" : "hidden"}>${extra.map(chip).join("")}</div>` : ""}
  </div>`;
}
