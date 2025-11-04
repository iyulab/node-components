import { css } from 'lit';

export const styles = css`
  :host {
    position: relative;
    display: inline-flex;
    font-size: inherit;

    --track-width: 0.25em;
    --track-color: var(--u-neutral-200, #e5e7eb);
    --indicator-color: var(--u-blue-600, #3b82f6);
  }
  /* smooth variant - 매끄러운 원형 */
  :host([variant="smooth"]) .mask {
    stroke-linecap: round;
  }

  .progress-ring {
    width: 6em;
    height: 6em;
    transform: rotate(-90deg); /* 0%가 위에서 시작하도록 회전 */
  }
  .progress-ring circle {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(3em - var(--track-width) / 2);
    cx: 3em;
    cy: 3em;
  }

  .track {
    stroke: var(--track-color);
  }
  .indicator {
    stroke: var(--indicator-color);
    transition: stroke-dashoffset 350ms ease;
  }

  /* 라벨 중앙 숫자 */
  .label {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1.1em;
    color: var(--indicator-color);
    pointer-events: none;
  }
`;