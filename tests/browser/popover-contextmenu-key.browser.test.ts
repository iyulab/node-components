import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/popover/UPopover.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * `u-popover trigger="contextmenu"` opens from the keyboard: the menu key and Shift+F10 on the anchor.
 *
 * Chromium and Firefox turn those keys into a `contextmenu` event themselves; Safari does not, so a popover opened by
 * right-click had no keyboard way to it there. The popover now takes the key on its anchor and opens at the focused
 * element — the key's default is prevented, so a browser that would also fire `contextmenu` does not open it twice.
 */
let host: HTMLElement;
afterEach(() => host?.remove());

async function mount(): Promise<{ anchor: HTMLButtonElement; pop: UPopover }> {
  host = document.body.appendChild(document.createElement('div'));
  host.style.padding = '60px';
  host.innerHTML = '<button id="cm-anchor">Row</button><u-popover for="#cm-anchor" trigger="contextmenu"><p>Menu</p></u-popover>';
  const pop = host.querySelector('u-popover') as UPopover;
  await pop.updateComplete;
  const anchor = host.querySelector('#cm-anchor') as HTMLButtonElement;
  anchor.focus();
  return { anchor, pop };
}

const settle = () => new Promise((r) => setTimeout(r, 150));

describe('u-popover trigger="contextmenu" — keyboard', () => {
  for (const [name, keys, key] of [['the menu key', '{ContextMenu}', 'ContextMenu'], ['Shift+F10', '{Shift>}{F10}{/Shift}', 'F10']] as const) {
    it(`${name} on the anchor opens it, once`, async () => {
      const { pop } = await mount();
      let shown = 0;
      pop.addEventListener('show', () => shown++);
      let taken = false;
      document.addEventListener('keydown', (e) => { if (e.key === key) taken = e.defaultPrevented; }, { once: false });
      await userEvent.keyboard(keys);
      await settle();
      expect(pop.open).toBe(true);
      expect(shown).toBe(1);
      expect(taken, 'the popover takes the key — the browser does not open its own menu as well').toBe(true);
    });
  }

  it('⚪NEGATIVE — the menu key elsewhere does not open it', async () => {
    const { pop } = await mount();
    const other = host.appendChild(document.createElement('button'));
    other.textContent = 'Other';
    other.focus();
    await userEvent.keyboard('{ContextMenu}');
    await settle();
    expect(pop.open).toBe(false);
  });
});
