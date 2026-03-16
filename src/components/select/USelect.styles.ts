import { css } from "lit";

export const styles = css`
  :host {
    display: inline-block;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
    font-size: inherit;
    position: relative;
  }
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.5em;
    font-size: 0.8em;
    user-select: none;
  }
  .required {
    color: var(--u-red-600);
    margin-right: 0.25em;
  }
  .label-text {
    font-weight: 500;
    line-height: 1.25;
  }

  .trigger {
    display: flex;
    align-items: center;
    padding: 0.3em 0.6em;
    border: 1px solid var(--u-input-border-color);
    border-radius: 0.25em;
    background-color: var(--u-input-bg-color);
    cursor: pointer;
    transition: border-color 0.2s ease, box-shadow 0.2s ease;
    min-height: 1.5em;
    line-height: 1.5;
    gap: 0.5em;
  }
  .trigger[disabled] {
    background-color: var(--u-bg-color-disabled);
    cursor: not-allowed;
  }
  .trigger:not([disabled]):hover {
    box-shadow:
      0 0 0 1px var(--u-input-border-color-hover),
      0 0 0 3px rgba(59, 130, 246, 0.12);
  }
  .trigger:not([disabled]):focus {
    outline: none;
    box-shadow:
      0 0 0 1px var(--u-input-border-color-focus),
      0 0 0 3px rgba(59, 130, 246, 0.22);
  }

  .display-value {
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 1em;
  }
  .placeholder {
    color: var(--u-txt-color-weak);
  }

  .chevron {
    flex-shrink: 0;
    transition: transform 0.2s ease;
    color: var(--u-icon-color);
  }
  :host([open]) .chevron {
    transform: rotate(180deg);
  }

  .listbox {
    display: none;
    flex-direction: column;
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    margin-top: 4px;
    background-color: var(--u-bg-color);
    border: 1px solid var(--u-border-color);
    border-radius: 0.25em;
    box-shadow: 0 4px 12px var(--u-shadow-color-normal);
    max-height: 200px;
    overflow-y: auto;
    z-index: 1000;
    padding: 0.25em 0;
  }
  :host([open]) .listbox {
    display: flex;
  }
`;
