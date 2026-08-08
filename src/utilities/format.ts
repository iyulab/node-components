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
 * component. Same degrade-instead-of-throw contract as `formatCurrency`'s
 * missing-`currency` fallback.
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
