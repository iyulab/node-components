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
    font-family: var(--u-font-base);
  }

  u-popover {
    width: var(--date-picker-popover-width);
  }

  /* mode="date": the trigger is a text box — it takes the container's room and reads like its text. */
  .text-input {
    flex: 1 1 auto;
    min-width: 0;
    border: none;
    outline: none;
    padding: 0;
    margin: 0;
    background: transparent;
    color: inherit;
    font: inherit;
  }
  .text-input::placeholder {
    color: var(--u-txt-color-weak, #616161);
  }
  .calendar-button {
    cursor: pointer;
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
    border-radius: var(--u-field-radius, 0.25em);
    background-color: var(--u-input-bg-color, #FFFFFF);
    color: var(--u-txt-color, #212121);
  }
  .time-input:focus-visible {
    outline: none;
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }

  /* === Size — 다른 필드·버튼과 같은 세 단 === */
  :host {
    font-size: var(--u-density, 14px);
  }
  :host([size="sm"]) {
    font-size: 12px;
  }
  :host([size="lg"]) {
    font-size: 16px;
  }
`;
