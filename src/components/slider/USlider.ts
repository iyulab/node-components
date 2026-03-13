import { USlider } from "./USlider.component.js";

USlider.define("u-slider");

declare global {
  interface HTMLElementTagNameMap {
    "u-slider": USlider;
  }
}

export * from "./USlider.component.js";