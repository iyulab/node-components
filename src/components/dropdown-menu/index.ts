import { DropdownMenu } from "./DropdownMenu.js";

DropdownMenu.define("u-dropdown-menu");

declare global {
  interface HTMLElementTagNameMap {
    "u-dropdown-menu": DropdownMenu;
  }
}

export { DropdownMenu };