import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UElement } from "../UElement.js";
import { HostAria } from "../../utilities/hostAria.js";
import { styles } from "./UTreeItem.styles.js";
import { type PickEventDetail } from "../../events/PickEvent.js";
import { type CheckEventDetail } from "../../events/CheckEvent.js";
import { type ExpandEventDetail } from "../../events/ExpandEvent.js";
import { type CollapseEventDetail } from "../../events/CollapseEvent.js";
import { isFromNestedControl } from "../../utilities/nestedControl.js";

/** 이 항목이 속한 트리 — 탭 정지(트리 전체에 하나)는 트리가 정한다. */
interface TabStopOwner { syncTabStop(preferred?: UTreeItem): void }

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
 *
 * @cssprop --tree-item-color - 선택/활성 상태의 기준색 (기본: --u-primary-color)
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

  /**
   * 네이티브 전역 속성. ⚠**드롭을 받아 트리를 재배치하는 구현은 없다** — `UTree` 의 같은
   * 속성과 같은 상태다.
   */
  @property({ type: Boolean, reflect: true }) draggable: boolean = false;

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

  /**
   * 이름 = 자기 라벨(기본 슬롯)의 글자. 역할이 호스트에 있으므로 내용에서 이름을 계산하면 **자식 항목의 글자까지**
   * 들어갔다(실측: 부모 이름 «Root Child»). 속성으로 단다(DOM 도구의 `getByRole('treeitem', { name })` 도 본다) —
   * 소비자가 단 `aria-label` 이 이긴다.
   */
  private readonly aria = new HostAria(this);

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'treeitem');
    // 탭 정지는 트리 전체에 하나다(APG Tree View) — 트리가 한 항목에 0 을 주고 나머지에서는 tabindex 를 뗀다
    // (`UTree.syncTabStop` 의 ⚠ 참조). 종전에는 항목마다 0 이라 Tab 이 항목을 하나씩 다 지나갔다.
    this.addEventListener('pointerdown', this.handlePointerdown);
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

    if (changedProperties.has('disabled') || changedProperties.has('expanded')) {
      // 비활성이 됐거나 접혀 정지가 숨으면 트리가 정지를 옮긴다.
      this.requestTabStopSync();
    }
    if (changedProperties.has('disabled')) {
      // 역할이 호스트에 있으므로 비활성도 호스트가 알린다 — 보조기술·자동화 도구가 읽는 것은 이 속성이다.
      if (this.disabled) this.setAttribute('aria-disabled', 'true');
      else this.removeAttribute('aria-disabled');
    }
    if (changedProperties.has('depth')) {
      this.style.setProperty('--tree-item-depth', String(this.depth));
      // 보조기기는 들여쓰기를 보지 못한다 — 깊이는 aria-level 로(자식은 섀도 안 subtree 슬롯에 그려져 DOM 중첩만으로는
      // 브라우저가 단계를 셈하지 못했다: 실측 자식도 level 1).
      this.setAttribute('aria-level', String(this.depth + 1));
    }
    if (changedProperties.has('expanded') || changedProperties.has('leaf')) {
      // 잎은 펼침 상태가 없다 — 속성 자체가 «펼칠 수 있다» 를 말한다(APG Tree View).
      if (this.leaf) this.removeAttribute('aria-expanded');
      else this.setAttribute('aria-expanded', this.expanded ? 'true' : 'false');
    }
    if (changedProperties.has('selected') || changedProperties.has('selectable')) {
      if (this.selectable) this.setAttribute('aria-selected', this.selected ? 'true' : 'false');
      else this.removeAttribute('aria-selected');
    }
    if (['checked', 'indeterminate', 'checkable'].some(k => changedProperties.has(k))) {
      if (this.checkable) this.setAttribute('aria-checked', this.indeterminate ? 'mixed' : this.checked ? 'true' : 'false');
      else this.removeAttribute('aria-checked');
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
            name=${this.indeterminate ? 'minus' : 'check'}
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

    if(this.fire<ExpandEventDetail>('expand', { bubbles: false, composed: false })) {
      this.expanded = true;
      return true;
    }
    return false;
  }

  public collapse(): boolean {
    if (this.disabled || this.leaf) return false;
    
    if(this.fire<CollapseEventDetail>('collapse', { bubbles: false, composed: false })) {
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
    const text = slot.assignedNodes({ flatten: true })
      .filter(n => !(n instanceof UTreeItem))
      .map(n => n.textContent ?? '').join(' ').replace(/\s+/g, ' ').trim();
    this.aria.set('aria-label', text || null);
  };

  private handleChildrenSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this._childItems = slot.assignedElements({ flatten: true }).filter(
      (el): el is UTreeItem => el instanceof UTreeItem
    );
    this.leaf = this._childItems.length === 0;
    this.propagate();
    this.requestTabStopSync();
  };

  private requestTabStopSync(preferred?: UTreeItem): void {
    (this.closest('u-tree') as unknown as TabStopOwner | null)?.syncTabStop?.(preferred);
  }

  /** 포커스를 받기 직전에 탭 정지가 된다 — 정지가 아닌 항목은 tabindex 가 없어 그대로는 포커스를 받지 못한다. */
  public override focus(options?: FocusOptions): void {
    this.requestTabStopSync(this);
    super.focus(options);
  }

  /** 누르면 포커스가 오도록 — 브라우저가 포커스 대상을 정하기 전(pointerdown)에 정지가 된다. 바깥 항목의 처리는 막는다. */
  private handlePointerdown = (e: PointerEvent) => {
    const own = e.composedPath().find(el => el instanceof UTreeItem);
    if (own === this) this.requestTabStopSync(this);
  };

  private handleHeaderClick = (e: MouseEvent) => {
    // 헤더 슬롯(prefix·suffix·본문)에 둔 버튼·링크의 클릭은 그 컨트롤의 것이다 — 항목을 고르거나 펼치지 않고,
    // 컨트롤의 클릭이 바깥 리스너에 닿도록 전파도 막지 않는다(`<summary>`·`<label>` 안 상호작용 콘텐츠와 같다).
    if (isFromNestedControl(e, this)) return;
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
