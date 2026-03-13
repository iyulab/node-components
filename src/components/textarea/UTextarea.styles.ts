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

  /* 텍스트영역 래퍼 */
  .container {
    display: flex;
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

  textarea {
    all: unset;
    flex: 1;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    resize: vertical;
    white-space: pre-wrap;
    word-wrap: break-word;
  }
  textarea::placeholder {
    color: var(--u-txt-color-weak);
  }
  textarea:disabled {
    cursor: not-allowed;
    resize: none;
  }
  textarea:read-only {
    cursor: default;
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

  /* 글자수 카운터 */
  .counter {
    margin-top: 0.25em;
    text-align: right;
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.2;
  }
`;
