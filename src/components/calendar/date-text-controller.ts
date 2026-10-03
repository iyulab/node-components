import type { ReactiveController, ReactiveControllerHost } from "lit";
import type { UCalendar } from "./UCalendar.js";
import type { UPopover } from "../popover/UPopover.js";

/** What a picker with a typed-date text box gives the controller. */
export interface DateTextControllerOptions {
  /** The value to commit for the typed text — `undefined` for empty text, `null` when it is not readable. */
  toValue(text: string): string | undefined | null;
  /** The ISO day the typed text points at, so an open calendar can follow the typing; `null` when none. */
  dayOf(text: string): string | null;
  /** The value as the text box shows it when nothing is being typed. */
  shown(): string;
  /** Called after a commit that changed the value — the picker validates and fires `change`. */
  onChange(): void;
  /** Called when unreadable text is committed without a value change — the picker re-validates. */
  onBadText(): void;
  popover(): UPopover | undefined;
  calendar(): UCalendar | undefined;
  container(): HTMLElement | undefined;
  input(): HTMLInputElement | null;
  /** Whether the picker takes input now (not disabled, not read-only). */
  interactive(): boolean;
}

type Host = ReactiveControllerHost & HTMLElement & { value?: string };

/**
 * The typed-date text box shared by `u-date-picker` and `u-date-range-picker`: what is being typed
 * (`draft`), whether the last commit was unreadable (`badText`), committing on Enter and blur,
 * opening the calendar on a click (caret stays in the box) or ArrowDown (focus moves into the grid),
 * and following the typing in an open calendar.
 */
export class DateTextController implements ReactiveController {
  /** What the person is typing, until it is committed; `null` shows the value. */
  draft: string | null = null;
  /** The committed text was not readable — the value is empty and validity reports `badInput`. */
  badText = false;
  private focusGridOnOpen = false;

  constructor(private readonly host: Host, private readonly options: DateTextControllerOptions) {
    host.addController(this);
  }

  hostConnected(): void {}

  /** The text box's current text. */
  get text(): string {
    return this.draft ?? this.options.shown();
  }

  /** Forget what was typed — after a calendar pick, a clear or a reset. */
  clear(): void {
    this.draft = null;
    this.badText = false;
    this.host.requestUpdate();
  }

  /** Called when the calendar has opened: show the typed (or current) month and, if the opening
   *  came from the keyboard, move focus into the grid. */
  calendarOpened(fallbackDay: string | Date): void {
    const calendar = this.options.calendar();
    const typed = this.draft !== null ? this.options.dayOf(this.draft) : null;
    calendar?.showDate(typed ?? fallbackDay);
    const moveFocus = this.focusGridOnOpen;
    this.focusGridOnOpen = false;
    if (moveFocus) this.options.popover()?.updateComplete.then(() => calendar?.focusDay());
  }

  open(focusGrid: boolean): void {
    if (!this.options.interactive()) return;
    if (this.options.popover()?.open) {
      if (focusGrid) void this.options.calendar()?.focusDay();
      return;
    }
    this.focusGridOnOpen = focusGrid;
    const container = this.options.container();
    if (container) void this.options.popover()?.show(container);
  }

  handleInput = (e: Event): void => {
    this.draft = (e.target as HTMLInputElement).value;
    this.host.requestUpdate();
    const day = this.options.dayOf(this.draft);
    if (day && this.options.popover()?.open) this.options.calendar()?.showDate(day);
  };

  /** ArrowDown / Alt+ArrowDown opens the calendar and moves into it (the combobox convention);
   *  Enter commits what was typed. Escape belongs to the popover layer — it closes the calendar. */
  handleKeydown = (e: KeyboardEvent): void => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      this.commit();
      this.open(true);
    } else if (e.key === 'Enter' && !e.isComposing) {
      this.commit();
    }
  };

  /** A click on the field (not on its clear or calendar button) opens the calendar and keeps the
   *  caret in the text box — the person can pick a day or keep typing. */
  handleContainerClick = (e: MouseEvent): void => {
    if ((e.target as HTMLElement).closest?.('u-icon')) return;
    const input = this.options.input();
    const root = this.host.shadowRoot;
    if (input && root && root.activeElement !== input) input.focus();
    this.open(false);
  };

  handleCalendarButtonClick = (e: MouseEvent): void => {
    e.stopPropagation();
    if (this.options.popover()?.open) {
      void this.options.popover()?.hide();
      this.options.input()?.focus();
    } else {
      this.open(true);
    }
  };

  /** Turns the typed text into the value. Empty text clears it; unreadable text also clears it and
   *  reports `badInput` while the text stays to be fixed (the native date input does the same). */
  commit = (): void => {
    if (this.draft === null) return;
    const text = this.draft;
    const next = this.options.toValue(text);
    this.badText = next === null;
    const value = next ?? undefined;
    const changed = value !== this.host.value;
    this.host.value = value;
    this.draft = this.badText ? text : null;
    this.host.requestUpdate();
    if (changed) this.options.onChange();
    else if (this.badText) this.options.onBadText();
  };
}
