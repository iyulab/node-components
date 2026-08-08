import { html, PropertyValues } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { ifDefined } from "lit/directives/if-defined.js";
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

/** 2023-01-01 was a Sunday — a fixed reference date that always yields Sun..Sat order regardless of today. */
function getWeekdayLabels(locale?: LocaleTag): string[] {
  const formatter = new Intl.DateTimeFormat(locale ?? Locale.get(), { weekday: 'narrow' });
  const sunday = new Date(2023, 0, 1);
  return Array.from({ length: 7 }, (_, i) => formatter.format(addDays(sunday, i)));
}

/**
 * A single-date-selection form control. The value follows the same convention as the
 * native `input[type=date]`: an ISO `YYYY-MM-DD` string.
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
 *
 * @cssprop --date-picker-popover-width - width of the calendar popover (default: 296px, independent of trigger width — a fixed-width calendar reads more naturally)
 *
 * @event change - fires when the user clicks a date cell, confirms via keyboard, or clicks the clear button.
 *   Programmatic value assignment does not fire it (same contract as native form controls).
 */
@customElement('u-date-picker')
export class UDatePicker extends UFormControlElement<string> {
  static styles = [super.styles, styles];

  /** Minimum value (ISO YYYY-MM-DD) — dates before this cannot be selected. */
  @property({ type: String }) min?: string;
  /** Maximum value (ISO YYYY-MM-DD) — dates after this cannot be selected. */
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
    const displayText = this.value ? formatDate(this.value) : '';
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
            lib="internal"
            name="x"
            @click=${this.handleClearClick}
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
        aria-label="Choose date"
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
          <u-icon-button lib="internal" name="chevron-left" aria-label="Previous month" @click=${this.handlePrevMonth}></u-icon-button>
          <span class="calendar-title" part="calendar-title">${monthLabel}</span>
          <u-icon-button lib="internal" name="chevron-right" aria-label="Next month" @click=${this.handleNextMonth}></u-icon-button>
        </div>
        <div class="calendar-weekdays" part="calendar-weekdays" role="row">
          ${weekdayLabels.map(w => html`<span class="weekday">${w}</span>`)}
        </div>
        <div class="calendar-grid" part="calendar-grid" role="grid">
          ${cells.map(date => date ? this.renderDay(date) : html`<span class="day-empty"></span>`)}
        </div>
      </div>
    `;
  }

  private renderDay(date: Date) {
    const selected = this.value ? isSameDay(date, parseISODate(this.value)) : false;
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

  private selectDay(date: Date): void {
    if (this.isOutOfRange(date)) return;
    const iso = toISODate(date);
    const changed = iso !== this.value;
    this.value = iso;
    if (changed) this.emitChange();
    this.popoverEl?.hide();
    this.containerEl?.focus();
  }

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
    const base = this.value ? parseISODate(this.value) : new Date();
    this.viewDate = startOfMonth(base);
    this.focusedDate = base;
  };

  private handlePopoverHide = () => {
    this.open = false;
  };

  private handleClearClick = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const hadValue = !!this.value;
    this.value = undefined;
    if (hadValue) this.emitChange();
    this.containerEl?.focus();
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
    } else if (this.value && this.min && parseISODate(this.value).getTime() < parseISODate(this.min).getTime()) {
      flags = { rangeUnderflow: true };
      message = Locale.getValue('rangeUnderflow', { min: this.min });
    } else if (this.value && this.max && parseISODate(this.value).getTime() > parseISODate(this.max).getTime()) {
      flags = { rangeOverflow: true };
      message = Locale.getValue('rangeOverflow', { max: this.max });
    }

    this.commit(flags, message, this.containerEl ?? undefined);
  }

  public reset(): void {
    this.value = undefined;
    this.invalid = false;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-date-picker': UDatePicker;
  }
}
