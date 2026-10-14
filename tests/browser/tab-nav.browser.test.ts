import { describe, it, expect, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '../../src/components/tab-nav/UTabNav.js';
import '../../src/components/tab/UTab.js';
import '../../src/components/tab-panel/UTabPanel.js';
import '../../src/components/panel/UPanel.js';
import { Locale } from '../../src/utilities/Locale.js';
import type { UTab } from '../../src/components/tab/UTab.js';
import type { UTabNav } from '../../src/components/tab-nav/UTabNav.js';

/**
 * 링크 탭 띠 — 저장된 보기처럼 탭마다 URL 이 있는 자리. 탭 패턴(`tablist`)이 아니라 `<nav>` 안의 링크다:
 * 현재 보기는 `aria-current="page"`, 각 링크가 Tab 정지점, 링크 탭은 탭 역할을 갖지 않는다.
 */
afterEach(() => {
  document.body.replaceChildren();
  Locale.set('en');
  if (location.hash) history.replaceState(null, '', location.pathname + location.search);
});

async function mount(markup: string): Promise<{ nav: UTabNav; tabs: UTab[] }> {
  document.body.innerHTML = markup;
  const nav = document.querySelector('u-tab-nav') as UTabNav;
  const tabs = [...document.querySelectorAll('u-tab')] as UTab[];
  await nav.updateComplete;
  for (const t of tabs) await t.updateComplete;
  await nav.updateComplete;
  for (const t of tabs) await t.updateComplete;
  return { nav, tabs };
}

const link = (tab: UTab) => tab.shadowRoot!.querySelector('[part="base"]') as HTMLAnchorElement;

const VIEWS = `
  <button id="before">b</button>
  <u-tab-nav label="Saved views" value="open">
    <u-tab value="all" href="#all">All</u-tab>
    <u-tab value="open" href="#open" count="1234">Open</u-tab>
    <u-tab value="mine" href="#mine" count="0">Mine</u-tab>
  </u-tab-nav>`;

describe('u-tab-nav', () => {
  it('🔴a named navigation landmark of links — not a tablist, and a link tab has no tab role', async () => {
    const { tabs } = await mount(VIEWS);
    await expect.element(page.getByRole('navigation', { name: 'Saved views' })).toBeInTheDocument();
    expect(page.getByRole('tablist').elements()).toHaveLength(0);
    expect(page.getByRole('tab').elements()).toHaveLength(0);
    expect(page.getByRole('link').elements()).toHaveLength(3);
    for (const t of tabs) {
      expect(t.hasAttribute('role')).toBe(false);
      expect(t.hasAttribute('tabindex')).toBe(false);
      expect(link(t).tagName).toBe('A');
    }
  });

  it('🔴value marks the current view — active and aria-current="page" on that link only', async () => {
    const { nav, tabs } = await mount(VIEWS);
    expect(tabs.map(t => t.active)).toEqual([false, true, false]);
    expect(tabs.map(t => link(t).getAttribute('aria-current'))).toEqual([null, 'page', null]);
    nav.value = 'mine';
    await nav.updateComplete;
    for (const t of tabs) await t.updateComplete;
    expect(tabs.map(t => link(t).getAttribute('aria-current'))).toEqual([null, null, 'page']);
  });

  it('🔴each link is a Tab stop and Enter follows it', async () => {
    const { tabs } = await mount(VIEWS);
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    expect(tabs[0].shadowRoot!.activeElement).toBe(link(tabs[0]));
    await userEvent.tab();
    expect(tabs[1].shadowRoot!.activeElement).toBe(link(tabs[1]));
    await userEvent.keyboard('{Enter}');
    expect(location.hash).toBe('#open');
  });

  it('🔴the current tab carries the underline; the strip clips nothing vertically', async () => {
    const { nav, tabs } = await mount(VIEWS);
    const after = getComputedStyle(tabs[1], '::after');
    expect(after.height).toBe('2px');
    expect(getComputedStyle(tabs[0], '::after').content).toBe('none');
    const strip = nav.shadowRoot!.querySelector('[part="base"]') as HTMLElement;
    expect(strip.scrollHeight).toBeLessThanOrEqual(strip.clientHeight);
  });

  it('🔴the focus ring is drawn inside the link (the strip scrolls and clips)', async () => {
    const { tabs } = await mount(VIEWS);
    (document.getElementById('before') as HTMLButtonElement).focus();
    await userEvent.tab();
    const s = getComputedStyle(link(tabs[0]));
    expect(s.outlineStyle).toBe('solid');
    expect(parseFloat(s.outlineOffset)).toBeLessThan(0);
  });

  it('without value, the author marks the current tab with active', async () => {
    const { tabs } = await mount(`
      <u-tab-nav label="Views">
        <u-tab href="#a">A</u-tab>
        <u-tab href="#b" active>B</u-tab>
      </u-tab-nav>`);
    expect(tabs.map(t => link(t).getAttribute('aria-current'))).toEqual([null, 'page']);
  });

  it('a disabled link tab has no href and says so', async () => {
    const { tabs } = await mount('<u-tab-nav label="Views"><u-tab href="#a" disabled>A</u-tab></u-tab-nav>');
    expect(link(tabs[0]).hasAttribute('href')).toBe(false);
    expect(link(tabs[0]).getAttribute('aria-disabled')).toBe('true');
    expect(tabs[0].hasAttribute('aria-disabled')).toBe(false);
  });
});

describe('u-tab count', () => {
  it('🔴a quiet count after the label, in the locale’s digits, part of the link name', async () => {
    const { tabs } = await mount(VIEWS);
    const count = tabs[1].shadowRoot!.querySelector('[part="count"]') as HTMLElement;
    expect(count.textContent).toBe('1,234');
    const s = getComputedStyle(count);
    expect(s.fontVariantNumeric).toContain('tabular-nums');
    expect(parseFloat(s.fontSize)).toBeLessThan(parseFloat(getComputedStyle(tabs[1]).fontSize));
    await expect.element(page.getByRole('link', { name: 'Open 1,234' })).toBeInTheDocument();
    expect(tabs[2].shadowRoot!.querySelector('[part="count"]')!.textContent).toBe('0');
  });

  it('follows a locale change', async () => {
    const { tabs } = await mount(VIEWS);
    Locale.set('de');
    await tabs[1].updateComplete;
    expect(tabs[1].shadowRoot!.querySelector('[part="count"]')!.textContent).toBe('1.234');
  });

  it('NEGATIVE no count, no count element', async () => {
    const { tabs } = await mount(VIEWS);
    expect(tabs[0].shadowRoot!.querySelector('[part="count"]')).toBeNull();
  });

  it('a count also works on a panel tab, which keeps its tab role', async () => {
    document.body.innerHTML = `
      <u-tab-panel>
        <u-tab value="a" count="3">A</u-tab>
        <u-panel value="a">x</u-panel>
      </u-tab-panel>`;
    const tab = document.querySelector('u-tab') as UTab;
    await tab.updateComplete;
    await (document.querySelector('u-tab-panel') as HTMLElement & { updateComplete: Promise<unknown> }).updateComplete;
    expect(tab.getAttribute('role')).toBe('tab');
    await expect.element(page.getByRole('tab', { name: 'A 3' })).toBeInTheDocument();
  });
});
