import { css } from 'lit';

export const styles = css`
  :host {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    font-size: 14px;
  }

  :host * {
    width: 100%;
  }
`;