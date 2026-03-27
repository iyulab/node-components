import { CSSResultGroup } from 'lit';
import { property } from 'lit/decorators.js';

import { UElement } from './UElement.js';
import { styles } from './UFormControlElement.styles.js';

/**
 * 폼 컨트롤 컴포넌트의 공통 기반 클래스입니다.
 * 사용자 입력을 받는 모든 컴포넌트가 이 클래스를 확장합니다.
 */
export abstract class UFormControlElement<T> extends UElement {
  static styles: CSSResultGroup = [super.styles, styles];
  static dependencies: Record<string, typeof UElement> = {};
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
  /** 커스텀 유효성 검증 메시지 */
  @property({ type: String }) validationMessage?: string;
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

  connectedCallback(): void {
    super.connectedCallback();
    if ('attachInternals' in this) {
      this.internals = this.attachInternals();
    }
  }

  /**
   * 컴포넌트 자체 유효성을 검증하고 `invalid` 상태를 갱신합니다.
   * 각 컴포넌트가 자신의 검증 로직으로 구현합니다.
   * 
   * @returns 유효하면 `true`, 아니면 `false`
   */
  abstract validate(): boolean;

  /** 
   * 폼이 리셋될 때 호출되는 메서드입니다.
   * 각 컴포넌트가 자신의 초기 상태로 리셋하는 로직을 구현합니다.
   */
  abstract reset(): void;
}
