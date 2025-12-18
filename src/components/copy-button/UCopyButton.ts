import { UCopyButton } from "./UCopyButton.component.js";

UCopyButton.define("u-copy-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-copy-button": UCopyButton;
  }
}

export { UCopyButton };