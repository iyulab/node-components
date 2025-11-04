import { convertReact } from "../../internals/react.js";
import { IconButton } from "./IconButton.js";

IconButton.define("u-icon-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-icon-button": IconButton;
  }
}

const UIconButton = convertReact({
  tagName: "u-icon-button",
  elementClass: IconButton
})

export { IconButton, UIconButton };
