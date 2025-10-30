import { convertReact } from '../../internals';
import { Tooltip } from './Tooltip';

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