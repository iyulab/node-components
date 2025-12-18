import { html, PropertyValues } from "lit";
import { property, query, queryAssignedElements, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { styles } from "./UTreeItem.styles.js";

/**
 * TreeItem 컴포넌트는 트리의 개별 노드를 나타냅니다.
 * u-tree 컴포넌트와 함께 사용되며, 중첩된 구조를 지원합니다.
 */
export class UTreeItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon': UIcon,
  };

  @query('.header')
  headerEl!: HTMLElement;
  @queryAssignedElements({ slot: 'children', selector: 'u-tree-item', flatten: true })
  childrenItems!: UTreeItem[];

  /** 트리 항목이 리프 노드인지 여부입니다. */
  @state() leaf: boolean = true;
    /** 트리 항목의 들여쓰기 레벨입니다. */
  @state() level: number = 0;

  /** 트리 항목이 비활성화 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 트리 항목이 선택된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 트리 항목이 확장된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  /** 트리 항목의 값입니다. */
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }
    if (changedProperties.has('expanded')) {
      this.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    }
    if (changedProperties.has('selected')) {
      this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
    }
    if (changedProperties.has('level')) {
      this.setAttribute('aria-level', String(this.level + 1));
      this.headerEl.style.paddingLeft = `calc(${this.level} * var(--indent-size, 20px))`;
    }
  }

  render() {
    return html`
      <div class="header" @click=${this.handleHeaderClick}>
        <u-icon class="expand-icon"
          ?hidden=${this.leaf}
          name=${this.expanded ? 'chevron-down' : 'chevron-right'}
        ></u-icon>
        <slot name="prefix"></slot>
        <slot @slotchange=${this.handleSlotChange}></slot>
        <slot name="suffix"></slot>
      </div>
      <div class="children" ?hidden=${!this.expanded}>
        <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
      </div>
    `;
  }

  /** 슬롯 변경 시 헤더용 노드와 자식 노드 분리 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    
    // TreeItem 자식들을 children-slot으로 재할당
    nodes.forEach(node => {
      if (node instanceof UTreeItem) {
        (node as HTMLElement).setAttribute('slot', 'children');
      }
    });
  }

  /** 자식 슬롯 변경 시 자식 노드 재설정 */
  private handleChildrenSlotChange = () => {
    // 현재 노드의 말단 여부 확인
    this.leaf = this.childrenItems.length === 0;
    // 자식 노드의 레벨 설정
    this.childrenItems.forEach(child => {
      child.level = this.level + 1;
    });
  }

  /** 헤더 클릭 이벤트를 처리합니다. */
  private handleHeaderClick = (e: MouseEvent) => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    if (this.leaf) {
      this.selected = true;
      this.emit('u-select', { value: this.value, item: this });
    } else {
      this.expanded = !this.expanded;
      this.emit('u-toggle', { expanded: this.expanded, item: this });
    }
  }
}
