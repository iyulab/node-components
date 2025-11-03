import { convertReact } from '../../internals';
import { MenuItem } from './MenuItem';

MenuItem.define('u-menu-item');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu-item': MenuItem;
  }
}

const UMenuItem = convertReact({
  tagName: 'u-menu-item',
  elementClass: MenuItem
});

export { MenuItem, UMenuItem };