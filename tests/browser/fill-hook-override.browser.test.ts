import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/tag/UTag.js';
import '../../src/components/checkbox/UCheckbox.js';

/**
 * There were two ways to fold the matrix, and they have an **observable difference**.
 *
 *  - `u-tag`      — the color rule fills a **separate slot** (`--tag-hue-solid`), and the
 *                   variant reads `var(--tag-hue-solid, var(--tag-fill-color))`.
 *                   With the slot filled, the fallback never fires, so **`color=` has final say**.
 *  - `u-checkbox` — same approach (`--checkbox-hue`).
 *
 * ⚠**It wasn't like this at first.** When `u-checkbox` was folded, the color rule was made
 * to override the fill-color hook itself — but that hook is a public `@cssprop`, and
 * **author styles beat `:host()` for a host element** (the asymmetry this whole phase rests
 * on), so consumer CSS ended up beating `color=`. **Before** the refactor, the color rule
 * set the consumed property directly rather than the hook, so this didn't happen — meaning
 * it was a semantic regression. It was reverted to the slot approach, aligning both the
 * original behavior and `u-tag`. This test guards against that regression.
 */
describe('fill-color hook override vs color= (the difference between the two folding approaches)', () => {
  let sheet: HTMLStyleElement;

  beforeEach(() => {
    document.body.replaceChildren();
    sheet = document.createElement('style');
    document.head.appendChild(sheet);
  });
  afterEach(() => sheet.remove());

  const token = (n: string) =>
    getComputedStyle(document.documentElement).getPropertyValue(n).trim();

  async function mount(tag: string, attrs: Record<string, string>) {
    const el = document.createElement(tag) as HTMLElement & { updateComplete: Promise<unknown> };
    for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
    document.body.appendChild(el);
    await el.updateComplete;
    return el;
  }

  it('u-tag: color= wins even when a consumer overrides --tag-fill-color (slot approach)', async () => {
    sheet.textContent = 'u-tag { --tag-fill-color: rgb(255, 0, 128); }';
    const el = await mount('u-tag', { color: 'green', variant: 'solid' });
    expect(
      getComputedStyle(el).getPropertyValue('--tag-bg-color').trim(),
      'color="green" must hold — the slot is filled, so the fallback never fires',
    ).toBe(token('--u-green-500'));
  });

  it('u-checkbox: color= wins even when a consumer overrides --checkbox-fill-color (same as u-tag)', async () => {
    sheet.textContent = 'u-checkbox { --checkbox-fill-color: rgb(255, 0, 128); }';
    const el = await mount('u-checkbox', { color: 'green', variant: 'filled', checked: '' });
    expect(
      getComputedStyle(el).getPropertyValue('--checkbox-border-color').trim(),
      'color="green" must hold — the slot is filled, so the fallback never fires',
    ).toBe(token('--u-green-600'));
  });

  it('with no color specified (default blue), the fill-color hook takes effect', async () => {
    // checks the opposite direction of the slot approach — an empty slot must let the fallback fire.
    sheet.textContent =
      'u-tag { --tag-fill-color: rgb(255, 0, 128); } u-checkbox { --checkbox-fill-color: rgb(255, 0, 128); }';
    const tag = await mount('u-tag', { variant: 'solid' });            // no color = neutral
    const cb = await mount('u-checkbox', { variant: 'filled', checked: '' }); // default color = blue
    expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim()).toBe('rgb(255, 0, 128)');
    expect(getComputedStyle(cb).getPropertyValue('--checkbox-border-color').trim()).toBe('rgb(255, 0, 128)');
  });

  it('without overriding the hook, both follow color=', async () => {
    const tag = await mount('u-tag', { color: 'green', variant: 'solid' });
    const cb = await mount('u-checkbox', { color: 'green', variant: 'filled', checked: '' });
    expect(getComputedStyle(tag).getPropertyValue('--tag-bg-color').trim())
      .toBe(token('--u-green-500'));
    expect(getComputedStyle(cb).getPropertyValue('--checkbox-border-color').trim())
      .toBe(token('--u-green-600'));
  });
});
