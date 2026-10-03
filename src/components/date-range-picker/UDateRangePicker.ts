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
import { dateTextPattern, formatDateRangeText, parseDateRange, type DateTextFormat } from "../../utilities/format.js";
import { UCalendar, type CalendarRangeSelectDetail } from "../calendar/UCalendar.js";
import { DateTextController } from "../calendar/date-text-controller.js";
import { parseISODate } from "../calendar/dates.js";
import { styles as pickerStyles } from "../calendar/picker.styles.js";
import { UPopover } from "../popover/UPopover.js";
import { devWarnOnce } from "../../utilities/devWarning.js";
import { resolvePresets, type DateRangePresetOption, type ResolvedPreset } from "./presets.js";
import { styles } from "./UDateRangePicker.styles.js";

export type { DateRangePreset, DateRangePresetName, DateRangePresetOption } from "./presets.js";

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
 * The field is a text box: type `2026-10-01 ~ 2026-10-31` (also `–`, ` - `, the ISO interval with
 * `/`, a short second day such as `10-31`, or one day for a one-day range) and press Enter or leave
 * the field. It shows `YYYY-MM-DD – YYYY-MM-DD` whatever the browser language, or the locale's
 * numeric order with `format="locale"`. Clicking the field opens the calendar and keeps the caret
 * in the text box; ArrowDown (or Alt+ArrowDown) moves into the calendar. Text that is not a range
 * clears the value and reports `badInput`.
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
 * @csspart calendar-footer - the row holding the "clear" quick action
 * @csspart presets - the list of quick ranges beside the calendar
 * @csspart preset - one quick-range button
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
  /** The typed-range text box — what is being typed, committing it, opening the calendar. */
  private readonly textEntry = new DateTextController(this, {
    toValue: (text) => {
      if (!text.trim()) return undefined;
      const range = parseDateRange(text, { format: this.format });
      return range ? `${range.start}/${range.end}` : null;
    },
    dayOf: (text) => parseDateRange(text, { format: this.format })?.start ?? null,
    shown: () => {
      const range = parseInterval(this.value);
      return range ? formatDateRangeText(range.start, range.end, this.format) : this.value ?? '';
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
      this.textEntry.calendarOpened(this.start ?? new Date());
    }
  }

  render() {
    const pattern = dateTextPattern(this.format);
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
    return html`
      <div class="body">
        ${presets.length ? this.renderPresets(presets) : ''}
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
              <u-button appearance="plain" size="sm" @click=${this.handleFooterResetClick}>${Locale.getValue('clear')}</u-button>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  private renderPresets(presets: ResolvedPreset[]) {
    return html`
      <div class="presets" part="presets" role="group" aria-label=${Locale.getValue('quickRanges')}>
        ${presets.map(p => html`
          <button type="button" class="preset" part="preset"
            aria-pressed=${`${p.start}/${p.end}` === this.value}
            ?disabled=${this.outOfBounds(p)}
            @click=${() => this.commitRange(p.start, p.end)}
          >${p.label}</button>
        `)}
      </div>
    `;
  }

  /** A preset that reaches outside `min`/`max` is not offered — its label would promise more
   *  than the picker may hold. */
  private outOfBounds(p: { start: string; end: string }): boolean {
    return (!!this.min && p.start < this.min) || (!!this.max && p.end > this.max);
  }

  private handleRangeSelect = (e: CustomEvent<CalendarRangeSelectDetail>) => {
    this.commitRange(e.detail.start, e.detail.end);
  };

  /** A user-chosen range (calendar or preset): set it, announce it, close the calendar. */
  private commitRange(start: string, end: string): void {
    const next = `${start}/${end}`;
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
    this.resetValue();
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
    const range = parseInterval(this.value);

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
