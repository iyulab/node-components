import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      display: grid;
      grid-template-columns: auto 1fr;
      align-items: center;
      grid-column-gap: 8px;
      font-size: 14px;
    }
    :host([disabled]) {
      pointer-events: none;
      opacity: 0.5;
    }
    :host([readonly]) {
      pointer-events: none;
    }

    input {
      grid-column: 1;
      font-size: inherit;
      width: 1.275em;
      height: 1.275em;
      margin: 0;
      padding: 0;
    }

    u-input-label {
      grid-column: 2;
    }

    u-input-error {
      grid-column: 2;
    }
  `;