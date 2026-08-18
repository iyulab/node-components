import { describe, it, expect, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';
import { contrast } from '../../src/utilities/accent.js';
// ⚠**both must be imported** — without the dark sheet, setting `theme="dark"` leaves the
//   background unchanged, so "recomputing" produces the same value. The first pass failed
//   in exactly this state, and the cause was the **test harness**, not the wiring.
import '../../src/assets/styles/light.css';
import '../../src/assets/styles/dark.css';

/**
 * `Theme.accent(seed)` — **builds the `--u-primary-*` ramp from a single brand color.**
 *
 * The pure function's (`deriveAccentRamp`) contract is guarded by
 * `tests/build/accent-ramp.test.ts`. What's measured here is **the wiring**: does the
 * computed value actually land in the document, does it recompute when the theme changes,
 * and does clearing it revert to the sheet's default.
 *
 * ⚠**This needs a real browser** — it reads sheet values via `getComputedStyle` to determine
 * the background, and it has to check whether inline style beats the sheet. jsdom doesn't
 * reproduce the custom-property cascade.
 */

const read = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

afterEach(() => {
  Theme.accent(null);
  document.documentElement.removeAttribute('theme');
  document.documentElement.removeAttribute('data-theme');
});

describe('Theme.accent', () => {
  it('given a seed, the 5-step ramp + text-on-surface color land in the document', () => {
    Theme.accent('#6A1B9A');

    for (const name of [
      '--u-primary-color-weakest',
      '--u-primary-color-weaker',
      '--u-primary-color-weak',
      '--u-primary-color',
      '--u-primary-color-strong',
      '--u-primary-txt-color',
    ])
      expect(read(name), name).toMatch(/^#[0-9a-f]{6}$/i);
  });

  it('🔴the values that land satisfy the contrast contract (measured by reading them from the document)', () => {
    Theme.accent('#FDD835'); // a bright seed — the color that broke the fixed-ratio derivation
    const bg = read('--u-bg-color');

    expect(contrast(read('--u-primary-color'), read('--u-primary-txt-color'))).toBeGreaterThanOrEqual(4.5);
    expect(contrast(read('--u-primary-color-strong'), bg)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(read('--u-primary-color-strong'), read('--u-primary-color'))).toBeGreaterThanOrEqual(1.2);
  });

  it('🔴changing theme «recomputes» the ramp — because the background changed', () => {
    Theme.accent('#1976D2');
    const lightStrong = read('--u-primary-color-strong');

    Theme.set('dark');
    const darkStrong = read('--u-primary-color-strong');

    expect(darkStrong).not.toBe(lightStrong);
    // the contract still holds against the dark background too (not just a different value — a «correctly» different one)
    expect(contrast(darkStrong, read('--u-bg-color'))).toBeGreaterThanOrEqual(4.5);
  });

  it('clearing it reverts to the sheet default', () => {
    const before = read('--u-primary-color');
    Theme.accent('#6A1B9A');
    expect(read('--u-primary-color')).not.toBe(before);

    Theme.accent(null);
    expect(read('--u-primary-color')).toBe(before);
  });
});

/**
 * 🔴**`Theme.accent()` covers 6 of the `primary` role token's 7 kinds.**
 *
 * `--u-primary-bg-color` is «the pale surface text sits on» (`u-tag`'s `--tag-hue-surface`),
 * which behaves unlike any ramp step, and the sheet **hand-pairs** it at **5 families × 2
 * themes = 10 values** (light and dark don't use the same contrast ratio — measured 1.14 vs.
 * 1.03). ⇒ Switching this to a derivation formula is a palette-value decision, so it needs a
 * **human call**, and this gap remains until then. A consumer app actually hit this trap
 * (*"the button is on-brand but the selected table row is blue"*).
 *
 * ⚠**This test doesn't «pin» the gap — it measures «is the documentation still true».**
 * Once a value decision is made and a derivation is wired in, **this test flips and tells
 * you** — at that point the docs (`usage.md`'s brand section · `Theme.accent`'s JSDoc) need
 * updating too.
 */
describe('Theme.accent — the one step it does not cover (a documented gap)', () => {
  it('🔴even with a seed given, `--u-primary-bg-color` stays at the sheet default', () => {
    const sheetDefault = read('--u-primary-bg-color');
    expect(sheetDefault).not.toBe('');

    Theme.accent('#E50112'); // a red seed — clearly different from the blue default
    expect(read('--u-primary-color')).not.toBe('');
    expect(read('--u-primary-bg-color')).toBe(sheetDefault);
  });

  it('so a consumer has to write one more line — and that path works', () => {
    Theme.accent('#E50112');
    document.documentElement.style.setProperty('--u-primary-bg-color', '#FDE7E9');
    expect(read('--u-primary-bg-color')).toBe('#FDE7E9');
    document.documentElement.style.removeProperty('--u-primary-bg-color');
  });
});
