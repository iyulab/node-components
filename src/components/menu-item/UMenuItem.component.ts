import { html, PropertyValues } from "lit";
import { property, state } from "lit/decorators.js";

import { BaseElement } from "../BaseElement.js";
import { UIcon } from "../icon/UIcon.component.js";
import { UMenu } from "../menu/UMenu.component.js";
import { USpinner } from "../spinner/USpinner.component.js";
import { styles } from "./UMenuItem.styles.js";

export class UMenuItem extends BaseElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof BaseElement> = {
    'u-icon': UIcon,
    'u-spinner': USpinner,
  };

  /** 서브메뉴 요소 */
  @state() submenu: UMenu | null = null;

  /** 비활성화 여부 @default false */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 로딩 상태 @default false */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  /** 선택 여부(multiple mode) @default false */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 선택 여부(single mode) @default false */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 메뉴 아이템 값 */
  @property({ type: String }) value?: string;

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
    }
  }

  render() {
    return html`
      <u-icon class="prefix icon"
        ?hidden=${!this.checked}
        lib="internal"
        name="check"
      ></u-icon>

      <u-spinner class="prefix icon" 
        ?hidden=${!this.loading}
      ></u-spinner>

      <slot name="prefix"></slot>

      <span class="label">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </span>

      <slot name="suffix"></slot>

      <u-icon class="suffix icon"
        ?hidden=${this.submenu === null}
        lib="internal"
        name="chevron-right"
      ></u-icon>

      <slot name="submenu" @slotchange=${this.handleSubmenuSlotChange}></slot>
    `;
  }

  /** 기본 슬롯 변경 감지 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    const menu = elements.find(el => el instanceof UMenu);
    
    // menu 요소가 있으면 submenu 슬롯으로 이동
    menu?.setAttribute('slot', 'submenu');
  }

  /** submenu 슬롯 변경 감지 */
  private handleSubmenuSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    const elements = slot.assignedElements({ flatten: true });
    const menu = elements.find(el => el instanceof UMenu);
    if (menu) {
      menu.type = 'submenu';
      menu.anchors = [this];
      this.submenu = menu;
    } else {
      this.submenu = null;
    }
  }
}