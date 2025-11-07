import { Panel } from "./Panel.js";

Panel.define("u-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-panel': Panel;
  }
}

export { Panel };