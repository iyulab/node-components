import { css } from "lit";

export const styles = css`
  :host {
    --selected-color: var(--u-txt-color-inverse, #ffffff);
    --selected-bg-color: var(--u-blue-600, #0078d4);
  }

  :host {
    position: relative;
    display: flex;
    flex-direction: row;
    align-items: center;
    padding: 0.5em 1em;
    background-color: transparent;
    transition: background-color 0.15s ease;
    user-select: none;
    cursor: pointer;
  }
  :host([disabled]) {
    opacity: 0.5;
    pointer-events: none;
    cursor: not-allowed;
  }
  :host([selected]) {
    color: var(--selected-color);
    background-color: var(--selected-bg-color);
  }
  :host(:not([disabled]):not([selected]):hover),
  :host(:not([disabled]):not([selected]):focus-visible) {
    background-color: var(--u-bg-color-hover);
  }

  /* 라벨 영역 */
  .label {
    flex: 1 1 auto;
    font-size: 1em;
    line-height: 1.5;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  /* prefix/suffix 슬롯 */
  ::slotted([slot="prefix"]) {
    margin-right: 0.5em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.5em;
  }

  /* 아이콘 공통 스타일 */
  .icon {
    color: var(--u-txt-color);
    font-size: 0.75em;
  }
  .icon.prefix {
    margin-right: 0.5em;
  }
  .icon.suffix {
    margin-left: 0.5em;
  }
`;