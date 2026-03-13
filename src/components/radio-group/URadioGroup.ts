import { URadioGroup } from "./URadioGroup.component.js";

URadioGroup.define("u-radio-group");

declare global {
  interface HTMLElementTagNameMap {
    "u-radio-group": URadioGroup;
  }
}

export * from "./URadioGroup.component.js";
