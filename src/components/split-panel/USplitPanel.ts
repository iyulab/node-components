import { USplitPanel } from "./USplitPanel.component.js";

USplitPanel.define("u-split-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': USplitPanel;
  }
}

export { USplitPanel };