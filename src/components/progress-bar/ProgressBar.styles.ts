import { css } from 'lit';

export const styles = css`
  :host {
    position: relative;
    display: block;
    width: 100%;
    height: 12px;
    border-radius: 9999px;
    background-color: var(--u-neutral-200);
    box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.1);
    overflow: hidden;

    --progress-value: 0;
  }

  .indicator {
    position: absolute;
    inset: 0 0 0 0;
    display: block;
    width: 100%;
    height: 100%;
    border-radius: inherit;
    background-color: var(--u-blue-600);
    transform-origin: left center;
    will-change: transform, opacity;
  }
  .indicator[state="turned-on"] {
    opacity: 0;
    transform: scaleX(0);
    transition: none;
  }
  .indicator[state="turned-off"] {
    opacity: 0;
    transform: scaleX(1);
    transition: transform 0.3s ease, opacity 0.5s ease;
  }
  .indicator[state="determinate"] {
    opacity: 1;
    transform: scaleX(var(--progress-value));
    transition: transform 0.3s ease;
  }
  .indicator[state="indeterminate"] {
    opacity: 1;
    transform: scaleX(1);
    animation: indeterminate 1.5s cubic-bezier(0.65, 0.815, 0.735, 0.395) infinite;
  }

  .content {
    position: relative;
    z-index: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 8px;
    line-height: 12px;
    color: var(--u-neutral-800);
    white-space: nowrap;
    user-select: none;
    pointer-events: none;
  }

  @keyframes indeterminate {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }
`;