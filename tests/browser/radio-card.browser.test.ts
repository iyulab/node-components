import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/index.js';
import type { UOption } from '../../src/components/option/UOption.js';

/**
 * `u-radio type="card"` — one candidate per bordered card, picked among several that each carry a description and a figure:
 * the radio mark first, the label with its description under it, and the suffix at the far end. The frame is drawn inside the
 * option's shadow tree, so a document-wide reset (`* { border: 0 solid; padding: 0 }`) does not remove it.
 */
const RESET = '*, ::before, ::after { margin: 0; padding: 0; border: 0 solid; box-sizing: border-box; }';

afterEach(() => {
  document.body.innerHTML = '';
  document.querySelectorAll('style[data-reset]').forEach((s) => s.remove());
});

const settle = async () => {
  const els = [...document.querySelectorAll('*')].filter((e) => e.tagName.includes('-')) as Array<HTMLElement & { updateComplete?: Promise<unknown> }>;
  await Promise.all(els.map((e) => e.updateComplete));
  await new Promise((r) => setTimeout(r, 300)); // colour transitions
};

/** The computed form of an inner ring of `width` pixels. */
const ring = (width: number) => new RegExp(`0px 0px 0px ${width}px inset$`);

const options = () => [...document.querySelectorAll<UOption>('u-option')];
const base = (o: Element) => o.shadowRoot!.querySelector<HTMLElement>('[part="base"]')!;
const part = (o: Element, name: string) => o.shadowRoot!.querySelector<HTMLElement>(`[part="${name}"]`)!;

async function mount(attrs = '', wrap = 'width:420px') {
  document.body.innerHTML =
    `<button id="before">before</button><div style="${wrap};font-size:16px">` +
    `<u-radio type="card" value="rail" aria-label="Transport" ${attrs}>` +
    '<u-option value="rail">Rail<span slot="description">Two hours, one change</span><span slot="suffix">$42</span></u-option>' +
    '<u-option value="air">Air<span slot="description">One hour</span><span slot="suffix">$118</span></u-option>' +
    '</u-radio></div>';
  await settle();
}

describe('u-radio type="card"', () => {
  it('🔴each option is a card: a visible border, apart by the group gap, as wide as the group', async () => {
    await mount();
    const [a, b] = options();
    const group = document.querySelector('u-radio')!.getBoundingClientRect();
    for (const o of [a, b]) {
      const style = getComputedStyle(base(o));
      for (const side of ['Top', 'Right', 'Bottom', 'Left'] as const) {
        expect(style[`border${side}Width`], side).toBe('1px');
      }
      expect(Math.round(o.getBoundingClientRect().width)).toBe(Math.round(group.width));
    }
    expect(b.getBoundingClientRect().top - a.getBoundingClientRect().bottom).toBeCloseTo(8, 0);
    expect(Math.round(group.width)).toBe(420);
  });

  it('🔴the mark leads, the description sits under the label, and the suffix ends at the far side', async () => {
    await mount();
    const [a] = options();
    const mark = part(a, 'radio-marker').getBoundingClientRect();
    const content = part(a, 'content').getBoundingClientRect();
    const description = part(a, 'description').getBoundingClientRect();
    const suffix = a.querySelector('[slot="suffix"]')!.getBoundingClientRect();
    const frame = base(a).getBoundingClientRect();
    const label = document.createRange();
    label.selectNodeContents(a.firstChild!);
    const text = label.getBoundingClientRect();
    expect(mark.right).toBeLessThanOrEqual(content.left);
    expect(description.top).toBeGreaterThanOrEqual(text.bottom - 1);
    expect(frame.right - suffix.right, 'suffix against the card padding').toBeLessThanOrEqual(18);
    const size = (e: Element) => parseFloat(getComputedStyle(e).fontSize);
    expect(size(part(a, 'description'))).toBeLessThan(size(a));
    expect(getComputedStyle(a.shadowRoot!.querySelector('.content > bdi')!).fontWeight).toBe('600');
  });

  it('🔴the picked card takes the accent border and an inner ring; the other does not', async () => {
    await mount();
    const [a, b] = options();
    const picked = getComputedStyle(base(a));
    const other = getComputedStyle(base(b));
    expect(picked.borderTopColor).not.toBe(other.borderTopColor);
    expect(picked.boxShadow).toMatch(ring(1));
    expect(other.boxShadow).toMatch(ring(0));
    await userEvent.click(b);
    await settle();
    expect(getComputedStyle(base(b)).boxShadow).toMatch(ring(1));
    expect(getComputedStyle(base(a)).boxShadow).toMatch(ring(0));
    expect(document.querySelector('u-radio')!.value).toBe('air');
  });

  it('🔴keyboard focus draws a ring around the card', async () => {
    await mount();
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    await settle();
    const [a, b] = options();
    expect(document.activeElement).toBe(a);
    expect(getComputedStyle(base(a)).outlineStyle).toBe('solid');
    expect(getComputedStyle(base(b)).outlineStyle).toBe('none');
  });

  it('🔴the frame survives a document-wide reset', async () => {
    const style = document.createElement('style');
    style.dataset.reset = '';
    style.textContent = RESET;
    document.head.appendChild(style);
    await mount();
    const [a] = options();
    expect(getComputedStyle(base(a)).borderTopWidth).toBe('1px');
    expect(parseFloat(getComputedStyle(base(a)).paddingLeft)).toBeGreaterThan(0);
  });

  it('🔴horizontal: the cards share one row in equal widths', async () => {
    await mount('orientation="horizontal"');
    const [a, b] = options().map((o) => o.getBoundingClientRect());
    expect(Math.round(a.top)).toBe(Math.round(b.top));
    expect(a.width).toBeCloseTo(b.width, 0);
    expect(b.left - a.right).toBeCloseTo(8, 0);
  });

  it('🔴horizontal in a narrow place: a card moves to the next row instead of squeezing its text', async () => {
    await mount('orientation="horizontal"', 'width:300px');
    const [a, b] = options().map((o) => o.getBoundingClientRect());
    expect(b.top).toBeGreaterThanOrEqual(a.bottom);
    expect(Math.round(a.width)).toBe(300);
    expect(Math.round(b.width)).toBe(300);
  });

  it('the options keep the radio role and the select label stays the label without its description', async () => {
    await mount();
    const [a] = options();
    expect(a.getAttribute('role')).toBe('radio');
    expect(a.getAttribute('aria-checked')).toBe('true');
    expect(a.getText()).toBe('Rail');
  });

  it('NEGATIVE: the default type draws no card frame, and an option without a description keeps no empty line', async () => {
    document.body.innerHTML = '<u-radio value="a"><u-option value="a">A</u-option></u-radio>';
    await settle();
    const [a] = options();
    expect(getComputedStyle(base(a)).borderTopWidth).toBe('0px');
    expect(getComputedStyle(base(a)).boxShadow).toMatch(ring(0));
    expect(part(a, 'description').getBoundingClientRect().height).toBe(0);
  });
});
