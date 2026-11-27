/**
 * The contract between the card element and the section renderers in
 * `src/sections/`. Sections are pure string templates: they read from the
 * view and the per-render context, and never touch the DOM.
 */
import type { MetaLabel, batteryInfo, moonMeta, pressureTrendMeta } from "./helpers";
import type { Translate } from "./i18n";
import type {
  CardConfig,
  ComfortStats,
  ConvertedValue,
  ForecastItem,
  HassEntity,
  HistoryPoint,
  HomeAssistant,
  PrecipBar,
  RecordBook,
  SectionId,
} from "./types";

export type Conv = ConvertedValue;

export interface TileOptions {
  /** Value was calculated by the card rather than reported by a sensor. */
  derived?: boolean;
}

export interface View {
  readonly config: CardConfig;
  readonly hass: HomeAssistant | undefined;
  readonly t: Translate;
  /** BCP-47 language used for dates and numbers. */
  readonly locale: string;

  st(key: string): HassEntity | null;
  label(key: string, fallback: string): string;
  conv(st: HassEntity | null | undefined, fallbackUnit?: string): Conv;
  unitStr(key: string, st: HassEntity | null | undefined, fallback?: string): string;
  fmt(key: string, st: HassEntity | null | undefined, digits: number, fallbackUnit?: string): string;
  color(key: string, value: number | null, fallback?: string, unit?: string): string;
  tile(
    key: string,
    label: string,
    st: HassEntity | null,
    value: string,
    icon: string,
    color: string,
    spark?: string,
    opts?: TileOptions,
  ): string;
  histSpark(key: string): string;
  wrapSection(id: SectionId, compact: boolean, body: string): string;
  /** Translate a helper meta label (falls back to its English text). */
  meta(m: Pick<MetaLabel, "key" | "label">): string;

  historyHours(): number;
  wantHourly(): boolean;
  wantRecords(): boolean;
  wantComfort(): boolean;
  wantPrecipTimeline(): boolean;

  readonly history: Record<string, HistoryPoint[]>;
  readonly precipBars: PrecipBar[] | null;
  readonly comfortTemp: HistoryPoint[];
  readonly comfortHum: HistoryPoint[];
  readonly historyWindow: { start: number; end: number } | null;
  readonly recordsBook: RecordBook | null;
  readonly recordsSource: "statistics" | "history" | null;
  readonly forecastDays: ForecastItem[];
  readonly forecastHours: ForecastItem[];
}

export type ComfortResult = ComfortStats;

export interface RenderCtx {
  compact: boolean;
  showConditions: boolean;
  showWind: boolean;
  showRain: boolean;
  showSun: boolean;
  showSoil: boolean;
  showLightning: boolean;
  showAir: boolean;
  showMore: boolean;
  showHealth: boolean;
  showBattery: boolean;
  temp: HassEntity | null;
  feels: HassEntity | null;
  feelsDerived: boolean;
  humidity: HassEntity | null;
  dew: HassEntity | null;
  dewDerived: boolean;
  high: HassEntity | null;
  low: HassEntity | null;
  wind: HassEntity | null;
  gust: HassEntity | null;
  maxGust: HassEntity | null;
  wdir: HassEntity | null;
  rate: HassEntity | null;
  today: HassEntity | null;
  event: HassEntity | null;
  week: HassEntity | null;
  month: HassEntity | null;
  year: HassEntity | null;
  lastRain: HassEntity | null;
  uv: HassEntity | null;
  irr: HassEntity | null;
  lux: HassEntity | null;
  pressure: HassEntity | null;
  pressureAbs: HassEntity | null;
  indoorT: HassEntity | null;
  indoorH: HassEntity | null;
  co2: HassEntity | null;
  pm25: HassEntity | null;
  aqi: HassEntity | null;
  voc: HassEntity | null;
  noise: HassEntity | null;
  lightningCount: HassEntity | null;
  lightningDistance: HassEntity | null;
  lightningTime: HassEntity | null;
  signal: HassEntity | null;
  battery: HassEntity | null;
  batt: ReturnType<typeof batteryInfo>;
  sun: HassEntity | null;
  moon: HassEntity | null;
  sunrise: string;
  sunset: string;
  moonMeta: ReturnType<typeof moonMeta>;
  t: Conv;
  f: Conv;
  hi: Conv;
  lo: Conv;
  h: number | null;
  d: Conv;
  ws: Conv;
  wg: Conv;
  deg: number | null;
  card: string | null;
  rr: Conv;
  uvn: number | null;
  raining: boolean;
  tColor: string;
  uvm: MetaLabel;
  pm: number | null;
  pmm: MetaLabel;
  aqiVal: number | null;
  aqim: MetaLabel;
  trend: ReturnType<typeof pressureTrendMeta>;
  bf: number | null;
  tempUnit: string;
}

export type SectionRenderer = (v: View, ctx: RenderCtx) => string;
