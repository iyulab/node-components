import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-height: 0;
    overflow-y: auto;
    overscroll-behavior: contain;
    scrollbar-width: thin;
  }
  :host(:focus-visible) {
    outline: 2px solid var(--u-focus-ring-color, #1565C0);
    outline-offset: 2px;
  }
`;
