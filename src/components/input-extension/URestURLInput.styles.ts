import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
    }
    :host([clearable]) .clear {
      display: inline-flex;
    }

    u-input-border {
      gap: 0;
    }

    u-select-input {
      width: 10em;
      font-size: 0.9em;
      margin-right: 10px;
      --vertical-padding: 2px;
    }

    .prefix {
      font-size: inherit;
      line-height: 1.5;
      padding: 0px 1px;
      cursor: pointer;
    }
    .prefix:hover {
      color: var(--sl-color-primary-500);
    }

    input {
      flex: 1;
      border: none;
      outline: none;
      padding: 0px 1px;
      background-color: transparent;
      font-family: inherit;
      font-size: inherit;
      line-height: 1.5;
      box-sizing: border-box;
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