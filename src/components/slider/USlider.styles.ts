import { css } from "lit";

export const styles = css`
  :host {
    --slider-fill-color: var(--u-blue-600);
    --slider-track-color: var(--u-neutral-300);
    --slider-track-height: 6px;
    --slider-thumb-size: 18px;
    --slider-thumb-color: var(--u-blue-600);
    --slider-thumb-border-color: var(--u-neutral-0);
    --slider-mark-size: 12px;
    --slider-mark-color: var(--u-neutral-0);
    --slider-mark-border-color: var(--u-neutral-400);
  }

  :host {
    display: block;
    width: 100%;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  .container {
    position: relative;
    height: var(--slider-thumb-size);
    touch-action: none;
    user-select: none;
    -webkit-user-select: none;
    cursor: pointer;
  }

  .track {
    position: absolute;
    left: 0;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    height: var(--slider-track-height);
    border-radius: calc(var(--slider-track-height) / 2);
    background: var(--slider-track-color);
    overflow: visible;
  }

  .fill {
    position: absolute;
    top: 0;
    bottom: 0;
    border-radius: inherit;
    background: var(--slider-fill-color);
  }

  .thumb {
    position: absolute;
    z-index: 1;
    top: 50%;
    transform: translate(-50%, -50%);
    outline: none;
  }

  .thumb-content {
    width: var(--slider-thumb-size);
    height: var(--slider-thumb-size);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 2px solid var(--slider-thumb-border-color);
    border-radius: 50%;
    background: var(--slider-thumb-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.15s ease, box-shadow 0.15s ease;
    cursor: pointer;
  }
  .thumb:hover .thumb-content,
  .thumb:active .thumb-content {
    transform: scale(1.15);
    box-shadow: 0 1px 5px rgba(0, 0, 0, 0.3);
  }
  .thumb:focus-visible .thumb-content {
    box-shadow: 0 0 0 1px var(--slider-fill-color);
  }

  /* 슬롯에 커스텀 엘리먼트가 들어오면 기본 스타일 제거 */
  .thumb-content:has(::slotted(*)) {
    width: auto;
    height: auto;
    border: none;
    border-radius: 0;
    background: transparent;
    box-shadow: none;
  }

  .marks {
    position: absolute;
    z-index: 0;
    inset: 0;
    pointer-events: none;
  }

  .mark {
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: var(--slider-mark-size);
    height: var(--slider-mark-size);
    border: 2px solid var(--slider-mark-border-color);
    border-radius: 50%;
    background: var(--slider-mark-color);
  }

  .mark-labels {
    position: relative;
    margin-top: 12px;
  }

  .mark-label {
    position: absolute;
    transform: translateX(-50%);
    font-size: 0.75em;
    color: var(--u-txt-color-weak);
    white-space: nowrap;
  }
`;
