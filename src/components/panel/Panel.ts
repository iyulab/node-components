import { html } from "lit";

import { UElement } from "../../internals/UElement.js";
import { styles } from "./Panel.styles.js";

/**
 * 각 패널은 독립적인 크기와 콘텐츠를 가질 수 있습니다.
 */
export class Panel extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};
  
  connectedCallback(): void {
    super.connectedCallback();
    this.classList.add('scrollable');
  }

  render() {
    return html`<slot></slot>`;
  }
}