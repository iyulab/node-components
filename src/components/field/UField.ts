import { UField } from "./UField.component.js";

UField.define("u-field");

declare global {
  interface HTMLElementTagNameMap {
    "u-field": UField;
  }
}

export * from "./UField.component.js";
