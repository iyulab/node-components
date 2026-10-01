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
import { formatDateRange } from "../../utilities/format.js";
import { UCalendar, type CalendarRangeSelectDetail } from "../calendar/UCalendar.js";
import { parseISODate } from "../calendar/dates.js";
import { styles as pickerStyles } from "../calendar/picker.styles.js";
import { UPopover } from "../popover/UPopover.js";
import { styles } from "./UDateRangePicker.styles.js";

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Splits `"start/end"` into its two ISO dates — `undefined` unless both halves are ISO dates. */
function parseInterval(value?: string): { start: string; end: string } | undefined {
  if (!value) return undefined;
  const [start, end, ...rest] = value.split('/');
  if (rest.length || !ISO_DATE.test(start ?? '') || !ISO_DATE.test(end ?? '')) return undefined;
  return { start, end };
}

/**
 * A date-range form control — one field for a period such as "orders placed between".
 *
 * The value is an ISO 8601 time interval of two calendar days, `YYYY-MM-DD/YYYY-MM-DD`, start
 * first: one string, so it works as an attribute and submits with a form as a single field.
 * `start` and `end` read the two halves. The picker never holds a reversed range — choosing the
 * earlier day second makes it the start, and a reversed value set from code is put in order.
 *
 * The calendar shows two months. The first day chosen is an anchor and the range previews up to
 * the day under the pointer or keyboard focus; the second day completes the range, fires
 * `change` and closes the calendar. Escape while an anchor is set drops it; Escape again closes.
 *
 * The calendar week starts on Sunday regardless of locale (same as `u-date-picker`).
 *
 * Exposes a `:state(open)` custom state while the calendar is showing.
 *
 * @csspart field - the u-field element
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
 * @csspart calendar-footer - the row holding the "clear" quick action
 *
 * @cssprop --u-date-range-picker-display - host `display` (default: inline-block). Set `block` to
 *   fill the container width in forms and grid cells.
 * @cssprop --u-date-range-picker-width - host `width` (default: auto). Set `100%` where `block`
 *   alone does not stretch the host (e.g. inside a flex container).
 *
 * @event change - fires when the user completes a range or clears it. Programmatic value
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
  /** Placeholder text (shown on the trigger when there is no value) */
  @property({ type: String }) placeholder?: string;

  /** First day of the range (ISO), or `undefined` when there is no complete range. */
  get start(): string | undefined {
    return parseInterval(this.value)?.start;
  }

  /** Last day of the range (ISO), or `undefined` when there is no complete range. */
  get end(): string | undefined {
    return parseInterval(this.value)?.end;
  }

  @query('.container', true) containerEl?: HTMLElement;
  @query('u-popover', true) popoverEl?: UPopover;
  @query('u-calendar') calendarEl?: UCalendar;

  private readonly calendarId = `u-date-range-picker-calendar-${Math.random().toString(36).slice(2, 8)}`;

  @state() private open: boolean = false;

  protected willUpdate(changed: PropertyValues): void {
    super.willUpdate(changed);
    // A reversed range set from code is put in order — the picker never holds end < start.
    // Not a user action, so no `change` (same as any programmatic assignment).
    if (changed.has('value')) {
      const range = parseInterval(this.value);
      if (range && range.start > range.end) this.value = `${range.end}/${range.start}`;
    }
  }

  protected shouldValidate(changed: PropertyValues): boolean {
    return super.shouldValidate(changed) || changed.has('min') || changed.has('max');
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
      const calendar = this.calendarEl;
      calendar?.showDate(this.start ?? new Date());
      this.popoverEl?.updateComplete.then(() => calendar?.focusDay());
    }
  }

  render() {
    const range = parseInterval(this.value);
    const displayText = range
      ? formatDateRange(range.start, range.end)
      : this.value ?? '';
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
          tabindex=${this.effectivelyDisabled ? '-1' : '0'}
          role="combobox"
          aria-disabled=${ifDefined(this.effectivelyDisabled ? 'true' : undefined)}
          aria-haspopup="dialog"
          aria-expanded=${this.open}
          aria-label=${ifDefined(this.resolvedAriaLabel)}
          aria-description=${ifDefined(this.resolvedAriaDescription)}
          aria-controls=${this.calendarId}
        >
          <span class="text-content ${!displayText ? 'placeholder' : ''}">${displayText || this.placeholder || ''}</span>
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
          <u-icon class="suffix-item"
            lib="internal"
            name="calendar"
          ></u-icon>
        </div>
      </u-field>

      <u-popover part="popover"
        id=${this.calendarId}
        role="dialog"
        aria-label=${Locale.getValue('chooseDateRange')}
        for=".container"
        trigger="click"
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
    return html`
      <div class="calendar" part="calendar">
        <u-calendar
          exportparts="calendar-month, calendar-header, calendar-title, calendar-weekdays, calendar-grid, calendar-week, day"
          selection="range"
          visible-months="2"
          .start=${this.start}
          .end=${this.end}
          .min=${this.min}
          .max=${this.max}
          @range-select=${this.handleRangeSelect}
          @keydown=${this.handleCalendarKeydown}
        ></u-calendar>
        ${this.clearable && this.value ? html`
          <div class="calendar-footer" part="calendar-footer">
            <u-button variant="ghost" size="sm" @click=${this.handleFooterResetClick}>${Locale.getValue('clear')}</u-button>
          </div>
        ` : ''}
      </div>
    `;
  }

  private handleRangeSelect = (e: CustomEvent<CalendarRangeSelectDetail>) => {
    const next = `${e.detail.start}/${e.detail.end}`;
    const changed = next !== this.value;
    this.value = next;
    if (changed) this.emitChange();
    this.popoverEl?.hide();
    this.containerEl?.focus();
  };

  /** Escape that reaches the picker closes the calendar — the calendar keeps the first Escape
   *  for itself while a range is half picked. */
  private handleCalendarKeydown = (e: KeyboardEvent) => {
    if (e.key !== 'Escape') return;
    e.preventDefault();
    this.popoverEl?.hide();
    this.containerEl?.focus();
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
    this.containerEl?.focus();
  };

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
    const range = parseInterval(this.value);

    if (this.required && !this.value) {
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
    }

    this.commit(flags, message, this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = undefined;
    this.invalid = false;
  }

  /** `.container` is a div — no native `disabled`, so a disabled picker ignores `focus()` here. */
  public focus(options?: FocusOptions): void {
    if (this.effectivelyDisabled) return;
    this.containerEl?.focus(options);
  }

  public blur(): void {
    this.containerEl?.blur();
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-date-range-picker': UDateRangePicker;
  }
}
