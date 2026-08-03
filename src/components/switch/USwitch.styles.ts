import { css } from "lit";

export const styles = css`
  :host {
    --switch-track-width: 2.4em;
    --switch-track-height: 1.4em;
    --switch-track-color: var(--u-neutral-300, #E0E0E0);
    --switch-track-color-checked: var(--u-primary-color, #1976D2);
    --switch-thumb-size: 1.1em;
    --switch-thumb-offset: 0.15em;
    --switch-thumb-color: #fff;
    --switch-thumb-color-checked: #fff;
    --switch-radius: 9999px;
    /* ★로컬 축이지만 **기본값은 공용 축에서 파생**한다 — 그러지 않으면
       prefers-reduced-motion 이 이 컴포넌트만 비껴간다(축을 경유해야 함께 멈춘다).
       소비자가 --switch-duration 을 덮으면 그 값이 이긴다(로컬 축의 존재 이유). */
    --switch-duration: var(--u-duration-normal, 220ms);
    --switch-move-width: calc(var(--switch-track-width) - var(--switch-thumb-size) - var(--switch-thumb-offset) * 2);
  }

  :host {
    display: inline-flex;
    flex-direction: column;
    color: var(--u-txt-color, #212121);
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
    outline: 2px solid var(--u-danger-color, #D32F2F);
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
      0 0 0 1px var(--u-input-border-color-focus, #1565C0),
      0 0 0 3px color-mix(in srgb, var(--u-primary-color-strong, #1565C0) 22%, transparent);
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
    transition: background var(--switch-duration) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
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
    transition: opacity var(--switch-duration) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
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
    color: var(--u-txt-color-weak, #757575);
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
    box-shadow: var(--u-shadow-sm, 0 1px 3px rgba(0, 0, 0, 0.08), 0 1px 1px rgba(0, 0, 0, 0.04));
    overflow: hidden;
    transition:
      transform var(--switch-duration) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      background var(--switch-duration) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
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
      opacity var(--switch-duration) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)),
      transform var(--switch-duration) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
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
    color: var(--u-txt-color-weak, #757575);
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
    color: var(--u-danger-color-strong, #C62828);
    font-weight: 500;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak, #757575);
    font-size: 0.75em;
    line-height: 1.3;
  }

  :host([invalid]) .description {
    color: var(--u-danger-color-strong, #C62828);
  }
`;
