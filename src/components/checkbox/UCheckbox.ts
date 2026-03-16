import { UCheckbox } from "./UCheckbox.component.js";

UCheckbox.define("u-checkbox");

declare global {
  interface HTMLElementTagNameMap {
    'u-checkbox': UCheckbox;
  }
}

export { UCheckbox };
