import { html } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UPanel.styles.js";

/**
 * 콘텐츠를 담는 기본 패널 컴포넌트입니다.
 * 이 패널은 value 기반으로 매칭하여 사용하거나 독립적으로 사용합니다.
 *
 * @slot - 패널 내부 콘텐츠 */
@customElement('u-panel')
export class UPanel extends UElement {
  static styles = [super.styles, styles];

  /** 패널 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 패널 접기 가능 여부 */
  @property({ type: Boolean, reflect: true }) collapsible = false;
  /** 패널 고유값 (매칭 시 사용) */
  @property({ type: String, reflect: true }) value = "";

  render() {
    return html`<slot></slot>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-panel': UPanel;
  }
}
