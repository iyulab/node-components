import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/steps/USteps.js';
import type { USteps, StepItem } from '../../src/components/steps/USteps.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-steps appearance="compact"` — 단계마다 작은 칸 하나와 지금 단계의 이름. 목록 표의 «진행» 칸 · 미리보기 패널처럼
 * 한 줄 높이에 일곱 단계를 넣어야 하는 자리의 모양이다. 화면에서 숨긴 단계 이름은 목록에 남아 보조기기가 읽는다.
 * NEGATIVE: 기본(`line`)에는 요약 이름이 없다.
 */
afterEach(() => { document.body.replaceChildren(); Locale.set('en'); });

const ITEMS: StepItem[] = [
  { label: 'Intake', description: '10/21' }, { label: 'Proof', status: 'skipped' }, { label: 'Check' },
  { label: 'Plate' }, { label: 'Print' }, { label: 'Pack' }, { label: 'Ship' },
];

async function mount(appearance?: string, current: number | null = 3, items = ITEMS, width = '160px'): Promise<USteps> {
  const el = document.createElement('u-steps') as USteps;
  if (appearance) el.setAttribute('appearance', appearance);
  el.style.width = width;
  el.label = 'Order C-1';
  el.items = items;
  el.current = current ?? undefined;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const steps = (el: USteps) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('.step')];
const summary = (el: USteps) => el.shadowRoot!.querySelector<HTMLElement>('[part="summary"]');

describe('u-steps compact', () => {
  it('fits seven steps and the current step’s name on one line inside a narrow cell', async () => {
    const el = await mount('compact');
    const host = el.getBoundingClientRect();
    const markers = steps(el).map((s) => s.querySelector('.marker')!.getBoundingClientRect());
    expect(new Set(markers.map((m) => Math.round(m.top))).size).toBe(1);
    expect(Math.max(...markers.map((m) => m.right))).toBeLessThanOrEqual(host.right);
    expect(host.height).toBeLessThan(28);
    const s = summary(el)!;
    expect(s.textContent).toBe('Plate');
    expect(s.getBoundingClientRect().right).toBeLessThanOrEqual(host.right + 1);
  });

  it('hides the step names from view but keeps them in the list for assistive technology', async () => {
    const el = await mount('compact');
    const title = steps(el)[0].querySelector<HTMLElement>('.title')!;
    expect(title.textContent).toBe('Intake');
    expect(title.getBoundingClientRect().width).toBeLessThanOrEqual(1);
    expect(steps(el)[3].getAttribute('aria-current')).toBe('step');
    expect(summary(el)!.getAttribute('aria-hidden')).toBe('true');
  });

  it('tells done, current, waiting and held steps apart by fill', async () => {
    const items: StepItem[] = [{ label: 'A' }, { label: 'B', status: 'hold' }, { label: 'C' }];
    const el = await mount('compact', null, [{ label: 'A', status: 'complete' }, ...items.slice(1)]);
    const [done, held, waiting] = steps(el).map((s) => getComputedStyle(s.querySelector('.marker')!).backgroundColor);
    expect(new Set([done, held, waiting]).size).toBe(3);
    const cur = await mount('compact', 1, [{ label: 'A' }, { label: 'B' }, { label: 'C' }]);
    const [d, c, w] = steps(cur).map((s) => getComputedStyle(s.querySelector('.marker')!).backgroundColor);
    expect(new Set([d, c, w]).size).toBe(3);
    expect(summary(el)!.textContent).toBe('B');
  });

  it('names the last step passed when there is no current step', async () => {
    const el = await mount('compact', null, [{ label: 'A', status: 'complete' }, { label: 'B', status: 'complete' }, { label: 'C' }]);
    expect(summary(el)!.textContent).toBe('B');
  });

  it('NEGATIVE: the line appearance has no summary', async () => {
    const el = await mount(undefined, 3, ITEMS, '700px');
    expect(summary(el)).toBeNull();
  });
});
