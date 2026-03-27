import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTab } from "../tab/UTab.component.js";
import { UPanel } from "../panel/UPanel.component.js";
import { styles } from "./UTabPanel.styles.js";

export type TabPanelVariant = 'line' | 'card' | 'pill' | 'plain';
export type TabPanelPlacement = 'top' | 'bottom' | 'left' | 'right';

/**
 * TabPanel 컴포넌트는 탭 기반 콘텐츠 전환을 제공합니다.
 * u-tab과 u-panel을 자식으로 받아 value 기반으로 매칭합니다.
 *
 * @slot - u-tab 및 u-panel 요소들을 삽입합니다.
 * @slot toolbar - 탭 영역의 남는 공간에 표시할 콘텐츠를 삽입합니다.
 *
 * @event u-change - 탭 변경 시 발생
 * @event u-close - 탭 닫기 시 발생
 */
export class UTabPanel extends UElement {
  static styles = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {
    'u-tab': UTab,
    'u-panel': UPanel,
  };

  /** 탭 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 탭 스타일 변형 */
  @property({ type: String, reflect: true }) variant: TabPanelVariant = 'line';
  /** 탭 위치 */
  @property({ type: String, reflect: true }) placement: TabPanelPlacement = 'top';
  /** 선택된 탭 값 */
  @property({ type: String, reflect: true }) value = '';

  /** 탭 추가/수정 가능 여부 (추후 구현) */
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
        <div class="nav" @wheel=${this.handleNavWheel}>
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

  /** 탭/패널 활성 상태 동기화 */
  private updateTabPanel() {
    this.tabs.forEach(tab => {
      tab.toggleAttribute('active', tab.value === this.value);
    });
    this.panels.forEach(panel => {
      panel.hidden = panel.value !== this.value;
    });
    this.emit('u-change');
  }

  /** 기본 슬롯 변경: u-tab에는 slot="tab" 자동 부여, u-panel은 수집, 그 외 요소는 hidden 처리 */
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

  /** 탭 슬롯 변경 */
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

  /** 탭 클릭 핸들러 */
  private handleTabClick = (e: PointerEvent) => {
    const tab = (e.currentTarget || e.target) as UTab;
    if (tab.disabled || this.disabled) return;
    this.value = tab.value;
  }

  /** 키보드 탐색 */
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
        this.value = enabledTabs[currentIndex].value;
        return;
      default:
        return;
    }

    if (targetIndex >= 0) {
      e.preventDefault();
      enabledTabs[targetIndex].focus();
      this.value = enabledTabs[targetIndex].value;
    }
  }

  /** 마우스 휠로 수평 탭 스크롤 */
  private handleNavWheel = (e: WheelEvent) => {
    if (!this.isVertical) {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      target.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  }
}
