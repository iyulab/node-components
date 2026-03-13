import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25em;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
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
  :host([invalid]) .checkbox {
    border-color: var(--u-red-600);
  }
  :host([checked]) .checkbox u-icon,
  :host([indeterminate]) .checkbox u-icon {
    transform: scale(1);
  }

  .wrapper {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    cursor: inherit;
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
    border: 2px solid var(--u-input-border-color);
    border-radius: 0.2em;
    background-color: var(--u-input-bg-color);
    transition: border-color 0.2s ease, background-color 0.2s ease;
  }
  :host(:not([disabled]):not([readonly]):hover) .checkbox {
    border-color: var(--u-input-border-color-hover);
  }

  /* 체크박스 아이콘 */
  .checkbox u-icon {
    font-size: 0.85em;
    transform: scale(0);
    transition: transform 0.15s ease;
  }

  /* === Variant: filled (기본) - 체크 시 배경 채움 === */
  :host([variant="filled"][checked]) .checkbox,
  :host([variant="filled"][indeterminate]) .checkbox {
    color: var(--u-neutral-100);
    border-color: var(--u-blue-600);
    background-color: var(--u-blue-600);
  }

  /* === Variant: outline (기본) - 체크 시 테두리만 === */
  :host([variant="outline"][checked]) .checkbox,
  :host([variant="outline"][indeterminate]) .checkbox {
    border-color: var(--u-blue-600);
    background-color: transparent;
  }

  /* === Color variants (filled) === */
  :host([variant="filled"][color="blue"][checked]) .checkbox,
  :host([variant="filled"][color="blue"][indeterminate]) .checkbox {
    border-color: var(--u-blue-600);
    background-color: var(--u-blue-600);
  }
  :host([variant="filled"][color="green"][checked]) .checkbox,
  :host([variant="filled"][color="green"][indeterminate]) .checkbox {
    border-color: var(--u-green-600);
    background-color: var(--u-green-600);
  }
  :host([variant="filled"][color="red"][checked]) .checkbox,
  :host([variant="filled"][color="red"][indeterminate]) .checkbox {
    border-color: var(--u-red-600);
    background-color: var(--u-red-600);
  }
  :host([variant="filled"][color="orange"][checked]) .checkbox,
  :host([variant="filled"][color="orange"][indeterminate]) .checkbox {
    border-color: var(--u-orange-600);
    background-color: var(--u-orange-600);
  }
  :host([variant="filled"][color="teal"][checked]) .checkbox,
  :host([variant="filled"][color="teal"][indeterminate]) .checkbox {
    border-color: var(--u-teal-600);
    background-color: var(--u-teal-600);
  }
  :host([variant="filled"][color="cyan"][checked]) .checkbox,
  :host([variant="filled"][color="cyan"][indeterminate]) .checkbox {
    border-color: var(--u-cyan-600);
    background-color: var(--u-cyan-600);
  }
  :host([variant="filled"][color="purple"][checked]) .checkbox,
  :host([variant="filled"][color="purple"][indeterminate]) .checkbox {
    border-color: var(--u-purple-600);
    background-color: var(--u-purple-600);
  }
  :host([variant="filled"][color="pink"][checked]) .checkbox,
  :host([variant="filled"][color="pink"][indeterminate]) .checkbox {
    border-color: var(--u-pink-600);
    background-color: var(--u-pink-600);
  }
  :host([variant="filled"][color="neutral"][checked]) .checkbox,
  :host([variant="filled"][color="neutral"][indeterminate]) .checkbox {
    border-color: var(--u-neutral-600);
    background-color: var(--u-neutral-600);
  }

  /* === Color variants (outline) === */
  :host([variant="outline"][color="blue"][checked]) .checkbox,
  :host([variant="outline"][color="blue"][indeterminate]) .checkbox {
    color: var(--u-blue-600); 
    border-color: var(--u-blue-600);
  }
  :host([variant="outline"][color="green"][checked]) .checkbox,
  :host([variant="outline"][color="green"][indeterminate]) .checkbox {
    color: var(--u-green-600); 
    border-color: var(--u-green-600);
  }
  :host([variant="outline"][color="red"][checked]) .checkbox,
  :host([variant="outline"][color="red"][indeterminate]) .checkbox {
    color: var(--u-red-600);
    border-color: var(--u-red-600);
  }
  :host([variant="outline"][color="orange"][checked]) .checkbox,
  :host([variant="outline"][color="orange"][indeterminate]) .checkbox {
    color: var(--u-orange-600);
    border-color: var(--u-orange-600);
  }
  :host([variant="outline"][color="teal"][checked]) .checkbox,
  :host([variant="outline"][color="teal"][indeterminate]) .checkbox {
    color: var(--u-teal-600);
    border-color: var(--u-teal-600);
  }
  :host([variant="outline"][color="cyan"][checked]) .checkbox,
  :host([variant="outline"][color="cyan"][indeterminate]) .checkbox {
    color: var(--u-cyan-600);
    border-color: var(--u-cyan-600);
  }
  :host([variant="outline"][color="purple"][checked]) .checkbox,
  :host([variant="outline"][color="purple"][indeterminate]) .checkbox {
    color: var(--u-purple-600);
    border-color: var(--u-purple-600);
  }
  :host([variant="outline"][color="pink"][checked]) .checkbox,
  :host([variant="outline"][color="pink"][indeterminate]) .checkbox {
    color: var(--u-pink-600);
    border-color: var(--u-pink-600);
  }
  :host([variant="outline"][color="neutral"][checked]) .checkbox,
  :host([variant="outline"][color="neutral"][indeterminate]) .checkbox {
    color: var(--u-neutral-600);
    border-color: var(--u-neutral-600);
  }

  /* 숨김 input */
  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
    padding: 0;
  }
  input:focus-visible ~ .checkbox {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  /* 라벨 */
  .label {
    display: inline-flex;
    align-items: center;
    gap: 0.25em;
    line-height: 1.5;
  }

  /* 필수 표시 */
  .required {
    color: var(--u-red-600);
    font-weight: 500;
  }

  /* 설명 텍스트 */
  .description {
    margin-left: calc((1.2 + 0.5) / 0.75 * 1em);
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.3;
  }
`;
