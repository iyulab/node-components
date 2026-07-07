import { CSSResultGroup, PropertyValues } from 'lit';
import { property } from 'lit/decorators.js';

import { UElement } from './UElement.js';
import { styles } from './UFormControlElement.styles.js';

/**
 * 폼 컨트롤 컴포넌트의 공통 기반 클래스입니다.
 * 사용자 입력을 받는 모든 컴포넌트가 이 클래스를 확장합니다.
 */
export abstract class UFormControlElement<T> extends UElement {
  static styles: CSSResultGroup = [super.styles, styles];
  static formAssociated = true;

  /** 비활성 상태 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 읽기 전용 상태 */
  @property({ type: Boolean, reflect: true }) readonly: boolean = false;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효성 검증 실패 상태 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 값 변경시 자동 유효성 검증 여부 */
  @property({ type: Boolean }) novalidate: boolean = false;
  /** 필드 라벨 */
  @property({ type: String }) label?: string;
  /** 보조 설명 텍스트 */
  @property({ type: String }) description?: string;
  /** 폼 제출 시 사용되는 이름 */
  @property({ type: String }) name?: string;
  /** 폼 제출 시 사용되는 값 */
  @property({ type: Object }) value?: T;

  /**
   * ElementInternals는 폼과의 연동, 유효성 검사 상태 관리 등을 지원하는 네이티브 API입니다.
   */
  protected internals?: ElementInternals;

  /**
   * 폼과의 연동을 위해 `form` 속성을 제공합니다. ElementInternals를 지원하는 브라우저에서 폼 요소에 접근할 수 있습니다.
   * 지원하지 않는 브라우저에서는 null을 반환합니다.
   */
  get form(): HTMLFormElement | null {
    return this.internals?.form ?? null;
  }

  /**
   * 각 컴포넌트가 자신의 검증 로직으로 validity 상태를 갱신하면, 이 객체를 통해 유효성 상태를 확인할 수 있습니다.
   * ElementInternals를 지원하지 않는 브라우저에서는 undefined를 반환합니다.
   */
  get validity(): ValidityState | undefined {
    return this.internals?.validity;
  }

  /**
   * 지금 `internals`에 설정된 유효성 메시지입니다. `setValidity()`가 계산한 값을
   * 그대로 반영하는 읽기 전용 파생값이며, 별도로 저장하지 않는다.
   * ElementInternals를 지원하지 않는 브라우저에서는 빈 문자열을 반환한다.
   */
  get validationMessage(): string {
    return this.internals?.validationMessage ?? '';
  }

  /** `setCustomValidity()`로 주입된 커스텀 메시지. 비어있으면 커스텀 메시지가 없는 상태. */
  private customMessage = '';

  /**
   * 네이티브 `HTMLInputElement.setCustomValidity()`와 동일한 API입니다.
   * 상태(및 `internals`)만 갱신할 뿐 화면은 건드리지 않는다 — UI 반영은 항상 `validate()`의 몫이다.
   * 빈 문자열을 넘기면 해제되어 원래 자동 계산된 메시지로 돌아간다.
   */
  public setCustomValidity(message: string): void {
    this.customMessage = message;
    this.setValidity();
  }

  /**
   * 각 컴포넌트의 `setValidity()`가 계산한 flags/message를 `internals.setValidity()`로
   * 반영하는 공통 헬퍼입니다. `setCustomValidity()`로 커스텀 메시지가 주입돼 있으면
   * 네이티브와 동일하게 그 메시지가 다른 모든 검증 결과보다 우선한다.
   */
  protected commit(flags: ValidityStateFlags, message: string, anchor?: HTMLElement): void {
    if (this.customMessage) {
      this.internals?.setValidity({ customError: true }, this.customMessage, anchor);
    } else {
      this.internals?.setValidity(flags, message, anchor);
    }
  }

  connectedCallback(): void {
    super.connectedCallback();
    if ('attachInternals' in this) {
      this.internals = this.attachInternals();
    }
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    // internals.setValidity()는 갱신하되, 화면의 validationMessage 재렌더는 강제하지 않는다 —
    // 재렌더가 필요하면 validate()를 호출하는 쪽(blur 등)에서 명시적으로 처리한다.
    if (this.shouldValidate(changedProperties)) {
      this.setValidity();
    }
  }

  /**
   * 어떤 속성이 바뀌었을 때 `setValidity()`를 다시 호출할지 결정합니다.
   * 기본값은 `value`/`required`. `checked`처럼 다른 속성으로 상태를
   * 표현하는 컴포넌트는 override합니다 (`super.shouldValidate(changed) || changed.has('checked')`).
   */
  protected shouldValidate(changed: PropertyValues): boolean {
    return changed.has('value') || changed.has('required');
  }

  /**
   * 지금 상태를 검증해 `internals.setValidity(flags, message, anchor)`를 호출합니다.
   * 각 컴포넌트가 자신의 검증 규칙과 메시지 조회(`Locale.getValue()`)를 직접 구현합니다.
   */
  protected abstract setValidity(): void;

  /**
   * 컴포넌트 자체 유효성을 검증합니다.
   *
   * @param report `true`(기본값)면 `invalid` 상태(및 에러 메시지 표시)를 갱신한다.
   *   `false`면 화면에 아무 영향 없이 유효 여부만 조용히 확인한다 — 네이티브
   *   `checkValidity()`(조용히 확인) vs `reportValidity()`(UI 갱신)와 같은 관계.
   * @returns 유효하면 `true`, 아니면 `false`
   */
  public validate(report: boolean = true): boolean {
    this.setValidity();
    this.requestUpdate(); // 위 updated()와 동일한 이유 — invalid가 true→true로 안 바뀌어도 메시지 문구는 갱신됐을 수 있다.
    const valid = this.internals ? this.internals.checkValidity() : true;
    if (report) {
      this.invalid = !valid;
    }
    return valid;
  }

  /**
   * 폼이 리셋될 때 호출되는 메서드입니다.
   * 각 컴포넌트가 자신의 초기 상태로 리셋하는 로직을 구현합니다.
   */
  abstract reset(): void;
}
