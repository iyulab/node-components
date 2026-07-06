import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTab } from "../tab/UTab.js";
import { UPanel } from "../panel/UPanel.js";
import { styles } from "./UTabPanel.styles.js";

export type TabPanelVariant = 'line' | 'card' | 'pill' | 'plain';
export type TabPanelPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * 탭 기반 콘텐츠 전환을 제공하는 컴포넌트입니다.
 *
 * @slot - u-tab 및 u-panel 요소들
 * @slot toolbar - 탭 영역에 있는 공간에 표시할 콘텐츠
 *
 * @csspart header - 탭 버튼들이 있는 헤더 영역
 * @csspart nav - 탭 버튼들이 실제로 배치되는 네비게이션 영역
 * @csspart toolbar - 탭 헤더 내 툴바 영역
 * @csspart content - 탭 패널이 있는 콘텐츠 영역
 *
 * @event change - 탭을 클릭하거나 키보드로 선택했을 때만 발생한다. 최초 마운트 시 첫 탭이
 *   자동 선택되는 경우나 `value` 프로퍼티를 직접 대입하는 경우는 사용자 조작이 아니므로
 *   발생시키지 않는다(네이티브 select가 프로그래밍적 대입에는 change를 내지 않는 것과 동일한 관례).
 */
@customElement('u-tab-panel')
export class UTabPanel extends UElement {
  static styles = [super.styles, styles];

  /** 탭 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 탭 스타일 변형 */
  @property({ type: String, reflect: true }) variant: TabPanelVariant = 'line';
  /** 탭 위치 */
  @property({ type: String, reflect: true }) placement: TabPanelPlacement = 'top';
  /** 선택된 탭값 */
  @property({ type: String, reflect: true }) value = '';
  /** 탭 추가/삭제 가능 여부 */
  @property({ type: Boolean, reflect: true }) editable = false;
  @property({ type: Boolean, reflect: true }) draggable = false;

  @state() private tabs: UTab[] = [];
  @state() private panels: UPanel[] = [];

  private get isVertical() {
    return this.placement === 'left' || this.placement === 'right';
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['value', 'tabs', 'panels'].some(k => changedProperties.has(k))) {
      this.updateTabPanel();
    }
  }

  render() {
    return html`
      <div class="header" part="header" role="tablist">
        <div class="nav" part="nav" @wheel=${this.handleNavWheel}>
          <slot name="tab" @slotchange=${this.handleTabSlotChange}></slot>
        </div>
        <div class="toolbar" part="toolbar">
          <slot name="toolbar"></slot>
        </div>
      </div>
      <div class="content" part="content">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  private change(value: string) {
    if (this.value === value) return;
    this.value = value;
    this.fire('change', { bubbles: false, composed: false });
  }

  private updateTabPanel() {
    this.tabs.forEach(tab => {
      tab.toggleAttribute('active', tab.value === this.value);
    });
    this.panels.forEach(panel => {
      panel.hidden = panel.value !== this.value;
    });
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });

    const panels: UPanel[] = [];
    for (const el of elements) {
      if (el instanceof UPanel) {
        panels.push(el);
      } else if (el instanceof UTab) {
        el.setAttribute('slot', 'tab');
      } else {
        el.setAttribute('hidden', '');
      }
    }
    this.panels = panels;
  }

  private handleTabSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.tabs = slot.assignedElements({ flatten: true })
      .filter((el): el is UTab => el instanceof UTab);

    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.handleTabClick);
      tab.removeEventListener('keydown', this.handleTabKeydown);

      tab.addEventListener('click', this.handleTabClick);
      tab.addEventListener('keydown', this.handleTabKeydown);
    });

    if (!this.value && this.tabs.length > 0) {
      this.value = this.tabs[0].value;
    }
  }

  private handleTabClick = (e: PointerEvent) => {
    const tab = (e.currentTarget || e.target) as UTab;
    if (tab.disabled || this.disabled) return;
    this.change(tab.value);
  }

  private handleTabKeydown = (e: KeyboardEvent) => {
    const enabledTabs = this.tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.indexOf(e.currentTarget as UTab);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    switch (e.key) {
      case (this.isVertical ? 'ArrowDown' : 'ArrowRight'):
        targetIndex = (currentIndex + 1) % enabledTabs.length;
        break;
      case (this.isVertical ? 'ArrowUp' : 'ArrowLeft'):
        targetIndex = (currentIndex - 1 + enabledTabs.length) % enabledTabs.length;
        break;
      case 'Home':
        targetIndex = 0;
        break;
      case 'End':
        targetIndex = enabledTabs.length - 1;
        break;
      case 'Enter':
      case ' ':
        this.change(enabledTabs[currentIndex].value);
        return;
      default:
        return;
    }

    if (targetIndex >= 0) {
      e.preventDefault();
      enabledTabs[targetIndex].focus();
      this.change(enabledTabs[targetIndex].value);
    }
  }

  private handleNavWheel = (e: WheelEvent) => {
    if (!this.isVertical) {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tab-panel': UTabPanel;
  }
}
