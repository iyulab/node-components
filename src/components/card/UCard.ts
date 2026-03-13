import { UCard } from "./UCard.component.js";

UCard.define("u-card");

declare global {
  interface HTMLElementTagNameMap {
    "u-card": UCard;
  }
}

export * from "./UCard.component.js";
