import { Input } from "./Input.js";

Input.define("u-input");

declare global {
  interface HTMLElementTagNameMap {
    "u-input": Input;
  }
}

export { Input };