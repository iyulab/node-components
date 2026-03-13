import { html, nothing, PropertyValues, TemplateResult } from "lit";
import { property, state } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UBreadcrumbItem } from "../breadcrumb-item/UBreadcrumbItem.component.js";
import { styles } from "./UBreadcrumb.styles.js";

/**
 * Breadcrumb 컴포넌트는 현재 페이지의 위치를 계층 구조로 표시합니다.
 * 내부에 u-breadcrumb-item을 배치하여 사용합니다.
 *
 * @slot - 기본 슬롯: u-breadcrumb-item 요소들
 * @slot separator - 구분자 커스터마이징 슬롯 (기본: chevron-right 아이콘)
 */
export class UBreadcrumb extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-icon': UIcon
  };

  /** 너비 초과 시 자동으로 중간 아이템을 드롭다운으로 접기 */
  @property({ type: Boolean, reflect: true }) collapsible: boolean = false;

  @state() private items: UBreadcrumbItem[] = [];
  @state() private separator?: Node;
  @state() private dropdownOpen: boolean = false;
  @state() private dropdownPos = { top: 0, left: 0 };
  @state() private dropdownCount: number = 0;
  
  private observer: ResizeObserver | null = null;
  private queued: boolean = false;

  connectedCallback() {
    super.connectedCallback();
    document.addEventListener('click', this.handleDocumentClick);
    this.addEventListener('u-navigate', this.handleNavigate);
  }

  disconnectedCallback() {
    super.disconnectedCallback();
    document.removeEventListener('click', this.handleDocumentClick);
    this.removeEventListener('u-navigate', this.handleNavigate);
    this.observer?.disconnect();
    this.observer = null;
  }

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('collapsible')) {
      this.observer?.disconnect();
      if (this.collapsible) {
        this.observer = new ResizeObserver(() => {
          this.dropdownOpen = false;
          this.queueCheckOverflow();
        });
        this.observer.observe(this);
        this.queueCheckOverflow();
      } else {
        this.observer = null;
        this.dropdownCount = 0;
        this.dropdownOpen = false;
      }
    }
  }

  render() {
    const collapsed = this.dropdownCount > 0;

    return html`
      <nav aria-label="breadcrumb">
        ${collapsed ? this.renderCollapsed() : this.renderExpanded()}
      </nav>
      
      ${this.renderDropdown()}

      <div hidden>
        <slot @slotchange=${this.handleSlotChange}></slot>
        <slot name="separator" @slotchange=${this.handleSeparatorSlotChange}></slot>
      </div>
    `;
  }

//#region Render Methods

  private renderExpanded() {
    return this.renderItems(0, this.items.length);
  }

  private renderCollapsed() {
    const total = this.items.length;
    const start = Math.min(1 + this.dropdownCount, total - 1);

    return [
      ...this.renderItems(0, 1),
      this.renderSeparator(),
      this.renderEllipsis(),
      this.renderSeparator(),
      ...this.renderItems(start, total),
    ];
  }

  private renderItems(start: number, end: number): TemplateResult[] {
    const parts: TemplateResult[] = [];

    for (let i = start; i < end; i++) {
      parts.push(html`${this.items[i]?.cloneNode(true)}`);
      if (i < end - 1) parts.push(this.renderSeparator());
    }

    return parts;
  }

  private renderEllipsis() {
    return html`
      <button
        class="ellipsis-btn"
        aria-label="show more"
        @click=${this.handleDropdownToggle}
      >
        <u-icon lib="internal" name="three-dots"></u-icon>
      </button>
    `;
  }

  private renderDropdown() {
    if (!this.dropdownOpen || this.dropdownCount < 1) return nothing;

    const total = this.items.length;
    const end = Math.min(1 + this.dropdownCount, total - 1);
    const nodes = this.items.slice(1, end).map(item => item.cloneNode(true));

    return html`
      <div
        class="dropdown-menu"
        style="top:${this.dropdownPos.top}px; left:${this.dropdownPos.left}px;"
      >
        ${nodes}
      </div>
    `;
  }

  private renderSeparator() {
    return html`
      <span class="separator" part="separator">
        ${this.separator
          ? this.separator.cloneNode(true)
          : html`<u-icon lib="internal" name="chevron-right"></u-icon>`}
      </span>`;
  }

//#endregion

//#region Event Handlers

  private async queueCheckOverflow() {
    if (this.queued) return;
    this.queued = true;

    await this.updateComplete;
    requestAnimationFrame(() => {
      this.queued = false;
      this.checkOverflow();
    });
  }

  private checkOverflow() {
    if (!this.collapsible) return;
    const nav = this.shadowRoot?.querySelector('nav');
    if (!nav) return;

    const total = this.items.length;
    if (total <= 3) {
      this.dropdownCount = 0;
      return;
    }

    const maxCollapsible = total - 2;
    if (nav.scrollWidth > nav.clientWidth && this.dropdownCount < maxCollapsible) {
      // 오버플로우 발생 → 하나 접기
      this.dropdownCount = Math.min(this.dropdownCount + 1, maxCollapsible);
      // 접은 후에도 여전히 오버플로우면 더 접기
      this.queueCheckOverflow();
      return;
    }
    
    if (nav.scrollWidth <= nav.clientWidth && this.dropdownCount > 0) {
      // 여유 공간 있음 → 하나 펼치기
      const prev = this.dropdownCount;
      this.dropdownCount = prev - 1;
      
      this.updateComplete.then(() => {
        requestAnimationFrame(() => {
          const nav = this.shadowRoot?.querySelector('nav');
          if (nav && nav.scrollWidth > nav.clientWidth) {
            this.dropdownCount = prev; // 다시 접기
          }
        });
      });
    }
  }

  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.items = slot.assignedElements({ flatten: true })
      .filter(el => el instanceof UBreadcrumbItem);

    if (this.collapsible) {
      this.queueCheckOverflow();
    }
  }

  private handleSeparatorSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.separator = slot.assignedNodes({ flatten: true }).at(0);
  }

  private handleDropdownToggle = (e: Event) => {
    e.stopPropagation();
    if (!this.dropdownOpen) {
      const btn = e.currentTarget as HTMLElement;
      const rect = btn.getBoundingClientRect();
      this.dropdownPos = { top: rect.bottom + 4, left: rect.left };
    }
    this.dropdownOpen = !this.dropdownOpen;
  }

  private handleDocumentClick = (e: MouseEvent) => {
    if (!this.dropdownOpen) return;
    const path = e.composedPath();
    const menu = this.shadowRoot?.querySelector('.dropdown-menu');
    const btn = this.shadowRoot?.querySelector('.ellipsis-btn');
    if (menu && !path.includes(menu) && btn && !path.includes(btn)) {
      this.dropdownOpen = false;
    }
  };

  private handleNavigate = () => {
    this.dropdownOpen = false;
  }

//#endregion
}
