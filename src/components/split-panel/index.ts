import { convertReact } from "../../internals/react.js";
import { SplitPanel } from "./SplitPanel.js";
import { Panel } from "./Panel.js";

SplitPanel.define("u-split-panel");
Panel.define("u-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': SplitPanel;
    'u-panel': Panel;
  }
}

const USplitPanel = convertReact({
  elementClass: SplitPanel,
  tagName: 'u-split-panel'
});

const UPanel = convertReact({
  elementClass: Panel,
  tagName: 'u-panel'
});

export { SplitPanel, USplitPanel, Panel, UPanel };