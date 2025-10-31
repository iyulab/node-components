import { convertReact } from "../../internals/converter";
import { Dialog } from "./Dialog";

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