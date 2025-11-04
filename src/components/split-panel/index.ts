import { convertReact } from "../../internals/react.js";
import { SplitPanel } from "./SplitPanel.js";
import { Panel } from "./Panel.js";
import { Splitter } from "./Splitter.js";

SplitPanel.define("u-split-panel");
Panel.define("u-panel");
Splitter.define("u-splitter");

declare global {
  interface HTMLElementTagNameMap {
    'u-split-panel': SplitPanel;
    'u-panel': Panel;
    'u-splitter': Splitter;
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

const USplitter = convertReact({
  elementClass: Splitter,
  tagName: 'u-splitter'
});

export { SplitPanel, USplitPanel, Panel, UPanel, Splitter, USplitter };