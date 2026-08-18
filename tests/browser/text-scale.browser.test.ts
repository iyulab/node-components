import { describe, it, expect, beforeAll, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import '../../src/assets/styles/light.css';
import '../../src/components/text/UText.js';

/**
 * **`u-text` acceptance criteria** — this pins *relationships*, not values.
 *
 * This component exists as "the place in markup that uses the sheet's 7-step scale",
 * so what's guarded is not "which size" but ***"does it use the value the sheet states"***.
 * Hard-coding values means every design tweak has to update the test too, at which point
 * the test guards nothing (a cost this repo already paid once, in the `flex-table` fallbacks).
 *
 * Four things are checked:
 *   ⑴ each of the 7 steps reads its **4 sheet properties** as-is (it doesn't become a second definition site)
 *   ⑵ `level` is **read as a heading** — the shadow root's h1~h6, with the slotted text as its name
 *   ⑶ the visual axis and the semantic axis are **independent**
 *   ⑷ `tone` is a **neutral-emphasis axis** (not a role color)
 */

const VARIANTS = ['display', 'title', 'subtitle', 'body', 'label', 'caption', 'overline'] as const;

const tokenOf = (name: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(name).trim();

async function mount(attrs: Record<string, string> = {}, text = '문서 제목') {
  const el = document.createElement('u-text') as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.textContent = text;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const partBase = (el: HTMLElement) => el.shadowRoot!.querySelector('[part="base"]')!;

describe('u-text — semantic typography scale', () => {
  beforeAll(() => {
    expect(tokenOf('--u-text-body-size'), 'this test assumes the token sheet is loaded').not.toBe('');
  });

  afterEach(() => {
    document.body.replaceChildren();
  });

  it('★each of the 7 steps reads its size/weight/leading/tracking from the sheet as-is', async () => {
    for (const variant of VARIANTS) {
      const el = await mount({ variant });
      const cs = getComputedStyle(partBase(el));

      expect(cs.fontSize, `${variant} size`).toBe(tokenOf(`--u-text-${variant}-size`));
      expect(cs.fontWeight, `${variant} weight`).toBe(tokenOf(`--u-text-${variant}-weight`));

      // leading/tracking come out of getComputedStyle as px, so they can't be compared
      // directly against the sheet's multiplier/em values. Instead this checks the
      // **ratio to size** — that's what these tokens actually mean.
      const size = parseFloat(cs.fontSize);
      const leading = parseFloat(tokenOf(`--u-text-${variant}-leading`));
      expect(parseFloat(cs.lineHeight) / size, `${variant} leading`).toBeCloseTo(leading, 2);

      const tracking = tokenOf(`--u-text-${variant}-tracking`);
      const expectedTracking = tracking === '0' ? 0 : parseFloat(tracking) * size;
      const actualTracking = cs.letterSpacing === 'normal' ? 0 : parseFloat(cs.letterSpacing);
      expect(actualTracking, `${variant} tracking`).toBeCloseTo(expectedTracking, 1);

      el.remove();
    }
  });

  it('the steps have distinct sizes in monotonically decreasing order', async () => {
    const sizes: number[] = [];
    for (const variant of VARIANTS) {
      const el = await mount({ variant });
      sizes.push(parseFloat(getComputedStyle(partBase(el)).fontSize));
      el.remove();
    }
    // display > title > subtitle > body > label > caption > overline
    for (let i = 1; i < sizes.length; i++) {
      expect(sizes[i], `${VARIANTS[i]} < ${VARIANTS[i - 1]}`).toBeLessThan(sizes[i - 1]);
    }
  });

  it('defaults to body when no variant is given', async () => {
    const bare = await mount();
    const body = await mount({ variant: 'body' });
    expect(getComputedStyle(partBase(bare)).fontSize)
      .toBe(getComputedStyle(partBase(body)).fontSize);
  });

  it('an unknown variant does not silently lose its font — it falls through to body', async () => {
    const junk = await mount({ variant: 'gigantic' });
    expect(getComputedStyle(partBase(junk)).fontSize).toBe(tokenOf('--u-text-body-size'));
  });

  it('★giving level reads as a heading, with the slotted text as its accessible name', async () => {
    await mount({ level: '2', variant: 'title' }, '설정 요약');
    expect(page.getByRole('heading', { level: 2, name: '설정 요약' }).elements().length).toBe(1);
  });

  it('NEGATIVE — without level it is not a heading (renders as p)', async () => {
    const el = await mount({ variant: 'title' }, '설정 요약');
    expect(page.getByRole('heading').elements().length).toBe(0);
    expect(partBase(el).tagName).toBe('P');
  });

  it('1~6 each read as that heading level', async () => {
    for (const level of [1, 2, 3, 4, 5, 6]) {
      const el = await mount({ level: String(level) }, `제목 ${level}`);
      expect(partBase(el).tagName).toBe(`H${level}`);
      expect(page.getByRole('heading', { level, name: `제목 ${level}` }).elements().length).toBe(1);
      el.remove();
    }
  });

  it('NEGATIVE — an out-of-range level does not create a heading', async () => {
    const el = await mount({ level: '9' }, '범위 밖');
    expect(partBase(el).tagName).toBe('P');
    expect(page.getByRole('heading').elements().length).toBe(0);
  });

  it('★the visual axis and semantic axis are independent — a level-2 heading can be the largest text', async () => {
    const el = await mount({ level: '2', variant: 'display' }, '큰 2단 제목');
    expect(partBase(el).tagName).toBe('H2');
    expect(getComputedStyle(partBase(el)).fontSize).toBe(tokenOf('--u-text-display-size'));
  });

  it('★tone is a neutral-emphasis axis — default/weak/strong/inverse each read a sheet value', async () => {
    const cases: Array<[string, string]> = [
      ['default', '--u-txt-color'],
      ['weak', '--u-txt-color-weak'],
      ['strong', '--u-txt-color-strong'],
      ['inverse', '--u-txt-color-inverse'],
    ];
    const seen = new Set<string>();
    for (const [tone, token] of cases) {
      const el = await mount({ tone });
      const probe = document.createElement('div');
      probe.style.color = `var(${token})`;
      document.body.appendChild(probe);

      const actual = getComputedStyle(partBase(el)).color;
      expect(actual, `tone=${tone}`).toBe(getComputedStyle(probe).color);
      seen.add(actual);
      probe.remove();
      el.remove();
    }
    expect(seen.size, 'the four tones are four distinct colors').toBe(4);
  });

  it('🔴NEGATIVE — no step alters the text a consumer wrote', async () => {
    // There was a temptation to add uppercase to overline, and it was actually added once
    // and then removed. The sheet defines only four properties, so pinning a fifth here
    // would make this component a «second definition site». And it has no effect on CJK
    // text — **the same step would look different depending on language** — which is a
    // defect in a repo that has adopted a locale standard.
    for (const variant of VARIANTS) {
      const el = await mount({ variant }, 'section');
      expect(getComputedStyle(partBase(el)).textTransform, variant).toBe('none');
      el.remove();
    }
  });

  it('is a block element and leaves no UA margin — spacing is the consumer layout\'s call', async () => {
    const el = await mount({ level: '1' });
    expect(getComputedStyle(el).display).toBe('block');
    const cs = getComputedStyle(partBase(el));
    expect([cs.marginTop, cs.marginBottom]).toEqual(['0px', '0px']);
  });
});
