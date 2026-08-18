import { describe, it, expect, afterEach } from 'vitest';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `Locale.namespace()` — where a Layer 2+ package holds its own screen strings (1.23.0~).
 *
 * ## What this file checks
 *
 * ⑴ **Is it purely additive?** — do the validation-message (`getValue`) keyset and behavior
 *    stay unchanged.
 * ⑵ **Isolation** — namespaces don't leak keys into each other.
 * ⑶ **Chain** — does active locale → base → en follow the *same* rule as `getValue`.
 * ⑷ **Missing key** — does it surface instead of silently disappearing.
 *
 * ⚠Why ⑶ is checked separately: if the chain rule were implemented twice, one copy could
 * drift unnoticed. Today both share one `chainOf` — this assertion is what fires when that
 * sharing breaks.
 */

describe('Locale.namespace', () => {
  afterEach(() => {
    Locale.set('en');
  });

  it('⑴ does not touch the validation-message API (pure addition)', () => {
    const t = Locale.namespace<'empty'>('purity-check');
    t.register('en', { empty: 'No data' });
    // a same-named key in a namespace does not affect validation-message lookups
    expect(Locale.getValue('valueMissing')).toBe('This field is required');
    expect(t.text('empty')).toBe('No data');
  });

  it('⑵ namespaces are isolated from each other — the same key can hold different values', () => {
    const a = Locale.namespace<'title'>('pkg-a');
    const b = Locale.namespace<'title'>('pkg-b');
    a.register('en', { title: 'A' });
    b.register('en', { title: 'B' });
    expect([a.text('title'), b.text('title')]).toEqual(['A', 'B']);
  });

  it('⑵-b a handle with the same name points at the same store', () => {
    Locale.namespace<'k'>('shared').register('en', { k: 'v' });
    expect(Locale.namespace<'k'>('shared').text('k')).toBe('v');
  });

  it('⑶ the chain follows the same rule as getValue (exact → base → en · case-insensitive)', () => {
    const t = Locale.namespace<'k'>('chain');
    t.register('en', { k: 'english' });
    t.register('ko', { k: '한국어' });

    Locale.set('ko-KR');
    expect(t.text('k'), 'ko-KR → ko').toBe('한국어');
    Locale.set('KO');
    expect(t.text('k'), 'case-insensitive').toBe('한국어');
    Locale.set('nl');
    expect(t.text('k'), 'unregistered locale → en').toBe('english');
  });

  it('⑶-b repeated registrations merge — passing only some keys leaves the rest intact', () => {
    const t = Locale.namespace<'a' | 'b'>('merge');
    t.register('en', { a: 'A' });
    t.register('en', { b: 'B' });
    expect([t.text('a'), t.text('b')]).toEqual(['A', 'B']);
  });

  it('⑷ a missing key returns the key itself — it does not silently become an empty string', () => {
    const t = Locale.namespace<'missing'>('empty-ns');
    expect(t.text('missing')).toBe('missing');
  });

  it('substitution follows the same syntax as validation messages ({name} · unresolved stays as-is)', () => {
    const t = Locale.namespace<'greet'>('params');
    t.register('en', { greet: 'Hello {who}, you have {n}' });
    expect(t.text('greet', { who: 'Ann', n: 3 })).toBe('Hello Ann, you have 3');
    expect(t.text('greet', { who: 'Ann' })).toBe('Hello Ann, you have {n}');
  });
});
