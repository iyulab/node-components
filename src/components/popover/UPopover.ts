import { UPopover } from './UPopover.component.js';

UPopover.define('u-popover');

declare global {
  interface HTMLElementTagNameMap {
    'u-popover': UPopover;
  }
}

export * from './UPopover.component.js';
