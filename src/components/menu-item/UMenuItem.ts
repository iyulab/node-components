import { UMenuItem } from './UMenuItem.component.js';

UMenuItem.define('u-menu-item');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu-item': UMenuItem;
  }
}

export { UMenuItem };