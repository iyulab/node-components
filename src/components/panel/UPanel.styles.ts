import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    overflow: auto;
  }
  :host([disabled]) {
    pointer-events: none;
    opacity: 0.5;
  }
`;
