import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/rating/URating.js';
import '../../src/components/tree/UTree.js';
import '../../src/components/tree-item/UTreeItem.js';
import type { URating } from '../../src/components/rating/URating.js';

/**
 * A composite widget is **one** Tab stop; arrows move inside it (APG Radio Group · Tree View).
 *
 * Defect: every star of `u-rating` and every `u-tree-item` was its own Tab stop — Tab walked through five stars and
 * every visible tree item before reaching the next control. Measured with real Tab presses (5 and 3 stops).
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
afterEach(() => document.body.replaceChildren());

const deep = (): HTMLElement | null => {
  let a: Element | null = document.activeElement;
  while (a?.shadowRoot?.activeElement) a = a.shadowRoot.activeElement;
  return a as HTMLElement | null;
};
async function around(html: string) {
  document.body.innerHTML = `<button id="before">before</button>${html}<button id="after">after</button>`;
  await sleep(200);
  (document.getElementById('before') as HTMLElement).focus();
}
async function tab(shift = false) {
  await userEvent.keyboard(shift ? '{Shift>}{Tab}{/Shift}' : '{Tab}');
  await sleep(40);
}

describe('u-rating — one Tab stop, arrows choose', () => {
  it('Tab enters on the chosen star and the next Tab leaves', async () => {
    await around('<u-rating name="s" value="3" label="Score"></u-rating>');
    await tab();
    expect(deep()?.dataset.score).toBe('3');
    await tab();
    expect(deep()?.id).toBe('after');
  });

  it('no value — Tab enters on the first star', async () => {
    await around('<u-rating name="s" label="Score"></u-rating>');
    await tab();
    expect(deep()?.dataset.score).toBe('1');
  });

  it('arrows move and choose, firing change; Home and End too', async () => {
    await around('<u-rating name="s" value="3" label="Score"></u-rating>');
    const rating = document.querySelector('u-rating') as URating;
    const changes: number[] = [];
    rating.addEventListener('change', () => changes.push(rating.value ?? 0));
    await tab();
    await userEvent.keyboard('{ArrowRight}');
    await sleep(30);
    expect(rating.value).toBe(4);
    expect(deep()?.dataset.score).toBe('4');
    await userEvent.keyboard('{Home}');
    await sleep(30);
    expect(rating.value).toBe(1);
    await userEvent.keyboard('{End}');
    await sleep(30);
    expect(rating.value).toBe(5);
    expect(changes).toEqual([4, 1, 5]);
  });
});

describe('u-tree — one Tab stop, it remembers', () => {
  const TREE = `<u-tree><u-tree-item value="r" expanded>Root<u-tree-item value="c">Child</u-tree-item></u-tree-item>
    <u-tree-item value="l">Leaf</u-tree-item></u-tree>`;

  it('Tab enters on the first item and the next Tab leaves', async () => {
    await around(TREE);
    await tab();
    expect(deep()?.getAttribute('value')).toBe('r');
    await tab();
    expect(deep()?.id).toBe('after');
  });

  it('coming back with Shift+Tab returns to the item last focused', async () => {
    await around(TREE);
    await tab();
    await userEvent.keyboard('{ArrowDown}');
    await sleep(30);
    expect(deep()?.getAttribute('value')).toBe('c');
    await tab();
    expect(deep()?.id).toBe('after');
    // A middle item — with every item a Tab stop, Shift+Tab would land on the last one instead.
    await tab(true);
    const d = deep();
    expect(d?.getAttribute('value'), `${d?.tagName}.${d?.className}#${d?.id} tabindexes=${[...document.querySelectorAll('u-tree-item')].map(i => i.getAttribute('value') + ':' + i.getAttribute('tabindex')).join(',')}`).toBe('c');
  });

  it('collapsing the parent of the stop moves the stop to the parent', async () => {
    // The parent is not the first item — so landing on it is the stop's doing, not Tab order.
    await around(`<u-tree><u-tree-item value="l">Leaf</u-tree-item>
      <u-tree-item value="r" expanded>Root<u-tree-item value="c">Child</u-tree-item></u-tree-item></u-tree>`);
    await tab();
    await userEvent.keyboard('{ArrowDown}{ArrowDown}');
    await sleep(30);
    expect(deep()?.getAttribute('value')).toBe('c');
    (document.querySelector('u-tree-item[value="r"]') as HTMLElement & { expanded: boolean }).expanded = false;
    (document.getElementById('before') as HTMLElement).focus();
    await sleep(50);
    await tab();
    expect(deep()?.getAttribute('value')).toBe('r');
  });
});
