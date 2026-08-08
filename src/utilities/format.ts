import { Locale, type LocaleTag } from './Locale.js';

/**
 * "YYYY-MM-DD" 를 **로컬 시간대**의 자정으로 파싱한다.
 * `Date.parse("YYYY-MM-DD")`(UTC 해석)를 쓰면 음수 UTC 오프셋 지역에서 하루가 밀린다 —
 * y/m/d 를 분리해 `new Date(y, m-1, d)` 로 직접 만든다.
 */
function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d);
}

function resolve(value: Date | string): Date {
  return typeof value === 'string' ? parseISODate(value) : value;
}

/**
 * `Intl.NumberFormat`을 활성 로케일(`Locale.get()`, 생략 시)로 감싼다.
 */
export function formatNumber(
  value: number,
  options?: Intl.NumberFormatOptions,
  locale?: LocaleTag,
): string {
  return new Intl.NumberFormat(locale ?? Locale.get(), options).format(value);
}

/**
 * 통화 포맷. `currency` 는 **기본값이 없다** — 호출측이 항상 명시한다(예: `'KRW'`).
 * 어떤 통화가 맞는지는 도메인 지식이고, 이 유틸리티는 그것을 가정하지 않는다.
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
 * `Intl.DateTimeFormat`을 활성 로케일로 감싼다. 문자열이면 ISO `YYYY-MM-DD` 로컬 날짜로,
 * `Date` 면 그대로 포맷한다.
 */
export function formatDate(
  value: Date | string,
  options?: Intl.DateTimeFormatOptions,
  locale?: LocaleTag,
): string {
  return new Intl.DateTimeFormat(locale ?? Locale.get(), options).format(resolve(value));
}
