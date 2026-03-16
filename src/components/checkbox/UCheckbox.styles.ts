import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
    font-size: inherit;
  }
  :host([disabled]) {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .container {
    display: inline-flex;
    align-items: center;
    gap: 0.5em;
    cursor: pointer;
    user-select: none;
  }
  :host([disabled]) .container {
    cursor: not-allowed;
  }

  input {
    position: absolute;
    opacity: 0;
    width: 0;
    height: 0;
    margin: 0;
  }

  .checkmark {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 1.25em;
    height: 1.25em;
    border: 2px solid var(--u-input-border-color);
    border-radius: 0.2em;
    background-color: var(--u-input-bg-color);
    transition: background-color 0.15s ease, border-color 0.15s ease;
    flex-shrink: 0;
  }

  .icon {
    width: 1em;
    height: 1em;
    color: white;
    display: none;
  }

  :host([checked]) .checkmark {
    background-color: var(--u-blue-600);
    border-color: var(--u-blue-600);
  }
  :host([checked]) .icon.check {
    display: block;
  }

  :host([indeterminate]) .checkmark {
    background-color: var(--u-blue-600);
    border-color: var(--u-blue-600);
  }
  :host([indeterminate]) .icon.dash {
    display: block;
  }
  :host([indeterminate]) .icon.check {
    display: none;
  }

  /* hover */
  .container:hover .checkmark {
    border-color: var(--u-blue-400);
  }
  :host([disabled]) .container:hover .checkmark {
    border-color: var(--u-input-border-color);
  }

  /* focus */
  input:focus-visible ~ .checkmark {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }

  .label {
    line-height: 1.5;
    font-size: 0.9em;
  }
`;
