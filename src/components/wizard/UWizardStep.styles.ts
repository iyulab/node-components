import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: center;
    }
    :host([disabled]) {
      opacity: 0.5;
      pointer-events: none;
    }
    :host([active]) {
      font-weight: bold;
      color: var(--sl-color-primary-500);
    }
  `;