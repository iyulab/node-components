import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { live } from 'lit/directives/live.js';
import '../icon/UIcon.js';
import '../popover/UPopover.js';

import { UElement } from "../UElement.js";
import { UDivider } from "../divider/UDivider.js";
import { styles } from "./UMenuItem.styles.js";
import { type PickEventDetail } from "../../events/PickEvent.js";
import { isFromNestedControl } from "../../utilities/nestedControl.js";
import { HostAria } from "../../utilities/hostAria.js";

import { SlotPresence } from "../../utilities/slotPresence.js";
import { delegate } from "../../utilities/listenInShadow.js";
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
 *
 * @cssprop --menu-item-color - 선택/활성 상태의 기준색 (기본: --u-primary-color)
 */
@customElement('u-menu-item')
export class UMenuItem extends UElement {
  static styles = [ super.styles, styles ];
  /** 접두 · 접미 슬롯이 찼는가 — 그 옆 간격은 섀도 안 상자가 갖는다(`::slotted` 여백은 문서의 전역 리셋에 진다). */
  private readonly affixes = new SlotPresence(this, ['prefix', 'suffix']);

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

  private readonly aria = new HostAria(this);
  /** 하위 메뉴를 가진 동안 라벨 글자가 바뀌는 것을 본다 — 이름을 라벨에서 다시 옮긴다. */
  private labelObserver?: MutationObserver;

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

  disconnectedCallback(): void {
    this.labelObserver?.disconnect();
    this.labelObserver = undefined;
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('leaf') || changedProperties.has('expanded')) this.syncSubmenuAria();

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
      // 역할이 호스트에 있으므로 비활성도 호스트가 알린다 — 보조기술·자동화 도구가 읽는 것은 이 속성이다.
      if (this.disabled) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
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
        ${delegate('click', this.handleHeaderClick)}
      >
        <u-icon class="prefix-checker"
          ?hidden=${this.indicator !== 'check' || !this.selected}
          lib="internal"
          name="check"
        ></u-icon>

        <span class="affix affix-prefix" ?hidden=${!this.affixes.has('prefix')}><slot name="prefix"></slot></span>
        <div class="content" part="content">
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
        <span class="affix affix-suffix" ?hidden=${!this.affixes.has('suffix')}><slot name="suffix"></slot></span>

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
          <div class="submenu" part="submenu" role="menu"
            ?hidden=${this.leaf}
            ?open=${this.expanded}
          >
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </div>`
        : html`
          <u-popover class="popover" part="popover" role="menu"
            ?hidden=${this.leaf}
            ?open=${live(this.expanded)}
            for=".header"
            trigger="hover"
            placement="right-start"
            offset="4"
            strategy="fixed"
          >
            <slot name="children" @slotchange=${this.handleChildrenSlotChange}></slot>
          </u-popover>`
        }
    `;
  }

  /**
   * 하위 메뉴를 가진 항목의 이름은 자기 라벨뿐이다. 역할이 호스트에 있고 하위 항목은 호스트의 자식이라, 내용에서 짓는
   * 이름이 하위 항목의 글자까지 모은다(«테마 라이트 다크 …»). 라벨(기본 슬롯)의 글자를 이름으로 옮기고, 하위 메뉴가 있음과
   * 열림을 알린다(WAI-ARIA 메뉴 패턴). 작성자가 단 `aria-*` 는 건드리지 않는다(`HostAria`). 잎 항목은 내용이 곧 이름이다.
   */
  private syncSubmenuAria() {
    const parent = !this.leaf;
    this.aria.set('aria-label', parent ? this.labelText() || null : null);
    this.aria.set('aria-haspopup', parent ? 'menu' : null);
    this.aria.set('aria-expanded', parent ? String(this.expanded) : null);
    if (parent && !this.labelObserver) {
      this.labelObserver = new MutationObserver(() => this.aria.set('aria-label', this.labelText() || null));
      this.labelObserver.observe(this, { childList: true, characterData: true, subtree: true });
    } else if (!parent && this.labelObserver) {
      this.labelObserver.disconnect();
      this.labelObserver = undefined;
    }
  }

  /** 기본 슬롯(라벨)에 든 글자 — 하위 항목(`slot="children"`)과 앞뒤 슬롯은 빠진다. */
  private labelText(): string {
    const slot = this.shadowRoot?.querySelector<HTMLSlotElement>('.content slot');
    const nodes = slot ? slot.assignedNodes({ flatten: true }) : [];
    return nodes.map((n) => n.textContent ?? '').join('').replace(/s+/g, ' ').trim();
  }

  private propagate() {
    this._childItems.forEach(child => {
      child.inline = this.inline;
      child.indicator = this.indicator;
      child.align = this.align;
    });
  }

  private handleHeaderClick = (e: MouseEvent) => {
    // 헤더 슬롯(prefix·suffix·본문)에 둔 버튼·링크의 클릭은 그 컨트롤의 것이다 — 항목을 고르거나 펼치지 않고,
    // 컨트롤의 클릭이 바깥 리스너에 닿도록 전파도 막지 않는다(`<summary>`·`<label>` 안 상호작용 콘텐츠와 같다).
    if (isFromNestedControl(e, this)) return;
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
    if (!this.leaf) this.syncSubmenuAria();
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
