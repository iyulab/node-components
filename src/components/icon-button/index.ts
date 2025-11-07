import { IconButton } from "./IconButton.js";

IconButton.define("u-icon-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-icon-button": IconButton;
  }
}

export { IconButton };
