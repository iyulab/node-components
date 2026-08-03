import { css } from "lit";

export const styles = css`
  :host {
    --input-popover-min-height: 0px;
    --input-popover-max-height: 50vh;
  }

  :host {
    position: relative;
    /* 폼/그리드 셀에서 컨테이너 폭을 채우려면 소비자가 --u-input-display: block 을 준다.
       flex 컨테이너처럼 block 만으로 늘어나지 않는 맥락을 위해 width 경로도 함께 연다. */
    display: var(--u-input-display, inline-block);
    width: var(--u-input-width, auto);
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  /* 입력 래퍼 */
  .container {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color, #FFFFFF);
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    overflow: hidden;
  }
  :host([readonly]) .container,
  :host([disabled]) .container {
    border-color: var(--u-border-color-weak, #EEEEEE);
    background-color: var(--u-bg-color-disabled, #FAFAFA);
  }
  :host(:not([readonly]):not([disabled])) .container:hover {
    box-shadow: 0 0 0 1px var(--u-input-border-color-hover, #BDBDBD);
  }
  :host(:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: 0 0 0 1px var(--u-input-border-color-focus, #1565C0);
  }
  :host([invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: 0 0 0 1px var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Variant: filled ===== */
  :host([variant="filled"]) .container {
    border: none;
    border-radius: 0.25em 0.25em 0 0;
    border-bottom: 2px solid var(--u-input-border-color, #E0E0E0);
    background-color: var(--u-neutral-200, #EEEEEE);
  }
  :host([variant="filled"][readonly]) .container,
  :host([variant="filled"][disabled]) .container {
    background-color: var(--u-bg-color-disabled, #FAFAFA);
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([variant="filled"]:not([readonly]):not([disabled])) .container:hover {
    box-shadow: none;
    background-color: var(--u-neutral-300, #E0E0E0);
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([variant="filled"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
  }
  :host([variant="filled"][invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Variant: underlined ===== */
  :host([variant="underlined"]) .container {
    padding-left: 0;
    padding-right: 0;
    border: none;
    border-radius: var(--u-radius-none, 0);
    border-bottom: 1px solid var(--u-input-border-color, #E0E0E0);
    background-color: transparent;
  }
  :host([variant="underlined"][readonly]) .container,
  :host([variant="underlined"][disabled]) .container {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak, #EEEEEE);
  }
  :host([variant="underlined"]:not([readonly]):not([disabled])) .container:hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover, #BDBDBD);
  }
  :host([variant="underlined"]:not([readonly]):not([disabled])) .container:focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus, #1565C0);
    border-bottom-width: 2px;
  }
  :host([variant="underlined"][invalid]:not([readonly]):not([disabled])) .container {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid, #C62828);
  }

  /* ===== Variant: borderless ===== */
  :host([variant="borderless"]) .container {
    border: none;
    border-radius: var(--u-radius-none, 0);
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
    color: var(--u-txt-color-weak, #757575);
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
    color: var(--u-icon-color, #616161);
    font-size: 1em;
    transition: color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
    cursor: pointer;
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover, #1565C0);
  }
  .suffix-item:active {
    color: var(--u-icon-color-active, #1565C0);
  }

  u-popover {
    width: var(--input-popover-width, var(--anchor-width, 100%));
    min-height: var(--input-popover-min-height);
    max-height: var(--input-popover-max-height);
    padding: 4px;
    border: 1px solid var(--u-border-color, #E0E0E0);
    border-radius: var(--u-radius-lg, 6px);
    background-color: var(--u-panel-bg-color, #FFFFFF);
    box-shadow: var(--u-shadow-lg, 0 4px 12px rgba(0, 0, 0, 0.16), 0 2px 4px rgba(0, 0, 0, 0.06));
    overflow-x: auto;
    overflow-y: auto;
  }
`;
