export type Layout = "full" | "compact" | "chips";
export type UnitSystem = "native" | "imperial" | "metric";

export type SectionId =
  | "conditions"
  | "wind"
  | "rain"
  | "sun"
  | "soil"
  | "lightning"
  | "air"
  | "station"
  | "forecast"
  | "battery";

export interface ThresholdRule {
  above?: number;
  below?: number;
  color: string;
}

export interface ActionConfig {
  action?: string;
  navigation_path?: string;
  url_path?: string;
  new_tab?: boolean;
  service?: string;
  service_data?: Record<string, unknown>;
  data?: Record<string, unknown>;
}

export interface TileActions {
  tap_action?: ActionConfig;
  hold_action?: ActionConfig;
  double_tap_action?: ActionConfig;
}

export interface WeatherAlert {
  title?: string;
  event?: string;
  description?: string;
  severity?: string;
  urgency?: string;
  sender?: string;
}

export interface CardConfig {
  type?: string;
  name?: string;
  prefix?: string;
  layout?: Layout;
  unit_system?: UnitSystem;
  entities?: Record<string, string>;
  labels?: Record<string, string>;
  units?: Record<string, string>;
  units_source?: Record<string, string>;
  actions?: Record<string, TileActions>;
  thresholds?: Record<string, ThresholdRule[]>;
  section_order?: SectionId[];
  show_empty?: boolean;
  show_forecast?: boolean;
  show_hourly_forecast?: boolean;
  show_updated?: boolean;
  show_beaufort?: boolean;
  show_history_sparklines?: boolean;
  show_wind_rose?: boolean;
  show_alerts?: boolean;
  tablet_mode?: boolean;
  weather_entity?: string;
  alert_entity?: string;
  sun_entity?: string;
  moon_entity?: string;
  forecast_days?: number;
  hourly_forecast_hours?: number;
  history_hours?: number;
  stale_minutes?: number;
  battery_warning_threshold?: number | string;
  rain_month_normal?: number | string;
  uv_purple_above?: number | string;
  temp_blue_below?: number | string;
  hide_conditions?: boolean;
  hide_wind?: boolean;
  hide_rain?: boolean;
  hide_sun?: boolean;
  hide_soil?: boolean;
  hide_lightning?: boolean;
  hide_air?: boolean;
  hide_more?: boolean;
  hide_battery?: boolean;
}

export interface HassEntity {
  entity_id: string;
  state: string;
  last_updated?: string;
  last_changed?: string;
  attributes: Record<string, unknown> & {
    unit_of_measurement?: string;
    friendly_name?: string;
    device_class?: string;
    forecast?: ForecastItem[];
    temperature_unit?: string;
    alerts?: WeatherAlert[];
    next_rising?: string;
    next_setting?: string;
    rising?: string;
    setting?: string;
  };
}

export interface ForecastItem {
  datetime?: string;
  condition?: string;
  temperature?: number;
  templow?: number;
  precipitation_probability?: number;
  precipitation?: number;
  wind_speed?: number;
}

/** @deprecated Use ForecastItem */
export type ForecastDay = ForecastItem;

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language?: string };
  themes?: { darkMode?: boolean };
  callService: (domain: string, service: string, data?: Record<string, unknown>) => void;
  callApi?: <T = unknown>(method: string, path: string, data?: unknown) => Promise<T>;
  connection?: {
    subscribeMessage?: (
      callback: (ev: { forecast?: ForecastItem[] }) => void,
      msg: Record<string, unknown>,
    ) => Promise<() => void>;
    sendMessagePromise?: (msg: Record<string, unknown>) => Promise<{
      response?: Record<string, { forecast?: ForecastItem[] }>;
      [key: string]: unknown;
    }>;
  };
}

export interface ConvertedValue {
  raw: number | null;
  value: number | null;
  unit: string;
  src: string;
}

export interface HistoryPoint {
  state: number;
  last_changed: number;
}

export interface WindRoseBin {
  label: string;
  deg: number;
  count: number;
  share: number;
}
