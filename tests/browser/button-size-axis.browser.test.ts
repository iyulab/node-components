import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/button/UButton.js';

/**
 * **Acceptance criteria for the size axis** — this pins *relationships*, not taste values.
 *
 * Hard-coding values means every design tweak has to update the test too, at which point
 * the test guards nothing. What's guarded here is three things:
 *
 *   ⑴ an icon button and a text button at the same size have the **same height** (toolbar alignment)
 *   ⑵ inline padding is **wider** than block padding (text doesn't touch the border)
 *   ⑶ the size axis moves on **font-size alone** (padding/height follow proportionally)
 */
const SIZES = ['sm', '', 'lg'] as const;

const mount = async (attrs: Record<string, string>, html: string) => {
  const el = document.createElement('u-button');
  for (const [k, v] of Object.entries(attrs)) if (v) el.setAttribute(k, v);
  el.innerHTML = html;
  document.body.append(el);
  await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  return el;
};

const ICON = '<span style="width:16px;height:16px;display:block"></span>';

describe('u-button size axis', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
  });
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('★an icon button and a text button at the same size have the same height', async () => {
    // Before 1.20.0 these diverged — measured md icon 32 vs text 37 (5px). And the icon
    // side's steps (30/32/34) had a different slope than the text side's (32/37/42), so
    // the gap widened as size went up.
    const diffs: Record<string, number> = {};
    for (const size of SIZES) {
      const text = await mount({ size }, 'Save');
      const icon = await mount({ size }, ICON);
      diffs[size || 'md'] = Math.round(
        icon.getBoundingClientRect().height - text.getBoundingClientRect().height,
      );
    }
    expect(diffs, 'height diff between icon and text buttons (px)').toEqual({ sm: 0, md: 0, lg: 0 });
  });

  it('★inline padding is wider than block padding', async () => {
    for (const size of SIZES) {
      const el = await mount({ size }, 'Save');
      const cs = getComputedStyle(el.shadowRoot!.querySelector('button')!);
      const [block, inline] = [parseFloat(cs.paddingTop), parseFloat(cs.paddingLeft)];
      expect(inline, `size=${size || 'md'} inline padding (${inline}) is not greater than block (${block})`)
        .toBeGreaterThan(block);
    }
  });

  it('the size axis moves on font-size alone (padding/height scale proportionally)', async () => {
    // sm→md→lg is 12→14→16px, so if the em-derivation holds, padding grows at the same ratio.
    const pad: number[] = [];
    const height: number[] = [];
    for (const size of SIZES) {
      const el = await mount({ size }, 'Save');
      pad.push(parseFloat(getComputedStyle(el.shadowRoot!.querySelector('button')!).paddingLeft));
      height.push(el.getBoundingClientRect().height);
    }
    expect(pad[0] < pad[1] && pad[1] < pad[2], `padding does not increase monotonically: ${pad}`).toBe(true);
    expect(height[0] < height[1] && height[1] < height[2], `height does not increase monotonically: ${height}`)
      .toBe(true);
    // padding ratio = font-size ratio (direct evidence of em-derivation). Round to absorb float error.
    expect((pad[2] / pad[0]).toFixed(2), 'padding ratio differs from the font-size ratio (16/12)')
      .toBe((16 / 12).toFixed(2));
  });

  it('overriding block padding still moves icon and text height together', async () => {
    // If the min-height were a constant, this is where it would diverge — it's a derived
    // formula, so they move together.
    const text = await mount({ style: '--btn-padding-block: 1em' }, 'Save');
    const icon = await mount({ style: '--btn-padding-block: 1em' }, ICON);
    expect(
      Math.round(icon.getBoundingClientRect().height - text.getBoundingClientRect().height),
    ).toBe(0);
  });
});
