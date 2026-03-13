import { css } from "lit";

export const styles = css`
  :host {
    display: inline-flex;
    flex-direction: column;
    gap: 0.5em;
    font-size: inherit;
    font-family: var(--u-font-base);
    color: var(--u-txt-color);
  }
  :host([disabled]) {
    opacity: 0.6;
    pointer-events: none;
  }
  :host([readonly]) {
    pointer-events: none;
  }

  .header {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 0.25em;
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
  }

  /* === Invalid 상태 === */
  :host([invalid]) .header .label {
    color: var(--u-red-600);
  }
  :host([invalid]:not([type="button"])) .options {
    border: 1px solid var(--u-red-600);
    border-radius: 0.375em;
    padding: 0.5em;
  }

  .options {
    display: flex;
    flex-direction: column;
    gap: 0.5em;
  }
  :host([orientation="horizontal"]) .options {
    flex-direction: row;
    gap: 1em;
  }

  /* === Button 타입 === */
  :host([type="button"]) .options {
    gap: 0;
  }
  :host([type="button"][orientation="horizontal"]) .options {
    flex-direction: row;
    gap: 0;
  }

  .description {
    color: var(--u-txt-color-weak);
    font-size: 0.75em;
    line-height: 1.3;
  }
  :host([invalid]) .description {
    color: var(--u-red-600);
  }
`;
