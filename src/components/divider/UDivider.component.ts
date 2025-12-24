import { property } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./UDivider.styles.js";

/**
 * Divider 컴포넌트는 엘리먼트 사이에 구분선을 제공합니다.
 */
export class UDivider extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};
  
  /** 수직 방향 여부를 설정합니다. (기본값: 수평) */
  @property({ type: Boolean, reflect: true }) 
  vertical = false;
}