import { convertReact } from '../../internals/react.js';
import { ContextMenu } from './ContextMenu.js';

ContextMenu.define('u-context-menu');

declare global {
  interface HTMLElementTagNameMap {
    'u-context-menu': ContextMenu;
  }
}

const UContextMenu = convertReact({
  tagName: 'u-context-menu',
  elementClass: ContextMenu
});

export { ContextMenu, UContextMenu };