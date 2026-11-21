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
  show_updated?: boolean;
  show_beaufort?: boolean;
  tablet_mode?: boolean;
  weather_entity?: string;
  forecast_days?: number;
  stale_minutes?: number;
  battery_warning_threshold?: number | string;
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
    forecast?: ForecastDay[];
    temperature_unit?: string;
  };
}

export interface ForecastDay {
  datetime?: string;
  condition?: string;
  temperature?: number;
  templow?: number;
  precipitation_probability?: number;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  locale?: { language?: string };
  callService: (domain: string, service: string, data?: Record<string, unknown>) => void;
  connection?: {
    subscribeMessage?: (
      callback: (ev: { forecast?: ForecastDay[] }) => void,
      msg: Record<string, unknown>,
    ) => Promise<() => void>;
    sendMessagePromise?: (msg: Record<string, unknown>) => Promise<{
      response?: Record<string, { forecast?: ForecastDay[] }>;
    }>;
  };
}

export interface ConvertedValue {
  raw: number | null;
  value: number | null;
  unit: string;
  src: string;
}
