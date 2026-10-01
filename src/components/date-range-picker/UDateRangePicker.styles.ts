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
  .calendar {
    min-width: 0;
  }
`;
