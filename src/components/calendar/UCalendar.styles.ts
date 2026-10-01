import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    color: var(--u-txt-color, #212121);
    font-family: var(--u-font-base);
  }

  /* 여러 달은 나란히 두되, 한 달이 최소 폭(칸 7개 × 32px)을 못 받으면 다음 줄로 내린다 —
     좁은 화면에서 칸을 줄이는 대신 쌓는다(칸이 24px 아래로 내려가면 SC 2.5.8 미달이다). */
  .months {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 16px;
  }
  .month {
    flex: 1 1 224px;
    min-width: 0;
  }

  .calendar-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
    padding: 0 4px 8px;
  }
  /* Keeps the title centered when a month in a multi-month view shows only one of the two
     navigation buttons — the missing one leaves a same-sized gap instead of collapsing. */
  .nav-spacer {
    width: 2em;
  }
  .calendar-title {
    font-size: var(--u-text-label-size, 13px);
    font-weight: var(--u-text-label-weight, 600);
  }

  .calendar-weekdays,
  .calendar-grid {
    display: grid;
    grid-template-columns: repeat(7, minmax(32px, 1fr));
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
    color: var(--u-txt-color-weak, #616161);
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
  /* 범위 — 안쪽 날은 띠로 잇고(모서리 없음), 양 끝은 선택 원으로 둔다. 미리 표시(앵커를 고른 뒤
     두 번째 날을 고르기 전)는 띠 대신 위아래 점선으로 그려 아직 확정 전임을 구분한다. */
  .day[data-in-range] {
    border-radius: var(--u-radius-none, 0);
    background-color: var(--u-primary-bg-color, #E3F2FD);
    color: var(--u-txt-color, #212121);
  }
  .day[data-in-range][data-preview] {
    background-color: transparent;
    border-block: 1px dashed var(--u-primary-color, #1976D2);
  }
  .day[data-range-start] {
    border-start-start-radius: var(--u-radius-circle, 50%);
    border-end-start-radius: var(--u-radius-circle, 50%);
  }
  .day[data-range-end] {
    border-start-end-radius: var(--u-radius-circle, 50%);
    border-end-end-radius: var(--u-radius-circle, 50%);
  }
  .day[data-range-start]:not([data-preview]),
  .day[data-range-end]:not([data-preview]),
  .day[aria-selected="true"][data-preview] {
    background-color: var(--u-primary-color, #1976D2);
    color: var(--u-primary-txt-color, #FFFFFF);
  }
  .day[aria-disabled="true"] {
    color: var(--u-txt-color-disabled, #BDBDBD);
    cursor: not-allowed;
  }
`;
