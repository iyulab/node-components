import { describe, it, expect, afterEach } from 'vitest';
import { defaultSearchMatch, foldForSearch, hangulKeystrokes, initialsOf, isHangul } from '../../src/utilities/search.js';
import { Locale } from '../../src/utilities/Locale.js';

describe('접기', () => {
  it('hangulKeystrokes: 한글은 자판으로 친 순서의 자모 — 겹모음 · 겹받침은 두 글쇠', () => {
    expect(hangulKeystrokes('서울')).toBe('ㅅㅓㅇㅜㄹ');
    expect(hangulKeystrokes('과')).toBe('ㄱㅗㅏ');
    expect(hangulKeystrokes('닭')).toBe('ㄷㅏㄹㄱ');
    expect(hangulKeystrokes('ㅘ')).toBe('ㅗㅏ');
  });

  it('foldForSearch: 대소문자와 발음 구별 기호를 접고 한글은 음절 그대로', () => {
    expect(foldForSearch('Ärger Café')).toBe('arger cafe');
    expect(foldForSearch('서울')).toBe('서울');
  });
});

describe('defaultSearchMatch — 조합 중인 마지막 음절', () => {
  // «서울» 을 두벌식으로 치는 길: ㅅ → 서 → 성 → (서 확정) 우 → 울
  it.each(['ㅅ', '서', '성', '서우', '서울'])('조합 중 «%s» 는 서울을 맞춘다', (q) => {
    expect(defaultSearchMatch('서울', q, { composing: true })).toBe(true);
  });

  it('조합 중 «서우» 는 확정된 «서» 를 음절 그대로 요구한다 — 성남은 아니다', () => {
    expect(defaultSearchMatch('성남', '서우', { composing: true })).toBe(false);
  });

  it('«과» 를 치는 길(고 → 과)도 맞춘다 — 겹모음을 한 글자로 두면 «고» 가 «과» 의 앞부분이 아니다', () => {
    expect(defaultSearchMatch('과일', '고', { composing: true })).toBe(true);
  });
});

describe('defaultSearchMatch — 확정된 질의', () => {
  it('음절 그대로 견준다 — 확정된 «서» 는 성남을 맞추지 않는다', () => {
    expect(defaultSearchMatch('서울', '서')).toBe(true);
    expect(defaultSearchMatch('성남', '서')).toBe(false);
  });

  it('초성만 친 질의는 초성끼리 맞춘다', () => {
    expect(defaultSearchMatch('서울특별시', 'ㅅㅇ')).toBe(true);
    expect(defaultSearchMatch('부산', 'ㅅㅇ')).toBe(false);
  });

  it('NEGATIVE: 다른 글자는 맞추지 않는다', () => {
    expect(defaultSearchMatch('부산', '서')).toBe(false);
    expect(defaultSearchMatch('성남', '서울')).toBe(false);
  });

  it('빈 검색어는 모두를 맞춘다 · 영문은 대소문자와 발음 구별 기호를 접는다', () => {
    expect(defaultSearchMatch('anything', '  ')).toBe(true);
    expect(defaultSearchMatch('Seoul', 'seo')).toBe(true);
    expect(defaultSearchMatch('Café', 'cafe')).toBe(true);
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
    expect(Locale.matchesSearch('ISPARTA', 'ıs', { locale: 'en' })).toBe(false);
  });

  it('composing 이 등록된 규칙에 전해진다', () => {
    const seen: unknown[] = [];
    Locale.registerSearch('tr', (_t, _q, options) => { seen.push(options.composing); return true; });
    Locale.matchesSearch('a', 'b', { locale: 'tr', composing: true });
    expect(seen).toEqual([true]);
  });
});
