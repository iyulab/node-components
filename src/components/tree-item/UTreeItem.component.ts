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

  /** 아이템을 비활성화하여 상호작용 차단 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 펼침/접힘 상태 */
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  /** 아이템 선택 가능 여부 */
  @property({ type: Boolean, reflect: true }) selectable: boolean = false;
  /** 아이템 체크 가능 여부 */
  @property({ type: Boolean, reflect: true }) checkable: boolean = false;
  /** 로딩 중임을 나타내는 상태 */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  /** 트리 토글 트리거 방식 */
  @property({ type: String }) trigger: TreeItemTrigger = 'item';
  /** 아이템의 고유 값 */
  @property({ type: String }) value: string = '';

  /** 드래그 앤 드롭 지원 (추후 구현) */
  @property({ type: Boolean, reflect: true }) draggable: boolean = false;
  @property({ type: Boolean, reflect: true }) droppable: boolean = false;

  /** 내부 상태 */
  @state() leaf: boolean = true;
  @state() depth: number = 0;
  @state() selected: boolean = false;
  @state() checked: boolean = false;
  @state() indeterminate: boolean = false;
  /** 사용자 정의 아이콘 슬롯 요소 참조 */
  @state() expandIcon?: Node;
  @state() collapseIcon?: Node;

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
      <div class="header"
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
        <div class="content">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <slot name="suffix"></slot>
      </div>

      <div class="subtree" ?hidden=${!this.expanded || this.leaf}>
        <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
      </div>
    `;
  }

  /** 노드 펼치기 */
  public expand(): boolean {
    if (this.disabled || this.leaf) return false;

    if(this.emit('u-expand')) {
      this.expanded = true;
      return true;
    }
    return false;
  }

  /** 노드 접기 */
  public collapse(): boolean {
    if (this.disabled || this.leaf) return false;
    
    if(this.emit('u-collapse')) {
      this.expanded = false;
      return true;
    }
    return false;
  }

  /** 펼침/접힘 토글 */
  public toggle(): boolean {
    if (this.expanded) {
      return this.collapse();
    } else {
      return this.expand();
    }
  }

  /** 자식 아이템에 속성 전파 */
  private propagate() {
    this._childItems.forEach(item => {
      item.selectable = this.selectable;
      item.checkable = this.checkable;
      item.trigger = this.trigger;
      item.expandIcon = this.expandIcon?.cloneNode(true);
      item.collapseIcon = this.collapseIcon?.cloneNode(true);
    });
  }

  /** slot의 tree-item을 children slot으로 자동 재배정 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });

    for (const el of elements) {
      if (el instanceof UTreeItem && !el.hasAttribute('slot')) {
        el.setAttribute('slot', 'children');
      }
    }
  };

  /** children slot 변경 시 자식 목록 갱신 및 트리에 알림 */
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
      this.emit('u-select', {
        value: this.value,
        ctrlKey: e.ctrlKey || e.metaKey,
        shiftKey: e.shiftKey,
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
    this.emit('u-check');
  };
}
