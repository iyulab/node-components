import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    padding: 4px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-panel-bg-color);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.12);
  }
  :host([borderless]) {
    padding: 0;
    border: none;
    border-radius: 0;
    background: none;
    box-shadow: none;
  }
`;
