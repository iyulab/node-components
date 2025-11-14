import { html, nothing, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { styles } from "./TreeItem.styles.js";

/**
 * TreeItem 컴포넌트는 트리의 개별 노드를 나타냅니다.
 * u-tree 컴포넌트와 함께 사용되며, 중첩된 구조를 지원합니다.
 */
export class TreeItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 트리 항목이 비활성화 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 트리 항목이 선택된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 트리 항목이 확장된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  /** 트리 항목이 리프 노드인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) leaf: boolean = false;
  /** 트리 항목의 들여쓰기 레벨입니다. */
  @property({ type: Number, reflect: true }) level: number = 0;
  /** 트리 항목의 값입니다. */
  @property({ type: String }) value: string = '';
  /** 트리 항목의 아이콘입니다. */
  @property({ type: String }) icon: string = '';

  @state() private hasChildren: boolean = false;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this.checkForChildren();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }

    if (changedProperties.has('expanded')) {
      this.setAttribute('aria-expanded', this.hasChildren ? String(this.expanded) : 'false');
    }

    if (changedProperties.has('selected')) {
      this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
    }
  }

  render() {
    return html`
      <div class="header" @click=${this.handleHeaderClick} style="padding-left: calc(${this.level} * 20px)">
        ${this.renderExpandIcon()}
        ${this.renderIcon()}
        <span class="label">
          <slot name="label"></slot>
          <slot></slot>
        </span>
      </div>
      <div class="children" ?hidden=${!this.expanded}>
        <slot name="children" @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  /** 확장/축소 아이콘을 렌더링합니다. */
  private renderExpandIcon() {
    if (this.leaf || !this.hasChildren) {
      return html`<span class="expand-icon placeholder"></span>`;
    }

    return html`
      <span class="expand-icon" @click=${this.handleExpandClick}>
        ${this.expanded ? '▼' : '▶'}
      </span>
    `;
  }

  /** 커스텀 아이콘을 렌더링합니다. */
  private renderIcon() {
    if (!this.icon) {
      return nothing;
    }

    return html`<span class="icon">${this.icon}</span>`;
  }

  /** 헤더 클릭 이벤트를 처리합니다. */
  private handleHeaderClick = (e: MouseEvent) => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    this.selected = true;
    this.emit('u-select', { value: this.value, item: this });
  }

  /** 확장/축소 아이콘 클릭 이벤트를 처리합니다. */
  private handleExpandClick = (e: MouseEvent) => {
    e.stopPropagation();
    
    if (this.disabled || this.leaf || !this.hasChildren) {
      return;
    }

    this.expanded = !this.expanded;
    this.emit('u-toggle', { expanded: this.expanded, item: this });
  }

  /** 슬롯 변경 시 자식 노드 확인 */
  private handleSlotChange = () => {
    this.checkForChildren();
  }

  /** 자식 노드가 있는지 확인합니다. */
  private checkForChildren() {
    const childrenSlot = this.shadowRoot?.querySelector('slot[name="children"]') as HTMLSlotElement;
    const children = childrenSlot?.assignedElements() || [];
    this.hasChildren = children.length > 0;
    this.setAttribute('aria-expanded', this.hasChildren ? String(this.expanded) : 'false');
  }

  /**
   * 트리 항목을 확장합니다.
   */
  public expand() {
    if (!this.leaf && this.hasChildren) {
      this.expanded = true;
    }
  }

  /**
   * 트리 항목을 축소합니다.
   */
  public collapse() {
    this.expanded = false;
  }

  /**
   * 트리 항목의 확장 상태를 토글합니다.
   */
  public toggle() {
    if (!this.leaf && this.hasChildren) {
      this.expanded = !this.expanded;
    }
  }
}
