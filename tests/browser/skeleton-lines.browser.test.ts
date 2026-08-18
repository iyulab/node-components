import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/skeleton/USkeleton.js';

/**
 * `u-skeleton[lines]` — **a multi-line placeholder**.
 *
 * A consumer draft (`lob-layout-primitives` R6) asked for "list/card skeleton presets", and
 * measuring found **12 call sites across 2 files** in this monorepo already hand-repeating
 * bars that differ only in width (`UElementBlock` 8 lines · `UTableBlock` 4 lines).
 *
 * ⚠**Not changing the default (single-bar) look is this change's contract** — without
 * `lines`, it must render exactly as before. So the «single bar» case is measured alongside
 * it (regression guard).
 */

const mount = async (attrs: Record<string, string>) => {
  const el = document.createElement('u-skeleton') as HTMLElement & { updateComplete: Promise<unknown> };
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('u-skeleton[lines]', () => {
  it('lines=3 renders 3 bars, with the last one short', async () => {
    const el = await mount({ lines: '3', width: '300px' });
    const bars = [...el.shadowRoot!.querySelectorAll<HTMLElement>('.line')];

    expect(bars).toHaveLength(3);
    const widths = bars.map(b => b.getBoundingClientRect().width);
    expect(widths[0]).toBeCloseTo(widths[1], 0);
    expect(widths[2]).toBeLessThan(widths[0]);
  });

  it('🔴without lines, renders exactly as before — the host itself is the bar', async () => {
    const el = await mount({ width: '200px', height: '1em' });

    expect(el.shadowRoot!.querySelectorAll('.line')).toHaveLength(0);
    const bg = getComputedStyle(el).backgroundColor;
    expect(bg).not.toBe('rgba(0, 0, 0, 0)'); // the background is actually painted
    expect(el.getBoundingClientRect().width).toBeCloseTo(200, 0);
  });

  it('lines=1 is not treated as multi-line (boundary case)', async () => {
    const el = await mount({ lines: '1' });
    expect(el.shadowRoot!.querySelectorAll('.line')).toHaveLength(0);
  });

  it('reduce still stops the decoration in the multi-line case (read via CSSOM)', async () => {
    const el = await mount({ lines: '3', effect: 'shimmer' });
    const stopped = [...(el.shadowRoot!.adoptedStyleSheets ?? [])]
      .flatMap(s => [...s.cssRules])
      .filter((r): r is CSSMediaRule =>
        r instanceof CSSMediaRule && r.conditionText.includes('prefers-reduced-motion'))
      .flatMap(m => [...m.cssRules]) as CSSStyleRule[];

    // ⚠Don't search for `animation: none` literally — Chromium expands the shorthand
    //   and serializes it as `animation: auto ease 0s 1 normal none running none`
    //   (measured). Read the longhand (`animation-name`) instead.
    expect(
      stopped.some(r => r.selectorText.includes('.line') && r.style.animationName === 'none'),
    ).toBe(true);
  });
});
