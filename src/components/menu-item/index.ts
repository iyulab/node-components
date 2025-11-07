import { MenuItem } from './MenuItem.js';

MenuItem.define('u-menu-item');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu-item': MenuItem;
  }
}

export { MenuItem };