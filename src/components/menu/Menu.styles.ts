import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    box-sizing: border-box;
    width: max-content;
    min-width: 180px;
    
    opacity: 0;
    pointer-events: none;
    transform: scale(0.95);
    transform-origin: top left;
    transition: opacity 0.2s ease, transform 0.2s ease;
  }
  :host([open]) {
    opacity: 1;
    transform: scale(1);
    pointer-events: auto;
  }

  .container {
    display: flex;
    flex-direction: column;
    padding: 4px;
    background-color: var(--u-menu-bg-color, #fff);
    border: 1px solid var(--u-menu-border-color, #ddd);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    overflow: hidden;
  }

  ::slotted(u-menu-item:not(:last-child)) {
    margin-bottom: 2px;
  }
`;