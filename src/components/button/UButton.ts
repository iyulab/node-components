import { UButton } from "./UButton.component.js";

UButton.define("u-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-button": UButton;
  }
}

export { UButton };