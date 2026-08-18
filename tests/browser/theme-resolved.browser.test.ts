import { describe, it, expect, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';

/**
 * Convention: **the value used to branch on brightness must always be `'light' | 'dark'`.**
 *
 * ★This API exists because `get()` returns a **preference**. `'system'` is one of the
 * preferences and it's the **default**. If a consumer branches on `get() === 'dark'`, they
 * render a light screen under system + OS-dark — and that's the most common path.
 *
 * Two consumers of this repo actually got it wrong, each in a different way — one used
 * `'system'` literally in a CSS selector, so no rule ever matched; the other coerced with
 * `=== 'dark' ? … : 'light'`, picking the light theme even in dark. Both look fine reading
 * the source alone.
 */
describe('Theme.resolved() — the effective theme, not the preference', () => {
  const html = document.documentElement;

  afterEach(() => {
    html.removeAttribute('data-theme');
    html.removeAttribute('theme');
  });

  it('returns an explicit theme as-is', () => {
    Theme.set('dark');
    expect(Theme.resolved()).toBe('dark');
    Theme.set('light');
    expect(Theme.resolved()).toBe('light');
  });

  it("★returns the effective value even under the 'system' preference (where it diverges from get())", () => {
    Theme.set('system');
    // the preference is still system — that fact is the entire reason this API exists.
    expect(Theme.get()).toBe('system');
    // the effective value must always be one of the two. If 'system' leaks through, a
    // consumer's branch silently breaks (in the shape of no CSS rule matching at all).
    expect(['light', 'dark']).toContain(Theme.resolved());
  });

  it("the effective value follows <html theme> — that's where what 'system' resolved to is recorded", () => {
    html.setAttribute('data-theme', 'system');
    html.setAttribute('theme', 'dark');
    expect(Theme.get()).toBe('system');
    expect(Theme.resolved()).toBe('dark');
  });

  it('returns a value even before init (unset → media query)', () => {
    // some components render before Theme.init() has run.
    // returning undefined there just pushes the guessing onto each of them.
    expect(['light', 'dark']).toContain(Theme.resolved());
  });
});
