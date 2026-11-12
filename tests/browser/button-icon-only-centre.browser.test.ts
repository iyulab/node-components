import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * An icon-only button keeps its icon in the middle. The label slot sits inside a `bdi` (value isolation in a right-to-left
 * page); a bare inline `bdi` in the flex content box would put the icon on a text baseline and push it off the centre by a
 * line-box strut (measured 1.5-3 px on the round chat buttons). The wrapper takes the content box's centring instead.
 */
let host: HTMLElement;
afterEach(() => host?.remove());

async function mount(dir: 'ltr' | 'rtl', markup: string) {
  host = document.createElement('div');
  host.setAttribute('dir', dir);
  host.innerHTML = markup;
  document.body.appendChild(host);
  await Promise.all([...host.querySelectorAll('*')].map((e) => (e as { updateComplete?: Promise<unknown> }).updateComplete));
  await new Promise((r) => setTimeout(r, 80));
}

describe('u-button — an icon-only button keeps the icon centred', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    it(`${dir}: the icon's centre is the button's centre (±1px both ways)`, async () => {
      await mount(dir, '<u-button rounded aria-label="Send"><u-icon lib="internal" name="x"></u-icon></u-button>');
      const button = host.querySelector('u-button')!;
      const icon = host.querySelector('u-icon')!;
      const b = button.getBoundingClientRect();
      const i = icon.getBoundingClientRect();
      expect(Math.abs((i.top + i.height / 2) - (b.top + b.height / 2))).toBeLessThanOrEqual(1);
      expect(Math.abs((i.left + i.width / 2) - (b.left + b.width / 2))).toBeLessThanOrEqual(1);
    });
  }
});
