import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/divider/UDivider.js';

/**
 * Does `u-divider`'s spacing **survive a consumer app's CSS reset**?
 *
 * Background: the other 8 components got reset-resilience by moving their spacing onto an
 * element inside `part="base"`, but `u-divider` was the one left out. The reasoning was:
 * *"`:host`'s margin is **spacing between siblings** — moving it inside would collapse
 * within the host's own box and no longer push siblings apart."*
 *
 * ★ That premise is only true **when moving margin**. Moving it to an inner element's
 *   **padding** instead grows the host's own box, so siblings still get pushed apart as
 *   before — and padding lives on a shadow-internal element, so a document-level reset
 *   can't reach it.
 *
 * This file turns that claim into **evidence**:
 *  - baseline: occupied height/width with no reset (must be identical before/after = no visual change)
 *  - resilience: spacing must survive under `* { margin: 0; padding: 0 }`
 *
 * The resilience case **fails before the change** (that's why this test exists).
 */

const SPACING = 8; // --divider-spacing default

let reset: HTMLStyleElement | null = null;

function applyReset() {
  reset = document.createElement('style');
  // the de facto standard shape in consumer apps (e.g. Tailwind preflight)
  reset.textContent = '* { margin: 0; padding: 0; border: 0; }';
  document.head.appendChild(reset);
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  reset?.remove();
  reset = null;
  document.body.innerHTML = '';
});

/** Puts a divider between two siblings and measures the vertical space it actually occupies. */
async function occupiedHeight(): Promise<number> {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:block; width:200px;';
  wrap.innerHTML = '<div id="a" style="height:10px"></div><u-divider></u-divider><div id="b" style="height:10px"></div>';
  document.body.appendChild(wrap);

  const divider = wrap.querySelector('u-divider') as HTMLElement & { updateComplete: Promise<unknown> };
  await divider.updateComplete;

  const a = wrap.querySelector('#a')!.getBoundingClientRect();
  const b = wrap.querySelector('#b')!.getBoundingClientRect();
  // the empty gap between the two siblings = the vertical space the divider occupies (measured regardless of margin vs. padding)
  return b.top - a.bottom;
}

/** The horizontal space a vertical divider occupies in a row layout. */
async function occupiedWidth(): Promise<number> {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; align-items:center; width:300px;';
  wrap.innerHTML =
    '<div id="a" style="width:10px;height:20px"></div><u-divider vertical></u-divider><div id="b" style="width:10px;height:20px"></div>';
  document.body.appendChild(wrap);

  const divider = wrap.querySelector('u-divider') as HTMLElement & { updateComplete: Promise<unknown> };
  await divider.updateComplete;

  const a = wrap.querySelector('#a')!.getBoundingClientRect();
  const b = wrap.querySelector('#b')!.getBoundingClientRect();
  return b.left - a.right;
}

describe('u-divider spacing', () => {
  it('baseline — horizontal: spaces siblings apart by spacing×2 + line thickness', async () => {
    const h = await occupiedHeight();
    // 8 + 1 + 8 = 17 (1px line thickness). allows for sub-pixel error.
    expect(h).toBeGreaterThanOrEqual(SPACING * 2);
    expect(h).toBeLessThan(SPACING * 2 + 4);
  });

  it('baseline — vertical: spaces siblings apart by spacing×2 + line thickness', async () => {
    const w = await occupiedWidth();
    expect(w).toBeGreaterThanOrEqual(SPACING * 2);
    expect(w).toBeLessThan(SPACING * 2 + 4);
  });

  it('★reset resilience — horizontal: spacing survives under `* { margin:0; padding:0 }`', async () => {
    applyReset();
    const h = await occupiedHeight();
    expect(h).toBeGreaterThanOrEqual(SPACING * 2);
  });

  it('★reset resilience — vertical: spacing survives under `* { margin:0; padding:0 }`', async () => {
    applyReset();
    const w = await occupiedWidth();
    expect(w).toBeGreaterThanOrEqual(SPACING * 2);
  });

  it('consumer hook — a `--divider-spacing` override works even under a reset', async () => {
    applyReset();
    const style = document.createElement('style');
    style.textContent = 'u-divider { --divider-spacing: 20px; }';
    document.head.appendChild(style);
    const h = await occupiedHeight();
    style.remove();
    expect(h).toBeGreaterThanOrEqual(40);
  });
});
