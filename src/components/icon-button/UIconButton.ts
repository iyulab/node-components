import { UIconButton } from "./UIconButton.component.js";

UIconButton.define("u-icon-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-icon-button": UIconButton;
  }
}

export { UIconButton };
