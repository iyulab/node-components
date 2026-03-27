import { css } from "lit";

export const styles = css`
  :host {
    --option-color-interactive: inherit;
    --option-border-color-interactive: var(--u-border-color-hover);
    --option-background-color-interactive: var(--u-bg-color-hover);

    --option-color-active: inherit;
    --option-border-color-active: var(--u-blue-600);
    --option-background-color-active: var(--u-blue-100);

    --option-color-active-interactive: inherit;
    --option-border-color-active-interactive: var(--u-blue-600);
    --option-background-color-active-interactive: var(--u-blue-200);
  }

  :host {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.25em 0.5em;
    transition: background-color 0.15s ease, color 0.15s ease;
    user-select: none;
    cursor: pointer;
  }
  :host(:focus-visible) {
    outline: none;
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
  }

  :host(:not([disabled]):hover),
  :host(:not([disabled]):focus-visible) {
    color: var(--option-color-interactive);
    border-color: var(--option-border-color-interactive);
    background-color: var(--option-background-color-interactive);
  }
  :host([selected]) {
    font-weight: 600;
    color: var(--option-color-active);
    border-color: var(--option-border-color-active);
    background-color: var(--option-background-color-active);
  }
  :host([selected]:hover),
  :host([selected]:focus-visible) {
    color: var(--option-color-active-interactive);
    border-color: var(--option-border-color-active-interactive);
    background-color: var(--option-background-color-active-interactive);
  }

  :host([marker="radio"]:not([disabled]):hover),
  :host([marker="radio"]:not([disabled]):focus-visible) {
    color: inherit;
    border-color: transparent;
    background-color: transparent;
  }
  :host([marker="radio"][selected]) {
    font-weight: inherit;
    color: inherit;
    border-color: transparent;
    background-color: transparent;
  }
  :host([marker="radio"][selected]:hover),
  :host([marker="radio"][selected]:focus-visible) {
    color: inherit;
    border-color: transparent;
    background-color: transparent;
  }

  .content {
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  /* 라디오 마커 (원형) */
  .radio-marker {
    flex-shrink: 0;
    margin-right: 0.5em;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25em;
    height: 1.25em;
    border: 2px solid var(--u-neutral-400);
    border-radius: 50%;
    background-color: var(--u-bg-color);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  :host([marker="radio"]:not([disabled]):hover) .radio-marker,
  :host([marker="radio"]:not([disabled]):focus-visible) .radio-marker {
    border-color: var(--option-border-color-interactive);
  }
  :host([marker="radio"][selected]) .radio-marker {
    border-color: var(--option-border-color-active);
    background-color: var(--option-background-color-active);
  }
  :host([marker="radio"][selected]:hover) .radio-marker,
  :host([marker="radio"][selected]:focus-visible) .radio-marker {
    border-color: var(--option-border-color-active-interactive);
    background-color: var(--option-background-color-active-interactive);
  }

  /* 라디오 마커 내부 원 */
  .radio-marker::after {
    content: '';
    display: block;
    width: 0.45em;
    height: 0.45em;
    border-radius: 50%;
    background-color: var(--option-color-active);
    transform: scale(0);
    transition: transform 0.15s ease;
  }
  :host([marker="radio"][selected]) .radio-marker::after {
    transform: scale(1);
  }

  /* 체크 아이콘 */
  .check-marker {
    flex-shrink: 0;
    margin-right: 0.5em;
    color: var(--option-color-active);
  }
`;
