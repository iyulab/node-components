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

  /** 아이템 선택 가능 여부 */
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;
  /** 다중 선택 허용 여부 (Ctrl/Cmd 키와 함께) */
  @property({ type: Boolean, reflect: true, attribute: 'select-multiple' }) selectMultiple: boolean = false;
  /** 리프 노드만 선택 허용 여부 */
  @property({ type: Boolean, reflect: true, attribute: 'select-leaf' }) selectLeaf: boolean = false;
  /** 아이템 체크 가능 여부(체크박스 표시) */
  @property({ type: Boolean, reflect: true }) checkable: boolean = false;
  /** 체크박스 선택 시 자식 노드에도 동일하게 적용 여부 */
  @property({ type: Boolean, reflect: true, attribute: 'check-cascade' }) checkCascade: boolean = false;
  /** 트리 토글 트리거 방식 (item: 아이템 클릭 시, icon: 토글 아이콘 클릭 시) */
  @property({ type: String }) trigger: TreeItemTrigger = 'item';

  /** 드래그 앤 드롭 지원 (추후 구현) */
  @property({ type: Boolean, reflect: true }) draggable: boolean = false;
  @property({ type: Boolean, reflect: true }) droppable: boolean = false;

  @state() private items: UTreeItem[] = [];
  @state() private expandIcon?: Node;
  @state() private collapseIcon?: Node;

  /** Shift 범위 선택의 기준점 */
  private anchor: UTreeItem | null = null;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tree');
    this.addEventListener('u-select', this.handleSelect);
    this.addEventListener('u-check', this.handleCheck);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleSelect);
    this.removeEventListener('u-check', this.handleCheck);
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
    this.getItem(value)?.expand();
  }

  /** 특정 값의 노드 접기 */
  public collapse(value: string): void {
    this.getItem(value)?.collapse();
  }

  /** 특정 값의 노드 토글 */
  public toggle(value: string): void {
    this.getItem(value)?.toggle();
  }

  /** 특정 값의 노드 반환 */
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
    search(this.items);
    return found;
  }

  /** 특정 조건에 맞는 노드들 반환 */
  public getItems(fn: (item: UTreeItem) => boolean): UTreeItem[] {
    const result: UTreeItem[] = [];
    const filter = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        if (fn(item)) result.push(item);
        if (item.childItems.length > 0) filter(item.childItems);
      }
    };
    filter(this.items);
    return result;
  }

  /** 모든 아이템에 함수 적용 */
  public mapItems(fn: (item: UTreeItem) => void): void {
    const map = (items: readonly UTreeItem[]) => {
      for (const item of items) {
        fn(item);
        if (item.childItems.length > 0) map(item.childItems);
      }
    };
    map(this.items);
  }

  /** 자식 아이템에 속성 전파 */
  private propagate() {
    this.items.forEach(item => {
      item.selectable = this.selectable;
      item.checkable = this.checkable;
      item.trigger = this.trigger;
      item.expandIcon = this.expandIcon?.cloneNode(true);
      item.collapseIcon = this.collapseIcon?.cloneNode(true);
    });
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.items = slot.assignedElements({ flatten: true })
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

  private handleSelect = (e: Event) => {
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

    this.emit('u-select');
  };

  /** 앵커에서 타겟까지 범위 선택 */
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

    this.emit('u-check');
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
