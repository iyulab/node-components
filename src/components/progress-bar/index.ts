import { ProgressBar } from "./ProgressBar";

ProgressBar.define('u-progress-bar');

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-bar': ProgressBar;
  }
}

export { ProgressBar };