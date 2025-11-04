import { convertReact } from '../../internals/react.js';
import { Menu } from './Menu.js';

Menu.define('u-menu');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu': Menu;
  }
}

const UMenu = convertReact({
  tagName: 'u-menu',
  elementClass: Menu
});

export { Menu, UMenu };