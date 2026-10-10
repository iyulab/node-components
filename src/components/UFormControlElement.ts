import { CSSResultGroup, PropertyValues } from 'lit';
import { property, state } from 'lit/decorators.js';

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
  /**
   * UA 가 알려 준 비활성 상태 — 조상 `<fieldset disabled>` 든 자기 `disabled` 속성이든(`formDisabledCallback`).
   * ⚠사용자의 `disabled` 를 **덮어쓰지 않고** 따로 든다: 덮어쓰면 ⑴사용자가 준 값을 잃고 ⑵반영된
   * `disabled` 속성이 스스로를 비활성으로 붙잡아 fieldset 을 다시 켜도 풀리지 않는다.
   */
  private formDisabled = false;

  /**
   * 실제로 비활성인가 — 자기 `disabled` **또는** 조상 fieldset. 렌더·상호작용은 이것을 읽는다.
   * 스타일은 같은 뜻의 표준 의사클래스 `:host(:disabled)` 를 쓴다(form-associated 요소는 둘 다에서 매칭된다).
   */
  protected get effectivelyDisabled(): boolean {
    return this.disabled || this.formDisabled;
  }

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
  /** 폼 제출 시 사용되는 값. attribute 선언 시 기본은 raw 문자열로 해석한다 —
   *  (이전의 type: Object는 JSON.parse 실패로 일반 문자열 attribute가 silently null이 되는 갭이 있었다)
   *  string이 아닌 값 타입을 갖는 컨트롤(URating/USlider/USelect multiple)은 자신의 converter로 override한다. */
  @property() value?: T;

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

  /** form-associated 표준 콜백 — 조상 fieldset 의 비활성 상태가 바뀔 때 UA 가 부른다. */
  formDisabledCallback(disabled: boolean): void {
    const old = this.formDisabled;
    this.formDisabled = disabled;
    // ⚠자기 `disabled` 속성이 바뀔 때도 불리고, 그때는 **Lit 의 update 도중**(속성 반영 순간)이다 —
    // 거기서 요청한 변경은 그 update 끝에서 지워져 재렌더가 사라진다. 현재 update 뒤에 요청한다.
    void this.updateComplete.then(() => this.requestUpdate('formDisabled', old));
  }

  constructor() {
    super();
    this.addEventListener('invalid', this.handleInvalid);
  }

  connectedCallback(): void {
    super.connectedCallback();
    if (!this.internals && 'attachInternals' in this) {
      this.internals = this.attachInternals();
    }
  }

  /** 자기 `validate()` 가 `internals.checkValidity()` 를 부르는 동안 — 그때 오는 `invalid` 는 보고가 아니다. */
  private quietCheck = false;

  /**
   * UA 가 보낸 `invalid` 에서 오류를 보인다 — 소속 `<form>` 의 제출 시도(`requestSubmit()`·제출 버튼)와
   * `form.reportValidity()` 가 이 경로다. 그러지 않으면 제출은 막히는데 어느 칸이 틀렸는지 화면에 아무것도
   * 없다. 해제는 종전대로 값이 바뀐 뒤의 `validate()` 가 한다.
   *
   * 자기 `validate()` 의 조용한 확인과 합성 이벤트는 무시한다. ⚠`invalid` 이벤트는 자기를 부른 메서드를
   * 알려 주지 않아(`checkValidity()` 도 같은 이벤트를 낸다) 페이지가 직접 부른 `form.checkValidity()` 도
   * 오류를 보인다 — 플랫폼 한계다. 조용히 확인하려면 컨트롤의 `validate(false)` 나 `u-form.validate(false)` 를 쓴다.
   */
  private handleInvalid = (e: Event): void => {
    if (this.quietCheck || !e.isTrusted) return;
    this.invalid = true;
    this.requestUpdate();
  };

  /**
   * 검증 메시지는 `setValidity()` 가 `internals` 에 적어 둔 문장이다 — 다시 그리기만 하면 옛 언어가 그대로 나온다.
   * 첫 렌더 뒤라면(검증이 참조하는 안쪽 컨트롤이 있을 때) 다시 계산하고 그린다.
   */
  protected override localeChanged(): void {
    if (this.hasUpdated) this.setValidity();
    super.localeChanged();
  }

  /**
   * 호스트에 세팅된 `aria-label`/`aria-description` 은 접근성 트리에 노출되는 노드가 아니다 —
   * 그것은 shadow DOM 안쪽의 네이티브 컨트롤이고, 섀도우 경계를 넘지 않으므로 자동으로
   * 반영되지 않는다(속성은 붙어 있는데 접근 가능한 이름이 빈 채로 남는다).
   *
   * ⚠**이 처방은 오랫동안 `u-button` 한 곳에만 있었다.** 폼 컨트롤 열 종이 같은 구조인데
   * 같은 경로가 없어서, 바깥에서 라벨을 소유하는 래퍼(`u-field`)가 슬롯된 컨트롤에 이름을
   * 줄 수단 자체가 없었다 — 라벨은 그려지는데 컨트롤은 이름이 없는 «조용한 결함» 이다.
   * ⇒ 사본을 열 벌 만드는 대신 **공통 기반에 한 번** 둔다.
   *
   * ⚠`aria-label` 은 Lit 리액티브 프로퍼티가 아니라 `observedAttributes` 에 없다 — 그 목록에
   * 없는 속성은 `attributeChangedCallback` 자체가 호출되지 않아(커스텀 엘리먼트 표준 동작)
   * 초기 렌더만 되고 연결 후 변경이 반영되지 않는다. 명시적으로 추가해야 한다.
   */
  static override get observedAttributes(): string[] {
    return [...super.observedAttributes, 'aria-label', 'aria-description'];
  }

  override attributeChangedCallback(name: string, old: string | null, value: string | null): void {
    super.attributeChangedCallback(name, old, value);
    if (name === 'aria-label' || name === 'aria-description') this.requestUpdate();
  }

  /**
   * 내부 네이티브 컨트롤에 실을 접근성 이름. 자기 `label` 이 우선이고, 없으면 호스트의
   * `aria-label` 을 쓴다 — 후자는 `u-field` 같은 «바깥 라벨 소유자» 가 채우는 경로다.
   */
  protected get resolvedAriaLabel(): string | undefined {
    return this.label ?? this.getAttribute('aria-label') ?? undefined;
  }

  /**
   * 이름을 **자기 내용에서** 얻는 컨트롤(`u-checkbox`·`u-switch`)용 축.
   *
   * 그 둘은 네이티브 `<label>` 이 컨트롤을 감싸는 구조라, 감싸개 안의 텍스트가 곧 접근성
   * 이름이다 — 그래서 위 `resolvedAriaLabel` 처럼 **무조건** 얹으면 눈에 보이는 라벨을
   * 덮어쓴다(WCAG SC 2.5.3 Label in Name). ⇒ 자기 `label` 도 슬롯 내용도 없어서 감싸개가
   * **비어 있을 때만** 호스트의 `aria-label` 을 쓴다. 전수 실측에서 라벨을 단 `u-field`
   * 안에 빈 체크박스/스위치를 넣으면 이름이 «별표 하나» 뿐이었다.
   */
  protected get contentAriaLabel(): string | undefined {
    if (this.label || this.hasSlottedLabel) return undefined;
    return this.getAttribute('aria-label') ?? undefined;
  }

  @state() protected hasSlottedLabel = false;

  /** 기본 슬롯에 실제 내용이 들어왔는지 — 공백만 있는 텍스트 노드는 내용이 아니다. */
  protected handleLabelSlotChange = (e: Event): void => {
    const slot = e.target as HTMLSlotElement;
    this.hasSlottedLabel = slot.assignedNodes({ flatten: true })
      .some((n) => (n.nodeType === Node.ELEMENT_NODE) || !!n.textContent?.trim());
  };

  /** `resolvedAriaLabel` 과 같은 규칙의 설명 축. */
  protected get resolvedAriaDescription(): string | undefined {
    return this.description ?? this.getAttribute('aria-description') ?? undefined;
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
    this.flushUpdate(); // 바로 앞의 값 변경이 안쪽 요소에 닿은 뒤에 판정한다
    this.setValidity();
    this.requestUpdate(); // 위 updated()와 동일한 이유 — invalid가 true→true로 안 바뀌어도 메시지 문구는 갱신됐을 수 있다.
    let valid = true;
    if (this.internals) {
      this.quietCheck = true;
      try {
        valid = this.internals.checkValidity();
      } finally {
        this.quietCheck = false;
      }
    }
    if (report) {
      this.invalid = !valid;
    }
    return valid;
  }

  /**
   * **이 컨트롤 하나를** 비우고 검증 상태를 지운다(지우기 버튼이 쓰는 경로). 각 컴포넌트가 구현한다.
   *
   * ⚠«폼 초기화» 와 다르다 — 폼 단위 초기화는 두 경로 모두 **처음 값으로 되돌린다**:
   * 네이티브 `form.reset()` 은 기본값(콘텐츠 속성, 아래 `formResetCallback`)으로,
   * `u-form.reset()` 은 모델 스냅샷으로.
   */
  abstract reset(): void;

  /**
   * form-associated 표준 콜백 — 소속 `<form>` 이 리셋될 때 UA 가 부른다. 네이티브 입력과 같이
   * **기본값**(콘텐츠 속성)으로 되돌린다: 비운 뒤(`reset()`) 기본값을 다시 얹는다.
   */
  formResetCallback(): void {
    this.reset();
    this.restoreDefaults();
  }

  /**
   * 기본값을 다시 얹는다. 기본은 `value` 콘텐츠 속성 — 속성이 없으면 비운 상태가 곧 기본값이다.
   * 속성값은 그 컨트롤이 선언한 변환기를 거친다(`attributeChangedCallback` 경로 — 숫자·배열 값 컨트롤도 같다).
   * 기본값이 다른 속성에 있는 컨트롤(체크형의 `checked`)은 덮어쓴다.
   */
  protected restoreDefaults(): void {
    const value = this.getAttribute('value');
    if (value !== null) this.attributeChangedCallback('value', null, value);
  }
}
