import { html } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTab } from "../tab/UTab.component.js";
import { styles } from "./UTabGroup.styles.js";

export type TabVariant = 'underline' | 'pills' | 'outline' | 'segment';
export type TabOrientation = 'horizontal' | 'vertical';

/**
 * TabGroup 컴포넌트는 여러 Tab을 그룹으로 관리하며 탭 네비게이션을 제공합니다.
 * 자식 u-tab 요소에서 탭 헤더 정보(label, disabled)를 읽어 자동 생성합니다.
 * variant 속성으로 탭 스타일을 변경할 수 있습니다.
 *
 * @example
 * ```html
 * <!-- value 지정 -->
 * <u-tab-group value="tab1" variant="pills">
 *   <u-tab value="tab1" label="General">General settings content</u-tab>
 *   <u-tab value="tab2" label="Profile">Profile content</u-tab>
 * </u-tab-group>
 *
 * <!-- value 생략 시 인덱스("0", "1", ...) 자동 할당 -->
 * <u-tab-group>
 *   <u-tab label="First">First content</u-tab>
 *   <u-tab label="Second">Second content</u-tab>
 * </u-tab-group>
 * ```
 */
export class UTabGroup extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 현재 선택된 탭 값 */
  @property({ type: String, reflect: true }) value: string = '';
  /** 탭 스타일 변형: underline | pills | outline | segment */
  @property({ type: String, reflect: true }) variant: TabVariant = 'underline';
  /** 탭 방향: horizontal | vertical */
  @property({ type: String, reflect: true }) orientation: TabOrientation = 'horizontal';

  @state() private _tabs: UTab[] = [];

  render() {
    return html`
      <div class="tab-nav" role="tablist" aria-orientation=${this.orientation}>
        ${this._tabs.map(tab => html`
          <button class="tab-btn"
            role="tab"
            ?active=${tab.value === this.value}
            ?disabled=${tab.disabled}
            aria-selected=${tab.value === this.value}
            @click=${() => this.selectTab(tab)}>
            ${this.renderTabLabel(tab)}
          </button>
        `)}
      </div>
      <div class="tab-content">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  private handleSlotChange = () => {
    this._tabs = this.getTabs();

    // value 자동 할당 및 중복 방지
    const seen = new Set<string>();
    this._tabs.forEach((tab, i) => {
      if (!tab.value) {
        tab.value = `${i}`;
      }
      while (seen.has(tab.value)) {
        tab.value = `${tab.value}-${i}`;
      }
      seen.add(tab.value);
    });

    // value가 없으면 첫 번째 탭 자동 선택
    if (!this.value && this._tabs.length > 0) {
      this.value = this._tabs[0].value;
    }

    this.syncTabs();
  }

  private selectTab(tab: UTab) {
    if (tab.disabled) return;
    this.value = tab.value;
    this.syncTabs();
    this.emit('u-change', { value: tab.value });
  }

  /** 탭 버튼 라벨 렌더링: slot="label" 요소가 있으면 사용, 없으면 label 속성 사용 */
  private renderTabLabel(tab: UTab) {
    const customLabel = tab.querySelector('[slot="label"]');
    if (customLabel) {
      return html`${customLabel.cloneNode(true)}`;
    }
    return html`${tab.label}`;
  }

  /** 자식 u-tab 요소 목록 반환 */
  private getTabs(): UTab[] {
    return Array.from(this.querySelectorAll<UTab>(':scope > u-tab'));
  }

  /** 자식 탭들의 active 상태를 동기화 */
  private syncTabs() {
    this._tabs.forEach(tab => {
      tab.active = tab.value === this.value;
    });
  }
}
