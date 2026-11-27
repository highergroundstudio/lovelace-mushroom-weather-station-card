import { WEATHER_ICONS } from "../const";
import { convertValue, entityState, esc } from "../helpers";
import type { ForecastItem } from "../types";
import type { SectionRenderer, View } from "../view";

function item(
  v: View,
  cls: "fhour" | "fday",
  id: string,
  when: string,
  f: ForecastItem,
  tempUnit: string,
): string {
  const target = v.config.unit_system || "native";
  const hi = f.temperature != null ? convertValue(f.temperature, tempUnit, target) : null;
  const lo = cls === "fday" && f.templow != null ? convertValue(f.templow, tempUnit, target) : null;
  const icon = WEATHER_ICONS[f.condition || ""] || "mdi:weather-partly-cloudy";
  const pop = f.precipitation_probability != null ? Math.round(Number(f.precipitation_probability)) : null;
  const tempText = `${hi?.value != null ? Math.round(hi.value) : "—"}°${lo?.value != null ? ` / ${Math.round(lo.value)}°` : ""}`;
  const aria = v.t("forecast.item_aria", { when, temp: tempText, pop: pop != null ? `${pop}%` : "—" });
  return `<div class="${cls}" role="button" tabindex="0" aria-label="${esc(aria)}" data-key="forecast" data-entity="${esc(id)}" data-morph-key="${cls}-${esc(f.datetime || when)}">
    <div class="${cls}-name" aria-hidden="true">${esc(when)}</div>
    <ha-icon icon="${icon}" aria-hidden="true"></ha-icon>
    <div class="${cls}-temp" aria-hidden="true">${tempText}</div>
    ${pop != null ? `<div class="${cls}-pop" aria-hidden="true">${pop}%</div>` : ""}
  </div>`;
}

function hourly(v: View): string {
  if (!v.wantHourly()) return "";
  const id = v.config.weather_entity;
  if (!id) return "";
  const wanted = Math.min(24, Math.max(6, Number(v.config.hourly_forecast_hours) || 24));
  const hours = (v.forecastHours || []).slice(0, wanted);
  if (!hours.length) {
    // Entity present but nothing yet (or hourly unsupported): say so instead of vanishing.
    return entityState(v.hass, id)
      ? `<div class="hint">${esc(v.t("forecast.waiting_hourly", { id }))}</div>`
      : "";
  }
  const tempUnit = entityState(v.hass, id)?.attributes?.temperature_unit || "";
  return `<div class="forecast hourly" role="group" aria-label="${esc(v.t("forecast.hourly_region"))}">
    ${hours
      .map((h) => {
        const d = h.datetime ? new Date(h.datetime) : null;
        const label = d && !Number.isNaN(d.getTime()) ? d.toLocaleTimeString(v.locale, { hour: "numeric" }) : "—";
        return item(v, "fhour", id, label, h, tempUnit);
      })
      .join("")}
  </div>`;
}

export const renderForecast: SectionRenderer = (v, ctx) => {
  const showDaily = !!v.config.show_forecast;
  // Explicit hourly enable still shows the section (hint) even without a weather entity.
  const hourlyExplicit = v.config.show_hourly_forecast === true;
  if (!showDaily && !v.wantHourly() && !hourlyExplicit) return "";
  const { t } = v;
  const hourlyHtml = hourly(v);
  const id = v.config.weather_entity;
  let body: string;
  if (!id) {
    body = `${hourlyHtml}<div class="hint">${esc(t("forecast.pick_entity"))}</div>`;
  } else {
    const st = entityState(v.hass, id);
    if (!st) {
      body = `${hourlyHtml}<div class="hint">${esc(t("forecast.missing", { id }))}</div>`;
    } else {
      let daily = "";
      if (showDaily) {
        const wanted = Math.min(7, Math.max(1, Number(v.config.forecast_days) || 5));
        const days = (v.forecastDays.length ? v.forecastDays : st.attributes.forecast || []).slice(0, wanted);
        if (!days.length) {
          daily = `<div class="hint">${esc(t("forecast.waiting", { id }))}</div>`;
        } else {
          const tempUnit = st.attributes.temperature_unit || "";
          daily = `<div class="forecast" role="group" aria-label="${esc(t("forecast.daily_region"))}">
            ${days
              .map((d) => {
                const when = d.datetime ? new Date(d.datetime) : null;
                const label = when && !Number.isNaN(when.getTime())
                  ? when.toLocaleDateString(v.locale, { weekday: "short" })
                  : "—";
                return item(v, "fday", id, label, d, tempUnit);
              })
              .join("")}
          </div>`;
        }
      }
      body = `${hourlyHtml}${daily}`;
    }
  }
  return v.wrapSection("forecast", ctx.compact, body);
};
