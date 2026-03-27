import { css } from "lit";

export const styles = css`
  :host {
    --checkbox-color: inherit;
    --checkbox-border-color: var(--u-input-border-color);
    --checkbox-background-color: var(--u-input-bg-color);
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
  :host([invalid]) {
    --checkbox-border-color: var(--u-red-600);
  }
  :host([invalid]) .footer {
    color: var(--u-red-600);
  }
  :host([checked]) .checkbox u-icon,
  :host([indeterminate]) .checkbox u-icon {
    transform: scale(1);
  }
  :host(:not([disabled]):not([readonly]):hover) {
    --checkbox-border-color: var(--u-input-border-color-hover);
  }

  /* === Variant: filled - 배경 채움 === */
  :host([variant="filled"][checked]),
  :host([variant="filled"][indeterminate]) {
    --checkbox-color: var(--u-neutral-100);
    --checkbox-border-color: var(--u-blue-600);
    --checkbox-background-color: var(--u-blue-600);
  }

  /* === Variant: outline - 테두리만 === */
  :host([variant="outline"][checked]),
  :host([variant="outline"][indeterminate]) {
    --checkbox-border-color: var(--u-blue-600);
    --checkbox-background-color: transparent;
  }

  /* === Color variants (filled) === */
  :host([variant="filled"][color="blue"][checked]),
  :host([variant="filled"][color="blue"][indeterminate]) {
    --checkbox-border-color: var(--u-blue-600);
    --checkbox-background-color: var(--u-blue-600);
  }
  :host([variant="filled"][color="green"][checked]),
  :host([variant="filled"][color="green"][indeterminate]) {
    --checkbox-border-color: var(--u-green-600);
    --checkbox-background-color: var(--u-green-600);
  }
  :host([variant="filled"][color="red"][checked]),
  :host([variant="filled"][color="red"][indeterminate]) {
    --checkbox-border-color: var(--u-red-600);
    --checkbox-background-color: var(--u-red-600);
  }
  :host([variant="filled"][color="orange"][checked]),
  :host([variant="filled"][color="orange"][indeterminate]) {
    --checkbox-border-color: var(--u-orange-600);
    --checkbox-background-color: var(--u-orange-600);
  }
  :host([variant="filled"][color="teal"][checked]),
  :host([variant="filled"][color="teal"][indeterminate]) {
    --checkbox-border-color: var(--u-teal-600);
    --checkbox-background-color: var(--u-teal-600);
  }
  :host([variant="filled"][color="cyan"][checked]),
  :host([variant="filled"][color="cyan"][indeterminate]) {
    --checkbox-border-color: var(--u-cyan-600);
    --checkbox-background-color: var(--u-cyan-600);
  }
  :host([variant="filled"][color="purple"][checked]),
  :host([variant="filled"][color="purple"][indeterminate]) {
    --checkbox-border-color: var(--u-purple-600);
    --checkbox-background-color: var(--u-purple-600);
  }
  :host([variant="filled"][color="pink"][checked]),
  :host([variant="filled"][color="pink"][indeterminate]) {
    --checkbox-border-color: var(--u-pink-600);
    --checkbox-background-color: var(--u-pink-600);
  }
  :host([variant="filled"][color="neutral"][checked]),
  :host([variant="filled"][color="neutral"][indeterminate]) {
    --checkbox-border-color: var(--u-neutral-600);
    --checkbox-background-color: var(--u-neutral-600);
  }

  /* === Color variants (outline) === */
  :host([variant="outline"][color="blue"][checked]),
  :host([variant="outline"][color="blue"][indeterminate]) {
    --checkbox-color: var(--u-blue-600);
    --checkbox-border-color: var(--u-blue-600);
  }
  :host([variant="outline"][color="green"][checked]),
  :host([variant="outline"][color="green"][indeterminate]) {
    --checkbox-color: var(--u-green-600);
    --checkbox-border-color: var(--u-green-600);
  }
  :host([variant="outline"][color="red"][checked]),
  :host([variant="outline"][color="red"][indeterminate]) {
    --checkbox-color: var(--u-red-600);
    --checkbox-border-color: var(--u-red-600);
  }
  :host([variant="outline"][color="orange"][checked]),
  :host([variant="outline"][color="orange"][indeterminate]) {
    --checkbox-color: var(--u-orange-600);
    --checkbox-border-color: var(--u-orange-600);
  }
  :host([variant="outline"][color="teal"][checked]),
  :host([variant="outline"][color="teal"][indeterminate]) {
    --checkbox-color: var(--u-teal-600);
    --checkbox-border-color: var(--u-teal-600);
  }
  :host([variant="outline"][color="cyan"][checked]),
  :host([variant="outline"][color="cyan"][indeterminate]) {
    --checkbox-color: var(--u-cyan-600);
    --checkbox-border-color: var(--u-cyan-600);
  }
  :host([variant="outline"][color="purple"][checked]),
  :host([variant="outline"][color="purple"][indeterminate]) {
    --checkbox-color: var(--u-purple-600);
    --checkbox-border-color: var(--u-purple-600);
  }
  :host([variant="outline"][color="pink"][checked]),
  :host([variant="outline"][color="pink"][indeterminate]) {
    --checkbox-color: var(--u-pink-600);
    --checkbox-border-color: var(--u-pink-600);
  }
  :host([variant="outline"][color="neutral"][checked]),
  :host([variant="outline"][color="neutral"][indeterminate]) {
    --checkbox-color: var(--u-neutral-600);
    --checkbox-border-color: var(--u-neutral-600);
  }

  .wrapper {
    display: inline-flex;
    align-items: flex-start;
    gap: 0.5em;
    cursor: inherit;
  }

  /* 네이티브 체크박스 */
  input {
    position: absolute;
    opacity: 0;
    pointer-events: none;
  }
  input:focus-visible ~ .checkbox {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  /* 체크박스 외형 */
  .checkbox {
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.2em;
    height: 1.2em;
    color: var(--checkbox-color);
    border: 2px solid var(--checkbox-border-color);
    border-radius: 0.2em;
    background-color: var(--checkbox-background-color);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }

  /* 체크박스 아이콘 */
  .checkbox u-icon {
    font-size: 0.85em;
    transform: scale(0);
    transition: transform 0.15s ease;
  }

  .label {
    font-size: 1em;
    line-height: 1.2;
  }

  .required {
    color: var(--u-red-600);
    font-weight: 500;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
  }
`;
