import { html } from "lit";

import { UElement } from "../../internals/UElement.js";
import { styles } from "./Panel.styles.js";

/**
 * Panel 컴포넌트는 SplitPanel 내부에서 사용되는 개별 패널입니다.
 * 각 패널은 독립적인 크기와 콘텐츠를 가질 수 있습니다.
 */
export class Panel extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  render() {
    return html`<slot></slot>`;
  }
}