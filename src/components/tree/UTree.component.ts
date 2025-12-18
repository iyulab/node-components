import { html } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { UTreeItem } from "../tree-item/UTreeItem.component.js";
import { styles } from "./UTree.styles.js";

/**
 * Tree 컴포넌트는 계층적 데이터 구조를 표시하는 트리 뷰를 제공합니다.
 * u-tree-item 컴포넌트를 자식으로 사용하여 중첩된 구조를 구성할 수 있습니다.
 */
export class UTree extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-tree-item': UTreeItem,
  };

  private selectedItems: Set<UTreeItem> = new Set();

  @queryAssignedElements({ selector: 'u-tree-item' })
  treeItems!: UTreeItem[];

  /** 트리가 비활성화 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 다중 선택을 허용할지 여부입니다. */
  @property({ type: Boolean }) multiple: boolean = false;
  /** 선택 가능한 트리인지 여부입니다. */
  @property({ type: Boolean }) selectable: boolean = true;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'tree');
    this.addEventListener('u-select', this.handleItemSelect as EventListener);
    this.addEventListener('u-toggle', this.handleItemToggle as EventListener);
  }

  disconnectedCallback(): void {
    super.disconnectedCallback();
    this.removeEventListener('u-select', this.handleItemSelect as EventListener);
    this.removeEventListener('u-toggle', this.handleItemToggle as EventListener);
  }

  render() {
    return html`
      <div class="container">
        <slot></slot>
      </div>
    `;
  }

  /** 트리 항목 선택 이벤트를 처리합니다. */
  private handleItemSelect = (e: CustomEvent) => {
    if (!this.selectable || this.disabled) {
      e.stopPropagation();
      return;
    }

    const item = e.detail.item as UTreeItem;
    
    if (!this.multiple) {
      // 단일 선택 모드: 다른 모든 항목 선택 해제
      this.selectedItems.forEach((selectedItem) => {
        if (selectedItem !== item) {
          selectedItem.selected = false;
        }
      });
      this.selectedItems.clear();
    }

    if (item.selected) {
      this.selectedItems.add(item);
    } else {
      this.selectedItems.delete(item);
    }

    this.emit('u-tree-select', { 
      value: item.value,
      item: item,
      selectedItems: Array.from(this.selectedItems)
    });
  }

  /** 트리 항목 확장/축소 이벤트를 처리합니다. */
  private handleItemToggle = (e: CustomEvent) => {
    if (this.disabled) {
      e.stopPropagation();
      return;
    }

    const item = e.detail.item as UTreeItem;
    this.emit('u-tree-toggle', { 
      expanded: item.expanded,
      item: item
    });
  }

  /**
   * 선택된 모든 항목을 반환합니다.
   */
  public getSelectedItems(): UTreeItem[] {
    return Array.from(this.selectedItems);
  }

  /**
   * 모든 선택을 해제합니다.
   */
  public clearSelection() {
    this.selectedItems.forEach((item) => {
      item.selected = false;
    });
    this.selectedItems.clear();
  }

  /**
   * 재귀적으로 모든 TreeItem을 가져옵니다.
   */
  private getAllTreeItems(items: Element[] = this.treeItems): UTreeItem[] {
    let allItems: UTreeItem[] = [];
    
    items.forEach((item) => {
      if (item instanceof UTreeItem) {
        allItems.push(item);
        const childItems = this.getAllTreeItems(item.childrenItems);
        allItems = allItems.concat(childItems);
      }
    });
    
    return allItems;
  }
}
