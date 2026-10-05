import { describe, it, expect, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';

/**
 * A press on a part of the calendar that takes no focus (the month title, the weekday row) keeps
 * focus inside the picker. Before, focus fell to `<body>` with the calendar still open: the keyboard
 * lost its place, and a host that ends an edit on `blur` (flex-table's date cell editor) ended it in
 * the middle of choosing. Presses on controls (a day) still take focus as before.
 */
type Picker = HTMLElement & { value?: string; updateComplete: Promise<unknown> };
let el: Picker | undefined;
afterEach(() => el?.remove());

const pause = () => new Promise((r) => setTimeout(r, 150));

async function openCalendar(tag: 'u-date-picker' | 'u-date-range-picker'): Promise<Picker> {
  el = document.createElement(tag) as Picker;
  document.body.appendChild(el);
  await el.updateComplete;
  await userEvent.click(el.shadowRoot!.querySelector<HTMLElement>('[part~="input"]')!);
  await pause();
  expect(el.matches(':state(open)'), 'precondition: calendar open').toBe(true);
  return el;
}

const calendar = (p: Picker) => p.shadowRoot!.querySelector('u-calendar')!.shadowRoot!;

describe('date pickers — a press on the calendar keeps focus in the control', () => {
  for (const tag of ['u-date-picker', 'u-date-range-picker'] as const) {
    it(`${tag}: month title and weekday row`, async () => {
      const p = await openCalendar(tag);
      for (const part of ['calendar-title', 'calendar-weekdays']) {
        await userEvent.click(calendar(p).querySelector<HTMLElement>(`[part~="${part}"]`)!);
        await pause();
        expect(document.activeElement, part).toBe(p);
        expect(p.matches(':state(open)'), part).toBe(true);
      }
    });
  }

  it('a day still takes the press', async () => {
    const p = await openCalendar('u-date-picker');
    const day = calendar(p).querySelector<HTMLElement>('[part~="day"][tabindex="0"]')!;
    await userEvent.click(day);
    await pause();
    expect(p.value).toBe(day.dataset.iso);
  });
});
