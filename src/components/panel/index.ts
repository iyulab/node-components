import { convertReact } from "../../internals/react.js";
import { Panel } from "./Panel.js";

Panel.define("u-panel");

declare global {
  interface HTMLElementTagNameMap {
    'u-panel': Panel;
  }
}

const UPanel = convertReact({
  elementClass: Panel,
  tagName: 'u-panel'
});

export { Panel, UPanel };