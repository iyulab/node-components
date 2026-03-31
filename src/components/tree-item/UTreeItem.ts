import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UElement } from "../UElement.js";
import { styles } from "./UTreeItem.styles.js";
import { type PickEventDetail } from "../../events/PickEvent.js";
import { type CheckEventDetail } from "../../events/CheckEvent.js";
import { type ExpandEventDetail } from "../../events/ExpandEvent.js";
import { type CollapseEventDetail } from "../../events/CollapseEvent.js";

export type TreeItemTrigger = 'item' | 'icon';

/**
 * 트리 구조에서 개별 노드를 표시하는 컴포넌트입니다.
 *
 * @slot - 레이블 텍스트
 * @slot prefix - 레이블 앞에 표시되는 콘텐츠
 * @slot suffix - 레이블 뒤에 표시되는 콘텐츠
 * 
 * @csspart header - 노드의 헤더 영역
 * @csspart content - 노드의 레이블 콘텐츠 영역
 * @csspart subtree - 자식 노드들을 감싸는 영역
 * 
 * @event expand - 노드 펼침 시 발생
 * @event collapse - 노드 접힐 시 발생
 * @event pick - 선택 시 발생
 * @event check - 체크 시 발생
 */
@customElement('u-tree-item')
export class UTreeItem extends UElement {
  static styles = [ super.styles, styles ];

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 펼침/접힌 상태 */
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  /** 선택 가능 여부 */
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;
  /** 체크 가능 여부 */
  @property({ type: Boolean, reflect: true }) checkable: boolean = false;
  /** 로딩 상태 */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  /** 트리 펼치기 트리거 방식 */
  @property({ type: String }) trigger: TreeItemTrigger = 'item';
  /** 아이템의 고유값 */
  @property({ type: String }) value: string = '';

  @property({ type: Boolean, reflect: true }) draggable: boolean = false;
  @property({ type: Boolean, reflect: true }) droppable: boolean = false;

  @state() leaf: boolean = true;
  @state() depth: number = 0;
  @state() selected: boolean = false;
  @state() checked: boolean = false;
  @state() indeterminate: boolean = false;
  @state() expandIcon?: Node;
  @state() collapseIcon?: Node;

  private _parentItem: UTreeItem | null = null;
  public get parentItem(): UTreeItem | null {
    return this._parentItem;
  }

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
      this.depth = this._parentItem.depth + 1;
      if (!this.hasAttribute('slot')) {
        this.setAttribute('slot', 'children');
      }
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    }
    if (changedProperties.has('depth')) {
      this.style.setProperty('--tree-item-depth', String(this.depth));
    }
  }

  render() {
    return html`
      <div class="header" part="header"
        ?selected=${this.selected}
        @click=${this.handleHeaderClick}
      >
        <span class="prefix-toggler"
          ?hidden=${this.leaf}
          @click=${this.handleToggleClick}
        >
          ${this.loading
            ? html`<u-spinner></u-spinner>`
            : this.expanded
            ? this.collapseIcon || html`<u-icon lib="internal" name="chevron-down"></u-icon>`
            : this.expandIcon || html`<u-icon lib="internal" name="chevron-right"></u-icon>`}
        </span>

        <span class="prefix-checkbox"
          ?hidden=${!this.checkable}  
          ?checked=${this.checked}
          ?indeterminate=${this.indeterminate}
          @click=${this.handleCheckboxClick}
        >
          <u-icon lib="internal"
            name=${this.indeterminate ? 'dash-lg' : 'check-lg'}
          ></u-icon>
        </span>

        <slot name="prefix"></slot>
        <div class="content" part="content">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <slot name="suffix"></slot>
      </div>

      <div class="subtree" part="subtree" ?hidden=${!this.expanded || this.leaf}>
        <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
      </div>
    `;
  }

  public expand(): boolean {
    if (this.disabled || this.leaf) return false;

    if(this.fire<ExpandEventDetail>('expand')) {
      this.expanded = true;
      return true;
    }
    return false;
  }

  public collapse(): boolean {
    if (this.disabled || this.leaf) return false;
    
    if(this.fire<CollapseEventDetail>('collapse')) {
      this.expanded = false;
      return true;
    }
    return false;
  }

  public toggle(): boolean {
    if (this.expanded) {
      return this.collapse();
    } else {
      return this.expand();
    }
  }

  private propagate() {
    this._childItems.forEach(item => {
      item.selectable = this.selectable;
      item.checkable = this.checkable;
      item.trigger = this.trigger;
      item.expandIcon = this.expandIcon?.cloneNode(true);
      item.collapseIcon = this.collapseIcon?.cloneNode(true);
    });
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });

    for (const el of elements) {
      if (el instanceof UTreeItem && !el.hasAttribute('slot')) {
        el.setAttribute('slot', 'children');
      }
    }
  };

  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._childItems = slot.assignedElements({ flatten: true }).filter(
      (el): el is UTreeItem => el instanceof UTreeItem
    );
    this.leaf = this._childItems.length === 0;
    this.propagate();
  };

  private handleHeaderClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if (this.selectable) {
      this.fire<PickEventDetail>('pick', {
        detail: {
          value: this.value,
          selected: this.selected,
          shiftKey: e.shiftKey,
          metaKey: e.metaKey,
          ctrlKey: e.ctrlKey,
        },
      });
    }

    const isMultiple = this.selectable && (e.ctrlKey || e.metaKey || e.shiftKey);
    if (this.trigger === 'item' && !isMultiple) {
      this.toggle();
    }
  };

  private handleToggleClick = (e: MouseEvent) => {
    e.stopPropagation();
    this.toggle();
  };

  private handleCheckboxClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;
    this.fire<CheckEventDetail>('check');
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-tree-item': UTreeItem;
  }
}
