import { UMenu } from './UMenu.component.js';

UMenu.define('u-menu');

declare global {
  interface HTMLElementTagNameMap {
    'u-menu': UMenu;
  }
}

export * from './UMenu.component.js';
