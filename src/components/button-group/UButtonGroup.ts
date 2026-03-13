import { UButtonGroup } from "./UButtonGroup.component.js";

UButtonGroup.define("u-button-group");

declare global {
  interface HTMLElementTagNameMap {
    "u-button-group": UButtonGroup;
  }
}

export * from "./UButtonGroup.component.js";
