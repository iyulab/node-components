import { css } from 'lit';

export const styles = css`
  :host {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: stretch;
    justify-content: flex-start;
    /* ★밀도 스위치 진입점 — 자식은 전부 font-size: inherit 라 여기 하나만 값이면 된다. */
    font-size: var(--u-density, 14px);
  }

  :host > * {
    width: 100%;
    font-size: inherit;
  }
`;