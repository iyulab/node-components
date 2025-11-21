import { html } from "lit";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./Panel.styles.js";

/**
 * 각 패널은 독립적인 크기와 콘텐츠를 가질 수 있습니다.
 */
export class Panel extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  render() {
    return html`<slot></slot>`;
  }
}