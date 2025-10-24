import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-flex;
    width: 100%;

    --bar-thickness: 4px;
  }

  sl-progress-bar {
    width: 100%;
    --height: var(--bar-thickness);
  }
`;