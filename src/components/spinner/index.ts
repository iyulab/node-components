import { convertReact } from "../../internals/react.js";
import { Spinner } from "./Spinner.js";

Spinner.define('u-spinner');

declare global {
  interface HTMLElementTagNameMap {
    'u-spinner': Spinner;
  }
}

const USpinner = convertReact({
  tagName: 'u-spinner',
  elementClass: Spinner,
});

export { Spinner, USpinner };