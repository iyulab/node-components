import { UMenu } from './UMenu.component.js';

UMenu.define('u-menu');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu': UMenu;
  }
}

export { UMenu };
export type { MenuType, MenuMode } from './UMenu.component.js';