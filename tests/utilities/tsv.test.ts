import { describe, it, expect } from 'vitest';
import { encodeTsv, decodeTsv } from '../../src/utilities/tsv.js';

/**
 * 스프레드시트 클립보드 TSV — Excel 이 클립보드에 쓰는 형식(RFC 4180 인용 + 탭 구분 + 행마다 줄바꿈)과
 * 왕복해야 한다. 인용하지 않으면 줄바꿈이 든 셀이 붙여넣는 쪽에서 행으로 쪼개진다.
 */
describe('encodeTsv', () => {
  it('탭·줄바꿈·따옴표가 든 셀만 인용하고 행을 줄바꿈으로 잇는다', () => {
    expect(encodeTsv([['a', 'b'], ['c', 'd']])).toBe('a\tb\nc\td');
    expect(encodeTsv([['첫 줄\n둘째 줄', 'x']])).toBe('"첫 줄\n둘째 줄"\tx');
    expect(encodeTsv([['5" 나사']])).toBe('"5"" 나사"');
    expect(encodeTsv([['a\tb']])).toBe('"a\tb"');
  });

  it('한 셀은 줄바꿈 없이 그 글자 그대로다 — 입력란에 붙여넣어도 줄바꿈이 따라오지 않는다', () => {
    expect(encodeTsv([['hello']])).toBe('hello');
  });

  it('마지막 행이 빈 셀 하나면 줄바꿈으로 닫아 그 행을 보존한다', () => {
    expect(encodeTsv([['a'], ['']])).toBe('a\n\n');
    expect(encodeTsv([['']])).toBe('\n');
    expect(encodeTsv([])).toBe('');
  });
});

describe('decodeTsv', () => {
  it('Excel 이 쓴 텍스트(CRLF · 끝 줄바꿈 · 인용된 여러 줄 셀)를 읽는다', () => {
    expect(decodeTsv('이름\t비고\r\n가\t"첫 줄\r\n둘째 줄"\r\n')).toEqual([
      ['이름', '비고'],
      ['가', '첫 줄\r\n둘째 줄'],
    ]);
  });

  it('셀 중간의 따옴표는 글자다 — 인용은 셀 첫 글자에서만 시작한다', () => {
    expect(decodeTsv('5" 나사\t"a""b"\n')).toEqual([['5" 나사', 'a"b']]);
  });

  it('끝의 줄바꿈은 하나만 삼키고, 빈 셀로 끝나는 행은 남긴다', () => {
    expect(decodeTsv('a\n\n')).toEqual([['a'], ['']]);
    expect(decodeTsv('a\t\n')).toEqual([['a', '']]);
    expect(decodeTsv('\tb\n')).toEqual([['', 'b']]); // 앞의 빈 셀이 열을 밀지 않는다
  });

  it('줄바꿈으로 끝나지 않는 텍스트(다른 앱에서 복사)도 읽는다', () => {
    expect(decodeTsv('a\tb')).toEqual([['a', 'b']]);
    expect(decodeTsv('x')).toEqual([['x']]);
    expect(decodeTsv('')).toEqual([]);
  });

  it('LF·CR·CRLF 줄 끝을 모두 받는다', () => {
    expect(decodeTsv('a\rb\r\nc\n')).toEqual([['a'], ['b'], ['c']]);
  });
});

describe('왕복 — decodeTsv(encodeTsv(rows)) === rows', () => {
  // 시드 고정 난수(외부 의존 없는 속성 시험) — 실패하면 같은 입력이 재현된다.
  function rng(seed: number) {
    return () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 2 ** 32;
    };
  }
  const ALPHABET = ['a', '가', ' ', '\t', '\n', '\r', '\r\n', '"', '""', ',', '5"', '=', ' '];

  it('탭·줄바꿈·따옴표·빈 셀·빈 행을 섞은 표 500개가 그대로 돌아온다', () => {
    const next = rng(20260930);
    for (let n = 0; n < 500; n++) {
      const rowCount = 1 + Math.floor(next() * 5);
      const colCount = 1 + Math.floor(next() * 4);
      const rows = Array.from({ length: rowCount }, () =>
        Array.from({ length: colCount }, () => {
          const len = Math.floor(next() * 4);
          return Array.from({ length: len }, () => ALPHABET[Math.floor(next() * ALPHABET.length)]).join('');
        }),
      );
      expect(decodeTsv(encodeTsv(rows)), JSON.stringify(rows)).toEqual(rows);
    }
  });
});
