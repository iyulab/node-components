import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    min-width: 0;
    width: 100%;
    padding: 4px;
    background-color: transparent;
    border-radius: 4px;
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .container {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }
`;