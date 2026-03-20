import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { USpinner } from "../spinner/USpinner.component.js";
import { styles } from "./UTreeItem.styles.js";

/** 트리 토글 트리거 방식 */
export type TreeItemTrigger = 'item' | 'icon';

/**
 * TreeItem 컴포넌트는 트리 내부의 개별 노드를 나타냅니다.
 *
 * @slot - 기본 슬롯 (라벨 텍스트, 자식 tree-item은 자동으로 children 슬롯으로 재배정)
 * @slot prefix - 라벨 앞에 표시되는 아이콘 등
 * @slot suffix - 라벨 뒤에 표시되는 추가 콘텐츠
 * @slot children - 하위 트리 아이템
 * @slot expand-icon - 펼침/접힘 아이콘 커스텀
 */
export class UTreeItem extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
    'u-spinner': USpinner,
  };

  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;
  @property({ type: Boolean, reflect: true }) checkable: boolean = false;
  @property({ type: Boolean, reflect: true }) override draggable: boolean = false;
  @property({ type: Boolean, reflect: true }) droppable: boolean = false;
  @property({ type: Boolean, reflect: true }) lazy: boolean = false;
  @property({ type: String, reflect: true }) trigger: TreeItemTrigger = 'item';
  @property({ type: String }) value: string = '';

  @state() loading: boolean = false;
  @state() leaf: boolean = true;
  @state() selected: boolean = false;
  @state() checked: boolean = false;
  @state() indeterminate: boolean = false;
  @state() depth: number = 0;
  @state() expandIcon?: HTMLElement;
  @state() collapseIcon?: HTMLElement;

  private loaded: boolean = false;
  private dragTimer?: number;

  /** 부모 트리 아이템 (부모에서 설정) */
  private _parentItem: UTreeItem | null = null;
  public get parentItem(): UTreeItem | null {
    return this._parentItem;
  }

  /** 자식 트리 아이템 배열 */
  private _childItems: UTreeItem[] = [];
  public get childItems(): readonly UTreeItem[] {
    return this._childItems;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    if (this.parentElement instanceof UTreeItem) {
      this._parentItem = this.parentElement;
    }
  }

  disconnectedCallback(): void {
    clearTimeout(this.dragTimer);
    super.disconnectedCallback();
  }

  /** 전파 대상 속성 목록 */
  private static readonly PROPAGATED_PROPS = [
    'depth', 'selectable', 'checkable', 'trigger',
    'draggable', 'droppable', 'expandIcon', 'collapseIcon',
  ] as const;

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    }
    if (changedProperties.has('leaf')) {
      this.toggleAttribute('leaf', this.leaf);
    }
    if (changedProperties.has('depth')) {
      this.style.setProperty('--tree-item-depth', String(this.depth));
    }

    // 전파 속성 변경 시 자식에 cascade
    if (UTreeItem.PROPAGATED_PROPS.some(p => changedProperties.has(p))) {
      this.propagateToChildren();
    }
  }

  render() {
    return html`
      <div class="header"
        ?selected=${this.selected}
        draggable=${this.draggable ? 'true' : 'false'}  
        @click=${this.handleHeaderClick}
        @dragstart=${this.handleHeaderDragStart}
        @dragend=${this.handleHeaderDragEnd}
        @dragover=${this.handleHeaderDragOver}
        @dragleave=${this.handleHeaderDragLeave}
        @drop=${this.handleHeaderDrop}>

        <span class="toggle-icon" ?hidden=${this.leaf}
          @click=${this.handleToggleClick}>
          ${this.loading 
            ? html`<u-spinner></u-spinner>` 
            : this.expanded
            ? this.expandIcon || html`<u-icon lib="internal" name="chevron-down"></u-icon>`
            : this.collapseIcon || html`<u-icon lib="internal" name="chevron-right"></u-icon>`}
        </span>

        <span class="checkbox"
          ?hidden=${!this.checkable}  
          ?checked=${this.checked}
          ?indeterminate=${this.indeterminate}
          @click=${this.handleCheckboxClick}>
          <u-icon lib="internal"
            name=${this.indeterminate ? 'dash-lg' : 'check-lg'}
          ></u-icon>
        </span>

        <slot name="prefix"></slot>
        <slot @slotchange=${this.handleSlotChange}></slot>
        <slot name="suffix"></slot>
      </div>

      <div class="children" ?hidden=${!this.expanded || this.leaf}>
        <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
      </div>
    `;
  }

  /** 노드 펼치기 */
  public async expand(): Promise<void> {
    if (this.disabled || this.leaf) return;

    if (this.lazy && !this.loaded) {
      this.loading = true;
      const accepted = this.emit('u-load', { value: this.value });
      if (accepted) this.loaded = true;
      this.loading = false;
    }

    this.expanded = true;
    this.emit('u-expand', { value: this.value });
  }

  /** 노드 접기 */
  public collapse(): void {
    if (this.disabled) return;
    this.expanded = false;
    this.emit('u-collapse', { value: this.value });
  }

  /** 펼침/접힘 토글 */
  public toggle(): void {
    if (this.expanded) this.collapse();
    else this.expand();
  }

  /** default slot의 tree-item을 children slot으로 자동 재배정 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    for (const el of slot.assignedElements({ flatten: true })) {
      if (el instanceof UTreeItem && !el.hasAttribute('slot')) {
        el.setAttribute('slot', 'children');
      }
    }
  };

  /** 자식 아이템에 속성 전파 */
  private propagateToChildren(): void {
    for (const child of this._childItems) {
      child.depth = this.depth + 1;
      child.selectable = this.selectable;
      child.checkable = this.checkable;
      child.trigger = this.trigger;
      child.draggable = this.draggable;
      child.droppable = this.droppable;
      child.expandIcon = this.expandIcon;
      child.collapseIcon = this.collapseIcon;
    }
  }

  /** children slot 변경 시 자식 목록 갱신 및 속성 전파 */
  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._childItems = slot.assignedElements({ flatten: true }).filter(
      (el): el is UTreeItem => el instanceof UTreeItem
    );
    this.leaf = this._childItems.length === 0 && !this.lazy;
    this.propagateToChildren();
  };

  private handleHeaderClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if (this.selectable) {
      this.emit('u-select', {
        value: this.value,
        ctrlKey: e.ctrlKey || e.metaKey,
      });
    }

    if (this.trigger === 'item' && !this.leaf) {
      this.toggle();
    }
  };

  private handleToggleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled || this.leaf) return;
    this.toggle();
  };

  private handleCheckboxClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    this.checked = !this.checked;
    this.indeterminate = false;
    this.emit('u-check', { value: this.value, checked: this.checked });
  };

  private handleHeaderDragStart = (e: DragEvent) => {
    if (!this.draggable || this.disabled) return;
    e.stopPropagation();
    e.dataTransfer!.effectAllowed = 'move';
    e.dataTransfer!.setData('text/plain', this.value);
    this.toggleAttribute('dragging', true);
    this.emit('u-drag-start', { value: this.value });
  };

  private handleHeaderDragEnd = () => {
    if (!this.draggable) return;
    this.toggleAttribute('dragging', false);
    this.emit('u-drag-end', { value: this.value });
  };

  private handleHeaderDragOver = (e: DragEvent) => {
    if (!this.droppable) return;
    e.preventDefault();
    e.stopPropagation();

    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const ratio = (e.clientY - rect.top) / rect.height;

    const position = ratio < 0.25 ? 'before' : ratio > 0.75 ? 'after' : 'inside';
    this.setAttribute('drag-over', position);

    // inside 위치에 머무르면 자동 펼침
    clearTimeout(this.dragTimer);
    if (position === 'inside' && !this.leaf && !this.expanded) {
      this.dragTimer = window.setTimeout(() => this.expand(), 800);
    }
  };

  private handleHeaderDragLeave = () => {
    if (!this.droppable) return;
    this.removeAttribute('drag-over');
    clearTimeout(this.dragTimer);
  };

  private handleHeaderDrop = (e: DragEvent) => {
    if (!this.droppable) return;
    e.preventDefault();
    e.stopPropagation();

    const position = this.getAttribute('drag-over') as 'before' | 'inside' | 'after' | null;
    const sourceValue = e.dataTransfer?.getData('text/plain');
    this.removeAttribute('drag-over');
    clearTimeout(this.dragTimer);

    if (sourceValue && position) {
      this.emit('u-drop', { source: sourceValue, target: this.value, position });
    }
  };
}
