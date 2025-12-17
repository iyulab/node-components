import { html, PropertyValues } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import type { VirtualElement } from "@floating-ui/dom";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { MenuItem } from "../menu-item/MenuItem.js";
import { styles } from "./Menu.styles.js";

export type MenuType = 'default' | 'dropdown' | 'contextmenu' | 'submenu';
export type MenuMode = 'none' | 'single' | 'multiple';

type MenuItemFilter = 'all' | 'enabled' | 'disabled' | 'selected' | 'unselected' | 'checked' | 'unchecked';

/**
 * Menu 컴포넌트는 드롭다운 메뉴, 컨텍스트 메뉴, 서브메뉴 등을 구현하기 위한 컴포넌트입니다.
 */
export class Menu extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-menu-item': MenuItem,
  };

  @queryAssignedElements({ flatten: false, selector: 'u-menu-item' })
  items?: MenuItem[];

  /** 
   * 메뉴 타입
   * - default: 일반 메뉴 (수동 제어)
   * - dropdown: 드롭다운 메뉴 (앵커 클릭 시 토글)
   * - contextmenu: 컨텍스트 메뉴 (앵커 우클릭 시 표시)
   * - submenu: 서브메뉴 (앵커 호버/포커스 시 표시)
   */
  @property({ type: String, reflect: true }) 
  type: MenuType = 'default';

  /** 
   * 메뉴 선택 모드
   * - none: 액션만 실행, 상태 관리 없음
   * - single: 하나만 선택 가능
   * - multiple: 여러 개 선택 가능 (체크박스)
   */
  @property({ type: String, reflect: true }) 
  mode: MenuMode = 'none';

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

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (changedProperties.has('anchor') || changedProperties.has('type')) {
      const oldType = changedProperties.get('type') || 'default' as MenuType;
      const newType = this.type || 'default' as MenuType;
      const oldAnchor = changedProperties.get('anchor') as HTMLElement | null;
      const newAnchor = this.anchor;

      if (oldAnchor) this.unbind(oldType, oldAnchor);
      if (newAnchor) this.bind(newType, newAnchor);
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  /** 
   * 특정 인덱스의 아이템에 포커스 (기본: 첫 번째)
   * @param index 인덱스 (음수 가능)
   */
  public focusAt = async (index: number = 0) => {
    await this.updateComplete;
    const items = this.items || [];
    const length = items.length;
    if (length === 0) return;

    index = index < 0
      ? Math.max(0, length + index) 
      : Math.min(index, length - 1);
    
    const item = items[index];
    if (item.disabled) return;
    item.focus();
  }

  /**
   * 조건에 맞는 메뉴 아이템들을 반환합니다
   * 
   * @param filter - 필터 조건입니다
   * @return 조건에 맞는 아이템들의 배열입니다
   */
  public getItems(filter: MenuItemFilter = 'all'): MenuItem[] {
    const items = this.items || [];
    switch (filter) {
      case 'all':
        return items;
      case 'enabled':
        return items.filter(item => !item.disabled);
      case 'disabled':
        return items.filter(item => item.disabled);
      case 'selected':
        return items.filter(item => item.selected);
      case 'unselected':
        return items.filter(item => !item.selected);
      case 'checked':
        return items.filter(item => item.checked);
      case 'unchecked':
        return items.filter(item => !item.checked);
      default:
        return [];
    }
  }

  /** 앵커에 이벤트 바인딩 */
  private bind(type: MenuType, target: HTMLElement): void {
    // 타입별 속성 및 이벤트 바인딩
    if (type === 'submenu') {
      this.visible = false;
      this.placement ||= 'right-start';
      target.addEventListener('pointerenter', this.handleAnchorPointerEnter);
      target.addEventListener('pointerleave', this.handleAnchorPointerLeave);
      target.addEventListener('focusin', this.handleAnchorFocusIn);
      target.addEventListener('focusout', this.handleAnchorFocusOut);
    } else if (type === 'dropdown') {
      this.visible = false;
      this.placement ||= 'bottom-start';
      target.addEventListener('pointerdown', this.handleAnchorPointerDown);
      target.addEventListener('keydown', this.handleAnchorKeydown);
    } else if (type === 'contextmenu') {
      this.visible = false;
      this.placement ||= 'bottom-start';
      target.addEventListener('contextmenu', this.handleAnchorContextMenu);
    } else {
      this.visible = true;
      return;
    }

    // 공통 이벤트
    window.addEventListener('focusout', this.handleWindowFocusOut);
    window.addEventListener('keydown', this.handleWindowKeydown);
    window.addEventListener('pointerdown', this.handleWindowPointerDown);
  }

  /** 앵커에서 이벤트 바인딩 해제 */
  private unbind(_: MenuType, target: HTMLElement): void {
    window.removeEventListener('focusout', this.handleWindowFocusOut);
    window.removeEventListener('keydown', this.handleWindowKeydown);
    window.removeEventListener('pointerdown', this.handleWindowPointerDown);

    target.removeEventListener('pointerenter', this.handleAnchorPointerEnter);
    target.removeEventListener('pointerleave', this.handleAnchorPointerLeave);
    target.removeEventListener('focusin', this.handleAnchorFocusIn);
    target.removeEventListener('focusout', this.handleAnchorFocusOut);
    target.removeEventListener('pointerdown', this.handleAnchorPointerDown);
    target.removeEventListener('keydown', this.handleAnchorKeydown);
    target.removeEventListener('contextmenu', this.handleAnchorContextMenu);
  }

  /** 클릭 핸들러 */
  private handleClick = async (e: MouseEvent) => {
    const item = this.getEnabledItemFrom(e);
    if (!item) return;
    
    const items = this.getItems('enabled');
    if (!items.includes(item)) return;
    
    const value = item.value || '';
    this.emit('u-select', { value });
  }

  /** 키보드 내비게이션 핸들러 */
  private handleKeydown = async (e: KeyboardEvent) => {
    const item = this.getEnabledItemFrom(e);
    if (!item) return;

    const items = this.getItems('enabled');
    if (!items.includes(item)) return;

    const currentIndex = items.findIndex(i => i === item);
    let nextIndex: number;
    
    switch (e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        item.click();
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

      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        if (this.type === 'submenu') {
          this.anchor?.focus();
        }
        break;
        
      case 'ArrowRight':
        e.preventDefault();
        e.stopPropagation();
        const menu = item.querySelector('u-menu');
        if (menu?.type === 'submenu') {
          await menu?.focusAt(0);
        }
        break;
    }
  }

  //#region 공통 이벤트 핸들러
  private handleWindowFocusOut = async (_: FocusEvent) => {
    await this.hide();
  }

  private handleWindowKeydown = async (e: KeyboardEvent) => {    
    if (e.key === 'Escape') {
      await this.hide();
    }
  }

  private handleWindowPointerDown = async (e: PointerEvent) => {
    if (this.type === 'contextmenu') {
      // 메뉴 내부 클릭인 경우 무시
      const targets = e.composedPath().filter(v => v instanceof HTMLElement);
      for (const target of targets) {
        if (this.contains(target)) return;
      }
      
      await this.hide();
    } else if (this.type === 'dropdown') {
      const anchor = this.anchor;
      if (!anchor) return;
      
      // 메뉴 또는 앵커 내부 클릭인 경우 무시
      const targets = e.composedPath().filter(v => v instanceof HTMLElement);
      for (const target of targets) {
        if (this.contains(target) || anchor.contains(target)) return;
      }

      await this.hide();
    }
  }
  //#endregion

  //#region 'submenu' 이벤트 핸들러
  private handleAnchorPointerEnter = (e: PointerEvent) => {
    const item = this.getEnabledItemFrom(e);
    if (!item) return;
    this.show();
  };

  private handleAnchorPointerLeave = async (e: PointerEvent) => {
    const item = this.getEnabledItemFrom(e);
    if (!item) return;
    this.hide();
  };

  private handleAnchorFocusIn = (e: FocusEvent) => {
    const item = this.getEnabledItemFrom(e);
    if (!item) return;
    this.show();
  };
  
  private handleAnchorFocusOut = async (e: FocusEvent) => {
    const item = this.getEnabledItemFrom(e);
    if (!item) return;
    this.hide();
  };
  //#endregion

  //#region 'dropdown' 이벤트 핸들러
  private handleAnchorPointerDown = async (e: PointerEvent) => {
    if (e.button !== 0) return;

    if (this.visible)
      await this.hide();
    else 
      await this.show();
  };

  private handleAnchorKeydown = async (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (this.visible) return; 
      await this.show();
    }
  };
  //#endregion

  //#region 'contextmenu' 이벤트 핸들러
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
  //#endregion

  /** 이벤트로부터 활성화된 (비활성화되지 않은) 메뉴 아이템을 반환 */
  private getEnabledItemFrom(event: Event): MenuItem | null {
    const target = event.target as HTMLElement;
    const item = target.closest('u-menu-item');
    if (!item || item.disabled) return null;
    return item;
  }
}