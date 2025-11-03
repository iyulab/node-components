import { convertReact } from "../../internals";
import { Input } from "./Input";

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