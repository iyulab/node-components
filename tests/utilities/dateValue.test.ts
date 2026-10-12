import { afterEach, describe, expect, it } from 'vitest';
import { localOffset, readDateValue, writeInstant, writePlainDate, writePlainDateTime } from '../../src/utilities/dateValue.js';
import { formatDate } from '../../src/utilities/format.js';

// 시각 값 세 종류(순간 · 벽시계 · 날짜만)를 한 곳에서 읽고 쓴다. 시간대에 기대는 축이라 세 시간대에서 잰다 —
// UTC 에서는 «날짜만을 UTC 자정으로 읽는» 결함이 숨고, 서쪽(음수 오프셋)에서만 하루 밀린다.
const originalTZ = process.env.TZ;
afterEach(() => { process.env.TZ = originalTZ; });

const zones = ['Asia/Seoul', 'America/New_York', 'UTC'];

describe('readDateValue — 종류', () => {
  it.each(zones)('날짜만은 그 날의 로컬 자정이다 — %s', (tz) => {
    process.env.TZ = tz;
    const r = readDateValue('2026-09-06')!;
    expect(r.kind).toBe('plainDate');
    expect([r.date.getFullYear(), r.date.getMonth() + 1, r.date.getDate(), r.date.getHours()]).toEqual([2026, 9, 6, 0]);
  });

  it.each(zones)('오프셋 없는 날짜-시각은 로컬 벽시계 그대로다 — %s', (tz) => {
    process.env.TZ = tz;
    for (const text of ['2026-09-06T22:22', '2026-09-06 22:22:34', '2026-09-06T22:22:34.5']) {
      const r = readDateValue(text)!;
      expect(r.kind, text).toBe('plainDateTime');
      expect([r.date.getDate(), r.date.getHours(), r.date.getMinutes()], text).toEqual([6, 22, 22]);
    }
    expect(readDateValue('2026-09-06T22:22:34.5')!.date.getMilliseconds()).toBe(500);
  });

  it.each(zones)('오프셋 있는 값은 순간이다 — 어느 시간대에서든 같은 시점 — %s', (tz) => {
    process.env.TZ = tz;
    const at = Date.UTC(2026, 8, 6, 22, 22, 34);
    expect(readDateValue('2026-09-06T22:22:34Z')).toEqual({ kind: 'instant', date: new Date(at) });
    expect(readDateValue('2026-09-07T07:22:34+09:00')!.date.getTime()).toBe(at);
    expect(readDateValue('2026-09-06T17:22:34-0500')!.date.getTime()).toBe(at);
    expect(readDateValue('2026-09-06T22:22:34.1234567Z')!.date.getTime()).toBe(at + 123);
  });

  it('`Date` 는 순간이다', () => {
    const d = new Date(Date.UTC(2026, 0, 1));
    expect(readDateValue(d)).toEqual({ kind: 'instant', date: d });
  });

  it.each([
    ['2026-02-30'], ['2026-13-01'], ['2026-09-06T24:00'], ['2026-09-06T10:60'], ['2026-02-30T10:00Z'],
    ['2026-9-6'], ['06/09/2026'], ['soon'], [''], ['2026-09-06T'], ['2026-09-06T10'],
  ])('⚪NEGATIVE — %j 는 없는 날·모양이라 null (굴러간 날짜를 만들지 않는다)', (text) => {
    expect(readDateValue(text)).toBeNull();
  });

  it('⚪NEGATIVE — 잘못된 `Date` 는 null', () => {
    expect(readDateValue(new Date(NaN))).toBeNull();
  });
});

describe('쓰기 — 읽은 것을 같은 종류로', () => {
  it('서울: 순간은 로컬 오프셋으로 같은 시점 · 벽시계와 날짜는 오프셋 없이', () => {
    process.env.TZ = 'Asia/Seoul';
    const instant = readDateValue('2026-09-06T22:22:34Z')!.date;
    expect(writeInstant(instant)).toBe('2026-09-07T07:22:34+09:00');
    expect(writePlainDateTime(instant)).toBe('2026-09-07T07:22:34');
    expect(writePlainDateTime(instant, false)).toBe('2026-09-07T07:22');
    expect(writePlainDate(instant)).toBe('2026-09-07');
  });

  it('뉴욕: 오프셋은 그 날짜의 것(서머타임) — 같은 시간대도 날마다 다르다', () => {
    process.env.TZ = 'America/New_York';
    expect(localOffset(new Date(Date.UTC(2026, 6, 1, 12)))).toBe('-04:00');
    expect(localOffset(new Date(Date.UTC(2026, 0, 1, 12)))).toBe('-05:00');
    expect(writeInstant(new Date(Date.UTC(2026, 0, 1, 12)))).toBe('2026-01-01T07:00:00-05:00');
  });

  it.each(zones)('왕복 — 쓴 글자를 다시 읽으면 같은 종류 · 같은 시점 — %s', (tz) => {
    process.env.TZ = tz;
    const d = new Date(Date.UTC(2026, 2, 8, 6, 30, 15));
    expect(readDateValue(writeInstant(d))).toEqual({ kind: 'instant', date: d });
    expect(readDateValue(writePlainDateTime(d))!.date.getTime()).toBe(d.getTime());
    expect(readDateValue(writePlainDate(d))!.kind).toBe('plainDate');
  });
});

describe('formatDate 가 같은 읽기를 쓴다', () => {
  it('🔴뉴욕에서도 날짜만은 그 날이다 — new Date("YYYY-MM-DD") 는 UTC 자정이라 전날이 된다', () => {
    process.env.TZ = 'America/New_York';
    expect(new Date('2026-09-06').getDate()).toBe(5); // 플랫폼 파서의 함정 — 이것을 피하려는 것
    expect(formatDate('2026-09-06', { day: 'numeric' }, 'en')).toBe('6');
  });

  it('🔴없는 날(2026-02-30)은 3월 2일로 굴리지 않고 원래 글자를 보인다', () => {
    expect(formatDate('2026-02-30', { dateStyle: 'medium' }, 'en')).toBe('2026-02-30');
  });

  it('우리 세 형태가 아닌 글자는 종전처럼 플랫폼 파서에 맡긴다', () => {
    process.env.TZ = 'UTC';
    expect(formatDate('March 5, 2026', { month: 'numeric', day: 'numeric' }, 'en')).toBe('3/5');
  });
});
