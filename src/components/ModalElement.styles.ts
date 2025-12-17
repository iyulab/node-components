import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    z-index: 9999;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    background: transparent;
    visibility: hidden;
    pointer-events: none;
    transition: visibility 0s 0.3s, background 0.3s ease;
  }
  :host([open]) {
    visibility: visible;
    pointer-events: auto;
    transition: visibility 0s, background 0.3s ease;
  }
  :host([modal]) {
    background: var(--u-overlay-bg-color);
  }
  :host([modal]:not([open])) {
    background: transparent;
  }
`;
