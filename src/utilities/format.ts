import { Locale, type LocaleTag } from './Locale.js';

/**
 * Parses "YYYY-MM-DD" as midnight in the **local** timezone.
 * Using `Date.parse("YYYY-MM-DD")` (UTC interpretation) shifts the date
 * back a day in negative-UTC-offset regions — split y/m/d and construct
 * `new Date(y, m-1, d)` directly instead.
 *
 * A full ISO datetime (e.g. `2026-02-24T09:00:00Z`) is unambiguous — it carries
 * its own timezone — so the local-time-safe split isn't needed there; when the
 * split doesn't yield three numbers, fall back to native parsing instead of
 * producing an Invalid Date.
 */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return Number.isNaN(y) || Number.isNaN(m) || Number.isNaN(d) ? new Date(iso) : new Date(y, m - 1, d);
}

/**
 * Resolves a Date or ISO date string to a Date object.
 */
function resolve(value: Date | string): Date {
  return typeof value === 'string' ? parseISODate(value) : value;
}

/**
 * Wraps `Intl.NumberFormat` with the active locale (`Locale.get()` if omitted).
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: LocaleTag,
): string {
  return new Intl.NumberFormat(locale ?? Locale.get(), options).format(value);
}

/**
 * Formats a number as currency. The `currency` code is **required and has no default** —
 * the caller must always specify it (e.g. `'KRW'`, `'USD'`). Currency selection is domain knowledge,
 * and this utility does not assume a default.
 *
 * @note If `options` contains `currency` or `style`, they will override the explicit `currency` argument.
 */
export function formatCurrency(
  value: number,
  currency: string,
  options?: Intl.NumberFormatOptions,
  locale?: LocaleTag,
): string {
  return new Intl.NumberFormat(locale ?? Locale.get(), {
    style: 'currency',
    currency,
    ...options,
  }).format(value);
}

/**
 * Wraps `Intl.DateTimeFormat` with the active locale. Accepts a Date object or
 * an ISO `YYYY-MM-DD` date string (parsed as local time, not UTC).
 *
 * A value that can't be resolved to a real date (malformed string, or an
 * already-Invalid `Date`) degrades to `String(value)` rather than throwing —
 * `Intl.DateTimeFormat.format()` throws `RangeError` on an Invalid Date, and this
 * utility is called from render paths where an uncaught throw blanks the whole
 * component.
 *
 * ⚠This degrade is **deliberately not symmetric** with {@link formatCurrency}, which
 * throws `RangeError` on an invalid currency code. A date arrives as *data* — from an
 * API, a user, a stale cache — so a bad one is an expected runtime state. A currency
 * code is written by the developer at the call site, so a bad one is a bug that should
 * surface at the first render rather than be papered over with a wrong-looking amount.
 */
export function formatDate(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale?: LocaleTag,
): string {
  const date = resolve(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return new Intl.DateTimeFormat(locale ?? Locale.get(), options).format(date);
}

/**
 * Formats a date range with the active locale, via `Intl.DateTimeFormat#formatRange` — the
 * locale decides the separator and drops the parts the two ends share (`Mar 6 – Apr 3, 2026`,
 * `2026. 3. 6. ~ 4. 3.`). Accepts Date objects or ISO `YYYY-MM-DD` strings (local time).
 *
 * Like {@link formatDate}, an end that can't be resolved to a real date degrades instead of
 * throwing: both invalid → the two raw values joined with ` – `; one invalid → that raw value
 * stands in for its formatted side.
 */
export function formatDateRange(
  start: Date | string,
  end: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale?: LocaleTag,
): string {
  const a = resolve(start);
  const b = resolve(end);
  const okA = !Number.isNaN(a.getTime());
  const okB = !Number.isNaN(b.getTime());
  const formatter = new Intl.DateTimeFormat(locale ?? Locale.get(), options);
  if (okA && okB) return a.getTime() <= b.getTime() ? formatter.formatRange(a, b) : formatter.formatRange(b, a);
  return `${okA ? formatter.format(a) : String(start)} – ${okB ? formatter.format(b) : String(end)}`;
}

/** The decimal separator `Intl.NumberFormat` writes for `locale` (`.` or `,` in practice). */
function decimalSeparatorOf(locale: LocaleTag): string {
  return new Intl.NumberFormat(locale).formatToParts(1.1).find(p => p.type === 'decimal')?.value ?? '.';
}

/** Space-like characters and apostrophes that locales use to group digits (fr/ru NBSP, de-CH ’). */
const GROUP_MARKS = /[\s\u00A0\u202F\u2009'\u2019]/;

/**
 * Reads a number the way a person types it, in any locale — the inverse of {@link formatNumber}.
 * Returns `null` for text that is not a number; never a partial number (`"1,5x"` is `null`, not 1.5).
 *
 * Which separator is the decimal one:
 * - `.` and `,` both present → the **last** one is decimal, the other groups (`1.234,5` and
 *   `1,234.5` are both 1234.5).
 * - one separator, repeated → it groups (`1.234.567` → 1234567).
 * - a single `.` → decimal (`0.125` stays 0.125 on a comma-decimal page — people type dots).
 * - a single `,` → decimal, except when the locale writes decimals with `.` and exactly three
 *   digits follow (`1,234` on an English page → 1234).
 *
 * Grouping (by either separator, spaces or apostrophes) must come in threes after a first group of
 * one to three digits — `1,23,4` is `null`. A leading `+`, `-` or `−` sets the sign. Exponents are
 * not read. `locale` defaults to the active `Locale`.
 */
export function parseNumber(text: string, locale?: LocaleTag): number | null {
  const trimmed = text.trim();
  const signed = trimmed.match(/^([+\-\u2212]?)(.*)$/s)!;
  const negative = signed[1] === '-' || signed[1] === '\u2212';
  const body = signed[2];
  if (!body || !/^[\d.,\s\u00A0\u202F\u2009'\u2019]+$/.test(body) || !/\d/.test(body)) return null;
  if (GROUP_MARKS.test(body[0]) || GROUP_MARKS.test(body[body.length - 1])) return null;

  const dots = body.split('.').length - 1;
  const commas = body.split(',').length - 1;
  let decimal: '.' | ',' | undefined;
  if (dots && commas) {
    decimal = body.lastIndexOf('.') > body.lastIndexOf(',') ? '.' : ',';
    if ((decimal === '.' ? dots : commas) > 1) return null;
  } else if (dots === 1) {
    decimal = '.';
  } else if (commas === 1) {
    const after = body.slice(body.indexOf(',') + 1);
    const dotDecimalLocale = decimalSeparatorOf(locale ?? Locale.get()) === '.';
    decimal = dotDecimalLocale && /^\d{3}$/.test(after) && /\d/.test(body.slice(0, body.indexOf(','))) ? undefined : ',';
  }

  const cut = decimal ? body.lastIndexOf(decimal) : body.length;
  const intPart = body.slice(0, cut);
  const fracPart = decimal ? body.slice(cut + 1) : '';
  if (!/^\d*$/.test(fracPart)) return null;

  const groups = intPart.split(/[.,\s\u00A0\u202F\u2009'\u2019]/);
  if (groups.length > 1) {
    if (!/^\d{1,3}$/.test(groups[0]) || groups.slice(1).some(g => !/^\d{3}$/.test(g))) return null;
  } else if (!/^\d*$/.test(intPart)) {
    return null;
  }
  const digits = groups.join('');
  if (!digits && !fracPart) return null;

  const value = Number(`${negative ? '-' : ''}${digits || '0'}.${fracPart || '0'}`);
  return Number.isFinite(value) ? value : null;
}

/** How a date is written in a text field: ISO `YYYY-MM-DD`, or the locale's numeric order (`10/02/2026`, `02.10.2026`). */
export type DateTextFormat = 'iso' | 'locale';

type DatePart = 'year' | 'month' | 'day';

/** The year/month/day order and separator the locale's numeric date uses (`en-US` → month/day/year · `/`). */
function numericDateLayout(locale: LocaleTag): { order: DatePart[]; separator: string } {
  const parts = new Intl.DateTimeFormat(locale, { year: 'numeric', month: '2-digit', day: '2-digit' })
    .formatToParts(new Date(2026, 9, 2));
  const order = parts.filter(p => p.type === 'year' || p.type === 'month' || p.type === 'day').map(p => p.type as DatePart);
  const separator = parts.find(p => p.type === 'literal')?.value ?? '-';
  return { order, separator };
}

/**
 * Writes an ISO `YYYY-MM-DD` date the way {@link parseDate} reads it back: `iso` keeps it as is;
 * `locale` uses the locale's numeric order with two-digit month and day (`10/02/2026` in `en-US`,
 * `02.10.2026` in `de`). A string that is not an ISO date is returned unchanged.
 */
export function formatDateText(iso: string, format: DateTextFormat = 'iso', locale?: LocaleTag): string {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(iso);
  if (!m || format === 'iso') return iso;
  return new Intl.DateTimeFormat(locale ?? Locale.get(), { year: 'numeric', month: '2-digit', day: '2-digit' })
    .format(new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3])));
}

/** The pattern a person should type for `format` — `YYYY-MM-DD`, or e.g. `MM/DD/YYYY` for `locale` in `en-US`. */
export function dateTextPattern(format: DateTextFormat = 'iso', locale?: LocaleTag): string {
  if (format === 'iso') return 'YYYY-MM-DD';
  const { order, separator } = numericDateLayout(locale ?? Locale.get());
  const token: Record<DatePart, string> = { year: 'YYYY', month: 'MM', day: 'DD' };
  return order.map(p => token[p]).join(separator);
}

/**
 * Reads a date the way people type it into a field and returns it as ISO `YYYY-MM-DD`, or `null`
 * when the text is not a real date (`2026-02-30` is `null`). Accepted, whatever `format` is:
 * - `2026-10-02`, `2026/10/02`, `2026.10.02`, `2026. 10. 2.` — a four-digit first part is year-month-day;
 * - `20261002` — eight digits are year, month, day.
 *
 * `format` decides the rest: with `iso`, three parts are year-month-day and two parts (`10-02`)
 * are month-day; with `locale`, both follow the locale's numeric order (`10/02/2026` and `10/02`
 * in `en-US`, `02.10.2026` and `2.10` in `de`). Two parts take the year of `referenceDate`
 * (today by default). Two-digit years are not read.
 */
export function parseDate(
  text: string,
  options: { format?: DateTextFormat; locale?: LocaleTag; referenceDate?: Date } = {},
): string | null {
  const t = text.trim().replace(/\.$/, '');
  if (!t) return null;
  let y: number, mo: number, d: number;
  const compact = /^(\d{4})(\d{2})(\d{2})$/.exec(t);
  const parts = compact ? null : t.split(/\s*[-/.]\s*|\s+/);
  if (compact) {
    [y, mo, d] = [Number(compact[1]), Number(compact[2]), Number(compact[3])];
  } else {
    if (!parts || parts.some(p => !/^\d{1,4}$/.test(p))) return null;
    const order: DatePart[] = options.format === 'locale'
      ? numericDateLayout(options.locale ?? Locale.get()).order
      : ['year', 'month', 'day'];
    let layout: DatePart[];
    if (parts.length === 3) layout = parts[0].length === 4 ? ['year', 'month', 'day'] : order;
    else if (parts.length === 2) layout = order.filter(p => p !== 'year');
    else return null;
    const read: Partial<Record<DatePart, string>> = {};
    layout.forEach((p, i) => { read[p] = parts[i]; });
    if (read.year !== undefined && read.year.length !== 4) return null;
    if (read.month!.length > 2 || read.day!.length > 2) return null;
    y = read.year !== undefined ? Number(read.year) : (options.referenceDate ?? new Date()).getFullYear();
    mo = Number(read.month);
    d = Number(read.day);
  }
  const date = new Date(y, mo - 1, d);
  if (date.getFullYear() !== y || date.getMonth() !== mo - 1 || date.getDate() !== d) return null;
  return `${String(y).padStart(4, '0')}-${String(mo).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
}

/**
 * Reads a date and a time of day as people type them and returns local `YYYY-MM-DDTHH:mm`, or `null`.
 * The date part is anything {@link parseDate} reads; the time follows a space or `T` as `HH:mm`
 * (`9:05`, `09:05`, `09:05:30` — seconds are dropped). Text with only a date takes `defaultTime`
 * (`00:00` unless given). An hour above 23 or a minute above 59 is `null`.
 */
export function parseDateTime(
  text: string,
  options: { format?: DateTextFormat; locale?: LocaleTag; referenceDate?: Date; defaultTime?: string } = {},
): string | null {
  const t = text.trim();
  const m = /^(.*?)(?:[T\s]+(\d{1,2}):(\d{2})(?::\d{2})?)?$/.exec(t);
  if (!m) return null;
  const date = parseDate(m[1], options);
  if (!date) return null;
  if (m[2] === undefined) {
    const fallback = options.defaultTime ?? '00:00';
    return /^\d{2}:\d{2}$/.test(fallback) ? `${date}T${fallback}` : null;
  }
  const h = Number(m[2]);
  const min = Number(m[3]);
  if (h > 23 || min > 59) return null;
  return `${date}T${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
}

/** Writes local `YYYY-MM-DDTHH:mm` (or a longer ISO date-time) as `{date} HH:mm`, the date part as {@link formatDateText} writes it. */
export function formatDateTimeText(isoLocal: string, format: DateTextFormat = 'iso', locale?: LocaleTag): string {
  const m = /^(\d{4}-\d{2}-\d{2})T(\d{2}:\d{2})/.exec(isoLocal);
  return m ? `${formatDateText(m[1], format, locale)} ${m[2]}` : isoLocal;
}
