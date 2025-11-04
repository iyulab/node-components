import { convertReact } from "../../internals/react.js";
import { Button } from "./Button.js";

Button.define("u-button");

declare global {
  interface HTMLElementTagNameMap {
    "u-button": Button;
  }
}

const UButton = convertReact({
  tagName: "u-button",
  elementClass: Button
})

export { Button, UButton };