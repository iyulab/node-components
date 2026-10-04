import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../field/UField.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { UOption } from "../option/UOption.js";
import { styles } from "./URadio.styles.js";

export type RadioType = "default" | "button";
/** 외형 정도 — `solid` 선택 칸 채움(기본) · `outlined` · `soft`(버튼형 전용 — 세그먼트 컨트롤). */
export type RadioAppearance = "solid" | "outlined" | "soft";
export type RadioOrientation = "vertical" | "horizontal";

/**
 * 여러 라디오 버튼 중 하나를 선택하는 라디오 그룹 컴포넌트입니다.
 *
 * @slot - u-option 아이템
 * 
 * @csspart field - u-field 요소
 * @csspart container - 옵션들을 감싸는 컨테이너
 * 
 * @cssprop --radio-color - 선택 상태의 기준색 (기본: --u-primary-color)
 * @cssprop --radio-color-active - 선택 상태 active 톤 (기본: --radio-color 85% + black)
 *
 * @event change - 사용자 상호작용(옵션 클릭·키보드)으로 선택 값이 변경될 때 발생.
 *   네이티브 라디오와 동일하게 프로그램적 value 세팅·옵션 등록으로는 발화하지 않는다.
 */
@customElement('u-radio')
export class URadio extends UFormControlElement<string> {
  static styles = [ super.styles, styles ];

  /** 라디오 유형 */
  @property({ type: String, reflect: true }) type: RadioType = "default";
  /**
   * 외형 정도. `soft` 는 `type="button"` 전용 — 옅은 트랙 위에서 선택된 칸만 표면으로 떠오르는
   * **세그먼트 컨트롤** 모양이다(보기 전환·수준 선택처럼 화면의 «모드»를 고를 때).
   */
  @property({ type: String, reflect: true }) appearance: RadioAppearance = "solid";
  /** 배치 방향 */
  @property({ type: String, reflect: true }) orientation: RadioOrientation = "vertical";

  @state() private options: UOption[] = [];

  disconnectedCallback(): void {
    this.cleanup(this.options);
    super.disconnectedCallback();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (['type','disabled','formDisabled','readonly'].some(k => changedProperties.has(k))) {
      this.options.forEach(option => {
        option.marker = this.type === 'button' ? undefined : 'radio';
        option.disabled = this.effectivelyDisabled || this.readonly;
      });
    }
    if (['value','options'].some(k => changedProperties.has(k))) {
      this.onChangeValue();
    }
    this.updateRoving();
  }

  /**
   * 로빙 tabindex — 라디오 그룹은 Tab 이 한 번만 멈춘다(선택된 옵션, 없으면 첫 활성 옵션).
   * 그룹 안의 이동은 화살표가 한다(WAI-ARIA APG Radio Group · 네이티브 라디오와 같다).
   */
  private tabStop(): UOption | undefined {
    return this.options.find(o => o.value === this.value && !o.disabled)
      ?? this.options.find(o => !o.disabled);
  }

  private updateRoving() {
    const stop = this.tabStop();
    this.options.forEach(o => o.setAttribute('tabindex', o === stop ? '0' : '-1'));
  }

  render() {
    return html`
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.effectivelyDisabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="container" part="container"
          role="radiogroup"
          aria-disabled=${ifDefined(this.effectivelyDisabled ? 'true' : undefined)}
          aria-label=${ifDefined(this.resolvedAriaLabel)}
          aria-description=${ifDefined(this.resolvedAriaDescription)}>
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

  /** 그룹의 탭 정지점으로 위임한다 — 선택된 옵션, 없으면 첫 활성 옵션(`updateRoving` 과 같은
   *  대상). Tab 으로 들어올 때와 프로그램으로 포커스할 때 같은 옵션에 닿는다(네이티브 라디오와 같다).
   *  옵션 자신이 host 에 실제 tabindex 를 갖는 커스텀 엘리먼트라 `UOption.focus()` 가 이미 동작한다. */
  public focus(options?: FocusOptions): void {
    this.tabStop()?.focus(options);
  }

  public blur(): void {
    (this.shadowRoot?.activeElement as HTMLElement | null)?.blur();
  }

  private setup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeyDown);
      option.addEventListener('click', this.handleOptionClick);
      option.addEventListener('keydown', this.handleOptionKeyDown);
      option.selected = option.value === this.value;
      option.marker = this.type === 'button' ? undefined : 'radio';
      option.disabled = this.effectivelyDisabled || this.readonly;
    }
    this.updateRoving();
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
    if (this.readonly || this.effectivelyDisabled) return;

    const option = e.currentTarget as UOption;
    if (option.disabled) return;

    // 이미 선택된 라디오 재클릭은 네이티브와 동일하게 change를 발화하지 않는다.
    if (option.value === this.value) return;
    this.value = option.value;
    this.emitChange();
  };

  /** 화살표·Home·End 는 포커스와 선택을 함께 옮긴다 — 네이티브 라디오와 APG 라디오 그룹의 동작. */
  private moveTo(option: UOption) {
    option.focus();
    if (option.value === this.value) return;
    this.value = option.value;
    this.emitChange();
  }

  private handleOptionKeyDown = (e: KeyboardEvent) => {
    if (this.readonly || this.effectivelyDisabled) return;

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
        this.moveTo(options[(currentIndex + 1) % options.length]);
        break;
      }
      case 'ArrowUp':
      case 'ArrowLeft': {
        e.preventDefault();
        this.moveTo(options[(currentIndex - 1 + options.length) % options.length]);
        break;
      }
      case 'Home': {
        e.preventDefault();
        this.moveTo(options[0]);
        break;
      }
      case 'End': {
        e.preventDefault();
        this.moveTo(options[options.length - 1]);
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
