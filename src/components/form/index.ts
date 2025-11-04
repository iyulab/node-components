import { convertReact } from '../../internals/react.js';
import { Form } from './Form.js';

Form.define('u-form');

declare global {
  interface HTMLElementTagNameMap {
    'u-form': Form;
  }
}

const UForm = convertReact({
  tagName: 'u-form',
  elementClass: Form,
});

export { Form, UForm };