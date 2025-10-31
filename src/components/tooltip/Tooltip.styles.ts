import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    display: block;
    width: max-content;

    padding: 8px;
    color: var(--u-tooltip-text-color);
    font-family: var(--u-font-modern, inherit);
    font-size: 14px;
    line-height: 1.5;
    border: none;
    border-radius: 4px;
    background-color: var(--u-tooltip-bg-color);
    
    opacity: 0;
    pointer-events: none;
    transform: scale(0);
    transition: opacity 0.15s ease, transform 0.15s ease;
  }
  :host([open]) {
    opacity: 0.8;
    transform: scale(1);
    pointer-events: auto;
  }
  :host([hoist]) {
    position: fixed;
  }
`;