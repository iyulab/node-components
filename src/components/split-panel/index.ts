import { SplitPanel } from "./SplitPanel.js";

SplitPanel.define("u-split-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': SplitPanel;
  }
}

export { SplitPanel };