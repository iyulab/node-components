import { afterEach, describe, expect, it } from 'vitest';
import { sameDateTime, splitDateTime, toDateTimeOffset, toLocalDateTime } from '../../src/components/calendar/datetime.js';

// 피커의 datetime 값 읽기 — 오프셋 있는 값은 «순간» 이라 이 브라우저의 벽시계로 읽고, 고쳐 쓰면
// 로컬 오프셋으로 같은 순간을 낸다. 시간대에 기대는 축이라 두 시간대에서 잰다(UTC 에서는 결함이 숨는다).
const originalTZ = process.env.TZ;
afterEach(() => { process.env.TZ = originalTZ; });

describe('toLocalDateTime — Asia/Seoul', () => {
  it('UTC 값을 같은 순간의 서울 벽시계로 읽는다', () => {
    process.env.TZ = 'Asia/Seoul';
    expect(toLocalDateTime('2026-09-06T22:22:34Z')).toBe('2026-09-07T07:22:34+09:00');
    expect(toLocalDateTime('2026-09-06T22:22:34.120Z')).toBe('2026-09-07T07:22:34+09:00');
    expect(toLocalDateTime('2026-09-06T10:00:00-05:00')).toBe('2026-09-07T00:00:00+09:00');
  });

  it('오프셋 없는 값 · 날짜만 · 날짜가 아닌 글자는 그대로 둔다', () => {
    process.env.TZ = 'Asia/Seoul';
    expect(toLocalDateTime('2026-09-06T22:22')).toBe('2026-09-06T22:22');
    expect(toLocalDateTime('2026-09-06')).toBe('2026-09-06');
    expect(toLocalDateTime('soon')).toBe('soon');
  });

  it('보이는 날과 시각이 순간을 따르고, 날짜만 바꿔 써도 순간은 정확히 하루 옮겨진다', () => {
    process.env.TZ = 'Asia/Seoul';
    const value = '2026-09-06T22:22:34Z';
    const { day, time } = splitDateTime(value, true);
    expect({ day, time }).toEqual({ day: '2026-09-07', time: '07:22:34' });
    // 다음 날을 고른다 — 시각은 그대로.
    const next = toDateTimeOffset('2026-09-08', time);
    expect(new Date(next).toISOString()).toBe('2026-09-07T22:22:34.000Z');
  });

  it('손대지 않은 왕복은 같은 값이다 — 로컬 표기로 다시 써도 `change` 가 아니다', () => {
    process.env.TZ = 'Asia/Seoul';
    const value = '2026-09-06T22:22:34Z';
    const { day, time } = splitDateTime(value, true);
    expect(sameDateTime(toDateTimeOffset(day, time), value)).toBe(true);
    expect(sameDateTime('2026-09-06T22:22:34Z/2026-09-07T01:00:00Z', '2026-09-07T07:22:34+09:00/2026-09-07T10:00:00+09:00')).toBe(true);
    expect(sameDateTime('2026-09-06T22:22:34Z', '2026-09-06T22:22:34+09:00')).toBe(false);
    expect(sameDateTime('2026-09-06', '2026-09-07')).toBe(false);
    expect(sameDateTime(undefined, '2026-09-06')).toBe(false);
  });
});

describe('toLocalDateTime — UTC', () => {
  it('UTC 브라우저에서도 같은 규칙이다 — 순간이 같고 표기만 `+00:00`', () => {
    process.env.TZ = 'UTC';
    expect(toLocalDateTime('2026-09-06T22:22:34Z')).toBe('2026-09-06T22:22:34+00:00');
    expect(toLocalDateTime('2026-09-07T07:22:34+09:00')).toBe('2026-09-06T22:22:34+00:00');
    expect(splitDateTime('2026-09-07T07:22:34+09:00')).toEqual({ day: '2026-09-06', time: '22:22' });
  });
});
