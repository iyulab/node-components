import { css } from "lit";

export const styles = css`
  :host {
    position: relative;
    display: inline-block;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
  }
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }

  /* 헤더 영역 */
  .header {
    display: flex;
    flex-direction: row;
    justify-content: flex-start;
    align-items: center;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    user-select: none;
  }
  .header .required {
    color: var(--u-red-600);
    margin-right: 0.25em;
  }
  .header .label {
    font-weight: 500;
    line-height: 1.25;
    cursor: pointer;
  }

  /* 입력 래퍼 */
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    overflow: hidden;
  }
  .container[readonly],
  .container[disabled] {
    border-color: var(--u-border-color-weak);
    background-color: var(--u-bg-color-disabled);
  }
  .container:not([readonly]):not([disabled]):hover {
    box-shadow: 
      0 0 0 1px var(--u-input-border-color-hover),
      0 0 0 3px rgba(59, 130, 246, 0.12);
  }
  .container:not([readonly]):not([disabled]):focus-within {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }
  .container:not([readonly]):not([disabled])[invalid] {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-invalid),
      0 0 0 3px rgba(220, 38, 38, 0.12);
  }

  /* ===== Variant: filled ===== */
  :host([variant="filled"]) .container {
    border-color: transparent;
    background-color: var(--u-bg-color-muted, rgba(0, 0, 0, 0.06));
    border-radius: 0.25em 0.25em 0 0;
    border-bottom: 2px solid var(--u-input-border-color);
  }
  :host([variant="filled"]) .container[readonly],
  :host([variant="filled"]) .container[disabled] {
    background-color: var(--u-bg-color-disabled);
    border-bottom-color: var(--u-border-color-weak);
  }
  :host([variant="filled"]) .container:not([readonly]):not([disabled]):hover {
    box-shadow: none;
    background-color: var(--u-bg-color-muted-hover, rgba(0, 0, 0, 0.09));
    border-bottom-color: var(--u-input-border-color-hover);
  }
  :host([variant="filled"]) .container:not([readonly]):not([disabled]):focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus);
  }
  :host([variant="filled"]) .container:not([readonly]):not([disabled])[invalid] {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid);
  }

  /* ===== Variant: underlined ===== */
  :host([variant="underlined"]) .container {
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color);
  }
  :host([variant="underlined"]) .container[readonly],
  :host([variant="underlined"]) .container[disabled] {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak);
  }
  :host([variant="underlined"]) .container:not([readonly]):not([disabled]):hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover);
  }
  :host([variant="underlined"]) .container:not([readonly]):not([disabled]):focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus);
    border-bottom-width: 2px;
  }
  :host([variant="underlined"]) .container:not([readonly]):not([disabled])[invalid] {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid);
  }

  /* ===== Variant: borderless ===== */
  :host([variant="borderless"]) .container {
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }
  :host([variant="borderless"]) .container:hover,
  :host([variant="borderless"]) .container:focus-within {
    box-shadow: none;
  }

  /* 입력 필드 */
  input {
    all: unset;
    flex: 1 0 auto;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
  }
  input::placeholder {
    color: var(--u-txt-color-weak);
  }
  input:disabled {
    cursor: not-allowed;
  }
  input:read-only {
    cursor: default;
  }
  input:focus-visible {
    outline: none;
  }

  /* 슬롯에 내용이 있을 때 gap 적용 */
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.5em;
  }

  /* 아이콘 영역 (clear, password toggle 등) */
  .icon {
    color: var(--u-icon-color);
    font-size: 1em;
    transition: color 0.2s ease;
    cursor: pointer;
  }
  .icon:hover {
    color: var(--u-icon-color-hover);
  }
  .icon:active {
    color: var(--u-icon-color-active);
  }

  /* 접두/접미 아이콘 간격 */
  .icon.prefix {
    margin-right: 0.5em;
  }
  .icon.suffix {
    margin-left: 0.5em;
  }

  /* 유효성 검사 에러 메시지 */
  .validation-message {
    margin-top: 0.5em;
    color: var(--u-red-600);
    font-size: 0.75em;
    line-height: 1.2;
  }

  /* 설명 텍스트 */
  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
  }

  /* input 기본 제공 스타일 초기화 */
  input[type="number"] {
    -moz-appearance: textfield;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* ===== Combobox 드롭다운 (u-popover) ===== */

  u-popover.dropdown {
    min-width: 100%;
    max-height: 240px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  .empty-message {
    padding: 8px 12px;
    color: var(--u-txt-color-weak);
    font-size: 0.85em;
    text-align: center;
    user-select: none;
  }
`;