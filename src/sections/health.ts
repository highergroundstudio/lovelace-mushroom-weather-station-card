import { esc, fmtNum, num, relativeTime, unitOf } from "../helpers";
import { batteryList, healthReport } from "../health";
import type { SectionRenderer } from "../view";

export const renderHealth: SectionRenderer = (v, ctx) => {
  if (!ctx.showHealth || !v.hass) return "";
  const { t } = v;
  const report = healthReport(v.hass, v.config.entities, {
    prefix: v.config.prefix,
    staleMinutes: Number.isFinite(Number(v.config.stale_minutes)) ? Number(v.config.stale_minutes) : 30,
    batteryEntities: batteryList(v.config.battery_entities),
    batteryThreshold: v.config.battery_warning_threshold,
  });
  const signal = ctx.signal;
  const problems = report.offline.length + report.stale.length;
  // Nothing useful to say: no batteries, no signal, and everything reporting.
  if (!report.batteries.length && !signal && !problems) return "";
  if (!report.total && !report.batteries.length && !signal) return "";

  const ok = problems === 0;
  // Without last_reported we only know a sensor is available, not that it reports.
  const summary = report.freshnessKnown
    ? ok
      ? t("health.all_ok", { total: report.total })
      : t("health.reporting", { ok: report.ok, total: report.total })
    : ok
      ? t("health.all_online", { total: report.total })
      : t("health.online", { ok: report.ok, total: report.total });

  const issues = [
    ...report.offline.map((s) => ({ ...s, note: t("health.offline"), icon: "mdi:lan-disconnect", cls: "bad" })),
    ...report.stale.map((s) => ({
      ...s,
      note: t("health.stale", { when: relativeTime(new Date(Date.now() - (s.ageMs || 0)), v.locale) }),
      icon: "mdi:clock-alert-outline",
      cls: "warn",
    })),
  ];

  const issueHtml = issues.length
    ? `<ul class="health-list" aria-label="${esc(t("health.offline"))}">${issues
      .map((s) => `<li><button class="health-row ${s.cls}" data-key="${esc(s.key)}" data-entity="${esc(s.entityId)}">
          <ha-icon icon="${s.icon}" aria-hidden="true"></ha-icon>
          <span class="health-name">${esc(s.name)}</span>
          <span class="health-note">${esc(s.note)}</span>
        </button></li>`)
      .join("")}</ul>`
    : "";

  const battHtml = report.batteries.length
    ? `<div class="health-sub">${esc(t("health.batteries"))}</div>
      <ul class="health-batteries">${report.batteries
        .map((b) => {
          const value = !b.known
            ? t("health.battery_unknown")
            : b.level != null
              ? `${Math.round(b.level)}%`
              : b.low ? t("health.battery_low") : t("health.battery_ok");
          return `<li><button class="health-batt ${b.low ? "low" : ""}" data-key="battery_${esc(b.entityId)}" data-entity="${esc(b.entityId)}" aria-label="${esc(`${b.name}: ${value}${b.low && b.level != null ? ` (${t("health.battery_low")})` : ""}`)}">
            <ha-icon icon="${b.icon}" aria-hidden="true"></ha-icon>
            <span class="health-name">${esc(b.name)}</span>
            <span class="health-note">${esc(value)}</span>
          </button></li>`;
        })
        .join("")}</ul>`
    : "";

  const sigVal = num(signal?.state);
  const signalTile = signal
    ? `<div class="grid">${v.tile("signal_strength", v.label("signal_strength", t("tile.signal_strength")), signal, sigVal == null ? "—" : `${fmtNum(sigVal, 0)} ${esc(v.unitStr("signal_strength", signal, unitOf(signal)))}`.trim(), "mdi:wifi", "teal")}</div>`
    : "";

  const body = `<div class="health-summary ${ok ? "ok" : "warn"}" role="status">
      <ha-icon icon="${ok ? "mdi:check-network-outline" : "mdi:alert-network-outline"}" aria-hidden="true"></ha-icon>
      <span>${esc(summary)}</span>
    </div>
    ${issueHtml}
    ${signalTile}
    ${battHtml}`;
  return v.wrapSection("health", ctx.compact, body);
};
