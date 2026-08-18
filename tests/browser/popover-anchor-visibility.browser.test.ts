import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/popover/UPopover.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * Popover visibility when its anchor moves outside the clipping area.
 *
 * Surfaced in cycle-09, once `scroll` dismiss stopped closing on a real anchor. A
 * `strategy="fixed"` popover isn't clipped by an overflow ancestor (that's the reason it
 * uses fixed — see select-popover-strategy.browser.test.ts), so if the anchor scrolls out
 * of a scroll panel, the popover alone can stay on screen and cover unrelated content. It's
 * hidden via the floating-ui `hide` middleware but **not closed**, so scrolling back returns
 * it open as-is.
 */

async function settle(ms = 200): Promise<void> {
  await new Promise(r => setTimeout(r, ms));
}

/** Mounts a u-select inside a scroll panel, opens it, and returns the handles. */
async function mountInScrollPanel(): Promise<{
  panel: HTMLElement;
  select: USelect;
  popover: UPopover;
}> {
  const panel = document.createElement('div');
  panel.style.height = '150px';
  panel.style.overflow = 'auto';
  panel.style.border = '1px solid gray';

  const select = document.createElement('u-select') as USelect;
  for (let i = 0; i < 3; i++) {
    const option = document.createElement('u-option');
    option.setAttribute('value', `v${i}`);
    option.textContent = `Option ${i}`;
    select.appendChild(option);
  }
  panel.appendChild(select);

  // extra content below, so the anchor can be scrolled out of the panel
  const filler = document.createElement('div');
  filler.style.height = '1200px';
  panel.appendChild(filler);

  document.body.appendChild(panel);
  await select.updateComplete;

  const popover = select.shadowRoot!.querySelector('u-popover') as UPopover;
  (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
  await settle(100);

  return { panel, select, popover };
}

describe('popover hiding based on anchor visibility', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);
    await settle(150);
  });

  it('hides when the anchor scrolls out of the panel, and returns open when it scrolls back', async () => {
    const { panel, popover } = await mountInScrollPanel();
    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('anchor-hidden')).toBe(false);

    // push the anchor fully out of the panel's clipping area
    panel.scrollTop = 600;
    await settle();

    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`)
      .toBe('open=true hidden=true');
    expect(getComputedStyle(popover).visibility).toBe('hidden');

    // scrolling back must not close it — it should return open as-is
    panel.scrollTop = 0;
    await settle();

    expect(`open=${popover.open} hidden=${popover.hasAttribute('anchor-hidden')}`)
      .toBe('open=true hidden=false');
    expect(getComputedStyle(popover).visibility).toBe('visible');
  });

  it('does not get anchor-hidden while the anchor is visible — regression guard', async () => {
    const { popover } = await mountInScrollPanel();

    expect(popover.open).toBe(true);
    expect(popover.hasAttribute('anchor-hidden')).toBe(false);
    expect(getComputedStyle(popover).visibility).toBe('visible');
  });
});
