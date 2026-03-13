import { UTreeItem } from './UTreeItem.component.js';

UTreeItem.define('u-tree-item');

declare global {
  interface HTMLElementTagNameMap {
    'u-tree-item': UTreeItem;
  }
}

export * from './UTreeItem.component.js';
