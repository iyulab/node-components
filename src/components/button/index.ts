import { convertReact } from "../../internals";
import { Button } from "./Button";

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