import { html, PropertyValues } from "lit";
import { customElement, property, query } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../field/UField.js';
import '../icon/UIcon.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { styles } from "./UFileInput.styles.js";

import { delegate } from "../../utilities/listenInShadow.js";
/**
 * 파일 선택 입력 컴포넌트입니다. 네이티브 `<input type="file">`를 감싸
 * 디자인시스템 톤의 트리거 버튼 + 선택 결과 표시로 렌더링합니다.
 *
 * 값은 항상 `File[] | null`입니다 — `multiple`이 꺼져 있어도 선택된 파일은
 * 배열(0개 또는 1개)로 담깁니다. 폼 제출 시 파일이 1개면 그 `File`을,
 * 여러 개면 같은 `name`으로 반복 append한 `FormData`를 `ElementInternals`에
 * 전달합니다 — 네이티브 `<input type="file" multiple>`과 같은 제출 형태입니다.
 *
 * @csspart field - u-field 요소
 * @csspart container - 트리거·상태 텍스트·지우기 버튼을 감싸는 컨테이너
 * @csspart trigger - 파일 선택 트리거 버튼
 * @csspart status - 선택 상태 텍스트("선택된 파일 없음" · 파일명 · "N개 파일 선택됨")
 * @csspart clear-button - 선택 해제 버튼(u-icon)
 * @csspart input - 숨겨진 네이티브 `<input type="file">`
 *
 * @cssprop --u-file-input-display - 호스트의 display (기본값: inline-block)
 * @cssprop --u-file-input-width - 호스트의 width (기본값: auto)
 *
 * @event change - 선택된 파일이 바뀔 때 발생(선택·지우기 공통)
 */
@customElement('u-file-input')
export class UFileInput extends UFormControlElement<File[] | null> {
  static styles = [ super.styles, styles ];
  protected static override fieldBox = true;

  /** 값은 attribute로 표현될 수 없다 — 항상 프로그램적으로만 설정된다. */
  @property({ attribute: false }) value: File[] | null = null;
  /** 선택 가능한 파일 형식을 제한한다(네이티브 `accept` 속성 그대로 통과). */
  @property({ type: String }) accept?: string;
  /** 여러 파일을 한 번에 선택할 수 있는지 여부. */
  @property({ type: Boolean, reflect: true }) multiple: boolean = false;
  /**
   * 파일 대신 폴더를 고른다 — 안쪽 입력에 `webkitdirectory` 를 건다(모든 주요 브라우저가 지원). 고른 폴더 아래 파일 전부가
   * `value` 에 담기고 각 `File` 의 `webkitRelativePath` 가 폴더 기준 상대 경로다. 폴더 하나가 여러 파일이므로 `multiple` 을
   * 함의한다. 브라우저는 폴더 모드에서 `accept` 를 쓰지 않는다 — 걸러야 하면 `change` 에서 `value` 를 거른다.
   */
  @property({ type: Boolean, reflect: true }) directory: boolean = false;

  @query('.trigger', true) triggerEl?: HTMLButtonElement;
  @query('input[type="file"]', true) inputEl?: HTMLInputElement;

  /** `value`가 바뀌는 모든 경로(선택·지우기)에서 폼 제출값을 동기화한다 —
   *  `UInput`/`UCheckbox`와 같은 경계. 파일은 문자열로 표현할 수
   *  없으므로 1개면 `File`을, 여러 개면 같은 키로 반복 append한 `FormData`를
   *  넘긴다 — 네이티브 `<input type="file" multiple>`의 제출 형태와 동일하다. */
  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);
    if (changedProperties.has('value')) {
      this.syncFormValue();
      // 바깥에서 비우면(`value = null`·빈 배열) 안쪽 입력도 비운다 — `reset()` 과 같은 결과. 남겨 두면 같은 파일을 다시
      // 고를 때 브라우저가 `change` 를 내지 않아 아무 일도 일어나지 않는다. 반대 방향(코드가 파일을 넣기)은 브라우저가 막는다.
      if ((!this.value || this.value.length === 0) && this.inputEl?.value) this.inputEl.value = '';
    }
  }

  private syncFormValue(): void {
    const files = this.value ?? [];
    if (files.length === 0) {
      this.internals?.setFormValue(null);
    } else if (files.length === 1) {
      this.internals?.setFormValue(files[0]);
    } else {
      const fd = new FormData();
      for (const file of files) {
        fd.append(this.name ?? '', file);
      }
      this.internals?.setFormValue(fd);
    }
  }

  /**
   * 이 컨트롤의 포커스 대상은 값을 담는 입력이 아니라 **파일 선택 버튼**이다. 그래서 바깥
   * 라벨을 그대로 `aria-label` 로 얹으면 버튼의 보이는 글자("파일 선택")가 접근성 이름에서
   * 사라진다 — WCAG SC 2.5.3 Label in Name 위반이고, 음성 조작 사용자가 보이는 글자로
   * 그 버튼을 부를 수 없게 된다. ⇒ **덮지 않고 합성한다**: 보이는 글자를 **앞에** 두고
   * 라벨을 맥락으로 덧붙인다(이름이 보이는 글자를 담으므로 2.5.3 을 만족하고, 같은 화면에
   * 파일 선택 버튼이 여럿일 때 서로 구분된다).
   *
   * 라벨이 없으면 아무것도 얹지 않는다 — 버튼의 보이는 글자가 곧 이름이다.
   */
  private get triggerAriaLabel(): string | undefined {
    const label = this.resolvedAriaLabel;
    return label ? `${this.triggerText}, ${label}` : undefined;
  }

  private get triggerText(): string {
    return Locale.getValue(this.directory ? 'chooseFolder' : 'chooseFile');
  }

  /** 폴더 모드의 상태 글자 — 고른 폴더 이름(상대 경로의 첫 마디)과 파일 수. 경로가 없으면(코드가 넣은 값) 파일 모드의 글자로. */
  private statusText(files: File[]): string {
    if (files.length === 0) return Locale.getValue('noFileChosen');
    const folder = this.directory ? files[0].webkitRelativePath?.split('/')[0] : '';
    if (folder) return Locale.getValue('folderSelected', { name: folder, count: files.length });
    return files.length === 1 ? files[0].name : Locale.getValue('filesSelected', { count: files.length });
  }

  render() {
    const files = this.value ?? [];
    const hasFiles = files.length > 0;
    const status = this.statusText(files);

    return html`
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.effectivelyDisabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .descriptionDisplay=${this.descriptionDisplay}
        .validationMessage=${this.validationMessage}
      >
        <div class="container" part="container">
          <button class="trigger" part="trigger"
            type="button"
            aria-label=${ifDefined(this.triggerAriaLabel)}
            ?disabled=${this.effectivelyDisabled || this.readonly}
            @click=${this.handleTriggerClick}
          >${this.triggerText}</button>

          <span class="status" part="status" ?data-empty=${!hasFiles}>${status}</span>

          <u-icon class="clear-btn" part="clear-button"
            ?hidden=${!hasFiles || this.effectivelyDisabled || this.readonly}
            role="button"
            tabindex="0"
            aria-label=${Locale.getValue('clear')}
            lib="internal"
            name="x"
            ${delegate('click', this.handleClearButtonClick)}
            @keydown=${this.handleClearButtonKeydown}
          ></u-icon>

          <input class="native-input" part="input"
            type="file"
            hidden
            name=${ifDefined(this.name)}
            accept=${ifDefined(this.accept)}
            ?multiple=${this.multiple || this.directory}
            ?webkitdirectory=${this.directory}
            ?disabled=${this.effectivelyDisabled || this.readonly}
            @change=${this.handleInputChange}
          />
        </div>
      </u-field>
    `;
  }

  protected setValidity(): void {
    const missing = this.required && (!this.value || this.value.length === 0);
    this.commit(
      missing ? { valueMissing: true } : {},
      missing ? Locale.getValue('valueMissing') : '',
      this.triggerEl ?? undefined,
    );
  }

  public reset(): void {
    this.value = null;
    this.invalid = false;
    if (this.inputEl) this.inputEl.value = '';
  }

  public focus(options?: FocusOptions): void {
    this.triggerEl?.focus(options);
  }

  public blur(): void {
    this.triggerEl?.blur();
  }

  private handleTriggerClick = (e: MouseEvent) => {
    e.stopImmediatePropagation();
    if (this.effectivelyDisabled || this.readonly) return;
    this.inputEl?.click();
  }

  private handleInputChange = (e: Event) => {
    const input = e.target as HTMLInputElement;
    this.value = input.files && input.files.length > 0 ? Array.from(input.files) : null;

    if (!this.novalidate) {
      this.validate();
    }
    this.relay(e);
  }

  private handleClearButtonClick = (e: PointerEvent) => {
    e.stopImmediatePropagation();
    this.reset();
    // 선택 경로(handleInputChange)와 같은 "값이 바뀌었다" 신호를 여기서도 낸다 —
    // input 이벤트 하나만 구독하는 소비자도 클리어를 감지한다(UInput 의 clearable 과
    // 같은 경계). change는 그 위에 "상호작용이 끝났다"는 신호로 겸용 유지.
    this.dispatchEvent(new InputEvent('input', { bubbles: true, composed: true }));
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
    this.focus();
  }

  /** `clear-btn`은 순수 표시 요소(`u-icon`)라 네이티브 키보드 활성화가 없다 —
   *  `role="button"`+`tabindex="0"`로 포커스 가능하게 한 뒤, Enter/Space를 같은
   *  클릭 핸들러로 릴레이한다(`UInput.handleSuffixIconKeydown`과 같은 패턴). */
  private handleClearButtonKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.handleClearButtonClick(e as unknown as PointerEvent);
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-file-input': UFileInput;
  }
}
