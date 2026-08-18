import { describe, it, expect, afterEach } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `Locale.namespace()` — Layer 2+ 패키지가 자기 화면 문자열을 담는 자리 (1.23.0~).
 *
 * ## 이 파일이 재는 것
 *
 * ⑴ **순수 가산인가** — 검증 메시지(`getValue`)의 키셋·동작이 그대로인가.
 * ⑵ **격리** — 네임스페이스끼리 키가 섞이지 않는가.
 * ⑶ **사슬** — 활성 로케일 → base → en 이 `getValue` 와 «같은» 규칙인가.
 * ⑷ **없는 키** — 조용히 사라지지 않고 드러나는가.
 *
 * ⚠⑶ 을 따로 재는 이유: 사슬 규칙을 두 벌로 구현하면 한쪽만 고쳐지고 아무도 모른다.
 * 지금은 `chainOf` 하나를 공유하는데, **그 공유가 깨졌을 때 발화하는 것**이 이 단언이다.
 */

describe('Locale.namespace', () => {
  afterEach(() => {
    Locale.set('en');
  });

  it('⑴ 검증 메시지 API 를 건드리지 않는다 (순수 가산)', () => {
    const t = Locale.namespace<'empty'>('purity-check');
    t.register('en', { empty: 'No data' });
    // 같은 이름의 키가 네임스페이스에 있어도 검증 메시지 조회는 영향을 받지 않는다
    expect(Locale.getValue('valueMissing')).toBe('This field is required');
    expect(t.text('empty')).toBe('No data');
  });

  it('⑵ 네임스페이스끼리 격리된다 — 같은 키가 서로 다른 값을 갖는다', () => {
    const a = Locale.namespace<'title'>('pkg-a');
    const b = Locale.namespace<'title'>('pkg-b');
    a.register('en', { title: 'A' });
    b.register('en', { title: 'B' });
    expect([a.text('title'), b.text('title')]).toEqual(['A', 'B']);
  });

  it('⑵-b 같은 이름의 핸들은 같은 저장소를 가리킨다', () => {
    Locale.namespace<'k'>('shared').register('en', { k: 'v' });
    expect(Locale.namespace<'k'>('shared').text('k')).toBe('v');
  });

  it('⑶ 사슬이 getValue 와 같은 규칙이다 (정확 → base → en · 대소문자 무시)', () => {
    const t = Locale.namespace<'k'>('chain');
    t.register('en', { k: 'english' });
    t.register('ko', { k: '한국어' });

    Locale.set('ko-KR');
    expect(t.text('k'), 'ko-KR → ko').toBe('한국어');
    Locale.set('KO');
    expect(t.text('k'), '대소문자 무시').toBe('한국어');
    Locale.set('nl');
    expect(t.text('k'), '미등록 로케일 → en').toBe('english');
  });

  it('⑶-b 반복 등록은 병합된다 — 일부 키만 넘겨도 나머지가 남는다', () => {
    const t = Locale.namespace<'a' | 'b'>('merge');
    t.register('en', { a: 'A' });
    t.register('en', { b: 'B' });
    expect([t.text('a'), t.text('b')]).toEqual(['A', 'B']);
  });

  it('⑷ 없는 키는 키 자체를 돌려준다 — 조용히 빈 문자열이 되지 않는다', () => {
    const t = Locale.namespace<'missing'>('empty-ns');
    expect(t.text('missing')).toBe('missing');
  });

  it('치환은 검증 메시지와 같은 문법이다 ({name} · 미해결은 그대로)', () => {
    const t = Locale.namespace<'greet'>('params');
    t.register('en', { greet: 'Hello {who}, you have {n}' });
    expect(t.text('greet', { who: 'Ann', n: 3 })).toBe('Hello Ann, you have 3');
    expect(t.text('greet', { who: 'Ann' })).toBe('Hello Ann, you have {n}');
  });
});
