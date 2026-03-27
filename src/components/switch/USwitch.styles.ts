import { css } from "lit";

export const styles = css`
  :host {
    --switch-track-width: 2.4em;
    --switch-track-height: 1.4em;
    --switch-track-color: var(--u-neutral-300);
    --switch-track-color-checked: var(--u-blue-600);
    --switch-thumb-size: 1.1em;
    --switch-thumb-offset: 0.15em;
    --switch-thumb-color: #fff;
    --switch-thumb-color-checked: #fff;
    --switch-radius: 9999px;
    --switch-duration: 0.25s;
    --switch-move-width: calc(var(--switch-track-width) - var(--switch-thumb-size) - var(--switch-thumb-offset) * 2);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
    user-select: none;
    cursor: pointer;
  }

  /* === 상태 스타일 === */
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  :host([readonly]) {
    cursor: default;
  }
  :host([invalid]) .track {
    outline: 2px solid var(--u-red-600);
    outline-offset: 1px;
  }
  :host(:not([disabled]):not([readonly]):hover) .track {
    filter: brightness(0.95);
  }

  .wrapper {
    display: inline-flex;
    align-items: center;
    gap: 0.6em;
    cursor: inherit;
  }

  /* === 네이티브 input === */
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  input:focus-visible ~ .track {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  /* === 트랙 === */
  .track {
    position: relative;
    flex-shrink: 0;
    display: inline-flex;
    align-items: center;
    width: var(--switch-track-width);
    height: var(--switch-track-height);
    border-radius: var(--switch-radius);
    background: var(--switch-track-color);
    transition: background var(--switch-duration) ease;
  }
  :host([checked]) .track {
    background: var(--switch-track-color-checked);
  }

  /* === 트랙 인디케이터(슬롯) === */
  .track-checked,
  .track-unchecked {
    position: absolute;
    z-index: 0;
    top: 0;
    bottom: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    width: calc(50% - var(--switch-thumb-offset));
    font-size: 0.5em;
    font-weight: 600;
    line-height: 1;
    white-space: nowrap;
    pointer-events: none;
    transition: opacity var(--switch-duration) ease;
  }
  .track-checked {
    opacity: 0;
    left: var(--switch-thumb-offset);
    color: #fff;
  }
  :host([checked]) .track-checked {
    opacity: 1;
  }
  .track-unchecked {
    opacity: 1;
    right: var(--switch-thumb-offset);
    color: var(--u-txt-color-weak);
  }
  :host([checked]) .track-unchecked {
    opacity: 0;
  }

  /* === 핸들 === */
  .thumb {
    position: absolute;
    z-index: 1;
    left: var(--switch-thumb-offset);
    display: flex;
    align-items: center;
    justify-content: center;
    width: var(--switch-thumb-size);
    height: var(--switch-thumb-size);
    border-radius: var(--switch-radius);
    background: var(--switch-thumb-color);
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    overflow: hidden;
    transition:
      transform var(--switch-duration) cubic-bezier(0.4, 0, 0.2, 1),
      background var(--switch-duration) ease;
  }
  :host([checked]) .thumb {
    transform: translateX(var(--switch-move-width));
    background: var(--switch-thumb-color-checked);
  }

  /* === 핸들 인디케이터(슬롯) === */
  .thumb-checked,
  .thumb-unchecked {
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    font-size: 0.5em;
    font-weight: 600;
    line-height: 1;
    pointer-events: none;
    transition:
      opacity var(--switch-duration) ease,
      transform var(--switch-duration) ease;
  }
  .thumb-checked {
    opacity: 0;
    transform: scale(0.5) rotate(-90deg);
    color: var(--switch-track-color-checked);
  }
  :host([checked]) .thumb-checked {
    opacity: 1;
    transform: scale(1) rotate(0deg);
  }
  .thumb-unchecked {
    opacity: 1;
    transform: scale(1) rotate(0deg);
    color: var(--u-txt-color-weak);
  }
  :host([checked]) .thumb-unchecked {
    opacity: 0;
    transform: scale(0.5) rotate(90deg);
  }

  .label {
    font-size: 1em;
    line-height: var(--switch-track-height);
  }

  .required {
    color: var(--u-red-600);
    font-weight: 500;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.3;
  }
`;
