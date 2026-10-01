import { html, PropertyValues } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import '../icon-button/UIconButton.js';

import { UElement } from "../UElement.js";
import { Locale, type LocaleTag } from "../../utilities/Locale.js";
import { formatDate } from "../../utilities/format.js";
import {
  addDays, addMonths, daysInMonth, isOutOfRange, isSameDay, monthDiff, parseISODate,
  startOfMonth, toISODate,
} from "./dates.js";
import { styles } from "./UCalendar.styles.js";

/** Cells to render for one month — leading `null`s pad the previous month's weekday offset. */
function buildMonthGrid(month: Date): (Date | null)[] {
  const first = startOfMonth(month);
  const cells: (Date | null)[] = [];
  for (let i = 0; i < first.getDay(); i++) cells.push(null);
  for (let d = 1; d <= daysInMonth(month); d++) cells.push(new Date(month.getFullYear(), month.getMonth(), d));
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

export interface CalendarDaySelectDetail {
  /** The chosen day as ISO `YYYY-MM-DD`. */
  date: string;
}

/**
 * 날짜 피커들이 공유하는 달력 격자 — **내부 요소**다(배럴에서 내보내지 않는다).
 *
 * 격자 조립, 키보드 이동(APG grid), `min`/`max` 비활성, 오늘 표시, 여러 달 나란히 보기를
 * 소유한다. 값을 «확정»하지는 않는다 — 날을 고르면 `day-select` 를 내고, 그것을 값으로
 * 삼을지는 감싸는 피커가 정한다(피커마다 확정 규칙이 다르다: 단일은 즉시, 범위는 두 번째 클릭).
 *
 * 감싸는 피커의 공개 `::part` 를 지키기 위해 파트 이름은 종전 `u-date-picker` 의 것을
 * 그대로 쓰고, 피커가 `exportparts` 로 다시 내보낸다.
 *
 * @csspart calendar-month - one month block (header + weekdays + grid)
 * @csspart calendar-header - the month navigation header
 * @csspart calendar-title - the "Month Year" title
 * @csspart calendar-weekdays - the weekday header row
 * @csspart calendar-grid - the date grid
 * @csspart calendar-week - one week row inside the date grid
 * @csspart day - a date cell button
 *
 * @event day-select - a day cell was activated (click, Enter, Space). `detail.date` is ISO.
 *   Never fires for an out-of-range day.
 *
 * @internal
 */
@customElement('u-calendar')
export class UCalendar extends UElement {
  static styles = [super.styles, styles];

  /** Selected day (ISO `YYYY-MM-DD`) — drawn as `aria-selected`. */
  @property({ type: String }) value?: string;
  /** Earliest selectable day (ISO), inclusive. */
  @property({ type: String }) min?: string;
  /** Latest selectable day (ISO), inclusive. */
  @property({ type: String }) max?: string;
  /** How many consecutive months to show side by side. */
  @property({ type: Number, attribute: 'visible-months' }) visibleMonths: number = 1;

  /** First visible month (always the 1st of a month). */
  @state() private viewDate: Date = startOfMonth(new Date());
  /** The one day cell in the tab order (roving tabindex). */
  @state() private focusedDate: Date = new Date();

  // Distinguishes "focusedDate changed because the user is navigating the grid with arrow
  // keys" from "focusedDate changed because a header's prev/next-month button was clicked".
  // Only the former should yank focus into the grid — the latter would steal focus back off
  // the header button the user just activated.
  private grabFocusOnUpdate = false;

  /**
   * Shows the month containing `date` (ISO or `Date`) as the first visible month and makes
   * that day the roving-tabindex target. Does not move DOM focus — call `focusDay()` for that.
   */
  public showDate(date: string | Date): void {
    const d = typeof date === 'string' ? parseISODate(date) : date;
    this.viewDate = startOfMonth(d);
    this.focusedDate = d;
  }

  /** Moves DOM focus to the roving-tabindex day cell once the current render has settled. */
  public async focusDay(): Promise<void> {
    await this.updateComplete;
    this.dayButton(this.focusedDate)?.focus();
  }

  protected updated(changed: PropertyValues): void {
    super.updated(changed);
    if (changed.has('focusedDate') && this.grabFocusOnUpdate) {
      this.grabFocusOnUpdate = false;
      this.dayButton(this.focusedDate)?.focus();
    }
  }

  render() {
    const months = Array.from({ length: Math.max(1, this.visibleMonths) }, (_, i) => addMonths(this.viewDate, i));
    const weekdayLabels = getWeekdayLabels();
    return html`
      <div class="months">
        ${months.map((month, i) => this.renderMonth(month, weekdayLabels, i === 0, i === months.length - 1))}
      </div>
    `;
  }

  private renderMonth(month: Date, weekdayLabels: string[], first: boolean, last: boolean) {
    const monthLabel = formatDate(month, { year: 'numeric', month: 'long' });
    return html`
      <div class="month" part="calendar-month">
        <div class="calendar-header" part="calendar-header">
          ${first
            ? html`<u-icon-button lib="internal" name="chevron-left" aria-label=${Locale.getValue('previousMonth')} @click=${this.handlePrevMonth}></u-icon-button>`
            : html`<span class="nav-spacer"></span>`}
          <span class="calendar-title" part="calendar-title">${monthLabel}</span>
          ${last
            ? html`<u-icon-button lib="internal" name="chevron-right" aria-label=${Locale.getValue('nextMonth')} @click=${this.handleNextMonth}></u-icon-button>`
            : html`<span class="nav-spacer"></span>`}
        </div>
        <div class="calendar-weekdays" part="calendar-weekdays" role="row">
          ${weekdayLabels.map(w => html`<span class="weekday" role="columnheader">${w}</span>`)}
        </div>
        <div class="calendar-grid" part="calendar-grid" role="grid" aria-label=${monthLabel}>
          ${chunkWeeks(buildMonthGrid(month)).map(week => html`
            <div class="calendar-week" part="calendar-week" role="row">
              ${week.map(date => date ? this.renderDay(date) : html`<span class="day-empty" role="gridcell" aria-hidden="true"></span>`)}
            </div>
          `)}
        </div>
      </div>
    `;
  }

  private renderDay(date: Date) {
    const selected = this.value ? isSameDay(date, parseISODate(this.value)) : false;
    const outOfRange = isOutOfRange(date, this.min, this.max);
    return html`
      <button type="button" class="day" part="day"
        role="gridcell"
        data-iso=${toISODate(date)}
        tabindex=${isSameDay(date, this.focusedDate) ? 0 : -1}
        aria-selected=${selected}
        aria-disabled=${outOfRange}
        ?data-today=${isSameDay(date, new Date())}
        @click=${() => this.activate(date)}
        @keydown=${(e: KeyboardEvent) => this.handleDayKeydown(e, date)}
        @focus=${() => { this.focusedDate = date; }}
      >${date.getDate()}</button>
    `;
  }

  private dayButton(date: Date): HTMLButtonElement | null {
    return this.renderRoot.querySelector<HTMLButtonElement>(`button.day[data-iso="${toISODate(date)}"]`);
  }

  private activate(date: Date): void {
    if (isOutOfRange(date, this.min, this.max)) return;
    this.fire<CalendarDaySelectDetail>('day-select', { detail: { date: toISODate(date) } });
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
    const deltas: Record<string, number> = {
      ArrowRight: 1, ArrowLeft: -1, ArrowDown: 7, ArrowUp: -7,
      Home: -date.getDay(), End: 6 - date.getDay(),
    };
    if (e.key in deltas) {
      e.preventDefault();
      this.moveFocus(date, deltas[e.key]);
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this.activate(date);
    }
  };

  private moveFocus(from: Date, deltaDays: number): void {
    this.grabFocusOnUpdate = true;
    const next = addDays(from, deltaDays);
    // Scroll the visible window only when the target leaves it — in a multi-month view,
    // moving from the first month into the second must not shift the months.
    const offset = monthDiff(this.viewDate, next);
    if (offset < 0) this.viewDate = startOfMonth(next);
    else if (offset >= this.visibleMonths) this.viewDate = addMonths(next, -(this.visibleMonths - 1));
    this.focusedDate = next;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'u-calendar': UCalendar;
  }
  interface HTMLElementEventMap {
    'day-select': CustomEvent<CalendarDaySelectDetail>;
  }
}
