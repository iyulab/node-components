import { html, PropertyValues } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import type { VirtualElement } from "@floating-ui/dom";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { UMenuItem } from "../menu-item/UMenuItem.component.js";
import { styles } from "./UMenu.styles.js";

export type MenuType = 'default' | 'dropdown' | 'contextmenu' | 'submenu';
export type MenuMode = 'none' | 'single' | 'multiple';

type MenuItemFilter = 'all' | 'enabled' | 'disabled' | 'selected' | 'unselected' | 'checked' | 'unchecked';

/**
 * Menu 컴포넌트는 드롭다운 메뉴, 컨텍스트 메뉴, 서브메뉴 등을 구현하기 위한 컴포넌트입니다.
 */
export class UMenu extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  @queryAssignedElements({ flatten: false })
  items?: UMenuItem[];

  /** 
   * 메뉴 타입
   * - default: 일반 메뉴 (수동 제어)
   * - dropdown: 드롭다운 메뉴 (앵커 클릭 시 토글)
   * - contextmenu: 컨텍스트 메뉴 (앵커 우클릭 시 표시)
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

    // anchors 또는 type 변경 시 바인딩 갱신
    if (changedProperties.has('anchors') || changedProperties.has('type')) {
      const oldType = changedProperties.get('type') || 'default' as MenuType;
      const newType = this.type || 'default' as MenuType;
      const oldAnchors = changedProperties.get('anchors') as HTMLElement[] | undefined;
      const newAnchors = this.anchors;

      if (oldAnchors) this.unbind(oldType, oldAnchors);
      if (newAnchors) this.bind(newType, newAnchors);
    }

    // mode 변경 시 선택 상태 초기화
    if (changedProperties.has('mode')) {
      this.clearAll();
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
    const items = this.getItems('enabled');
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
   * 모든 아이템들의 선택 상태를 해제합니다
   * 재귀적으로 서브메뉴의 아이템들도 해제됩니다.
   */
  public clearAll(): void {
    const items = this.getItems('all');
    for (const item of items) {
      item.selected = false;
      item.checked = false;
      // 중첩된 아이템들도 재귀적으로 처리
      if (item.submenu) {
        item.submenu.clearAll();
      }
    }
  }

  /**
   * 조건에 맞는 메뉴 아이템들을 반환합니다
   * 
   * @param filter - 필터 조건입니다
   * @return 조건에 맞는 아이템들의 배열입니다
   */
  public getItems(filter: MenuItemFilter = 'all'): UMenuItem[] {
    const items = this.items?.filter(item => item instanceof UMenuItem) || [];
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
  private bind(type: MenuType, anchors: HTMLElement[]): void {
    // 타입별 속성 및 이벤트 바인딩
    if (type === 'dropdown') {
      this.visible = false;
      this.placement ||= 'bottom-start';
      for (const anchor of anchors) {
        anchor.addEventListener('pointerdown', this.handleAnchorPointerDown);
        anchor.addEventListener('keydown', this.handleAnchorKeydown);
      }
    } else if (type === 'contextmenu') {
      this.visible = false;
      this.placement ||= 'bottom-start';
      for (const anchor of anchors) {
        anchor.addEventListener('contextmenu', this.handleAnchorContextMenu);
      }
    } else if (type === 'submenu') {
      this.visible = false;
      this.placement ||= 'right-start';
      for (const anchor of anchors) {
        anchor.addEventListener('pointerenter', this.handleSubmenuAnchorPointerEnter);
        anchor.addEventListener('pointerleave', this.handleSubmenuAnchorPointerLeave);
        anchor.addEventListener('focusin', this.handleSubmenuAnchorFocusIn);
        anchor.addEventListener('focusout', this.handleSubmenuAnchorFocusOut);
      }
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
  private unbind(_: MenuType, anchors: HTMLElement[]): void {
    window.removeEventListener('focusout', this.handleWindowFocusOut);
    window.removeEventListener('keydown', this.handleWindowKeydown);
    window.removeEventListener('pointerdown', this.handleWindowPointerDown);

    for (const anchor of anchors) {
      anchor.removeEventListener('pointerdown', this.handleAnchorPointerDown);
      anchor.removeEventListener('keydown', this.handleAnchorKeydown);
      anchor.removeEventListener('contextmenu', this.handleAnchorContextMenu);
      
      // submenu 이벤트 해제
      anchor.removeEventListener('pointerenter', this.handleSubmenuAnchorPointerEnter);
      anchor.removeEventListener('pointerleave', this.handleSubmenuAnchorPointerLeave);
      anchor.removeEventListener('focusin', this.handleSubmenuAnchorFocusIn);
      anchor.removeEventListener('focusout', this.handleSubmenuAnchorFocusOut);
    }
  }

  //#region 기본 이벤트 핸들러
  private handleClick = async (e: MouseEvent) => {
    const item = e.target;
    if (!(item instanceof UMenuItem)) return;
    if (item.disabled) return;
    if (item.submenu) return;
    
    const items = this.getItems('enabled');
    if (!items.includes(item)) return;
    
    const value = item.value || '';
    if (this.mode === 'single') {
      for (const i of items) {
        i.selected = (i === item);
      }
      // 단일 선택 모드에서는 메뉴를 닫음
      if (this.type !== 'default') {
        this.hide();
      }
    } else if (this.mode === 'multiple') {
      item.checked = !item.checked;
      // 다중 선택 모드에서는 메뉴를 닫지 않음
    } else {
      // 액션 모드에서는 메뉴를 닫음
      if (this.type !== 'default') {
        this.hide();
      }
    }

    this.emit('u-select', { value });
  }

  private handleKeydown = async (e: KeyboardEvent) => {
    const item = e.target;
    if (!(item instanceof UMenuItem)) return;
    if (item.disabled) return;

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
        // 서브메뉴인 경우 닫기
        if (this.type === 'submenu') {
          e.preventDefault();
          e.stopPropagation();
          await this.hide();
          if (this.target instanceof HTMLElement) {
            this.target.focus();
          }
        }
        break;

      case 'ArrowRight':
        // 중첩된 아이템이면 서브메뉴로 포커스 이동
        if (item.submenu) {
          e.preventDefault();
          e.stopPropagation();
          await item.submenu.show(item);
          await item.submenu.focusAt(0);
        }
        break;
    }
  }
  //#endregion

  //#region 공용 이벤트 핸들러
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
      const currentTarget = this.target;
      if (!currentTarget || !(currentTarget instanceof HTMLElement)) return;
      
      // 메뉴 또는 현재 타겟 내부 클릭인 경우 무시
      const targets = e.composedPath().filter(v => v instanceof HTMLElement);
      for (const target of targets) {
        if (this.contains(target) || currentTarget.contains(target)) return;
      }

      await this.hide();
    }
  }
  //#endregion

  //#region 'dropdown' 이벤트 핸들러
  private handleAnchorPointerDown = async (e: PointerEvent) => {
    if (e.button !== 0) return;
    const target = e.currentTarget as HTMLElement;

    if (this.visible && this.target === target)
      await this.hide();
    else 
      await this.show(target);
  };

  private handleAnchorKeydown = async (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      const target = e.currentTarget as HTMLElement;
      if (this.visible) return; 
      await this.show(target);
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

  //#region 'submenu' 이벤트 핸들러
  private handleSubmenuAnchorPointerEnter = (e: PointerEvent) => {
    const target = e.currentTarget as UMenuItem;
    if (target?.disabled) return;
    this.show(target);
  }

  private handleSubmenuAnchorPointerLeave = (e: PointerEvent) => {
    const related = e.relatedTarget as Element | null;
    if (related) {
      const target = this.target as Element | undefined;
      if (target?.contains(related) || this.contains(related)) return;
    }
    this.hide();
  }

  private handleSubmenuAnchorFocusIn = (e: FocusEvent) => {
    const target = e.currentTarget as UMenuItem;
    if (target?.disabled) return;
    this.show(target);
  }

  private handleSubmenuAnchorFocusOut = (e: FocusEvent) => {
    const related = e.relatedTarget as Element | null;
    if (related) {
      const target = this.target as Element | undefined;
      if (target?.contains(related) || this.contains(related)) return;
    }
    this.hide();
  }
  //#endregion
}