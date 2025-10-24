import { css } from 'lit';

export const styles = css`
    :host {
      position: relative;
      display: flex;
      flex-direction: var(--flex-direction, row);
      width: 100%;
      height: 100%;
    }

    #item1, #item2 {
      flex-grow: 1;
    }
  `;