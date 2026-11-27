import type { SectionId } from "../types";
import type { SectionRenderer } from "../view";
import { renderAir } from "./air";
import { renderBattery } from "./battery";
import { renderComfort } from "./comfort";
import { renderConditions } from "./conditions";
import { renderForecast } from "./forecast";
import { renderHealth } from "./health";
import { renderLightning } from "./lightning";
import { renderRain } from "./rain";
import { renderRecords } from "./records";
import { renderSoil } from "./soil";
import { renderStation } from "./station";
import { renderSun } from "./sun";
import { renderWind } from "./wind";

export const SECTION_RENDERERS: Record<SectionId, SectionRenderer> = {
  conditions: renderConditions,
  wind: renderWind,
  rain: renderRain,
  sun: renderSun,
  soil: renderSoil,
  lightning: renderLightning,
  air: renderAir,
  station: renderStation,
  health: renderHealth,
  records: renderRecords,
  comfort: renderComfort,
  forecast: renderForecast,
  battery: renderBattery,
};

export { renderAlerts } from "./alerts";
export { renderChips } from "./chips";
