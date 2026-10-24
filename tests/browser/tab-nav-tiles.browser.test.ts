import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/tab-nav/UTabNav.js';
import '../../src/components/tab/UTab.js';
import type { UTabNav } from '../../src/components/tab-nav/UTabNav.js';
import type { UTab } from '../../src/components/tab/UTab.js';

/**
 * `u-tab-nav appearance="tiles"` — equal tiles, the current one filled; with `count-appearance="figure"` each tile shows
 * its count as a large number under the label (a shop-floor terminal's stations). NEGATIVE: the default `line` keeps the
 * underline and a badge count.
 */
afterEach(() => { document.body.replaceChildren(); });

async function mount(appearance: string | null, width = '640px'): Promise<{ nav: UTabNav; tabs: UTab[] }> {
  document.body.innerHTML = `
    <div style="width:${width}">
      <u-tab-nav label="Stations" value="b" ${appearance ? `appearance="${appearance}"` : ''}>
        <u-tab value="a" href="#a" count="383" count-appearance="figure">Press 1</u-tab>
        <u-tab value="b" href="#b" count="125" count-appearance="figure">Press 2</u-tab>
        <u-tab value="c" href="#c" count="137" count-appearance="figure">Foil</u-tab>
        <u-tab value="d" href="#d" count="7" count-appearance="figure">Binding</u-tab>
        <u-tab value="e" href="#e" count="41" count-appearance="figure">Packing</u-tab>
      </u-tab-nav>
    </div>`;
  const nav = document.querySelector('u-tab-nav') as UTabNav;
  const tabs = [...document.querySelectorAll('u-tab')] as UTab[];
  await nav.updateComplete;
  await Promise.all(tabs.map((t) => t.updateComplete));
  return { nav, tabs };
}
const base = (t: UTab) => t.shadowRoot!.querySelector('[part="base"]') as HTMLElement;
const count = (t: UTab) => t.shadowRoot!.querySelector('[part="count"]') as HTMLElement;

describe('u-tab-nav tiles', () => {
  it('lays the tabs out as equal tiles that fill the strip', async () => {
    const { nav, tabs } = await mount('tiles');
    const widths = tabs.map((t) => Math.round(t.getBoundingClientRect().width));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    const strip = nav.getBoundingClientRect();
    expect(Math.round(tabs[4].getBoundingClientRect().right)).toBeGreaterThanOrEqual(Math.round(strip.right) - 1);
    expect(getComputedStyle(base(tabs[0])).borderTopStyle).toBe('solid');
    expect(parseFloat(getComputedStyle(base(tabs[0])).borderTopWidth)).toBeGreaterThan(0);
  });

  it('fills the current tile and gives it the contrast text', async () => {
    const { tabs } = await mount('tiles');
    const cur = getComputedStyle(base(tabs[1]));
    const other = getComputedStyle(base(tabs[0]));
    expect(cur.backgroundColor).not.toBe(other.backgroundColor);
    expect(getComputedStyle(tabs[1]).color).not.toBe(getComputedStyle(tabs[0]).color);
    expect(base(tabs[1]).getAttribute('aria-current')).toBe('page');
  });

  it('a figure count sits under the label, larger than it', async () => {
    const { tabs } = await mount('tiles');
    const label = tabs[0].getBoundingClientRect();
    const c = count(tabs[0]);
    expect(c.textContent).toBe('383');
    expect(parseFloat(getComputedStyle(c).fontSize)).toBeGreaterThan(parseFloat(getComputedStyle(tabs[0]).fontSize));
    const slot = tabs[0].shadowRoot!.querySelector('slot:not([name])') as HTMLSlotElement;
    const text = slot.assignedNodes()[0];
    const range = document.createRange();
    range.selectNodeContents(text);
    expect(c.getBoundingClientRect().top).toBeGreaterThanOrEqual(range.getBoundingClientRect().bottom - 1);
    expect(label.height).toBeGreaterThan(0);
  });

  it('wraps tiles onto more rows when narrow', async () => {
    const { nav, tabs } = await mount('tiles', '260px');
    const tops = new Set(tabs.map((t) => Math.round(t.getBoundingClientRect().top)));
    expect(tops.size).toBeGreaterThan(1);
    for (const t of tabs) expect(t.getBoundingClientRect().right).toBeLessThanOrEqual(nav.getBoundingClientRect().right + 1);
  });

  it('NEGATIVE: the line appearance keeps the underline and no tile frame', async () => {
    const { tabs } = await mount(null);
    expect(getComputedStyle(base(tabs[0])).borderTopStyle === 'solid' && parseFloat(getComputedStyle(base(tabs[0])).borderTopWidth) > 0).toBe(false);
    expect(getComputedStyle(tabs[1], '::after').content).not.toBe('none');
  });
});
