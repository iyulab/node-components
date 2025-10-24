import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
    }
    :host(:focus-within) .at {
      color: var(--sl-color-gray-800);
    }
    :host slot::slotted(*) {
      font-size: inherit;
    }
    :host([clearable]) .clear {
      display: inline-flex;
    }

    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0;
      background-color: transparent;
      font-size: inherit;
      line-height: 1.5;
    }

    .at {
      font-size: inherit;
      color: var(--sl-color-gray-500);
    }

    u-select-input {
      width: 10em;
      font-size: 0.9em;
      --vertical-padding: 2px;
    }

    .clear {
      display: none;
      font-size: inherit;
      color: var(--sl-color-gray-500);
      margin-left: 5px;
      box-sizing: border-box;
      cursor: pointer;
    }
    .clear:hover {
      color: var(--sl-color-gray-800);
    }
  `;