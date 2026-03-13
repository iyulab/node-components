import { UTextarea } from "./UTextarea.component.js";

UTextarea.define("u-textarea");

declare global {
  interface HTMLElementTagNameMap {
    "u-textarea": UTextarea;
  }
}

export * from "./UTextarea.component.js";