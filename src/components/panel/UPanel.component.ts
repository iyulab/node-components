import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UPanel.styles.js";

/**
 * Panel 컴포넌트는 콘텐츠를 담는 기본 패널입니다.
 * 탭 패널과 매칭하여 사용하거나 독립적으로 사용할 수 있습니다.
 *
 * @slot - 패널 내부에 표시할 콘텐츠를 삽입합니다.
 */
export class UPanel extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};

  /** 패널 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 패널 접기 가능 여부 */
  @property({ type: Boolean, reflect: true }) collapsible = false;
  /** 패널 고유값 (매칭시 사용) */
  @property({ type: String, reflect: true }) value = "";

  render() {
    return html`<slot></slot>`;
  }
}
