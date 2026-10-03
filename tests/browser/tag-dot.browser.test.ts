import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/tag/UTag.js';
import type { UTag } from '../../src/components/tag/UTag.js';

/** `dot` — a small leading mark in the text colour, for status labels repeated down a column. */
const made: HTMLElement[] = [];
async function tag(attrs: Record<string, string | boolean>): Promise<UTag> {
  const el = document.createElement('u-tag') as UTag;
  for (const [k, v] of Object.entries(attrs)) {
    if (v === true) el.setAttribute(k, '');
    else if (v !== false) el.setAttribute(k, v);
  }
  el.textContent = 'Shipped';
  document.body.appendChild(el);
  made.push(el);
  await el.updateComplete;
  return el;
}
afterEach(() => { while (made.length) made.pop()!.remove(); });

describe('u-tag dot', () => {
  it('draws no dot by default', async () => {
    expect((await tag({})).shadowRoot!.querySelector('[part="dot"]')).toBeNull();
  });

  it('draws a round dot in the text colour', async () => {
    const el = await tag({ dot: true, color: 'success' });
    const dot = el.shadowRoot!.querySelector<HTMLElement>('[part="dot"]')!;
    expect(dot).not.toBeNull();
    expect(dot.getAttribute('aria-hidden')).toBe('true');
    const cs = getComputedStyle(dot);
    expect(cs.width).toBe('6px');
    expect(cs.borderRadius).toBe('50%');
    expect(cs.backgroundColor).toBe(getComputedStyle(el).color);
  });

  it('the status icon wins over the dot — never both', async () => {
    const el = await tag({ dot: true, icon: true, color: 'danger' });
    expect(el.shadowRoot!.querySelector('[part="icon"]')).not.toBeNull();
    expect(el.shadowRoot!.querySelector('[part="dot"]')).toBeNull();
  });

  it('--tag-dot-size resizes it', async () => {
    const el = await tag({ dot: true });
    el.style.setProperty('--tag-dot-size', '8px');
    expect(getComputedStyle(el.shadowRoot!.querySelector('[part="dot"]')!).width).toBe('8px');
  });
});
