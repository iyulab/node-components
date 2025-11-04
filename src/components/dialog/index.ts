import { convertReact } from "../../internals/react.js";
import { Dialog } from "./Dialog.js";

Dialog.define('u-dialog');

declare global {
  interface HTMLElementTagNameMap {
    'u-dialog': Dialog;
  }
}

const UDialog = convertReact({
  tagName: 'u-dialog',
  elementClass: Dialog
});

export { Dialog, UDialog };