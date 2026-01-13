import { UTag } from "./UTag.component.js";

UTag.define("u-tag");

declare global {
  interface HTMLElementTagNameMap {
    'u-tag': UTag;
  }
}

export { UTag };
export type { TagVariant } from "./UTag.component.js";