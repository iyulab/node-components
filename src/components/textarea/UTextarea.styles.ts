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

  /* ===== 헤더 영역 ===== */
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

  /* ===== 컨테이너 (outlined 기본) ===== */
  .container {
    display: flex;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease;
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

  /* ===== Textarea 요소 ===== */
  textarea {
    all: unset;
    flex: 1;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  textarea::placeholder {
    color: var(--u-txt-color-weak);
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

  /* ===== Resize 모드 ===== */
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

  /* ===== 하단 영역 ===== */
  .footer {
    display: flex;
    flex-direction: column;
  }
  .footer:not(:has(:not([hidden]))) {
    display: none;
  }

  .counter {
    margin-top: 0.25em;
    text-align: right;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
  }

  .description {
    margin-top: 0.5em;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
  }

  .validation-message {
    margin-top: 0.5em;
    color: var(--u-red-600);
    font-size: 0.75em;
    line-height: 1.2;
  }
`;
