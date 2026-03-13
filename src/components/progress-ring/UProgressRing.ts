import { UProgressRing } from "./UProgressRing.component.js";

UProgressRing.define("u-progress-ring");

declare global {
  interface HTMLElementTagNameMap {
    'u-progress-ring': UProgressRing;
  }
}

export * from './UProgressRing.component.js';
