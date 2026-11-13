// 달력 격자 조립용 날짜 계산 — "이 칸이 어느 날인가"만 다룬다. 로케일 서식은 format.ts 가
// 소유한다. 모든 함수는 로컬 자정 기준 `Date` 를 다루고 시간대 변환을 하지 않는다
// (ISO `YYYY-MM-DD` 를 `new Date(iso)` 로 읽으면 UTC 자정이 되어 음수 오프셋에서 하루 밀린다).

/** ISO `YYYY-MM-DD` → 로컬 자정 `Date`. */
export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

/** 로컬 `Date` → ISO `YYYY-MM-DD`. */
export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function isSameDay(a: Date, b: Date): boolean {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function startOfMonth(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

export function addMonths(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth() + delta, 1);
}

export function addDays(date: Date, delta: number): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate() + delta);
}

export function daysInMonth(date: Date): number {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
}

/** `Intl.Locale` 의 주 정보 — 표준은 `getWeekInfo()` 메서드이고, 먼저 나간 엔진은 `weekInfo` 접근자로 냈다. */
interface LocaleWeekInfo { firstDay?: number }
type LocaleWithWeekInfo = Intl.Locale & { getWeekInfo?: () => LocaleWeekInfo; weekInfo?: LocaleWeekInfo };

/**
 * 로케일이 한 주를 여는 요일 — `Date#getDay()` 와 같은 수(0 = 일 … 6 = 토).
 *
 * CLDR 의 지역 자료를 `Intl.Locale` 로 읽는다(`fa` `ar-EG` 는 토요일, `de` `fr` `ru` 는 월요일, `en` `ko` `ja` 는 일요일).
 * 지역이 없는 태그(`en` · `ar`)는 엔진이 «가장 그럴듯한 지역»으로 채워 답한다. 엔진이 주 정보를 내지 않거나 태그를 읽지
 * 못하면 일요일 — 이 달력이 로케일을 따르기 전까지 늘 그랬던 값이다.
 */
export function weekStartDay(locale: string): number {
  try {
    const loc = new Intl.Locale(locale) as LocaleWithWeekInfo;
    const info = typeof loc.getWeekInfo === 'function' ? loc.getWeekInfo() : loc.weekInfo;
    const first = info?.firstDay; // 1 = 월 … 7 = 일 (ISO 8601 요일 번호)
    return typeof first === 'number' && first >= 1 && first <= 7 ? first % 7 : 0;
  } catch {
    return 0;
  }
}

/** `date` 가 그 주의 몇 번째 칸인가(0 = 첫 칸) — `weekStart` 는 {@link weekStartDay} 의 값. */
export function dayOfWeekIndex(date: Date, weekStart: number): number {
  return (date.getDay() - weekStart + 7) % 7;
}

/** `date` 가 속한 주의 첫날. */
export function startOfWeek(date: Date, weekStart: number): Date {
  return addDays(date, -dayOfWeekIndex(date, weekStart));
}

/** 두 날의 달 차이(`b` 가 `a` 보다 몇 달 뒤인가). 일자는 무시한다. */
export function monthDiff(a: Date, b: Date): number {
  return (b.getFullYear() - a.getFullYear()) * 12 + (b.getMonth() - a.getMonth());
}

/** 앱이 정하는 날짜별 비활성 규칙 — ISO `YYYY-MM-DD` 를 받아 고를 수 없으면 `true`. */
export type DateDisabledFn = (date: string) => boolean;

/** 고를 수 없는 날인가 — `min`/`max` 밖이거나 앱 규칙이 막았다. */
export function isDayUnavailable(date: Date, min?: string, max?: string, isDateDisabled?: DateDisabledFn): boolean {
  return isOutOfRange(date, min, max) || !!isDateDisabled?.(toISODate(date));
}

/** `min`/`max`(ISO 날짜, 둘 다 선택)를 벗어나는가 — 경계일은 포함이다. */
export function isOutOfRange(date: Date, min?: string, max?: string): boolean {
  if (min && date.getTime() < parseISODate(min).getTime()) return true;
  if (max && date.getTime() > parseISODate(max).getTime()) return true;
  return false;
}
