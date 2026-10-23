import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 0.2em;
    flex-shrink: 0;
    color: var(--u-txt-color-weak, #616161);
    font-size: inherit;
    line-height: 1.5em;
    cursor: pointer;
  }
  :host:hover {
    color: var(--u-primary-color-strong, #1565C0);
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: default;
  }

  a {
    display: inline-flex;
    align-items: center;
    /* 호스트 하한(--u-target-size, 미설정 = 0) — 누르는 것은 링크 자신이라 링크가 커진다. */
    justify-content: center;
    min-height: var(--u-target-size, 0px);
    min-width: var(--u-target-size, 0px);
    gap: 0.2em;
    color: inherit;
    text-decoration: none;
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    cursor: inherit;
  }

  /* 접두 · 접미 옆 간격은 섀도 안 상자가 갖는다 — ::slotted 의 여백은 문서의 전역 리셋(Tailwind preflight 류)에 진다. */
  .affix {
    display: inline-flex;
    align-items: center;
    flex: none;
  }
  .affix[hidden] {
    display: none;
  }
  .affix-prefix {
    margin-right: 0.2em;
  }
  .affix-suffix {
    margin-left: 0.2em;
  }
`;
