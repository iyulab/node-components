import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/drawer/UDrawer.js';
import '../../src/components/dialog/UDialog.js';

/**
 * Regression for ISSUE-20260715-uoverlay-panel-token-no-fallback:
 * With no `--u-*` theme tokens defined (no Theme.init), the overlay panel used
 * `var(--u-panel-bg-color)` with no fallback and rendered fully transparent —
 * the modal looked "not open" while the backdrop dimmed. The backdrop already had
 * a fallback; the panel must too. A token-less panel must resolve to a visible,
 * non-transparent background.
 */
describe('overlay panel visibility without theme tokens', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  const TRANSPARENT = new Set(['rgba(0, 0, 0, 0)', 'transparent']);

  it('u-drawer panel has a non-transparent background when --u-panel-bg-color is undefined', async () => {
    const drawer = document.createElement('u-drawer');
    drawer.setAttribute('open', '');
    document.body.appendChild(drawer);
    await (drawer as unknown as { updateComplete: Promise<boolean> }).updateComplete;

    const panel = drawer.shadowRoot!.querySelector('.panel') as HTMLElement;
    expect(panel).toBeTruthy();
    const bg = getComputedStyle(panel).backgroundColor;
    expect(TRANSPARENT.has(bg)).toBe(false);
  });

  it('u-dialog panel has a non-transparent background when --u-panel-bg-color is undefined', async () => {
    const dialog = document.createElement('u-dialog');
    dialog.setAttribute('open', '');
    document.body.appendChild(dialog);
    await (dialog as unknown as { updateComplete: Promise<boolean> }).updateComplete;

    const panel = dialog.shadowRoot!.querySelector('.panel') as HTMLElement;
    expect(panel).toBeTruthy();
    const bg = getComputedStyle(panel).backgroundColor;
    expect(TRANSPARENT.has(bg)).toBe(false);
  });
});
