import { convertReact } from "../../internals/react.js";
import { CopyButton } from "./CopyButton.js";

CopyButton.define("u-copy-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-copy-button": CopyButton;
  }
}

const UCopyButton = convertReact({
  tagName: "u-copy-button",
  elementClass: CopyButton
})

export { CopyButton, UCopyButton };