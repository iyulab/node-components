import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-flex;
  }
  :host([loading]) {
    pointer-events: none;
    cursor: progress;
  }

  sl-button {
    width: inherit;
  }
`;