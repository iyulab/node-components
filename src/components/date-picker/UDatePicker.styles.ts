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
    /* 호스트 하한(--u-target-size)이 있으면 칸 7개가 그 폭으로 들어가는 너비(팝오버 여백 8px ×2 · 테두리 1px ×2) 이상. */
    width: max(var(--date-picker-popover-width), calc(7 * var(--u-target-size, 0px) + 18px));
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
