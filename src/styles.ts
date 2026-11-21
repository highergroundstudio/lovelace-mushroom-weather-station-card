export const CARD_STYLES = `
  :host {
    display: block;
    --mws-radius: var(--ha-card-border-radius, 14px);
    --mws-radius-sm: calc(var(--mws-radius) - 4px);
    --mws-gap: 8px;
    --mws-pad: 14px;
    --mws-primary: var(--primary-color, #03a9f4);
    --mws-accent: var(--accent-color, var(--primary-color, #03a9f4));
    --mws-surface: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    --mws-surface-strong: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    --mws-border: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
    --mws-chip-bg: color-mix(in srgb, var(--mws-primary) 10%, var(--ha-card-background, var(--card-background-color)));
  }
  ha-card {
    padding: var(--mws-pad) var(--mws-pad) 10px;
    background: var(--ha-card-background, var(--card-background-color));
    overflow: hidden;
    border-radius: var(--mws-radius);
  }
  ha-card.compact {
    padding: 10px 10px 8px;
    --mws-gap: 6px;
    --mws-pad: 10px;
  }
  ha-card.chips-layout {
    padding: 10px 12px;
  }
  ha-card.stale {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--warning-color, #ff9800) 70%, transparent);
  }

  .alerts {
    display: grid;
    gap: 6px;
    margin: 0 0 10px;
  }
  .alert {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    padding: 8px 10px;
    border-radius: var(--mws-radius-sm);
    border: 1px solid transparent;
    font-size: 12.5px;
    line-height: 1.35;
    cursor: pointer;
    text-align: left;
    width: 100%;
    color: inherit;
    background: var(--mws-surface);
  }
  .alert.sev-red {
    background: color-mix(in srgb, var(--error-color, #f44336) 14%, transparent);
    border-color: color-mix(in srgb, var(--error-color, #f44336) 40%, transparent);
  }
  .alert.sev-orange {
    background: color-mix(in srgb, var(--orange-color, #ff9800) 14%, transparent);
    border-color: color-mix(in srgb, var(--orange-color, #ff9800) 40%, transparent);
  }
  .alert.sev-amber {
    background: color-mix(in srgb, var(--warning-color, #ffc107) 14%, transparent);
    border-color: color-mix(in srgb, var(--warning-color, #ffc107) 40%, transparent);
  }
  .alert.sev-blue {
    background: color-mix(in srgb, var(--info-color, var(--blue-color, #2196f3)) 14%, transparent);
    border-color: color-mix(in srgb, var(--blue-color, #2196f3) 35%, transparent);
  }
  .alert-title { font-weight: 700; }
  .alert-desc {
    color: var(--secondary-text-color);
    margin-top: 2px;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }

  .header {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 12px;
    padding: 2px 2px 10px;
  }
  ha-card.compact .header { padding: 0 0 6px; }
  .header-main { min-width: 0; flex: 1; }
  .title {
    font-weight: 650;
    font-size: 15px;
    letter-spacing: 0.01em;
    color: var(--primary-text-color);
    line-height: 1.25;
  }
  ha-card.compact .title { font-size: 13.5px; }
  .subtitle {
    font-size: 12.5px;
    color: var(--secondary-text-color);
    margin-top: 3px;
    line-height: 1.35;
  }
  .status-chip {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.02em;
    padding: 5px 9px;
    border-radius: 999px;
    background: var(--mws-surface);
    color: var(--secondary-text-color);
    border: 1px solid var(--mws-border);
    white-space: nowrap;
  }
  .status-chip.warn {
    color: var(--warning-color, #ff9800);
    border-color: color-mix(in srgb, var(--warning-color, #ff9800) 35%, transparent);
    background: color-mix(in srgb, var(--warning-color, #ff9800) 12%, transparent);
  }
  .status-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: var(--success-color, #4caf50);
  }
  .status-chip.warn .status-dot { background: var(--warning-color, #ff9800); }

  .hero {
    display: flex;
    align-items: center;
    gap: 14px;
    width: 100%;
    border: 0;
    background: linear-gradient(
      135deg,
      color-mix(in srgb, var(--mws-primary) 14%, transparent),
      var(--mws-surface-strong) 55%,
      transparent
    );
    color: inherit;
    text-align: left;
    padding: 12px 12px 14px;
    margin: 0 0 6px;
    border-radius: var(--mws-radius);
    cursor: pointer;
    transition: background 140ms ease;
  }
  .hero:hover { background: var(--mws-surface-strong); }
  ha-card.compact .hero { padding: 8px 10px 10px; gap: 10px; margin-bottom: 4px; }
  .hero-icon { --mdc-icon-size: 38px; }
  ha-card.compact .hero-icon { --mdc-icon-size: 28px; }
  .hero-text { flex: 1; min-width: 0; }
  .hero-primary {
    font-size: 34px;
    font-weight: 650;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  ha-card.compact .hero-primary { font-size: 26px; }
  .hero-secondary {
    font-size: 12.5px;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }
  .hero-spark {
    color: var(--mws-accent);
    opacity: 0.9;
  }

  .section {
    margin-top: 4px;
    padding-top: 8px;
  }
  .section + .section {
    border-top: 1px solid var(--mws-border);
    margin-top: 10px;
    padding-top: 10px;
  }
  .section-label {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 8px;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    padding: 0 4px 8px;
    color: var(--secondary-text-color);
  }

  .grid {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: var(--mws-gap);
  }
  ha-card.compact .grid { gap: 5px; }
  .wind-row {
    display: grid;
    grid-template-columns: 108px 1fr;
    gap: 10px;
    align-items: center;
  }
  .wind-row.with-rose {
    grid-template-columns: 96px 96px 1fr;
  }
  .wind-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  .compass, .wind-rose {
    display: flex;
    flex-direction: column;
    align-items: center;
    cursor: pointer;
    color: var(--primary-text-color);
    padding: 6px;
    border-radius: var(--mws-radius);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .compass-svg, .wind-rose-svg { width: 88px; height: 88px; }
  ha-card.compact .compass-svg,
  ha-card.compact .wind-rose-svg { width: 68px; height: 68px; }
  .compass-svg.muted { opacity: 0.45; }
  .compass-label, .wind-rose-label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--secondary-text-color);
    margin-top: 2px;
    text-align: center;
  }
  .wind-rose { color: var(--mws-primary); }

  .spark {
    display: flex;
    align-items: flex-end;
    gap: 8px;
    height: 58px;
    padding: 6px 8px 2px;
    margin-bottom: 8px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .bar-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: flex-end;
    flex: 1;
    height: 100%;
  }
  .bar {
    width: 100%;
    max-width: 26px;
    border-radius: 5px 5px 2px 2px;
    background: var(--disabled-text-color);
    opacity: 0.28;
  }
  .bar.on {
    background: linear-gradient(180deg, var(--cyan-color, #00bcd4), color-mix(in srgb, var(--cyan-color, #00bcd4) 60%, var(--mws-primary)));
    opacity: 1;
  }
  .bar-lab {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .rain-goal {
    display: grid;
    gap: 6px;
    padding: 10px 12px;
    margin-bottom: 8px;
    border-radius: var(--mws-radius-sm);
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
  }
  .rain-goal-top {
    display: flex;
    justify-content: space-between;
    gap: 8px;
    font-size: 12px;
    font-weight: 600;
  }
  .rain-goal-track {
    height: 8px;
    border-radius: 999px;
    background: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    overflow: hidden;
  }
  .rain-goal-fill {
    height: 100%;
    border-radius: 999px;
    background: linear-gradient(90deg, var(--cyan-color, #00bcd4), var(--mws-primary));
    transition: width 200ms ease;
  }
  .rain-goal-meta {
    font-size: 11.5px;
    color: var(--secondary-text-color);
  }

  .forecast {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 2px 0 4px;
    scrollbar-width: thin;
  }
  .forecast.hourly { margin-bottom: 8px; }
  .fday, .fhour {
    flex: 1;
    min-width: 68px;
    text-align: center;
    background: var(--mws-surface);
    border: 1px solid var(--mws-border);
    border-radius: var(--mws-radius-sm);
    padding: 10px 6px 8px;
    cursor: pointer;
    transition: background 140ms ease, border-color 140ms ease;
  }
  .fhour { min-width: 56px; padding: 8px 4px; }
  .fday:hover, .fhour:hover {
    background: var(--mws-surface-strong);
    border-color: color-mix(in srgb, var(--mws-primary) 35%, transparent);
  }
  .fday-name, .fhour-name {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .fday ha-icon, .fhour ha-icon { --mdc-icon-size: 22px; margin: 6px 0; }
  .fhour ha-icon { --mdc-icon-size: 18px; margin: 4px 0; }
  .fday-temp, .fhour-temp { font-size: 12.5px; font-weight: 650; }
  .fday-pop, .fhour-pop {
    font-size: 11px;
    font-weight: 600;
    color: var(--cyan-color, #00bcd4);
    margin-top: 3px;
  }

  .tile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    border: 1px solid var(--mws-border);
    background: var(--mws-surface);
    border-radius: var(--mws-radius-sm);
    padding: 11px 6px 9px;
    color: inherit;
    cursor: pointer;
    min-height: 86px;
    transition: background 140ms ease, border-color 140ms ease, transform 140ms ease;
  }
  .tile:hover:not([disabled]) {
    background: var(--mws-surface-strong);
    border-color: color-mix(in srgb, var(--mws-primary) 35%, transparent);
  }
  ha-card.compact .tile {
    padding: 7px 4px 6px;
    gap: 3px;
    min-height: 64px;
  }
  .tile[disabled] { opacity: 0.42; cursor: default; }
  .tile ha-icon { --mdc-icon-size: 20px; }
  ha-card.compact .tile ha-icon { --mdc-icon-size: 17px; }
  .tile-value {
    font-weight: 650;
    font-size: 13.5px;
    text-align: center;
    letter-spacing: -0.01em;
    line-height: 1.15;
  }
  ha-card.compact .tile-value { font-size: 12px; }
  .tile-label {
    font-size: 10.5px;
    font-weight: 500;
    color: var(--secondary-text-color);
    text-align: center;
    line-height: 1.2;
  }
  .tile .hist-spark {
    color: var(--mws-accent);
    margin-top: 2px;
  }

  .chips-bar {
    display: flex;
    flex-direction: column;
    gap: 8px;
  }
  .chips {
    display: flex;
    flex-wrap: nowrap;
    gap: 8px;
    padding: 2px;
    overflow-x: auto;
    scrollbar-width: thin;
  }
  .chips.wrap { flex-wrap: wrap; }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--mws-border);
    border-radius: 999px;
    padding: 8px 12px;
    background: var(--mws-chip-bg);
    color: inherit;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 600;
    transition: background 140ms ease, border-color 140ms ease;
    white-space: nowrap;
    flex-shrink: 0;
  }
  .chip:hover {
    background: color-mix(in srgb, var(--mws-primary) 18%, transparent);
    border-color: color-mix(in srgb, var(--mws-primary) 40%, transparent);
  }
  .chip ha-icon { --mdc-icon-size: 16px; color: var(--mws-primary); }
  .chip.expand {
    margin-left: auto;
    background: transparent;
  }
  .chips-extra {
    display: none;
    flex-wrap: wrap;
    gap: 8px;
    padding: 0 2px 2px;
  }
  .chips-bar.expanded .chips-extra { display: flex; }
  .chips-bar.expanded .chip.expand ha-icon { transform: rotate(180deg); }

  .battery {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12.5px;
    font-weight: 600;
    padding: 10px 8px 4px;
    cursor: pointer;
  }
  .battery.ok { color: var(--success-color, #4caf50); }
  .battery.warn { color: var(--error-color, #f44336); }

  .hint {
    font-size: 12px;
    color: var(--secondary-text-color);
    padding: 10px 4px 2px;
    line-height: 1.4;
  }

  @media (max-width: 520px) {
    .grid, .wind-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .wind-row, .wind-row.with-rose { grid-template-columns: 1fr; }
    .header {
      flex-direction: column;
      align-items: flex-start;
      gap: 8px;
    }
    .header-main {
      flex: none;
      width: 100%;
      min-width: 0;
    }
    .status-chip {
      width: fit-content;
      max-width: 100%;
    }
  }
`;
