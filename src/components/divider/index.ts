import { Divider } from "./Divider.js";

Divider.define("u-divider");

declare global {
  interface HTMLElementTagNameMap {
    'u-divider': Divider;
  }
}

export { Divider };