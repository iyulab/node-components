import { css } from "lit";

export const styles = css`
  :host {
    --input-popover-min-width: 100%;
    --input-popover-max-width: 90vw;
    --input-popover-min-height: 40px;
    --input-popover-max-height: 50vh;
  }

  :host {
    position: relative;
    display: inline-block;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
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
  :host([readonly]) .container,
  :host([disabled]) .container {
    border-color: var(--u-border-color-weak);
    background-color: var(--u-bg-color-disabled);
  }
  :host(:not([readonly]):not([disabled])) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover);
  }
  :host(:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus);
  }
  :host([invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid);
  }

  /* ===== Variant: filled ===== */
  :host([variant="filled"]) .container {
    border: none;
    border-radius: 0.25em 0.25em 0 0;
    border-bottom: 2px solid var(--u-input-border-color);
    background-color: var(--u-neutral-200);
  }
  :host([variant="filled"][readonly]) .container,
  :host([variant="filled"][disabled]) .container {
    background-color: var(--u-bg-color-disabled);
    border-bottom-color: var(--u-border-color-weak);
  }
  :host([variant="filled"]:not([readonly]):not([disabled])) .container:hover {
    box-shadow: none;
    background-color: var(--u-neutral-300);
    border-bottom-color: var(--u-input-border-color-hover);
  }
  :host([variant="filled"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus);
  }
  :host([variant="filled"][invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid);
  }

  /* ===== Variant: underlined ===== */
  :host([variant="underlined"]) .container {
    padding-left: 0;
    padding-right: 0;
    border: none;
    border-radius: 0;
    border-bottom: 1px solid var(--u-input-border-color);
    background-color: transparent;
  }
  :host([variant="underlined"][readonly]) .container,
  :host([variant="underlined"][disabled]) .container {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak);
  }
  :host([variant="underlined"]:not([readonly]):not([disabled])) .container:hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover);
  }
  :host([variant="underlined"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus);
    border-bottom-width: 2px;
  }
  :host([variant="underlined"][invalid]:not([readonly]):not([disabled])) .container {
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
  :host([variant="borderless"]:not([readonly]):not([disabled])) .container:hover,
  :host([variant="borderless"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
  }

  /* 네이티브 input */
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
  input[type="search"]::-webkit-search-cancel-button {
    -webkit-appearance: none;
    appearance: none;
  }
  input[type="number"] {
    -moz-appearance: textfield;
  }
  input[type="number"]::-webkit-inner-spin-button,
  input[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  /* 슬롯에 내용이 있을 때 gap 적용 */
  ::slotted([slot="prefix"]) {
    margin-right: 0.25em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.25em;
  }

  /* 아이콘 영역 (clear, password toggle 등) */
  .suffix-item {
    margin-left: 0.25em;
    color: var(--u-icon-color);
    font-size: 1em;
    transition: color 0.2s ease;
    cursor: pointer;
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover);
  }
  .suffix-item:active {
    color: var(--u-icon-color-active);
  }

  u-popover {
    min-width: var(--input-popover-min-width);
    max-width: var(--input-popover-max-width);
    min-height: var(--input-popover-min-height);
    max-height: var(--input-popover-max-height);
    padding: 4px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-panel-bg-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    overflow-x: auto;
    overflow-y: auto;
  }
`;
