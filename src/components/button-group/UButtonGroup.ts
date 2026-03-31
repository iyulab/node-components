import { html, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UButton, type ButtonVariant } from "../button/UButton.js";
import { UIconButton } from "../icon-button/UIconButton.js";
import { styles } from "./UButtonGroup.styles.js";

/**
 * 여러 버튼을 묶어 그룹으로 표시하는 컴포넌트입니다.
 * variant 또는 disabled 속성을 설정하면 하위 u-button, u-icon-button에 자동 적용됩니다.
 *
 * @slot - u-button 또는 u-icon-button 요소들
 */
@customElement('u-button-group')
export class UButtonGroup extends UElement {
  static styles = [ super.styles, styles ];

  /** 하위 버튼에 자동 적용할 스타일 변형 */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "solid";
  /** 세로 방향 배치 여부 */
  @property({ type: Boolean, reflect: true }) vertical = false;
  /** 하위 버튼 자동 비활성화 */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (['variant','disabled','vertical'].some(k => changedProperties.has(k))) {
      this.propagate();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  private propagate(): void {
    const slot = this.shadowRoot?.querySelector('slot');
    const buttons = slot?.assignedElements({ flatten: true }).filter(
      (el): el is UButton | UIconButton => el instanceof UButton || el instanceof UIconButton
    );
    if (!buttons?.length) return;

    const variant = this.variant;
    const vertical = this.vertical;
    const lastIndex = buttons.length - 1;
    const isGhost = variant === 'ghost' || variant === 'link';
    const isSolid = variant === 'solid' || variant === 'filled';

    buttons.forEach((button, index) => {
      button.variant = variant;
      button.disabled = this.disabled;

      const radius = this.getRadius(index, lastIndex, vertical);
      const margin = (index > 0 && !isGhost) ? '-1px' : '';
      const borderCollapse = isSolid && button instanceof UButton;

      if (button instanceof UIconButton) {
        const inner = button.shadowRoot?.querySelector('u-button') as UButton | null;
        if (inner) inner.style.borderRadius = radius;
        button.style.borderRadius = '';
        button.style.margin = vertical ? `${margin} 0 0 0` : `0 0 0 ${margin}`;
      } else {
        button.style.borderRadius = radius;
        button.style.margin = vertical ? `${margin} 0 0 0` : `0 0 0 ${margin}`;

        if (borderCollapse) {
          if (vertical) {
            button.style.borderBottomWidth = index < lastIndex ? '0' : '';
            button.style.borderRightWidth = '';
          } else {
            button.style.borderRightWidth = index < lastIndex ? '0' : '';
            button.style.borderBottomWidth = '';
          }
        } else {
          button.style.borderRightWidth = '';
          button.style.borderBottomWidth = '';
        }
      }
    });
  }

  private getRadius(index: number, last: number, vertical: boolean): string {
    if (last === 0) return '6px';
    if (index === 0) return vertical ? '6px 6px 0 0' : '6px 0 0 6px';
    if (index === last) return vertical ? '0 0 6px 6px' : '0 6px 6px 0';
    return '0';
  }

  private handleSlotChange = (): void => {
    this.propagate();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-button-group': UButtonGroup;
  }
}

