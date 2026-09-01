import { html, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
import '../button/UButton.js';
import '../field/UField.js';
import '../icon/UIcon.js';
import '../icon-button/UIconButton.js';
import '../popover/UPopover.js';

import { UFormControlElement } from "../UFormControlElement.js";
import { Locale, type LocaleTag } from "../../utilities/Locale.js";
import { formatDate } from "../../utilities/format.js";
import { UPopover } from "../popover/UPopover.js";
import { styles } from "./UDatePicker.styles.js";

// Module-scope date helpers — grid assembly only. Locale formatting is owned by
// format.ts (Task 1); these functions only compute "which date does this cell represent".
// The two responsibilities are kept separate.

function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

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

/** Cells to render for the calendar grid — leading `null`s pad the previous month's weekday offset. */
function buildMonthGrid(viewDate: Date): (Date | null)[] {
  const first = startOfMonth(viewDate);
  const startOffset = first.getDay(); // 0=Sun
  const total = daysInMonth(viewDate);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= total; d++) cells.push(new Date(viewDate.getFullYear(), viewDate.getMonth(), d));
  return cells;
}

/** Splits the flat cell list into 7-day weeks — the `role="row"` grouping the APG grid pattern expects. */
function chunkWeeks<T>(cells: T[]): T[][] {
  const weeks: T[][] = [];
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7));
  return weeks;
}

/** 2023-01-01 was a Sunday — a fixed reference date that always yields Sun..Sat order regardless of today. */
function getWeekdayLabels(locale?: LocaleTag): string[] {
  const formatter = new Intl.DateTimeFormat(locale ?? Locale.get(), { weekday: 'narrow' });
  const sunday = new Date(2023, 0, 1);
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(sunday, i)));
}

export type DatePickerMode = 'date' | 'datetime';

/**
 * A single-date(-time)-selection form control. In `mode="date"` (default) the value follows
 * the same convention as the native `input[type=date]`: an ISO `YYYY-MM-DD` string. In
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
 * @csspart field - the u-field element
 * @csspart container - the element wrapping the trigger area
 * @csspart popover - the popover element showing the calendar
 * @csspart calendar - the calendar container
 * @csspart calendar-header - the month navigation header
 * @csspart calendar-title - the "Month Year" title
 * @csspart calendar-weekdays - the weekday header row
 * @csspart calendar-grid - the date grid
 * @csspart day - a date cell button
 * @csspart calendar-footer - the row holding the "today"/"clear" quick-action buttons
 * @csspart calendar-time - the row holding the time-of-day input (datetime mode only)
 *
 * @cssprop --date-picker-popover-width - width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally)
 *
 * @event change - fires when the user clicks a date cell, confirms via keyboard, changes the
 *   time input (datetime mode, once a date is set), or clicks the clear button. Programmatic
 *   value assignment does not fire it (same contract as native form controls).
 */
@customElement('u-date-picker')
export class UDatePicker extends UFormControlElement<string> {
  static styles = [super.styles, styles];

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
  /** Placeholder text (shown on the trigger when there is no value) */
  @property({ type: String }) placeholder?: string;

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;

  /** Unique id wiring the combobox's `aria-controls` to the calendar dialog — mirrors USelect's `listboxId`. */
  private readonly calendarId = `u-date-picker-calendar-${Math.random().toString(36).slice(2, 8)}`;

  @state() private open: boolean = false;
  @state() private viewDate: Date = startOfMonth(new Date());
  @state() private focusedDate: Date = new Date();
  /** Time-of-day for the next selection while no `value` exists yet (`mode="datetime"` only) —
   *  once `value` is set, the time input reads/writes its time portion directly instead. */
  @state() private pendingTime: string = '00:00';

  // Distinguishes "focusedDate changed because the user is navigating the grid with arrow
  // keys" from "focusedDate changed because the header's prev/next-month button was clicked".
  // Only the former should yank focus into the grid — the latter would steal focus back off
  // the header button the user just activated. Set by `moveFocus`/`handlePopoverShow`, left
  // `false` by `navigateMonth`, and consumed (reset) once `updated()` acts on it.
  private grabFocusOnUpdate = false;

  protected updated(changed: PropertyValues): void {
    super.updated(changed);

    if (changed.has('value')) {
      this.internals?.setFormValue(this.value ?? '');
    }
    const shouldGrabFocus =
      (changed.has('open') && this.open) ||
      (changed.has('focusedDate') && this.open && this.grabFocusOnUpdate);
    if (shouldGrabFocus) {
      this.grabFocusOnUpdate = false;
      // The popover's `open` attribute (and the `visibility: hidden -> visible` CSS it drives)
      // reflects on the popover's own update cycle, which runs after this one — focusing a day
      // button before that resolves is a no-op because it is still `visibility: hidden`.
      this.popoverEl?.updateComplete.then(() => this.focusDayButton(this.focusedDate));
    }
  }

  render() {
    // Routed through format.ts's `formatDate` directly (not this file's local `parseISODate`)
    // so a malformed `value` attribute degrades to the raw string instead of throwing and
    // blanking the whole component — `formatDate` owns that fallback.
    const displayText = this.value
      ? formatDate(this.value, this.mode === 'datetime' ? { dateStyle: 'medium', timeStyle: 'short' } : undefined)
      : '';
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
          tabindex=${this.disabled ? '-1' : '0'}
          role="combobox"
          aria-haspopup="dialog"
          aria-expanded=${this.open}
          aria-label=${ifDefined(this.label)}
          aria-description=${ifDefined(this.description)}
          aria-controls=${this.calendarId}
        >
          <span class="text-content ${!displayText ? 'placeholder' : ''}">${displayText || this.placeholder || ''}</span>
          <u-icon class="suffix-item"
            ?hidden=${!this.clearable || !this.value || this.disabled || this.readonly}
            role="button"
            tabindex="0"
            aria-label=${Locale.getValue('clear')}
            lib="internal"
            name="x"
            @click=${this.handleClearClick}
            @keydown=${this.handleClearKeydown}
          ></u-icon>
          <u-icon class="suffix-item"
            lib="internal"
            name="calendar"
          ></u-icon>
        </div>
      </u-field>

      <u-popover part="popover"
        id=${this.calendarId}
        role="dialog"
        aria-label=${Locale.getValue('chooseDate')}
        for=".container"
        trigger="click"
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
    const cells = buildMonthGrid(this.viewDate);
    const monthLabel = formatDate(this.viewDate, { year: 'numeric', month: 'long' });
    const weekdayLabels = getWeekdayLabels();

    return html`
      <div class="calendar" part="calendar">
        <div class="calendar-header" part="calendar-header">
          <u-icon-button lib="internal" name="chevron-left" aria-label=${Locale.getValue('previousMonth')} @click=${this.handlePrevMonth}></u-icon-button>
          <span class="calendar-title" part="calendar-title">${monthLabel}</span>
          <u-icon-button lib="internal" name="chevron-right" aria-label=${Locale.getValue('nextMonth')} @click=${this.handleNextMonth}></u-icon-button>
        </div>
        <div class="calendar-weekdays" part="calendar-weekdays" role="row">
          ${weekdayLabels.map(w => html`<span class="weekday" role="columnheader">${w}</span>`)}
        </div>
        <div class="calendar-grid" part="calendar-grid" role="grid">
          ${chunkWeeks(cells).map(week => html`
            <div class="calendar-week" part="calendar-week" role="row">
              ${week.map(date => date ? this.renderDay(date) : html`<span class="day-empty" role="gridcell" aria-hidden="true"></span>`)}
            </div>
          `)}
        </div>
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
    const todayDisabled = this.isOutOfRange(new Date());
    return html`
      <div class="calendar-footer" part="calendar-footer">
        <u-button variant="ghost" size="sm" ?disabled=${todayDisabled} @click=${this.handleTodayClick}>${Locale.getValue('today')}</u-button>
        ${this.clearable && this.value ? html`
          <u-button variant="ghost" size="sm" @click=${this.handleFooterResetClick}>${Locale.getValue('clear')}</u-button>
        ` : ''}
      </div>
    `;
  }

  private renderDay(date: Date) {
    const selected = this.value ? isSameDay(date, splitValue(this.value).date) : false;
    const focused = isSameDay(date, this.focusedDate);
    const today = isSameDay(date, new Date());
    const outOfRange = this.isOutOfRange(date);

    return html`
      <button type="button" class="day" part="day"
        role="gridcell"
        data-iso=${toISODate(date)}
        tabindex=${focused ? 0 : -1}
        aria-selected=${selected}
        aria-disabled=${outOfRange}
        ?data-today=${today}
        @click=${() => this.selectDay(date)}
        @keydown=${(e: KeyboardEvent) => this.handleDayKeydown(e, date)}
        @focus=${() => { this.focusedDate = date; }}
      >${date.getDate()}</button>
    `;
  }

  private isOutOfRange(date: Date): boolean {
    if (this.min && date.getTime() < parseISODate(this.min).getTime()) return true;
    if (this.max && date.getTime() > parseISODate(this.max).getTime()) return true;
    return false;
  }

  private focusDayButton(date: Date): void {
    const iso = toISODate(date);
    const btn = this.renderRoot.querySelector<HTMLButtonElement>(`button.day[data-iso="${iso}"]`);
    btn?.focus();
  }

  /** `timeOverride` lets a caller force the time-of-day (the "today" quick action wants
   *  "right now", overriding whatever time was previously set) — a plain day-cell click omits
   *  it, which preserves the existing time-of-day (or `pendingTime`) so switching the date
   *  alone doesn't clobber a time the user already picked. */
  private selectDay(date: Date, timeOverride?: string): void {
    if (this.isOutOfRange(date)) return;
    const time = timeOverride ?? (this.value ? splitValue(this.value).time : this.pendingTime);
    const iso = buildValue(date, this.mode, time);
    const changed = iso !== this.value;
    this.value = iso;
    if (this.mode === 'datetime') this.pendingTime = time;
    if (changed) this.emitChange();
    this.popoverEl?.hide();
    this.containerEl?.focus();
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
    this.value = iso;
    if (changed) this.emitChange();
  };

  private handlePrevMonth = () => this.navigateMonth(-1);
  private handleNextMonth = () => this.navigateMonth(1);

  private navigateMonth(delta: number): void {
    this.grabFocusOnUpdate = false;
    const next = addMonths(this.viewDate, delta);
    this.viewDate = next;
    const clampedDay = Math.min(this.focusedDate.getDate(), daysInMonth(next));
    this.focusedDate = new Date(next.getFullYear(), next.getMonth(), clampedDay);
  }

  private handleDayKeydown = (e: KeyboardEvent, date: Date) => {
    switch (e.key) {
      case 'ArrowRight':
        e.preventDefault();
        this.moveFocus(date, 1);
        break;
      case 'ArrowLeft':
        e.preventDefault();
        this.moveFocus(date, -1);
        break;
      case 'ArrowDown':
        e.preventDefault();
        this.moveFocus(date, 7);
        break;
      case 'ArrowUp':
        e.preventDefault();
        this.moveFocus(date, -7);
        break;
      case 'Home':
        e.preventDefault();
        this.moveFocus(date, -date.getDay());
        break;
      case 'End':
        e.preventDefault();
        this.moveFocus(date, 6 - date.getDay());
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        this.selectDay(date);
        break;
      case 'Escape':
        e.preventDefault();
        this.popoverEl?.hide();
        this.containerEl?.focus();
        break;
    }
  };

  private moveFocus(from: Date, deltaDays: number): void {
    this.grabFocusOnUpdate = true;
    const next = addDays(from, deltaDays);
    if (next.getMonth() !== this.viewDate.getMonth() || next.getFullYear() !== this.viewDate.getFullYear()) {
      this.viewDate = startOfMonth(next);
    }
    this.focusedDate = next;
  }

  private handlePopoverShow = () => {
    this.open = true;
    this.grabFocusOnUpdate = true;
    const base = this.value ? splitValue(this.value).date : new Date();
    this.viewDate = startOfMonth(base);
    this.focusedDate = base;
  };

  private handlePopoverHide = () => {
    this.open = false;
  };

  private handleClearClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    this.resetValue();
    this.containerEl?.focus();
  };

  /** "오늘" 퀵액션 — `today` 셀이 이미 렌더에서 계산해 표시 중인 값(`renderDay`의
   *  `isSameDay(date, new Date())`)을 실제로 선택하는 것뿐이라 `selectDay`를 그대로 탄다
   *  (범위 밖이면 `selectDay`가 조용히 no-op — 클릭 불가 상태인 day 셀과 동일 규약).
   *  datetime 모드에서는 "지금"을 통째로 채우는 것이 요청의 본질(§D-28 항목 2 docket 코멘트)
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
    this.containerEl?.focus();
  };

  private resetValue(): void {
    const hadValue = !!this.value;
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

    if (this.required && !this.value) {
      flags = { valueMissing: true };
      message = Locale.getValue('valueMissing');
    } else if (this.value && this.min && splitValue(this.value).date.getTime() < parseISODate(this.min).getTime()) {
      flags = { rangeUnderflow: true };
      message = Locale.getValue('rangeUnderflow', { min: this.min });
    } else if (this.value && this.max && splitValue(this.value).date.getTime() > parseISODate(this.max).getTime()) {
      flags = { rangeOverflow: true };
      message = Locale.getValue('rangeOverflow', { max: this.max });
    }

    this.commit(flags, message, this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = undefined;
    this.invalid = false;
  }

  /** `.container`는 div라 네이티브 `disabled`가 없다 — disabled일 때 `tabindex="-1"`로만
   *  Tab 순서에서 빠지고 프로그램적 `.focus()`는 여전히 통과하므로, `UInput.focus()`가
   *  네이티브 `disabled` `<input>`에서 얻는 것과 같은 no-op을 여기서 직접 재현한다. */
  public focus(options?: FocusOptions): void {
    if (this.disabled) return;
    this.containerEl?.focus(options);
  }

  public blur(): void {
    this.containerEl?.blur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-date-picker': UDatePicker;
  }
}
