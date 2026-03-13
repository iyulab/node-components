import { UAvatar } from "./UAvatar.component.js";

UAvatar.define("u-avatar");

declare global {
  interface HTMLElementTagNameMap {
    "u-avatar": UAvatar;
  }
}

export * from "./UAvatar.component.js";
