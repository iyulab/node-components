import { css } from "lit";

export const styles = css`
  :host {
    position: fixed;
    z-index: 9999;
    inset: 0;
    display: flex;
    background: var(--u-overlay-bg-color, rgba(0, 0, 0, 0.4));

    opacity: 0;
    visibility: hidden;
    pointer-events: none;
    transition: opacity 0.3s ease, visibility 0s 0.3s;
    overflow: hidden;
  }
  :host([open]) {
    opacity: 1;
    visibility: visible;
    pointer-events: auto;
    transition-delay: 0s;
  }
  :host([contained]) {
    position: absolute;
  }
  :host([mode="non-modal"]) {
    background: transparent;
    pointer-events: none;
  }
  :host([mode="non-modal"][open]) {
    pointer-events: none;
  }
`;
