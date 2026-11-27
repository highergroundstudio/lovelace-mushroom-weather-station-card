import { alertSeverityColor, collectAlerts, entityState, esc, iconColorVar } from "../helpers";
import type { View } from "../view";

export function renderAlerts(v: View): string {
  if (v.config.show_alerts === false) return "";
  const weather = entityState(v.hass, v.config.weather_entity);
  const alertEnt = entityState(v.hass, v.config.alert_entity);
  const alerts = collectAlerts(weather, alertEnt).slice(0, 3);
  if (!alerts.length) return "";
  const entityId = v.config.alert_entity || v.config.weather_entity || "";
  return `<div class="alerts" role="region" aria-label="${esc(v.t("alerts.region"))}">${alerts
    .map((a, i) => {
      const sev = alertSeverityColor(a.severity);
      const title = a.title || a.event || v.t("alerts.default");
      const desc = a.description || "";
      return `<button class="alert sev-${sev}" data-key="alert" data-entity="${esc(entityId)}" data-morph-key="alert-${i}-${esc(title)}">
        <ha-icon icon="mdi:alert" style="color:${iconColorVar(sev)}" aria-hidden="true"></ha-icon>
        <div>
          <div class="alert-title">${esc(title)}</div>
          ${desc ? `<div class="alert-desc">${esc(desc)}</div>` : ""}
        </div>
      </button>`;
    })
    .join("")}</div>`;
}
