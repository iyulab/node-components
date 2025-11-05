import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
    font-size: inherit;
  }
  :host([disabled]) {
    opacity: 0.5;
  }

  /* 헤더 영역 */
  .header {
    display: flex;
    align-items: center;
    gap: 0.375em;
    margin-bottom: 0.5em;
  }
  .header .label {
    font-size: 0.8em;
    font-weight: 500;
    line-height: 1;
    color: var(--u-text-color);
    user-select: none;
    cursor: pointer;
  }
  .header .required-mark {
    color: var(--u-red-600);
    margin-left: 0.25em;
  }
  .header .help-icon {
    font-size: 0.8em;
    cursor: help;
  }

  /* 입력 래퍼 */
  .container {
    display: flex;
    align-items: center;
    gap: 0.5em;
    padding: 0.5em 0.75em;
    background-color: var(--u-bg-color);
    border: 1px solid var(--u-input-border-color);
    border-radius: 0.375em;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
  }
  .container[invalid] {
    border-color: var(--u-red-600);
  }
  .container[invalid]:focus-within {
    box-shadow: 0 0 0 0.125em rgba(244, 67, 54, 0.1);
  }
  .container[disabled] {
    background-color: var(--u-bg-color-disabled);
    border-color: var(--u-border-color-weak);
    cursor: not-allowed;
  }
  .container[readonly] {
    background-color: var(--u-neutral-50);
    border-color: var(--u-border-color-weak);
  }
  .container:hover:not(([disabled])):not(([readonly])) {
    border-color: var(--u-input-border-hover);
  }
  .container:focus-within:not(([disabled])):not(([readonly])) {
    border-color: var(--u-input-border-focus);
    box-shadow: 0 0 0 0.125em rgba(33, 150, 243, 0.1);
    outline: none;
  }

  /* 입력 필드 */
  input {
    flex: 1;
    min-width: 0;
    border: none;
    background: transparent;
    outline: none;
    font-family: inherit;
    font-size: 1em;
    line-height: 1.5;
    color: var(--u-text-color);
    padding: 0;
  }
  input::placeholder {
    color: var(--u-text-color-disabled);
  }
  input:disabled {
    cursor: not-allowed;
    color: var(--u-text-color-disabled);
  }
  input:read-only {
    cursor: default;
  }

  /* Prefix & Suffix 슬롯 */
  ::slotted([slot="prefix"]),
  ::slotted([slot="suffix"]) {
    display: contents;
  }

  /* Tools 영역 (clear, password toggle 등) */
  .tools {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 0.375em;
  }
  .tool {
    font-size: 1.125em;
    color: var(--u-icon-color);
    transition: color 0.2s ease;
    cursor: pointer;
  }
  .tool:hover {
    color: var(--u-icon-color-hover);
  }
  .tool:active {
    color: var(--u-icon-color-active);
  }

  /* 유효성 검사 에러 메시지 */
  .validation-error {
    margin-top: 0.375em;
    font-size: 0.8125em;
    color: var(--u-red-600);
    line-height: 1.4;
  }

  /* 설명 텍스트 */
  .description {
    margin-top: 0.375em;
    font-size: 0.8125em;
    color: var(--u-soft-text-color);
    line-height: 1.4;
  }

  /* Number input 기본 스타일 제거 (브라우저 간 일관성 위해) */
  input[type="number"] {
    -moz-appearance: textfield;
  }
  /* Number input 스피너 제거 옵션 (선택적) */
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
`;