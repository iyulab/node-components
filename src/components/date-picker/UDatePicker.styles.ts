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

  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.4em;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color, #FFFFFF);
    cursor: pointer;
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  :host([readonly]) .container,
  :host([disabled]) .container {
    cursor: not-allowed;
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
  }
  :host(:not([readonly]):not([disabled])) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover, #BDBDBD);
  }
  :host(:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
  :host([invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid, #C62828);
  }

  .text-content {
    flex: 1 0 auto;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .text-content.placeholder {
    color: var(--u-txt-color-weak, #757575);
  }

  .suffix-item {
    color: var(--u-icon-color, #616161);
    font-size: 1em;
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover, #1565C0);
  }

  u-popover {
    width: var(--date-picker-popover-width);
    padding: 8px;
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-lg, 6px);
    background-color: var(--u-panel-bg-color, #FFFFFF);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
  }

  .calendar-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 8px;
  }
  .calendar-title {
    font-size: var(--u-text-label-size, 13px);
    font-weight: var(--u-text-label-weight, 600);
  }

  .calendar-weekdays,
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
  }
  .calendar-weekdays {
    padding-bottom: 4px;
  }
  /* role="row" wrapper for APG grid semantics — display:contents keeps it out of the
     CSS grid track so its day cells still lay out as direct grid items. */
  .calendar-week {
    display: contents;
  }
  .weekday {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: var(--u-text-caption-size, 12px);
    color: var(--u-txt-color-weak, #757575);
  }

  .day,
  .day-empty {
    aspect-ratio: 1;
  }
  .day {
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: var(--u-radius-circle, 50%);
    background: transparent;
    color: var(--u-txt-color, #212121);
    font-size: 1em;
    font-family: inherit;
    cursor: pointer;
  }
  .day:hover:not([aria-disabled="true"]) {
    background-color: var(--u-bg-color-hover, #F5F5F5);
  }
  .day:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--u-input-border-color-focus, #1565C0);
  }
  .day[data-today] {
    font-weight: 700;
    color: var(--u-primary-color, #1976D2);
  }
  .day[aria-selected="true"] {
    background-color: var(--u-primary-color, #1976D2);
    color: var(--u-primary-txt-color, #FFFFFF);
  }
  .day[aria-disabled="true"] {
    color: var(--u-txt-color-disabled, #BDBDBD);
    cursor: not-allowed;
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

  .calendar-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 8px;
    padding-top: 8px;
    margin-top: 4px;
    border-top: 1px solid var(--u-border-color-weak, #EEEEEE);
  }
`;
