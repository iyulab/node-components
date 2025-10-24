import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;

      --input-width: 4em;
    }
    :host(:focus-within) .divider {
      color: var(--sl-color-gray-800);
    }
    :host slot::slotted(*) {
      font-size: inherit;
    }
    :host([clearable]) .clear {
      display: inline-flex;
    }

    u-input-border {
      justify-content: flex-start;
    }

    input {
      display: inline-flex;
      width: var(--input-width);
      text-align: center;
      border: none;
      outline: none;
      padding: 0;
      background-color: transparent;
      font-size: inherit;
      line-height: 1.5;
    }
    input::-webkit-outer-spin-button,
    input::-webkit-inner-spin-button {
      -webkit-appearance: none;
      -moz-appearance: textfield;
      margin: 0;
    }

    .divider {
      font-size: inherit;
      color: var(--sl-color-gray-500);
    }

    .flex {
      flex: 1;
    }

    .clear {
      display: none;
      font-size: inherit;
      color: var(--sl-color-gray-500);
      cursor: pointer;
    }
    .clear:hover {
      color: var(--sl-color-gray-800);
    }
  `;