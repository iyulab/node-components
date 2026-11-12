import { describe, it, expect, afterEach } from 'vitest';
import { page } from 'vitest/browser';
import '../../src/index.js';

/**
 * A number is text whose direction is fixed: the sign stands left of the digits («-1234.5»), the decimal point between them.
 * The inner input of `type="number"` is a `type=text` (so the browser's own number handling does not apply), and in a
 * right-to-left page it took the page as its paragraph direction — the weak «-» went to the line end and read «1234.5-».
 * The input is left-to-right; only its alignment follows the page (the digits stay at the page's start edge).
 *
 * The oracle is pixels: the first run of ink at the left of the field's text is the sign (a thin bar, a few pixels tall) when the
 * sign stands first, and a digit (tall) when it jumped to the end. The text lives in a native input, so no Range can measure it.
 */
let host: HTMLElement;
afterEach(() => host?.remove());

async function shot() {
  const raw = (await page.screenshot({ save: false, base64: true } as never)) as unknown as { base64: string } | string;
  const base64 = typeof raw === 'string' ? raw : raw.base64;
  const img = new Image();
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error('screenshot did not decode'));
    img.src = `data:image/png;base64,${base64}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, img.width, img.height).data, width: img.width, scale: img.width / window.innerWidth };
}

async function mount(dir: 'ltr' | 'rtl', value: string) {
  host = document.createElement('div');
  host.setAttribute('dir', dir);
  host.style.cssText = 'position:fixed;top:0;left:0;width:300px;padding:8px;background:#fff';
  host.innerHTML = `<u-input type="number" value="${value}" style="width:280px"></u-input>`;
  document.body.appendChild(host);
  const el = host.firstElementChild as HTMLElement & { updateComplete: Promise<unknown> };
  await el.updateComplete;
  await new Promise((r) => setTimeout(r, 80));
  return el;
}

/** Ink (dark text pixels) inside the inner input's box: where it begins and ends, and how tall the leftmost column is. */
async function ink(el: HTMLElement) {
  const input = el.shadowRoot!.querySelector('input')!;
  const box = input.getBoundingClientRect();
  const a = await shot();
  const s = a.scale;
  const x0 = Math.ceil(box.left * s) + 2;
  const x1 = Math.floor(box.right * s) - 2;
  const y0 = Math.ceil(box.top * s);
  const y1 = Math.floor(box.bottom * s);
  const dark = (x: number, y: number) => {
    const i = (y * a.width + x) * 4;
    return a.data[i] + a.data[i + 1] + a.data[i + 2] < 3 * 140;
  };
  const colHeight = (x: number) => {
    let n = 0;
    for (let y = y0; y < y1; y++) if (dark(x, y)) n++;
    return n;
  };
  // the first run of ink columns (up to the first blank column): its vertical extent says whether it is the sign
  let left = -1;
  let right = -1;
  let runEnd = -1;
  for (let x = x0; x < x1; x++) {
    if (colHeight(x) > 0) {
      if (left < 0) left = x;
      right = x;
    } else if (left >= 0 && runEnd < 0) {
      runEnd = x;
    }
  }
  if (runEnd < 0) runEnd = right + 1;
  let top = y1;
  let bottom = y0;
  if (left >= 0) {
    for (let x = left; x < runEnd; x++) for (let y = y0; y < y1; y++) if (dark(x, y)) { top = Math.min(top, y); bottom = Math.max(bottom, y); }
  }
  const leftHeight = left < 0 ? 0 : bottom - top + 1;
  return { left, right, leftHeight, boxLeft: x0, boxRight: x1, scale: s };
}

describe('components — u-input type=number direction', () => {
  it('a right-to-left page: the sign stands first, left of the digits', async () => {
    const el = await mount('rtl', '-1234.5');
    const m = await ink(el);
    expect(m.left).toBeGreaterThan(0);
    // the sign is a thin bar (a hyphen is ~1-2 css px tall); a digit is much taller
    expect(m.leftHeight, `the first ink run is ${m.leftHeight}px tall (a digit, so the sign moved to the end)`).toBeLessThanOrEqual(3 * m.scale);
  });

  it('a right-to-left page: the digits stay at the page start edge (right) — alignment follows the page', async () => {
    const el = await mount('rtl', '-1234.5');
    const m = await ink(el);
    const mid = (m.boxLeft + m.boxRight) / 2;
    expect(m.right).toBeGreaterThan(mid);
    expect(m.left).toBeGreaterThan(mid - (m.boxRight - m.boxLeft) / 4);
  });

  it('a left-to-right page is unchanged: sign first, digits at the left edge', async () => {
    const el = await mount('ltr', '-1234.5');
    const m = await ink(el);
    expect(m.leftHeight).toBeLessThanOrEqual(3 * m.scale);
    const mid = (m.boxLeft + m.boxRight) / 2;
    expect(m.right).toBeLessThan(mid);
  });
});
