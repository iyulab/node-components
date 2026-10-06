import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/progress-bar/UProgressBar.js';
import '../../src/components/progress-ring/UProgressRing.js';
import '../../src/components/spinner/USpinner.js';
import '../../src/components/rating/URating.js';
import '../../src/components/icon-button/UIconButton.js';
import '../../src/components/tree/UTree.js';
import '../../src/components/tree-item/UTreeItem.js';
import { Locale } from '../../src/utilities/Locale.js';
import { axTree, type AxNode } from './ax.js';

/**
 * Widgets as assistive technology receives them — Chromium's accessibility tree, not the DOM.
 *
 * An audit of the interactive widgets found what the eye cannot: progress bars, rings and spinners with no role at
 * all (nothing was in progress, as far as a screen reader knew); rating stars as five unnamed radios; tree items
 * all at level 1, without expanded/selected/checked state, and named with their children's text; an icon button
 * whose tooltip text never became its name.
 */
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));
afterEach(() => { document.body.replaceChildren(); Locale.set('en'); });

async function mount(html: string): Promise<void> {
  document.body.innerHTML = html;
  await sleep(150);
}
const nodes = async (role: string): Promise<AxNode[]> =>
  (await axTree())
    .filter((n) => !n.ignored && n.role?.value === role)
    .map((n) => ({
      role: n.role?.value ?? '',
      name: n.name?.value ?? '',
      description: '',
      // CDP carries the current value in the node's own `value` field, not among `properties`.
      props: {
        ...Object.fromEntries((n.properties ?? []).map((p) => [p.name, p.value.value])),
        ...(n.value ? { valuenow: Number(n.value.value) } : {}),
      },
    }));

describe('progress', () => {
  it('u-progress-bar is a progressbar with its value', async () => {
    await mount('<u-progress-bar value="60" aria-label="Upload"></u-progress-bar>');
    const [p] = await nodes('progressbar');
    expect(p?.name).toBe('Upload');
    expect(p?.props).toMatchObject({ valuenow: 60, valuemin: 0, valuemax: 100 });
  });

  it('indeterminate has no value — in progress, amount unknown', async () => {
    await mount('<u-progress-bar indeterminate></u-progress-bar>');
    const [p] = await nodes('progressbar');
    expect(p).toBeTruthy();
    expect(p.props.valuenow).toBeUndefined();
  });

  it('a value change follows', async () => {
    await mount('<u-progress-bar value="10"></u-progress-bar>');
    (document.querySelector('u-progress-bar') as HTMLElement & { value: number }).value = 70;
    await sleep(50);
    expect((await nodes('progressbar'))[0]?.props.valuenow).toBe(70);
  });

  it('u-progress-ring too', async () => {
    await mount('<u-progress-ring value="75" max="200"></u-progress-ring>');
    expect((await nodes('progressbar'))[0]?.props).toMatchObject({ valuenow: 75, valuemax: 200 });
  });

  it('u-spinner is named — its text, or the locale word', async () => {
    await mount('<u-spinner>Saving changes</u-spinner>');
    expect((await nodes('progressbar'))[0]?.name).toBe('Saving changes');
    Locale.set('ko');
    await mount('<u-spinner></u-spinner>');
    expect((await nodes('progressbar'))[0]?.name).toBe('로딩 중');
  });

  it('a spinner\'s visible text is read once — as the name, not again as text', async () => {
    await mount('<u-spinner>Saving changes</u-spinner>');
    const texts = (await axTree()).filter((n) => !n.ignored && n.role?.value === 'StaticText' && n.name?.value === 'Saving changes');
    expect(texts).toHaveLength(0);
  });
});

describe('rating', () => {
  it('each star is a named radio', async () => {
    await mount('<u-rating name="score" value="3" label="Score"></u-rating>');
    const radios = await nodes('radio');
    expect(radios.map((r) => r.name)).toEqual(['1', '2', '3', '4', '5']);
    expect(radios[2].props.checked).toBe('true');
  });
});

describe('icon button', () => {
  it('the tooltip text names it', async () => {
    await mount('<u-icon-button lib="internal" name="x">Delete</u-icon-button>');
    expect((await nodes('button'))[0]?.name).toBe('Delete');
  });

  it('NEGATIVE — an aria-label wins', async () => {
    await mount('<u-icon-button lib="internal" name="x" aria-label="Remove row">Delete</u-icon-button>');
    expect((await nodes('button'))[0]?.name).toBe('Remove row');
  });
});

describe('tree', () => {
  // `selectable`/`checkable` are set on the tree, which hands them to its items.
  it('levels, own names and states', async () => {
    await mount(`<u-tree selectable><u-tree-item value="r" expanded>Root
      <u-tree-item value="c">Child</u-tree-item></u-tree-item><u-tree-item value="leaf">Leaf</u-tree-item></u-tree>`);
    await sleep(100);
    const items = await nodes('treeitem');
    const by = (n: string) => items.find((i) => i.name === n);
    expect(items.map((i) => i.name).sort()).toEqual(['Child', 'Leaf', 'Root']);
    expect(by('Root')?.props).toMatchObject({ level: 1, expanded: true, selected: false });
    expect(by('Child')?.props.level).toBe(2);
    expect(by('Leaf')?.props.expanded).toBeUndefined();
  });

  it('a checkable item reports checked', async () => {
    await mount('<u-tree checkable><u-tree-item value="a">Alpha</u-tree-item></u-tree>');
    await sleep(50);
    expect((await nodes('treeitem'))[0]?.props.checked).toBe('false');
  });
});
