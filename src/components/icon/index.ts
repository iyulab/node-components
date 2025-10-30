import { convertReact } from "../../internals";
import { Icon } from "./Icon";

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