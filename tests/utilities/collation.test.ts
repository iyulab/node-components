import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';
import { compareText, getCollator } from '../../src/utilities/collation.js';

// 같은 배열을 로캘만 달리해 줄 세운다 — 품번 `A-2` 가 `A-10` 앞이고, 한글이 라틴 앞 / 뒤인지는 앱의 로캘이 정한다.
const SAMPLE = ['Apple', '가나다', 'banana', '나라', 'A-10', 'A-2', 'A-1'];

describe('compareText — one text order for tables', () => {
  let prev: string;
  beforeEach(() => {
    prev = Locale.get();
  });
  afterEach(() => {
    Locale.set(prev as Parameters<typeof Locale.set>[0]);
  });

  it('puts A-2 before A-10 — numbers inside text compare as numbers', () => {
    Locale.set('en');
    const sorted = [...SAMPLE].sort(compareText);
    expect(sorted.indexOf('A-1')).toBeLessThan(sorted.indexOf('A-2'));
    expect(sorted.indexOf('A-2')).toBeLessThan(sorted.indexOf('A-10'));
    expect(compareText('item2', 'item10')).toBeLessThan(0);
  });

  it('follows the app locale for where Hangul sits, not the browser locale', () => {
    Locale.set('en');
    const en = [...SAMPLE].sort(compareText);
    expect(en.indexOf('banana')).toBeLessThan(en.indexOf('가나다'));

    Locale.set('ko');
    const ko = [...SAMPLE].sort(compareText);
    expect(ko.indexOf('가나다')).toBeLessThan(ko.indexOf('A-1'));
    // 같은 데이터가 로캘만 달라 다른 순서 — 로캘을 읽는다는 증거(캐시가 낡은 로캘을 붙들면 둘이 같아진다).
    expect(ko).not.toEqual(en);
  });

  it('reads Locale.get() on every call so a locale switch changes the order', () => {
    Locale.set('en');
    const before = compareText('가', 'a');
    Locale.set('ko');
    const after = compareText('가', 'a');
    expect(before).toBeGreaterThan(0);
    expect(after).toBeLessThan(0);
  });

  it('treats case and accents as the same letter so equal rows keep their input order', () => {
    Locale.set('en');
    expect(compareText('abc', 'ABC')).toBe(0);
    expect(compareText('resume', 'résumé')).toBe(0);
  });

  it('takes an explicit locale without touching the app locale', () => {
    Locale.set('en');
    expect(compareText('가', 'a', 'ko')).toBeLessThan(0);
    expect(Locale.get()).toBe('en');
  });

  it('does not throw on a malformed locale tag — it compares as English', () => {
    expect(() => compareText('a', 'b', 'ko_KR')).not.toThrow();
    expect(compareText('A-2', 'A-10', 'ko_KR')).toBeLessThan(0);
  });

  it('caches one collator per locale', () => {
    expect(getCollator('en')).toBe(getCollator('en'));
    expect(getCollator('en')).not.toBe(getCollator('ko'));
  });
});
