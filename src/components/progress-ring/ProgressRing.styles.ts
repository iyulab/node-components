import { css } from 'lit';

export const styles = css`
  :host {
    display: inline-block;
  }

  .progress-ring {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .ring-svg {
    display: block;
    transform: scale(1);
  }

  .track,
  .indicator {
    transition: stroke-dashoffset 0.5s ease-in-out;
  }

  .percentage {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: baseline;
    justify-content: center;
    font-family: var(--u-font-sans, system-ui, -apple-system, sans-serif);
    font-weight: 600;
    color: var(--u-color-neutral-900, #111827);
    user-select: none;
  }

  .value {
    font-size: calc(var(--progress-ring-size, 120px) * 0.25);
    line-height: 1;
  }

  .unit {
    font-size: calc(var(--progress-ring-size, 120px) * 0.12);
    margin-left: 0.1em;
    opacity: 0.7;
  }

  /* 크기 변수 지원 */
  :host {
    --progress-ring-size: 120px;
  }
`;