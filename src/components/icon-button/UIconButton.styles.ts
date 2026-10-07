import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    color: var(--u-icon-color, #616161);
    /* 글리프는 밀도 단에 비례한다(기본 밀도 14px 에서 20px) — 같은 줄의 u-button 글자와 함께 커지고 준다. */
    font-size: calc(var(--u-density, 14px) * 10 / 7);
  }

  :host([appearance="solid"]) {
    color: #fff;
  }
  :host([appearance="link"]) {
    color: var(--u-link-txt-color, #1565C0);
  }

  u-button {
    color: inherit;
    font-size: inherit;
    padding: 0.4em;
  }
`;
