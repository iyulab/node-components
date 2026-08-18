import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/button/UButton.js';

/**
 * **The variant × color grid** — does the color axis reach *every* variant.
 *
 * ## Why this file exists
 *
 * `variant="ghost"` was **ignoring `color`**. `solid`, `outlined`, and `link` all followed
 * it, but `ghost` alone had `color: var(--u-txt-color)` pinned, so any color given produced
 * the same neutral color. It only surfaced once a consumer **rendered all 12 combinations
 * (3 variants × 4 colors) side by side in a grid to compare** — 9 matched and 3 were off.
 *
 * ★**When the axis breaks at just one spot, checking each variant individually won't show
 * it.** Looking at `ghost` alone reads as *"ghost is just understated by nature"*, and
 * `solid` alone looks like the axis is fine. Only laying them out in a grid and
 * **comparing across rows** turns the gap into something visible.
 *
 * ⇒ So this test doesn't assert specific values — it asserts a **relationship**:
 *   ⑴ changing `color` on every variant **changes something** (the axis reaches it)
 *   ⑵ the default render with no color given is **untouched** (a purely additive change)
 *
 * ## Why the browser project
 * jsdom doesn't reflect Lit's constructed stylesheets in computed values — querying `color`
 * returns the inherited default, so this grid would **look entirely uniform** (= a test that
 * always passes).
 */

/**
 * ⚠**Where the axis «shows up» differs per variant.** Measured (Chromium):
 *
 * ```
 * solid    host background-color   neutral rgb(25,118,210) → danger rgb(211,47,47)
 * outlined inner border-color      follows the color axis. text staying fixed neutral is «correct»
 * ghost    text color              ← the spot this file exists for
 * link     text color              was already following it
 * ```
 *
 * Trying to measure all of them through one property nearly misjudged `solid`'s text color
 * (always white) and `outlined`'s text color (always neutral) as *"the axis doesn't reach
 * here"* — a failure of **firing on a legitimate design**.
 */
const VARIANTS = [
  { name: 'solid', where: 'host-bg' },
  { name: 'outlined', where: 'inner-border' },
  { name: 'ghost', where: 'color' },
  { name: 'link', where: 'color' },
] as const;

const COLORS = ['primary', 'warning', 'danger'] as const;

async function mount(attrs: Record<string, string>) {
  const el = document.createElement('u-button') as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = 'Button';
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

/** The computed value at the spot where this variant actually paints color. */
function paintedColor(el: HTMLElement, where: string): string {
  if (where === 'host-bg') return getComputedStyle(el).backgroundColor;
  if (where === 'inner-border')
    return getComputedStyle(el.shadowRoot!.firstElementChild as Element).borderColor;
  return getComputedStyle(el).color;
}

describe('u-button variant × color grid', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
  });
  afterEach(() => {
    document.body.innerHTML = '';
  });

  for (const { name: variant, where } of VARIANTS) {
    it(`★${variant} follows the color axis — each role produces a distinct color (${where})`, async () => {
      const seen = new Map<string, string>();
      for (const color of COLORS) {
        const el = await mount({ variant, color });
        seen.set(color, paintedColor(el, where));
      }

      // if all three are the same, the axis does not reach this variant — exactly what happened with ghost.
      const distinct = new Set(seen.values());
      expect(
        distinct.size,
        `${variant} produces the same color for ${COLORS.join('/')}: ${[...seen].map(([k, v]) => `${k}=${v}`).join(' ')}`,
      ).toBe(COLORS.length);
    });
  }

  it('⚠a render with no color given is untouched (purely additive)', async () => {
    // if wiring in the color axis changed the default appearance, that would be a visual change, not additive.
    const bare = paintedColor(await mount({ variant: 'ghost' }), 'color');
    const neutral = paintedColor(await mount({ variant: 'ghost', color: 'neutral' }), 'color');
    expect(bare).toBe(neutral);

    // and that value must be the body text color, not a role color.
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue('--u-txt-color').trim();
    document.body.appendChild(probe);
    expect(bare).toBe(getComputedStyle(probe).color);
  });

  it('ghost\'s color is the «text-on-background» step, not the «surface» step', async () => {
    // using the surface step (-color) would give shallow contrast on a white background. that's why the role layer splits the steps.
    const el = await mount({ variant: 'ghost', color: 'danger' });
    const probe = document.createElement('div');
    probe.style.color = getComputedStyle(document.documentElement)
      .getPropertyValue('--u-danger-color-strong').trim();
    document.body.appendChild(probe);
    expect(paintedColor(el, 'color')).toBe(getComputedStyle(probe).color);
  });
});
