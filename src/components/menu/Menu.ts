import { html, PropertyValues } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import type { VirtualElement } from "@floating-ui/dom";

import { arrayAttributeConverter } from "../../internals/attribute-converters.js";
import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { MenuItem } from "../menu-item/MenuItem.js";
import { styles } from "./Menu.styles.js";

export type MenuMode = 'none' | 'single' | 'multiple';
export type MenuTrigger = 'none' | 'hover' | 'click' | 'contextmenu';

export class Menu extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-menu-item': MenuItem,
  };

  @queryAssignedElements({ flatten: false, selector: 'u-menu-item' })
  items!: MenuItem[];

  /** 
   * 메뉴 트리거 방식
   * - none: 수동 제어 (기본)
   * - hover: 앵커 호버 시 표시 (드롭다운 메뉴)
   * - click: 앵커 클릭 시 토글 (드롭다운 메뉴)
   * - contextmenu: 앵커 우클릭 시 표시 (컨텍스트 메뉴)
   */
  @property({ type: String, reflect: true }) 
  trigger: MenuTrigger = 'none';

  /** 
   * 메뉴 선택 모드
   * - none: 액션만 실행, 상태 관리 없음
   * - single: 하나만 선택 가능
   * - multiple: 여러 개 선택 가능 (체크박스)
   */
  @property({ type: String, reflect: true }) 
  mode: MenuMode = 'none';

  /** 
   * 선택된 값 (single: 첫번째 요소, multiple: 배열) 
   */
  @property({ type: Array, converter: arrayAttributeConverter(v => v) }) 
  value: string[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('click', this.handleClick);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('click', this.handleClick);
    this.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (!changedProperties.has('anchor') && 
        changedProperties.has('trigger') && this.anchor) {
      this.unbind(this.anchor);
      this.bind(this.anchor);
    }

    if (changedProperties.has('value')) {
      this.updateItems();
    }
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  /** 특정 인덱스의 아이템에 포커스 (기본: 첫 번째) */
  public focusAt = async (index: number = 0) => {
    await this.updateComplete;
    const enabled = (this.items || []).filter(i => !i.disabled);
    if (enabled.length === 0) return;
    
    index = index < 0 
      ? Math.max(0, enabled.length + index) 
      : Math.min(index, enabled.length - 1);
    
    enabled[index]?.focus();
  }

  /** 앵커에 이벤트 바인딩 */
  protected bind(target: HTMLElement): void {
    if (this.trigger === 'hover') {
      target.addEventListener('pointerenter', this.handleAnchorPointerEnter);
      target.addEventListener('pointerleave', this.handleAnchorPointerLeave);
      target.addEventListener('focusin', this.handleAnchorFocusIn);
      target.addEventListener('focusout', this.handleAnchorFocusOut);
    }else if (this.trigger === 'click') {
      this.placement = 'bottom-start';
      target.addEventListener('pointerdown', this.handleAnchorPointerDown);
      target.addEventListener('keydown', this.handleAnchorKeydown);
    } else if (this.trigger === 'contextmenu') {
      this.placement = 'bottom-start';
      target.addEventListener('contextmenu', this.handleAnchorContextMenu);
    } else {
      // nothing to do
    }
  }

  /** 앵커에서 이벤트 바인딩 해제 */
  protected unbind(target: HTMLElement): void {
    target.removeEventListener('pointerenter', this.handleAnchorPointerEnter);
    target.removeEventListener('pointerleave', this.handleAnchorPointerLeave);
    target.removeEventListener('focusin', this.handleAnchorFocusIn);
    target.removeEventListener('focusout', this.handleAnchorFocusOut);
    target.removeEventListener('pointerdown', this.handleAnchorPointerDown);
    target.removeEventListener('keydown', this.handleAnchorKeydown);
    target.removeEventListener('contextmenu', this.handleAnchorContextMenu);
  }

  /** 아이템들의 선택 상태를 value에 맞게 업데이트 */
  private updateItems = () => {
    const items = this.items || [];

    if (this.mode === 'single') {
      items.forEach(item => {
        item.selected = item.value === this.value.at(0);
        item.checked = false;
      });
    } else if (this.mode === 'multiple') {
      items.forEach(item => {
        item.selected = false;
        item.checked = this.value.includes(item.value);
      });
    } else {
      // nothing to do
    }
  }

  /** 슬롯 변경 핸들러 */
  private handleSlotChange = () => {
    this.updateItems();
  };

  /** 클릭 핸들러 */
  private handleClick = async (e: MouseEvent) => {
    const target = e.target as HTMLElement;
    const item = target.closest('u-menu-item');

    if (!item || item.disabled) return;
    if (!(this.items || []).includes(item)) return;
    
    const value = item.value || '';

    // 모드에 따른 값 처리
    if (this.mode === 'single') {
      this.value = [value];
      this.emit('u-select', { value: this.value });
    } else if (this.mode === 'multiple') {
      this.value = this.value.includes(value)
        ? this.value.filter(v => v !== value)
        : [...this.value, value];
      this.emit('u-select', { value: this.value });
    } else {
      this.emit('u-select', { value });
    }
  }

  /** 키보드 내비게이션 핸들러 */
  private handleKeydown = async (e: KeyboardEvent) => {
    const items = (this.items || []).filter(item => !item.disabled);
    if (items.length === 0) return;

    const currentItem = e.target as MenuItem;
    if (!currentItem || !items.includes(currentItem)) return;

    const currentIndex = items.findIndex(item => item === currentItem);
    let nextIndex: number;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        currentItem.click();
        break;

      case 'Escape':
        e.preventDefault();
        await this.hide();
        break;

      case 'Home':
        e.preventDefault();
        await this.focusAt(0);
        break;

      case 'End':
        e.preventDefault();
        await this.focusAt(items.length - 1);
        break;

      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        await this.focusAt(nextIndex);
        break;

      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
        await this.focusAt(nextIndex);
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        break;

      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        break;
    }
  }

  private handleWindowPointerDown = async (e: PointerEvent) => {
    const target = e.target as Node;
    console.log('window pointerdown', target);
    if (this.contains(target)) return;
    console.log('window pointerdown - hide menu');
    await this.hide();
  }

  private handleWindowKeydown = async (e: KeyboardEvent) => {    
    if (e.key === 'Escape') {
      e.preventDefault();
      await this.hide();
    }
  }

  private handleAnchorPointerEnter = (e: PointerEvent) => {
    console.log('pointerenter');
    const target = e.target as HTMLElement;
    const menuItem = target.closest('u-menu-item');
    if (!menuItem || menuItem.disabled) return;

    menuItem.submenu?.show();
  };

  private handleAnchorPointerLeave = async (e: PointerEvent) => {
    console.log('pointerleave');
    const target = e.target as HTMLElement;
    const menuItem = target.closest('u-menu-item');
    if (!menuItem || menuItem.disabled) return;

    // 서브메뉴로 이동한 경우는 제외
    const related = e.relatedTarget as Node | null;
    if (related && menuItem.submenu?.contains(related)) return;
    await menuItem.submenu?.hide();
  };

  private handleAnchorFocusIn = (e: FocusEvent) => {
    console.log('focusin');
    const target = e.target as HTMLElement;
    const menuItem = target.closest('u-menu-item');
    if (!menuItem || menuItem.disabled) return;

    menuItem.submenu?.show();
  };
  
  private handleAnchorFocusOut = async (e: FocusEvent) => {
    console.log('focusout');
    const target = e.target as HTMLElement;
    const menuItem = target.closest('u-menu-item');
    if (!menuItem || menuItem.disabled) return;
    // 서브메뉴로 이동한 경우는 제외
    const related = e.relatedTarget as Node | null;
    if (related && menuItem.submenu?.contains(related)) return;
    await menuItem.submenu?.hide();
  };

  private handleAnchorPointerDown = async (e: PointerEvent) => {
    console.log('pointerdown');
    if (e.button !== 0) return;
    if (this.visible) await this.hide();
    else await this.show();
  };

  private handleAnchorKeydown = async (e: KeyboardEvent) => {
    console.log('keydown');
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.visible) await this.show();
    }
  };

  private handleAnchorContextMenu = async (e: MouseEvent) => {
    e.preventDefault();
    await this.hide();

    const virtual: VirtualElement = {
      getBoundingClientRect: () => ({
        x: e.clientX,
        y: e.clientY,
        left: e.clientX,
        top: e.clientY,
        right: e.clientX,
        bottom: e.clientY,
        width: 0,
        height: 0
      }),
    };

    await this.show(virtual, false);
  };
}