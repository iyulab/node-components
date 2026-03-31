import { css } from 'lit';

export const styles = css`
  :host {
    --spinner-track-width: 0.125em;
    --spinner-track-color: var(--u-neutral-200);
    --spinner-indicator-color: var(--u-neutral-800);
    --spinner-indicator-speed: 2s;
  }

  /* Color variants */
  :host([color="blue"]) { --spinner-indicator-color: var(--u-blue-600); }
  :host([color="green"]) { --spinner-indicator-color: var(--u-green-600); }
  :host([color="yellow"]) { --spinner-indicator-color: var(--u-yellow-600); }
  :host([color="red"]) { --spinner-indicator-color: var(--u-red-600); }
  :host([color="orange"]) { --spinner-indicator-color: var(--u-orange-600); }
  :host([color="teal"]) { --spinner-indicator-color: var(--u-teal-600); }
  :host([color="cyan"]) { --spinner-indicator-color: var(--u-cyan-600); }
  :host([color="purple"]) { --spinner-indicator-color: var(--u-purple-600); }
  :host([color="pink"]) { --spinner-indicator-color: var(--u-pink-600); }

  :host {
    display: inline-flex;
    flex-direction: column;
    align-items: center;
    gap: 0.25em;
    font-size: inherit;
  }

  .spinner {
    flex: 0 0 auto;
    width: 1em;
    height: 1em;
  }
  .spinner circle {
    fill: none;
    stroke-width: var(--spinner-track-width);
    r: calc(0.5em - var(--spinner-track-width) / 2);
    cx: 0.5em;
    cy: 0.5em;
  }

  .track {
    stroke: var(--spinner-track-color);
    transform-origin: 0% 0%;
  }

  .indicator {
    stroke: var(--spinner-indicator-color);
    stroke-linecap: round;
    stroke-dasharray: 150% 75%;
    transform-origin: 50% 50%;
    animation: spin var(--spinner-indicator-speed) linear infinite;
  }

  .label {
    font-size: 0.5em;
    color: var(--spinner-indicator-color);
    user-select: none;
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