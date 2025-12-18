import { UProgressBar } from "./UProgressBar.component.js";

UProgressBar.define('u-progress-bar');

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-bar': UProgressBar;
  }
}

export { UProgressBar };