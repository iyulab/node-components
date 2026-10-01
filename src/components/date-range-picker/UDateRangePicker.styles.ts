import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: var(--u-date-range-picker-display, inline-block);
    width: var(--u-date-range-picker-width, auto);
    color: var(--u-txt-color, #212121);
    font-size: inherit;
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
  .presets u-button::part(content) {
    justify-content: flex-start;
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
`;
