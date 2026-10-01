import { Locale, type LocaleMessageKey } from "../../utilities/Locale.js";
import { addDays, addMonths, daysInMonth, parseISODate, toISODate } from "../calendar/dates.js";

/** A built-in quick range, named so it can be listed in the `presets` attribute. */
export type DateRangePresetName =
  | 'today' | 'yesterday'
  | 'last7Days' | 'last30Days'
  | 'thisWeek' | 'lastWeek'
  | 'thisMonth' | 'lastMonth'
  | 'thisYear';

/**
 * A quick range the app defines — a fiscal quarter, "since the last release". `range` runs when
 * the preset is drawn and when it is picked, so a relative range stays current. It returns the
 * two ends as `Date`s (local calendar days) or ISO `YYYY-MM-DD` strings, in either order.
 */
export interface DateRangePreset {
  label: string;
  range: () => [Date | string, Date | string];
}

/** What the `presets` property takes — built-in names and app-defined presets, in display order. */
export type DateRangePresetOption = DateRangePresetName | DateRangePreset;

/** A preset ready to draw: its label and its two ISO ends, earliest first. */
export interface ResolvedPreset {
  label: string;
  start: string;
  end: string;
}

type Builtin = { key: LocaleMessageKey; range: (today: Date) => [Date, Date] };

// Weeks start on Sunday — the same convention the calendar grid draws.
const startOfWeek = (d: Date) => addDays(d, -d.getDay());
const endOfMonth = (d: Date) => new Date(d.getFullYear(), d.getMonth(), daysInMonth(d));

/** Built-in ranges as pure functions of "today" (a local calendar day). Both ends are inclusive. */
export const BUILTIN_PRESETS: Record<DateRangePresetName, Builtin> = {
  today: { key: 'today', range: t => [t, t] },
  yesterday: { key: 'yesterday', range: t => [addDays(t, -1), addDays(t, -1)] },
  last7Days: { key: 'last7Days', range: t => [addDays(t, -6), t] },
  last30Days: { key: 'last30Days', range: t => [addDays(t, -29), t] },
  thisWeek: { key: 'thisWeek', range: t => [startOfWeek(t), addDays(startOfWeek(t), 6)] },
  lastWeek: { key: 'lastWeek', range: t => [addDays(startOfWeek(t), -7), addDays(startOfWeek(t), -1)] },
  thisMonth: { key: 'thisMonth', range: t => [addMonths(t, 0), endOfMonth(t)] },
  lastMonth: { key: 'lastMonth', range: t => [addMonths(t, -1), endOfMonth(addMonths(t, -1))] },
  thisYear: { key: 'thisYear', range: t => [new Date(t.getFullYear(), 0, 1), new Date(t.getFullYear(), 11, 31)] },
};

const toISO = (v: Date | string) => (typeof v === 'string' ? toISODate(parseISODate(v)) : toISODate(v));

/**
 * Resolves the `presets` list against `today` — labels through the active locale, ends as ISO
 * days earliest first. An unknown name is skipped and reported through `onUnknown`.
 */
export function resolvePresets(
  options: readonly DateRangePresetOption[],
  today: Date,
  onUnknown?: (name: string) => void,
): ResolvedPreset[] {
  const out: ResolvedPreset[] = [];
  for (const option of options) {
    if (typeof option === 'string') {
      const builtin = BUILTIN_PRESETS[option as DateRangePresetName];
      if (!builtin) { onUnknown?.(option); continue; }
      const [a, b] = builtin.range(today);
      out.push(ordered(Locale.getValue(builtin.key), toISODate(a), toISODate(b)));
    } else {
      const [a, b] = option.range();
      out.push(ordered(option.label, toISO(a), toISO(b)));
    }
  }
  return out;
}

function ordered(label: string, a: string, b: string): ResolvedPreset {
  return a <= b ? { label, start: a, end: b } : { label, start: b, end: a };
}
