import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTab } from "../tab/UTab.js";
import { UPanel } from "../panel/UPanel.js";
import { styles } from "./UTabPanel.styles.js";
import { isFromNestedControl } from "../../utilities/nestedControl.js";

/** 탭 띠의 외형 — `line`(기본) · `card` · `pill` · `plain`(외형 없음 — 공통 어휘). */
export type TabPanelAppearance = 'line' | 'card' | 'pill' | 'plain';
export type TabPanelPlacement = 'top' | 'bottom' | 'left' | 'right';

let idSeq = 0;
const nextId = (prefix: string) => `${prefix}-${++idSeq}`;

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
 * @cssprop --tab-panel-color - 활성 탭의 기준색 (기본: --u-primary-color)
 *
 * @event change - 탭을 클릭하거나 키보드로 선택했을 때만 발생한다. 최초 마운트 시 첫 탭이
 *   자동 선택되는 경우나 `value` 프로퍼티를 직접 대입하는 경우는 사용자 조작이 아니므로
 *   발생시키지 않는다(네이티브 select가 프로그래밍적 대입에는 change를 내지 않는 것과 동일한 관례).
 */
@customElement('u-tab-panel')
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export class UTabPanel extends UElement {
  static styles = [super.styles, styles];

  /** 탭 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled = false;
  /** 탭 스타일 변형 */
  @property({ type: String, reflect: true }) appearance: TabPanelAppearance = 'line';
  /** 탭 위치 */
  @property({ type: String, reflect: true }) placement: TabPanelPlacement = 'top';
  /** 선택된 탭값 */
  @property({ type: String, reflect: true }) value = '';
  /**
   * 네이티브 전역 속성. ⚠**이 컴포넌트에 탭 재정렬 기능은 없다** — 브라우저의 드래그를
   * 켤 뿐이고, 놓았을 때 순서를 바꾸는 코드는 존재한 적이 없다.
   */
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

  /**
   * 선택 상태를 외형(`active`)과 보조기기 표면에 함께 싣는다 — WAI-ARIA APG Tabs.
   * - 탭: `aria-selected` · 로빙 tabindex(선택된 탭만 0 — Tab 은 탭 목록에 한 번만 멈추고,
   *   안에서는 화살표가 옮긴다). 선택된 탭이 없거나 비활성이면 첫 활성 탭이 0 을 받는다.
   * - 패널: `role="tabpanel"` · 같은 `value` 의 탭과 `aria-controls`/`aria-labelledby` 로 잇는다.
   *   탭과 패널은 같은 light DOM 에 있으므로 id 참조가 성립한다. 소비자는 id 를 몰라도 된다 —
   *   없으면 만든다(주어진 id 는 그대로 쓴다).
   */
  private updateTabPanel() {
    const stop = this.tabs.find(t => t.value === this.value && !t.disabled)
      ?? this.tabs.find(t => !t.disabled);
    const panelOf = new Map(this.panels.map(p => [p.value, p] as const));
    const tabOf = new Map(this.tabs.map(t => [t.value, t] as const));

    this.tabs.forEach(tab => {
      const selected = tab.value === this.value;
      tab.toggleAttribute('active', selected);
      tab.setAttribute('aria-selected', String(selected));
      tab.setAttribute('tabindex', tab === stop ? '0' : '-1');
      if (!tab.id) tab.id = nextId('u-tab');
      const panel = panelOf.get(tab.value);
      if (panel) {
        if (!panel.id) panel.id = nextId('u-tab-panel');
        tab.setAttribute('aria-controls', panel.id);
      } else {
        tab.removeAttribute('aria-controls');
      }
    });
    this.panels.forEach(panel => {
      panel.hidden = panel.value !== this.value;
      panel.setAttribute('role', 'tabpanel');
      const tab = tabOf.get(panel.value);
      if (tab) panel.setAttribute('aria-labelledby', tab.id);
      else panel.removeAttribute('aria-labelledby');
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
    // 탭 «안의» 컨트롤(닫기 버튼)에서 올라온 키는 그 컨트롤의 것이다 — 탭 키보드 모델은 탭 자신에
    // 포커스가 있을 때만 해석한다. 그렇지 않으면 닫기 버튼의 Enter 가 «이 탭 선택» 으로도 읽히고,
    // 막으면 버튼의 네이티브 활성화가 사라진다.
    if (isFromNestedControl(e, e.currentTarget as Element)) return;
    const enabledTabs = this.tabs.filter(t => !t.disabled);
    const currentIndex = enabledTabs.indexOf(e.currentTarget as UTab);
    if (currentIndex === -1) return;

    // 초기값을 두지 않는다 — 아래 switch 의 모든 «빠져나가는» 경로가 return 하므로
    // (`Enter`/` ` 와 `default`), 여기를 지나는 순간 targetIndex 는 반드시 대입돼 있다.
    // TS 의 확정 대입 분석이 그것을 증명하고, 새 case 가 대입을 빠뜨리면 컴파일이 막는다.
    let targetIndex: number;
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
        // Space 의 기본 동작은 페이지 스크롤이다 — 탭을 고르는 키가 화면을 함께 넘기면 안 된다.
        e.preventDefault();
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
      // 동작 줄이기면 즉시 — 'smooth' 는 이 설정을 스스로 존중하지 않는다(엔진마다 다르다).
      const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      target.scrollBy({ left: e.deltaY, behavior: reduce ? 'auto' : 'smooth' });
    }
  }
}

/** Events `<u-tab-panel>` dispatches. */
export interface UTabPanelEventMap {
  /** A tab was chosen by click or keyboard — not on first mount. Does not bubble; read `value` on the panel. */
  'change': CustomEvent<null>;
}

/** Typed listeners for {@link UTabPanelEventMap} — element-scoped, the DOM's own pattern (`HTMLMediaElementEventMap`). */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export interface UTabPanel {
  addEventListener<K extends keyof UTabPanelEventMap>(type: K, listener: (this: UTabPanel, ev: UTabPanelEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UTabPanel, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof UTabPanelEventMap>(type: K, listener: (this: UTabPanel, ev: UTabPanelEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: UTabPanel, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tab-panel': UTabPanel;
  }
}
