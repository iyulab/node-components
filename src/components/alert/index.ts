import { convertReact } from '../../internals';
import { Alert } from './Alert';

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