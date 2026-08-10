import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/drawer/UDrawer.js';

/**
 * **Does `?hidden` still work next to an unconditional `display:` on the same element?**
 *
 * house-style Sub-project D (cycle-268, working in `modern-app`) read `UDrawer.header`'s
 * source — `?hidden=${!this.hasHeader && !this.closable}` alongside an unconditional
 * `.header { display: flex; }` in `UDrawer.styles.ts`, no `[hidden]` override — and formed a
 * hypothesis from CSS cascade theory: author-origin rules always outrank the UA stylesheet's
 * `[hidden] { display: none }`, regardless of specificity, so `hidden` should have no visual
 * effect here.
 *
 * 🔴**Empirically false.** `hidden` does hide the header (this file, cycle-270). The theory
 * about origin ordering is correct in general, but doesn't predict this case — browsers give
 * the `hidden`-attribute UA rule enough weight (commonly `!important` in the UA sheet) to win
 * over ordinary author rules specifically so components can't accidentally break it this way.
 * Kept as a regression test, and as a record that this exact class of source-only reasoning
 * needs a real render to confirm — jsdom/happy-dom don't apply the UA `[hidden]` rule at all,
 * so this only exists here.
 */

type Drawer = HTMLElement & { open: boolean; updateComplete: Promise<unknown> };

afterEach(() => {
  document.body.innerHTML = '';
});

const settle = async () => {
  await new Promise(r => requestAnimationFrame(() => r(null)));
  await new Promise(r => setTimeout(r, 0));
};

describe('u-drawer — header `?hidden` next to an unconditional `display:flex`', () => {
  it('closable=false and an empty header slot puts `hidden` on [part="header"]', async () => {
    const drawer = document.createElement('u-drawer') as Drawer;
    drawer.setAttribute('placement', 'right');
    document.body.appendChild(drawer);
    await drawer.updateComplete;
    await settle();
    const header = drawer.shadowRoot!.querySelector('[part="header"]') as HTMLElement;
    expect(header.hasAttribute('hidden')).toBe(true);
  });

  it('and it actually hides — `hidden` wins over the unconditional `display:flex`', async () => {
    const drawer = document.createElement('u-drawer') as Drawer;
    drawer.setAttribute('placement', 'right');
    document.body.appendChild(drawer);
    await drawer.updateComplete;
    await settle();
    const header = drawer.shadowRoot!.querySelector('[part="header"]') as HTMLElement;
    expect(header.hasAttribute('hidden')).toBe(true);
    expect(getComputedStyle(header).display).toBe('none');
  });

  it('closable=true (a close button exists) — no `hidden`, header renders normally', async () => {
    const drawer = document.createElement('u-drawer') as Drawer;
    drawer.setAttribute('placement', 'right');
    drawer.setAttribute('closable', '');
    document.body.appendChild(drawer);
    await drawer.updateComplete;
    await settle();
    const header = drawer.shadowRoot!.querySelector('[part="header"]') as HTMLElement;
    expect(header.hasAttribute('hidden')).toBe(false);
    expect(getComputedStyle(header).display).toBe('flex');
  });
});
