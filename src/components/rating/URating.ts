import { URating } from "./URating.component.js";

URating.define("u-rating");

declare global {
  interface HTMLElementTagNameMap {
    "u-rating": URating;
  }
}

export * from "./URating.component.js";
