import { html, nothing, PropertyValues } from "lit";
import type { FieldAppearance, FieldSize } from '../input/UInput.js';
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../field/UField.js';
import '../icon/UIcon.js';
import '../spinner/USpinner.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { CharsWidthController } from "../../utilities/chars.js";
import { CompositionTracker } from "../../utilities/composition.js";
import { isImeComposing } from "../../utilities/keyboard.js";
// 부수효과 import — 이 모듈이 그리는 `<u-chip>` 을 등록한다(타입만 가져오면 빌드가 import 를 지워 등록되지 않는다).
import "../chip/UChip.js";
import type { UChip } from "../chip/UChip.js";
import { UOption } from "../option/UOption.js";
import { UOptionGroup, collectOptions } from "../option-group/UOptionGroup.js";
// 부수효과 import — 이 모듈이 그리는 `<u-popover>` 을 등록한다(타입으로만 가져오면 빌드가 import 를 지운다 — 데코레이터 메타데이터가 우연히 붙잡고 있었다).
import "../popover/UPopover.js";
import type { UPopover } from "../popover/UPopover.js";
import { styles } from "./USelect.styles.js";


/**
 * 드롭다운 목록에서 값을 선택하는 폼 컨트롤 컴포넌트입니다.
 * 단일 선택 및 다중 선택, 검색 기능을 지원합니다.
 *
 * @slot - u-option 아이템
 * @slot display - 트리거에 표시할 콘텐츠를 직접 지정. 비워두면 선택값 텍스트를 자동 생성해 보여준다.
 *   (u-option을 그대로 옮겨 꽂을 수는 없다 — 하나의 노드는 slot에 동시에 두 곳 렌더링될 수 없어서
 *   팝오버 목록에서 사라지기 때문. 리치 콘텐츠가 필요하면 이 slot에 별도 마크업을 할당하고
 *   `change` 이벤트에서 직접 갱신한다.)
 *
 * 옵션 목록 팝오버가 열려 있는 동안 `:state(open)` 커스텀 상태를 노출한다(via
 * `ElementInternals.states`) — `u-select:state(open)::part(container)`로 스타일링할 수
 * 있다. 공개 속성으로 반사되지 않는다.
 *
 * @csspart field - u-field 요소
 * @csspart container - 트리거 영역을 감싸는 요소
 * @csspart popover - 옵션 목록이 표시되는 팝오버 요소
 * @csspart search-input - 검색 가능일 때 트리거 안의 검색 입력(콤보박스 자신)
 * @csspart no-matches - 검색어에 맞는 옵션이 없을 때의 «일치하는 항목 없음» 상태 줄
 * 
 * @cssprop --u-select-display - 호스트의 display (기본값: inline-block). 폼/그리드 셀에서
 *   컨테이너 폭을 채우려면 `block`으로 지정한다.
 * @cssprop --u-select-width - 호스트의 width (기본값: auto). flex 컨테이너처럼 block만으로는
 *   늘어나지 않는 맥락에서 `100%`로 지정한다.
 * @cssprop --select-min-text - 표시 글자 영역의 최소 폭 (기본값: 4ch). 지우기·펼침 화살표가 좁은 칸을 나눠도 글자가 0 으로
 *   접히지 않는다 — 그보다 좁으면 칸이 호스트 밖으로 넘친다(보이는 실패).
 * @cssprop --select-popover-width - 팝오버의 너비 (기본값: 앵커(트리거) 너비, strategy와 무관하게 동일).
 *   옵션 텍스트가 길어도 이 값을 넘겨 넓어지지 않으며, 넘치는 텍스트는 UOption에서 ellipsis 처리된다.
 * @cssprop --select-popover-min-height - 팝오버의 최소 높이 (기본값: 0px)
 * @cssprop --select-popover-max-height - 팝오버의 최대 높이 (기본값: 50vh)
 * 
 * @event change - 사용자 상호작용(옵션 클릭·칩 제거·지우기)으로 선택 값이 변경될 때 발생.
 *   네이티브 select와 동일하게 프로그램적 value 세팅·옵션 등록으로는 발화하지 않는다.
 * @event search - `searchable`일 때 검색어가 바뀔 때마다 발생(`detail: { query: string; composing: boolean }` — IME 조합 중이면 `composing: true`, 조합이 끝나면 `false` 로 한 번 더).
 *   로컬 필터링(이미 렌더된 `u-option`의 `hidden` 토글)과 별개로 발행되므로, 서버/원격 검색이
 *   필요한 소비자는 이 이벤트를 구독해 자체적으로 옵션을 갱신할 수 있다.
 */
@customElement('u-select')
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export class USelect extends UFormControlElement<string | string[]> {
  static styles = [ super.styles, styles ];

  /** 트리거 영역의 스타일 변형 */
  /** 외형 정도 */
  @property({ type: String, reflect: true }) appearance: FieldAppearance = 'outlined';
  /**
   * 크기 — 버튼의 `size` 와 같은 세 단(`md` 기본 = `--u-density`(14px) · `sm` = 그 6/7(12px) · `lg` = 8/7(16px) — 밀도 단을 바꾸면 셋이 함께 움직인다).
   * 상자 높이는 글자 크기에서 파생된다(1.5em 줄 + 필드 상자 여백 × 2 + 테두리) — 같은 `size` 의 버튼과
   * 한 줄에 서도록. 테마는 필드 상자 토큰(`--u-field-padding-block`)으로 단마다 높이를 다듬는다.
   */
  @property({ type: String, reflect: true }) size: FieldSize = 'md';
  /**
   * 칸이 담을 글자 수 — 지정하면 폭을 정하지 않은 칸(기본 `inline-block`)이 «N자 + 지우기·펼침 화살표 + 패딩» 폭으로 그려져
   * 고른 값이 바뀌어도 폭이 흔들리지 않고(더 긴 값은 말줄임), 그보다 좁게 주면 넘친다(표시 글자 하한이 N자가 된다).
   * `u-input` 의 `chars` 와 같은 축이다. 폭을 준 칸(`--u-select-width`·`block`)에서는 하한으로만 쓴다.
   */
  @property({ type: Number, reflect: true }) chars?: number;
  /** `chars` 의 폭 — 그려지는 N자를 잰다(`ch` 는 글꼴 기능·자간을 빼고 잰다). */
  private readonly charsWidth = new CharsWidthController(this, {
    chars: () => this.chars,
    text: () => this.renderRoot.querySelector<HTMLElement>(".text-content, .chips-content"),
    box: () => this.renderRoot.querySelector<HTMLElement>('.container'),
  });
  /** 다중 선택 여부 */
  @property({ type: Boolean, reflect: true }) multiple: boolean = false;
  /** 검색 가능 여부 */
  @property({ type: Boolean, reflect: true }) searchable: boolean = false;
  /**
   * 검색어로 옵션을 거르는 주체. `local`(기본) — 옵션 글자·값에 검색어가 들어 있는 것만 보인다. `none` — 거르지 않는다:
   * 옵션 집합의 주인이 소비자일 때(`search` 이벤트로 서버를 검색해 옵션을 바꾸는 원격 검색) 쓴다. 서버가 낱말 AND · 다른 칸으로
   * 찾은 옵션을 라이브러리가 다시 걸러 숨기던 충돌이 사라진다.
   */
  @property({ type: String, reflect: true }) filter: 'local' | 'none' = 'local';
  /** 지우기 버튼 표시 여부 */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** 로딩 상태 표시 여부 */
  @property({ type: Boolean, reflect: true }) loading: boolean = false;
  /** 최소 선택 개수 (다중 선택 시) */
  @property({ type: Number, attribute: 'min-count' }) minCount?: number;
  /** 최대 선택 개수 (다중 선택 시) */
  @property({ type: Number, attribute: 'max-count' }) maxCount?: number;
  /** placeholder 텍스트 */
  @property({ type: String }) placeholder?: string;

  /** 폼 제출 시 사용되는 값. attribute로는 단일 값 문자열 또는 JSON 배열(`value='["a","b"]'`)을 지원한다. */
  @property({
    converter: {
      fromAttribute: (value: string | null): string | string[] | undefined => {
        if (value == null) return undefined;
        if (value.trim().startsWith('[')) {
          try { return JSON.parse(value); } catch { return value; }
        }
        return value;
      },
    },
  }) value?: string | string[];

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;

  @state() private options: UOption[] = [];
  /** 검색칸의 지금 검색어(소문자 · 앞뒤 공백 없음). */
  private query = '';
  /** `query` 의 마지막 음절이 아직 조합 중인가 — 검색 일치가 그 음절을 자모 앞부분으로 견준다. */
  private queryComposing = false;
  /**
   * 검색칸의 활성 후보 — 검색어가 있으면 첫 보이는 옵션. Enter 가 그것을 고른다(APG «list autocomplete with automatic
   * selection»). 포커스는 검색칸에 남고, 보조기기에는 검색칸의 `aria-activedescendant` 로 알린다.
   */
  private activeOption?: UOption;
  /** 검색어가 있는데 보이는 옵션이 없다 — 팝업에 «일치하는 항목 없음» 을 알린다. */
  @state() private noMatches = false;
  /** aria-expanded 배선용 팝오버 열림 상태 */
  @state() private open: boolean = false;
  /** 트리거의 검색 입력에 글자가 있다(조합 중 포함) — 선택값 표시를 가리고 친 글자를 보인다. */
  @state() private typing = false;
  /** 검색 불가 트리거의 type-ahead 버퍼 — APG select-only: 첫 글자들로 옵션을 찾는다(짧은 간격의 연속 입력은 이어 붙인다). */
  private typeahead = { text: '', at: 0 };
  /** 팝업 · listbox 의 고유 id — 콤보박스(검색 불가면 트리거, 검색 가능이면 트리거 안 입력)의 aria-controls 가 listbox 를 가리킨다. */
  private readonly idBase = `u-select-${Math.random().toString(36).slice(2, 8)}`;
  private readonly listboxId = `${this.idBase}-listbox`;
  private readonly popupId = `${this.idBase}-popup`;

  protected shouldValidate(changed: PropertyValues): boolean {
    return super.shouldValidate(changed)
      || ['minCount', 'maxCount', 'multiple'].some(k => changed.has(k));
  }

  private get valueAsString(): string {
    return Array.isArray(this.value) ? this.value.join(',') : this.value ?? '';
  }

  private get valueAsArray(): string[] {
    return Array.isArray(this.value) ? this.value : this.value ? [this.value] : [];
  }

  private get hasValue(): boolean {
    return this.multiple ? this.valueAsArray.length > 0 : !!this.value;
  }

  /** 묶음(`u-option-group`) 안의 선택지가 바뀌어도 모은다 — 슬롯의 `slotchange` 는 직속 자식의 변화만 알린다. */
  private readonly groupObserver = new MutationObserver((records) => {
    if (records.some((r) => r.target instanceof UOptionGroup)) this.collectOptions();
  });

  connectedCallback(): void {
    super.connectedCallback();
    this.groupObserver.observe(this, { childList: true, subtree: true });
  }

  disconnectedCallback(): void {
    this.groupObserver.disconnect();
    this.cleanup(this.options);
    super.disconnectedCallback();
  }

  protected willUpdate(changedProperties: PropertyValues): void {
    super.willUpdate(changedProperties);
    // 거르는 주체가 바뀌거나 원격 검색이 끝나면(`loading` 해제) 지금 검색어를 다시 적용한다 — «0건» 알림도 함께.
    if (changedProperties.has('filter') || changedProperties.has('loading')) this.applyFilter();
  }

  protected updated(changedProperties: PropertyValues): void {
    super.updated(changedProperties);

    if (['value','options'].some(k => changedProperties.has(k))) {
      this.onChangeValue();
    }
    // `open`은 `@state()`(비공개) — 공개 속성으로 반사하지 않고 `:state(open)`으로만
    // 노출한다. 팝오버가 열려 있을 때 트리거를 다르게 그리고 싶은 소비자는
    // `u-select:state(open)::part(container)` 형태로 훅을 건다.
    if (changedProperties.has('open')) {
      this.internals?.states[this.open ? 'add' : 'delete']('open');
    }
  }

  render() {
    const chars = this.charsWidth.width;
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
        <span slot="label-aside" class="count" ?hidden=${!this.multiple || !this.maxCount}>
          ${this.valueAsArray.length} / ${this.maxCount}
        </span>

        <!-- 검색 가능이면 콤보박스는 트리거 안의 입력이다(APG «editable combobox with list autocomplete») — 포커스가
             처음부터 편집 칸에 있어야 닫힌 채 친 글자(한글 조합의 첫 음절까지)가 검색어가 된다. 편집할 수 없는 칸에서는
             입력기가 조합을 시작하지 못한다. 검색 불가면 트리거 자신이 콤보박스다(APG «select-only»). -->
        <div class="container ${this.typing ? 'typing' : ''}" part="container"
          tabindex=${ifDefined(this.searchable ? undefined : this.effectivelyDisabled ? "-1" : "0")}
          style=${`--_clear: ${this.clearable && this.hasValue && !this.effectivelyDisabled && !this.readonly ? 1 : 0}${chars ? `; --select-min-text: ${chars}; --_chars: ${chars}` : ''}`}
          role=${ifDefined(this.searchable ? undefined : 'combobox')}
          aria-disabled=${ifDefined(!this.searchable && this.effectivelyDisabled ? 'true' : undefined)}
          aria-label=${ifDefined(this.searchable ? undefined : this.resolvedAriaLabel)}
          aria-description=${ifDefined(this.searchable ? undefined : this.resolvedAriaDescription)}
          aria-haspopup=${ifDefined(this.searchable ? undefined : 'listbox')}
          aria-expanded=${ifDefined(this.searchable ? undefined : String(this.open))}
          aria-controls=${ifDefined(this.searchable ? undefined : this.listboxId)}
          @click=${this.handleContainerClick}
          @keydown=${this.handleTriggerKeydown}>
          <slot name="prefix"></slot>
          <div class="value-area">
            <slot name="display">${this.renderContent()}</slot>
            ${this.searchable ? html`<input class="search" part="search-input"
              type="text"
              role="combobox"
              autocomplete="off"
              spellcheck="false"
              aria-autocomplete="list"
              aria-haspopup="listbox"
              aria-expanded=${String(this.open)}
              aria-controls=${this.listboxId}
              aria-label=${this.resolvedAriaLabel || Locale.getValue('search')}
              aria-description=${ifDefined(this.resolvedAriaDescription)}
              ?disabled=${this.effectivelyDisabled}
              ?readonly=${this.readonly}
              @input=${this.handleSearchInput}
              @compositionstart=${this.handleCompositionStart}
              @compositionupdate=${this.composition}
              @compositionend=${this.composition}
              @keydown=${this.handleSearchKeydown}
            />` : nothing}
          </div>
          <slot name="suffix"></slot>

          <u-icon class="suffix-item"
            ?hidden=${!this.clearable || !this.hasValue || this.effectivelyDisabled || this.readonly}
            role="button"
            tabindex="0"
            aria-label=${Locale.getValue('clear')}
            lib="internal"
            name="x"
            @click=${this.handleClearClick}
            @keydown=${this.handleClearKeydown}
          ></u-icon>
          <u-icon class="suffix-item"
            ?hidden=${this.loading}
            lib="internal"
            name="chevron-down"
          ></u-icon>
          <u-spinner class="suffix-item"
            ?hidden=${!this.loading}
          ></u-spinner>
        </div>
      </u-field>

      <!-- 팝업은 역할 없는 컨테이너이고 listbox 와 «일치 없음» 상태 줄만 담는다(listbox 는 option 과 group 만).
           검색 가능이면 여닫기는 이 요소가 한다(trigger="manual") — 트리거 안 입력의 스페이스 · Enter 는 글자와 고르기다. -->
      <u-popover part="popover"
        id=${this.popupId}
        scrollable
        ?autofocus=${!this.searchable}
        for=".container"
        trigger=${this.searchable ? 'manual' : 'click'}
        @show=${() => { this.open = true; this.updateActiveOption(); }}
        @hide=${this.handlePopoverHide}
        strategy="fixed"
        placement="bottom-start"
        offset="1"
      >
        <div class="no-matches" part="no-matches" role="status">${this.noMatches ? Locale.getValue('noMatches') : ''}</div>
        <div class="listbox" role="listbox" id=${this.listboxId}
          aria-multiselectable=${ifDefined(this.multiple ? 'true' : undefined)}>
          <slot @slotchange=${this.handleSlotChange}></slot>
        </div>
      </u-popover>
    `;
  }

  private renderContent() {
    if (this.multiple) {
      const values = this.valueAsArray;
      if (values.length === 0) {
        return html`<span class="text-content placeholder">${this.placeholder ?? ''}</span>`;
      }
      
      return html`
        <div class="chips-content">
          ${values.map(v => html`
              <u-chip 
                removable
                data-value=${v} 
                @remove=${this.handleChipRemove}
              >
                ${this.options.find(o => o.value === v)?.getText() ?? v}
              </u-chip>`
            )}
        </div>
      `;
    } else {
      const option = this.options.find(o => o.value === this.value);
      if (!option) {
        return html`
          <span class="text-content placeholder">${this.placeholder ?? ''}</span>`;
      }

      return html`<span class="text-content">${option.getContent()}</span>`;
    }
  }

  protected setValidity(): void {
    const values = this.valueAsArray;
    let flags: ValidityStateFlags = {};
    let message = '';

    if (this.required && !values.length) {
      flags = { valueMissing: true };
      message = Locale.getValue('valueMissing');
    } else if (this.multiple && this.minCount != null && values.length > 0 && values.length < this.minCount) {
      flags = { tooShort: true };
      message = Locale.getValue('tooShort', { min: this.minCount });
    } else if (this.multiple && this.maxCount != null && values.length > this.maxCount) {
      flags = { tooLong: true };
      message = Locale.getValue('tooLong', { max: this.maxCount });
    }

    this.commit(flags, message, this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = this.multiple ? [] : '';
    this.invalid = false;
  }

  /** `.container`는 div라 네이티브 `disabled`가 없다 — disabled일 때 `tabindex="-1"`로만
   *  Tab 순서에서 빠지고 프로그램적 `.focus()`는 여전히 통과하므로, `UInput.focus()`가
   *  네이티브 `disabled` `<input>`에서 얻는 것과 같은 no-op을 여기서 직접 재현한다. */
  public focus(options?: FocusOptions): void {
    if (this.effectivelyDisabled) return;
    (this.searchable ? this.searchInputEl : this.containerEl)?.focus(options);
  }

  public blur(): void {
    (this.searchable ? this.searchInputEl : this.containerEl)?.blur();
  }

  private setup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeydown);
      option.addEventListener('click', this.handleOptionClick);
      option.addEventListener('keydown', this.handleOptionKeydown);
      option.marker = this.multiple ? 'check' : undefined;
      option.disabled = this.effectivelyDisabled;
      option.selected = this.multiple 
        ? this.valueAsArray.includes(option.value) 
        : option.value === this.value;
    }
  }

  private cleanup(options: UOption[]) {
    for (const option of options) {
      option.removeEventListener('click', this.handleOptionClick);
      option.removeEventListener('keydown', this.handleOptionKeydown);
    }
  }

  private onChangeValue(): void {
    const values = this.valueAsArray;
    for (const option of this.options) {
      if (this.multiple) {
        option.selected = values.includes(option.value);
      } else {
        option.selected = option.value === this.value;
      }
    }
    this.internals?.setFormValue(this.valueAsString);
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

  private handleSlotChange = () => this.collectOptions();

  /** 슬롯의 선택지를 모은다 — 직속 `u-option` 과 묶음 안의 것(문서 순서). */
  private collectOptions(): void {
    const slot = this.renderRoot.querySelector<HTMLSlotElement>('.listbox slot');
    if (!slot) return;
    this.cleanup(this.options);
    this.options = collectOptions(slot.assignedElements({ flatten: true }));
    this.setup(this.options);
    this.applyFilter();
  }

  /**
   * 목록이 닫힐 때 포커스가 그 «안»(옵션·검색 입력)에 있었으면 콤보박스로 되돌린다.
   *
   * 되돌리지 않으면 포커스가 숨은 목록 안에 남는다 — 키보드 사용자는 자기 위치를 잃고,
   * 그 옵션은 다음 Escape 까지 받아 소비해 바깥 층(오버레이·소비자 패널)이 닫히지 않는다.
   * 바깥 클릭으로 닫힐 때는 포커스가 이미 다른 곳에 있으므로 건드리지 않는다.
   */
  private handlePopoverHide = () => {
    this.open = false;
    this.setActiveOption(undefined);
    if (this.popoverEl?.matches(':focus-within')) {
      this.focus();
    }
    // 닫히면 검색어를 비운다 — 트리거가 다시 고른 값을 보이고, 다음에 열 때 전체 목록에서 시작한다. 원격 검색 소비자도
    // 빈 검색어의 `search` 로 옵션을 되돌린다.
    const input = this.searchInputEl;
    if (this.searchable && input && input.value) {
      input.value = '';
      this.updateSearch(input);
    }
  };

  /** 검색 가능일 때 목록을 연다(여닫기는 이 요소가 한다 — 팝오버는 `trigger="manual"`). */
  private openPopup() {
    if (this.open || this.effectivelyDisabled || this.readonly || !this.containerEl) return;
    void this.popoverEl?.show(this.containerEl);
  }

  /** 트리거를 누르면 — 검색 가능이면 입력에 포커스를 두고 여닫는다(열린 채 입력을 눌러 캐럿을 옮기는 것은 닫지 않는다). */
  private handleContainerClick = (e: MouseEvent) => {
    if (!this.searchable || this.effectivelyDisabled || this.readonly) return;
    const input = this.searchInputEl;
    if (!input) return;
    if (this.shadowRoot?.activeElement !== input) input.focus();
    if (!this.open) this.openPopup();
    else if (!e.composedPath().includes(input)) void this.popoverEl?.hide();
  };

  /** 조합이 시작되면 연다 — 첫 음절부터 검색어다. */
  private handleCompositionStart = (e: CompositionEvent) => {
    this.composition.handleEvent(e);
    this.typing = true;
    this.openPopup();
  };

  /**
   * 검색 불가 트리거의 type-ahead(APG select-only combobox · 네이티브 select). 인쇄 가능한 글자 — 닫혀 있으면 그 글자로
   * 시작하는 다음 옵션을 바로 고르고(값 바뀜 → change), 열려 있으면 그 옵션으로 포커스를 옮긴다. 같은 글자를 거듭 치면
   * 그 글자로 시작하는 옵션을 돈다. 여러 글자는 짧은 간격(0.5초) 안에 이어 친 것만 한 낱말이다.
   */
  private handleTriggerKeydown = (e: KeyboardEvent) => {
    if (this.searchable || e.target !== this.containerEl) return;
    this.typeAhead(e);
  };

  private typeAhead(e: KeyboardEvent): boolean {
    if (this.effectivelyDisabled || this.readonly) return false;
    if (e.ctrlKey || e.metaKey || e.altKey || e.key.length !== 1 || isImeComposing(e)) return false;
    const now = e.timeStamp || Date.now();
    const fresh = now - this.typeahead.at > 500;
    if (e.key === ' ' && (fresh || !this.typeahead.text)) return false; // 스페이스는 여닫기 · 고르기 키다(낱말 중간이 아니면)
    e.preventDefault();
    this.typeahead = { text: fresh ? e.key : this.typeahead.text + e.key, at: now };
    const text = this.typeahead.text.toLowerCase();
    const repeat = [...text].every((c) => c === text[0]);
    const needle = repeat ? text[0] : text;
    const options = this.options.filter((o) => !o.hidden && !o.disabled);
    if (!options.length) return true;
    const focused = options.find((o) => o.matches(':focus'));
    const current = focused ?? options.find((o) => o.value === this.value) ?? options.find((o) => o.selected);
    const start = current ? options.indexOf(current) + (repeat || !focused ? 1 : 0) : 0;
    const ordered = [...options.slice(start), ...options.slice(0, start)];
    const match = ordered.find((o) => o.getText().trim().toLowerCase().startsWith(needle));
    if (!match) return true;
    if (this.open) {
      match.focus();
    } else if (!this.multiple) {
      if (match.value !== this.value) {
        this.value = match.value;
        this.emitChange();
      }
    } else {
      void this.popoverEl?.show(this.containerEl!).then(() => match.focus());
    }
    return true;
  }

  private handleOptionClick = (e: PointerEvent) => {
    const option = e.currentTarget as UOption;
    if (option.disabled) return;

    if (this.multiple) {
      const values = this.valueAsArray;
      if (values.includes(option.value)) {
        this.value = values.filter(v => v !== option.value);
      } else {
        if (this.maxCount != null && values.length >= this.maxCount) return;
        this.value = [...values, option.value];
      }
      this.emitChange();
    } else {
      // 동일 옵션 재선택은 네이티브 select와 동일하게 change를 발화하지 않는다.
      const changed = option.value !== this.value;
      this.value = option.value;
      if (changed) this.emitChange();
      this.popoverEl?.hide();
    }
  };

  private handleOptionKeydown = (e: KeyboardEvent) => {
    const options = this.options.filter(o => !o.hidden && !o.disabled);
    const currentOption = e.currentTarget as UOption;
    const currentIndex = options.indexOf(currentOption);
    if (currentIndex === -1) return;

    // 목록 안에서 친 글자 — 검색 가능이면 검색 입력으로 돌아가 이어 치고(포커스가 먼저 옮겨 가 그 글자가 입력에 들어간다),
    // 아니면 type-ahead 로 옵션을 찾는다.
    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1 && !(e.key === ' ' && !this.typeahead.text)) {
      if (this.searchable) {
        this.searchInputEl?.focus();
        return;
      }
      if (this.typeAhead(e)) return;
    }

    switch (e.key) {
      case 'Enter':
      case ' ':
        // Space 의 기본 동작은 스크롤 컨테이너를 넘긴다 — 목록이 닫히지 않는 multiple 에서 토글할 때마다
        // 목록이 밀린다. 고르는 키는 고르기만 한다(라디오 그룹·네이티브 listbox 와 같다).
        e.preventDefault();
        currentOption.click();
        break;
      case 'ArrowDown': {
        e.preventDefault();
        const nextIndex = (currentIndex + 1) % options.length;
        options[nextIndex].focus();
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        const prevIndex = (currentIndex - 1 + options.length) % options.length;
        options[prevIndex].focus();
        break;
      }
      case 'Home':
        e.preventDefault();
        options[0].focus();
        break;
      case 'End':
        e.preventDefault();
        options[options.length - 1].focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.popoverEl?.hide();
        break;
    }
  };

  /**
   * 검색칸의 IME 조합. 조합 중인 음절(«ㅅ» · «성» → «서울» 의 가는 길)은 «진행 중» 이라 거르기에 쓰지 않는다 — 확정된
   * 부분으로 거르면 사용자가 찾는 옵션을 숨기지 않고 «일치 없음» 도 정말 없을 때만 알린다. Chromium 은 조합의 마지막
   * `input` 을 `isComposing: true` 로 내고 끝내므로, 확정된 질의는 조합 끝에 낸다.
   */
  private readonly composition = new CompositionTracker((input) => this.updateSearch(input as HTMLInputElement));

  /** 마지막으로 낸 `search` — 조합 끝의 `search` 와 그 뒤 브라우저가 내는 `input`(Firefox)이 같은 질의를 두 번 내지 않게. */
  private lastSearch?: { query: string; composing: boolean };

  private handleSearchInput = (e: InputEvent) => {
    this.updateSearch(e.target as HTMLInputElement);
  };

  private updateSearch(input: HTMLInputElement) {
    this.typing = input.value !== '' || this.composition.composing;
    if (this.typing) this.openPopup();
    const { query, composing } = this.composition.searchQuery(input);
    this.query = query.trim();
    this.queryComposing = composing;
    this.applyFilter();

    const detail = { query: input.value.toLowerCase().trim(), composing: this.composition.composing };
    if (this.lastSearch && this.lastSearch.query === detail.query && this.lastSearch.composing === detail.composing) return;
    this.lastSearch = detail;
    this.fire<USelectSearchDetail>('search', { detail, cancelable: false });
  }

  /**
   * 지금 검색어를 지금 옵션에 적용한다 — 입력 때뿐 아니라 옵션이 바뀔 때도(재사용된 `u-option` 이 앞 검색의 `hidden` 을
   * 들고 남지 않게). `filter="none"` 이면 아무것도 숨기지 않는다.
   */
  private applyFilter() {
    const query = this.filter === 'none' ? '' : this.query;
    for (const option of this.options) {
      if (!query) {
        option.hidden = false;
      } else {
        const options = { composing: this.queryComposing };
        option.hidden = !Locale.matchesSearch(option.getText(), query, options)
          && !Locale.matchesSearch(option.value, query, options);
      }
    }
    this.noMatches = !!this.query && !this.loading && !this.options.some((o) => !o.hidden);
    this.updateActiveOption();
  }

  /** 검색어가 있으면 첫 보이는(고를 수 있는) 옵션이 활성 후보 — 없으면 후보도 없다(화살표로 목록에 들어간다). */
  private updateActiveOption() {
    const candidate = this.searchable && this.open && this.query
      ? this.options.find(o => !o.hidden && !o.disabled)
      : undefined;
    this.setActiveOption(candidate);
  }

  private setActiveOption(option: UOption | undefined) {
    if (this.activeOption === option) return;
    if (this.activeOption) this.activeOption.active = false;
    this.activeOption = option;
    if (option) {
      option.active = true;
      option.scrollIntoView?.({ block: 'nearest' });
    }
    // 옵션은 이 요소의 light DOM 이고 검색칸은 섀도 안이다 — IDREF 는 그 경계를 못 넘지만 요소 반영은 넘는다(조상 트리 참조).
    const input = this.searchInputEl as (HTMLInputElement & { ariaActiveDescendantElement?: Element | null }) | null;
    if (input && 'ariaActiveDescendantElement' in input) input.ariaActiveDescendantElement = option ?? null;
  }

  private get searchInputEl(): HTMLInputElement | null {
    return this.shadowRoot?.querySelector<HTMLInputElement>('input.search') ?? null;
  }

  private handleSearchKeydown = (e: KeyboardEvent) => {
    // Enter 는 활성 후보를 고른다 — 조합을 확정하는 Enter(IME)는 입력기의 것이라 고르지 않는다. 닫혀 있으면 연다.
    if (e.key === 'Enter' && !isImeComposing(e)) {
      if (this.open && this.activeOption) {
        e.preventDefault();
        this.activeOption.click();
      } else if (!this.open) {
        e.preventDefault();
        this.openPopup();
      }
      return;
    }
    if (!this.open) {
      // 닫힌 콤보박스 — 화살표가 연다(APG). Escape 는 남은 검색어를 지운다.
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        this.openPopup();
      } else if (e.key === 'Escape' && (e.target as HTMLInputElement).value) {
        e.preventDefault();
        (e.target as HTMLInputElement).value = '';
        this.updateSearch(e.target as HTMLInputElement);
      }
      return;
    }
    const options = this.options.filter(o => !o.hidden && !o.disabled);
    if (options.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        options[0].focus();
        break;
      case 'ArrowUp':
        e.preventDefault();
        options[options.length - 1].focus();
        break;
      case 'Escape':
        e.preventDefault();
        this.popoverEl?.hide();
        break;
    }
  };

  private handleClearClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.reset();
    this.emitChange();
    if (this.searchable) {
      this.searchInputEl?.focus();
      this.openPopup();
    } else {
      this.containerEl?.click();
    }
  };

  /** suffix `u-icon`은 순수 표시 요소(버튼 아님)라 네이티브 키보드 활성화가 없다 —
   *  `role="button"`+`tabindex="0"`로 포커스 가능하게 한 뒤, Enter/Space를 같은 클릭
   *  핸들러로 릴레이한다(`UInput`의 동일 패턴과 일치). */
  private handleClearKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.handleClearClick(e as unknown as MouseEvent);
  };

  private handleChipRemove = (e: Event) => {
    const chip = e.currentTarget as UChip;
    const value = chip.dataset.value;
    if (!value) return;
    this.value = this.valueAsArray.filter(v => v !== value);
    this.emitChange();
  };
}

/** Detail of `<u-select>`'s `search` event. */
export interface USelectSearchDetail {
  /** The search box text, trimmed and lower-cased — including a syllable still being composed. */
  query: string;
  /**
   * `true` while an IME composition (Korean, Japanese, Chinese) is in progress, so `query` ends in a partial
   * syllable (`ㅅ`, `성` on the way to `서울`). When the composition ends the event fires again with `false`. A consumer
   * that searches a server can skip composing queries.
   */
  composing: boolean;
}

/** Custom events `<u-select>` dispatches (its `change`/`input` are the native form-control events). */
export interface USelectEventMap {
  /** The search box changed (`searchable`). */
  'search': CustomEvent<USelectSearchDetail>;
}

/** Typed listeners for {@link USelectEventMap} — element-scoped, the DOM's own pattern (`HTMLMediaElementEventMap`). */
// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging -- typed event listeners (the DOM's own `HTMLMediaElementEventMap` pattern): the merged addEventListener/removeEventListener overloads are implemented by EventTarget
export interface USelect {
  addEventListener<K extends keyof USelectEventMap>(type: K, listener: (this: USelect, ev: USelectEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: USelect, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | AddEventListenerOptions): void;
  addEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions): void;
  removeEventListener<K extends keyof USelectEventMap>(type: K, listener: (this: USelect, ev: USelectEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: USelect, ev: HTMLElementEventMap[K]) => unknown, options?: boolean | EventListenerOptions): void;
  removeEventListener(type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions): void;
}

declare global {
  interface HTMLElementTagNameMap {
    'u-select': USelect;
  }
}
