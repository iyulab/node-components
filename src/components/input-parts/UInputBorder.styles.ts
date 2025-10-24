import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      gap: 5px;
      padding: 5px 10px;
      border-radius: 4px;
      border: 1px solid var(--sl-color-gray-300);
      background-color: var(--sl-color-neutral-0);
      box-sizing: border-box;
    }
    :host(:hover) {
      border: 1px solid var(--sl-color-gray-800);
    }
    :host(:focus-within) {
      border: 2px solid var(--sl-color-primary-500);
      padding: 4px 9px;
    }
    :host([invaild]) {
      border: 2px solid var(--sl-color-red-500);
      padding: 4px 9px;
    }
  `;