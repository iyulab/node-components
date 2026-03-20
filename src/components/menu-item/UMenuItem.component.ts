import { html, PropertyValues } from "lit";
import { property, query, state } from "lit/decorators.js";
import { computePosition, flip, shift, offset } from "@floating-ui/dom";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UDivider } from "../divider/UDivider.component.js";
import { styles } from "./UMenuItem.styles.js";

/** 선택 표시 방식 */
export type MenuItemIndicator = 'highlight' | 'check';
/** 아이템 정렬 */
export type MenuItemAlign = 'left' | 'center' | 'right';

/**
 * MenuItem 컴포넌트는 메뉴 내부의 개별 항목을 나타냅니다.
 *
 * @slot - 기본 슬롯 (라벨 텍스트)
 * @slot prefix - 라벨 앞에 표시되는 아이콘 등
 * @slot suffix - 라벨 뒤에 표시되는 추가 콘텐츠
 */
export class UMenuItem extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon,
  };

  @property({ type: Boolean, reflect: true }) expanded: boolean = false;
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  @property({ type: String, reflect: true }) indicator: MenuItemIndicator = 'highlight';
  @property({ type: String, reflect: true }) align: MenuItemAlign = 'left';
  @property({ type: String }) value: string = '';

  @state() inline: boolean = true;
  @state() nested: boolean = false;

  @query('.header') headerEl?: HTMLElement;
  @query('.popover') popoverEl?: HTMLElement;

  /** 부모 메뉴 아이템 (상위 메뉴가 있을 때) */
  private _parentItem?: UMenuItem;
  public get parentItem(): UMenuItem | undefined {
    return this._parentItem;
  }

  /** 자식 메뉴 아이템 배열 */
  private _childItems: UMenuItem[] = [];
  public get childItems(): readonly UMenuItem[] {
    return this._childItems;
  }

  /** 닫기 지연 타이머 (서브메뉴 삼각형 문제 방지) */
  private closeTimer?: number;

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    if (this.parentElement instanceof UMenuItem) {
      this._parentItem = this.parentElement;
    }
  }

  disconnectedCallback(): void {
    clearTimeout(this.closeTimer);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    }

    // 서브메뉴가 닫힐 때 모든 자식 메뉴도 닫기
    if (changedProperties.has('expanded') && !this.expanded) {
      for (const child of this.childItems) {
        child.expanded = false;
      }
    }
  }

  render() {
    return html`
      <div class="header"
        @click=${this.handleHeaderClick}
        @pointerenter=${this.handleHeaderPointerEnter}
        @pointerleave=${this.handleHeaderPointerLeave}
      >
        <u-icon 
          ?hidden=${this.indicator !== 'check' || !this.selected} 
          lib="internal" 
          name="check-lg"
        ></u-icon>

        <slot name="prefix"></slot>
        <slot @slotchange=${this.handleSlotChange}></slot>
        <slot name="suffix"></slot>

        ${this.inline
          ? html`
            <span class="toggle-icon"
              ?hidden=${!this.nested}
              ?expanded=${this.expanded}
            ></span>`
          : html`
            <u-icon class="expand-icon"
              ?hidden=${!this.nested}
              lib="internal"
              name="chevron-right"
            ></u-icon>`
          }
      </div>

      ${this.inline 
        ? html`
          <div class="submenu"
            ?hidden=${!this.nested}
            ?open=${this.expanded}>
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </div>`
        : html`
          <div class="popover"
            ?hidden=${!this.nested}
            ?open=${this.expanded}
            @pointerenter=${this.handlePopoverPointerEnter}
            @pointerleave=${this.handlePopoverPointerLeave}
          >
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </div>`
        }
    `;
  }

  /** slot의 menu-item/divider를 children slot으로 재배정 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const nodes = slot.assignedNodes({ flatten: true });
    for (const node of nodes) {
      if ((node instanceof UMenuItem || node instanceof UDivider)) {
        node.setAttribute('slot', 'children');
      }
    }
  };

  /** children slot 변경 시 자식 목록 갱신 및 속성 전파 */
  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._childItems = slot.assignedElements({ flatten: true }).filter(
      (el): el is UMenuItem => el instanceof UMenuItem
    );
    this.nested = this.childItems.length > 0;

    for (const child of this.childItems) {
      child.indicator = this.indicator;
      child.align = this.align;
      child.inline = this.inline;
    }
  };

  private handleHeaderClick = async (e: MouseEvent) => {
    e.stopPropagation();
    if (this.disabled) return;

    if (this.nested) {
      await this.repositionPopover();
      this.expanded = !this.expanded;
    }
    this.emit('u-select');
  };

  private handleHeaderPointerEnter = async (_: PointerEvent) => {
    if (this.inline || !this.nested) return;
    clearTimeout(this.closeTimer);
    if (this.expanded) return;
    await this.repositionPopover();
    this.expanded = true;
  };

  private handleHeaderPointerLeave = (_: PointerEvent) => {
    if (this.inline) return;
    this.scheduleClose();
  };

  private handlePopoverPointerEnter = (_: PointerEvent) => {
    if (this.inline) return;
    clearTimeout(this.closeTimer);
  }

  private handlePopoverPointerLeave = (_: PointerEvent) => {
    if (this.inline) return;
    this.scheduleClose();
  };
  
  private async repositionPopover(): Promise<void> {
    const popover = this.popoverEl;
    const header = this.headerEl;
    if (!popover) return;
    if (!header) return;

    const { x, y } = await computePosition(header, popover, {
      strategy: 'fixed',
      placement: 'right-start',
      middleware: [
        offset(4),
        flip({ fallbackPlacements: ['left-start'] }),
        shift({ padding: 8 }),
      ],
    });
    Object.assign(popover.style, { 
      left: `${x}px`, 
      top: `${y}px` 
    });
  }

  private scheduleClose(): void {
    clearTimeout(this.closeTimer);
    this.closeTimer = window.setTimeout(() => {
      this.expanded = false;
    }, 150);
  }
}
