// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { readFileSync, globSync } from 'fs';
import { resolve, join } from 'path';

const root = resolve(__dirname, '..', '..');
const sheet = (t: 'light' | 'dark') =>
  readFileSync(join(root, 'src/assets/styles', `${t}.css`), 'utf-8');

const decl = (css: string, name: string) => {
  const m = css.match(new RegExp(`^\\s*${name}\\s*:\\s*([^;]+);`, 'm'));
  return m ? m[1].trim() : null;
};
const alphaOf = (v: string) => {
  const m = v.match(/rgba\(\s*0\s*,\s*0\s*,\s*0\s*,\s*([\d.]+)\s*\)/);
  return m ? Number(m[1]) : null;
};

const STEPS = ['sm', 'md', 'lg', 'xl'] as const;
/** Elevation step ↔ color-axis step pairing. The sheet's own comment declares this pairing. */
const PAIRED = {
  sm: 'weak',
  md: 'normal',
  lg: 'strong',
  xl: 'stronger',
} as const;

/**
 * The contract for the **elevation axis**.
 *
 * A color axis (`--u-shadow-color-*`) existed, but with no elevation axis, components wrote
 * shadows as literals, and **11 different values** appeared at spots that meant the same
 * rhythm. Worse, those literals **didn't know about theme** — `rgba(0,0,0,.1)` is nearly
 * invisible on a dark background.
 */
describe('elevation axis', () => {
  it('both sheets declare all 4 steps', () => {
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      for (const s of STEPS)
        expect(decl(css, `--u-shadow-${s}`), `${t}.css is missing --u-shadow-${s}`).toBeTruthy();
    }
  });

  it('★alpha does not drift from the color axis (paying back the cost of inlining, here)', () => {
    // The fallback generator treats composite values as literals, so alpha can't be nested
    // (see the sheet's own comment). As a result the same number lives in two places, and
    // this assertion ties the two together.
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      for (const s of STEPS) {
        const from = alphaOf(decl(css, `--u-shadow-${s}`)!);
        const to = alphaOf(decl(css, `--u-shadow-color-${PAIRED[s]}`)!);
        expect(from, `${t}: --u-shadow-${s}'s alpha differs from --u-shadow-color-${PAIRED[s]}`)
          .toBe(to);
      }
    }
  });

  it('★gets darker and larger as the step goes up (both themes)', () => {
    for (const t of ['light', 'dark'] as const) {
      const css = sheet(t);
      const rows = STEPS.map(s => {
        const v = decl(css, `--u-shadow-${s}`)!;
        const [, y, blur] = v.match(/^0\s+(\d+)px\s+(\d+)px/)!.map(Number);
        return { s, y, blur, a: alphaOf(v)! };
      });
      for (let i = 1; i < rows.length; i++) {
        expect(rows[i].y, `${t}: ${rows[i].s}'s y is not greater than ${rows[i - 1].s}`)
          .toBeGreaterThan(rows[i - 1].y);
        expect(rows[i].blur, `${t}: ${rows[i].s}'s blur is not greater than ${rows[i - 1].s}`)
          .toBeGreaterThan(rows[i - 1].blur);
        expect(rows[i].a, `${t}: ${rows[i].s}'s alpha is less than ${rows[i - 1].s}`)
          .toBeGreaterThanOrEqual(rows[i - 1].a);
      }
    }
  });

  it('★dark shadows are darker than light (they were identical in the literal era)', () => {
    const [l, d] = [sheet('light'), sheet('dark')];
    for (const s of STEPS)
      expect(alphaOf(decl(d, `--u-shadow-${s}`)!)!, `dark --u-shadow-${s}`)
        .toBeGreaterThan(alphaOf(decl(l, `--u-shadow-${s}`)!)!);
  });

  it('★no component writes an elevation shadow as a literal', () => {
    // There is exactly one exception, and the reasoning is recorded at that spot: u-alert's
    // glass variant is a glass-texture recipe (30px blur + backdrop-filter), not "elevation".
    const GLASS = 'src/components/alert/UAlert.styles.ts';
    const offenders: string[] = [];
    for (const rel of globSync('src/**/*.styles.ts', { cwd: root })) {
      const norm = rel.replace(/\\/g, '/');
      const src = readFileSync(join(root, rel), 'utf-8');
      for (const m of src.matchAll(/box-shadow:\s*([^;]+);/g)) {
        const v = m[1].replace(/\s+/g, ' ').trim();
        // `0 0 0 …` is a ring (focus/border), not elevation.
        if (/^0 0 0\b/.test(v) || v === 'none' || v.startsWith('var(--u-shadow-')) continue;
        if (norm === GLASS && v.includes('30px')) continue;
        offenders.push(`${norm}: ${v}`);
      }
    }
    expect(offenders, 'shadows not going through the elevation axis').toEqual([]);
  });
});
