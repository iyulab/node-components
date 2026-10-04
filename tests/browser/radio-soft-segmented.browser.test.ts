import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/radio/URadio.js';
import '../../src/components/option/UOption.js';
import type { URadio } from '../../src/components/radio/URadio.js';

/**
 * `u-radio type="button" appearance="soft"` — a segmented control: a quiet track, the picked segment
 * rises onto the surface. Measured with computed values; joined-border geometry of the other
 * button appearances must not leak in.
 */
const made: HTMLElement[] = [];
async function group(value = 'b'): Promise<URadio> {
  const el = document.createElement('u-radio') as URadio;
  el.setAttribute('type', 'button');
  el.setAttribute('appearance', 'soft');
  el.setAttribute('orientation', 'horizontal');
  el.innerHTML = '<u-option value="a">A</u-option><u-option value="b">B</u-option><u-option value="c">C</u-option>';
  document.body.appendChild(el);
  made.push(el);
  el.value = value;
  await el.updateComplete;
  await new Promise(r => requestAnimationFrame(r));
  return el;
}
afterEach(() => { while (made.length) made.pop()!.remove(); });

describe('u-radio soft (segmented)', () => {
  it('the track is the raised tint with no outline', async () => {
    const el = await group();
    const track = el.shadowRoot!.querySelector<HTMLElement>('[part="container"], .container')!;
    const cs = getComputedStyle(track);
    expect(cs.borderTopColor).toBe('rgba(0, 0, 0, 0)');
    expect(cs.paddingTop).toBe('2px');
  });

  it('only the picked segment gets the surface and a shadow', async () => {
    const el = await group('b');
    const [a, b] = [...el.querySelectorAll('u-option')];
    const sa = getComputedStyle(a);
    const sb = getComputedStyle(b);
    expect(sb.boxShadow).not.toBe('none');
    expect(sa.boxShadow).toBe('none');
    expect(sb.backgroundColor).not.toBe(sa.backgroundColor);
    expect(sb.fontWeight).toBe('600');
  });

  it('segments keep their own rounded corners — no joined first/last geometry or dividers', async () => {
    const el = await group();
    const [a, b] = [...el.querySelectorAll('u-option')];
    expect(getComputedStyle(a).borderTopRightRadius).toBe(getComputedStyle(a).borderTopLeftRadius);
    expect(getComputedStyle(b).borderRightColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('is still a radio group — the picked segment is aria-checked', async () => {
    const el = await group('c');
    const c = el.querySelectorAll('u-option')[2];
    expect(c.getAttribute('aria-checked')).toBe('true');
  });

  it('🔴every button-type radio group exposes radios, not listbox options (filled too)', async () => {
    const el = document.createElement('u-radio') as URadio;
    el.setAttribute('type', 'button');
    el.innerHTML = '<u-option value="a">A</u-option><u-option value="b">B</u-option>';
    document.body.appendChild(el);
    made.push(el);
    el.value = 'a';
    await el.updateComplete;
    await new Promise(r => requestAnimationFrame(r));
    for (const o of el.querySelectorAll('u-option')) {
      expect(o.getAttribute('role')).toBe('radio');
      expect(o.hasAttribute('aria-selected')).toBe(false);
    }
    expect(el.querySelector('u-option')!.getAttribute('aria-checked')).toBe('true');
  });
});

describe('u-radio soft (segmented) — keyboard focus', () => {
  it('🔴the focused segment shows a ring (borders are transparent and u-option drops its outline)', async () => {
    const { userEvent } = await import('vitest/browser');
    const before = document.createElement('button');
    before.textContent = 'before';
    document.body.appendChild(before);
    made.push(before);
    const el = await group('b');
    before.focus();
    await userEvent.tab();
    const focused = document.activeElement as HTMLElement;
    expect(focused?.tagName).toBe('U-OPTION');
    expect(el.contains(focused)).toBe(true);
    const cs = getComputedStyle(focused);
    expect(cs.outlineStyle).toBe('solid');
    expect(cs.outlineWidth).toBe('2px');
  });
});
