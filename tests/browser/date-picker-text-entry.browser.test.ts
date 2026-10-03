import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/date-picker/UDatePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `mode="date"` 의 텍스트 칸 — 키보드로 날짜를 그대로 친다. 실제 키 입력(`userEvent`)으로 재는
 * 이유: 확정은 Enter 와 칸을 떠날 때(blur)에 걸려 있고, 합성 이벤트로는 포커스 이동이 일어나지 않는다.
 */

async function settle(el: UDatePicker) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 30));
  await el.updateComplete;
}

function mount(attrs: Record<string, string> = {}): UDatePicker {
  const el = document.createElement('u-date-picker') as UDatePicker;
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  el.label = 'Order date';
  document.body.appendChild(el);
  return el;
}

const input = (el: UDatePicker) => el.shadowRoot!.querySelector<HTMLInputElement>('.text-input')!;
const popoverOpen = (el: UDatePicker) => el.shadowRoot!.querySelector('u-popover')!.hasAttribute('open');
const cal = (el: UDatePicker) => el.shadowRoot!.querySelector('u-calendar')!.shadowRoot!;

describe('UDatePicker — 직접 입력(mode="date")', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    Locale.set('en');
  });
  afterEach(() => Locale.set('en'));

  it('친 날짜를 Enter 로 확정한다 — 값은 ISO, change 한 번', async () => {
    const el = mount();
    await settle(el);
    let changes = 0;
    el.addEventListener('change', () => changes++);

    await userEvent.click(input(el));
    await userEvent.keyboard('20261002{Enter}');
    await settle(el);

    expect(el.value).toBe('2026-10-02');
    expect(input(el).value).toBe('2026-10-02');
    expect(changes).toBe(1);
  });

  it('칸을 떠날 때도 확정한다 — 짧은 형태(`10-02`)는 올해', async () => {
    const el = mount();
    await settle(el);

    input(el).focus();
    await userEvent.keyboard('10-02{Tab}');
    await settle(el);

    expect(el.shadowRoot!.activeElement).not.toBe(input(el));

    expect(el.value).toBe(`${new Date().getFullYear()}-10-02`);
  });

  it('클릭은 달력을 열지만 포커스는 텍스트 칸에 남는다 — 이어서 칠 수 있다', async () => {
    const el = mount({ value: '2026-02-15' });
    await settle(el);

    await userEvent.click(input(el));
    await settle(el);

    expect(popoverOpen(el)).toBe(true);
    expect(el.shadowRoot!.activeElement).toBe(input(el));
  });

  it('치는 동안 열린 달력이 그 달로 따라간다', async () => {
    const el = mount({ value: '2026-02-15' });
    await settle(el);
    await userEvent.click(input(el));
    await settle(el);

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2027-07-04');
    await settle(el);

    expect(cal(el).querySelector('.calendar-title')!.textContent).toContain('2027');
    expect(cal(el).querySelector('.calendar-title')!.textContent).toContain('July');
  });

  it('ArrowDown 은 달력을 열고 그 안으로 들어간다', async () => {
    const el = mount({ value: '2026-02-15' });
    await settle(el);
    input(el).focus();

    await userEvent.keyboard('{ArrowDown}');
    await settle(el);

    expect(popoverOpen(el)).toBe(true);
    expect((cal(el).activeElement as HTMLElement | null)?.dataset.iso).toBe('2026-02-15');
  });

  it('날짜가 아닌 텍스트는 값을 비우고 badInput 으로 알린다 — 텍스트는 고칠 수 있게 남는다', async () => {
    const el = mount({ value: '2026-02-15' });
    await settle(el);
    let changes = 0;
    el.addEventListener('change', () => changes++);

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2026-02-30{Enter}');
    await settle(el);

    expect(el.value).toBeUndefined();
    expect(changes).toBe(1);
    expect(input(el).value).toBe('2026-02-30');
    expect(input(el).getAttribute('aria-invalid')).toBe('true');
    expect(el.validity!.badInput).toBe(true);

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2026-02-28{Enter}');
    await settle(el);
    expect(el.value).toBe('2026-02-28');
    expect(el.validity!.valid).toBe(true);
  });

  it('범위 밖 날짜도 친 그대로 받고 rangeUnderflow 로 알린다', async () => {
    const el = mount({ min: '2026-03-01' });
    await settle(el);

    await userEvent.click(input(el));
    await userEvent.keyboard('2026-02-01{Enter}');
    await settle(el);

    expect(el.value).toBe('2026-02-01');
    expect(el.validity!.rangeUnderflow).toBe(true);
  });

  it('format="locale" 은 로케일 숫자 순서로 보이고 그 순서로 읽는다 — ISO 도 읽는다', async () => {
    Locale.set('de');
    const el = mount({ format: 'locale' });
    await settle(el);

    expect(input(el).placeholder).toBe('DD.MM.YYYY');
    await userEvent.click(input(el));
    await userEvent.keyboard('02.10.2026{Enter}');
    await settle(el);
    expect(el.value).toBe('2026-10-02');
    expect(input(el).value).toBe('02.10.2026');

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2026-12-24{Enter}');
    await settle(el);
    expect(el.value).toBe('2026-12-24');
  });

  it('텍스트 칸은 이름 붙은 combobox 다 — 달력 다이얼로그를 가리킨다', async () => {
    const el = mount();
    await settle(el);
    const box = input(el);
    expect(box.getAttribute('role')).toBe('combobox');
    expect(box.getAttribute('aria-haspopup')).toBe('dialog');
    expect(box.getAttribute('aria-controls')).toBe(el.shadowRoot!.querySelector('u-popover')!.id);
    expect(box.getAttribute('aria-label')).toBe('Order date');
  });
  it('mode="datetime" 은 날짜와 시간을 친다 — 날짜만 치면 이미 정한 시간을 유지한다', async () => {
    const el = mount({ mode: 'datetime', value: '2026-02-15T09:30:00+09:00' });
    await settle(el);
    expect(input(el).value).toBe('2026-02-15 09:30');
    expect(input(el).placeholder).toBe('YYYY-MM-DD HH:mm');

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2026-10-02 14:05{Enter}');
    await settle(el);
    expect(el.value!.startsWith('2026-10-02T14:05:00')).toBe(true);
    expect(input(el).value).toBe('2026-10-02 14:05');

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('20261003{Enter}');
    await settle(el);
    expect(el.value!.startsWith('2026-10-03T14:05:00')).toBe(true);

    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2026-10-03 25:00{Enter}');
    await settle(el);
    expect(el.value).toBeUndefined();
    expect(el.validity!.badInput).toBe(true);
  });
  it('치다가 달력에서 날을 고르면 고른 날이 칸에 보인다 — 친 텍스트가 남지 않는다', async () => {
    const el = mount({ value: '2026-02-15' });
    await settle(el);
    await userEvent.tripleClick(input(el));
    await userEvent.keyboard('2026-02-1');
    await settle(el);
    expect(popoverOpen(el)).toBe(true);

    (cal(el).querySelector('button.day[data-iso="2026-02-20"]') as HTMLButtonElement).click();
    await settle(el);

    expect(el.value).toBe('2026-02-20');
    expect(input(el).value).toBe('2026-02-20');
  });
});
