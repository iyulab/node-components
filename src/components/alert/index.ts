import { Alert } from './Alert.js';

Alert.define("u-alert");

declare global {
  interface HTMLElementTagNameMap {
    'u-alert': Alert;
  }
}

export { Alert };