import { css } from 'lit';

export const styles = css`
    :host {
      display: inline-flex;
    }
    :host([arrow]) sl-tooltip {
      --sl-tooltip-arrow-size: 6px;
    }

    sl-tooltip {
      --sl-tooltip-arrow-size: 0;
    }
  `;