import { USpinner } from "./USpinner.component.js";

USpinner.define('u-spinner');

declare global {
  interface HTMLElementTagNameMap {
    'u-spinner': USpinner;
  }
}

export { USpinner };