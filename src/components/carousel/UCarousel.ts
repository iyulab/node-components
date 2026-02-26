import { UCarousel } from "./UCarousel.component.js";

UCarousel.define("u-carousel");

declare global {
  interface HTMLElementTagNameMap {
    "u-carousel": UCarousel;
  }
}

export { UCarousel };
