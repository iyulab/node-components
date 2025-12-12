import { css } from "lit";

export const styles = css`
  :host {
    display: none;
    min-width: 180px;
    padding: 6px;
    border-radius: 8px;
    background: var(--u-menu-bg, #fff);
    box-shadow: 0 10px 24px rgba(0,0,0,0.18);
  }
  :host([open]) {
    display: block;
  }

  .container {
    display: block;
  }
`;
