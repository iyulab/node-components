import { css } from "lit";

export const styles = css`
  :host {
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
    align-items: center;
    margin-bottom: 0.5em;
    user-select: none;
  }
  .header .label {
    font-size: 0.8em;
    font-weight: 500;
    line-height: 1.2;
    cursor: pointer;
  }
  .header .required-mark {
    color: var(--u-red-600);
    margin-right: 0.25em;
  }
  .header .help-icon {
    font-size: 0.8em;
    margin-left: 0.5em;
    cursor: help;
  }
  .header .help-tooltip {
    font-size: 0.6em;
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
  }
  .container[readonly],
  .container[disabled] {
    border-color: var(--u-border-color-weak);
    background-color: var(--u-bg-color-disabled);
  }
  .container:hover:not([readonly]):not([disabled]) {
    box-shadow: 
      0 0 0 1px var(--u-input-border-color-hover),
      0 0 0 3px rgba(59, 130, 246, 0.12);
  }
  .container:focus-within:not([readonly]):not([disabled]) {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }
  .container[invalid]:not([readonly]):not([disabled]) {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-invalid),
      0 0 0 3px rgba(220, 38, 38, 0.12);
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

  /* 슬롯에 내용이 있을 때 gap 적용 */
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.5em;
  }

  /* 툴 영역 (clear, password toggle 등) */
  .suffix-items {
    display: flex;
    flex-direction: row;
    align-items: center;
  }
  .suffix-items u-icon {
    color: var(--u-icon-color);
    font-size: 1em;
    margin-left: 0.5em;
    transition: color 0.2s ease;
    cursor: pointer;
  }
  .suffix-items u-icon:hover {
    color: var(--u-icon-color-hover);
  }
  .suffix-items u-icon:active {
    color: var(--u-icon-color-active);
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
`;