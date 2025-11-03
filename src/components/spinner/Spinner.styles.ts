import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-flex;
    font-size: inherit;

    --track-width: 0.125em;
    --track-color: var(--u-neutral-200, #e5e7eb);
    --indicator-color: var(--u-neutral-800, #1f2937);
  }

  .spinner {
    flex: 1 1 auto;
    width: 1em;
    height: 1em;
  }
  .spinner circle {
    fill: none;
    stroke-width: var(--track-width);
    r: calc(0.5em - var(--track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
  }

  .track {
    stroke: var(--track-color);
    transform-origin: 0% 0%;
  }

  .indicator {
    stroke: var(--indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    transform-origin: 50% 50%;
    animation: spin 2s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
      stroke-dasharray: 0.05em, 3em;
    }

    50% {
      transform: rotate(450deg);
      stroke-dasharray: 1.375em, 1.375em;
    }

    100% {
      transform: rotate(1080deg);
      stroke-dasharray: 0.05em, 3em;
    }
  }
`;