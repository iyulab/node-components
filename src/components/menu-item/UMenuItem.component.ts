import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { computePosition, offset, flip, autoUpdate } from '@floating-ui/dom';

import { BaseElement } from "../BaseElement.js";
import { styles } from "./UMenuItem.styles.js";

export class UMenuItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  // 서브메뉴 자동 위치 업데이트 정리 함수
  private cleanup: (() => void) | null = null;

  /** 중첩된 서브메뉴 아이템들 */
  @state() submenuItems: UMenuItem[] = [];
  /** 서브메뉴가 열려있는지 여부 */
  @state() submenuVisible: boolean = false;
  
  /** 비활성화 여부 @default false */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 여부(multiple mode) @default false */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 선택 여부(single mode) @default false */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 값 */
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    
    // 이벤트 바인딩
    this.addEventListener('pointerenter', this.handlePointerEnter);
    this.addEventListener('pointerleave', this.handlePointerLeave);
    this.addEventListener('focusin', this.handleFocusIn);
    this.addEventListener('focusout', this.handleFocusOut);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('pointerenter', this.handlePointerEnter);
    this.removeEventListener('pointerleave', this.handlePointerLeave);
    this.removeEventListener('focusin', this.handleFocusIn);
    this.removeEventListener('focusout', this.handleFocusOut);
    this.removeEventListener('keydown', this.handleKeydown);
    this.cleanupSubmenu();
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      const tabIndex = this.disabled ? '-1' : '0';
      this.setAttribute('tabindex', tabIndex);
    }
  }

  render() {
    return html`
      <u-icon class="prefix icon"
        ?hidden=${!this.checked}
        lib="internal"
        name="check"
      ></u-icon>

      <slot name="prefix"></slot>

      <span class="label">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>

      <slot name="suffix"></slot>

      <u-icon class="suffix icon"
        ?hidden=${this.submenuItems.length === 0}
        lib="internal"
        name="chevron-right"
      ></u-icon>

      <div class="submenu-popup" part="submenu" 
        ?visible=${this.submenuVisible}>
        ${this.submenuItems.map(item => html`
          <slot name=${this.getSlotName(item)}></slot>
        `)}
      </div>
    `;
  }

  /** 서브메뉴의 특정 인덱스 아이템에 포커스 */
  public async focusNestedAt(index: number = 0) {
    await this.updateComplete;
    const items = this.submenuItems.filter(item => !item.disabled);
    if (items.length === 0) return;

    index = index < 0
      ? Math.max(0, items.length + index) 
      : Math.min(index, items.length - 1);
    
    items[index]?.focus();
  }

  /** 서브메뉴 표시 */
  public async showSubmenu() {
    if (this.submenuItems.length === 0) return;
    if (this.submenuVisible) return;
    
    this.submenuVisible = true;
    await this.updateComplete;
    
    const popup = this.shadowRoot?.querySelector('.submenu-popup') as HTMLElement;
    if (!popup) return;

    // 위치 계산 시작
    await this.repositionSubmenu(popup);
    this.cleanup = autoUpdate(this, popup, () => {
      this.repositionSubmenu(popup);
    });
  }

  /** 서브메뉴 숨김 */
  public hideSubmenu() {
    if (!this.submenuVisible) return;
    
    this.cleanupSubmenu();
    this.submenuVisible = false;

    // 중첩된 서브메뉴들도 닫기
    for (const item of this.submenuItems) {
      item.hideSubmenu();
    }
  }

  /** 중첩된 메뉴 아이템 감지 (slotchange) */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    
    // u-menu-item 요소만 필터링
    const items = elements.filter(el => el instanceof UMenuItem) as UMenuItem[];
    
    // 아이템이 없으면 무시 (이미 nested 슬롯으로 이동한 경우)
    if (items.length === 0) return;
    
    // 각 아이템에 고유 슬롯 이름 부여
    items.forEach((item, index) => {
      item.setAttribute('slot', `nested-${index}`);
    });
    
    this.submenuItems = items;
    this.requestUpdate();
  }

  /** 아이템의 슬롯 이름 반환 */
  private getSlotName(item: UMenuItem): string {
    return item.getAttribute('slot') || '';
  }

  /** 서브메뉴 위치 계산 */
  private async repositionSubmenu(popup: HTMLElement) {
    const position = await computePosition(this, popup, {
      strategy: 'fixed',
      placement: 'right-start',
      middleware: [
        offset({ mainAxis: 0, crossAxis: -8 }),
        flip({ fallbackPlacements: ['left-start', 'right-start'] }),
      ],
    });

    Object.assign(popup.style, {
      left: `${position.x}px`,
      top: `${position.y}px`,
    });
  }

  /** 서브메뉴 정리 */
  private cleanupSubmenu() {
    if (this.cleanup) {
      this.cleanup();
      this.cleanup = null;
    }
  }

  //#region 이벤트 핸들러
  private handlePointerEnter = () => {
    if (this.submenuItems.length > 0 && !this.disabled) {
      this.showSubmenu();
    }
  }

  private handlePointerLeave = (e: PointerEvent) => {
    if (this.submenuItems.length === 0) return;
    
    const related = e.relatedTarget as Element | null;
    if (related) {
      const popup = this.shadowRoot?.querySelector('.submenu-popup');
      if (this.contains(related) || popup?.contains(related)) return;
    }
    
    this.hideSubmenu();
  }

  private handleFocusIn = () => {
    if (this.submenuItems.length > 0 && !this.disabled) {
      this.showSubmenu();
    }
  }

  private handleFocusOut = (e: FocusEvent) => {
    if (this.submenuItems.length === 0) return;
    
    const related = e.relatedTarget as Element | null;
    if (related) {
      const popup = this.shadowRoot?.querySelector('.submenu-popup');
      if (this.contains(related) || popup?.contains(related)) return;
    }
    
    this.hideSubmenu();
  }

  private handleKeydown = async (e: KeyboardEvent) => {
    if (this.submenuItems.length === 0) return;
    if (this.disabled) return;
    
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      e.stopPropagation();
      await this.showSubmenu();
      await this.focusNestedAt(0);
    }
  }
  //#endregion
}