import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    width: max-content;
    min-width: 180px;
    
    opacity: 0;
    transform: scale(0.95);
    transform-origin: top left;
    transition: opacity 0.2s ease, transform 0.2s ease;
    pointer-events: none;
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    border: 1px solid var(--u-border-color, #ddd);
    border-radius: 8px;
    background-color: var(--u-bg-color, #fff);
    overflow: auto;
  }
`;