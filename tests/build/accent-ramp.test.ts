import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';
import {
  deriveAccentRamp, accentCustomProperties, contrast, mix, pickOnColor, parseColor,
  AA_TEXT, AA_GRAPHIC, MIN_STEP_SEPARATION,
} from '../../src/utilities/accent.js';

/**
 * **The contract for the seed → accent-ramp derivation.**
 *
 * What this check guards is *"does the derived value satisfy our contrast contract"* — the
 * sheet's hand-tuned values carry **hand-measured comments** like `4.60 ✓`, but a computed
 * ramp doesn't inherit that guarantee (that fact was the lock that deferred this feature
 * until now).
 *
 * ⚠**Both themes are measured by the same algorithm** — direction is defined only as
 * «moving away from / toward the background», so light (`#FFFFFF`) and dark (`#121212`) run
 * through the same code.
 */

const root = resolve(__dirname, '../..');

function sheetValue(file: string, name: string): string {
  const css = readFileSync(join(root, 'src/assets/styles', file), 'utf-8');
  const map: Record<string, string> = {};
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) map[m[1]] = m[2].trim();
  const read = (n: string, depth = 0): string => {
    const v = map[n] ?? '';
    const ref = /^var\((--[\w-]+)\)$/.exec(v);
    return ref && depth < 8 ? read(ref[1], depth + 1) : v;
  };
  return read(name);
}

/** Colors plausible as a real brand seed — the bright one (yellow) is this check's litmus test. */
const SEEDS = ['#1976D2', '#2E7D32', '#D32F2F', '#FDD835', '#6A1B9A', '#00838F', '#212121', '#F5F5F5'];

describe('accent ramp derivation', () => {
  for (const [themeName, sheet] of [['light', 'light.css'], ['dark', 'dark.css']] as const) {
    describe(themeName, () => {
      const bg = sheetValue(sheet, '--u-bg-color');

      it('reads the background value from the sheet (not hard-coded)', () => {
        expect(parseColor(bg)).not.toBeNull();
      });

      it('🔴satisfies the contrast contract for every seed — text-on-surface 4.5 · text-on-background 4.5', () => {
        const fails: string[] = [];
        for (const seed of SEEDS) {
          const r = deriveAccentRamp(seed, bg);
          const onColor = contrast(r.color, r.txt);
          const strongOnBg = contrast(r.strong, bg);
          if (onColor < AA_TEXT) fails.push(`${seed} -color/txt ${onColor.toFixed(2)}`);
          if (strongOnBg < AA_TEXT) fails.push(`${seed} -strong/bg ${strongOnBg.toFixed(2)}`);
        }
        expect(fails).toEqual([]);
      });

      it('🔴`-strong` diverges from `-color` — matching the contract alone would make the two steps identical', () => {
        const fails: string[] = [];
        for (const seed of SEEDS) {
          const r = deriveAccentRamp(seed, bg);
          const sep = contrast(r.strong, r.color);
          if (sep < MIN_STEP_SEPARATION) fails.push(`${seed} separation ${sep.toFixed(2)}`);
        }
        expect(fails).toEqual([]);
      });

      it('`-weak` reads as graphical against the background (non-text 3.0)', () => {
        const fails: string[] = [];
        for (const seed of SEEDS) {
          const c = contrast(deriveAccentRamp(seed, bg).weak, bg);
          if (c < AA_GRAPHIC) fails.push(`${seed} -weak/bg ${c.toFixed(2)}`);
        }
        expect(fails).toEqual([]);
      });

      it('steps lighten monotonically toward the background (weakest → weak)', () => {
        for (const seed of SEEDS) {
          const r = deriveAccentRamp(seed, bg);
          const d = (c: string) => contrast(c, bg);
          expect(d(r.weakest)).toBeLessThanOrEqual(d(r.weaker) + 0.01);
          expect(d(r.weaker)).toBeLessThanOrEqual(d(r.weak) + 0.01);
        }
      });
    });
  }

  it('feeding in the sheet\'s own default seed lands near the sheet value (not way off)', () => {
    const bg = sheetValue('light.css', '--u-bg-color');
    const r = deriveAccentRamp(sheetValue('light.css', '--u-primary-color'), bg);
    const sheetStrong = sheetValue('light.css', '--u-primary-color-strong');
    // does not demand an identical value — hand-tuning and computation rest on different grounds. only checks «close».
    expect(Math.abs(contrast(r.strong, bg) - contrast(sheetStrong, bg))).toBeLessThan(1.5);
  });

  it('custom property names are 1:1 with the sheet\'s role tokens', () => {
    const props = accentCustomProperties(deriveAccentRamp('#1976D2', '#FFFFFF'));
    expect(Object.keys(props).sort()).toEqual([
      '--u-primary-color',
      '--u-primary-color-strong',
      '--u-primary-color-weak',
      '--u-primary-color-weaker',
      '--u-primary-color-weakest',
      '--u-primary-txt-color',
    ]);
  });

  describe('color utilities', () => {
    it('mix computes the same as CSS color-mix(in srgb) (boundary values)', () => {
      expect(mix('#ffffff', '#000000', 1)).toBe('#ffffff');
      expect(mix('#ffffff', '#000000', 0)).toBe('#000000');
      expect(mix('#ffffff', '#000000', 0.5)).toBe('#808080');
    });

    it('reads both 3-digit hex and rgb() — both the sheet and computed values arrive in these forms', () => {
      expect(parseColor('#fff')).toEqual([255, 255, 255]);
      expect(parseColor('rgb(25, 118, 210)')).toEqual([25, 118, 210]);
      expect(parseColor('nope')).toBeNull();
    });

    it('text on a surface picks whichever side has higher contrast — yellow gets black', () => {
      expect(pickOnColor('#FDD835')).toBe('#000000');
      expect(pickOnColor('#1976D2')).toBe('#ffffff');
    });
  });
});
