import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/tag/UTag.js';
import type { UTag } from '../../src/components/tag/UTag.js';

/**
 * `size="sm"` — a small mark that sits inside a line of text (an attribute next to an id in a table cell):
 * the overline text size, its leading, no block padding — about 18px with the border.
 */
const made: HTMLElement[] = [];
async function tag(attrs: Record<string, string>, style = ''): Promise<UTag> {
  const el = document.createElement('u-tag') as UTag;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (style) el.setAttribute('style', style);
  el.textContent = 'Rush';
  document.body.appendChild(el);
  made.push(el);
  await el.updateComplete;
  return el;
}
afterEach(() => { while (made.length) made.pop()!.remove(); });

const height = (el: HTMLElement) => el.getBoundingClientRect().height;

describe('u-tag size', () => {
  it('🔴sm is about 18px tall with the overline text size and no block padding', async () => {
    const el = await tag({ size: 'sm', appearance: 'outlined' });
    expect(Math.abs(height(el) - 18)).toBeLessThan(0.6);
    expect(getComputedStyle(el).fontSize).toBe('11px');
    const base = el.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
    expect(getComputedStyle(base).paddingTop).toBe('0px');
  });

  it('🔴sm follows the overline token, so a denser host grows it', async () => {
    const el = await tag({ size: 'sm' }, '--u-text-overline-size: 14px');
    expect(getComputedStyle(el).fontSize).toBe('14px');
    expect(height(el)).toBeGreaterThan(21);
  });

  it('sm keeps the text tracking at zero — the overline tracking is for Latin labels', async () => {
    const el = await tag({ size: 'sm' }, '--u-text-overline-tracking: 0.06em');
    expect(getComputedStyle(el).letterSpacing).toBe('normal');
  });

  it('NEGATIVE the default size is unchanged — caption text, 26px with its padding', async () => {
    const el = await tag({});
    expect(el.size).toBe('md');
    expect(getComputedStyle(el).fontSize).toBe('12px');
    expect(Math.abs(height(el) - 26)).toBeLessThan(0.6);
  });
});
