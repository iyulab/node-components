import { css } from "lit";

export const styles = css`
  :host {
    --date-picker-popover-width: 296px;
  }

  :host {
    position: relative;
    display: var(--u-date-picker-display, inline-block);
    width: var(--u-date-picker-width, auto);
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  u-popover {
    width: var(--date-picker-popover-width);
  }

  .calendar-time {
    display: flex;
    justify-content: flex-end;
    padding: 4px 4px 0;
  }
  .time-input {
    font-family: inherit;
    font-size: 0.9em;
    padding: 2px 6px;
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color, #FFFFFF);
    color: var(--u-txt-color, #212121);
  }
  .time-input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
`;
