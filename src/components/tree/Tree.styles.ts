import { css } from "lit";

export const styles = css`
  :host {
    display: block;
    width: 100%;
    min-width: 0;
  }

  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }

  .tree-container {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 4px;
    background-color: transparent;
    border-radius: 4px;
  }
`;
