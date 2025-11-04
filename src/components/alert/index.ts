import { convertReact } from '../../internals/react.js';
import { Alert } from './Alert.js';

Alert.define("u-alert");

declare global {
  interface HTMLElementTagNameMap {
    'u-alert': Alert;
  }
}

const UAlert = convertReact({
  tagName: 'u-alert',
  elementClass: Alert
})

export { Alert, UAlert };