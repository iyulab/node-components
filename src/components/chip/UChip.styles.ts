import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    user-select: none;
    cursor: default;
  }
  :host([selectable]) {
    cursor: pointer;
  }

  :host([selectable]:hover) u-tag {
    filter: brightness(0.95);
  }
  :host([selectable][selected]) u-tag {
    outline: 2px solid currentColor;
    outline-offset: -1px;
    font-weight: 600;
  }

  .check-icon {
    font-size: 1em;
  }

  .remove-btn {
    font-size: 0.7em;
    /* WCAG 2.2 SC 2.5.8 — 제거 버튼은 포인터 타깃이고 실측 27x23 으로 **1px 미달**이었다.
       cycle-484 가 checkbox·switch 에 쓴 것과 같은 처방(글리프가 아니라 타깃을 넓힌다) —
       아이콘 크기(0.7em)는 그대로다.
       ⚠실측: 버튼 27x23 → 27x24, 그리고 **칩 자신이 31 → 32px 로 1px 늘어난다.**
       («늘지 않는다»가 아니다 — 24px 타깃은 그만한 공간을 요구한다.) */
    min-block-size: 24px;
    min-inline-size: 24px;
  }
`;
