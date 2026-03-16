import { USwitch } from "./USwitch.component.js";

USwitch.define("u-switch");

declare global {
  interface HTMLElementTagNameMap {
    'u-switch': USwitch;
  }
}

export { USwitch };
