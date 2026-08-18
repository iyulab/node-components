import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/dialog/UDialog.js';
import '../../src/components/drawer/UDrawer.js';

/**
 * **Where focus goes when an overlay opens** — `UOverlayElement.resolveInitialFocus()`.
 *
 * Order: `[autofocus]` → the first input control → (if neither) `focus-trap`'s default
 * (the first tabbable element).
 *
 * ## 🔴 This file only carries inputs that **actually fail when reverted**
 *
 * Where the two branches actually diverge is **different per case**:
 *
 *   `[autofocus]`       → distinguishes on `u-drawer` (focus-trap doesn't look at that attribute)
 *   first-input-first   → distinguishes on `u-dialog` (if a button comes first, the default grabs the button)
 *
 * ⚠**Trying to distinguish the second case with `u-drawer` alone failed** — there, slot
 * placement makes the default land on the first input by coincidence anyway. That produced
 * a case that "passes even when reverted," and it nearly got concluded that "this branch
 * does nothing." ⇒ ***"passes even when reverted" is not evidence the code is useless — it's
 * evidence that input isn't a discriminating case.***
 */

type Overlay = HTMLElement & { updateComplete: Promise<unknown>; show(): void };

const mount = async (tag: string, inner: string) => {
  const el = document.createElement(tag) as Overlay;
  el.innerHTML = inner;
  document.body.appendChild(el);
  el.show();
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 450));
  return el;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('overlay initial focus', () => {
  it('🔴u-dialog — goes to the «first input» even when a button comes first in DOM order (reverting makes the button grab it)', async () => {
    const el = await mount(
      'u-dialog',
      `<button id="b1">OK</button><button id="b2">Cancel</button><input id="inp" />`,
    );
    expect(document.activeElement).toBe(el.querySelector('#inp'));
  });

  it('🔴u-drawer — `[autofocus]` takes priority over the first input (reverting makes the first input grab it)', async () => {
    const el = await mount(
      'u-drawer',
      `<input id="first" /><input id="second" autofocus />`,
    );
    expect(document.activeElement).toBe(el.querySelector('#second'));
  });

  it('with no input at all, falls back to the default (the first tabbable element)', async () => {
    const el = await mount('u-dialog', `<button id="only">Close</button>`);
    expect(document.activeElement).toBe(el.querySelector('#only'));
  });
});
