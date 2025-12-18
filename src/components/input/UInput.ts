import { UInput } from "./UInput.component.js";

UInput.define("u-input");

declare global {
  interface HTMLElementTagNameMap {
    "u-input": UInput;
  }
}

export { UInput };