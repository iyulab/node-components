import { Drawer } from "./Drawer.js";

Drawer.define('u-drawer');

declare global {
  interface HTMLElementTagNameMap {
    'u-drawer': Drawer;
  }
}

export { Drawer };
export type { DrawerPlacement } from './Drawer.js';
