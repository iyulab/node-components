import { html, PropertyValues } from "lit";
import { property, queryAssignedElements } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { MenuItem } from "../menu-item/MenuItem.js";
import { styles } from "./Menu.styles.js";

/**
 * Menu 컴포넌트는 일반적인 메뉴 컨테이너입니다.
 * MenuItem 컴포넌트를 자식으로 포함하여 메뉴를 구성합니다.
 */
export class Menu extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-menu-item': MenuItem,
  };

  /** 슬롯에 할당된 메뉴 항목들을 가져옵니다. */
  @queryAssignedElements({ selector: 'u-menu-item' }) 
  private items!: MenuItem[];

  /** 메뉴가 열려있는지 여부입니다. */
  @property({ type: Boolean, reflect: true }) open: boolean = false;
  /** 메뉴 항목 중 하나만 선택할 수 있는지 여부입니다. */
  @property({ type: Boolean }) selectable: boolean = false;
  /** 현재 선택된 메뉴 항목의 값입니다. */
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menu');
    this.addEventListener('u-select', this.handleSelect);
    this.addEventListener('keydown', this.handleKeydown);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleSelect);
    this.removeEventListener('keydown', this.handleKeydown);
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

  /** 메뉴를 표시합니다. */
  public show = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = true;
    });
  }

  /** 메뉴를 숨깁니다. */
  public hide = async () => {
    await this.updateComplete;
    requestAnimationFrame(() => {
      this.open = false;
    });
  }

  /** open 상태가 변경될 때 호출됩니다. */
  private updateOpenState(open: boolean) {
    if (open) {
      this.emit('u-show');
    } else {
      this.emit('u-hide');
    }
  }

  /** 선택 상태를 업데이트합니다. */
  private updateSelection() {
    this.items.forEach(item => {
      item.selected = item.value === this.value;
    });
  }

  /** 슬롯 변경 이벤트를 처리합니다. */
  private handleSlotChange = () => {
    if (this.selectable && this.value) {
      this.updateSelection();
    }
  }

  /** 메뉴 항목 선택 이벤트를 처리합니다. */
  private handleSelect = (e: Event) => {
    const event = e as CustomEvent;
    const menuItem = e.target as MenuItem;

    if (this.selectable && menuItem) {
      this.value = menuItem.value || event.detail?.value || '';
      this.updateSelection();
    }
  }

  /** 키보드 네비게이션을 처리합니다. */
  private handleKeydown = (e: KeyboardEvent) => {
    const items = this.items.filter(item => !item.disabled);
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
        if (currentIndex >= 0) {
          items[currentIndex].click();
        }
        break;
      case 'Escape':
        e.preventDefault();
        this.hide();
        break;
    }
  }
}