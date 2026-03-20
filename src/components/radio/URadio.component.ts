import { html, PropertyValues } from "lit";
import { property } from "lit/decorators.js";

import { UElement } from "../UElement.js";
import { UOption } from "../option/UOption.component.js";
import { styles } from "./URadio.styles.js";

export type RadioType = "default" | "button";
export type RadioVariant = "filled" | "outlined";
export type RadioOrientation = "vertical" | "horizontal";

/**
 * Radio 컴포넌트는 여러 옵션 중 하나를 선택하는 폼 컨트롤입니다.
 * u-option 자식을 슬롯으로 받아 라디오 그룹을 구성합니다.
 *
 * @slot - 기본 슬롯 (u-option 아이템)
 *
 * @event u-change - 선택 값이 변경될 때 발생
 */
export class URadio extends UElement {
  static styles = [ super.styles, styles ];
  static dependencies: Record<string, typeof UElement> = {
    'u-option': UOption,
  };

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
  /** 폼에서 사용할 name 속성 */
  @property({ type: String }) name?: string;
  /** 현재 선택된 값 */
  @property({ type: String }) value: string = '';

  /** 슬롯에서 수집된 옵션 목록 */
  private options: UOption[] = [];

  connectedCallback(): void {
    super.connectedCallback();
    this.addEventListener('u-select', this.handleOptionSelect);
  }

  disconnectedCallback(): void {
    this.removeEventListener('u-select', this.handleOptionSelect);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (changedProperties.has('value')
      || changedProperties.has('disabled')
      || changedProperties.has('readonly')) {
      this.propagate();
    }
  }

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <span class="required" ?hidden=${!this.required}>*</span>
        <span class="label">${this.label}</span>
      </div>
      <div class="options">
        <slot @slotchange=${this.handleSlotChange}></slot>
      </div>
      <div class="description" ?hidden=${!this.description}>
        ${this.description}
      </div>
    `;
  }

  /** 자식 옵션들의 상태를 동기화 */
  private propagate(): void {
    for (const option of this.options) {
      option.mode = 'radio';
      option.selected = option.value === this.value;
      if (this.disabled) option.disabled = true;
      if (this.readonly) option.disabled = true;
    }
  }

  /** 슬롯 변경 시 옵션 수집 및 mode 주입 */
  private handleSlotChange = (e: Event) => {
    const slot = e.target as HTMLSlotElement;
    this.options = slot.assignedElements({ flatten: true }).filter(
      (el): el is UOption => el instanceof UOption
    );
    this.propagate();
  };

  /** 옵션 선택 이벤트 핸들러 */
  private handleOptionSelect = (e: Event) => {
    e.stopPropagation();
    if (this.readonly || this.disabled) return;

    const option = e.target as UOption;
    if (!(option instanceof UOption)) return;

    this.value = option.value;
    this.propagate();
    this.emit('u-change');
  };
}
