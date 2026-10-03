import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: var(--u-date-range-picker-display, inline-block);
    width: var(--u-date-range-picker-width, auto);
    color: var(--u-txt-color, #212121);
    font-family: var(--u-font-base);
  }

  /* 두 달이 나란히 들어가는 폭을 내용에서 얻는다(달마다 칸 7 × 32px 이상). 화면이 그보다 좁으면
     팝오버가 뷰포트 안에 머물고, 달력이 둘째 달을 아래로 내린다. */
  u-popover {
    width: max-content;
    max-width: calc(100vw - 16px);
  }
  /* 빠른 선택 목록은 달력 왼쪽 세로 줄 — 자리가 모자라면(좁은 화면) 달력 위로 올라가 가로로 흐른다. */
  .body {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: 8px;
  }
  .presets {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 2px;
    padding-inline-end: 8px;
    border-inline-end: 1px solid var(--u-border-color-weak, #EEEEEE);
  }
  .preset {
    display: flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border: none;
    border-radius: var(--u-radius-md, 4px);
    background: transparent;
    color: var(--u-txt-color, #212121);
    font: inherit;
    font-size: var(--u-text-label-size, 13px);
    text-align: start;
    white-space: nowrap;
    cursor: pointer;
  }
  .preset:hover:not(:disabled) {
    background-color: var(--u-bg-color-hover, #F5F5F5);
  }
  .preset:focus-visible {
    outline: none;
    box-shadow: 0 0 0 2px var(--u-input-border-color-focus, #1565C0);
  }
  /* 지금 범위와 같은 프리셋 — 달력의 띠와 같은 색 축으로 «지금 이것» 을 보인다. */
  .preset[aria-pressed="true"] {
    background-color: var(--u-primary-bg-color, #E3F2FD);
    color: var(--u-primary-color-strong, #1565C0);
    font-weight: var(--u-text-label-weight, 600);
  }
  .preset:disabled {
    color: var(--u-txt-color-disabled, #BDBDBD);
    cursor: not-allowed;
  }
  .calendar {
    flex: 1 1 auto;
    min-width: 0;
  }
  @media (max-width: 560px) {
    .presets {
      flex-direction: row;
      flex-wrap: wrap;
      flex-basis: 100%;
      padding-inline-end: 0;
      padding-block-end: 8px;
      border-inline-end: none;
      border-block-end: 1px solid var(--u-border-color-weak, #EEEEEE);
    }
  }

  /* The trigger is a text box — it takes the container's room and reads like its text. */
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
