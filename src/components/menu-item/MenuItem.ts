import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { Menu } from "../menu/Menu.js";
import { styles } from "./MenuItem.styles.js";

export class MenuItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  /** 중첩된 메뉴 아이템인지 여부 */
  @state() isNested: boolean = false;
  
  /** 비활성화 여부 @default false */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 선택 여부(multiple mode) @default false */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 선택 여부(single mode) @default false */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 값 */
  @property({ type: String }) value: string = '';

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      const tabIndex = this.disabled ? '-1' : '0';
      this.setAttribute('tabindex', tabIndex);
    }
  }

  render() {
    return html`
      <u-icon class="prefix icon"
        ?hidden=${!this.checked}
        lib="internal"
        name="check-lg"
      ></u-icon>

      <slot name="prefix"></slot>

      <span class="content">
        <slot></slot>
      </span>

      <slot name="suffix"></slot>

      <u-icon class="suffix icon"
        ?hidden=${!this.isNested}
        lib="internal"
        name="chevron-right"
      ></u-icon>

      <slot name="submenu"
        ?hidden=${!this.isNested}
        @slotchange=${this.handleSubmenuSlotChange}
      ></slot>
    `;
  }

  private handleSubmenuSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true })
      .filter(el => el instanceof Menu) as Menu[] || [];

    if (elements.length !== 1) {
      console.warn(`when using <u-menu-item> with submenu, there must be exactly one <u-menu> element in the 'submenu' slot.`);
      this.isNested = false;
    } else {
      const submenu = elements[0];
      submenu.anchor = this;
      submenu.type = 'submenu';
      this.isNested = true;
    }
  }
}