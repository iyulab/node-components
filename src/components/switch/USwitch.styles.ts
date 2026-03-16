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

  .track {
    position: relative;
    display: inline-flex;
    align-items: center;
    width: 2.5em;
    height: 1.4em;
    border-radius: 1em;
    background-color: var(--u-neutral-300);
    transition: background-color 0.2s ease;
    flex-shrink: 0;
  }

  .thumb {
    position: absolute;
    left: 0.15em;
    width: 1.1em;
    height: 1.1em;
    border-radius: 50%;
    background-color: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: transform 0.2s ease;
  }

  :host([checked]) .track {
    background-color: var(--u-blue-600);
  }
  :host([checked]) .thumb {
    transform: translateX(1.1em);
  }

  /* hover */
  .container:hover .track {
    background-color: var(--u-neutral-400);
  }
  :host([checked]) .container:hover .track {
    background-color: var(--u-blue-700);
  }
  :host([disabled]) .container:hover .track {
    background-color: var(--u-neutral-300);
  }
  :host([disabled][checked]) .container:hover .track {
    background-color: var(--u-blue-600);
  }

  /* focus */
  input:focus-visible ~ .track {
    box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.3);
  }

  .label {
    line-height: 1.5;
    font-size: 0.9em;
  }
`;
