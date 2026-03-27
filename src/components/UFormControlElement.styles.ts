import { css } from 'lit';

export const styles = css`
  :host([disabled]) {
    pointer-events: none;
    opacity: 0.5;
  }

  :host([readonly]) {
    pointer-events: none;
  }
`;
