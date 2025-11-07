import { ProgressRing } from "./ProgressRing.js";

ProgressRing.define("u-progress-ring");

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-ring': ProgressRing;
  }
}

export { ProgressRing };