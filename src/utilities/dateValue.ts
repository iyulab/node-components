/**
 * The three kinds of date value an app receives as text, read and written in one place.
 * The names come from Temporal:
 *
 * - **`instant`** — a date-time with an offset or `Z` (`2026-09-06T22:22:34Z`, `…+09:00`). It names one
 *   moment everywhere; shown here, it is this browser's wall clock at that moment.
 * - **`plainDateTime`** — a date-time without an offset (`2026-09-06T22:22`, `2026-09-06 22:22:34`). It is a
 *   wall clock already and is read as local time, never shifted.
 * - **`plainDate`** — a calendar day (`2026-09-06`). It is local midnight of that day. `new Date('2026-09-06')`
 *   is UTC midnight instead, which is the previous day west of Greenwich.
 *
 * A `Date` is an instant. Text that is none of the three, or names a day that does not exist
 * (`2026-02-30`), reads as `null` — never a rolled-over or guessed date.
 */
export type DateValueKind = 'instant' | 'plainDateTime' | 'plainDate';

/** A date value with the kind its text named. `date` is the moment it means here. */
export interface DateValue {
  kind: DateValueKind;
  date: Date;
}

const PLAIN_DATE = /^(\d{4})-(\d{2})-(\d{2})$/;
const DATE_TIME = /^(\d{4})-(\d{2})-(\d{2})[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,9}))?)?(Z|[+-]\d{2}:?\d{2})?$/i;

/** Whether the fields name a real calendar day and clock time — `Date` rolls `2026-02-30` into March and
 *  `24:00` into the next day; the check runs in UTC so no time zone moves a field. */
function realFields(y: number, m: number, d: number, h = 0, min = 0, s = 0): boolean {
  const u = new Date(Date.UTC(y, m - 1, d, h, min, s));
  return u.getUTCFullYear() === y && u.getUTCMonth() === m - 1 && u.getUTCDate() === d
    && u.getUTCHours() === h && u.getUTCMinutes() === min && u.getUTCSeconds() === s;
}

/**
 * Reads a date value and tells which kind it is. `null` for text that is not one of the three
 * kinds, for a day or time that does not exist, and for an invalid `Date`.
 */
export function readDateValue(value: Date | string): DateValue | null {
  if (value instanceof Date) return Number.isNaN(value.getTime()) ? null : { kind: 'instant', date: value };
  const text = value.trim();

  const day = PLAIN_DATE.exec(text);
  if (day) {
    const [y, m, d] = [Number(day[1]), Number(day[2]), Number(day[3])];
    return realFields(y, m, d) ? { kind: 'plainDate', date: new Date(y, m - 1, d) } : null;
  }

  const dt = DATE_TIME.exec(text);
  if (!dt) return null;
  const [y, m, d, h, min, s] = [1, 2, 3, 4, 5, 6].map(i => Number(dt[i] ?? 0));
  const ms = dt[7] ? Number(dt[7].slice(0, 3).padEnd(3, '0')) : 0;
  if (!realFields(y, m, d, h, min, s)) return null;
  const zone = dt[8];
  // A wall clock skipped by a DST change moves forward by the gap (Temporal's default, and `new Date`'s).
  if (!zone) return { kind: 'plainDateTime', date: new Date(y, m - 1, d, h, min, s, ms) };
  const offset = zone.toUpperCase() === 'Z' ? 0 : (zone[0] === '-' ? -1 : 1)
    * (Number(zone.slice(1, 3)) * 60 + Number(zone.slice(-2)));
  const date = new Date(Date.UTC(y, m - 1, d, h, min, s, ms) - offset * 60_000);
  return { kind: 'instant', date };
}

const pad = (n: number, width = 2) => String(n).padStart(width, '0');

/** `±HH:mm` for this browser's time zone at `date` — recomputed per date, so a DST change is honoured
 *  (`getTimezoneOffset()`'s sign is the inverse of the ISO-8601 sign). */
export function localOffset(date: Date): string {
  const minutes = -date.getTimezoneOffset();
  const abs = Math.abs(minutes);
  return `${minutes >= 0 ? '+' : '-'}${pad(Math.floor(abs / 60))}:${pad(abs % 60)}`;
}

/** The local calendar day of `date` — `YYYY-MM-DD`. */
export function writePlainDate(date: Date): string {
  return `${pad(date.getFullYear(), 4)}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
}

/** The local wall clock of `date` without an offset — `YYYY-MM-DDTHH:mm:ss`, or `YYYY-MM-DDTHH:mm`
 *  when `seconds` is `false`. */
export function writePlainDateTime(date: Date, seconds = true): string {
  const time = `${pad(date.getHours())}:${pad(date.getMinutes())}${seconds ? `:${pad(date.getSeconds())}` : ''}`;
  return `${writePlainDate(date)}T${time}`;
}

/** The moment `date` names, written as this browser's wall clock with its offset —
 *  `YYYY-MM-DDTHH:mm:ss±HH:mm`. `2026-09-06T22:22:34Z` read in Seoul writes `2026-09-07T07:22:34+09:00`. */
export function writeInstant(date: Date): string {
  return `${writePlainDateTime(date)}${localOffset(date)}`;
}
