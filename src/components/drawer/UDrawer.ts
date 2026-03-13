import { UDrawer } from "./UDrawer.component.js";

UDrawer.define('u-drawer');

declare global {
  interface HTMLElementTagNameMap {
    'u-drawer': UDrawer;
  }
}

export * from './UDrawer.component.js';
