import { html, nothing, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../../internals/UElement.js";
import { styles } from "./MenuItem.styles.js";

/**
 * MenuItem 컴포넌트는 메뉴의 개별 항목을 나타냅니다.
 * u-menu 및 u-context-menu와 함께 사용됩니다.
 */
export class MenuItem extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

    /** 메뉴 항목이 비활성화 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 메뉴 항목이 선택된 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) selected: boolean = false;
  /** 체크 가능한 경우, 체크 상태인지 여부입니다. */
  @property({ type: Boolean, reflect: true }) checked: boolean = false;
  /** 메뉴 항목에 체크 표시를 할 수 있는지 여부입니다. */
  @property({ type: Boolean }) checkable: boolean = false;
    /** 메뉴 항목의 값입니다. */
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.setAttribute('role', 'menuitem');
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('disabled')) {
      this.setAttribute('tabindex', this.disabled ? '-1' : '0');
      this.setAttribute('aria-disabled', this.disabled ? 'true' : 'false');
    }

    if (changedProperties.has('checked')) {
      this.setAttribute('aria-checked', this.checked ? 'true' : 'false');
    }
  }

  render() {
    return html`
      <div class="container" @click=${this.handleClick}>
        ${this.renderPrefixItem()}
        <slot name="prefix"></slot>
        <span class="content">
          <slot></slot>
        </span>
        <slot name="suffix"></slot>
      </div>
    `;
  }

  /** 메뉴 항목의 앞부분을 렌더링합니다. */
  private renderPrefixItem() {
    if (this.checkable) {
      return html`
        <span class="checker" ?checked=${this.checked}>✓</span>
      `;
    } else {
      return nothing;
    }
  }

  /** 클릭 이벤트를 처리합니다. */
  private handleClick = (e: MouseEvent) => {
    if (this.disabled) {
      e.preventDefault();
      e.stopPropagation();
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