import { UDrawer } from "./UDrawer.component.js";

UDrawer.define('u-drawer');

declare global {
  interface HTMLElementTagNameMap {
    'u-drawer': UDrawer;
  }
}

export { UDrawer };
export type { DrawerPlacement } from './UDrawer.component.js';
