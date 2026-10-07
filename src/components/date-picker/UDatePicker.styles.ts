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
  /* 글자 영역 하한(공용 피커 시트의 min-inline-size 가 읽는다). */
  .container {
    --_min-text: var(--date-picker-min-text, 4ch);
  }

  /* === Size — 다른 필드·버튼과 같은 세 단 === */
  :host {
    font-size: var(--u-density, 14px);
  }
  :host([size="sm"]) {
    /* 밀도 단에 비례 — 기본 밀도 14px 에서 12px. */
    font-size: calc(var(--u-density, 14px) * 6 / 7);
  }
  :host([size="lg"]) {
    /* 밀도 단에 비례 — 기본 밀도 14px 에서 16px. */
    font-size: calc(var(--u-density, 14px) * 8 / 7);
  }
`;
