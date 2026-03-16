import { UOption } from "./UOption.component.js";

UOption.define("u-option");

declare global {
  interface HTMLElementTagNameMap {
    'u-option': UOption;
  }
}

export { UOption };
