import { html, nothing, PropertyValues } from "lit";
import { property, query, queryAssignedElements, state } from "lit/decorators.js";

import { computePosition, offset, shift, flip, autoUpdate } from "@floating-ui/dom";

import { BaseElement } from "../BaseElement.js";
import type { Menu } from "../menu/Menu.js";
import { styles } from "./MenuItem.styles.js";

export class MenuItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  @property({ type: Boolean }) checkable: boolean = false;
  @property({ type: String }) value: string = '';

  @state() private submenuOpen = false;

  @query('.container') private containerEl!: HTMLElement;

  @queryAssignedElements({ slot: 'submenu', selector: 'u-menu' })
  private submenuList!: Menu[];

  private submenuCleanup: (() => void) | null = null;
  private closeTimer: number | null = null;

  private get submenu(): Menu | undefined {
    return this.submenuList?.[0];
  }

  connectedCallback(): void {
    super.connectedCallback();

    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    this.updateRole();

    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('pointerenter', this.onPointerEnter);
    this.addEventListener('pointerleave', this.onPointerLeave);
    this.addEventListener('focusin', this.onFocusIn);
    this.addEventListener('focusout', this.onFocusOut);
  }

  disconnectedCallback(): void {
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('pointerenter', this.onPointerEnter);
    this.removeEventListener('pointerleave', this.onPointerLeave);
    this.removeEventListener('focusin', this.onFocusIn);
    this.removeEventListener('focusout', this.onFocusOut);

    this.stopSubmenuAutoUpdate();
    if (this.closeTimer) window.clearTimeout(this.closeTimer);

    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
      if (this.disabled) this.closeSubmenu();
    }

    if (changed.has('checked')) {
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    }

    if (changed.has('checkable')) {
      this.updateRole();
    }
  }

  private updateRole() {
    const hasSubmenu = !!this.submenu;
    if (this.checkable) {
      this.setAttribute('role', 'menuitemcheckbox');
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    } else {
      this.setAttribute('role', 'menuitem');
    }

    if (hasSubmenu) {
      this.setAttribute('aria-haspopup', 'menu');
      this.setAttribute('aria-expanded', this.submenuOpen ? 'true' : 'false');
    } else {
      this.removeAttribute('aria-haspopup');
      this.removeAttribute('aria-expanded');
    }
  }

  render() {
    const hasSubmenu = !!this.submenu;
    return html`
      <div class="container" @click=${this.handleClick}>
        ${this.renderPrefixItem()}
        <slot name="prefix"></slot>

        <span class="content">
          <slot></slot>
        </span>

        <slot name="suffix"></slot>
        ${hasSubmenu ? html`<span class="submenu-indicator">›</span>` : nothing}
      </div>

      <!-- Shoelace 방식 그대로 -->
      <slot name="submenu"></slot>
    `;
  }

  private renderPrefixItem() {
    if (this.checkable) {
      return html`<span class="checker" ?checked=${this.checked}>✓</span>`;
    }
    return nothing;
  }

  /** 외부에서 호출 가능하게(부모 menu가 형제 submenu 닫을 때 사용) */
  public closeSubmenu = async () => {
    const sm = this.submenu;
    if (!sm) return;

    this.stopSubmenuAutoUpdate();
    if (this.closeTimer) window.clearTimeout(this.closeTimer);

    this.submenuOpen = false;
    this.setAttribute('aria-expanded', 'false');

    await sm.hide();
  };

  private openSubmenu = async (focusFirst = false) => {
    const sm = this.submenu;
    if (!sm || this.disabled) return;

    if (this.closeTimer) {
      window.clearTimeout(this.closeTimer);
      this.closeTimer = null;
    }

    this.submenuOpen = true;
    this.setAttribute('aria-expanded', 'true');

    // 형제 submenu 닫으라고 알림
    this.emit('u-submenu-open', { item: this });

    await sm.show();
    await this.positionSubmenu();

    // 열려있는 동안 자동 재배치
    this.stopSubmenuAutoUpdate();
    this.submenuCleanup = autoUpdate(this.containerEl, sm as any, () => {
      this.positionSubmenu();
    });

    // submenu 내부에서 선택되면 submenu는 닫는 게 자연스러움
    sm.addEventListener('u-select', this.onSubmenuSelect, { once: true } as any);

    if (focusFirst) {
      await sm.focusFirstItem?.();
    }
  };

  private onSubmenuSelect = () => {
    this.closeSubmenu();
  };

  private scheduleCloseSubmenu = () => {
    if (!this.submenu) return;
    if (this.closeTimer) window.clearTimeout(this.closeTimer);
    this.closeTimer = window.setTimeout(() => this.closeSubmenu(), 150);
  };

  private stopSubmenuAutoUpdate() {
    if (this.submenuCleanup) {
      this.submenuCleanup();
      this.submenuCleanup = null;
    }
  }

  private positionSubmenu = async () => {
    const sm = this.submenu;
    if (!sm) return;

    const pos = await computePosition(this.containerEl, sm as any, {
      strategy: 'fixed',
      placement: 'right-start',
      middleware: [
        offset(6),
        flip(),
        shift({ padding: 8 }),
      ],
    });

    Object.assign(sm.style, {
      position: 'fixed',
      left: `${pos.x}px`,
      top: `${pos.y}px`,
      zIndex: '1001',
      transformOrigin: (() => {
        switch (pos.placement) {
          case 'left':
          case 'left-start':
          case 'left-end':
            return 'right center';
          case 'right':
          case 'right-start':
          case 'right-end':
            return 'left center';
          case 'top':
          case 'top-start':
          case 'top-end':
            return 'center bottom';
          default:
            return 'center top';
        }
      })(),
    });
  };

  private onPointerEnter = () => {
    if (this.submenu) this.openSubmenu(false);
  };

  private onPointerLeave = (e: PointerEvent) => {
    const sm = this.submenu;
    if (!sm) return;

    const next = e.relatedTarget as Node | null;
    if (next && (this.contains(next) || sm.contains(next))) return;

    this.scheduleCloseSubmenu();
  };

  private onFocusIn = () => {
    if (this.submenu) this.openSubmenu(false);
  };

  private onFocusOut = (e: FocusEvent) => {
    const sm = this.submenu;
    if (!sm) return;

    const next = e.relatedTarget as Node | null;
    if (next && (this.contains(next) || sm.contains(next))) return;

    this.scheduleCloseSubmenu();
  };

  private handleKeydown = async (e: KeyboardEvent) => {
    if (!this.submenu) return;

    if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      await this.openSubmenu(true);
    }
  };

  private handleClick = async (e: MouseEvent) => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }

    // submenu가 있으면 select 대신 열기/토글
    if (this.submenu) {
      e.preventDefault();
      e.stopPropagation();
      if (this.submenuOpen) await this.closeSubmenu();
      else await this.openSubmenu(true);
      return;
    }

    if (this.checkable) {
      this.checked = !this.checked;
      this.emit('u-check', { checked: this.checked });
    } else {
      this.emit('u-select', { value: this.value });
    }
  }
}