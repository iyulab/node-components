import { CopyButton } from "./CopyButton.js";

CopyButton.define("u-copy-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-copy-button": CopyButton;
  }
}

export { CopyButton };