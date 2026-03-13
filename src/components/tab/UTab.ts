import { UTab } from "./UTab.component.js";

UTab.define("u-tab");

declare global {
  interface HTMLElementTagNameMap {
    "u-tab": UTab;
  }
}

export * from "./UTab.component.js";
