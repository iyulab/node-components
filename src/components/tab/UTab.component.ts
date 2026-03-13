import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { styles } from "./UTab.styles.js";

/**
 * Tab 컴포넌트는 TabGroup 내의 개별 탭 패널을 나타냅니다.
 * 탭 헤더의 라벨은 label attribute로 선언하거나,
 * `slot="label"` 을 사용하여 커스텀 탭 버튼 콘텐츠를 지정할 수 있습니다.
 * 기본 슬롯에는 탭 콘텐츠를 배치합니다.
 *
 * @example
 * ```html
 * <u-tab value="settings" label="Settings">
 *   <p>Settings content here</p>
 * </u-tab>
 *
 * <u-tab value="custom">
 *   <span slot="label"><img src="icon.png" /> Custom Tab</span>
 *   <p>Custom tab content here</p>
 * </u-tab>
 * ```
 */
export class UTab extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 탭 고유 식별자 */
  @property({ type: String, reflect: true }) value: string = '';
  /** 탭 헤더에 표시할 라벨 */
  @property({ type: String, reflect: true }) label: string = '';
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 활성 상태 (TabGroup에서 자동 관리) */
  @property({ type: Boolean, reflect: true }) active: boolean = false;

  render() {
    return html`<slot></slot>`;
  }
}
