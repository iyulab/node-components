import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
    }
    :host([clearable]) .clear {
      display: inline-flex;
    }

    textarea {
      width: 100%;
      border: none;
      outline: none;
      resize: none;
      padding: 0;
      background-color: transparent;
      font-family: var(--sl-font-sans);
      font-size: inherit;
      line-height: 1.5;
      -webkit-appearance: none;
    }
    textarea::-webkit-scrollbar {
      width: 5px;
    }
    textarea::-webkit-scrollbar-thumb {
      background-color: var(--sl-color-gray-300);
    }
    textarea::-webkit-scrollbar-track {
      background-color: transparent;
    }

    .clear {
      position: absolute;
      z-index: 1;
      right: 10px;
      top: 10px;
      display: none;
      font-size: inherit;
      color: var(--sl-color-gray-500);
      cursor: pointer;
    }
    .clear:hover {
      color: var(--sl-color-gray-800);
    }
  `;