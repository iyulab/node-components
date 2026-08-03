import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
    color: var(--u-txt-color, #212121);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

  /* ===== 컨테이너 (outlined 기본) ===== */
  .container {
    display: flex;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color, #E0E0E0);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color, #FFFFFF);
    transition: border-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), box-shadow var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1)), background-color var(--u-duration-normal, 220ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
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
    border-color: transparent;
    background-color: var(--u-neutral-200, #EEEEEE);
    border-radius: 0.25em 0.25em 0 0;
    border-bottom: 2px solid var(--u-input-border-color, #E0E0E0);
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
    border: none;
    border-radius: var(--u-radius-none, 0);
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color, #E0E0E0);
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

  /* ===== Textarea 요소 ===== */
  textarea {
    display: block;
    border: none;
    background: none;
    outline: none;
    padding: 0;
    margin: 0;
    color: inherit;
    font: inherit;
    flex: 1;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  textarea::placeholder {
    color: var(--u-txt-color-weak, #757575);
  }
  textarea:disabled {
    cursor: not-allowed;
  }
  textarea:read-only {
    cursor: default;
  }
  textarea:focus,
  textarea:focus-visible {
    outline: none;
  }

  :host([resize="none"]) textarea { 
    resize: none; 
  }
  :host([resize="vertical"]) textarea { 
    resize: vertical; 
  }
  :host([resize="horizontal"]) textarea { 
    resize: horizontal; 
  }
  :host([resize="both"]) textarea { 
    resize: both; 
  }
  :host([resize="auto"]) textarea {
    resize: none;
    overflow: hidden;
  }
  :host([disabled]) textarea,
  :host([readonly]) textarea {
    resize: none;
  }

  /* ===== 카운터 ===== */
  .counter {
    margin-top: 0.25em;
    text-align: right;
    color: var(--u-txt-color-weak, #757575);
    font-size: 0.75em;
    line-height: 1.2;
  }
`;
