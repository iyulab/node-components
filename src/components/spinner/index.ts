import { convertReact } from "../../internals/converter";
import { Spinner } from "./Spinner";

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