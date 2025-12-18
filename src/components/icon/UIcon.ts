import { UIcon } from "./UIcon.component.js";

UIcon.define("u-icon");

declare global {
  interface HTMLElementTagNameMap {
    "u-icon": UIcon;
  }
}

export { UIcon };
export type { IconLibrary } from "./UIcon.component.js";