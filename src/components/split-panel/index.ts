import { convertReact } from "../../internals/react.js";
import { SplitPanel } from "./SplitPanel.js";

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