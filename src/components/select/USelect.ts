import { USelect } from './USelect.component.js';

USelect.define('u-select');

declare global {
  interface HTMLElementTagNameMap {
    'u-select': USelect;
  }
}

export * from './USelect.component.js';
