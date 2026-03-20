import { UChip } from "./UChip.component.js";

UChip.define("u-chip");

declare global {
  interface HTMLElementTagNameMap {
    'u-chip': UChip;
  }
}

export * from "./UChip.component.js";
