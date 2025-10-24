import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      width: 100%;
      display: flex;
      flex-direction: column;
      align-items: flex-start;

      --label-width: auto;
    }
    :host([labelPosition="top"]) .label-position{
      flex-direction: column;
    }
    :host([labelPosition="left"]) .label-position {
      flex-direction: row;
      --label-width: 20%;
    }
    :host([disabled]) .label-position slot::slotted(*) {
      pointer-events: none;
      opacity: 0.5;
    }
    :host([readonly]) .label-position slot::slotted(*) {
      pointer-events: none;
    }

    .label-position {
      width: 100%;
      display: flex;
      flex-direction: column;

      u-input-label {
        width: var(--label-width);
      }
    }
  `;