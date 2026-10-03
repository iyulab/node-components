// 날짜·시간 피커가 공유하는 값 조립 — 피커의 `mode="datetime"` 값은 «초와 로컬 오프셋까지 갖춘»
// ISO-8601 `DateTimeOffset`(`YYYY-MM-DDTHH:mm:ss±HH:mm`) 이다. UI 가 분 단위여도 값은 언제나 완결이다.
import { parseISODate } from "./dates.js";

/** `±HH:mm` for the browser's local timezone at `date` (DST-aware — recomputed per date,
 *  not cached — `getTimezoneOffset()`'s sign is the inverse of the ISO-8601 offset sign). */
export function localOffset(date: Date): string {
  const minutes = -date.getTimezoneOffset();
  const sign = minutes >= 0 ? '+' : '-';
  const abs = Math.abs(minutes);
  return `${sign}${String(Math.floor(abs / 60)).padStart(2, '0')}:${String(abs % 60).padStart(2, '0')}`;
}

/** ISO day + `HH:mm` → `YYYY-MM-DDTHH:mm:00±HH:mm` (the offset of that local day and time). */
export function toDateTimeOffset(day: string, time: string): string {
  const [h, m] = time.split(':').map(Number);
  const local = parseISODate(day);
  local.setHours(h, m);
  return `${day}T${time}:00${localOffset(local)}`;
}

/** Splits a value into its ISO day and its `HH:mm` (`00:00` when there is no time part). */
export function splitDateTime(value: string): { day: string; time: string } {
  const [day, rest] = value.split('T');
  const match = rest?.match(/^(\d{2}:\d{2})/);
  return { day, time: match ? match[1] : '00:00' };
}
