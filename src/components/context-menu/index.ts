import { ContextMenu } from './ContextMenu.js';

ContextMenu.define('u-context-menu');

declare global {
  interface HTMLElementTagNameMap {
    'u-context-menu': ContextMenu;
  }
}

export { ContextMenu };