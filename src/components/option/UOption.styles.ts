import { css } from "lit";

export const styles = css`
  /* ===== Select / Combobox 모드 (기본) ===== */

  :host {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 6px;
    min-height: 32px;
    padding: 6px 8px;
    border-radius: 4px;
    background-color: transparent;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
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

  /* hover & focus */
  :host(:not([disabled]):hover),
  :host(:not([disabled]):focus-visible) {
    background-color: var(--u-bg-color-hover);
  }

  /* selected */
  :host([selected]) {
    font-weight: 600;
    color: var(--u-blue-700);
    background-color: var(--u-blue-100);
  }
  :host([selected]:hover),
  :host([selected]:focus-visible) {
    background-color: var(--u-blue-200);
  }

  u-icon {
    flex-shrink: 0;
  }

  /* ===== Radio 모드 ===== */

  :host([mode="radio"]) {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    min-height: unset;
    padding: 0;
    border-radius: 0;
    background-color: transparent;
    font-size: inherit;
    cursor: pointer;
  }
  :host([mode="radio"]:not([disabled]):hover),
  :host([mode="radio"]:not([disabled]):focus-visible) {
    background-color: transparent;
  }
  :host([mode="radio"][selected]) {
    font-weight: inherit;
    color: inherit;
    background-color: transparent;
  }
  :host([mode="radio"][selected]:hover),
  :host([mode="radio"][selected]:focus-visible) {
    background-color: transparent;
  }
  :host([mode="radio"][disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 라디오 마커 (원형) */
  .radio-marker {
    position: relative;
    display: var(--u-option-marker-display, inline-flex);
    align-items: center;
    justify-content: center;
    width: 1.25em;
    height: 1.25em;
    border: 2px solid var(--u-option-marker-border-color, var(--u-input-border-color));
    border-radius: 50%;
    background-color: var(--u-option-marker-bg-color, var(--u-input-bg-color));
    transition: border-color 0.2s ease, background-color 0.2s ease;
    flex-shrink: 0;
  }
  :host([mode="radio"]:not([disabled]):hover) .radio-marker {
    border-color: var(--u-input-border-color-hover);
  }

  /* 라디오 마커 내부 원 */
  .radio-marker::after {
    content: '';
    display: block;
    width: 0.45em;
    height: 0.45em;
    border-radius: 50%;
    background-color: var(--u-option-marker-dot-color, var(--u-neutral-0));
    transform: scale(0);
    transition: transform 0.15s ease;
  }
  :host([mode="radio"][selected]) .radio-marker::after {
    transform: scale(1);
  }

  /* filled variant (기본) - CSS 변수로 부모가 제어 */
  :host([mode="radio"][selected]) .radio-marker {
    border-color: var(--u-option-marker-active-border-color, var(--u-blue-600));
    background-color: var(--u-option-marker-active-bg-color, var(--u-blue-600));
  }

  /* 포커스 링 */
  :host([mode="radio"]:focus-visible) .radio-marker {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  .radio-label {
    line-height: 1.5;
  }
`;
