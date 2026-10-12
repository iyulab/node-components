import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import '../../src/components/date-picker/UDatePicker.js';
import '../../src/components/date-range-picker/UDateRangePicker.js';
import type { UDatePicker } from '../../src/components/date-picker/UDatePicker.js';
import type { UDateRangePicker } from '../../src/components/date-range-picker/UDateRangePicker.js';
import { Locale } from '../../src/utilities/Locale.js';

// 다른 오프셋으로 쓴 값(서버의 UTC `…Z`)은 «순간» 이다 — 피커는 그 순간을 이 브라우저의 벽시계로
// 보이고, 고쳐 쓰면 같은 규칙으로 로컬 오프셋을 붙인다. 글자만 읽으면 다른 시간대의 숫자가 보이고,
// 고쳐 쓰는 순간 그 숫자에 로컬 오프셋이 붙어 순간이 옮겨진다(서울에서 9시간).

const pad = (n: number) => String(n).padStart(2, '0');
const wallDay = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const wallText = (d: Date) => `${wallDay(d)} ${pad(d.getHours())}:${pad(d.getMinutes())}`;

const INSTANT = new Date('2026-09-06T22:22:34Z');
/** 같은 순간을 «이 브라우저와 다른» 오프셋으로 쓴 값 — 로컬이 UTC 면 서울(+09:00), 아니면 UTC. */
const FOREIGN = INSTANT.getTimezoneOffset() === 0 ? '2026-09-07T07:22:34+09:00' : '2026-09-06T22:22:34Z';

async function settle(el: HTMLElement & { updateComplete: Promise<unknown> }) {
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 0));
  await el.updateComplete;
  const c = el.shadowRoot!.querySelector('u-calendar') as (HTMLElement & { updateComplete?: Promise<unknown> }) | null;
  await c?.updateComplete;
}

const textOf = (el: HTMLElement) => el.shadowRoot!.querySelector<HTMLInputElement>('.text-input')!.value;
const cal = (el: HTMLElement) => el.shadowRoot!.querySelector('u-calendar')!.shadowRoot!;

describe('u-date-picker mode="datetime" — 오프셋 있는 값은 순간이다', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  async function mount(value: string): Promise<UDatePicker> {
    const el = document.createElement('u-date-picker') as UDatePicker;
    el.setAttribute('mode', 'datetime');
    el.value = value;
    document.body.append(el);
    await settle(el);
    return el;
  }

  it('다른 오프셋의 값을 이 브라우저의 벽시계로 보인다', async () => {
    const el = await mount(FOREIGN);
    expect(textOf(el)).toBe(wallText(INSTANT));
  });

  it('날짜만 바꾸면 같은 시각의 다음 날 — 순간이 정확히 그만큼 옮겨진다', async () => {
    const el = await mount(FOREIGN);
    let changes = 0;
    el.addEventListener('change', () => changes++);
    (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
    await settle(el);
    const next = new Date(INSTANT);
    next.setDate(next.getDate() + 1);
    (cal(el).querySelector(`button.day[data-iso="${wallDay(next)}"]`) as HTMLButtonElement).click();
    await settle(el);
    expect(changes).toBe(1);
    expect(new Date(el.value!).getTime()).toBe(next.getTime());
    expect(textOf(el)).toBe(wallText(next));
  });

  it('같은 날을 다시 고르면 바뀐 것이 없다 — `change` 없이 받은 글자 그대로', async () => {
    const el = await mount(FOREIGN);
    let changes = 0;
    el.addEventListener('change', () => changes++);
    (el.shadowRoot!.querySelector('.container') as HTMLElement).click();
    await settle(el);
    (cal(el).querySelector(`button.day[data-iso="${wallDay(INSTANT)}"]`) as HTMLButtonElement).click();
    await settle(el);
    expect(changes).toBe(0);
    expect(el.value).toBe(FOREIGN);
  });
});

describe('u-date-range-picker mode="datetime" — 반쪽마다 순간이다', () => {
  beforeEach(() => { Locale.set('en'); document.body.innerHTML = ''; });
  afterEach(() => { document.body.innerHTML = ''; });

  it('두 반쪽을 이 브라우저의 벽시계로 보이고, 공개 `start`·`end` 는 받은 그대로다', async () => {
    const end = new Date(INSTANT.getTime() + 3 * 3600_000);
    const endForeign = INSTANT.getTimezoneOffset() === 0 ? '2026-09-07T10:22:34+09:00' : '2026-09-07T01:22:34Z';
    document.body.innerHTML = `<u-date-range-picker mode="datetime" value="${FOREIGN}/${endForeign}"></u-date-range-picker>`;
    const el = document.querySelector('u-date-range-picker') as UDateRangePicker;
    await settle(el);
    const shown = textOf(el);
    expect(shown.startsWith(wallText(INSTANT))).toBe(true);
    expect(shown.endsWith(`${pad(end.getHours())}:${pad(end.getMinutes())}`)).toBe(true);
    expect(el.start).toBe(FOREIGN);
    expect(el.end).toBe(endForeign);
  });
});
