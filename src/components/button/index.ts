import { Button } from "./Button.js";

Button.define("u-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-button": Button;
  }
}

export { Button };