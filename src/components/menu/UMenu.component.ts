import { html } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UMenuItem, type MenuItemIndicator, type MenuItemAlign } from "../menu-item/UMenuItem.component.js";
import { styles } from "./UMenu.styles.js";

/** 선택 모드 */
export type MenuSelection = 'none' | 'single' | 'multiple';

/**
 * Menu 컴포넌트는 메뉴 아이템의 선택, 키보드 탐색, 속성 전파를 관리합니다.
 * 단독으로 사용하면 트리형 인라인 메뉴, u-popover 내부에서도 사용됩니다.
 *
 * @slot - 메뉴 아이템 (u-menu-item, u-divider)
 */
export class UMenu extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 선택 모드 */
  @property({ type: String, reflect: true }) selection: MenuSelection = 'none';
  /** 선택된 아이템 표시 방식 */
  @property({ type: String, reflect: true }) indicator: MenuItemIndicator = 'highlight';
  /** 아이템 텍스트 정렬 방식 */
  @property({ type: String, reflect: true }) align: MenuItemAlign = 'left';
  /** 키보드 탐색 시 재순환 여부 */
  @property({ type: Boolean, reflect: true }) loop: boolean = false;
  /** 아이템의 인라인(트리) 모드 여부. false면 플로팅 서브메뉴 모드. */
  @property({ type: Boolean }) inline: boolean = true;

  private _items: UMenuItem[] = [];
  
  /** 메뉴 아이템 목록 (UMenuItem 요소만 포함) */
  public get items(): readonly UMenuItem[] {
    return this._items;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menu');
    this.addEventListener('u-select', this.handleSelect);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleSelect);
    this.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  /** 아이템에 속성을 재전파 (외부 slot 구성 변경 시 호출) */
  public propagate(): void {
    for (const item of this.items) {
      item.indicator = this.indicator;
      item.align = this.align;
      item.inline = this.inline;
    }
  }

  /** 모든 메뉴를 재귀적으로 닫기 */
  public collapseAll(): void {
    for (const item of this.items) {
      item.expanded = false;
    }
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._items = slot.assignedNodes({ flatten: true })
      .filter(n => n instanceof UMenuItem) as UMenuItem[];
    this.propagate();
  };

  private handleSelect = (e: Event) => {
    const item = e.target as UMenuItem;

    if (this.selection === 'single') {
      this.items.forEach(i => i.selected = false);
      item.selected = true;
    } else if (this.selection === 'multiple') {
      item.selected = !item.selected;
    } else {
      item.selected = false;
    }
  };

  /** 포커스된 아이템의 레벨에 맞는 형제 목록 */
  private getSiblingItems(focused: UMenuItem | undefined): UMenuItem[] {
    if (focused?.parentItem) {
      return [...focused.parentItem.childItems].filter(i => !i.disabled);
    }
    return this.items.filter(i => !i.disabled);
  }

  /** 재귀적으로 펼쳐진 아이템 포함하여 수집 */
  private getExpandedInlineItems(): UMenuItem[] {
    const result: UMenuItem[] = [];
    const collect = (items: readonly UMenuItem[]) => {
      for (const item of items) {
        if (item.disabled) continue;
        result.push(item);
        if (item.expanded && item.childItems.length > 0) {
          collect(item.childItems);
        }
      }
    };
    collect(this.items);
    return result;
  }

  private handleKeydown = (e: KeyboardEvent) => {
    const focused = e.composedPath().find(el => el instanceof UMenuItem) as UMenuItem | undefined;

    // inline 모드: 전체 플랫 리스트에서 탐색
    // floating 모드: 현재 레벨의 형제에서 탐색
    const items = this.inline
      ? this.getExpandedInlineItems()
      : this.getSiblingItems(focused);
    if (items.length === 0) return;

    const current = focused ? items.indexOf(focused) : -1;

    let next: number | undefined;
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        next = current < items.length - 1 ? current + 1 : (this.loop ? 0 : undefined);
        break;
      case 'ArrowUp':
        e.preventDefault();
        next = current > 0 ? current - 1 : (this.loop ? items.length - 1 : undefined);
        break;
      case 'Home':
        e.preventDefault();
        next = 0;
        break;
      case 'End':
        e.preventDefault();
        next = items.length - 1;
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        e.stopPropagation();
        focused?.headerEl?.click();
        return;
      case 'ArrowRight':
        if (focused?.nested) {
          e.preventDefault();
          e.stopPropagation();
          focused.expanded = true;
          const firstChild = focused.childItems.find(c => !c.disabled);
          firstChild?.focus();
        }
        return;
      case 'ArrowLeft':
        e.preventDefault();
        e.stopPropagation();
        if (focused?.nested && focused.expanded) {
          focused.expanded = false;
        } else if (focused?.parentItem) {
          focused.parentItem.expanded = false;
          focused.parentItem.focus();
        }
        return;
    }

    if (next !== undefined) items[next].focus();
  };
}
