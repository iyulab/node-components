import { convertReact } from '../../internals/react.js';
import { Tooltip } from './Tooltip.js';

Tooltip.define('u-tooltip');

declare global {
  interface HTMLElementTagNameMap {
    'u-tooltip': Tooltip;
  }
}

const UTooltip = convertReact({
  tagName: 'u-tooltip',
  elementClass: Tooltip
});

export { Tooltip, UTooltip };