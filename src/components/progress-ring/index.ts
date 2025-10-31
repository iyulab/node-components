import { convertReact } from "../../internals/converter.js";
import { ProgressRing } from "./ProgressRing";

ProgressRing.define("u-progress-ring");

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-ring': ProgressRing;
  }
}

const UProgressRing = convertReact({
  elementClass: ProgressRing,
  tagName: 'u-progress-ring'
});

export { ProgressRing, UProgressRing };