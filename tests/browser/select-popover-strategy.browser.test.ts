import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/popover/UPopover.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

describe('USelect popover positioning strategy', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('defaults its internal popover to strategy="fixed" so it escapes overflow:auto ancestor clipping', async () => {
    const select = document.createElement('u-select') as USelect;
    const option = document.createElement('u-option');
    option.setAttribute('value', 'a');
    option.textContent = 'Option A';
    select.appendChild(option);
    document.body.appendChild(select);
    await select.updateComplete;

    const popover = select.shadowRoot!.querySelector('u-popover') as UPopover;
    expect(popover).toBeTruthy();
    expect(popover.strategy).toBe('fixed');
    expect(getComputedStyle(popover).position).toBe('fixed');
  });

  it('UFloatingElement reflects the strategy property to the host attribute (not just the reverse)', async () => {
    const popover = document.createElement('u-popover') as UPopover;
    document.body.appendChild(popover);
    await popover.updateComplete;

    popover.strategy = 'fixed';
    await popover.updateComplete;

    // Before the fix, `strategy` lacked `reflect: true`: setting the JS property
    // never updated the host attribute, so `:host([strategy="fixed"])` CSS never matched.
    expect(popover.getAttribute('strategy')).toBe('fixed');
  });
});
