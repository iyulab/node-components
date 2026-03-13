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
  @property({ type: String, reflect: true }) variant?: ButtonVariant;
    /** 세로 방향 배치 여부를 설정합니다. */
  @property({ type: Boolean, reflect: true }) vertical = false;
  /** 하위 버튼을 일괄 비활성화합니다. */
  @property({ type: Boolean, reflect: true }) disabled = false;

  protected updated(changedProperties: PropertyValues) {
    super.updated(changedProperties);

    if (changedProperties.has('variant') 
      || changedProperties.has('disabled') 
      || changedProperties.has('vertical')) {
      this.updateButtons();
    }
  }

  render() {
    return html`
      <slot @slotchange=${this.updateButtons}></slot>
    `;
  }

  /** 하위 버튼에 variant, disabled, border-radius 동기화 */
  public updateButtons() {
    const slot = this.shadowRoot?.querySelector('slot');
    const buttons = slot?.assignedElements({ flatten: true }).filter(
      (el): el is UButton | UIconButton => el instanceof UButton || el instanceof UIconButton
    );
    if (!buttons) return;

    buttons.forEach((button, i) => {
      if (this.variant) {
        button.variant = this.variant;
      }
      if (this.disabled) {
        button.disabled = true;
      }

      // u-icon-button의 내부 u-button border-radius 설정
      if (button instanceof UIconButton) {
        const inner = button.shadowRoot?.querySelector('u-button') as UButton | null;
        if (!inner) return;

        let radius = '0';
        if (buttons.length === 1) {
          radius = '6px';
        } else if (i === 0) {
          radius = this.vertical ? '6px 6px 0 0' : '6px 0 0 6px';
        } else if (i === buttons.length - 1) {
          radius = this.vertical ? '0 0 6px 6px' : '0 6px 6px 0';
        }
        inner.style.borderRadius = radius;
      }
    });
  }
}
