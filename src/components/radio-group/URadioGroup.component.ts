import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { URadio, type RadioVariant, type RadioType, type RadioOrientation } from "../radio/URadio.component.js";
import { styles } from "./URadioGroup.styles.js";

/**
 * RadioGroup 컴포넌트는 여러 Radio 컴포넌트를 그룹으로 관리합니다.
 * 그룹 내에서 하나의 값만 선택 가능합니다.
 */
export class URadioGroup extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {};

  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 여부 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 유효하지 않음 표시 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 라디오 타입 */
  @property({ type: String, reflect: true }) type: RadioType = "default";
  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: RadioVariant = "filled";
  /** 배치 방향 */
  @property({ type: String, reflect: true }) orientation: RadioOrientation = "vertical";
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 현재 선택된 값 */
  @property({ type: String }) value: string = '';

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('u-change', this.handleRadioChange);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-change', this.handleRadioChange);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value') 
      || changedProperties.has('disabled') 
      || changedProperties.has('readonly') 
      || changedProperties.has('variant') 
      || changedProperties.has('type') 
      || changedProperties.has('orientation')) {
      this.updateRadios();
    }
  }

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <span class="required" ?hidden=${!this.required}>*</span>
        <span class="label">${this.label}</span>
      </div>
      <div class="options">
        <slot></slot>
      </div>
      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  /** 자식 라디오들의 상태를 동기화 */
  private updateRadios() {
    const slot = this.shadowRoot?.querySelector('slot');
    const radios = slot?.assignedElements({ flatten: true })
      .filter(el => el instanceof URadio) as URadio[] || [];
    
    radios.forEach(radio => {
      radio.checked = radio.value === this.value;
      if (this.disabled) radio.disabled = true;
      if (this.readonly) radio.readonly = true;
      radio.variant = this.variant;
      radio.type = this.type;
      radio.orientation = this.orientation;
    });
  }

  private handleRadioChange = (e: CustomEvent) => {
    e.stopPropagation();
    const target = e.target as URadio;
    this.value = target.value;
    this.emit('u-change');
  }
}
