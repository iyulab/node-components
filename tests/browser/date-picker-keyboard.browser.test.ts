import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/date-picker/UDatePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';

async function settle(el: UDatePicker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
}

function createDatePicker(attrs: Record<string, string> = {}): UDatePicker {
  const el = document.createElement('u-date-picker') as UDatePicker;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  return el;
}

async function openWithFocus(el: UDatePicker): Promise<HTMLButtonElement> {
  const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
  container.click();
  await settle(el);
  return el.shadowRoot!.activeElement as HTMLButtonElement;
}

describe('UDatePicker — keyboard navigation', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('opening focuses the cell for the selected date (or today)', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);

    const focused = await openWithFocus(el);
    expect(focused.dataset.iso).toBe('2026-02-15');
  });

  it('ArrowRight moves a day, ArrowDown moves a week', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);
    const day15 = await openWithFocus(el);

    day15.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    let focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-16');

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-23');
  });

  it('crossing a month boundary flips the calendar to the next/previous month', async () => {
    const el = createDatePicker({ value: '2026-02-27' });
    document.body.appendChild(el);
    await settle(el);
    let focused = await openWithFocus(el);

    // starting from 2026-02-27 (Fri), advance a day at a time past the last day of Feb (28) into March
    for (let i = 0; i < 2; i++) {
      focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
      await settle(el);
      focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    }
    expect(focused.dataset.iso).toBe('2026-03-01');
    expect(el.shadowRoot!.querySelector('.calendar-title')!.textContent).toContain('March');
  });

  it('Home/End move to the start/end of that week', async () => {
    const el = createDatePicker({ value: '2026-02-18' }); // Wednesday
    document.body.appendChild(el);
    await settle(el);
    let focused = await openWithFocus(el);

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Home', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-15'); // that week's Sunday

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'End', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-21'); // that week's Saturday
  });

  it('Enter selects the focused date and closes the popover', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);
    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    let focused = await openWithFocus(el);
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle(el);

    expect(el.value).toBe('2026-02-16');
    expect(changeCount).toBe(1);
    expect(el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open')).toBe(false);
  });

  it('Escape closes the popover and returns focus to the trigger', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);
    const focused = await openWithFocus(el);

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true, composed: true }));
    await settle(el);

    expect(el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open')).toBe(false);
    expect(el.shadowRoot!.activeElement).toBe(el.shadowRoot!.querySelector('.container'));
  });

  it('pressing Enter on an out-of-range date does not select it', async () => {
    const el = createDatePicker({ value: '2026-02-15', min: '2026-02-10', max: '2026-02-16' });
    document.body.appendChild(el);
    await settle(el);
    let focused = await openWithFocus(el);

    // move to 2026-02-16 (max)
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-16');

    // one more — focus moves out of range (2026-02-17), but it's disabled
    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'ArrowRight', bubbles: true, composed: true }));
    await settle(el);
    focused = el.shadowRoot!.activeElement as HTMLButtonElement;
    expect(focused.dataset.iso).toBe('2026-02-17');
    expect(focused.getAttribute('aria-disabled')).toBe('true');

    focused.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true, composed: true }));
    await settle(el);
    expect(el.value).toBe('2026-02-15'); // unchanged
  });

  it('clicking the header\'s "next month" button does not move focus into the grid', async () => {
    const el = createDatePicker({ value: '2026-02-15' });
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    // u-icon-button itself carries no tabindex (no delegatesFocus) — the truly focusable
    // node is the native <button> two shadow boundaries down (u-icon-button > u-button > button).
    const iconButton = el.shadowRoot!.querySelector('u-icon-button[aria-label="Next month"]') as HTMLElement;
    const innerButton = iconButton.shadowRoot!.querySelector('u-button') as HTMLElement;
    const nativeButton = innerButton.shadowRoot!.querySelector('button') as HTMLButtonElement;

    nativeButton.focus();
    nativeButton.click();
    await settle(el);

    expect(el.shadowRoot!.querySelector('.calendar-title')!.textContent).toContain('March');
    // Focus should stay on the header button — not get yanked into the day grid.
    expect(el.shadowRoot!.activeElement).toBe(iconButton);
  });
});
