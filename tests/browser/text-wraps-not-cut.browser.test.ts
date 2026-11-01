import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * **A label that does not fit wraps instead of ending in «…»** — `u-button`, `u-tag`, `u-option`, `u-menu-item`,
 * `u-tree-item`, `u-steps` (compact summary).
 *
 * Defect: each label was one line with `text-overflow: ellipsis` and no tooltip or title, so in a narrow place — a long
 * translated label, 200% text, user text-spacing (WCAG 1.4.12) — its tail was cut and could not be read anywhere.
 * Now a label that fits is unchanged (one line), and one that does not fit wraps. `u-button` and `u-tag` break only
 * between words, like a native `<button>`; list items also break inside a word that is wider than the list.
 */
afterEach(() => document.body.replaceChildren());

const LONG = 'Export the quarterly reconciliation report';

async function mount(html: string, width = 140): Promise<HTMLElement> {
  const wrap = document.createElement('div');
  wrap.style.cssText = `width: ${width}px;`;
  wrap.innerHTML = html;
  document.body.appendChild(wrap);
  const el = wrap.firstElementChild as HTMLElement & { updateComplete?: Promise<boolean> };
  await el.updateComplete;
  for (const child of el.querySelectorAll('*')) await (child as { updateComplete?: Promise<boolean> }).updateComplete;
  return el;
}

function content(el: HTMLElement, selector = '[part="content"]'): HTMLElement {
  const found = el.shadowRoot!.querySelector<HTMLElement>(selector);
  if (!found) throw new Error(`no ${selector}`);
  return found;
}

function expectWrappedInFull(box: HTMLElement) {
  const cs = getComputedStyle(box);
  expect(cs.textOverflow).not.toBe('ellipsis');
  expect(box.scrollWidth).toBeLessThanOrEqual(box.clientWidth + 1);
  expect(box.getBoundingClientRect().height).toBeGreaterThan(parseFloat(cs.lineHeight) * 1.5);
}

function expectOneLine(box: HTMLElement) {
  const cs = getComputedStyle(box);
  expect(box.getBoundingClientRect().height).toBeLessThan(parseFloat(cs.lineHeight) * 1.5);
}

describe('labels wrap instead of being cut', () => {
  it('u-button', async () => {
    expectWrappedInFull(content(await mount(`<u-button block>${LONG}</u-button>`)));
    expectOneLine(content(await mount('<u-button>Save</u-button>')));
  });

  it('u-tag', async () => {
    const tag = await mount(`<u-tag style="max-width: 100%">${LONG}</u-tag>`);
    expectWrappedInFull(content(tag));
    expectOneLine(content(await mount('<u-tag>New</u-tag>')));
  });

  it('u-option', async () => {
    expectWrappedInFull(content(await mount(`<u-option value="a">${LONG}</u-option>`)));
    expectOneLine(content(await mount('<u-option value="b">Short</u-option>')));
  });

  it('u-menu-item', async () => {
    expectWrappedInFull(content(await mount(`<u-menu-item>${LONG}</u-menu-item>`)));
  });

  it('u-tree-item', async () => {
    expectWrappedInFull(content(await mount(`<u-tree-item>${LONG}</u-tree-item>`)));
  });

  it('u-steps compact summary', async () => {
    const wrap = document.createElement('div');
    wrap.style.cssText = 'width: 160px;';
    const steps = document.createElement('u-steps') as HTMLElement & { items: unknown[]; current: number; updateComplete: Promise<boolean> };
    steps.setAttribute('appearance', 'compact');
    steps.items = [{ label: 'Draft' }, { label: LONG }, { label: 'Done' }];
    steps.current = 1;
    wrap.appendChild(steps);
    document.body.appendChild(wrap);
    await steps.updateComplete;
    const summary = content(steps, '.summary');
    expect(getComputedStyle(summary).textOverflow).not.toBe('ellipsis');
    expect(summary.scrollWidth).toBeLessThanOrEqual(summary.clientWidth + 1);
  });
});
