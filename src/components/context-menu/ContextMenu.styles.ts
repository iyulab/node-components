import { css } from "lit";

export const styles = css`
  :host {
    display: none;
    position: fixed;
    z-index: 1000;
    pointer-events: none;
  }
  :host([open]) {
    display: block;
    pointer-events: all;
  }
`;