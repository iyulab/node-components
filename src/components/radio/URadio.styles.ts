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

  .container {
    display: flex;
    gap: 0.5em;
  }
  :host([orientation="horizontal"]) .container {
    flex-direction: row;
  }
  :host([orientation="vertical"]) .container {
    flex-direction: column;
  }
  :host([type="button"]) .container {
    gap: 0;
    border: 1px solid var(--u-neutral-300);
    border-radius: 0.35em;
  }
  :host([invalid]) .container {
    border-color: var(--u-red-600);
  }

  /* Type: default */
  :host([type="default"]) ::slotted(u-option) {
    padding: 0;
  }

  /* Default + Filled */
  :host([type="default"][variant="filled"]) ::slotted(u-option) {
    --option-color-active: #fff;
    --option-border-color-active: var(--u-blue-600);
    --option-background-color-active: var(--u-blue-600);
    --option-color-active-interactive: #fff;
    --option-border-color-active-interactive: var(--u-blue-700);
    --option-background-color-active-interactive: var(--u-blue-700);
  }

  /* Default + Outlined */
  :host([type="default"][variant="outlined"]) ::slotted(u-option) {
    --option-color-active: var(--u-blue-700);
    --option-border-color-active: var(--u-blue-600);
    --option-background-color-active: transparent;
    --option-color-active-interactive: var(--u-blue-700);
    --option-border-color-active-interactive: var(--u-blue-700);
    --option-background-color-active-interactive: transparent;
  }

  /* Button + Filled */
  :host([type="button"][variant="filled"]) ::slotted(u-option) {
    --option-color-active: #fff;
    --option-border-color-active: var(--u-blue-600);
    --option-background-color-active: var(--u-blue-600);
    --option-color-active-interactive: #fff;
    --option-border-color-active-interactive: var(--u-blue-700);
    --option-background-color-active-interactive: var(--u-blue-700);
  }

  /* Button + Outlined */
  :host([type="button"][variant="outlined"]) ::slotted(u-option) {
    --option-color-active: var(--u-blue-700);
    --option-border-color-active: var(--u-blue-600);
    --option-background-color-active: transparent;
    --option-color-active-interactive: var(--u-blue-700);
    --option-border-color-active-interactive: var(--u-blue-700);
    --option-background-color-active-interactive: transparent;
  }

  /* === Button - Horizontal 배치 === */
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:first-child) {
    border-radius: 0.35em 0 0 0.35em;
  }
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:last-child) {
    border-radius: 0 0.35em 0.35em 0;
  }
  :host([type="button"][orientation="horizontal"]) ::slotted(u-option:not(:last-child)) {
    border-right: 1px solid var(--u-neutral-300);
  }

  /* === Button - Vertical 배치 === */
  :host([type="button"][orientation="vertical"]) ::slotted(u-option) {
    width: 100%;
    justify-content: center;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:first-child) {
    border-radius: 0.35em 0.35em 0 0;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:last-child) {
    border-radius: 0 0 0.35em 0.35em;
  }
  :host([type="button"][orientation="vertical"]) ::slotted(u-option:not(:last-child)) {
    border-bottom: 1px solid var(--u-neutral-300);
  }
`;
