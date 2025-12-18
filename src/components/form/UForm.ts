import { UForm } from './UForm.component.js';

UForm.define('u-form');

declare global {
  interface HTMLElementTagNameMap {
    'u-form': UForm;
  }
}

export { UForm };