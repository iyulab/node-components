import { html, nothing, PropertyValues } from "lit";
import { customElement, property } from "lit/decorators.js";
import { isFocusable } from "tabbable";

import { UElement } from "../UElement.js";
import { devWarnOnce } from "../../utilities/devWarning.js";
import { styles } from "./UField.styles.js";

/** 네이티브로 «폼 컨트롤이거나 포커스를 받도록 저작된» 태그 — 가시성과 무관한 구조 사실이다. */
const NATIVE_CONTROL_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA', 'BUTTON']);

/**
 * **구조상** 폼 컨트롤인가 — `UField.hasControlInSubtree` 가 쓰는 술어.
 * `isFocusable()`(tabbable)과 달리 **렌더 여부도 `disabled` 도 보지 않는다**: 숨겨진 폼도,
 * 비활성 입력도 «라벨이 가리킬 대상» 이라는 사실은 같다. 근거는 `hasControlInSubtree` 주석.
 */
function isFormControlByStructure(node: Element): boolean {
  if ((node.constructor as { formAssociated?: boolean }).formAssociated === true) return true;
  if (NATIVE_CONTROL_TAGS.has(node.tagName)) return true;
  if (node.tagName === 'A' && node.hasAttribute('href')) return true;
  if (node.hasAttribute('tabindex')) return true;                 // u-select 트리거 · u-slider thumb · u-rating 심볼
  if (node.hasAttribute('contenteditable')) return true;
  return false;
}

/**
 * 폼 컨트롤의 공통 레이아웃을 제공하는 필드 컴포넌트입니다.
 * 라벨, 필수 표시, 설명 텍스트, 유효성 검사 메시지를 포함합니다.
 *
 * @slot - 폼 컨트롤 (input, select, textarea 등)
 * @slot label-aside - 라벨 오른쪽 슬롯 영역 (숫자 표시, 알림 등)
 */
@customElement('u-field')
export class UField extends UElement {
  static styles = [super.styles, styles];

  /** 비활성화 여부 */
  @property({ type: Boolean, reflect: true }) disabled: boolean = false;
  /** 필수 입력 여부 */
  @property({ type: Boolean, reflect: true }) required: boolean = false;
  /** 유효성 검사 실패 상태 */
  @property({ type: Boolean, reflect: true }) invalid: boolean = false;
  /** 라벨 텍스트 */
  @property({ type: String }) label?: string;
  /** 하단 설명 텍스트 */
  @property({ type: String }) description?: string;
  /**
   * 유효성 검사 실패 시 표시할 메시지.
   *
   * ⚠**속성 이름을 명시한다.** Lit 의 기본 속성명은 프로퍼티명을 **소문자화**한 것이라
   * (kebab 이 아니다) 그대로 두면 `validationmessage` 가 되는데, 문서·샘플·소비 코드가
   * 전부 `validation-message` 로 적고 있었고 그 형태는 **아무것도 설정하지 않았다**.
   * 형제 프로퍼티들도 명시형을 쓴다(`show-delay`·`hide-delay`).
   */
  @property({ type: String, attribute: 'validation-message' }) validationMessage?: string;

  render() {
    return html`
      <div class="header" ?hidden=${!this.label}>
        <label class="label" @click=${this.handleLabelClick}>
          <span class="required" ?hidden=${!this.required}>*</span>
          ${this.label}
        </label>
        <slot name="label-aside"></slot>
      </div>

      <slot></slot>

      ${this.renderFooter()}
    `;
  }

  private renderFooter() {
    const message = this.invalid && this.validationMessage
      ? this.validationMessage
      : this.description;
    if (!message) return nothing;
    return html`<div class="footer">${message}</div>`;
  }

  /** 슬롯에 꽂힌 첫 포커스 가능 자식으로 위임한다 — 라벨 클릭과 같은 대상 탐색 로직을
   *  공개 API로도 노출해, 소비자가 임의의 폼 컨트롤(자체 웹 컴포넌트가 아닌 것 포함)을
   *  슬롯에 꽂아도 host의 `.focus()`가 `UInput.focus()`와 같은 계약으로 동작하게 한다. */
  public focus(options?: FocusOptions): void {
    this.focusTarget?.focus(options);
  }

  private get assignedRoots(): Element[] {
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    return slot?.assignedElements({ flatten: true }) || [];
  }

  /**
   * 포커스 대상은 **감싸개 안쪽까지** 본다. 이 패키지의 폼 컨트롤들은 자기 내부 `u-field` 에
   * `<div class="container">` 를 슬롯하고 진짜 `<input>` 은 그 안에 있다 — 최상위만 보면
   * *라이브러리 자신의 정상 사용*이 «컨트롤 없음» 이 된다(첫 판이 실제로 그렇게 오탐했다).
   */
  private get focusTarget(): HTMLElement | null {
    const named = this.controlToName;
    if (named) return named;
    for (const root of this.assignedRoots) {
      if (isFocusable(root)) return root as HTMLElement;
      const inner = Array.from(root.querySelectorAll('*')).find((n) => isFocusable(n));
      if (inner) return inner as HTMLElement;
    }
    return null;
  }

  /**
   * 라벨이 가리키는 대상 — `focus()` 와 접근성 이름 부여가 **같은 것**을 골라야 한다.
   *
   * 🔴**`isFocusable()` 만으로는 이 리포의 주된 사용 형태를 통째로 놓친다.** `tabbable` 은
   * 기본적으로 섀도우 루트를 들여다보지 않으므로 `<u-input>` 같은 커스텀 엘리먼트 호스트에
   * `false` 를 돌려준다(실측: `isFocusable(u-input)=false` · `isFocusable(<input>)=true`).
   * ⇒ 종전 `focus()` 는 **네이티브 엘리먼트를 슬롯한 경우에만** 동작했고, 레퍼런스 문서가
   * 가르치는 `u-*` 컨트롤 형태에서는 라벨 클릭이 **조용히 아무 일도 하지 않았다.**
   *
   * ⇒ 판정을 «포커스 가능» 하나가 아니라 **«폼 컨트롤인가»** 로 넓힌다: 네이티브로 포커스
   * 가능하거나, **form-associated 커스텀 엘리먼트**(`static formAssociated = true` — 이
   * 패키지의 `UFormControlElement` 전부가 그렇다)이면 대상이다. 섀도우를 파고들어 안쪽
   * 네이티브 노드를 잡지는 않는다 — 그것은 컨트롤 자신의 API 를 우회하는 것이고, 그쪽이
   * 다시 렌더하면 우리가 얹은 속성이 지워진다.
   */
  private get controlToName(): HTMLElement | null {
    for (const node of this.assignedRoots) {
      const formAssociated = (node.constructor as { formAssociated?: boolean }).formAssociated === true;
      if (formAssociated || isFocusable(node)) return node as HTMLElement;
    }
    return null;
  }

  /**
   * 🔴**«이 필드가 이름 줄 컨트롤을 가졌는가» 는 «지금 포커스 가능한가» 와 다른 질문이다 —
   * 그 둘을 한 술어로 답한 것이 결함이었다.**
   *
   * 종전 경고는 `focusTarget`(위)의 부재로 판정했는데, 그 게터는 후보를 `isFocusable()` 로
   * 고르고 **`tabbable` 의 기본 `displayCheck` 는 렌더 여부를 본다.** ⇒ 닫힌 `u-drawer`·
   * 접힌 아코디언·비활성 탭 패널·마법사의 다음 단계처럼 **`display:none` 하위에서 처음
   * 렌더되면 정상 컨트롤이 «없는 것» 이 된다**(실측: `<u-input label="X">` 가 숨겨져 있기만
   * 하면 발화 · 같은 마크업이 보이면 침묵). 그 셋은 이 스택이 겨냥한 LOB 화면형 그 자체다.
   *
   * ⚠**그리고 오탐보다 그 다음이 나쁘다** — `devWarnOnce` 는 키당 한 번이라 오탐이 먼저 나면
   * 뒤이은 **진짜 위반이 조용히 억제된다.** 이 리포가 반복 기록한 *«초록으로 틀린 말»* 이
   * 여기서는 «침묵으로 틀린 말» 이 된다. (키 세분화는 아래 `nameSlottedControl` 참조.)
   *
   * ⇒ 판정은 **구조로만** 한다: form-associated 커스텀 엘리먼트 · 네이티브 폼/포커스 태그 ·
   * `tabindex` · `contenteditable`. **가시성도 `disabled` 도 보지 않는다** — 비활성 입력도
   * 라벨이 가리키는 대상이고, 숨겨진 폼도 구조는 같다.
   * ⚠`focusTarget` 은 **그대로 `isFocusable` 을 쓴다** — `focus()` 위임에서는 «지금 포커스
   * 가능한가» 가 맞는 질문이다. 두 게터가 같은 술어를 공유한 것이 원인이었다.
   */
  private get hasControlInSubtree(): boolean {
    for (const root of this.assignedRoots) {
      if (isFormControlByStructure(root)) return true;
      if (Array.from(root.querySelectorAll('*')).some(isFormControlByStructure)) return true;
    }
    return false;
  }

  protected firstUpdated(changed: PropertyValues): void {
    super.firstUpdated(changed);
    const slot = this.shadowRoot?.querySelector('slot:not([name])') as HTMLSlotElement | null;
    slot?.addEventListener('slotchange', () => this.nameSlottedControl());
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('label') || changed.has('description')) this.nameSlottedControl();
  }

  /**
   * 🔴**이 컴포넌트의 존재 이유가 «라벨과 컨트롤을 한 칸으로 짝짓는 것»인데, 오랫동안
   * 라벨을 «그리기만» 하고 연결하지 않았다** — 섀도의 `label` 에 `for` 가 없고 슬롯된
   * 컨트롤의 `id`·`aria-label`·`aria-labelledby` 가 전부 빈 채였다 — 라벨을 가진 폼 한 장이
   * 통째로 «이름 없는 입력» 이 된다. 화면은 멀쩡하고 콘솔도 조용해서 **시각 사용자에게는
   * 아무 신호가 없다.**
   *
   * ⚠**`aria-labelledby` 로 잇지 않는다 — 섀도우 경계를 넘지 못한다.** 그 대신 «문자열
   * 복사»를 슬롯 호스트의 `aria-label` 로 얹고, 폼 컨트롤 쪽이 그것을 내부 네이티브
   * 컨트롤로 내려보낸다(`UFormControlElement.resolvedAriaLabel` — `u-button` 이 먼저 채택한
   * 처방을 공통 기반으로 올린 것). 네이티브 엘리먼트를 슬롯한
   * 경우에는 그 호스트가 곧 컨트롤이라 같은 한 줄이 그대로 듣는다.
   *
   * ⚠**자기 이름을 이미 가진 컨트롤은 건드리지 않는다** — 그쪽이 더 구체적이고,
   * 덮으면 눈에 보이는 라벨과 접근성 이름이 어긋난다(WCAG 2.5.3 Label in Name).
   *
   * ⚠**경고 키에 라벨을 넣는다 — 형제 경고들이 이미 그렇게 한다.** 종전 키는 평평한
   * `field-no-control` 하나여서 **페이지당 한 번**만 발화했고, 그래서 위반이 여럿이면
   * 첫 하나만 보인다. `u-icon` 은 `icon:${lib}:${name}`, `u-split-panel` 은
   * `split-panel:${id}` 로 이미 구분된 키를 쓴다 — 그리고 `u-icon` 의 경고가 태어난 계기가
   * 정확히 *"메뉴 30개가 한꺼번에 틀렸는데 신호가 0"* 이었다. 같은 부류에 같은 처방을 한다.
   * (메시지 문안은 그대로다 — 키는 중복 제거 단위일 뿐 공개 표면이 아니다.)
   */
  private nameSlottedControl(): void {
    const control = this.controlToName;
    if (!control) {
      // ⚠경고는 «이름을 못 줬다» 가 아니라 «가리킬 것이 아예 없다» 일 때만 낸다 —
      //   감싸개 안쪽에 컨트롤이 있으면 정상 구성이다(위 hasControlInSubtree 주석 참조).
      if (this.label && !this.hasControlInSubtree) {
        devWarnOnce(`field-no-control:${this.label}`, `u-field label="${this.label}" has no form control in its default slot — the label names nothing. Slot a form control, or drop the label.`);
      }
      return;
    }

    const ownsItsName = !!(control as { label?: string }).label
      || control.hasAttribute('aria-labelledby')
      || (control.hasAttribute('aria-label') && control.getAttribute('aria-label') !== this.lastAppliedLabel);

    if (ownsItsName) {
      if (this.label && (control as { label?: string }).label) {
        devWarnOnce(`field-double-label:${this.label}`, `u-field label="${this.label}" wraps a control that also sets label="${(control as { label?: string }).label}" — the label renders twice. Set it on one of them.`);
      }
      return;
    }

    if (this.label) {
      control.setAttribute('aria-label', this.label);
      this.lastAppliedLabel = this.label;
    } else if (this.lastAppliedLabel !== undefined) {
      control.removeAttribute('aria-label');
      this.lastAppliedLabel = undefined;
    }

    if (this.description) control.setAttribute('aria-description', this.description);
    else if (control.getAttribute('aria-description') === this.lastAppliedDescription) control.removeAttribute('aria-description');
    this.lastAppliedDescription = this.description;
  }

  /** 우리가 얹은 값인지 소비자가 준 값인지 가르기 위한 표식 — 소비자 값을 덮지 않는다. */
  private lastAppliedLabel?: string;
  private lastAppliedDescription?: string;

  private handleLabelClick = () => {
    this.focus();
  };
}

declare global {
  interface HTMLElementTagNameMap {
    'u-field': UField;
  }
}

