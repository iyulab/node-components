import { UDialog } from "./UDialog.component.js";

UDialog.define('u-dialog');

declare global {
  interface HTMLElementTagNameMap {
    'u-dialog': UDialog;
  }
}

export { UDialog };