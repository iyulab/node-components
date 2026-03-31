import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UMenuItem, type MenuItemIndicator, type MenuItemAlign } from "../menu-item/UMenuItem.js";
import { styles } from "./UMenu.styles.js";

export type MenuSelection = 'none' | 'single' | 'multiple';

/**
 * 메뉴 아이템의 선택, 키보드 탐색, 속성 전파를 관리하는 메뉴 컴포넌트입니다.
 *
 * @slot - 메뉴 아이템 (u-menu-item, u-divider)
 *
 * @cssprop --menu-indent-size - 하위 메뉴 아이템의 들여쓰기 크기 (기본값: 20px)
 * 
 * @event change - 선택된 아이템이 변경될 때 발생
 */
@customElement('u-menu')
export class UMenu extends UElement {
  static styles = [ super.styles, styles ];

  /** 테두리 없는 여부 */
  @property({ type: Boolean, reflect: true }) borderless: boolean = false;
  /** 선택 모드 */
  @property({ type: String, reflect: true }) selection: MenuSelection = 'none';
  /** 키보드 탐색 시 순환 여부 */
  @property({ type: Boolean, reflect: true }) loop: boolean = false;
  /** 아이템의 인라인(가로) 모드 여부 */
  @property({ type: Boolean, reflect: true }) inline: boolean = false;
  /** 선택된 아이템 표시 방식 */
  @property({ type: String, reflect: true }) indicator: MenuItemIndicator = 'highlight';
  /** 아이템 텍스트 정렬 방식 */
  @property({ type: String, reflect: true }) align: MenuItemAlign = 'left';

  private _items: UMenuItem[] = [];
  public get items(): readonly UMenuItem[] {
    return this._items;
  }

  public get selectedItems(): UMenuItem[] {
    return this.getItems(item => item.selected);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menu');
    this.addEventListener('pick', this.handlePick);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('pick', this.handlePick);
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

  public mapItems(fn: (item: UMenuItem) => void): void {
    const map = (items: readonly UMenuItem[]) => {
      for (const item of items) {
        fn(item);
        if (item.childItems.length > 0) map(item.childItems);
      }
    };
    map(this.items);
  }

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

  private handlePick = (e: Event) => {
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
    
    this.dispatchEvent(new Event('change', { 
      bubbles: true, 
      composed: true 
    }));
  };

  private handleKeydown = (e: KeyboardEvent) => {
    const focused = e.composedPath().find(el => el instanceof UMenuItem) as UMenuItem | undefined;
    if (!focused) return;

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

declare global {
  interface HTMLElementTagNameMap {
    'u-menu': UMenu;
  }
}
