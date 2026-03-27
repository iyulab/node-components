import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";
import { live } from 'lit/directives/live.js';

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UPopover } from "../popover/UPopover.component.js";
import { UDivider } from "../divider/UDivider.component.js";
import { styles } from "./UMenuItem.styles.js";

/** 선택 표시 방식 */
export type MenuItemIndicator = 'highlight' | 'check';
/** 아이템 정렬 */
export type MenuItemAlign = 'left' | 'center' | 'right';

/**
 * MenuItem 컴포넌트는 메뉴 내부의 개별 항목을 나타냅니다.
 *
 * @slot - 기본 슬롯 (라벨 텍스트, 자식 menu-item/divider는 자동으로 children 슬롯으로 재배정)
 * @slot prefix - 라벨 앞에 표시되는 아이콘 등
 * @slot suffix - 라벨 뒤에 표시되는 추가 콘텐츠
 * @slot children - 하위 메뉴 아이템
 */
export class UMenuItem extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
    'u-popover': UPopover,
    'u-divider': UDivider,
  };

  /** 서브메뉴 확장 여부 */
  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 여부 */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 선택된 아이템 표시 방식 */
  @property({ type: String, reflect: true }) indicator: MenuItemIndicator = 'highlight';
  /** 아이템 텍스트 정렬 방식 */
  @property({ type: String, reflect: true }) align: MenuItemAlign = 'left';
  /** 아이템의 고유 값 */
  @property({ type: String }) value: string = '';

  /** 내부 상태 */
  @state() inline: boolean = true;
  @state() leaf: boolean = true;
  @state() depth: number = 0;

  /** 부모 메뉴 아이템 */
  private _parentItem: UMenuItem | null = null;
  public get parentItem(): UMenuItem | null {
    return this._parentItem;
  }

  /** 자식 메뉴 아이템 배열 */
  private _childItems: UMenuItem[] = [];
  public get childItems(): readonly UMenuItem[] {
    return this._childItems;
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    if (this.parentElement instanceof UMenuItem) {
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
    // 서브메뉴가 닫힐 때 자식 메뉴도 닫기
    if (changedProperties.has('expanded') && !this.expanded) {
      this._childItems.forEach(c => c.expanded = false);
    }
    if (changedProperties.has('depth') || changedProperties.has('inline')) {
      this.style.setProperty('--menu-item-depth', String(this.inline ? this.depth : 0));
    }
  }

  render() {
    return html`
      <div class="header"
        @click=${this.handleHeaderClick}
      >
        <u-icon class="prefix-checker"
          ?hidden=${this.indicator !== 'check' || !this.selected}
          lib="internal"
          name="check-lg"
        ></u-icon>

        <slot name="prefix"></slot>
        <div class="content" part="content">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <slot name="suffix"></slot>

        ${this.inline
          ? html`
            <span class="suffix-toggler"
              ?hidden=${this.leaf}
              ?expanded=${this.expanded}
            ></span>`
          : html`
            <u-icon class="suffix-chevron"
              ?hidden=${this.leaf}
              lib="internal"
              name="chevron-right"
            ></u-icon>`
          }
      </div>

      ${this.inline
        ? html`
          <div class="submenu"
            ?hidden=${this.leaf}
            ?open=${this.expanded}
          >
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </div>`
        : html`
          <u-popover class="popover"
            ?hidden=${this.leaf}
            ?open=${live(this.expanded)}
            for=".header"
            trigger="hover"
            placement="right-start"
            offset="4"
          >
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </u-popover>`
        }
    `;
  }

  /** 자식 아이템에 속성 전파 */
  private propagate() {
    this._childItems.forEach(child => {
      child.inline = this.inline;
      child.indicator = this.indicator;
      child.align = this.align;
    });
  }

  /** slot의 menu-item/divider를 children slot으로 재배정 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    for (const el of elements) {
      if ((el instanceof UMenuItem || el instanceof UDivider) && !el.hasAttribute('slot')) {
        el.setAttribute('slot', 'children');
      }
    }
  };

  /** children slot 변경 시 자식 목록 갱신 및 속성 전파 */
  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._childItems = slot.assignedElements({ flatten: true }).filter(
      (el): el is UMenuItem => el instanceof UMenuItem
    );
    this.leaf = this._childItems.length === 0;
    this.propagate();
  };

  private handleHeaderClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if (!this.leaf) {
      this.expanded = !this.expanded;
      return;
    }
    this.emit('u-select');
  };
}
