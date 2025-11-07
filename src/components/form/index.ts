import { Form } from './Form.js';

Form.define('u-form');

declare global {
  interface HTMLElementTagNameMap {
    'u-form': Form;
  }
}

export { Form };