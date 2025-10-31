import { convertReact } from "../../internals/converter.js";
import { SplitPanel } from "./SplitPanel";

SplitPanel.define("u-split-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': SplitPanel;
  }
}

const USplitPanel = convertReact({
  elementClass: SplitPanel,
  tagName: 'u-split-panel'
});

export { SplitPanel, USplitPanel };