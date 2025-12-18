import { UTree } from './UTree.component.js';

UTree.define('u-tree');

declare global {
  interface HTMLElementTagNameMap {
    'u-tree': UTree;
  }
}

export { UTree };
