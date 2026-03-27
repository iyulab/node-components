import { css } from "lit";

export const styles = css`
  :host {
    --select-popover-min-width: 100%;
    --select-popover-max-width: 90vw;
    --select-popover-min-height: 40px;
    --select-popover-max-height: 50vh;
  }

  :host {
    position: relative;
    display: inline-block;
    color: var(--u-txt-color);
    font-size: inherit;
    font-family: var(--u-font-base);
  }

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
    user-select: none;
    cursor: pointer;
  }
  :host([readonly]) .container,
  :host([disabled]) .container {
    border-color: var(--u-border-color-weak);
    background-color: var(--u-bg-color-disabled);
  }
  :host([disabled]) .container {
    cursor: not-allowed;
  }
  :host([readonly]) .container {
    cursor: default;
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
    border: none;
    border-radius: 0;
    background-color: transparent;
    padding-left: 0;
    padding-right: 0;
    border-bottom: 1px solid var(--u-input-border-color);
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

  .count {
    color: var(--u-txt-color-weak);
    line-height: 1.25;
  }

  .text-content {
    flex: 1;
    min-width: 0;
    line-height: 1.5;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .text-content.placeholder {
    color: var(--u-txt-color-weak);
  }

  .chips-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-wrap: wrap;
    gap: 4px;
  }

  ::slotted([slot="prefix"]) {
    margin-right: 0.25em;
  }
  ::slotted([slot="suffix"]) {
    margin-left: 0.25em;
  }

  .suffix-item {
    margin-left: 0.25em;
    font-size: 1em;
    color: var(--u-icon-color);
    transition: color 0.2s ease;
    cursor: pointer;
  }
  .suffix-item:hover {
    color: var(--u-icon-color-hover);
  }
  .suffix-item:active {
    color: var(--u-icon-color-active);
  }

  /* 드롭다운 패널 */
  u-popover {
    min-width: var(--select-popover-min-width);
    max-width: var(--select-popover-max-width);
    min-height: var(--select-popover-min-height);
    max-height: var(--select-popover-max-height);
    padding: 4px;
    border: 1px solid var(--u-border-color);
    border-radius: 6px;
    background-color: var(--u-panel-bg-color);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12);
    overflow-x: hidden;
    overflow-y: auto;
  }

  .search-input {
    display: flex;
    align-items: center;
    gap: 0.4em;
    padding: 0.3em 0.6em;
    color: var(--u-txt-color-weak);
    border-bottom: 1px solid var(--u-border-color);
  }
  .search-input input {
    all: unset;
    flex: 1;
    min-width: 0;
    line-height: 1.5;
  }
  .search-input input::placeholder {
    color: var(--u-txt-color-weak);
  }
`;
