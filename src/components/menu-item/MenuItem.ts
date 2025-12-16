import { html } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { Menu } from "../menu/Menu.js";
import { styles } from "./MenuItem.styles.js";

export class MenuItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {};

  @state() submenu?: Menu | null = null;
  
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('tabindex', '0');
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
        ?hidden=${!this.submenu}
        lib="internal"
        name="chevron-right"
      ></u-icon>

      <slot name="submenu"
        ?hidden=${!this.submenu}
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
      this.submenu = null;
    } else {
      this.submenu = elements[0];
      this.submenu.trigger = 'hover';
      this.submenu.placement = 'right-start';
    }
  }
}