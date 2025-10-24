import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
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

    .visible {
      display: inline-flex;
      font-size: inherit;
      color: var(--sl-color-gray-500);
      cursor: pointer;
      margin-right: 5px;
      box-sizing: border-box;
    }
    .visible:hover {
      color: var(--sl-color-gray-800);
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