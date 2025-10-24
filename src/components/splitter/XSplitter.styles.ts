import { css } from 'lit';

export const styles = css`
    :host {
      background: transparent;
      position: relative;
    }

    #host {
      visibility: hidden;
      background: #7a7a7a;

      position: absolute;
      top: 0;
      left: 0;
      bottom: 0;

      z-index: 9999;
    }

    #thumb {
      background: red;
      border-radius: 4px;
      visibility: hidden;
      position: absolute;
    }

    :host(:hover) #thumb {
      visibility: visible;
    }

    :host(.dragging) #thumb,:host(.dragging) #host {
      visibility: visible;
    }
  `;