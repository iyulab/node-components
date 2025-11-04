import { convertReact } from "../../internals/react.js";
import { Icon } from "./Icon.js";

Icon.define("u-icon");

declare global {
  interface HTMLElementTagNameMap {
    "u-icon": Icon;
  }
}

const UIcon = convertReact<Icon>({
  tagName: "u-icon",
  elementClass: Icon
});

export { Icon, UIcon };