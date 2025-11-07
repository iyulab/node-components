import { Dialog } from "./Dialog.js";

Dialog.define('u-dialog');

declare global {
  interface HTMLElementTagNameMap {
    'u-dialog': Dialog;
  }
}

export { Dialog };