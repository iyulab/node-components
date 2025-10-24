import { css } from 'lit';

export const styles = css`
    :host {
      width: 100%;
      font-size: 14px;
    }

    sl-range {
      --track-color-active: var(--sl-color-primary-600);
      --track-color-inactive: var(--sl-color-primary-100);
      --tooltip-offset: 15px;
    }

    .footer {
      display: inline-flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      font-size: inherit;
      line-height: 1.5;
      user-select: none;
    }
  `;