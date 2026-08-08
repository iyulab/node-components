import { Locale, type LocaleTag } from './Locale.js';

/**
 * Parses "YYYY-MM-DD" as midnight in the **local** timezone.
 * Using `Date.parse("YYYY-MM-DD")` (UTC interpretation) shifts the date
 * back a day in negative-UTC-offset regions — split y/m/d and construct
 * `new Date(y, m-1, d)` directly instead.
 */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
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
 */
export function formatDate(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale?: LocaleTag,
): string {
  return new Intl.DateTimeFormat(locale ?? Locale.get(), options).format(resolve(value));
}
