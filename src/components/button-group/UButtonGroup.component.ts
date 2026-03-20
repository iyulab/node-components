import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UButton, type ButtonVariant } from "../button/UButton.component.js";
import { UIconButton } from "../icon-button/UIconButton.component.js";
import { styles } from "./UButtonGroup.styles.js";

/**
 * ButtonGroup 컴포넌트는 여러 버튼을 시각적으로 그룹화합니다.
 * variant또는 disabled속성을 설정하면 하위 u-button, u-icon-button 요소에 일괄 적용됩니다.
 *
 * @slot - 그룹에 포함할 u-button 또는 u-icon-button 요소들을 삽입합니다.
 */
export class UButtonGroup extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 하위 버튼에 일괄 적용할 스타일 변형을 설정합니다. */
  @property({ type: String, reflect: true }) variant: ButtonVariant = "solid";
  /** 세로 방향 배치 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) vertical = false;
  /** 하위 버튼을 일괄 비활성화합니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('variant') 
      || changedProperties.has('disabled') 
      || changedProperties.has('vertical')) {
      this.propagate();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.handleSlotChange}></slot>
    `;
  }

  /** 하위 버튼에 속성 및 스타일 전파 */
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

      // border-radius
      const radius = this.getRadius(index, lastIndex, vertical);

      // border 겹침 방지 margin
      const margin = (index > 0 && !isGhost) ? '-1px' : '';

      // solid/filled u-button: 인접 border 제거
      const borderCollapse = isSolid && button instanceof UButton;

      if (button instanceof UIconButton) {
        // u-icon-button: 내부 u-button에 radius 적용
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

  /** 위치에 따른 border-radius 계산 */
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
