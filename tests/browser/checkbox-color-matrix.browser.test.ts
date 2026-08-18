import { describe, it, expect, afterEach, beforeAll } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * `u-checkbox`'s `variant × color × (checked|indeterminate)` combinations.
 *
 * Same method as `u-tag` — capture the actual rendered colors **before refactoring**, then
 * prove visual equivalence by checking the same test still passes after folding.
 *
 * ⚠`color` defaults to `"blue"` and it's reflected. And **blue rides the brand hook, not the
 * palette** (`--checkbox-fill-color` → `--u-primary-color`) — so blue isn't one value on the
 * decoration axis, it's notation for *"no color specified"*.
 */

const PALETTE_COLORS = ['green', 'red', 'orange', 'teal', 'cyan', 'purple', 'pink', 'neutral'] as const;
const STATES = ['checked', 'indeterminate'] as const;

const token = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(variant: string, color: string, state: string) {
  const el = document.createElement('u-checkbox') as HTMLElement & { updateComplete: Promise<unknown> };
  el.setAttribute('variant', variant);
  el.setAttribute('color', color);
  el.setAttribute(state, '');
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

describe('u-checkbox decoration matrix', () => {
  beforeAll(() => {
    expect(token('--u-green-600'), 'this test assumes the token sheet is loaded').not.toBe('');
  });
  afterEach(() => document.body.replaceChildren());

  it('variant="filled" color reaches the border and background', async () => {
    const wrong: string[] = [];
    for (const color of PALETTE_COLORS) {
      for (const state of STATES) {
        const cs = getComputedStyle(await mount('filled', color, state));
        const want = token(`--u-${color}-600`);
        for (const prop of ['--checkbox-border-color', '--checkbox-background-color']) {
          const got = cs.getPropertyValue(prop).trim();
          if (got !== want) wrong.push(`filled/${color}/${state} ${prop}: ${got} ≠ ${want}`);
        }
      }
    }
    expect(wrong).toEqual([]);
  });

  it('variant="outline" color reaches the text and border', async () => {
    const wrong: string[] = [];
    for (const color of PALETTE_COLORS) {
      for (const state of STATES) {
        const cs = getComputedStyle(await mount('outline', color, state));
        const want = token(`--u-${color}-600`);
        for (const prop of ['--checkbox-color', '--checkbox-border-color']) {
          const got = cs.getPropertyValue(prop).trim();
          if (got !== want) wrong.push(`outline/${color}/${state} ${prop}: ${got} ≠ ${want}`);
        }
        const bg = cs.getPropertyValue('--checkbox-background-color').trim();
        if (bg !== 'transparent') wrong.push(`outline/${color}/${state} background: ${bg} ≠ transparent`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('color="blue" (default) rides the brand hook, not the palette', async () => {
    // negative control — folding blue in with the other 8 colors would kill the brand path.
    for (const variant of ['filled', 'outline'] as const) {
      const el = await mount(variant, 'blue', 'checked');
      expect(
        getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(),
        `${variant}/blue must follow --u-primary-color`,
      ).toBe(token('--u-primary-color'));

      document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
      expect(
        getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(),
        `${variant}/blue does not follow the brand override`,
      ).toBe('rgb(255, 0, 128)');
      document.documentElement.style.removeProperty('--u-primary-color');
    }
  });

  it('a color-specified checkbox is immune to the brand override', async () => {
    const el = await mount('filled', 'purple', 'checked');
    const before = getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim();
    expect(before).toBe(token('--u-purple-600'));
    document.documentElement.style.setProperty('--u-primary-color', 'rgb(255, 0, 128)');
    expect(getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(), 'the decoration axis got contaminated')
      .toBe(before);
    document.documentElement.style.removeProperty('--u-primary-color');
  });
});
