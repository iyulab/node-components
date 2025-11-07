import { Icon } from "./Icon.js";

Icon.define("u-icon");

declare global {
  interface HTMLElementTagNameMap {
    "u-icon": Icon;
  }
}

export { Icon };