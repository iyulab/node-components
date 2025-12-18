import { UTooltip } from './UTooltip.component.js';

UTooltip.define('u-tooltip');

declare global {
  interface HTMLElementTagNameMap {
    'u-tooltip': UTooltip;
  }
}

export { UTooltip };