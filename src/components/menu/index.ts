import { convertReact } from '../../internals';
import { Menu } from './Menu';

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