import { html, PropertyValues } from "lit";
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

  /** 테두리 없는 스타일 여부 */
  @property({ type: Boolean, reflect: true }) borderless: boolean = false;
  /** 선택 모드 */
  @property({ type: String, reflect: true }) selection: MenuSelection = 'none';
  /** 키보드 탐색 시 재순환 여부 */
  @property({ type: Boolean, reflect: true }) loop: boolean = false;
  /** 아이템의 인라인(트리) 모드 여부 */
  @property({ type: Boolean, reflect: true }) inline: boolean = false;
  /** 선택된 아이템 표시 방식 */
  @property({ type: String, reflect: true }) indicator: MenuItemIndicator = 'highlight';
  /** 아이템 텍스트 정렬 방식 */
  @property({ type: String, reflect: true }) align: MenuItemAlign = 'left';

  /** 메뉴 아이템 목록 (UMenuItem 요소만 포함) */
  private _items: UMenuItem[] = [];
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

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['indicator', 'align', 'inline'].some(k => changedProperties.has(k))) {
      this.propagate();
    }
  }

  render() {
    return html`<slot @slotchange=${this.handleSlotChange}></slot>`;
  }

  /** 특정 조건에 맞는 아이템들 반환 */
  public getItems(fn: (item: UMenuItem) => boolean): UMenuItem[] {
    const result: UMenuItem[] = [];
    const filter = (items: readonly UMenuItem[]) => {
      for (const item of items) {
        if (fn(item)) result.push(item);
        if (item.childItems.length > 0) filter(item.childItems);
      }
    };
    filter(this.items);
    return result;
  }

  /** 모든 아이템에 함수 적용 */
  public mapItems(fn: (item: UMenuItem) => void): void {
    const map = (items: readonly UMenuItem[]) => {
      for (const item of items) {
        fn(item);
        if (item.childItems.length > 0) map(item.childItems);
      }
    };
    map(this.items);
  }

  /** 직계 자식 아이템에 속성 전파 */
  private propagate(): void {
    this._items.forEach(item => {
      item.inline = this.inline;
      item.indicator = this.indicator;
      item.align = this.align;
    });
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._items = slot.assignedElements({ flatten: true })
      .filter((el): el is UMenuItem => el instanceof UMenuItem);
    this.propagate();
  };

  private handleSelect = (e: Event) => {
    if (this.selection === 'none') return;
    e.stopPropagation();

    const item = e.composedPath().find(el => el instanceof UMenuItem) as UMenuItem;
    if (!item) return;

    if (this.selection === 'single') {
      this.mapItems(i => i.selected = false);
      item.selected = true;
    } else if (this.selection === 'multiple') {
      item.selected = !item.selected;
    }

    this.emit('u-select');
  };

  private handleKeydown = (e: KeyboardEvent) => {
    const focused = e.composedPath().find(el => el instanceof UMenuItem) as UMenuItem | undefined;
    if (!focused) return;

    // inline 모드: 펼쳐져 보여지는 전체 항목에서 탐색
    // floating 모드: 현재 레벨의 형제에서 탐색
    const items = this.inline
      ? this.getItems(item => {
        if (item.disabled) return false;
        let current = item.parentItem;
        while (current) {
          if (!current.expanded) return false;
          current = current.parentItem;
        }
        return true;
      })
      : this.getItems(item => {
        if (item.disabled) return false;
        if (focused?.parentItem) return item.parentItem === focused.parentItem;
        return item.parentItem === null;
      });
    if (items.length === 0) return;

    const current = items.indexOf(focused);
    if (current === -1) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = current < items.length - 1 ? items[current + 1] : (this.loop ? items[0] : undefined);
        next?.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = current > 0 ? items[current - 1] : (this.loop ? items[items.length - 1] : undefined);
        prev?.focus();
        break;
      }
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ': {
        e.preventDefault();
        e.stopPropagation();
        const header = focused.shadowRoot?.querySelector('.header');
        if (header) (header as HTMLElement).click();
        break;
      }
      case 'ArrowRight':
        e.preventDefault();
        if (!focused.leaf) {
          if (!focused.expanded) {
            focused.expanded = true;
          } else {
            const firstChild = focused.childItems.find(c => !c.disabled);
            firstChild?.focus();
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (!focused.leaf && focused.expanded) {
          focused.expanded = false;
        } else if (focused.parentItem) {
          focused.parentItem.focus();
        }
        break;
    }
  };
}
