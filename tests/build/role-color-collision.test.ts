import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve, join } from 'path';

/**
 * **A role color's «meaning collision»** — are two roles with different meanings visually
 * distinguishable?
 *
 * ## Why a contrast check doesn't catch this
 *
 * `token-contrast.test.ts` measures each role color **against its own background**. So a
 * state where *"save (primary) and delete (danger) are the same color"* **passes on both
 * sides** — both clear 4.5:1 against white. Contrast asks *is it readable*, not
 * *is it distinguishable*.
 *
 * ⇒ So this file measures **distance between roles** — CIELAB ΔE (CIE76), step by matching step.
 *
 * ## ⚠ This check's real failure mode is «firing on a legitimate design»
 *
 * `primary` and `info` **intentionally share a default** — the sheet documents this itself
 * (see the `같` match below, which reads that Korean-language sheet comment literally — the
 * production sheet is out of this migration's scope). A consumer overriding
 * `--u-primary-color` with a brand color is what makes the two diverge. That's the design.
 * ⇒ **The exemption list is hand-written.** The target set (what gets checked) is derived
 * from the sheet, but an exemption is a judgment about *"what counts as a violation"* = a
 * **rule**, and hand-writing that is correct.
 *
 * ## The reasoning behind the 20 threshold (measured)
 *
 * Excluding the exempt pair, the current sheet's **minimum distance is 38.7** (light
 * `-strong`'s warning/danger). 20 is well under half of that, and a ΔE of 20 reads as a
 * different color to anyone when placed side by side.
 * ⇒ With that much headroom, this **doesn't fire on ordinary ramp tuning** and only fires
 * when two roles actually collide. A collision is **silent** — no other test fails.
 */

const root = resolve(__dirname, '..', '..');
const ROLES = ['primary', 'info', 'success', 'warning', 'danger'] as const;
const STEPS = ['-color', '-color-strong', '-color-weak', '-color-weaker'] as const;
const THEMES = ['light', 'dark'] as const;

/** A pair «designed» to share meaning. The sheet's own comment must document the reasoning. */
const EXEMPT = new Set(['info|primary']);

const pairKey = (a: string, b: string) => [a, b].sort().join('|');

const MIN_DELTA_E = 20;

function loadTokens(theme: string): (name: string) => string | undefined {
  const css = readFileSync(join(root, 'src/assets/styles', `${theme}.css`), 'utf-8');
  const raw = new Map<string, string>();
  for (const m of css.matchAll(/^\s*(--[\w-]+)\s*:\s*([^;]+);/gm)) raw.set(m[1], m[2].trim());
  return (name: string) => {
    let v = raw.get(name);
    for (let i = 0; i < 10 && v?.startsWith('var('); i++) v = raw.get(v.slice(4, -1).trim());
    return v?.startsWith('#') ? v : undefined;
  };
}

/** sRGB hex → CIELAB (D65). Measuring ΔE requires a perceptually uniform space — raw RGB distance is meaningless. */
function lab(hex: string): [number, number, number] {
  const n = hex.replace('#', '');
  const srgb = [0, 2, 4].map(i => parseInt(n.slice(i, i + 2), 16) / 255);
  const [r, g, b] = srgb.map(c => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  const xyz: [number, number, number] = [
    (r * 0.4124 + g * 0.3576 + b * 0.1805) / 0.95047,
    r * 0.2126 + g * 0.7152 + b * 0.0722,
    (r * 0.0193 + g * 0.1192 + b * 0.9505) / 1.08883,
  ];
  const [X, Y, Z] = xyz.map(v => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116));
  return [116 * Y - 16, 500 * (X - Y), 200 * (Y - Z)];
}

const deltaE = (a: string, b: string): number => {
  const [A, B] = [lab(a), lab(b)];
  return Math.hypot(A[0] - B[0], A[1] - B[1], A[2] - B[2]);
};

describe('role-color meaning collision', () => {
  for (const theme of THEMES) {
    it(`🔴${theme} — roles with different meanings stay ΔE ≥ ${MIN_DELTA_E}`, () => {
      const t = loadTokens(theme);
      const collisions: string[] = [];

      for (const step of STEPS)
        for (let i = 0; i < ROLES.length; i++)
          for (let j = i + 1; j < ROLES.length; j++) {
            if (EXEMPT.has(pairKey(ROLES[i], ROLES[j]))) continue;
            const [a, b] = [t(`--u-${ROLES[i]}${step}`), t(`--u-${ROLES[j]}${step}`)];
            if (!a || !b) continue; // that family has no such step — a contrast layer skipping a step is normal
            const d = deltaE(a, b);
            if (d < MIN_DELTA_E)
              collisions.push(`${ROLES[i]}/${ROLES[j]}${step}: ΔE ${d.toFixed(1)} (${a} vs ${b})`);
          }

      expect(
        collisions,
        'two roles with different meanings read as the same color — a contrast check cannot catch this (both pass against their own background)',
      ).toEqual([]);
    });
  }

  it('⚠an exempt pair has its reasoning documented in the sheet (so exemptions don\'t silently pile up)', () => {
    // an exemption is a «rule», so it's hand-written. This instead checks that its
    // reasoning is actually recorded in the sheet — undocumented exemptions piling up
    // would leave this check guarding nothing.
    const css = readFileSync(join(root, 'src/assets/styles/light.css'), 'utf-8');
    const undocumented = [...EXEMPT].filter(k => {
      const [a, b] = k.split('|');
      // the sheet's comment is Korean-language (out of this migration's scope, see the
      // file header) and reads "…primary와 기본값은 같으나…" — '같' means "same/identical",
      // so this pattern matches that literal word in the still-Korean sheet source.
      return !(
        new RegExp(`/\\*[^*]*${a}[\\s\\S]{0,200}?${b}[\\s\\S]{0,80}?같`).test(css) ||
        new RegExp(`/\\*[^*]*${b}[\\s\\S]{0,200}?${a}[\\s\\S]{0,80}?같`).test(css)
      );
    });
    expect(undocumented, 'no sheet comment documents the reasoning for this exempt pair').toEqual([]);
  });

  it('⚠the check is not vacuous — pairs were actually compared', () => {
    // if a token name changes, t() would return undefined for everything and the assertion above would «pass».
    const t = loadTokens('light');
    const resolved = ROLES.filter(r => t(`--u-${r}-color`));
    expect(resolved.length, 'not a single role color resolved — did a token name change?').toBe(ROLES.length);
  });
});
