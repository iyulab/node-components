import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/calendar/UCalendar.js';
import type { UCalendar, CalendarRangeSelectDetail } from '../../src/components/calendar/UCalendar.js';

/**
 * 내부 달력의 범위 선택 — 두 번 고르기, 미리 표시, 순서 보정, Escape 로 반쯤 고른 범위 버리기.
 * 날짜 범위 피커가 이 위에 선다.
 */

async function mount(attrs: Record<string, string> = {}): Promise<UCalendar> {
  document.body.innerHTML = '';
  const el = document.createElement('u-calendar') as UCalendar;
  el.selection = 'range';
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  document.body.appendChild(el);
  el.showDate('2026-03-10');
  await el.updateComplete;
  return el;
}

const day = (el: UCalendar, iso: string) =>
  el.shadowRoot!.querySelector(`button.day[data-iso="${iso}"]`) as HTMLButtonElement;

const flagged = (el: UCalendar, attr: string) =>
  Array.from(el.shadowRoot!.querySelectorAll(`button.day[${attr}]`)).map(b => (b as HTMLElement).dataset.iso);

function captureRanges(el: UCalendar): CalendarRangeSelectDetail[] {
  const got: CalendarRangeSelectDetail[] = [];
  el.addEventListener('range-select', e => got.push((e as CustomEvent<CalendarRangeSelectDetail>).detail));
  return got;
}

describe('u-calendar — 범위 선택', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it('두 번째 날을 고를 때에만 range-select 가 난다', async () => {
    const el = await mount();
    const got = captureRanges(el);
    day(el, '2026-03-05').click();
    await el.updateComplete;
    expect(got).toEqual([]);
    day(el, '2026-03-12').click();
    await el.updateComplete;
    expect(got).toEqual([{ start: '2026-03-05', end: '2026-03-12' }]);
  });

  it('🔴두 번째 날이 앞서면 그것이 시작이 된다 — 뒤집힌 범위는 만들어지지 않는다', async () => {
    const el = await mount();
    const got = captureRanges(el);
    day(el, '2026-03-20').click();
    await el.updateComplete;
    day(el, '2026-03-04').click();
    await el.updateComplete;
    expect(got).toEqual([{ start: '2026-03-04', end: '2026-03-20' }]);
  });

  it('같은 날을 두 번 고르면 하루짜리 범위다', async () => {
    const el = await mount();
    const got = captureRanges(el);
    day(el, '2026-03-09').click();
    await el.updateComplete;
    day(el, '2026-03-09').click();
    await el.updateComplete;
    expect(got).toEqual([{ start: '2026-03-09', end: '2026-03-09' }]);
  });

  it('범위 밖(min/max) 날은 앵커가 될 수 없다', async () => {
    const el = await mount({ min: '2026-03-10' });
    const got = captureRanges(el);
    day(el, '2026-03-05').click();
    day(el, '2026-03-12').click();
    day(el, '2026-03-14').click();
    await el.updateComplete;
    expect(got).toEqual([{ start: '2026-03-12', end: '2026-03-14' }]);
  });

  it('포인터가 머무는 날까지 미리 표시한다(확정 전 표시)', async () => {
    const el = await mount();
    day(el, '2026-03-05').click();
    await el.updateComplete;
    await userEvent.hover(day(el, '2026-03-08'));
    await el.updateComplete;
    expect(flagged(el, 'data-preview')).toEqual(['2026-03-05', '2026-03-06', '2026-03-07', '2026-03-08']);
    expect(flagged(el, 'data-range-start')).toEqual(['2026-03-05']);
    expect(flagged(el, 'data-range-end')).toEqual(['2026-03-08']);
    // 앵커만 «선택됨» 이다 — 미리 표시는 선택이 아니다.
    expect(flagged(el, 'aria-selected="true"')).toEqual(['2026-03-05']);
  });

  it('키보드: Enter 로 앵커, 화살표로 미리 표시, Enter 로 확정', async () => {
    const el = await mount();
    const got = captureRanges(el);
    await el.focusDay();
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    await userEvent.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    await el.updateComplete;
    expect(flagged(el, 'data-range-end')).toEqual(['2026-03-19']);
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(got).toEqual([{ start: '2026-03-10', end: '2026-03-19' }]);
  });

  it('🔴앵커가 있을 때 Escape 는 앵커만 지우고 바깥으로 가지 않는다 — 다음 Escape 는 간다', async () => {
    const el = await mount();
    const escapes: string[] = [];
    el.addEventListener('keydown', e => { if (e.key === 'Escape') escapes.push('host'); });
    await el.focusDay();
    await userEvent.keyboard('{Enter}');
    await el.updateComplete;
    expect(flagged(el, 'aria-selected="true"')).toEqual(['2026-03-10']);

    await userEvent.keyboard('{Escape}');
    await el.updateComplete;
    expect(escapes).toEqual([]);
    expect(flagged(el, 'aria-selected="true"')).toEqual([]);

    await userEvent.keyboard('{Escape}');
    expect(escapes).toEqual(['host']);
  });

  it('선택된 범위(start/end)를 그린다 — 안쪽은 띠, 양 끝은 선택 원, 격자는 다중 선택', async () => {
    const el = await mount();
    el.start = '2026-03-03';
    el.end = '2026-03-06';
    await el.updateComplete;
    expect(flagged(el, 'aria-selected="true"')).toEqual(['2026-03-03', '2026-03-04', '2026-03-05', '2026-03-06']);
    expect(flagged(el, 'data-range-start')).toEqual(['2026-03-03']);
    expect(flagged(el, 'data-range-end')).toEqual(['2026-03-06']);
    expect(el.shadowRoot!.querySelector('.calendar-grid')!.getAttribute('aria-multiselectable')).toBe('true');

    // 안쪽 날의 글자는 본문 색 — 선택 원의 흰 글자가 연한 띠 위에 그려지면 읽히지 않는다.
    const inner = getComputedStyle(day(el, '2026-03-04'));
    const edge = getComputedStyle(day(el, '2026-03-03'));
    expect(inner.color).not.toBe(edge.color);
    expect(inner.backgroundColor).not.toBe(edge.backgroundColor);
    expect(inner.borderTopLeftRadius).toBe('0px');
  });

  it('두 달 보기: 첫 달에서 둘째 달로 키보드로 넘어가도 창이 밀리지 않는다', async () => {
    const el = await mount({ 'visible-months': '2' });
    await el.focusDay();
    const titles = () => Array.from(el.shadowRoot!.querySelectorAll('.calendar-title')).map(t => t.textContent);
    const before = titles();
    for (let i = 0; i < 4; i++) await userEvent.keyboard('{ArrowDown}');
    await el.updateComplete;
    expect((el.shadowRoot!.activeElement as HTMLElement).dataset.iso).toBe('2026-04-07');
    expect(titles()).toEqual(before);
  });

  it('⚪NEGATIVE — selection="single" 은 종전대로 한 번에 day-select 를 낸다', async () => {
    const el = await mount();
    el.selection = 'single';
    await el.updateComplete;
    const days: string[] = [];
    el.addEventListener('day-select', e => days.push((e as CustomEvent<{ date: string }>).detail.date));
    const ranges = captureRanges(el);
    day(el, '2026-03-05').click();
    await el.updateComplete;
    expect(days).toEqual(['2026-03-05']);
    expect(ranges).toEqual([]);
    expect(el.shadowRoot!.querySelector('.calendar-grid')!.hasAttribute('aria-multiselectable')).toBe(false);
  });
});
