import { UAlert } from './UAlert.component.js';

UAlert.define("u-alert");

declare global {
  interface HTMLElementTagNameMap {
    'u-alert': UAlert;
  }
}

export { UAlert };
export type { AlertVariant } from './UAlert.component.js';
