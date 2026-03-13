import { css } from 'lit';

export const styles = css`
  :host {
    --ring-size: 6em;
    --ring-color: var(--u-blue-600);
    --track-width: 6;
    --track-color: var(--u-neutral-200);
    --buffer-color: var(--u-blue-200);
  }

  /* === Status Colors === */
  :host([status="success"]) { 
    --ring-color: var(--u-green-600);
    --buffer-color: var(--u-green-200);
  }
  :host([status="warning"]) { 
    --ring-color: var(--u-yellow-500);
    --buffer-color: var(--u-yellow-200);
  }
  :host([status="error"]) { 
    --ring-color: var(--u-red-600);
    --buffer-color: var(--u-red-200);
  }
  :host([status="info"]) { 
    --ring-color: var(--u-blue-500);
    --buffer-color: var(--u-blue-200);
  }

  /* === Host === */
  :host {
    position: relative;
    display: inline-flex;
    width: var(--ring-size);
    height: var(--ring-size);
    font-size: inherit;
  }

  /* === Indeterminate === */
  :host([indeterminate]) .ring {
    animation: ring-rotate 1.4s linear infinite;
  }
  :host([indeterminate]) .indicator.indeterminate {
    animation: ring-dash 2s ease-in-out infinite;
    transition: none;
    stroke-linecap: round;
  }

  /* === SVG Ring === */
  .ring {
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: var(--track-width);
  }

  /* === Mask === */
  .mask-progress,
  .mask-buffer {
    transition: stroke-dashoffset 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* === Track === */
  .track {
    stroke: var(--track-color);
  }

  /* === Buffer === */
  .buffer {
    stroke: var(--buffer-color);
  }

  /* === Indicator === */
  .indicator {
    stroke: var(--ring-color);
  }
  
  /* === Content (슬롯) === */
  .content {
    position: absolute;
    inset: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 600;
    font-size: 1em;
    color: var(--ring-color);
    pointer-events: none;
  }

  @keyframes ring-rotate {
    from { transform: rotate(-90deg); }
    to { transform: rotate(270deg); }
  }

  @keyframes ring-dash {
    0% {
      stroke-dasharray: 1 99;
      stroke-dashoffset: 0;
    }
    50% {
      stroke-dasharray: 60 40;
      stroke-dashoffset: -20;
    }
    100% {
      stroke-dasharray: 1 99;
      stroke-dashoffset: -99;
    }
  }
`;
