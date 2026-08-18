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

describe('UDatePicker — calendar render + mouse selection', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('starts with the popover closed and no value', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await settle(el);

    expect(el.value).toBeUndefined();
    const popover = el.shadowRoot!.querySelector('u-popover')!;
    expect(popover.hasAttribute('open')).toBe(false);
  });

  it('clicking the trigger opens the popover and shows the grid for the month containing today', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const today = new Date();
    const title = el.shadowRoot!.querySelector('.calendar-title')!.textContent!;
    expect(title).toContain(String(today.getFullYear()));
  });

  it('when a value is set, the trigger shows it in locale format', async () => {
    const el = createDatePicker({ value: '2026-02-24' });
    document.body.appendChild(el);
    await settle(el);

    const text = el.shadowRoot!.querySelector('.text-content')!.textContent!.trim();
    expect(text.length).toBeGreaterThan(0);
    expect(text).not.toBe('');
  });

  it('clicking a date cell sets the value, fires change, and closes the popover', async () => {
    const el = createDatePicker({ value: '2026-02-01' });
    document.body.appendChild(el);
    await settle(el);

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const day15 = el.shadowRoot!.querySelector('button.day[data-iso="2026-02-15"]') as HTMLButtonElement;
    day15.click();
    await settle(el);

    expect(el.value).toBe('2026-02-15');
    expect(changeCount).toBe(1);
    const popover = el.shadowRoot!.querySelector('u-popover')!;
    expect(popover.hasAttribute('open')).toBe(false);
  });

  it('mounting alone does not fire change', async () => {
    const el = createDatePicker({ value: '2026-02-01' });
    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);
    document.body.appendChild(el);
    await settle(el);

    expect(changeCount).toBe(0);
  });

  it('a date cell outside the min/max range is disabled and clicking it does not change the value', async () => {
    const el = createDatePicker({ value: '2026-02-15', min: '2026-02-10', max: '2026-02-20' });
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const outOfRange = el.shadowRoot!.querySelector('button.day[data-iso="2026-02-05"]') as HTMLButtonElement;
    expect(outOfRange.getAttribute('aria-disabled')).toBe('true');

    outOfRange.click();
    await settle(el);
    expect(el.value).toBe('2026-02-15');
  });

  it('the grid has the row layer from the WAI-ARIA Date Picker Dialog pattern — grid > row > gridcell', async () => {
    const el = createDatePicker();
    document.body.appendChild(el);
    await settle(el);

    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    container.click();
    await settle(el);

    const grid = el.shadowRoot!.querySelector('.calendar-grid')!;
    expect(grid.getAttribute('role')).toBe('grid');
    const rows = grid.querySelectorAll(':scope > [role="row"]');
    expect(rows.length).toBeGreaterThan(0);
    for (const row of rows) {
      const directChildren = row.children;
      expect(directChildren.length).toBeGreaterThan(0);
      for (const cell of directChildren) {
        expect(cell.getAttribute('role')).toBe('gridcell');
      }
    }
    const headerCells = el.shadowRoot!.querySelectorAll('.calendar-weekdays [role="columnheader"]');
    expect(headerCells.length).toBe(7);
  });

  it('when clearable, clicking the clear icon empties the value and fires change', async () => {
    const el = createDatePicker({ value: '2026-02-15', clearable: 'true' });
    document.body.appendChild(el);
    await settle(el);

    let changeCount = 0;
    el.addEventListener('change', () => changeCount++);

    const clearIcon = el.shadowRoot!.querySelector('.suffix-item[name="x"]') as HTMLElement;
    clearIcon.click();
    await settle(el);

    expect(el.value).toBeUndefined();
    expect(changeCount).toBe(1);
  });
});
