import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-block;
  }

  .overlay {
    position: fixed;
    z-index: 9999;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    display: flex;
    align-items: center;
    justify-content: center;
    background: var(--u-overlay-bg-color);
  }

  .panel {
    display: block;
    background: var(--u-panel-bg-color);
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    max-width: 90vw;
    max-height: 90vh;
    overflow: hidden;
  }
`;