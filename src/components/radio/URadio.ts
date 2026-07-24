import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../field/UField.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { UOption } from "../option/UOption.js";
import { styles } from "./URadio.styles.js";

export type RadioType = "default" | "button";
export type RadioVariant = "filled" | "outlined";
export type RadioOrientation = "vertical" | "horizontal";

/**
 * 여러 라디오 버튼 중 하나를 선택하는 라디오 그룹 컴포넌트입니다.
 *
 * @slot - u-option 아이템
 * 
 * @csspart field - u-field 요소
 * @csspart container - 옵션들을 감싸는 컨테이너
 * 
 * @event change - 사용자 상호작용(옵션 클릭·키보드)으로 선택 값이 변경될 때 발생.
 *   네이티브 라디오와 동일하게 프로그램적 value 세팅·옵션 등록으로는 발화하지 않는다.
 */
@customElement('u-radio')
export class URadio extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 라디오 유형 */
  @property({ type: String, reflect: true }) type: RadioType = "default";
  /** 스타일 변형 */
  @property({ type: String, reflect: true }) variant: RadioVariant = "filled";
  /** 배치 방향 */
  @property({ type: String, reflect: true }) orientation: RadioOrientation = "vertical";

  @state() private options: UOption[] = [];

  disconnectedCallback(): void {
    this.cleanup(this.options);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (['type','disabled','readonly'].some(k => changedProperties.has(k))) {
      this.options.forEach(option => {
        option.marker = this.type === 'button' ? undefined : 'radio';
        option.disabled = this.disabled || this.readonly;
      });
    }
    if (['value','options'].some(k => changedProperties.has(k))) {
      this.onChangeValue();
    }
  }

  render() {
    return html`
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.disabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="container" part="container"
          role="radiogroup"
          aria-label=${ifDefined(this.label)}
          aria-description=${ifDefined(this.description)}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </u-field>
    `;
  }

  protected setValidity(): void {
    const missing = this.required && !this.value;
    this.commit(
      missing ? { valueMissing: true } : {},
      missing ? Locale.getValue('valueMissing') : '',
      this,
    );
  }

  public reset(): void {
    this.value = undefined;
    this.invalid = false;
  }

  private setup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeyDown);
      option.addEventListener('click', this.handleOptionClick);
      option.addEventListener('keydown', this.handleOptionKeyDown);
      option.selected = option.value === this.value;
      option.marker = this.type === 'button' ? undefined : 'radio';
      option.disabled = this.disabled || this.readonly;
    }
  }

  private cleanup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeyDown);
    }
  }

  private onChangeValue() {
    this.options.forEach(option => {
      option.selected = option.value === this.value;
    });

    this.internals?.setFormValue(this.value || '');
  }

  /** 사용자 상호작용으로 값이 바뀐 경로에서만 호출한다 — 프로그램적 value 세팅은
   *  네이티브 폼 컨트롤과 동일하게 change를 발화하지 않는다.
   *  UI 재렌더를 동반한 validate()도 이 경로에서만 수행한다(v1.5.1 검증 아키텍처 —
   *  updated() 경로는 base의 silent setValidity()만 수행해 Lit 중복 업데이트를 피한다). */
  private emitChange(): void {
    if (!this.novalidate) {
      this.validate();
    }
    this.dispatchEvent(new Event('change', {
      bubbles: true,
      composed: true
    }));
  }

  private handleSlotChange = (e: Event) => {
    this.cleanup(this.options);
    const slot = e.target as HTMLSlotElement;
    this.options = slot.assignedElements({ flatten: true }).filter(
      (el): el is UOption => el instanceof UOption
    );
    this.setup(this.options);
  };

  private handleOptionClick = (e: PointerEvent) => {
    if (this.readonly || this.disabled) return;

    const option = e.currentTarget as UOption;
    if (option.disabled) return;

    // 이미 선택된 라디오 재클릭은 네이티브와 동일하게 change를 발화하지 않는다.
    if (option.value === this.value) return;
    this.value = option.value;
    this.emitChange();
  };

  private handleOptionKeyDown = (e: KeyboardEvent) => {
    if (this.readonly || this.disabled) return;

    const options = this.options.filter(o => !o.disabled);
    const currentOption = e.currentTarget as UOption;
    const currentIndex = options.indexOf(currentOption);
    if (currentIndex === -1) return;

    switch (e.key) {
      case ' ':
      case 'Enter':
        e.preventDefault();
        currentOption.click();
        break;
      case 'ArrowDown':
      case 'ArrowRight': {
        e.preventDefault();
        const next = options[(currentIndex + 1) % options.length];
        next.focus();
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        const prev = options[(currentIndex - 1 + options.length) % options.length];
        prev.focus();
        break;
      }
      case 'Home': {
        e.preventDefault();
        options[0].focus();
        break;
      }
      case 'End': {
        e.preventDefault();
        options[options.length - 1].focus();
        break;
      }
    }
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-radio': URadio;
  }
}
