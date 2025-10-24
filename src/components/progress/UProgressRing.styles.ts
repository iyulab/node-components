import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-flex;

    --ring-size: 48px;
    --ring-thickness: 4px;
  }

  sl-progress-ring {
    --size: var(--ring-size);
    --track-width: var(--ring-thickness);
    --indicator-width: calc(var(--ring-thickness) + 1px);
  }
`;