import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/button/UButton.js';
import '../../src/components/form/UForm.js';
import '../../src/components/button-group/UButtonGroup.js';

/**
 * Acceptance criteria for the --u-density density switch.
 *
 *   ⑴ with no value set, renders exactly as before (14px) — additive, no regression
 *   ⑵ once set, u-form/u-button-group/a standalone u-button all pick it up as font-size
 *   ⑶ u-button's explicit size=sm/lg values are unaffected by the density switch (a separate axis, by design)
 */
describe('--u-density density switch', () => {
  beforeEach(() => {
    window.scrollTo(0, 0);
  });
  afterEach(() => {
    document.body.replaceChildren();
  });

  const fontSizeOf = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

  it('u-button defaults to 14px when not set', async () => {
    const el = document.createElement('u-button');
    el.textContent = 'Save';
    document.body.append(el);
    await (el as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(el)).toBe(14);
  });

  it('setting --u-density moves the children under u-form along with it', async () => {
    const form = document.createElement('u-form');
    form.setAttribute('style', '--u-density: 13px');
    const btn = document.createElement('u-button');
    btn.textContent = 'Save';
    form.append(btn);
    document.body.append(form);
    await (form as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    await (btn as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(form)).toBe(13);
    // u-button doesn't use font-size: inherit — it reads var(--u-density, 14px) directly on
    // its own :host, so it must see the same custom property independent of u-form's inheritance path.
    expect(fontSizeOf(btn)).toBe(13);
  });

  it('setting --u-density also moves u-button-group along with it', async () => {
    const group = document.createElement('u-button-group');
    group.setAttribute('style', '--u-density: 16px');
    const btn = document.createElement('u-button');
    btn.textContent = 'Save';
    group.append(btn);
    document.body.append(group);
    await (group as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    await (btn as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(group)).toBe(16);
    expect(fontSizeOf(btn)).toBe(16);
  });

  it('an explicit size=sm/lg is unaffected by --u-density (a separate axis)', async () => {
    const wrap = document.createElement('div');
    wrap.setAttribute('style', '--u-density: 20px');
    const sm = document.createElement('u-button');
    sm.setAttribute('size', 'sm');
    sm.textContent = 'Save';
    wrap.append(sm);
    document.body.append(wrap);
    await (sm as unknown as { updateComplete: Promise<unknown> }).updateComplete;
    expect(fontSizeOf(sm)).toBe(12);
  });
});
