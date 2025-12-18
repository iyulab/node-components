import { UDivider } from "./UDivider.component.js";

UDivider.define("u-divider");

declare global {
  interface HTMLElementTagNameMap {
    'u-divider': UDivider;
  }
}

export { UDivider };