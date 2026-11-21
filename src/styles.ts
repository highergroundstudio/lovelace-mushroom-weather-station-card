export const CARD_STYLES = `
  :host {
    display: block;
    --mws-radius: 14px;
    --mws-radius-sm: 10px;
    --mws-gap: 8px;
    --mws-pad: 14px;
    --mws-surface: color-mix(in srgb, var(--primary-text-color) 5%, transparent);
    --mws-surface-strong: color-mix(in srgb, var(--primary-text-color) 8%, transparent);
    --mws-border: color-mix(in srgb, var(--primary-text-color) 10%, transparent);
  }
  ha-card {
    padding: var(--mws-pad) var(--mws-pad) 10px;
    background: var(--ha-card-background, var(--card-background-color));
    overflow: hidden;
  }
  ha-card.compact {
    padding: 10px 10px 8px;
    --mws-gap: 6px;
    --mws-pad: 10px;
    --mws-radius: 12px;
  }
  ha-card.stale {
    box-shadow: inset 0 0 0 1px color-mix(in srgb, var(--warning-color, #ff9800) 70%, transparent);
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
    background: linear-gradient(180deg, var(--mws-surface-strong), transparent);
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
  .wind-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); }

  .compass {
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
  .compass-svg { width: 88px; height: 88px; }
  ha-card.compact .compass-svg { width: 68px; height: 68px; }
  .compass-svg.muted { opacity: 0.45; }
  .compass-label {
    font-size: 11.5px;
    font-weight: 600;
    color: var(--secondary-text-color);
    margin-top: 2px;
  }

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
    background: linear-gradient(180deg, var(--cyan-color, #00bcd4), color-mix(in srgb, var(--cyan-color, #00bcd4) 60%, #1565c0));
    opacity: 1;
  }
  .bar-lab {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 0.04em;
    color: var(--secondary-text-color);
    margin-top: 4px;
  }

  .forecast {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 2px 0 4px;
    scrollbar-width: thin;
  }
  .fday {
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
  .fday:hover {
    background: var(--mws-surface-strong);
    border-color: color-mix(in srgb, var(--primary-text-color) 18%, transparent);
  }
  .fday-name {
    font-size: 10.5px;
    font-weight: 700;
    letter-spacing: 0.06em;
    text-transform: uppercase;
    color: var(--secondary-text-color);
  }
  .fday ha-icon { --mdc-icon-size: 22px; margin: 6px 0; }
  .fday-temp { font-size: 12.5px; font-weight: 650; }
  .fday-pop {
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
    border-color: color-mix(in srgb, var(--primary-text-color) 18%, transparent);
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

  .chips {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    padding: 2px;
  }
  .chip {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    border: 1px solid var(--mws-border);
    border-radius: 999px;
    padding: 7px 11px;
    background: var(--mws-surface);
    color: inherit;
    cursor: pointer;
    font-size: 12.5px;
    font-weight: 600;
    transition: background 140ms ease;
  }
  .chip:hover { background: var(--mws-surface-strong); }
  .chip ha-icon { --mdc-icon-size: 16px; }

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
    .wind-row { grid-template-columns: 1fr; }
    .status-chip { display: none; }
  }
`;
