import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { FloatingElement } from "../FloatingElement.js";
import { Menu } from "../menu/Menu.js";
import { MenuItem } from "../menu-item/MenuItem.js";
import { styles } from "./DropdownMenu.styles.js";

export class DropdownMenu extends FloatingElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-menu': Menu,
    'u-menu-item': MenuItem,
  };

  @property({ type: Boolean }) closeOnSelect: boolean = true;
  @property({ type: Boolean }) closeOnCheck: boolean = false;

  private onDocPointerDown = (e: PointerEvent) => {
    if (!this.visible) return;
    const path = e.composedPath();
    if (path.includes(this)) return;
    if (this.anchor && path.includes(this.anchor)) return; // anchor는 예외
    this.hide();
  };

  private onWindowBlur = () => {
    if (this.visible) this.hide();
  };

  private get menu(): Menu | null {
    return this.querySelector('u-menu');
  }

  connectedCallback(): void {
    super.connectedCallback();
    this.placement ||= 'bottom-start';
    this.distance ||= 6;

    this.addEventListener('u-select', this.onSelect as any);
    this.addEventListener('u-check', this.onCheck as any);
    this.addEventListener('u-request-close', this.onRequestClose as any);
  }

  disconnectedCallback(): void {
    this.detachAnchor(this.anchor);
    this.detachDismiss();

    this.removeEventListener('u-select', this.onSelect as any);
    this.removeEventListener('u-check', this.onCheck as any);
    this.removeEventListener('u-request-close', this.onRequestClose as any);

    super.disconnectedCallback();
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('anchor')) {
      this.detachAnchor(changed.get('anchor'));
      this.attachAnchor(this.anchor);
    }

    if (changed.has('visible')) {
      if (this.visible) this.attachDismiss();
      else this.detachDismiss();

      if (this.anchor) {
        this.anchor.setAttribute('aria-expanded', this.visible ? 'true' : 'false');
      }
    }
  }

  render() {
    return html`<slot></slot>`;
  }

  public override show = async () => {
    // 메뉴를 먼저 열어 크기 측정 가능하게
    this.menu && (this.menu.open = true);

    await super.show();
    await this.menu?.focusFirstItem?.();
  };

  public override hide = async () => {
    await super.hide();
    this.menu && (this.menu.open = false);
    // 서브메뉴들 닫기(열려있던 것 정리)
    this.querySelectorAll('u-menu-item').forEach((i: any) => i.closeSubmenu?.());
  };

  private attachAnchor(target?: HTMLElement): void {
    if (!target) return;
    target.setAttribute('aria-haspopup', 'menu');
    target.addEventListener('pointerdown', this.onTriggerPointerDown);
    target.addEventListener('keydown', this.onTriggerKeydown);
  }

  private detachAnchor(target?: HTMLElement): void {
    if (!target) return;
    target.removeEventListener('pointerdown', this.onTriggerPointerDown);
    target.removeEventListener('keydown', this.onTriggerKeydown);
  }

  private onTriggerPointerDown = async (e: PointerEvent) => {
    if (e.button !== 0) return;
    if (this.visible) await this.hide();
    else await this.show();
  };

  private onTriggerKeydown = async (e: KeyboardEvent) => {
    if (e.key === 'ArrowDown' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (!this.visible) await this.show();
    }
  };

  private onSelect = async () => {
    if (this.closeOnSelect) await this.hide();
  };

  private onCheck = async () => {
    if (this.closeOnCheck) await this.hide();
  };

  private onRequestClose = async () => {
    await this.hide();
  };

  private attachDismiss() {
    document.addEventListener('pointerdown', this.onDocPointerDown, true);
    window.addEventListener('blur', this.onWindowBlur);
  }

  private detachDismiss() {
    document.removeEventListener('pointerdown', this.onDocPointerDown, true);
    window.removeEventListener('blur', this.onWindowBlur);
  }
}
