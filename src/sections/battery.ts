import { esc } from "../helpers";
import type { TranslationKey } from "../i18n";
import type { SectionRenderer } from "../view";

export const renderBattery: SectionRenderer = (v, ctx) => {
  if (!ctx.showBattery || !ctx.batt || !ctx.battery) return "";
  const text = v.t(ctx.batt.key as TranslationKey, { pct: ctx.batt.pct });
  const body = `<div class="battery ${ctx.batt.low ? "warn" : "ok"}" role="button" tabindex="0" data-key="battery" data-entity="${esc(ctx.battery.entity_id)}">
    <ha-icon icon="${ctx.batt.icon}" aria-hidden="true"></ha-icon>
    ${esc(v.label("battery", text))}
  </div>`;
  return v.wrapSection("battery", true, body);
};
