import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tag/UTag.js';

/**
 * `u-tag`'s `variant × color` combination is a **decoration axis** — `color="purple"` has no
 * role meaning, so absorbing it into a role token would break the public API
 * (`role-token-layer.test.ts` guards against that).
 *
 * This test checks the **actual rendered color** of all 36 combinations against the palette
 * step. The goal is to prove a matrix-folding refactor didn't change what's visible, so
 * expected values aren't hard-coded — they're **compared against palette tokens**: they
 * track the palette if it changes, but a mapping change still gets caught.
 *
 * ⚠`yellow` is one step darker in 2 places (solid 600, outlined text 700). Its lightness is
 * high enough that it loses contrast on a white background, and it's an exception that must
 * be preserved when folding.
 */

const COLORS = ['blue', 'green', 'yellow', 'red', 'orange', 'teal', 'cyan', 'purple', 'pink'] as const;

/** [variant][prop] = shade — the yellow exception is overridden below via YELLOW */
const MATRIX: Record<string, Record<string, number>> = {
  solid: { '--tag-bg-color': 500, '--tag-border-color': 500 },
  surface: { '--tag-color': 800, '--tag-bg-color': 100, '--tag-border-color': 300 },
  filled: { '--tag-color': 800, '--tag-bg-color': 100 },
  outlined: { '--tag-color': 600, '--tag-border-color': 300 },
};
const YELLOW: Record<string, Record<string, number>> = {
  solid: { '--tag-bg-color': 600, '--tag-border-color': 600 },
  outlined: { '--tag-color': 700 },
};

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(variant: string, color: string) {
  const el = document.createElement('u-tag') as HTMLElement & { updateComplete: Promise<unknown> };
  el.setAttribute('variant', variant);
  el.setAttribute('color', color);
  el.textContent = 'Tag';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('u-tag decoration matrix (variant × color)', () => {
  beforeAll(() => {
    expect(token('--u-blue-500'), 'this test assumes the token sheet is loaded').not.toBe('');
  });
  afterEach(() => document.body.replaceChildren());

  for (const variant of Object.keys(MATRIX)) {
    it(`variant="${variant}" — all 9 colors use their own palette step`, async () => {
      const wrong: string[] = [];
      for (const color of COLORS) {
        const el = await mount(variant, color);
        const cs = getComputedStyle(el);
        for (const [prop, defaultShade] of Object.entries(MATRIX[variant])) {
          const shade = (color === 'yellow' && YELLOW[variant]?.[prop]) || defaultShade;
          const actual = cs.getPropertyValue(prop).trim();
          const expected = token(`--u-${color}-${shade}`);
          if (actual !== expected) {
            wrong.push(`${variant}/${color} ${prop}: ${actual} ≠ --u-${color}-${shade}(${expected})`);
          }
        }
      }
      expect(wrong).toEqual([]);
    });
  }

  it('color="neutral" rides the brand path (--tag-fill-color), not the matrix', async () => {
    // negative control — folding the matrix by grouping on `[color]` would sweep neutral in
    // too and kill the brand-override path. `color` is reflected, so it's always present.
    const el = await mount('solid', 'neutral');
    expect(getComputedStyle(el).getPropertyValue('--tag-bg-color').trim())
      .toBe(token('--u-primary-color'));

    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(
      getComputedStyle(el).getPropertyValue('--tag-bg-color').trim(),
      'a neutral tag does not follow the brand color',
    ).toBe('rgb(255, 0, 128)');
    document.documentElement.style.removeProperty('--u-primary-color');
  });

  it('a color-specified tag is immune to the brand override', async () => {
    const el = await mount('solid', 'green');
    const before = getComputedStyle(el).getPropertyValue('--tag-bg-color').trim();
    expect(before).toBe(token('--u-green-500'));
    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(getComputedStyle(el).getPropertyValue('--tag-bg-color').trim(), 'the decoration axis got contaminated')
      .toBe(before);
    document.documentElement.style.removeProperty('--u-primary-color');
  });
});
