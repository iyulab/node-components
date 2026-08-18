import { describe, it, expect } from 'vitest';
import '../../src/components/skeleton/USkeleton.js';
import '../../src/components/spinner/USpinner.js';

/**
 * Under `prefers-reduced-motion: reduce`, **what stops and what doesn't.**
 *
 * ## The fork isn't «stop or not»
 *
 * The sheet's reduce rule works by **pinning the duration axis to 0**, so it doesn't reach a
 * spot that sets `animation` directly — and that's by design (forcing `animation: none`
 * would also kill motion that **carries meaning**). So each spot has to be judged separately:
 *
 * - `USkeleton`'s `pulse`/`shimmer` → **decoration**. Its default is already
 *   `animation: none`, and a static block still communicates "loading" just fine ⇒ **stops.**
 * - `USpinner`'s rotation → **a signal**. Stopping it leaves no way to tell whether it's
 *   progressing ⇒ **stays** (WCAG 2.2.2 exempts motion that is essential, like a loading
 *   indicator).
 *
 * ## ⚠ A measurement limit — the media state can't be forced
 *
 * There's no way to toggle `prefers-reduced-motion` in the browser runner, so this **can't
 * be measured via computed style.** It instead **reads the CSSOM** — stronger than a string
 * match: if a selector has a typo or a rule fails to parse, the browser **drops it**, and
 * this assertion fires. And the «stays» side (the spinner) is measured too, to catch
 * *over-stopping* — that was the actual fork for this item.
 */

const reduceRules = (el: Element): CSSRule[] =>
  [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
    .flatMap(s => [...s.cssRules])
    .filter((r): r is CSSMediaRule =>
      r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'))
    .flatMap(m => [...m.cssRules]);

const mount = async (tag: string, attrs: Record<string, string> = {}) => {
  const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

describe('prefers-reduced-motion — separates decoration from signal', () => {
  it('🔴decoration stops — pulse/shimmer are animation: none inside the reduce block', async () => {
    const el = await mount('u-skeleton', { effect: 'pulse' });
    const stopped = reduceRules(el)
      .filter((r): r is CSSStyleRule => r instanceof CSSStyleRule)
      .filter(r => r.style.getPropertyValue('animation-name') === 'none'
        || /animation:\s*none/.test(r.cssText));
    const selectors = stopped.map(r => r.selectorText).join(' | ');
    expect(selectors, 'pulse is not among the stopped selectors').toContain('pulse');
    expect(selectors, 'shimmer is not among the stopped selectors').toContain('shimmer');
    el.remove();
  });

  it('🔴the signal stays — u-spinner has no reduce-stop rule', async () => {
    // ⚠This is the actual fork for this item. If a blanket "stop everything" policy
    // killed the spinner too, users would have no way to tell it's still progressing.
    const el = await mount('u-spinner');
    expect(reduceRules(el).map(r => r.cssText)).toEqual([]);
    el.remove();
  });

  it('decoration actually animates normally (adding the rule did not kill the default)', async () => {
    const el = await mount('u-skeleton', { effect: 'pulse' });
    expect(getComputedStyle(el).animationName).toBe('pulse');
    el.remove();
  });

  it('a skeleton with no effect stays static as before', async () => {
    const el = await mount('u-skeleton');
    expect(getComputedStyle(el).animationName).toBe('none');
    el.remove();
  });
});
