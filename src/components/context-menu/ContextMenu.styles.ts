import { css } from "lit";

export const styles = css`
  :host {
    position: absolute;
    z-index: 1000;
    top: 0;
    left: 0;
    display: block;
    width: max-content;
    min-width: 180px;
    
    opacity: 0;
    pointer-events: none;
    transform: scale(0.95);
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }
  :host([hoist]) {
    position: fixed;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    border: 1px solid var(--u-border-color, #ddd);
    border-radius: 8px;
    background-color: var(--u-bg-color, #fff);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    overflow: hidden;
  }
`;