import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
    cursor: pointer;
    user-select: none;
  }
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }
  :host([readonly]) {
    cursor: default;
  }

  /* ===== Default 타입 ===== */

  .wrapper {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    cursor: inherit;
  }

  /* 라디오 원형 */
  .radio {
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25em;
    height: 1.25em;
    border: 2px solid var(--u-input-border-color);
    border-radius: 50%;
    background-color: var(--u-input-bg-color);
    transition: border-color 0.2s ease, background-color 0.2s ease;
    flex-shrink: 0;
  }
  :host(:not([disabled]):not([readonly]):hover) .radio {
    border-color: var(--u-input-border-color-hover);
  }

  /* 내부 원 */
  .radio::after {
    content: '';
    display: block;
    width: 0.45em;
    height: 0.45em;
    border-radius: 50%;
    background-color: var(--u-neutral-0);
    transform: scale(0);
    transition: transform 0.15s ease;
  }
  :host([checked]) .radio::after {
    transform: scale(1);
  }

  /* === Variant: filled (기본) - 선택 시 배경 채움 === */
  :host([variant="filled"][checked]) .radio {
    border-color: var(--u-blue-600);
    background-color: var(--u-blue-600);
  }

  /* === Variant: outlined - 선택 시 테두리만 === */
  :host([variant="outlined"][checked]) .radio {
    border-color: var(--u-blue-600);
    background-color: transparent;
  }
  :host([variant="outlined"][checked]) .radio::after {
    background-color: var(--u-blue-600);
  }

  /* 포커스 링 */
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
  }
  input:focus-visible ~ .radio {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  .label {
    line-height: 1.5;
  }

  /* ===== Button 타입 ===== */

  .button-wrapper {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    cursor: inherit;
  }

  .button-label {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 0.5em 1em;
    border: 1px solid var(--u-input-border-color);
    background-color: var(--u-input-bg-color);
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: inherit;
    line-height: 1.5;
    transition: border-color 0.2s ease, background-color 0.2s ease, color 0.2s ease;
    user-select: none;
  }
  :host(:not([disabled]):not([readonly]):hover) .button-label {
    border-color: var(--u-input-border-color-hover);
    background-color: var(--u-neutral-100);
  }

  /* Button 타입 - filled variant 선택 시 */
  :host([type="button"][variant="filled"][checked]) .button-label {
    border-color: var(--u-blue-600);
    background-color: var(--u-blue-600);
    color: var(--u-neutral-0);
  }

  /* Button 타입 - outlined variant 선택 시 */
  :host([type="button"][variant="outlined"][checked]) .button-label {
    border-color: var(--u-blue-600);
    background-color: transparent;
    color: var(--u-blue-600);
  }

  /* Button 타입 포커스 링 */
  :host([type="button"]) input:focus-visible ~ .button-label {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  /* === Button 타입 - Horizontal 배치 === */
  :host([type="button"][orientation="horizontal"]:first-child) .button-label {
    border-radius: 0.375em 0 0 0.375em;
  }
  :host([type="button"][orientation="horizontal"]:last-child) .button-label {
    border-radius: 0 0.375em 0.375em 0;
  }
  :host([type="button"][orientation="horizontal"]:not(:first-child)) .button-label {
    margin-left: -1px;
  }
  :host([type="button"][orientation="horizontal"]:only-child) .button-label {
    border-radius: 0.375em;
    margin-left: 0;
  }

  /* === Button 타입 - Vertical 배치 === */
  :host([type="button"][orientation="vertical"]) {
    display: flex;
    width: 100%;
  }
  :host([type="button"][orientation="vertical"]) .button-wrapper {
    width: 100%;
  }
  :host([type="button"][orientation="vertical"]) .button-label {
    width: 100%;
    justify-content: center;
  }
  :host([type="button"][orientation="vertical"]:first-child) .button-label {
    border-radius: 0.375em 0.375em 0 0;
  }
  :host([type="button"][orientation="vertical"]:last-child) .button-label {
    border-radius: 0 0 0.375em 0.375em;
  }
  :host([type="button"][orientation="vertical"]:not(:first-child)) .button-label {
    margin-top: -1px;
  }
  :host([type="button"][orientation="vertical"]:only-child) .button-label {
    border-radius: 0.375em;
    margin-top: 0;
  }
`;
