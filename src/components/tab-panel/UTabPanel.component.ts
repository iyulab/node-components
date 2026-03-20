import { html, PropertyValues } from "lit";
import { property, state, query } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTab } from "../tab/UTab.component.js";
import { UPanel } from "../panel/UPanel.component.js";
import { styles } from "./UTabPanel.styles.js";

export type TabPanelVariant = 'line' | 'card' | 'pill' | 'plain';
export type TabPanelPlacement = 'top' | 'bottom' | 'left' | 'right';
export type TabPanelJustify = 'flex-start' | 'center' | 'flex-end' | 'space-between';

/**
 * TabPanel 컴포넌트는 탭 기반 콘텐츠 전환을 제공합니다.
 * u-tab과 u-panel을 자식으로 받아 value 기반으로 매칭합니다.
 *
 * @slot - u-tab 및 u-panel 요소들을 삽입합니다.
 * @slot toolbar - 탭 영역의 남는 공간에 표시할 콘텐츠를 삽입합니다.
 *
 * @fires u-change - 탭 변경 시 발생
 * @fires u-close - 탭 닫기 시 발생
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
  /** 탭 정렬 */
  @property({ type: String, reflect: true }) justify: TabPanelJustify = 'flex-start';
  /** 선택된 탭 값 */
  @property({ type: String, reflect: true }) value = '';

  /** 탭 추가/수정 가능 여부 (추후 구현) */
  @property({ type: Boolean, reflect: true }) editable = false;
  /** 탭 순서 변경 드래그 여부 (추후 구현) */
  @property({ type: Boolean, reflect: true }) override draggable = false;

  @state() private tabs: UTab[] = [];
  @state() private panels: UPanel[] = [];

  @query('.nav') navEl!: HTMLElement;

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('value')) {
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
      tab.active = tab.value === this.value;
      tab.setAttribute('aria-selected', String(tab.value === this.value));
    });
    this.panels.forEach(panel => {
      panel.hidden = panel.value !== this.value;
    });
    this.emit('u-change');
  }

  /** 기본 슬롯 변경: u-tab에는 slot="tab" 자동 부여, u-panel은 수집 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });

    const panels: UPanel[] = [];
    for (const el of elements) {
      if (el instanceof UTab) {
        el.setAttribute('slot', 'tab');
      } else if (el instanceof UPanel) {
        panels.push(el);
      } else {
        el.setAttribute('hidden', '');
      }
    }
    this.panels = panels;

    // value가 없으면 첫 번째 탭의 값을 기본값으로 설정
    if (!this.value && this.tabs.length > 0) {
      this.value = this.tabs[0].value;
    } else {
      this.updateTabPanel();
    }
  }

  /** 탭 슬롯 변경 */
  private handleTabSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.tabs = slot.assignedElements({ flatten: true })
      .filter((el): el is UTab => el instanceof UTab);

    // 탭 이벤트 바인딩
    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.handleTabClick);
      tab.removeEventListener('keydown', this.handleTabKeydown);

      tab.addEventListener('click', this.handleTabClick);
      tab.addEventListener('keydown', this.handleTabKeydown);
    });

    if (!this.value && this.tabs.length > 0) {
      this.value = this.tabs[0].value;
    } else {
      this.updateTabPanel();
    }
  }

  /** 탭 클릭 핸들러 */
  private handleTabClick = (e: Event) => {
    const tab = (e.currentTarget || e.target) as UTab;
    if (tab.disabled || this.disabled) return;
    this.value = tab.value;
  }

  /** 키보드 탐색 */
  private handleTabKeydown = (e: KeyboardEvent) => {
    const isVertical = this.placement === 'left' || this.placement === 'right';
    const enabledTabs = this.tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.indexOf(e.currentTarget as UTab);
    if (currentIndex === -1) return;

    let targetIndex = -1;
    switch (e.key) {
      case (isVertical ? 'ArrowDown' : 'ArrowRight'):
        targetIndex = (currentIndex + 1) % enabledTabs.length;
        break;
      case (isVertical ? 'ArrowUp' : 'ArrowLeft'):
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

  /** 마우스 휠로 수평 탭 스크롤 (overflow-x는 수직 휠에 반응하지 않으므로 수동 변환) */
  private handleNavWheel = (e: WheelEvent) => {
    const isVertical = this.placement === 'left' || this.placement === 'right';
    if (!isVertical) {
      e.preventDefault();
      this.navEl.scrollBy({ left: e.deltaY, behavior: 'smooth' });
    }
  }
}
