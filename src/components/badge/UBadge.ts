import { UBadge } from "./UBadge.component.js";

UBadge.define("u-badge");

declare global {
  interface HTMLElementTagNameMap {
    "u-badge": UBadge;
  }
}

export * from "./UBadge.component.js";
