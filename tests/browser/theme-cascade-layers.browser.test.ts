import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Theme } from '../../src/utilities/Theme.js';

/**
 * Contract: **application CSS > house theme > built-in defaults** — decided by cascade
 * layers, not by specificity or by when `Theme.init()` injects its sheets.
 *
 *   @layer iyu.base   built-in token sheets (light.css · dark.css)
 *   @layer iyu.house  a house theme (e.g. `@iyulab/house-style`)
 *   (unlayered)       the application
 *
 * Before layers, an application had to out-specify the dark sheet (`:root[theme="dark"]`)
 * with selectors like `:root:root` or `:root:not([theme="dark"])`, and a house preset
 * could not be told apart from an application override. Measured with computed values —
 * the order of nodes in `<head>` is placement, not cascade.
 */
describe('Theme.init() — cascade layers', () => {
  const TOKEN = '--u-text-title-size';
  const IDS = ['probe-app', 'probe-house'];

  const read = () => getComputedStyle(document.documentElement).getPropertyValue(TOKEN).trim();

  function addSheet(id: string, css: string, where: 'append' | 'prepend' = 'append') {
    const el = document.createElement('style');
    el.id = id;
    el.textContent = css;
    if (where === 'append') document.head.appendChild(el);
    else document.head.insertBefore(el, document.head.firstChild);
  }

  beforeEach(() => {
    for (const el of document.head.querySelectorAll('style[data-name]')) el.remove();
    for (const id of IDS) document.getElementById(id)?.remove();
    document.documentElement.removeAttribute('theme');
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    for (const id of IDS) document.getElementById(id)?.remove();
  });

  it('the built-in sheets declare the layer order and live in iyu.base', async () => {
    await Theme.init({ default: 'light' });
    const sheets = [...document.head.querySelectorAll<HTMLStyleElement>('style[data-name]')];
    expect(sheets.length).toBeGreaterThan(0);
    for (const s of sheets) {
      expect(s.textContent).toMatch(/@layer iyu\.base, iyu\.house;/);
      expect(s.textContent).toMatch(/@layer iyu\.base \{/);
    }
  });

  it('a house layer beats the built-in defaults even when it loaded first', async () => {
    addSheet('probe-house', '@layer iyu.base, iyu.house; @layer iyu.house { :root { --u-text-title-size: 31px; } }', 'prepend');
    await Theme.init({ default: 'light' });
    expect(read()).toBe('31px');
  });

  it('🔴an unlayered application rule beats the house layer, whatever the source order', async () => {
    addSheet('probe-app', ':root { --u-text-title-size: 47px; }', 'prepend');
    await Theme.init({ default: 'light' });
    addSheet('probe-house', '@layer iyu.house { :root:root:root { --u-text-title-size: 31px; } }');
    // Higher specificity and later source order — the house layer still loses to unlayered CSS.
    expect(read()).toBe('47px');
  });

  it('🔴a plain `:root` application override wins in dark mode too — no specificity race', async () => {
    const DARK_TOKEN = '--u-bg-color';
    addSheet('probe-app', `:root { ${DARK_TOKEN}: rgb(1, 2, 3); }`);
    await Theme.init({ default: 'dark' });
    expect(document.documentElement.getAttribute('theme')).toBe('dark');
    // Negative control: without the layer the dark sheet's `:root[theme="dark"]` (0,1,1) wins.
    expect(getComputedStyle(document.documentElement).getPropertyValue(DARK_TOKEN).trim()).toBe('rgb(1, 2, 3)');
  });

  it('inside the house layer, dark still out-specifies light', async () => {
    addSheet('probe-house', `@layer iyu.house {
      :root { --u-text-title-size: 31px; }
      :root[theme="dark"] { --u-text-title-size: 32px; }
    }`);
    await Theme.init({ default: 'dark' });
    expect(read()).toBe('32px');
    Theme.set('light');
    expect(read()).toBe('31px');
  });

  it('useBuiltIn:false leaves no base sheet behind, and a house layer alone still applies', async () => {
    await Theme.init({ default: 'light' });
    await Theme.init({ default: 'light', useBuiltIn: false });
    expect(document.head.querySelectorAll('style[data-name]').length).toBe(0);
    addSheet('probe-house', '@layer iyu.base, iyu.house; @layer iyu.house { :root { --u-text-title-size: 31px; } }');
    expect(read()).toBe('31px');
  });

  it('a second init() does not duplicate the base sheets', async () => {
    await Theme.init({ default: 'light' });
    const n = document.head.querySelectorAll('style[data-name]').length;
    await Theme.init({ default: 'light' });
    expect(document.head.querySelectorAll('style[data-name]').length).toBe(n);
  });

  it('new base tokens exist: canvas (page background) and focus ring', async () => {
    await Theme.init({ default: 'light' });
    const cs = getComputedStyle(document.documentElement);
    expect(cs.getPropertyValue('--u-canvas-bg-color').trim()).not.toBe('');
    expect(cs.getPropertyValue('--u-focus-ring-color').trim()).not.toBe('');
  });
});
