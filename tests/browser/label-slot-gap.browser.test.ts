import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * A badge, a tab, a divider and a progress bar show their label slot inside a `bdi` (value isolation in a right-to-left page). Their host lays the slot
 * children out as flex items, so an icon and the text that follow each other in the slot keep their spacing and their
 * common centre line only when the wrapper is itself a flex row that carries the host's gap on. A bare inline `bdi` would
 * collapse the icon and the text into one inline line: the gap would vanish and the icon would sit on a text baseline.
 *
 * Oracle: the screen distance between the icon and the text (in the reading direction), and their vertical centres.
 */
let host: HTMLElement;
afterEach(() => host?.remove());

async function mount(dir: 'ltr' | 'rtl', markup: string) {
  host = document.createElement('div');
  host.setAttribute('dir', dir);
  host.style.cssText = 'width:300px;padding:8px';
  host.innerHTML = markup;
  document.body.appendChild(host);
  await Promise.all([...host.querySelectorAll('*')].map((e) => (e as { updateComplete?: Promise<unknown> }).updateComplete));
  await new Promise((r) => setTimeout(r, 80));
}

function textRect(root: ParentNode, text: string): DOMRect {
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node && node.data.trim() !== text) node = walker.nextNode() as Text | null;
  if (!node) throw new Error('text not found');
  const range = document.createRange();
  range.selectNodeContents(node);
  return range.getBoundingClientRect();
}

/** Distance from the icon to the text along the reading direction (the icon comes first in the markup). */
function gap(dir: 'ltr' | 'rtl', icon: DOMRect, text: DOMRect): number {
  return dir === 'ltr' ? text.left - icon.right : icon.left - text.right;
}

const LABEL = 'Alerts';

describe('u-badge — icon and text in the label slot keep the host gap', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    it(`${dir}: the gap between the icon and the text is the host gap (0.25em), the centres line up`, async () => {
      await mount(dir, `<u-badge style="font-size:20px"><u-icon lib="internal" name="x"></u-icon>${LABEL}</u-badge>`);
      const badge = host.querySelector('u-badge')!;
      const icon = host.querySelector('u-icon')!.getBoundingClientRect();
      const text = textRect(badge, LABEL);
      // 0.25em at 20px = 5px — the whitespace-free markup leaves nothing else between them.
      expect(gap(dir, icon, text)).toBeGreaterThanOrEqual(4);
      expect(gap(dir, icon, text)).toBeLessThanOrEqual(6);
      expect(Math.abs((icon.top + icon.height / 2) - (text.top + text.height / 2))).toBeLessThanOrEqual(2);
    });
  }
});

describe('u-tab — icon and text in the label slot stay on one centre line', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    it(`${dir}: the icon and the text keep their spacing and share a centre line`, async () => {
      await mount(dir, `<u-tab style="font-size:20px"><u-icon lib="internal" name="x"></u-icon>${LABEL}</u-tab>`);
      const tab = host.querySelector('u-tab')!;
      const icon = host.querySelector('u-icon')!.getBoundingClientRect();
      const text = textRect(tab, LABEL);
      // The tab sets no gap of its own: icon and text touch (the author spaces them with a margin or the prefix slot).
      expect(Math.abs(gap(dir, icon, text))).toBeLessThanOrEqual(1);
      expect(Math.abs((icon.top + icon.height / 2) - (text.top + text.height / 2))).toBeLessThanOrEqual(2);
    });
  }
});

describe('u-divider and u-progress-bar — icon and text in the slot stay on one centre line', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    it(`${dir}: u-divider`, async () => {
      await mount(dir, `<u-divider style="font-size:20px"><u-icon lib="internal" name="x"></u-icon>${LABEL}</u-divider>`);
      const icon = host.querySelector('u-icon')!.getBoundingClientRect();
      const text = textRect(host.querySelector('u-divider')!, LABEL);
      expect(Math.abs((icon.top + icon.height / 2) - (text.top + text.height / 2))).toBeLessThanOrEqual(2);
    });

    it(`${dir}: u-progress-bar`, async () => {
      await mount(dir, `<u-progress-bar value="40" style="font-size:40px;width:200px"><u-icon lib="internal" name="x"></u-icon>${LABEL}</u-progress-bar>`);
      const icon = host.querySelector('u-icon')!.getBoundingClientRect();
      const text = textRect(host.querySelector('u-progress-bar')!, LABEL);
      expect(Math.abs((icon.top + icon.height / 2) - (text.top + text.height / 2))).toBeLessThanOrEqual(2);
    });
  }
});
