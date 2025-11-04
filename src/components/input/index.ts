import { convertReact } from "../../internals/react.js";
import { Input } from "./Input.js";

Input.define("u-input");

declare global {
  interface HTMLElementTagNameMap {
    "u-input": Input;
  }
}

const UInput = convertReact({
  tagName: "u-input",
  elementClass: Input,
})

export { Input, UInput };