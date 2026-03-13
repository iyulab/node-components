import { URadio } from "./URadio.component.js";

URadio.define("u-radio");

declare global {
  interface HTMLElementTagNameMap {
    "u-radio": URadio;
  }
}

export * from "./URadio.component.js";
