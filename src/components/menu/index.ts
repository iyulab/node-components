import { Menu } from './Menu.js';

Menu.define('u-menu');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu': Menu;
  }
}

export { Menu };
export type { MenuType, MenuMode } from './Menu.js';