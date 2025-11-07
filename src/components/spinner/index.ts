import { Spinner } from "./Spinner.js";

Spinner.define('u-spinner');

declare global {
  interface HTMLElementTagNameMap {
    'u-spinner': Spinner;
  }
}

export { Spinner };