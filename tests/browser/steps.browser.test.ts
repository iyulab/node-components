import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/steps/USteps.js';
import type { USteps, StepItem } from '../../src/components/steps/USteps.js';

/** `u-steps` — a display-only progress line. Status shows by marker shape and reaches assistive tech. */
const made: HTMLElement[] = [];
async function steps(items: StepItem[], props: Partial<USteps> = {}): Promise<USteps> {
  const el = document.createElement('u-steps') as USteps;
  el.items = items;
  Object.assign(el, props);
  document.body.appendChild(el);
  made.push(el);
  await el.updateComplete;
  return el;
}
afterEach(() => { while (made.length) made.pop()!.remove(); });

const ITEMS: StepItem[] = [{ label: 'Received', description: '10.02' }, { label: 'Proof' }, { label: 'Print' }, { label: 'Ship' }];
const stepEls = (el: USteps) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('li.step')];

describe('u-steps', () => {
  it('infers statuses from `current`: before = complete, at = current, after = upcoming', async () => {
    const el = await steps(ITEMS, { current: 1 });
    expect(stepEls(el).map(s => s.dataset.status)).toEqual(['complete', 'current', 'upcoming', 'upcoming']);
  });

  it('an item status overrides the inference — a blocked step is `hold`', async () => {
    const el = await steps([{ label: 'A' }, { label: 'B', status: 'hold' }, { label: 'C' }], { current: 1 });
    expect(stepEls(el).map(s => s.dataset.status)).toEqual(['complete', 'hold', 'upcoming']);
  });

  it('marks the current step with aria-current="step" and only that one', async () => {
    const el = await steps(ITEMS, { current: 2 });
    const current = stepEls(el).filter(s => s.getAttribute('aria-current') === 'step');
    expect(current.length).toBe(1);
    expect(current[0].textContent).toContain('Print');
  });

  it('complete and hold steps carry a status word for assistive tech; markers are decorative', async () => {
    const el = await steps([{ label: 'A' }, { label: 'B', status: 'hold' }], { current: 1 });
    const [a, b] = stepEls(el);
    expect(a.querySelector('.sr-only')?.textContent?.trim()).toBeTruthy();
    expect(b.querySelector('.sr-only')?.textContent?.trim()).toBeTruthy();
    expect(a.querySelector('.marker')!.getAttribute('aria-hidden')).toBe('true');
  });

  it('draws one connector between steps; travelled connectors are marked', async () => {
    const el = await steps(ITEMS, { current: 2 });
    const connectors = [...el.shadowRoot!.querySelectorAll('.connector')];
    expect(connectors.length).toBe(ITEMS.length - 1);
    expect(connectors.map(c => c.classList.contains('travelled'))).toEqual([true, true, false]);
  });

  it('status is not colour alone: complete has a check, current a heavier ring than upcoming', async () => {
    const el = await steps(ITEMS, { current: 1 });
    const [done, now, next] = stepEls(el).map(s => s.querySelector<HTMLElement>('.marker')!);
    expect(done.querySelector('svg')).not.toBeNull();
    expect(parseFloat(getComputedStyle(now).borderTopWidth)).toBeGreaterThan(parseFloat(getComputedStyle(next).borderTopWidth));
  });

  it('the track label names the list', async () => {
    const el = await steps(ITEMS, { label: 'Production', current: 0 });
    expect(el.shadowRoot!.querySelector('ol')!.getAttribute('aria-label')).toBe('Production');
  });
});
