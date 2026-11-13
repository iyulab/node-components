import { describe, it, expect, beforeEach } from 'vitest';
import { dayOfWeekIndex, startOfWeek, weekStartDay } from '../../src/components/calendar/dates.js';
import { resolvePresets } from '../../src/components/date-range-picker/presets.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * 한 주가 여는 요일은 로케일이 정한다 — `Intl.Locale` 의 CLDR 자료. 달력 격자 · 요일 머리글 · Home/End ·
 * «이번 주» 프리셋이 모두 이 한 값을 읽는다. (격자와 키는 `tests/browser/calendar-week-start` 가 실제 화면으로 잰다.)
 */
describe('weekStartDay — the locale\'s first day of the week (0 = Sunday … 6 = Saturday)', () => {
  it.each([
    // 오래 안정적인 지역만 고정한다 — 그 밖의 로케일은 CLDR 판에 따라 바뀔 수 있어(예: `zh-CN` 은 월요일) 엔진이 답한다.
    ['en', 0], ['en-US', 0], ['ko', 0], ['ja', 0], ['th', 0],
    ['de', 1], ['fr', 1], ['ru', 1], ['en-GB', 1],
    ['fa', 6], ['ar-EG', 6],
  ])('%s → %i', (locale, expected) => {
    expect(weekStartDay(locale)).toBe(expected);
  });

  it('falls back to Sunday for a tag it cannot read (NEGATIVE — a bad tag must not throw)', () => {
    expect(weekStartDay('')).toBe(0);
    expect(weekStartDay('not a locale!!')).toBe(0);
  });
});

describe('dayOfWeekIndex / startOfWeek', () => {
  // 2026-03-18 is a Wednesday.
  const wed = new Date(2026, 2, 18);

  it('counts the column from the first day of the week', () => {
    expect(dayOfWeekIndex(wed, 0)).toBe(3); // Sun Mon Tue [Wed]
    expect(dayOfWeekIndex(wed, 1)).toBe(2); // Mon Tue [Wed]
    expect(dayOfWeekIndex(wed, 6)).toBe(4); // Sat Sun Mon Tue [Wed]
    expect(dayOfWeekIndex(new Date(2026, 2, 15), 1)).toBe(6); // Sunday is the last column of a Monday-first week
  });

  it('finds the week start across a month and a year boundary', () => {
    expect(startOfWeek(wed, 1)).toEqual(new Date(2026, 2, 16));
    expect(startOfWeek(new Date(2026, 0, 2), 0)).toEqual(new Date(2025, 11, 28));
    expect(startOfWeek(new Date(2026, 0, 2), 6)).toEqual(new Date(2025, 11, 27));
  });
});

describe('thisWeek / lastWeek follow the locale\'s week', () => {
  beforeEach(() => Locale.set('en'));
  const week = (name: 'thisWeek' | 'lastWeek', locale: string) => {
    Locale.set(locale);
    const { start, end } = resolvePresets([name], new Date(2026, 2, 18))[0]; // Wednesday
    return [start, end];
  };

  it('de: Monday – Sunday', () => {
    expect(week('thisWeek', 'de')).toEqual(['2026-03-16', '2026-03-22']);
    expect(week('lastWeek', 'de')).toEqual(['2026-03-09', '2026-03-15']);
  });

  it('fa: Saturday – Friday', () => {
    expect(week('thisWeek', 'fa')).toEqual(['2026-03-14', '2026-03-20']);
    expect(week('lastWeek', 'fa')).toEqual(['2026-03-07', '2026-03-13']);
  });

  it('en: Sunday – Saturday, as before (NEGATIVE — an unchanged locale must not move)', () => {
    expect(week('thisWeek', 'en')).toEqual(['2026-03-15', '2026-03-21']);
  });

  it('a Sunday under a Monday-first locale belongs to the week that is ending', () => {
    Locale.set('de');
    const { start, end } = resolvePresets(['thisWeek'], new Date(2026, 2, 15))[0]; // Sunday
    expect([start, end]).toEqual(['2026-03-09', '2026-03-15']);
  });
});
