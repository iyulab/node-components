import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/slider/USlider.js';
import '../../src/components/select/USelect.js';

/**
 * **A number the library draws itself uses tabular figures.**
 *
 * Scoped to spots *"where a value changes in place"* — a proportional-width number would
 * change width every time its digit count changes there, jittering the surrounding layout.
 * Three spots confirmed by measurement:
 *
 * ```
 * u-slider  [slot="label-aside"]              show-value's value display
 * u-slider  u-tooltip[part="thumb-tooltip"]   changes fastest, during a drag
 * u-select  .count                            `n / m`
 * ```
 *
 * ⚠**Tick labels (`.mark-label`) are out of scope** — their value never changes and each
 * sits center-aligned in its own fixed position, so tabular figures buy nothing there. A
 * consumer's own input (`u-input[type=number]`) is out of scope too (the docs already show
 * a `::part(input)` override example for that).
 *
 * ## Why computed style is measured
 *
 * Measuring width is the intuitive approach, but it's **font-dependent** — if the test
 * environment's fallback font already happens to be tabular, it passes even with no
 * declaration at all (a false positive). The contract guarded here is *"the declaration
 * reaches these three spots"*, and ★**the tooltip reaches it by inheritance across a
 * slot boundary**, so whether that path actually holds is what this test really checks.
 */

const mount = async <T extends HTMLElement>(tag: string, attrs: Record<string, string>) => {
  const el = document.createElement(tag) as T;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.append(el);
  await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
  return el;
};

const numeric = (el: Element | null | undefined) =>
  el ? getComputedStyle(el).fontVariantNumeric : '(no element)';

describe('tabular figures', () => {
  afterEach(() => {
    document.body.replaceChildren();
  });

  it('reaches u-slider\'s value display', async () => {
    const el = await mount('u-slider', { 'show-value': '', value: '7', max: '100' });
    const aside = el.shadowRoot!.querySelector('[slot="label-aside"]');
    expect(aside, 'could not find the show-value display element').toBeTruthy();
    expect(numeric(aside)).toBe('tabular-nums');
  });

  it('★reaches u-slider\'s thumb tooltip via inheritance — a path that crosses a slot', async () => {
    // This assertion is the reason this file exists. The tooltip text is u-tooltip's
    // **slotted content**, so the only path for the declaration to reach it is inheritance,
    // and that path can't be confirmed by eye.
    //
    // ⚠**Must not measure the host** — the `u-tooltip[part="thumb-tooltip"]` rule targets
    //   the host directly, so that assertion would be **true by construction** and pass
    //   regardless of whether the value actually reaches the rendered text. If the tooltip
    //   ever ported its content elsewhere, inheritance would break and this wouldn't catch
    //   it. ⇒ measure **the element wrapping the slot, inside the tooltip's own shadow**.
    const el = await mount('u-slider', { 'show-tooltip': '', value: '7', max: '100' });
    const tip = el.shadowRoot!.querySelector('u-tooltip[part="thumb-tooltip"]');
    expect(tip, 'could not find the thumb tooltip').toBeTruthy();

    const slot = tip!.shadowRoot?.querySelector('slot');
    expect(slot?.parentElement, 'the tooltip does not render via a slot — the inheritance path does not hold').toBeTruthy();
    expect(getComputedStyle(slot!.parentElement!).fontVariantNumeric).toBe('tabular-nums');
  });

  it('reaches u-select\'s count display (`n / m`)', async () => {
    const el = await mount('u-select', { multiple: '', 'max-count': '10' });
    const count = el.shadowRoot!.querySelector('.count');
    expect(count, 'could not find the count display element').toBeTruthy();
    expect(numeric(count)).toBe('tabular-nums');
  });

  it('NEGATIVE — did not spread to tick labels, whose value never changes', async () => {
    // widening the scope is this change's failure mode. Tick labels each sit fixed in their
    // own position, so tabular figures buy nothing there, and spreading to them would turn
    // this into a different rule — "every number is tabular".
    const el = await mount('u-slider', { marks: '', step: '25', max: '100' });
    const label = el.shadowRoot!.querySelector('.mark-label');
    if (label) expect(numeric(label)).not.toBe('tabular-nums');
  });
});
