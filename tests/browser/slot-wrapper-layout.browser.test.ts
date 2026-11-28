import { describe, it, expect, afterEach } from 'vitest';
import '../../src/index.js';

/**
 * A component lays out what the app slots into it as the items of its own flex box. A wrapper put around the slot (for
 * instance to isolate the text direction of a label) takes that place unless it is told to behave like the box it sits in:
 * the options of a radio group then stop being the group's items — a horizontal group stacks vertically and the gap between
 * options is gone — and the nodes of a slotted label lose their spacing.
 *
 * The oracle is where the slotted boxes stand on the screen.
 */
let host: HTMLElement;
afterEach(() => host?.remove());

async function mount(markup: string, dir: 'ltr' | 'rtl' = 'ltr') {
  host = document.createElement('div');
  host.setAttribute('dir', dir);
  host.style.cssText = 'width:400px;padding:8px;font-size:16px';
  host.innerHTML = markup;
  document.body.appendChild(host);
  await Promise.all([...host.querySelectorAll('*')].map((e) => (e as { updateComplete?: Promise<unknown> }).updateComplete));
  await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r)));
}

const boxes = (selector: string) => [...host.querySelectorAll(selector)].map((e) => e.getBoundingClientRect());

/** The gap the group's container asks for between its items, in pixels. */
function containerGap(axis: 'row' | 'column'): number {
  const container = host.querySelector('u-radio')!.shadowRoot!.querySelector('.container')!;
  const style = getComputedStyle(container);
  return parseFloat(axis === 'row' ? style.columnGap : style.rowGap) || 0;
}

const radio = (type: string, orientation: string) =>
  `<u-radio type="${type}" orientation="${orientation}" value="a">` +
  '<u-option value="a">Alpha</u-option><u-option value="b">Beta</u-option><u-option value="c">Gamma</u-option></u-radio>';

describe('u-radio — the options are the items of the group', () => {
  for (const dir of ['ltr', 'rtl'] as const) {
    for (const type of ['default', 'button']) {
      it(`🔴${dir} · type="${type}" horizontal: the options stand in one row, in reading order, spaced by the container gap`, async () => {
        await mount(radio(type, 'horizontal'), dir);
        const b = boxes('u-option');
        expect(b.map((r) => Math.round(r.top)), 'one row').toEqual([0, 0, 0].map(() => Math.round(b[0].top)));
        const gap = containerGap('row');
        for (let i = 1; i < b.length; i++) {
          const space = dir === 'ltr' ? b[i].left - b[i - 1].right : b[i - 1].left - b[i].right;
          expect(space, `space before option ${i}`).toBeCloseTo(gap, 0);
        }
      });
    }
  }

  it('🔴type="default" vertical: the container gap separates the options', async () => {
    await mount(radio('default', 'vertical'));
    const b = boxes('u-option');
    const gap = containerGap('column');
    expect(gap, 'the default group asks for a gap').toBeGreaterThan(0);
    for (let i = 1; i < b.length; i++) expect(b[i].top - b[i - 1].bottom, `space before option ${i}`).toBeCloseTo(gap, 0);
  });

  it('NEGATIVE type="button" vertical: the segments stay joined and share one width', async () => {
    await mount(radio('button', 'vertical'));
    const b = boxes('u-option');
    for (let i = 1; i < b.length; i++) expect(b[i].top - b[i - 1].bottom).toBeCloseTo(0, 0);
    expect(new Set(b.map((r) => Math.round(r.width))).size).toBe(1);
  });

  it('🔴an element slotted between the options takes the same gap', async () => {
    await mount('<u-radio><u-option value="a">Alpha</u-option><div id="or">or</div><u-option value="b">Beta</u-option></u-radio>');
    const [first, second] = boxes('u-option');
    const [or] = boxes('#or');
    const gap = containerGap('column');
    expect(or.top - first.bottom).toBeCloseTo(gap, 0);
    expect(second.top - or.bottom).toBeCloseTo(gap, 0);
  });
});

describe('u-breadcrumb-item — an icon and a text in the label keep the item spacing', () => {
  const mark = '<span id="mark" style="display:inline-block;width:10px;height:10px"></span><span id="text">Home</span>';
  for (const [name, item] of [
    ['link', `<u-breadcrumb-item href="#">${mark}</u-breadcrumb-item>`],
    ['current — no link', `<u-breadcrumb-item>${mark}</u-breadcrumb-item>`],
  ]) {
    it(`🔴${name}: the two stand 0.2em apart, centred on one line`, async () => {
      await mount(`<u-breadcrumb>${item}</u-breadcrumb>`);
      const [icon] = boxes('#mark');
      const [text] = boxes('#text');
      const fontSize = parseFloat(getComputedStyle(host.querySelector('#text')!).fontSize);
      expect(text.left - icon.right).toBeCloseTo(0.2 * fontSize, 0);
      expect(Math.abs((icon.top + icon.bottom) / 2 - (text.top + text.bottom) / 2)).toBeLessThanOrEqual(1);
    });
  }
});
