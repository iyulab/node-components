import { convertReact } from "../../internals/converter";
import { IconButton } from "./IconButton";

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
