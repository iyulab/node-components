import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTreeItem, type TreeItemTrigger } from "../tree-item/UTreeItem.js";
import { styles } from "./UTree.styles.js";

/**
 * 계층형 데이터 구조를 표시하는 트리 컴포넌트입니다.
 *
 * @slot - 트리 아이템 (u-tree-item)
 *
 * @cssprop tree-indent-size - 트리 아이템의 들여쓰기 크기 (기본값: 14px)
 * @cssprop tree-indent-guide-offset - 들여쓰기 가이드 선의 좌측 간격 (기본값: 8px)
 * @cssprop tree-indent-guide-width - 들여쓰기 가이드 선의 두께 (기본값: 1px)
 * @cssprop tree-indent-guide-style - 들여쓰기 가이드 선의 스타일 (기본값: solid)
 * @cssprop tree-indent-guide-color - 들여쓰기 가이드 선의 색상 (기본값: var(--u-border-color-weak))
 * 
 * @event change - 선택된 아이템이 변경될 때 발생
 */
@customElement('u-tree')
export class UTree extends UElement {
  static styles = [ super.styles, styles ];

  /** 아이템 선택 가능 여부 */
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;
  /** 다중 선택 사용 여부 */
  @property({ type: Boolean, reflect: true, attribute: 'select-multiple' }) selectMultiple: boolean = false;
  /** 리프 노드만 선택 사용 여부 */
  @property({ type: Boolean, reflect: true, attribute: 'select-leaf' }) selectLeaf: boolean = false;
  /** 아이템 체크 가능 여부 */
  @property({ type: Boolean, reflect: true }) checkable: boolean = false;
  /** 체크박스 선택 시 하위 노드도 사용 여부 */
  @property({ type: Boolean, reflect: true, attribute: 'check-cascade' }) checkCascade: boolean = false;
  /** 트리 펼치기 트리거 방식 */
  @property({ type: String }) trigger: TreeItemTrigger = 'item';

  /** 드래그 앤드 드롭 지원 */
  @property({ type: Boolean, reflect: true }) draggable: boolean = false;
  @property({ type: Boolean, reflect: true }) droppable: boolean = false;

  @state() private expandIcon?: Node;
  @state() private collapseIcon?: Node;

  private anchor: UTreeItem | null = null;

  private _items: UTreeItem[] = [];
  public get items(): readonly UTreeItem[] {
    return this._items;
  }

  public get selectedItems(): UTreeItem[] {
    return this.getItems(item => item.selected);
  }

  public get checkedItems(): UTreeItem[] {
    return this.getItems(item => item.checked);
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tree');
    this.addEventListener('pick', this.handlePick);
    this.addEventListener('check', this.handleCheck);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('pick', this.handlePick);
    this.removeEventListener('check', this.handleCheck);
    this.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);

    if (['disabled','selectable','checkable','trigger','expandIcon','collapseIcon']
      .some(k => changedProperties.has(k))) {
      this.propagate();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>

      <div hidden aria-hidden="true">
        <slot name="expand-icon" @slotchange=${this.handleIconSlotChange}></slot>
        <slot name="collapse-icon" @slotchange=${this.handleIconSlotChange}></slot>
      </div>
    `;
  }

  public expandAll(): void {
    this.mapItems(item => { if (!item.leaf) item.expanded = true; });
  }

  public collapseAll(): void {
    this.mapItems(item => { item.expanded = false; });
  }

  public expand(value: string): void {
    this.getItem(value)?.expand();
  }

  public collapse(value: string): void {
    this.getItem(value)?.collapse();
  }

  public toggle(value: string): void {
    this.getItem(value)?.toggle();
  }

  public getItem(value: string): UTreeItem | undefined {
    let found: UTreeItem | undefined;
    const search = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        if (item.value === value) {
          found = item;
          return;
        }
        if (item.childItems.length > 0) search(item.childItems);
        if (found) return;
      }
    };
    search(this._items);
    return found;
  }

  public getItems(fn: (item: UTreeItem) => boolean): UTreeItem[] {
    const result: UTreeItem[] = [];
    const filter = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        if (fn(item)) result.push(item);
        if (item.childItems.length > 0) filter(item.childItems);
      }
    };
    filter(this._items);
    return result;
  }

  public mapItems(fn: (item: UTreeItem) => void): void {
    const map = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        fn(item);
        if (item.childItems.length > 0) map(item.childItems);
      }
    };
    map(this._items);
  }

  private propagate() {
    this._items.forEach(item => {
      item.selectable = this.selectable;
      item.checkable = this.checkable;
      item.trigger = this.trigger;
      item.expandIcon = this.expandIcon?.cloneNode(true);
      item.collapseIcon = this.collapseIcon?.cloneNode(true);
    });
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._items = slot.assignedElements({ flatten: true })
      .filter(el => el instanceof UTreeItem) as UTreeItem[];
    this.propagate();
  };

  private handleIconSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    if (slot.name === 'expand-icon') {
      this.expandIcon = nodes[0];
    } else if (slot.name === 'collapse-icon') {
      this.collapseIcon = nodes[0];
    }
  };

  private handlePick = (e: Event) => {
    if (!this.selectable) return;
    e.stopPropagation();

    const item = e.composedPath().find(el => el instanceof UTreeItem) as UTreeItem;
    if (!item) return;
    if (this.selectLeaf && !item.leaf) return;

    const detail = (e as CustomEvent).detail ?? {};
    const ctrlKey = detail.ctrlKey ?? false;
    const shiftKey = detail.shiftKey ?? false;

    if (this.selectMultiple && shiftKey && this.anchor) {
      this.selectRange(this.anchor, item);
    } else if (this.selectMultiple && ctrlKey) {
      item.selected = !item.selected;
      this.anchor = item;
    } else {
      this.mapItems(i => i.selected = false);
      item.selected = true;
      this.anchor = item;
    }

    this.dispatchEvent(new Event('change', { 
      bubbles: true,
      composed: true,
    }));
  };

  private selectRange(anchor: UTreeItem, target: UTreeItem): void {
    const visible = this.getItems(item => !item.disabled && (!item.parentItem || item.parentItem.expanded));
    const from = visible.indexOf(anchor);
    const to = visible.indexOf(target);
    if (from === -1 || to === -1) return;

    const [start, end] = from < to ? [from, to] : [to, from];
    this.mapItems(i => i.selected = false);
    for (let i = start; i <= end; i++) {
      if (!this.selectLeaf || visible[i].leaf) {
        visible[i].selected = true;
      }
    }
  }

  private handleCheck = (e: Event) => {
    if (!this.checkable) return;
    e.stopPropagation();

    const item = e.composedPath().find(el => el instanceof UTreeItem) as UTreeItem;
    if (!item) return;
    item.checked = !item.checked;
    item.indeterminate = false;

    if (this.checkCascade) {
      this.cascadeDown(item, item.checked);
      this.cascadeUp(item);
    }

    this.dispatchEvent(new Event('change', { 
      bubbles: true,
      composed: true,
    }));
  };

  private cascadeDown(item: UTreeItem, checked: boolean): void {
    for (const child of item.childItems) {
      child.checked = checked;
      child.indeterminate = false;
      this.cascadeDown(child, checked);
    }
  }

  private cascadeUp(item: UTreeItem): void {
    const parent = item.parentItem;
    if (!parent) return;

    const children = parent.childItems;
    const checkedCount = children.filter(c => c.checked).length;
    const hasIndeterminate = children.some(c => c.indeterminate);

    if (checkedCount === children.length) {
      parent.checked = true;
      parent.indeterminate = false;
    } else if (checkedCount === 0 && !hasIndeterminate) {
      parent.checked = false;
      parent.indeterminate = false;
    } else {
      parent.checked = false;
      parent.indeterminate = true;
    }

    this.cascadeUp(parent);
  }

  private handleKeydown = (e: KeyboardEvent) => {
    const focused = e.composedPath().find(el => el instanceof UTreeItem) as UTreeItem | undefined;
    if (!focused) return;
    const items = this.getItems(item => !item.disabled && (!item.parentItem || item.parentItem.expanded));
    if (items.length === 0) return;
    const current = focused ? items.indexOf(focused) : -1;
    if (current === -1) return;

    switch (e.key) {
      case 'ArrowDown': {
        e.preventDefault();
        const next = current < items.length - 1 ? items[current + 1] : items[0];
        if (this.selectMultiple && e.shiftKey && this.selectable) {
          if (!this.anchor) this.anchor = focused;
          this.selectRange(this.anchor, next);
        }
        next.focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prev = current > 0 ? items[current - 1] : items[items.length - 1];
        if (this.selectMultiple && e.shiftKey && this.selectable) {
          if (!this.anchor) this.anchor = focused;
          this.selectRange(this.anchor, prev);
        }
        prev.focus();
        break;
      }
      case 'ArrowRight':
        e.preventDefault();
        if (!focused.leaf) {
          if (!focused.expanded) {
            focused.expand();
          } else {
            const first = focused.childItems[0];
            if (first && !first.disabled) first.focus();
          }
        }
        break;
      case 'ArrowLeft':
        e.preventDefault();
        if (focused.expanded && !focused.leaf) focused.collapse();
        else if (focused.parentItem) focused.parentItem.focus();
        break;
      case 'Home':
        e.preventDefault();
        items[0]?.focus();
        break;
      case 'End':
        e.preventDefault();
        items[items.length - 1]?.focus();
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        const header = focused.shadowRoot?.querySelector(".header");
        if (header) (header as HTMLElement).click();
        break;
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tree': UTree;
  }
}
