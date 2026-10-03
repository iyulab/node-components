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
import {
  dateTextPattern, formatDateRangeText, formatDateTimeRangeText, parseDateRange, parseDateTimeRange,
  type DateTextFormat,
} from "../../utilities/format.js";
import { UCalendar, type CalendarRangeSelectDetail } from "../calendar/UCalendar.js";
import { DateTextController } from "../calendar/date-text-controller.js";
import { parseISODate, type DateDisabledFn } from "../calendar/dates.js";
import { normalizeTime, splitDateTime, toDateTimeOffset } from "../calendar/datetime.js";
import type { DatePickerMode } from "../date-picker/UDatePicker.js";
import { styles as pickerStyles } from "../calendar/picker.styles.js";
import { UPopover } from "../popover/UPopover.js";
import { devWarnOnce } from "../../utilities/devWarning.js";
import { resolvePresets, type DateRangePresetOption, type ResolvedPreset } from "./presets.js";
import { styles } from "./UDateRangePicker.styles.js";

export type { DateRangePreset, DateRangePresetName, DateRangePresetOption } from "./presets.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const ISO_DATE_TIME = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;

/** Splits `"start/end"` into its two halves — ISO dates, or in `mode="datetime"` ISO date-times;
 *  `undefined` unless both halves have that shape. */
function parseInterval(value: string | undefined, mode: DatePickerMode): { start: string; end: string } | undefined {
  if (!value) return undefined;
  const [start, end, ...rest] = value.split('/');
  const shape = mode === 'datetime' ? ISO_DATE_TIME : ISO_DATE;
  if (rest.length || !shape.test(start ?? '') || !shape.test(end ?? '')) return undefined;
  return { start, end };
}

/** Whether `start` comes after `end` — by day in `date` mode, by instant in `datetime` mode. */
function reversed(start: string, end: string, mode: DatePickerMode): boolean {
  return mode === 'datetime' ? new Date(start).getTime() > new Date(end).getTime() : start > end;
}

/** The ISO day of a half (`YYYY-MM-DD` either way). */
const dayPart = (half: string) => half.slice(0, 10);


/**
 * A date-range form control — one field for a period such as "orders placed between".
 *
 * The value is an ISO 8601 time interval of two calendar days, `YYYY-MM-DD/YYYY-MM-DD`, start
 * first: one string, so it works as an attribute and submits with a form as a single field.
 * `start` and `end` read the two halves. The picker never holds a reversed range — choosing the
 * earlier day second makes it the start, and a reversed value set from code is put in order.
 *
 * The field is a text box: type `2026-10-01 ~ 2026-10-31` (also `–`, ` - `, the ISO interval with
 * `/`, a short second day such as `10-31`, or one day for a one-day range) and press Enter or leave
 * the field. It shows `YYYY-MM-DD – YYYY-MM-DD` whatever the browser language, or the locale's
 * numeric order with `format="locale"`. Clicking the field opens the calendar and keeps the caret
 * in the text box; ArrowDown (or Alt+ArrowDown) moves into the calendar. Text that is not a range
 * clears the value and reports `badInput`.
 *
 * `mode="datetime"` adds a start time and an end time: each half of the value is a complete
 * ISO-8601 `DateTimeOffset` (`2026-10-01T09:00:00+09:00/2026-10-31T18:00:00+09:00`), and the text
 * box reads `2026-10-01 09:00 ~ 2026-10-31 18:00` or `2026-10-01 09:00 ~ 18:00` (a time alone ends on
 * the first day). The first range picked covers its days whole (00:00 to 23:59); after that, picking
 * other days keeps the times set. `min`/`max` and `isDateDisabled` stay date-only.
 *
 * The calendar shows two months. The first day chosen is an anchor and the range previews up to
 * the day under the pointer or keyboard focus; the second day completes the range, fires
 * `change` and closes the calendar. Escape while an anchor is set drops it; Escape again closes.
 *
 * `presets` adds a list of quick ranges beside the calendar — built-in names (`today`, `yesterday`,
 * `last7Days`, `last30Days`, `thisWeek`, `lastWeek`, `thisMonth`, `lastMonth`, `thisYear`, which
 * can be written as a space-separated attribute) and app-defined `{ label, range }` objects, in the
 * order given. Picking one sets the range at once, fires `change` and closes the calendar. A preset
 * whose range reaches outside `min`/`max` is disabled; the one equal to the current range is
 * marked `aria-pressed="true"`. Relative ranges are computed when drawn.
 *
 * The calendar week starts on Sunday regardless of locale (same as `u-date-picker`); `thisWeek` and
 * `lastWeek` follow it.
 *
 * Exposes a `:state(open)` custom state while the calendar is showing.
 *
 * @csspart field - the u-field element
 * @csspart input - the text box
 * @csspart container - the element wrapping the trigger area
 * @csspart popover - the popover element showing the calendar
 * @csspart calendar - the calendar container
 * @csspart calendar-month - one month block
 * @csspart calendar-header - a month navigation header
 * @csspart calendar-title - a "Month Year" title
 * @csspart calendar-weekdays - a weekday header row
 * @csspart calendar-grid - a date grid
 * @csspart calendar-week - one week row inside a date grid
 * @csspart day - a date cell button
 * @csspart calendar-time - the row holding the start and end time inputs (`mode="datetime"` only)
 * @csspart time-input - a time-of-day input (`mode="datetime"` only)
 * @csspart calendar-footer - the row holding the "clear" quick action
 * @csspart presets - the list of quick ranges beside the calendar
 * @csspart preset - one quick-range button
 *
 * @cssprop --u-date-range-picker-display - host `display` (default: inline-block). Set `block` to
 *   fill the container width in forms and grid cells.
 * @cssprop --u-date-range-picker-width - host `width` (default: auto). Set `100%` where `block`
 *   alone does not stretch the host (e.g. inside a flex container).
 *
 * @event change - fires when the user completes a range or clears it (with `confirm`, when Apply
 *   commits a different value). Programmatic value
 *   assignment does not fire it (same contract as native form controls).
 */
@customElement('u-date-range-picker')
export class UDateRangePicker extends UFormControlElement<string> {
  static styles = [super.styles, pickerStyles, styles];

  /** Earliest selectable day (ISO `YYYY-MM-DD`), inclusive. */
  @property({ type: String }) min?: string;
  /** Latest selectable day (ISO `YYYY-MM-DD`), inclusive. */
  @property({ type: String }) max?: string;
  /** Whether to show the clear button */
  @property({ type: Boolean, reflect: true }) clearable: boolean = false;
  /** App rule for days that cannot be chosen — receives the ISO day, returns `true` to disable it.
   *  Such a day cannot start or end a range, though a range may run across it (a week across a
   *  weekend); a preset that starts or ends on one is disabled. A typed or assigned range that starts
   *  or ends on one reports `stepMismatch`. Property only. */
  @property({ attribute: false }) isDateDisabled?: DateDisabledFn;
  /** Placeholder text (shown when there is no value). Defaults to the pattern to type. */
  @property({ type: String }) placeholder?: string;
  /** How the text box writes and reads each day: `iso` (default, `YYYY-MM-DD` in every language) or
   *  `locale` (the active locale's numeric order). ISO is read in both. The value is ISO either way. */
  @property({ type: String, reflect: true }) format: DateTextFormat = 'iso';
  /**
   * Quick ranges listed beside the calendar, in display order — built-in names and app-defined
   * `{ label, range }` presets. As an attribute: space-separated built-in names
   * (`presets="today last7Days thisMonth"`). Empty (default) shows no list.
   */
  @property({
    attribute: 'presets',
    converter: { fromAttribute: (v: string | null) => (v ?? '').split(/\s+/).filter(Boolean) },
  })
  presets: DateRangePresetOption[] = [];
  /** Picks in the calendar wait for an Apply button instead of committing at once. Completing a
   *  range, choosing a preset or "clear" inside the calendar only stages the choice; Apply commits
   *  it, fires `change` and closes; Cancel, Escape or closing the calendar any other way drops it.
   *  Typing in the text box still commits on Enter or leaving the field. */
  @property({ type: Boolean, reflect: true }) confirm: boolean = false;
  /** `date` (default) picks a period of days. `datetime` adds a start and an end time; each half of
   *  the value becomes a complete ISO-8601 `DateTimeOffset` (`…T09:00:00+09:00/…T18:00:00+09:00`). */
  @property({ type: String, reflect: true }) mode: DatePickerMode = 'date';
  /** `mode="datetime"`: times are entered to the second — the time inputs show seconds, the text box
   *  reads and shows `HH:mm:ss`, and a whole day ends at `23:59:59`. */
  @property({ type: Boolean, reflect: true }) seconds: boolean = false;

  /** Start of the range — the ISO day, or in `mode="datetime"` the ISO date-time; `undefined` when
   *  there is no complete range. */
  get start(): string | undefined {
    return parseInterval(this.value, this.mode)?.start;
  }

  /** End of the range — the ISO day, or in `mode="datetime"` the ISO date-time; `undefined` when
   *  there is no complete range. */
  get end(): string | undefined {
    return parseInterval(this.value, this.mode)?.end;
  }

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;
  @query('u-calendar') calendarEl?: UCalendar;

  private readonly calendarId = `u-date-range-picker-calendar-${Math.random().toString(36).slice(2, 8)}`;

  @state() private open: boolean = false;
  /** With `confirm`, the range chosen in the open calendar that Apply would commit. */
  @state() private staged?: string;
  /** `mode="datetime"`: the times the next range takes while there is none yet — once a range
   *  exists, the time inputs read and write its halves instead. */
  @state() private pendingTimes?: { start: string; end: string };

  /** Times a whole-day range takes in `mode="datetime"` — a preset or a first calendar pick: from
   *  the first minute (or second, with `seconds`) to the last. */
  private get wholeDay(): { start: string; end: string } {
    return this.seconds ? { start: '00:00:00', end: '23:59:59' } : { start: '00:00', end: '23:59' };
  }
  /** The typed-range text box — what is being typed, committing it, opening the calendar. */
  private readonly textEntry = new DateTextController(this, {
    toValue: (text) => {
      if (!text.trim()) return undefined;
      const range = this.parseTyped(text);
      if (!range) return null;
      return this.build(dayPart(range.start), dayPart(range.end), {
        start: range.start.slice(11) || this.wholeDay.start,
        end: range.end.slice(11) || this.wholeDay.end,
      });
    },
    dayOf: (text) => {
      const start = this.parseTyped(text)?.start;
      return start ? dayPart(start) : null;
    },
    shown: () => {
      const range = parseInterval(this.value, this.mode);
      if (!range) return this.value ?? '';
      return this.mode === 'datetime'
        ? formatDateTimeRangeText(range.start, range.end, this.format, undefined, this.seconds)
        : formatDateRangeText(range.start, range.end, this.format);
    },
    onChange: () => this.emitChange(),
    onBadText: () => { if (!this.novalidate) this.validate(); },
    popover: () => this.popoverEl,
    calendar: () => this.calendarEl,
    container: () => this.containerEl,
    input: () => this.textInputEl,
    interactive: () => !this.effectivelyDisabled && !this.readonly,
  });

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    // A reversed range set from code is put in order — the picker never holds end < start.
    // Not a user action, so no `change` (same as any programmatic assignment).
    if (changed.has('value')) {
      const range = parseInterval(this.value, this.mode);
      if (range && reversed(range.start, range.end, this.mode)) this.value = `${range.end}/${range.start}`;
    }
    // `confirm`: each opening starts from the value, and a value committed another way while the
    // calendar is open (typed text) replaces what was staged.
    if (this.open && (changed.has('open') || changed.has('value'))) this.staged = this.value;
  }

  /** What the open calendar shows and edits: the staged range with `confirm`, otherwise the value. */
  private get working(): string | undefined {
    return this.confirm && this.open ? this.staged : this.value;
  }

  /** The times the working range has — or, without one, the ones the next range takes. */
  private workingTimes(): { start: string; end: string } {
    const range = parseInterval(this.working, this.mode);
    if (this.mode !== 'datetime' || !range) return this.pendingTimes ?? this.wholeDay;
    return { start: splitDateTime(range.start, true).time, end: splitDateTime(range.end, true).time };
  }

  /** The value for two days (and, in `mode="datetime"`, two times), earlier first. */
  private build(startDay: string, endDay: string, times: { start: string; end: string }): string {
    if (this.mode !== 'datetime') return `${startDay}/${endDay}`;
    const start = toDateTimeOffset(startDay, times.start);
    const end = toDateTimeOffset(endDay, times.end);
    return reversed(start, end, this.mode) ? `${end}/${start}` : `${start}/${end}`;
  }

  /** Typed text as a range — days, or in `mode="datetime"` local date-times. A day typed without a
   *  time keeps the working range's time at that end. */
  private parseTyped(text: string): { start: string; end: string } | null {
    if (this.mode !== 'datetime') return parseDateRange(text, { format: this.format });
    const times = this.workingTimes();
    return parseDateTimeRange(text, { format: this.format, startTime: times.start, endTime: times.end, seconds: this.seconds });
  }

  protected shouldValidate(changed: PropertyValues): boolean {
    return super.shouldValidate(changed) || changed.has('min') || changed.has('max') || changed.has('isDateDisabled');
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('value')) {
      this.internals?.setFormValue(this.value ?? '');
    }
    if (changed.has('open')) {
      this.internals?.states[this.open ? 'add' : 'delete']('open');
    }
    if (changed.has('open') && this.open) {
      // The calendar renders only while open, so a stale half-picked range never survives a
      // reopen. Focus waits for the popover's own update (it is `visibility: hidden` until then).
      this.textEntry.calendarOpened(this.start ? dayPart(this.start) : new Date());
    }
  }

  render() {
    const pattern = this.mode === 'datetime' ? `${dateTextPattern(this.format)} ${this.seconds ? 'HH:mm:ss' : 'HH:mm'}` : dateTextPattern(this.format);
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
            autocomplete="off"
            role="combobox"
            aria-haspopup="dialog"
            aria-expanded=${this.open}
            aria-controls=${this.calendarId}
            aria-label=${ifDefined(this.resolvedAriaLabel)}
            aria-description=${ifDefined(this.resolvedAriaDescription)}
            aria-invalid=${this.textEntry.badText ? 'true' : 'false'}
            placeholder=${this.placeholder ?? `${pattern} – ${pattern}`}
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
            aria-label=${Locale.getValue('chooseDateRange')}
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
        aria-label=${Locale.getValue('chooseDateRange')}
        for=".container"
        trigger="manual"
        strategy="fixed"
        placement="bottom-start"
        offset="4"
        shift
        @show=${this.handlePopoverShow}
        @hide=${this.handlePopoverHide}
      >
        ${this.open ? this.renderCalendar() : ''}
      </u-popover>
    `;
  }

  private renderCalendar() {
    const presets = resolvePresets(this.presets, new Date(), name =>
      devWarnOnce(`date-range-preset:${name}`, `u-date-range-picker: unknown preset "${name}" — it is not listed.`));
    const working = parseInterval(this.working, this.mode);
    const showClear = this.clearable && !!this.working;
    return html`
      <div class="body">
        ${presets.length ? this.renderPresets(presets) : ''}
        <div class="calendar" part="calendar">
          <u-calendar
            exportparts="calendar-month, calendar-header, calendar-title, calendar-weekdays, calendar-grid, calendar-week, day"
            selection="range"
            visible-months="2"
            .start=${working && dayPart(working.start)}
            .end=${working && dayPart(working.end)}
            .min=${this.min}
            .max=${this.max}
            .isDateDisabled=${this.isDateDisabled}
            @range-select=${this.handleRangeSelect}
            @keydown=${this.handleCalendarKeydown}
          ></u-calendar>
          ${this.renderTimeRow()}
          ${showClear || this.confirm ? html`
            <div class="calendar-footer" part="calendar-footer">
              ${showClear ? html`
                <u-button variant="ghost" size="sm" @click=${this.handleFooterResetClick}>${Locale.getValue('clear')}</u-button>
              ` : ''}
              ${this.confirm ? html`
                <span class="confirm-actions">
                  <u-button variant="ghost" size="sm" @click=${this.handleCancelClick}>${Locale.getValue('cancel')}</u-button>
                  <u-button size="sm" @click=${this.handleApplyClick}>${Locale.getValue('apply')}</u-button>
                </span>
              ` : ''}
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderTimeRow() {
    if (this.mode !== 'datetime') return '';
    const times = this.workingTimes();
    return html`
      <div class="calendar-time" part="calendar-time">
        <label class="time-field">${Locale.getValue('startTime')}
          <input type="time" class="time-input" part="time-input"
            step=${ifDefined(this.seconds ? '1' : undefined)}
            .value=${normalizeTime(times.start, this.seconds)}
            @change=${(e: Event) => this.handleTimeChange('start', e)}
          />
        </label>
        <label class="time-field">${Locale.getValue('endTime')}
          <input type="time" class="time-input" part="time-input"
            step=${ifDefined(this.seconds ? '1' : undefined)}
            .value=${normalizeTime(times.end, this.seconds)}
            @change=${(e: Event) => this.handleTimeChange('end', e)}
          />
        </label>
      </div>
    `;
  }

  /** A time input changed — with a range, that end moves (committed at once, or staged with
   *  `confirm`; the calendar stays open); without one, the next range takes it. A start time set
   *  after the end on the same day swaps the two, as a reversed range always is. */
  private handleTimeChange(which: 'start' | 'end', e: Event): void {
    const time = normalizeTime((e.target as HTMLInputElement).value || this.wholeDay[which], this.seconds);
    const times = { ...this.workingTimes(), [which]: time };
    this.pendingTimes = times;
    const range = parseInterval(this.working, this.mode);
    if (!range) return;
    const next = this.build(dayPart(range.start), dayPart(range.end), times);
    if (this.confirm) {
      this.staged = next;
      return;
    }
    const changed = next !== this.value;
    this.textEntry.clear();
    this.value = next;
    if (changed) this.emitChange();
  }

  private renderPresets(presets: ResolvedPreset[]) {
    return html`
      <div class="presets" part="presets" role="group" aria-label=${Locale.getValue('quickRanges')}>
        ${presets.map(p => html`
          <button type="button" class="preset" part="preset"
            aria-pressed=${this.build(p.start, p.end, this.wholeDay) === this.working}
            ?disabled=${this.unavailable(p)}
            @click=${() => this.commitRange(p.start, p.end, this.wholeDay)}
          >${p.label}</button>
        `)}
      </div>
    `;
  }

  /** A preset that reaches outside `min`/`max`, or starts or ends on a disabled day, is not
   *  offered — its label would promise a range the calendar itself refuses. */
  private unavailable(p: { start: string; end: string }): boolean {
    return (!!this.min && p.start < this.min) || (!!this.max && p.end > this.max)
      || this.endpointDisabled(p);
  }

  /** Whether `isDateDisabled` refuses either end of the range (the days between may be disabled). */
  private endpointDisabled(p: { start: string; end: string }): boolean {
    return !!this.isDateDisabled && (this.isDateDisabled(dayPart(p.start)) || this.isDateDisabled(dayPart(p.end)));
  }

  private handleRangeSelect = (e: CustomEvent<CalendarRangeSelectDetail>) => {
    this.commitRange(e.detail.start, e.detail.end, this.workingTimes());
  };

  /** A user-chosen range of days (calendar or preset) at `times` (`mode="datetime"`): set it,
   *  announce it, close the calendar — or, with `confirm`, stage it for Apply. A calendar pick keeps
   *  the times already set; a preset covers its days whole. */
  private commitRange(start: string, end: string, times: { start: string; end: string }): void {
    const next = this.build(start, end, times);
    if (this.confirm) {
      this.staged = next;
      return;
    }
    this.commitValue(next);
  }

  /** Commits `next` as the value (firing `change` when it differs), closes the calendar and
   *  returns focus to the text box. */
  private commitValue(next: string | undefined): void {
    const changed = next !== this.value;
    this.textEntry.clear();
    this.value = next;
    if (changed) this.emitChange();
    this.popoverEl?.hide();
    this.textInputEl?.focus();
  }

  private get textInputEl(): HTMLInputElement | null {
    return this.renderRoot.querySelector('.text-input');
  }

  /** Escape that reaches the picker closes the calendar — the calendar keeps the first Escape
   *  for itself while a range is half picked. */
  private handleCalendarKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    this.popoverEl?.hide();
    this.textInputEl?.focus();
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
    this.textInputEl?.focus();
  };

  private handleFooterResetClick = () => {
    if (this.confirm) {
      this.staged = undefined;
      return;
    }
    this.resetValue();
    this.popoverEl?.hide();
    this.textInputEl?.focus();
  };

  /** `confirm` 모드의 «적용» — 달력에서 고른 범위를 값으로 확정한다(비운 채면 값을 비운다). */
  private handleApplyClick = () => {
    this.commitValue(this.staged);
  };

  /** `confirm` 모드의 «취소» — 고른 것은 다음에 열 때 값에서 다시 시작하므로 닫기만 하면 버려진다. */
  private handleCancelClick = () => {
    this.popoverEl?.hide();
    this.textInputEl?.focus();
  };

  private resetValue(): void {
    const hadValue = !!this.value;
    this.textEntry.clear();
    this.value = undefined;
    if (hadValue) this.emitChange();
  }

  /** The clear icon is a display element — relay Enter/Space to its click handler
   *  (same pattern as `u-date-picker`, `u-input`, `u-select`). */
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
    const parsed = parseInterval(this.value, this.mode);
    const range = parsed && { start: dayPart(parsed.start), end: dayPart(parsed.end) };

    if (this.textEntry.badText) {
      flags = { badInput: true };
      message = Locale.getValue('badInput');
    } else if (this.required && !this.value) {
      flags = { valueMissing: true };
      message = Locale.getValue('valueMissing');
    } else if (this.value && !range) {
      flags = { badInput: true };
      message = Locale.getValue('badInput');
    } else if (range && this.min && parseISODate(range.start) < parseISODate(this.min)) {
      flags = { rangeUnderflow: true };
      message = Locale.getValue('rangeUnderflow', { min: this.min });
    } else if (range && this.max && parseISODate(range.end) > parseISODate(this.max)) {
      flags = { rangeOverflow: true };
      message = Locale.getValue('rangeOverflow', { max: this.max });
    } else if (range && this.endpointDisabled(range)) {
      // The native analogue is a date input's `step`: a readable day the control does not allow.
      flags = { stepMismatch: true };
      message = Locale.getValue('dateUnavailable');
    }

    this.commit(flags, message, this.textInputEl ?? this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = undefined;
    this.textEntry.clear();
    this.invalid = false;
  }

  public focus(options?: FocusOptions): void {
    if (this.effectivelyDisabled) return;
    this.textInputEl?.focus(options);
  }

  public blur(): void {
    this.textInputEl?.blur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-date-range-picker': UDateRangePicker;
  }
}
