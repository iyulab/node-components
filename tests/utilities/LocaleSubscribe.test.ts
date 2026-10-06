import { describe, it, expect, afterEach, vi } from 'vitest';
import { Locale } from '../../src/utilities/Locale';

/**
 * `Locale.subscribe` — 로케일이 바뀌었음을 듣는 길. 종전에는 `set`·`register` 가 값만 바꾸고 아무에게도 알리지 않아,
 * 이미 그려진 문장은 다음 재렌더까지 옛 언어로 남았다.
 */
describe('Locale.subscribe', () => {
  const start = Locale.get();
  afterEach(() => Locale.set(start));

  it('set 이 활성 로케일을 바꾸면 알린다', () => {
    const fn = vi.fn();
    const off = Locale.subscribe(fn);
    Locale.set(start === 'ko' ? 'en' : 'ko');
    expect(fn).toHaveBeenCalledTimes(1);
    off();
  });

  it('NEGATIVE — 같은 로케일로 set 하면 알리지 않는다', () => {
    const fn = vi.fn();
    const off = Locale.subscribe(fn);
    Locale.set(Locale.get());
    expect(fn).not.toHaveBeenCalled();
    off();
  });

  it('register(내장 표 · 네임스페이스)도 알린다 — 등록이 화면 문장을 바꾼다', () => {
    const fn = vi.fn();
    const off = Locale.subscribe(fn);
    Locale.register('xx', { clear: 'Clear!' });
    Locale.namespace<'hello'>('subscribe-test').register('en', { hello: 'Hi' });
    expect(fn).toHaveBeenCalledTimes(2);
    off();
  });

  it('구독을 풀면 더 듣지 않는다 · 듣는 중에 풀어도 이번 알림은 끝까지 돈다', () => {
    const order: string[] = [];
    let offB = () => {};
    const offA = Locale.subscribe(() => { order.push('a'); offB(); });
    offB = Locale.subscribe(() => order.push('b'));
    Locale.set(start === 'ko' ? 'en' : 'ko');
    expect(order).toEqual(['a', 'b']);
    Locale.set(start);
    expect(order).toEqual(['a', 'b', 'a']);
    offA();
  });
});

describe('Locale.revision', () => {
  it('알릴 때마다 는다 — 등록으로 문장만 바뀌어도(get() 은 그대로)', () => {
    const r0 = Locale.revision;
    Locale.register('xx', { clear: 'Clear?' });
    expect(Locale.revision).toBe(r0 + 1);
    Locale.set(Locale.get());
    expect(Locale.revision).toBe(r0 + 1);
  });
});
