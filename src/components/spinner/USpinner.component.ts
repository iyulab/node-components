import { html } from "lit";

import { BaseElement } from "../BaseElement.js";
import { styles } from './USpinner.styles.js';

/** 
 * Spinner 컴포넌트는 로딩 상태를 시각적으로 표시하는 회전하는 원형 스피너를 제공합니다.
 */
export class USpinner extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  render() {
    return html`
      <svg class="spinner" part="base">
        <circle class="track"></circle>
        <circle class="indicator"></circle>
      </svg>
    `;
  }
}