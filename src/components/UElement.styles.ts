import { css } from "lit";

export const styles = css`
  :host {
    color: var(--u-txt-color, inherit);
    font-family: var(--u-font-base, inherit);
    box-sizing: border-box;
    overflow-wrap: anywhere;
  }

  :host *,
  :host *::before,
  :host *::after {
    box-sizing: inherit;
    overflow-wrap: inherit;
  }

  /* Focus Styles
   *
   * ★**-strong 단이다** — 포커스 링은 바탕 위에 그리는 그래픽이므로 바탕 기준으로
   * 재야 한다. 1.20.0 이전에는 -weak 였고 **다크에서 2.31**(WCAG 1.4.11 기준 3.0)이었다.
   * 즉 키보드 사용자가 다크 테마에서 포커스 위치를 알기 어려웠다. -strong 은
   * 라이트 5.75 · 다크 5.32 로 두 테마 모두 통과한다. */
  :host(:focus-visible) {
    outline: 2px solid var(--u-primary-color-strong, #1565C0);
    outline-offset: 2px;
  }
  :focus-visible {
    outline: 2px solid var(--u-primary-color-strong, #1565C0);
    outline-offset: 2px;
  }

  /* Hidden Attribute */
  :host([hidden]) {
    display: none !important;
  }
  [hidden] {
    display: none !important;
  }

  /* Scrollbar Styles */
  :host([scrollable]) {
    scrollbar-width: thin;
    scrollbar-color: var(--u-scrollbar-color, #BDBDBD) var(--u-scrollbar-track-color, transparent);
  }
  :host([scrollable])::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  :host([scrollable])::-webkit-scrollbar-thumb {
    background: var(--u-scrollbar-color, #BDBDBD);
  }
  :host([scrollable])::-webkit-scrollbar-track {
    background: var(--u-scrollbar-track-color, transparent);
  }
  [scrollable] {
    scrollbar-width: thin;
    scrollbar-color: var(--u-scrollbar-color, #BDBDBD) var(--u-scrollbar-track-color, transparent);
  }
  [scrollable]::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }
  [scrollable]::-webkit-scrollbar-thumb {
    background: var(--u-scrollbar-color, #BDBDBD);
  }
  [scrollable]::-webkit-scrollbar-track {
    background: var(--u-scrollbar-track-color, transparent);
  }
`;