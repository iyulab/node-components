import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * At its natural width an empty `u-date-range-picker` shows its whole placeholder — two dates and the separator — and a
 * filled one shows both dates. The text box used the input's default width (about twenty characters), shorter than the
 * range placeholder, so the end was cut off («YYYY-MM-DD – YYYY-MM-DI»). NEGATIVE: a width given to the host still wins.
 */
afterEach(() => { document.body.replaceChildren(); Locale.set('en'); });

async function mount(attrs = ''): Promise<UDateRangePicker> {
  document.body.innerHTML = `<u-date-range-picker label="Created" ${attrs}></u-date-range-picker>`;
  const el = document.querySelector('u-date-range-picker') as UDateRangePicker;
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(() => setTimeout(r, 30)));
  return el;
}

const input = (el: UDateRangePicker) => el.shadowRoot!.querySelector('input') as HTMLInputElement;

/** Does the text box hold `text` without clipping — measured with the input's own font. */
function fits(box: HTMLInputElement, text: string): boolean {
  const ctx = document.createElement('canvas').getContext('2d')!;
  const cs = getComputedStyle(box);
  ctx.font = `${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
  return ctx.measureText(text).width <= box.clientWidth + 0.5;
}

describe('u-date-range-picker — the text box fits its text', () => {
  for (const locale of ['en', 'ko'] as const) {
    it(`an empty picker shows its whole placeholder (${locale})`, async () => {
      Locale.set(locale);
      const el = await mount();
      const box = input(el);
      expect(box.placeholder.length).toBeGreaterThan(0);
      expect(fits(box, box.placeholder), `"${box.placeholder}" in ${box.clientWidth}px`).toBe(true);
    });
  }

  it('a filled picker shows both dates', async () => {
    const el = await mount();
    el.value = '2026-10-01/2026-10-31';
    await el.updateComplete;
    await new Promise((r) => setTimeout(r, 30));
    const box = input(el);
    expect(box.value.length).toBeGreaterThan(0);
    expect(fits(box, box.value), `"${box.value}" in ${box.clientWidth}px`).toBe(true);
  });

  it('NEGATIVE a width set on the host still decides', async () => {
    const el = await mount('style="--u-date-range-picker-width: 180px"');
    expect(Math.round(el.getBoundingClientRect().width)).toBe(180);
  });
});
