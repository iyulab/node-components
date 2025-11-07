import { Tooltip } from './Tooltip.js';

Tooltip.define('u-tooltip');

declare global {
  interface HTMLElementTagNameMap {
    'u-tooltip': Tooltip;
  }
}

export { Tooltip };