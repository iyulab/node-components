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

  /* 트리거 영역 */
  .trigger {
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color);
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    cursor: pointer;
    user-select: none;
  }
  .trigger[disabled] {
    border-color: var(--u-border-color-weak);
    background-color: var(--u-bg-color-disabled);
    cursor: not-allowed;
  }
  .trigger[readonly] {
    border-color: var(--u-border-color-weak);
    background-color: var(--u-bg-color-disabled);
    cursor: default;
  }
  .trigger:not([disabled]):not([readonly]):hover {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-hover),
      0 0 0 3px rgba(59, 130, 246, 0.12);
  }
  .trigger:not([disabled]):not([readonly]):focus-within {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }
  .trigger[invalid] {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-invalid),
      0 0 0 3px rgba(220, 38, 38, 0.12);
  }

  /* ===== Variant: filled ===== */
  :host([variant="filled"]) .trigger {
    border-color: transparent;
    background-color: var(--u-bg-color-muted, rgba(0, 0, 0, 0.06));
    border-radius: 0.25em 0.25em 0 0;
    border-bottom: 2px solid var(--u-input-border-color);
  }
  :host([variant="filled"]) .trigger[readonly],
  :host([variant="filled"]) .trigger[disabled] {
    background-color: var(--u-bg-color-disabled);
    border-bottom-color: var(--u-border-color-weak);
  }
  :host([variant="filled"]) .trigger:not([disabled]):not([readonly]):hover {
    box-shadow: none;
    background-color: var(--u-bg-color-muted-hover, rgba(0, 0, 0, 0.09));
    border-bottom-color: var(--u-input-border-color-hover);
  }
  :host([variant="filled"]) .trigger:not([disabled]):not([readonly]):focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus);
  }
  :host([variant="filled"]) .trigger[invalid] {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid);
  }

  /* ===== Variant: underlined ===== */
  :host([variant="underlined"]) .trigger {
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color);
  }
  :host([variant="underlined"]) .trigger[readonly],
  :host([variant="underlined"]) .trigger[disabled] {
    background-color: transparent;
    border-bottom-color: var(--u-border-color-weak);
  }
  :host([variant="underlined"]) .trigger:not([disabled]):not([readonly]):hover {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-hover);
  }
  :host([variant="underlined"]) .trigger:not([disabled]):not([readonly]):focus-within {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-focus);
    border-bottom-width: 2px;
  }
  :host([variant="underlined"]) .trigger[invalid] {
    box-shadow: none;
    border-bottom-color: var(--u-input-border-color-invalid);
  }

  /* ===== Variant: borderless ===== */
  :host([variant="borderless"]) .trigger {
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding: 0;
    box-shadow: none;
  }
  :host([variant="borderless"]) .trigger:hover,
  :host([variant="borderless"]) .trigger:focus-within {
    box-shadow: none;
  }

  /* 검색 입력 필드 */
  .search-input {
    all: unset;
    flex: 1;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
  }
  .search-input::placeholder {
    color: var(--u-txt-color-weak);
  }
  .search-input:disabled {
    cursor: not-allowed;
  }

  /* 표시 텍스트 */
  .display-text {
    flex: 1;
    min-width: 0;
    font-size: 1em;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .display-text.placeholder {
    color: var(--u-txt-color-weak);
  }

  /* 태그 (multiple 모드) */
  .tags {
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
    flex: 1;
    min-width: 0;
  }
  .tag {
    display: inline-flex;
    align-items: center;
    gap: 2px;
    padding: 0 6px;
    border-radius: 3px;
    background-color: var(--u-blue-100);
    color: var(--u-blue-700);
    font-size: 0.85em;
    line-height: 1.6;
    white-space: nowrap;
  }
  .tag-remove {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 14px;
    height: 14px;
    border: none;
    background: none;
    padding: 0;
    cursor: pointer;
    color: inherit;
    opacity: 0.6;
    font-size: 12px;
    line-height: 1;
  }
  .tag-remove:hover {
    opacity: 1;
  }

  /* 아이콘 */
  .icon {
    color: var(--u-icon-color);
    font-size: 1em;
    transition: color 0.2s ease, transform 0.2s ease;
    cursor: pointer;
    flex-shrink: 0;
    margin-left: 0.5em;
  }
  .icon:hover {
    color: var(--u-icon-color-hover);
  }
  .chevron {
    transition: transform 0.2s ease;
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  /* 드롭다운 패널 (u-popover) */
  u-popover.dropdown {
    min-width: 100%;
    max-height: 240px;
    overflow-x: hidden;
    overflow-y: auto;
  }

  /* 빈 상태 메시지 */
  .empty-message {
    padding: 8px 12px;
    color: var(--u-txt-color-weak);
    font-size: 0.85em;
    text-align: center;
    user-select: none;
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
`;
