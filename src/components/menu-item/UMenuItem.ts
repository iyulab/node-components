import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from 'lit/directives/live.js';
import '../icon/UIcon.js';
import '../popover/UPopover.js';

import { UElement } from "../UElement.js";
import { UDivider } from "../divider/UDivider.js";
import { styles } from "./UMenuItem.styles.js";
import { type PickEventDetail } from "../../events/PickEvent.js";

export type MenuItemIndicator = 'highlight' | 'check';
export type MenuItemAlign = 'left' | 'center' | 'right';

/**
 * 메뉴 내에서 개별 항목을 나타내는 컴포넌트입니다.
 *
 * @slot - 기본 슬롯 (라벨 텍스트)
 * @slot prefix - 라벨 앞에 표시하는 아이콘 등
 * @slot suffix - 라벨 뒤에 표시하는 추가 콘텐츠
 * @slot children - 하위 메뉴 아이템
 * 
 * @csspart header - 아이템의 헤더 영역
 * @csspart content - 아이템의 라벨 텍스트 영역
 * @csspart submenu - 인라인 모드에서 하위 메뉴 컨테이너
 * @csspart popover - 팝오버 모드에서 하위 메뉴 컨테이너
 * 
 * @event pick - 아이템 선택 시 발생 (하위 메뉴가 없는 경우)
 */
@customElement('u-menu-item')
export class UMenuItem extends UElement {
  static styles = [ super.styles, styles ];

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

  @state() inline: boolean = true;
  @state() leaf: boolean = true;
  @state() depth: number = 0;

  private _parentItem: UMenuItem | null = null;
  public get parentItem(): UMenuItem | null {
    return this._parentItem;
  }

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
    if (changedProperties.has('expanded') && !this.expanded) {
      this._childItems.forEach(c => c.expanded = false);
    }
    if (changedProperties.has('depth') || changedProperties.has('inline')) {
      this.style.setProperty('--menu-item-depth', String(this.inline ? this.depth : 0));
    }
  }

  render() {
    return html`
      <div class="header" part="header"
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
          <div class="submenu" part="submenu"
            ?hidden=${this.leaf}
            ?open=${this.expanded}
          >
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </div>`
        : html`
          <u-popover class="popover" part="popover"
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

  private propagate() {
    this._childItems.forEach(child => {
      child.inline = this.inline;
      child.indicator = this.indicator;
      child.align = this.align;
    });
  }

  private handleHeaderClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if (!this.leaf) {
      this.expanded = !this.expanded;
      return;
    }
    this.fire<PickEventDetail>('pick', {
      detail: {
        value: this.value,
        selected: this.selected,
        shiftKey: e.shiftKey,
        metaKey: e.metaKey,
        ctrlKey: e.ctrlKey,
      },
    });
  };

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    for (const el of elements) {
      if ((el instanceof UMenuItem || el instanceof UDivider) && !el.hasAttribute('slot')) {
        el.setAttribute('slot', 'children');
      }
    }
  };

  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._childItems = slot.assignedElements({ flatten: true }).filter(
      (el): el is UMenuItem => el instanceof UMenuItem
    );
    this.leaf = this._childItems.length === 0;
    this.propagate();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-menu-item': UMenuItem;
  }
}
