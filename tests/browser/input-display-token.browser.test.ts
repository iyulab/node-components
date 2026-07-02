import { describe, it, expect } from 'vitest';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

describe('UInput --u-input-display token', () => {
  it('defaults to inline-block (unchanged default behavior)', async () => {
    const el = document.createElement('u-input') as UInput;
    document.body.appendChild(el);
    await el.updateComplete;

    expect(getComputedStyle(el).display).toBe('inline-block');
    document.body.removeChild(el);
  });

  it('respects --u-input-display when set by a consumer', async () => {
    const el = document.createElement('u-input') as UInput;
    el.style.setProperty('--u-input-display', 'block');
    document.body.appendChild(el);
    await el.updateComplete;

    expect(getComputedStyle(el).display).toBe('block');
    document.body.removeChild(el);
  });
});
