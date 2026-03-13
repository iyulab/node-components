import { UTabGroup } from "./UTabGroup.component.js";

UTabGroup.define("u-tab-group");

declare global {
  interface HTMLElementTagNameMap {
    "u-tab-group": UTabGroup;
  }
}

export * from "./UTabGroup.component.js";
