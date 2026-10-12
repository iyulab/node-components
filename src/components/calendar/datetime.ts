// 날짜·시간 피커가 공유하는 값 조립 — 피커의 `mode="datetime"` 값은 «초와 로컬 오프셋까지 갖춘»
// ISO-8601 `DateTimeOffset`(`YYYY-MM-DDTHH:mm:ss±HH:mm`) 이다. UI 가 분 단위여도 값은 언제나 완결이다.
// 읽기는 쓰기와 같은 해석이어야 한다 — 오프셋 있는 값은 «순간» 이라 로컬 벽시계로 읽는다
// (`toLocalDateTime`). 글자만 떼어 읽으면 다른 오프셋의 값이 그 숫자로 보이고, 고쳐 쓰면 로컬
// 오프셋이 붙어 순간이 옮겨진다.
import { parseISODate } from "./dates.js";

/** `±HH:mm` for the browser's local timezone at `date` (DST-aware — recomputed per date,
 *  not cached — `getTimezoneOffset()`'s sign is the inverse of the ISO-8601 offset sign). */
export function localOffset(date: Date): string {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** ISO day + `HH:mm` or `HH:mm:ss` → `YYYY-MM-DDTHH:mm:ss±HH:mm` (the offset of that local day and time). */
export function toDateTimeOffset(day: string, time: string): string {
  const [h, m, s = 0] = time.split(':').map(Number);
  const local = parseISODate(day);
  local.setHours(h, m, s);
  return `${day}T${normalizeTime(time, true)}${localOffset(local)}`;
}

/** A date-time with a UTC designator or offset after its time (`…Z`, `…+09:00`, `…-0530`). */
const WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})$/i;

/** A date-time value as this browser's wall clock — `YYYY-MM-DDTHH:mm:ss±HH:mm` in the local offset.
 *  A value with an offset is an instant: `2026-09-06T22:22:34Z` reads `2026-09-07T07:22:34+09:00` in
 *  Seoul, the same moment. A value without one is already wall clock and comes back as it is, and so
 *  does anything that is not a date-time. Every read of a picker value goes through here, so what
 *  the picker shows and what it writes back describe the same instant. */
export function toLocalDateTime(value: string): string {
  if (!WITH_OFFSET.test(value)) return value;
  const instant = new Date(value);
  if (Number.isNaN(instant.getTime())) return value;
  const pad = (n: number) => String(n).padStart(2, '0');
  const day = `${instant.getFullYear()}-${pad(instant.getMonth() + 1)}-${pad(instant.getDate())}`;
  return toDateTimeOffset(day, `${pad(instant.getHours())}:${pad(instant.getMinutes())}:${pad(instant.getSeconds())}`);
}

/** Whether two picker values are the same — a day, a date-time, or a `start/end` interval of either,
 *  compared half by half as instants when they carry offsets. A value written back in the local
 *  offset is then not a change from the `…Z` it came from, and the picker keeps the string it was given. */
export function sameDateTime(a: string | undefined, b: string | undefined): boolean {
  if (a === b) return true;
  if (!a || !b) return false;
  const local = (v: string) => v.split('/').map(toLocalDateTime).join('/');
  return local(a) === local(b);
}

/** Splits a value into its ISO day and its time — `HH:mm`, or `HH:mm:ss` with `seconds`
 *  (`00:00` when there is no time part). A value with an offset is read as this browser's wall clock
 *  ({@link toLocalDateTime}). */
export function splitDateTime(value: string, seconds = false): { day: string; time: string } {
  const [day, rest] = toLocalDateTime(value).split('T');
  const match = rest?.match(/^\d{2}:\d{2}(?::\d{2})?/);
  return { day, time: normalizeTime(match ? match[0] : '00:00', seconds) };
}

/** `HH:mm[:ss]` → `HH:mm`, or `HH:mm:ss` with `seconds` (`:00` added when missing). A time input
 *  with a seconds step may report `14:30` for `14:30:00`, so both shapes come in. */
export function normalizeTime(time: string, seconds: boolean): string {
  const hm = time.slice(0, 5);
  return seconds ? `${hm}:${time.slice(6, 8) || '00'}` : hm;
}
