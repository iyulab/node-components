import { html, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../button/UButton.js';
import '../calendar/UCalendar.js';
import '../field/UField.js';
import '../icon/UIcon.js';
import '../popover/UPopover.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale } from "../../utilities/Locale.js";
import { dateTextPattern, formatDateText, formatDateTimeText, parseDate, parseDateTime, type DateTextFormat } from "../../utilities/format.js";
import { UCalendar } from "../calendar/UCalendar.js";
import { DateTextController } from "../calendar/date-text-controller.js";
import { isOutOfRange, parseISODate, toISODate } from "../calendar/dates.js";
import { UPopover } from "../popover/UPopover.js";
import { styles as pickerStyles } from "../calendar/picker.styles.js";
import { styles } from "./UDatePicker.styles.js";

/** `±HH:mm` for the browser's local timezone at `date` (DST-aware — recomputed per date,
 *  not cached — `getTimezoneOffset()`'s sign is the inverse of the ISO-8601 offset sign). */
function getLocalOffset(date: Date): string {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** Builds the `value` for the given mode — `datetime` always emits seconds + local offset so
 *  the result is unconditionally a valid, unambiguous ISO-8601 `DateTimeOffset` regardless of
 *  how coarse the UI input was (this is the guarantee the datetime mode request asked for). */
function buildValue(date: Date, mode: DatePickerMode, time: string): string {
  return mode === 'datetime' ? `${toISODate(date)}T${time}:00${getLocalOffset(date)}` : toISODate(date);
}

/** Splits a `value` into its date portion (as a `Date`, via the local `parseISODate` above —
 *  date-only, no timezone conversion) and its `HH:mm` time-of-day (`'00:00'` if absent —
 *  covers both plain date-mode values and a datetime value with no time captured yet). */
function splitValue(value: string): { date: Date; time: string } {
  const [datePart, rest] = value.split('T');
  const match = rest?.match(/^(\d{2}:\d{2})/);
  return { date: parseISODate(datePart), time: match ? match[1] : '00:00' };
}

export type DatePickerMode = 'date' | 'datetime';

/**
 * A single-date(-time)-selection form control. In `mode="date"` (default) the value follows
 * the same convention as the native `input[type=date]`: an ISO `YYYY-MM-DD` string. The field is a
 * text box in both modes — type `2026-10-02`, `20261002` or `10-02` (this year), plus a time
 * (`2026-10-02 14:30`) in `mode="datetime"`, and press Enter or leave the field; the calendar is a
 * helper. The text shows as `YYYY-MM-DD` (`YYYY-MM-DD HH:mm`) whatever the browser language, or in
 * the locale's numeric order with `format="locale"`. Clicking the field opens the calendar and keeps
 * typing in the field; ArrowDown (or Alt+ArrowDown) moves into the calendar. Text that is not a date
 * clears the value and reports `badInput`, like the native input. In
 * `mode="datetime"` the value is a complete ISO-8601 `DateTimeOffset` string
 * (`YYYY-MM-DDTHH:mm:ss±HH:mm`) — the component always fills in seconds and the browser's
 * local UTC offset, so the value is unconditionally valid regardless of how coarse the time
 * input was.
 *
 * The calendar week always starts on Sunday, regardless of locale — harmless for the
 * locales this library currently ships (en/ko), but not correct for locales where Monday
 * (most of Europe) or Saturday is conventional. Fix when a consumer needs it: derive the
 * first day of week from `Intl.Locale(locale).weekInfo?.firstDay`, falling back to Sunday
 * where unsupported.
 *
 * Exposes a `:state(open)` custom state (via `ElementInternals.states`) while the calendar
 * popover is showing — style with `u-date-picker:state(open)::part(container)`. Unlike
 * `mode`/`clearable`, this state is never reflected as a public attribute — it exists purely
 * as a CSS hook for consumers who want to react to the open/closed state from outside.
 *
 * @csspart field - the u-field element
 * @csspart input - the text box
 * @csspart container - the element wrapping the trigger area
 * @csspart popover - the popover element showing the calendar
 * @csspart calendar - the calendar container
 * @csspart calendar-header - the month navigation header
 * @csspart calendar-title - the "Month Year" title
 * @csspart calendar-weekdays - the weekday header row
 * @csspart calendar-grid - the date grid
 * @csspart calendar-week - one week row inside the date grid
 * @csspart time-input - the time-of-day input (datetime mode only)
 * @csspart day - a date cell button
 * @csspart calendar-footer - the row holding the "today"/"clear" quick-action buttons
 * @csspart calendar-time - the row holding the time-of-day input (datetime mode only)
 *
 * @cssprop --u-date-picker-display - host `display` (default: inline-block). Set `block` to fill
 *   the container width in forms and grid cells.
 * @cssprop --u-date-picker-width - host `width` (default: auto). Set `100%` where `block` alone
 *   does not stretch the host (e.g. inside a flex container).
 * @cssprop --date-picker-popover-width - width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally)
 *
 * @event change - fires when the user clicks a date cell, confirms via keyboard, changes the
 *   time input (datetime mode, once a date is set), or clicks the clear button. Programmatic
 *   value assignment does not fire it (same contract as native form controls).
 */
@customElement('u-date-picker')
export class UDatePicker extends UFormControlElement<string> {
  static styles = [super.styles, pickerStyles, styles];

  /** `date` (default) selects a calendar day only. `datetime` also captures a time-of-day and
   *  the value becomes a complete ISO-8601 `DateTimeOffset` string. */
  @property({ type: String, reflect: true }) mode: DatePickerMode = 'date';
  /** Minimum value (ISO YYYY-MM-DD) — dates before this cannot be selected. Date-only even in
   *  `mode="datetime"`; time-of-day is never range-checked. */
  @property({ type: String }) min?: string;
  /** Maximum value (ISO YYYY-MM-DD) — dates after this cannot be selected. Date-only even in
   *  `mode="datetime"`; time-of-day is never range-checked. */
  @property({ type: String }) max?: string;
  /** Whether to show the clear button */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** Placeholder text (shown when there is no value). Defaults to the pattern to type
   *  (`YYYY-MM-DD`, or `YYYY-MM-DD HH:mm` in `mode="datetime"`). */
  @property({ type: String }) placeholder?: string;
  /** How the text box writes and reads the date: `iso` (default, `YYYY-MM-DD` in every language)
   *  or `locale` (the active locale's numeric order, e.g. `10/02/2026` in `en-US`). ISO and
   *  `20261002` are read in both. The time, in `mode="datetime"`, is always `HH:mm`. The value is
   *  ISO either way. */
  @property({ type: String, reflect: true }) format: DateTextFormat = 'iso';

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;
  @query('u-calendar') calendarEl?: UCalendar;

  /** Unique id wiring the combobox's `aria-controls` to the calendar dialog — mirrors USelect's `listboxId`. */
  private readonly calendarId = `u-date-picker-calendar-${Math.random().toString(36).slice(2, 8)}`;

  @state() private open: boolean = false;
  /** Time-of-day for the next selection while no `value` exists yet (`mode="datetime"` only) —
   *  once `value` is set, the time input reads/writes its time portion directly instead. */
  @state() private pendingTime: string = '00:00';
  /** The typed-date text box — what is being typed, committing it, opening the calendar. */
  private readonly textEntry = new DateTextController(this, {
    toValue: (text) => {
      if (!text.trim()) return undefined;
      const typed = this.parseTyped(text);
      if (!typed) return null;
      if (this.mode === 'datetime') this.pendingTime = typed.time;
      return buildValue(parseISODate(typed.date), this.mode, typed.time);
    },
    dayOf: (text) => this.parseTyped(text)?.date ?? null,
    shown: () => this.shownText(),
    onChange: () => this.emitChange(),
    onBadText: () => { if (!this.novalidate) this.validate(); },
    popover: () => this.popoverEl,
    calendar: () => this.calendarEl,
    container: () => this.containerEl,
    input: () => this.textInputEl,
    interactive: () => !this.effectivelyDisabled && !this.readonly,
  });

  protected updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('value')) {
      this.internals?.setFormValue(this.value ?? '');
    }
    // `open`은 `@state()`(비공개) — 공개 속성으로 반사하지 않고 `:state(open)`으로만
    // 노출한다. 캘린더가 열려 있을 때 트리거를 다르게 그리고 싶은 소비자는
    // `u-date-picker:state(open)::part(container)` 형태로 훅을 건다.
    if (changed.has('open')) {
      this.internals?.states[this.open ? 'add' : 'delete']('open');
    }
    if (changed.has('open') && this.open) {
      // The calendar only renders while open, so it exists from this update on. The popover's
      // `open` attribute (and the `visibility: hidden -> visible` CSS it drives) reflects on the
      // popover's own update cycle, which runs after this one — focusing a day button before
      // that resolves is a no-op because it is still `visibility: hidden`.
      this.textEntry.calendarOpened(this.value ? toISODate(splitValue(this.value).date) : new Date());
    }
  }

  /** The value as the text box shows it: `YYYY-MM-DD`, or `YYYY-MM-DD HH:mm` in `mode="datetime"`. */
  private shownText(): string {
    if (!this.value) return '';
    const { date, time } = splitValue(this.value);
    return this.mode === 'datetime'
      ? formatDateTimeText(`${toISODate(date)}T${time}`, this.format)
      : formatDateText(toISODate(date), this.format);
  }

  render() {
    const datetime = this.mode === 'datetime';
    return html`
      <u-field part="field"
        ?required=${this.required}
        ?disabled=${this.effectivelyDisabled}
        ?invalid=${this.invalid}
        .label=${this.label}
        .description=${this.description}
        .validationMessage=${this.validationMessage}
      >
        <div class="container" part="container" @click=${this.textEntry.handleContainerClick}>
          <input class="text-input" part="input"
            type="text"
            inputmode=${datetime ? 'text' : 'numeric'}
            autocomplete="off"
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded=${this.open}
            aria-controls=${this.calendarId}
            aria-label=${ifDefined(this.resolvedAriaLabel)}
            aria-description=${ifDefined(this.resolvedAriaDescription)}
            aria-invalid=${this.textEntry.badText ? 'true' : 'false'}
            placeholder=${this.placeholder ?? (datetime ? `${dateTextPattern(this.format)} HH:mm` : dateTextPattern(this.format))}
            .value=${this.textEntry.text}
            ?disabled=${this.effectivelyDisabled}
            ?readonly=${this.readonly}
            @input=${this.textEntry.handleInput}
            @keydown=${this.textEntry.handleKeydown}
            @blur=${this.textEntry.commit}
          />
          <u-icon class="suffix-item"
            ?hidden=${!this.clearable || !this.value || this.effectivelyDisabled || this.readonly}
            role="button"
            tabindex="0"
            aria-label=${Locale.getValue('clear')}
            lib="internal"
            name="x"
            @click=${this.handleClearClick}
            @keydown=${this.handleClearKeydown}
          ></u-icon>
          <u-icon class="suffix-item calendar-button"
            role="button"
            tabindex="-1"
            aria-label=${Locale.getValue('chooseDate')}
            ?hidden=${this.effectivelyDisabled || this.readonly}
            lib="internal"
            name="calendar"
            @click=${this.textEntry.handleCalendarButtonClick}
          ></u-icon>
        </div>
      </u-field>

      <u-popover part="popover"
        id=${this.calendarId}
        role="dialog"
        aria-label=${Locale.getValue('chooseDate')}
        for=".container"
        trigger="manual"
        strategy="fixed"
        placement="bottom-start"
        offset="4"
        @show=${this.handlePopoverShow}
        @hide=${this.handlePopoverHide}
      >
        ${this.open ? this.renderCalendar() : ''}
      </u-popover>
    `;
  }

  private renderCalendar() {
    return html`
      <div class="calendar" part="calendar">
        <u-calendar
          exportparts="calendar-header, calendar-title, calendar-weekdays, calendar-grid, calendar-week, day"
          .value=${this.value ? toISODate(splitValue(this.value).date) : undefined}
          .min=${this.min}
          .max=${this.max}
          @day-select=${this.handleDaySelect}
          @keydown=${this.handleCalendarKeydown}
        ></u-calendar>
        ${this.renderTimeRow()}
        ${this.renderFooter()}
      </div>
    `;
  }

  private renderTimeRow() {
    if (this.mode !== 'datetime') return '';
    const time = this.value ? splitValue(this.value).time : this.pendingTime;
    return html`
      <div class="calendar-time" part="calendar-time">
        <input type="time" class="time-input" part="time-input"
          aria-label=${Locale.getValue('time')}
          .value=${time}
          @change=${this.handleTimeChange}
        />
      </div>
    `;
  }

  private renderFooter() {
    const todayDisabled = isOutOfRange(new Date(), this.min, this.max);
    return html`
      <div class="calendar-footer" part="calendar-footer">
        <u-button appearance="plain" size="sm" ?disabled=${todayDisabled} @click=${this.handleTodayClick}>${Locale.getValue('today')}</u-button>
        ${this.clearable && this.value ? html`
          <u-button appearance="plain" size="sm" @click=${this.handleFooterResetClick}>${Locale.getValue('clear')}</u-button>
        ` : ''}
      </div>
    `;
  }

  /** `timeOverride` lets a caller force the time-of-day (the "today" quick action wants
   *  "right now", overriding whatever time was previously set) — a plain day-cell click omits
   *  it, which preserves the existing time-of-day (or `pendingTime`) so switching the date
   *  alone doesn't clobber a time the user already picked. */
  private selectDay(date: Date, timeOverride?: string): void {
    if (isOutOfRange(date, this.min, this.max)) return;
    const time = timeOverride ?? (this.value ? splitValue(this.value).time : this.pendingTime);
    const iso = buildValue(date, this.mode, time);
    const changed = iso !== this.value;
    this.textEntry.clear();
    this.value = iso;
    if (this.mode === 'datetime') this.pendingTime = time;
    if (changed) this.emitChange();
    this.popoverEl?.hide();
    (this.textInputEl ?? this.containerEl)?.focus();
  }

  /** Time input change — only commits into `value` once a date already exists (matches native
   *  `datetime-local`: a time alone isn't a complete value). Before that, it just remembers
   *  `pendingTime` for whenever a day gets picked. Doesn't close the popover or refocus the
   *  trigger — unlike selecting a day, adjusting the time doesn't conclude the interaction. */
  private handleTimeChange = (e: Event) => {
    const time = (e.target as HTMLInputElement).value || '00:00';
    this.pendingTime = time;
    if (!this.value) return;
    const iso = buildValue(splitValue(this.value).date, this.mode, time);
    const changed = iso !== this.value;
    this.textEntry.clear();
    this.value = iso;
    if (changed) this.emitChange();
  };

  private handleDaySelect = (e: CustomEvent<{ date: string }>) => {
    this.selectDay(parseISODate(e.detail.date));
  };

  private get textInputEl(): HTMLInputElement | null {
    return this.renderRoot.querySelector('.text-input');
  }

  /** The typed text as a date (ISO) and, in `mode="datetime"`, a time — or `null` when it is not one.
   *  Typing only a date in `mode="datetime"` keeps the time already set (or the pending one). */
  private parseTyped(text: string): { date: string; time: string } | null {
    if (this.mode !== 'datetime') {
      const date = parseDate(text, { format: this.format });
      return date ? { date, time: this.pendingTime } : null;
    }
    const keep = this.value ? splitValue(this.value).time : this.pendingTime;
    const dt = parseDateTime(text, { format: this.format, defaultTime: keep });
    return dt ? { date: dt.slice(0, 10), time: dt.slice(11, 16) } : null;
  }

  /** Escape inside the grid closes the calendar and returns focus to the trigger — the grid
   *  itself does not know it lives in a popover, so the picker owns this. */
  private handleCalendarKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    this.popoverEl?.hide();
    (this.textInputEl ?? this.containerEl)?.focus();
  };

  private handlePopoverShow = () => {
    this.open = true;
  };

  private handlePopoverHide = () => {
    this.open = false;
  };

  private handleClearClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.resetValue();
    (this.textInputEl ?? this.containerEl)?.focus();
  };

  /** "오늘" 퀵액션 — 달력이 이미 `data-today` 로 표시 중인 날을 실제로 선택하는 것뿐이라
   *  `selectDay`를 그대로 탄다
   *  (범위 밖이면 `selectDay`가 조용히 no-op — 클릭 불가 상태인 day 셀과 동일 규약).
   *  datetime 모드에서는 "지금"을 통째로 채우는 것이 소비자 요청의 본질
   *  이라 시간까지 `now`로 덮어쓴다 — 평범한 day 셀 클릭과 달리 기존 시각을 보존하지 않는다. */
  private handleTodayClick = () => {
    const now = new Date();
    const time = this.mode === 'datetime'
      ? `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`
      : undefined;
    this.selectDay(now, time);
  };

  /** 캘린더 팝오버 안 "초기화" 퀵액션 — 트리거의 clear 아이콘(`handleClearClick`)과 값을
   *  비우는 로직은 같지만, 팝오버가 열린 채로 눌렸으므로 선택 완료와 동일하게 닫아 준다. */
  private handleFooterResetClick = () => {
    this.resetValue();
    this.popoverEl?.hide();
    (this.textInputEl ?? this.containerEl)?.focus();
  };

  private resetValue(): void {
    const hadValue = !!this.value;
    this.textEntry.clear();
    this.value = undefined;
    if (hadValue) this.emitChange();
  }

  /** suffix `u-icon`은 순수 표시 요소(버튼 아님)라 네이티브 키보드 활성화가 없다 —
   *  `role="button"`+`tabindex="0"`로 포커스 가능하게 한 뒤, Enter/Space를 같은 클릭
   *  핸들러로 릴레이한다(`UInput`/`USelect`의 동일 패턴과 일치). */
  private handleClearKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    this.handleClearClick(e as unknown as MouseEvent);
  };

  private emitChange(): void {
    if (!this.novalidate) this.validate();
    this.dispatchEvent(new Event('change', { bubbles: true, composed: true }));
  }

  protected setValidity(): void {
    let flags: ValidityStateFlags = {};
    let message = '';

    if (this.textEntry.badText) {
      flags = { badInput: true };
      message = Locale.getValue('badInput');
    } else if (this.required && !this.value) {
      flags = { valueMissing: true };
      message = Locale.getValue('valueMissing');
    } else if (this.value && this.min && splitValue(this.value).date.getTime() < parseISODate(this.min).getTime()) {
      flags = { rangeUnderflow: true };
      message = Locale.getValue('rangeUnderflow', { min: this.min });
    } else if (this.value && this.max && splitValue(this.value).date.getTime() > parseISODate(this.max).getTime()) {
      flags = { rangeOverflow: true };
      message = Locale.getValue('rangeOverflow', { max: this.max });
    }

    this.commit(flags, message, this.textInputEl ?? this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = undefined;
    this.textEntry.clear();
    this.invalid = false;
  }

  /** `.container`는 div라 네이티브 `disabled`가 없다 — disabled일 때 `tabindex="-1"`로만
   *  Tab 순서에서 빠지고 프로그램적 `.focus()`는 여전히 통과하므로, `UInput.focus()`가
   *  네이티브 `disabled` `<input>`에서 얻는 것과 같은 no-op을 여기서 직접 재현한다. */
  public focus(options?: FocusOptions): void {
    if (this.effectivelyDisabled) return;
    (this.textInputEl ?? this.containerEl)?.focus(options);
  }

  public blur(): void {
    (this.textInputEl ?? this.containerEl)?.blur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-date-picker': UDatePicker;
  }
}
