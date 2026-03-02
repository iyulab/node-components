import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    z-index: 9999;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    opacity: 0;
    background: transparent;
    transition: opacity 0.3s, background 0.3s ease;
  }
  :host([open]) {
    opacity: 1;
  }
  :host([modal]) {
    background: var(--u-overlay-bg-color);
  }
  :host([strategy="fixed"]) {
    position: fixed;
  }
  :host([strategy="absolute"]) {
    position: absolute;
  }
`;
