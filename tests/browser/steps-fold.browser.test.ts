import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/steps/USteps.js';
import type { USteps, StepItem } from '../../src/components/steps/USteps.js';

/**
 * `u-steps` (default `line`) folds to one step per row when the steps do not fit its width — before, the steps past
 * the edge were cut off (seven steps in a 22rem preview panel lost the last two). It unfolds when the width returns.
 * NEGATIVE: a wide track stays horizontal; `compact` and `bars` keep their own layouts.
 */
afterEach(() => { document.body.replaceChildren(); });

const ITEMS: StepItem[] = ['Intake', 'Proof', 'Confirm', 'Plate order', 'Ship', 'Invoice', 'Payment'].map((label) => ({ label }));

const frame = () => new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));

async function mount(width: string, appearance?: string): Promise<USteps> {
  const el = document.createElement('u-steps') as USteps;
  if (appearance) el.setAttribute('appearance', appearance);
  el.style.width = width;
  el.items = ITEMS;
  el.current = 4;
  document.body.appendChild(el);
  await el.updateComplete;
  await frame();
  return el;
}

const list = (el: USteps) => el.shadowRoot!.querySelector('.list') as HTMLElement;
const steps = (el: USteps) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('.step')];

describe('u-steps — folds when it does not fit', () => {
  it('a narrow track stacks its steps and every step stays inside the host', async () => {
    const el = await mount('240px');
    expect(getComputedStyle(list(el)).flexDirection).toBe('column');
    const host = el.getBoundingClientRect();
    for (const s of steps(el)) expect(s.getBoundingClientRect().right).toBeLessThanOrEqual(host.right + 0.5);
    // one step per row, in order
    const tops = steps(el).map((s) => s.getBoundingClientRect().top);
    expect(tops).toEqual([...tops].sort((a, b) => a - b));
    expect(new Set(tops.map(Math.round)).size).toBe(ITEMS.length);
  });

  it('unfolds when the width returns, and folds again when it narrows', async () => {
    const el = await mount('240px');
    el.style.width = '1400px';
    await frame();
    expect(getComputedStyle(list(el)).flexDirection).toBe('row');
    el.style.width = '240px';
    await frame();
    expect(getComputedStyle(list(el)).flexDirection).toBe('column');
  });

  it('NEGATIVE a wide track stays on one row', async () => {
    const el = await mount('1400px');
    expect(getComputedStyle(list(el)).flexDirection).toBe('row');
    expect(new Set(steps(el).map((s) => Math.round(s.getBoundingClientRect().top))).size).toBe(1);
  });

  it('NEGATIVE compact and bars keep their own layout in a narrow box', async () => {
    const compact = await mount('160px', 'compact');
    expect(list(compact).classList.contains('folded')).toBe(false);
    document.body.replaceChildren();
    const bars = await mount('240px', 'bars');
    expect(list(bars).classList.contains('folded')).toBe(false);
  });
});
