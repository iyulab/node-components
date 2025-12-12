import { html, PropertyValues } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { MenuItem } from "../menu-item/MenuItem.js";
import { styles } from "./Menu.styles.js";

export class Menu extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-menu-item': MenuItem,
  };

  @queryAssignedElements({ selector: 'u-menu-item' })
  private items!: MenuItem[];

  @property({ type: Boolean, reflect: true }) open: boolean = false;
  @property({ type: Boolean }) selectable: boolean = false;
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menu');

    this.addEventListener('u-select', this.handleSelect);
    this.addEventListener('keydown', this.handleKeydown);
    this.addEventListener('u-submenu-open', this.handleSubmenuOpen as any);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleSelect);
    this.removeEventListener('keydown', this.handleKeydown);
    this.removeEventListener('u-submenu-open', this.handleSubmenuOpen as any);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value') && this.selectable) {
      this.updateSelection();
    }
    if (changedProperties.has('open')) {
      this.updateOpenState(this.open);
    }
  }

  render() {
    return html`
      <div class="container">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
    `;
  }

  public show = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => (this.open = true));
  }

  public hide = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => (this.open = false));
  }

  /** (추가) 첫 번째 활성 아이템 포커스 */
  public focusFirstItem = async () => {
    await this.updateComplete;
    const enabled = (this.items || []).filter(i => !i.disabled);
    if (enabled.length) enabled[0].focus();
  }

  private updateOpenState(open: boolean) {
    if (open) this.emit('u-show');
    else this.emit('u-hide');
  }

  private updateSelection() {
    (this.items || []).forEach(item => {
      item.selected = item.value === this.value;
    });
  }

  private handleSlotChange = () => {
    if (this.selectable && this.value) this.updateSelection();
  }

  private handleSelect = (e: Event) => {
    const event = e as CustomEvent;
    const menuItem = e.target as MenuItem;

    if (this.selectable && menuItem) {
      this.value = menuItem.value || event.detail?.value || '';
      this.updateSelection();
    }
  }

  /** 같은 레벨 다른 submenu 닫기 */
  private handleSubmenuOpen = (e: CustomEvent<{ item: MenuItem }>) => {
    const openedItem = e.detail?.item;
    if (!openedItem) return;

    (this.items || []).forEach(item => {
      if (item !== openedItem) item.closeSubmenu?.();
    });
  };

  private handleKeydown = async (e: KeyboardEvent) => {
    const items = (this.items || []).filter(item => !item.disabled);
    if (items.length === 0) return;

    const currentIndex = items.findIndex(item => item === e.target);
    let nextIndex = currentIndex;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        nextIndex = (currentIndex + 1) % items.length;
        items[nextIndex].focus();
        break;

      case 'ArrowUp':
        e.preventDefault();
        nextIndex = currentIndex - 1 < 0 ? items.length - 1 : currentIndex - 1;
        items[nextIndex].focus();
        break;

      case 'Home':
        e.preventDefault();
        items[0].focus();
        break;

      case 'End':
        e.preventDefault();
        items[items.length - 1].focus();
        break;

      case 'Enter':
      case ' ':
        e.preventDefault();
        if (currentIndex >= 0) items[currentIndex].click();
        break;

      case 'ArrowLeft': {
        // submenu(= 부모가 menu-item)라면 닫고 부모로 포커스 복귀
        const parentItem = this.parentElement;
        if (parentItem?.tagName?.toLowerCase() === 'u-menu-item') {
          e.preventDefault();
          (parentItem as any).closeSubmenu?.();
          (parentItem as HTMLElement).focus?.();
        }
        break;
      }

      case 'Escape': {
        e.preventDefault();
        const parentItem = this.parentElement;
        if (parentItem?.tagName?.toLowerCase() === 'u-menu-item') {
          (parentItem as any).closeSubmenu?.();
          (parentItem as HTMLElement).focus?.();
        } else {
          // 최상위 메뉴면 “부모(드롭다운/컨텍스트)가 닫아줘” 요청
          this.emit('u-request-close');
          await this.hide();
        }
        break;
      }
    }
  }
}