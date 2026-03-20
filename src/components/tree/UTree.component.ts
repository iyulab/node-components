import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UTreeItem, type TreeItemTrigger } from "../tree-item/UTreeItem.component.js";
import { styles } from "./UTree.styles.js";

/**
 * Tree 컴포넌트는 계층적 데이터 구조를 표시하는 트리 뷰를 제공합니다.
 * u-tree-item을 자식으로 사용하여 중첩된 구조를 구성할 수 있습니다.
 *
 * @slot - 트리 아이템 (u-tree-item)
 */
export class UTree extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;
  @property({ type: Boolean, reflect: true, attribute: 'select-multiple' }) selectMultiple: boolean = false;
  @property({ type: Boolean, reflect: true, attribute: 'select-leaf-only' }) selectLeafOnly: boolean = false;
  @property({ type: Boolean, reflect: true }) checkable: boolean = false;
  @property({ type: Boolean, reflect: true, attribute: 'check-cascade' }) checkCascade: boolean = false;
  @property({ type: Boolean, reflect: true }) override draggable: boolean = false;
  @property({ type: Boolean, reflect: true }) droppable: boolean = false;
  @property({ type: String }) trigger: TreeItemTrigger = 'item';

  @state() private expandIcon?: HTMLElement;
  @state() private collapseIcon?: HTMLElement;

  private selectedItems: Set<UTreeItem> = new Set();
  private checkedItems: Set<UTreeItem> = new Set();

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tree');
    this.addEventListener('u-select', this.handleSelect);
    this.addEventListener('u-check', this.handleCheck);
    this.addEventListener('u-drop', this.handleDrop);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleSelect);
    this.removeEventListener('u-check', this.handleCheck);
    this.removeEventListener('u-drop', this.handleDrop);
    this.removeEventListener('keydown', this.handleKeydown);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    this.propagate();
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>

      <div hidden>
        <slot name="expand-icon" @slotchange=${this.handleIconSlotChange}></slot>
        <slot name="collapse-icon" @slotchange=${this.handleIconSlotChange}></slot>
      </div>
    `;
  }

  /** 모든 노드 펼치기 */
  public expandAll(): void {
    this.mapItems(item => { if (!item.leaf) item.expanded = true; });
  }

  /** 모든 노드 접기 */
  public collapseAll(): void {
    this.mapItems(item => { item.expanded = false; });
  }

  /** 특정 값의 노드 펼치기 */
  public expand(value: string): void {
    this.findItem(value)?.expand();
  }

  /** 특정 값의 노드 접기 */
  public collapse(value: string): void {
    this.findItem(value)?.collapse();
  }

  /** 특정 값의 노드 토글 */
  public toggle(value: string): void {
    this.findItem(value)?.toggle();
  }

  /** 루트 아이템에만 속성 전파 (자식 cascade는 UTreeItem.updated에서 처리) */
  private propagate() {
    for (const item of this.getTreeItems()) {
      item.selectable = this.selectable;
      item.checkable = this.checkable;
      item.trigger = this.trigger;
      item.draggable = this.draggable;
      item.droppable = this.droppable;
      item.expandIcon = this.expandIcon;
      item.collapseIcon = this.collapseIcon;
    }
  }

  private handleSlotChange = () => {
    this.propagate();
  };

  private handleIconSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    if (slot.name === 'expand-icon') {
      this.expandIcon = elements[0] as HTMLElement | undefined;
    } else if (slot.name === 'collapse-icon') {
      this.collapseIcon = elements[0] as HTMLElement | undefined;
    }
  };

  private handleSelect = (e: Event) => {
    if (!this.selectable) return;
    e.stopPropagation();

    const item = this.findEventItem(e);
    if (!item) return;
    if (this.selectLeafOnly && !item.leaf) return;

    const ctrlKey = (e as CustomEvent).detail?.ctrlKey ?? false;

    if (this.selectMultiple && ctrlKey) {
      item.selected = !item.selected;
      if (item.selected) this.selectedItems.add(item);
      else this.selectedItems.delete(item);
    } else {
      this.selectedItems.forEach(s => { if (s !== item) s.selected = false; });
      this.selectedItems.clear();
      item.selected = true;
      this.selectedItems.add(item);
    }

    this.emit('u-select', {
      value: item.value,
      selected: Array.from(this.selectedItems).map(i => i.value),
    });
  };

  private handleCheck = (e: Event) => {
    if (!this.checkable) return;
    e.stopPropagation();

    const item = this.findEventItem(e);
    if (!item) return;

    if (item.checked) this.checkedItems.add(item);
    else this.checkedItems.delete(item);

    if (this.checkCascade) {
      this.cascadeDown(item, item.checked);
      this.cascadeUp(item);
    }

    this.emit('u-check', {
      value: item.value,
      checked: item.checked,
      checkedValues: Array.from(this.checkedItems).map(i => i.value),
    });
  };

  private cascadeDown(item: UTreeItem, checked: boolean): void {
    for (const child of item.childItems) {
      child.checked = checked;
      child.indeterminate = false;
      if (checked) this.checkedItems.add(child);
      else this.checkedItems.delete(child);
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
      this.checkedItems.add(parent);
    } else if (checkedCount === 0 && !hasIndeterminate) {
      parent.checked = false;
      parent.indeterminate = false;
      this.checkedItems.delete(parent);
    } else {
      parent.checked = false;
      parent.indeterminate = true;
      this.checkedItems.delete(parent);
    }

    this.cascadeUp(parent);
  }

  private handleDrop = (e: Event) => {
    e.stopPropagation();
    this.emit('u-drop', (e as CustomEvent).detail);
  };

  private handleKeydown = (e: KeyboardEvent) => {
    const focused = e.composedPath().find(el => el instanceof UTreeItem) as UTreeItem | undefined;
    const items = this.getFlatFocusableItems();
    if (items.length === 0) return;

    const current = focused ? items.indexOf(focused) : -1;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        if (current < items.length - 1) items[current + 1].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        if (current > 0) items[current - 1].focus();
        break;
      case 'ArrowRight':
        e.preventDefault();
        if (focused && !focused.leaf) {
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
        if (focused) {
          if (focused.expanded && !focused.leaf) focused.collapse();
          else if (focused.parentItem) focused.parentItem.focus();
        }
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
        focused?.dispatchEvent(new MouseEvent('click', { bubbles: true, composed: true }));
        break;
    }
  };

  private getFlatFocusableItems(): UTreeItem[] {
    const result: UTreeItem[] = [];
    const collect = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        if (item.disabled) continue;
        result.push(item);
        if (item.expanded && item.childItems.length > 0) collect(item.childItems);
      }
    };
    collect(this.getTreeItems());
    return result;
  }

  private getTreeItems(): UTreeItem[] {
    return Array.from(this.querySelectorAll<UTreeItem>(':scope > u-tree-item'));
  }

  private mapItems(fn: (item: UTreeItem) => void): void {
    const map = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        fn(item);
        if (item.childItems.length > 0) map(item.childItems);
      }
    };
    map(this.getTreeItems());
  }

  private findItem(value: string): UTreeItem | undefined {
    let found: UTreeItem | undefined;
    this.mapItems(item => { if (item.value === value) found = item; });
    return found;
  }

  private findEventItem(e: Event): UTreeItem | undefined {
    return e.composedPath().find(el => el instanceof UTreeItem) as UTreeItem | undefined;
  }
}
