import { css } from "lit";

export const styles = css`
  :host {
    flex-shrink: 0;
    position: relative;
    display: inline-flex;
    font-size: 0.9em;
    font-weight: 500;
    color: var(--u-txt-color-weak, #757575);
    white-space: nowrap;
    user-select: none;
    cursor: pointer;

    --tab-padding-block: 0.5em;
    --tab-padding-inline: 0.75em;
  }

  /* 여백은 내부 요소가 진다 — :host 에 두면 소비 앱 CSS 리셋에 지워진다. */
  .base {
    box-sizing: border-box;
    width: 100%;
    display: inline-flex;
    flex-direction: row;
    align-items: center;
    padding: var(--tab-padding-block) var(--tab-padding-inline);
    border-radius: inherit;
  }

  :host(:hover:not([disabled])) {
    color: var(--u-txt-color, #212121);
  }
  :host([disabled]) {
    color: var(--u-txt-color-disabled, #BDBDBD);
    cursor: not-allowed;
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.2em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.2em;
  }

  .remove-btn {
    flex-shrink: 0;
    margin-left: 0.2em;
    font-size: 0.75em;
    color: inherit;
    opacity: 0.5;
    transition: opacity var(--u-duration-fast, 140ms) var(--u-ease-standard, cubic-bezier(0.2, 0, 0, 1));
  }
  .remove-btn:hover {
    opacity: 1;
  }
`;
