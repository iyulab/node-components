import { describe, it, expect, afterEach } from 'vitest';
import { defaultSearchMatch, foldForSearch, initialsOf, isHangul } from '../../src/utilities/search.js';
import { Locale } from '../../src/utilities/Locale.js';

describe('foldForSearch', () => {
  it('한글은 자판으로 친 순서의 자모로 푼다 — 겹모음 · 겹받침은 두 글쇠', () => {
    expect(foldForSearch('서울')).toBe('ㅅㅓㅇㅜㄹ');
    expect(foldForSearch('과')).toBe('ㄱㅗㅏ');
    expect(foldForSearch('닭')).toBe('ㄷㅏㄹㄱ');
    expect(foldForSearch('ㅘ')).toBe('ㅗㅏ');
  });

  it('대소문자와 발음 구별 기호를 접는다', () => {
    expect(foldForSearch('Ärger Café')).toBe('arger cafe');
  });
});

describe('defaultSearchMatch — 치는 도중의 한글', () => {
  // «서울» 을 두벌식으로 치는 길: ㅅ → 서 → 성 → 서우 → 서울
  it.each(['ㅅ', '서', '성', '서우', '서울'])('«%s» 는 서울을 맞춘다', (q) => {
    expect(defaultSearchMatch('서울', q)).toBe(true);
  });

  it('«과» 를 치는 길(고 → 과)도 맞춘다 — 겹모음을 한 글자로 두면 «고» 가 «과» 의 앞부분이 아니다', () => {
    expect(defaultSearchMatch('과일', '고')).toBe(true);
  });

  it('초성만 친 질의는 초성끼리 맞춘다', () => {
    expect(defaultSearchMatch('서울특별시', 'ㅅㅇ')).toBe(true);
    expect(defaultSearchMatch('부산', 'ㅅㅇ')).toBe(false);
  });

  it('NEGATIVE: 다른 글자는 맞추지 않는다', () => {
    expect(defaultSearchMatch('부산', '서')).toBe(false);
    expect(defaultSearchMatch('성남', '서울')).toBe(false);
  });

  it('빈 검색어는 모두를 맞춘다 · 영문은 대소문자를 접는다', () => {
    expect(defaultSearchMatch('anything', '  ')).toBe(true);
    expect(defaultSearchMatch('Seoul', 'seo')).toBe(true);
  });

  it('보조 함수', () => {
    expect(initialsOf('서울 2')).toBe('ㅅㅇ 2');
    expect(isHangul('성')).toBe(true);
    expect(isHangul('とう')).toBe(false);
    expect(isHangul('')).toBe(false);
  });
});

describe('Locale.matchesSearch — 언어별 등록', () => {
  afterEach(() => {
    Locale.registerSearch('tr', defaultSearchMatch);
    Locale.set('en');
  });

  it('등록이 없으면 기본 규칙 · 등록하면 그 언어에서 그것을 쓴다', () => {
    Locale.set('tr');
    expect(Locale.matchesSearch('İstanbul', 'is')).toBe(true); // 기본: İ → I + 점 → i
    const turkish = (text: string, query: string) =>
      text.toLocaleLowerCase('tr').includes(query.toLocaleLowerCase('tr'));
    Locale.registerSearch('tr', turkish);
    expect(Locale.matchesSearch('ISPARTA', 'ıs')).toBe(true);
    expect(Locale.matchesSearch('ISPARTA', 'ıs', 'en')).toBe(false);
  });
});
