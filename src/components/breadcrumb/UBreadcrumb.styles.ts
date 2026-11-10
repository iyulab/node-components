import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color, #212121);
    user-select: none;
  }

  nav {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    gap: 0.15em;
    overflow: hidden;
  }

  ::slotted([data-last]) {
    font-weight: 500;
    pointer-events: none;
    cursor: default;
  }

  .separator {
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    color: var(--u-txt-color-weak, #616161);
    font-size: 0.75em;
    user-select: none;
  }

  /* chevron-right 는 LTR 모양이다 — RTL 에서는 구분자가 항목 사이에서 «다음» 인 왼쪽을 가리켜야 한다.
     컴포넌트가 스스로 넣는 기본 글리프만 뒤집는다(소비자가 준 구분자는 의미를 소비자가 정한다). */
  :host(:dir(rtl)) .separator-icon {
    transform: scaleX(-1);
  }
`;
