import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * The label a tag, a chip, an option or a breadcrumb item shows is data the app put there, whatever the page's direction.
 * A run of Latin letters in a right-to-left page (a company name, a part number) has the page as its paragraph direction, so
 * its trailing punctuation jumps to the wrong end — «Blue Harbor Co.» reads «.Blue Harbor Co». Each value is isolated
 * (`<bdi>`: the value decides its own direction, the component keeps its alignment), so it reads in its own order and
 * stands where the component puts it.
 *
 * The oracle is the screen position of the first and the last character of the label (a Range over its text node — the
 * text lives in the light DOM and is rendered through the slot). Chrome (fixed UI text) is not tested here: it is the
 * app's language, not data.
 */
const VALUE = 'Blue Harbor Co.';
let host: HTMLElement;
afterEach(() => host?.remove());

async function mount(dir: 'ltr' | 'rtl', markup: string) {
  host = document.createElement('div');
  host.setAttribute('dir', dir);
  host.style.cssText = 'width:300px;padding:8px';
  host.innerHTML = markup;
  document.body.appendChild(host);
  await Promise.all([...host.querySelectorAll('*')].map((e) => (e as { updateComplete?: Promise<unknown> }).updateComplete));
  await new Promise((r) => setTimeout(r, 60));
}

/** The text node whose data is the value — in the light DOM of `root`, or (when `root` has a shadow root) inside it. */
function textNode(root: ParentNode): Text {
  const walker = document.createTreeWalker(root as Node, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node && node.data.trim() !== VALUE) node = walker.nextNode() as Text | null;
  if (!node) throw new Error('value text not found');
  return node;
}

function edges(node: Text) {
  const range = document.createRange();
  range.setStart(node, 0);
  range.setEnd(node, 1);
  const first = range.getBoundingClientRect();
  range.setStart(node, node.data.length - 1);
  range.setEnd(node, node.data.length);
  const last = range.getBoundingClientRect();
  return { first: first.left, last: last.left };
}

const CASES: Array<{ label: string; markup: string; node: () => Text }> = [
  { label: 'u-tag', markup: `<u-tag>${VALUE}</u-tag>`, node: () => textNode(host.querySelector('u-tag')!) },
  { label: 'u-chip', markup: `<u-chip>${VALUE}</u-chip>`, node: () => textNode(host.querySelector('u-chip')!) },
  { label: 'u-option', markup: `<u-option value="a">${VALUE}</u-option>`, node: () => textNode(host.querySelector('u-option')!) },
  {
    label: 'u-breadcrumb-item (link)',
    markup: `<u-breadcrumb><u-breadcrumb-item href="#">${VALUE}</u-breadcrumb-item></u-breadcrumb>`,
    node: () => textNode(host.querySelector('u-breadcrumb-item')!),
  },
  {
    label: 'u-breadcrumb-item (current — no link)',
    markup: `<u-breadcrumb><u-breadcrumb-item>${VALUE}</u-breadcrumb-item></u-breadcrumb>`,
    node: () => textNode(host.querySelector('u-breadcrumb-item')!),
  },
  {
    label: 'u-select (single — the chosen option shown in the trigger)',
    markup: `<u-select value="a"><u-option value="a">${VALUE}</u-option></u-select>`,
    node: () => textNode(host.querySelector('u-select')!.shadowRoot!),
  },
  {
    label: 'u-select (multiple — the chosen option shown as a chip)',
    markup: `<u-select multiple value="a"><u-option value="a">${VALUE}</u-option></u-select>`,
    node: () => textNode(host.querySelector('u-select')!.shadowRoot!.querySelector('u-chip')!),
  },
];

describe('components — a label keeps its own direction in a right-to-left page', () => {
  for (const c of CASES) {
    it(`${c.label}: the full stop stands after the last word`, async () => {
      await mount('rtl', c.markup);
      const e = edges(c.node());
      expect(e.last).toBeGreaterThan(e.first); // «.Blue Harbor Co» put the dot left of the B
    });

    it(`NEGATIVE ${c.label}: in a left-to-right page the label reads as before`, async () => {
      await mount('ltr', c.markup);
      const e = edges(c.node());
      expect(e.last).toBeGreaterThan(e.first);
    });
  }
});
