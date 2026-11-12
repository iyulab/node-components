import { describe, it, expect } from 'vitest';
import '../../src/index.js';

/**
 * Every registered element is mounted in a right-to-left page with a Latin value as its text. Either the value keeps its
 * own direction (the trailing full stop stands after the last word) or the element is on the list below with the reason it
 * follows the page. A new component with a one-line label slot that forgets the `bdi` isolation fails here; it does not
 * wait for a consumer to see `.Blue Harbor Co`.
 *
 * The targets are derived (every `@customElement` in the source); the rule — which elements may follow the page — is the
 * written list, because only we know what is a label and what is a content box.
 *
 * Not judged: an element whose text does not render in this bare mount (a tooltip body, a closed alert, a picker that
 * draws its own value) — the specific tests for those surfaces own them (`rtl-content-bidi`).
 */
const sources = import.meta.glob('../../src/components/**/*.ts', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const tags = new Set<string>();
for (const src of Object.values(sources)) for (const m of src.matchAll(/@customElement\('([^']+)'\)/g)) tags.add(m[1]);

const FOLLOWS_PAGE: Record<string, string> = {
  // content boxes — sentences and arbitrary markup (the label/content boundary of the right-to-left contract)
  'u-card': 'content box',
  'u-panel': 'content box',
  'u-dialog': 'content box',
  'u-drawer': 'content box',
  'u-expander': 'content box',
  'u-split-panel': 'content box',
  'u-carousel': 'content box',
  'u-auto-scroll': 'content box',
  'u-form': 'content box',
  'u-text': 'typography — sentences follow the page',
  'u-spinner': 'a loading message is a sentence',
  'u-skeleton': 'no text',
  // the default slot takes a form control or child components, not a label
  'u-field': 'default slot is the form control (the label is an attribute)',
  'u-breadcrumb': 'default slot takes breadcrumb items',
  'u-button-group': 'default slot takes buttons',
  'u-menu': 'default slot takes menu items',
  'u-tab-nav': 'default slot takes tabs',
  'u-tab-panel': 'default slot takes tabs and panels',
  'u-tree': 'default slot takes tree items',
};

const VALUE = 'Blue Harbor Co.';

/** What the last probe of each tag measured — a failure names the geometry, so a one-off result can be diagnosed from the log. */
const measured: Record<string, string> = {};

async function probe(tag: string): Promise<'isolated' | 'reversed' | 'not-rendered'> {
  const host = document.createElement('div');
  host.setAttribute('dir', 'rtl');
  host.style.cssText = 'width:300px;padding:8px';
  host.innerHTML = `<${tag}>${VALUE}</${tag}>`;
  document.body.appendChild(host);
  try {
    const el = host.firstElementChild as HTMLElement & { updateComplete?: Promise<unknown> };
    await el.updateComplete?.catch(() => undefined);
    await new Promise((r) => setTimeout(r, 30));
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    let node = walker.nextNode() as Text | null;
    while (node && node.data.trim() !== VALUE) node = walker.nextNode() as Text | null;
    if (!node) return 'not-rendered';
    const range = document.createRange();
    range.setStart(node, 0);
    range.setEnd(node, 1);
    const first = range.getBoundingClientRect();
    range.setStart(node, node.data.length - 1);
    range.setEnd(node, node.data.length);
    const last = range.getBoundingClientRect();
    if (first.width === 0 && last.width === 0) return 'not-rendered';
    measured[tag] = `first(l=${Math.round(first.left)}, t=${Math.round(first.top)}) last(l=${Math.round(last.left)}, t=${Math.round(last.top)}) display=${getComputedStyle(el).display} visibility=${getComputedStyle(el).visibility}`;
    // The oracle compares the x of the first and the last character, so it only means something for text on one line that
    // is shown — a value that wrapped (the last character on a later line, to the left of the first) or an element that is
    // hidden (a closed floating surface) is not judged here.
    if (Math.abs(last.top - first.top) > first.height / 2) return 'not-rendered';
    if (getComputedStyle(el).visibility === 'hidden' || getComputedStyle(el).display === 'none') return 'not-rendered';
    return last.left > first.left ? 'isolated' : 'reversed';
  } finally {
    host.remove();
  }
}

describe('components — every label surface keeps its value\'s direction in a right-to-left page', () => {
  it('derives its targets from the source (a non-empty set)', () => {
    expect(tags.size).toBeGreaterThan(40);
  });

  it('the follows-the-page list names only registered elements (no stale entry)', () => {
    expect([...Object.keys(FOLLOWS_PAGE)].filter((t) => !tags.has(t))).toEqual([]);
  });

  it('no element outside the follows-the-page list reverses the value', async () => {
    const reversed: string[] = [];
    for (const tag of [...tags].sort()) {
      if (tag in FOLLOWS_PAGE) continue;
      if ((await probe(tag)) === 'reversed') reversed.push(tag);
    }
    expect(reversed.map((t) => `${t}: ${measured[t]}`)).toEqual([]);
  });

  it('NEGATIVE: the probe does reverse a surface that does not isolate (u-card)', async () => {
    expect(await probe('u-card')).toBe('reversed');
  });
});
