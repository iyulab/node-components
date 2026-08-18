import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
// @ts-expect-error — an .mjs util with no type declarations. This file pins its contract instead.
import { contrast, mix, deriveRamp, deriveStrong, deriveOnColor, evaluate } from '../../scripts/seed-ramp.mjs';

/**
 * **Is the seed → ramp derivation «evaluator» correct?**
 *
 * This file does not adopt a derivation formula — adoption is a human decision (L2). What's
 * guarded here is only ***"does the evaluator pass the current sheet"***.
 *
 * 🔴**That judgment actually paid off.** The evaluator's first pass reported the current
 * sheet **failing 3/5**, and the cause was the evaluator, not the sheet: ⑴ it pinned
 * `-color`'s "text on the surface" to white, but `warning` is **black** ⑵ it counted
 * `-weak` (graphical 3.0) as a role contract, but the sheet's own contract test doesn't
 * assert that against role tokens. ⇒ ***a check that fires on a legitimate value gets ignored.***
 */

const root = resolve(__dirname, '../..');
const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;

function sheet(file: string) {
  const css = readFileSync(join(root, 'src/assets/styles', file), 'utf-8');
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) map[m[1]] = m[2].trim();
  const read = (name: string, depth = 0): string => {
    const v = map[name] ?? '';
    const ref = v.match(/^var\((--[\w-]+)\)$/);
    return ref && depth < 8 ? read(ref[1], depth + 1) : v;
  };
  return read;
}

describe('what the seed → ramp derivation measures', () => {
  it('🔴the evaluator passes the current (known-good) sheet 5/5', () => {
    const light = sheet('light.css');
    const bg = light('--u-bg-color');
    const fails: string[] = [];

    for (const role of ROLES) {
      const r = evaluate(
        { color: light(`--u-${role}-color`), strong: light(`--u-${role}-color-strong`) },
        { bg, onColor: light(`--u-${role}-txt-color`) },
      );
      if (!r.pass) fails.push(`${role}: ${r.rows.map((x: { step: string; value: number }) => `${x.step} ${x.value.toFixed(2)}`).join(' · ')}`);
    }
    expect(fails).toEqual([]);
  });

  it('the on-color pick matches the sheet 5/5 by computation (a derivable axis)', () => {
    const light = sheet('light.css');
    for (const role of ROLES) {
      expect(deriveOnColor(light(`--u-${role}-color`)).toLowerCase())
        .toBe(light(`--u-${role}-txt-color`).toLowerCase());
    }
  });

  it('mix computes the same as CSS color-mix(in srgb) (boundary values)', () => {
    expect(mix('#ffffff', '#000000', 1)).toBe('#ffffff');
    expect(mix('#ffffff', '#000000', 0)).toBe('#000000');
    expect(mix('#ffffff', '#000000', 0.5)).toBe('#808080');
  });

  it('🔴a fixed-ratio derivation breaks the contract on a «bright seed» — this is T-E\'s measurement', () => {
    const bg = '#ffffff';
    // a yellow-family seed: even mixed 80% with black, it falls short of 4.5 contrast against the background.
    const yellow = evaluate(deriveRamp('#FDD835'), { bg });
    expect(yellow.pass).toBe(false);

    // mixing darker until the target contrast is met does satisfy it ⇒ this is a limit of the fixed ratio, not of the formula itself.
    const targeted = deriveStrong('#FDD835', bg);
    expect(contrast(targeted.value, bg)).toBeGreaterThanOrEqual(4.5);
  });

  it('🔴but searching for a target contrast erases the «step» — something to answer before adoption', () => {
    const bg = '#ffffff';
    // the primary seed already exceeds 4.5, so the search stops at the seed itself ⇒ -strong == -color.
    const t = deriveStrong('#1976D2', bg);
    expect(t.ratio).toBe(1);
    expect(contrast(t.value, '#1976D2')).toBeCloseTo(1, 2);
  });
});
