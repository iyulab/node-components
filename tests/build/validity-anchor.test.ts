import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join } from 'path';

/**
 * 규약: **`this.commit(flags, message, anchor)` 의 앵커는 호스트 자신이 아니다.**
 *
 * `ElementInternals.setValidity` 의 앵커는 호스트의 shadow-including **자손**이어야 한다(명세). 최신 브라우저는
 * 호스트도 받아 주지만 구형 Chromium 은 `NotFoundError` 를 던지고, 그 예외가 검증을 끊어 `change` 가 나가지 않는다
 * (`u-radio` 가 그랬다 — 시험 환경의 브라우저로는 재현되지 않는다). 그래서 **소스에서** 잰다: 대상 목록은 소스를
 * 훑어 도출하고(손으로 쓴 컨트롤 목록이 없다), 세 번째 인자가 맨 `this` 인 호출이 있으면 실패한다.
 *
 * ⚠한 줄 인자 분해기다 — 인자가 다른 함수 호출을 거치는 변수 경유(`const a = this; commit(…, a)`)는 못 본다.
 * 그 경로는 `tests/browser/radio-validity-anchor.browser.test.ts` 처럼 앵커 검사를 재현하는 시험의 몫이다.
 */

const root = resolve(__dirname, '../..');

/** `(` 바로 뒤에서 시작해 짝이 맞는 `)` 까지의 최상위 인자 목록을 낸다(문자열 · 괄호 · 중괄호 · 대괄호를 건너뛴다). */
function splitArgs(src: string, open: number): string[] {
  const args: string[] = [];
  let depth = 0;
  let cur = '';
  for (let i = open + 1; i < src.length; i++) {
    const c = src[i];
    if (c === '"' || c === "'" || c === '`') {
      let j = i + 1;
      while (j < src.length && src[j] !== c) j += src[j] === '\\' ? 2 : 1;
      cur += src.slice(i, j + 1);
      i = j;
      continue;
    }
    if (c === '(' || c === '{' || c === '[') depth++;
    if (c === ')' || c === '}' || c === ']') {
      if (depth === 0) {
        if (cur.trim()) args.push(cur.trim());
        return args;
      }
      depth--;
    }
    if (c === ',' && depth === 0) {
      args.push(cur.trim());
      cur = '';
      continue;
    }
    cur += c;
  }
  return args;
}

/** 소스에서 `this.commit(` 호출마다 [앵커 인자]를 낸다(인자가 셋 미만이면 앵커 없음 → 생략). */
function commitAnchors(src: string): string[] {
  const out: string[] = [];
  const re = /this\.commit\(/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(src))) {
    const args = splitArgs(src, m.index + m[0].length - 1);
    if (args.length >= 3) out.push(args[2]);
  }
  return out;
}

describe('validity anchor — 소스 규약', () => {
  it('분해기: 맨 `this` 를 짚고, 안쪽 요소·옵셔널 체인·중첩 인자는 통과시킨다', () => {
    expect(commitAnchors("this.commit(a, b, this);")).toEqual(['this']);
    expect(commitAnchors("this.commit(\n  m ? { valueMissing: true } : {},\n  m ? f('a,b') : '',\n  this,\n);")).toEqual(['this']);
    expect(commitAnchors('this.commit(flags, message, this.containerEl ?? undefined);')).toEqual(['this.containerEl ?? undefined']);
    expect(commitAnchors("this.commit(f, m, this.renderRoot.querySelector('.symbols') as HTMLElement ?? undefined);"))
      .toEqual(["this.renderRoot.querySelector('.symbols') as HTMLElement ?? undefined"]);
    expect(commitAnchors('this.commit();')).toEqual([]);
  });

  const sources = globSync('src/**/*.ts', { cwd: root }).map(p => join(root, p));

  it('대상이 비어 있지 않다(글롭이 조용히 0건이 되지 않는다)', () => {
    const total = sources.flatMap(f => commitAnchors(readFileSync(f, 'utf-8'))).length;
    expect(total).toBeGreaterThan(8);
  });

  it('어느 컨트롤도 호스트(`this`)를 앵커로 넘기지 않는다', () => {
    const offenders = sources.flatMap(f => commitAnchors(readFileSync(f, 'utf-8')).map(a => [f, a] as const))
      .filter(([, a]) => a === 'this')
      .map(([f]) => f.replace(root, ''));
    expect(offenders).toEqual([]);
  });
});
