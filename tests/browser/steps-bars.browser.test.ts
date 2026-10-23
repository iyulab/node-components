import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/steps/USteps.js';
import type { USteps } from '../../src/components/steps/USteps.js';
import { Locale } from '../../src/utilities/Locale.js';

/**
 * `u-steps appearance="bars"` — 단계마다 막대가 칸을 고르게 나눠 갖고, 그 아래 이름과 보조 문구(날짜)가 선다. 주문 상세처럼
 * 단계가 일곱이고 단계마다 날짜가 붙는 자리의 모양이다. `skipped` 는 이 건의 경로에 없는 단계(시안 없는 주문의 «시안»)다.
 * NEGATIVE: 기본(`line`)은 종전대로 표식과 연결선이다.
 */
afterEach(() => { document.body.replaceChildren(); Locale.set('en'); });

async function mount(appearance?: string): Promise<USteps> {
  const el = document.createElement('u-steps') as USteps;
  if (appearance) el.setAttribute('appearance', appearance);
  el.style.width = '700px';
  el.items = [
    { label: 'Intake', description: '10/21' },
    { label: 'Proof', description: 'none', status: 'skipped' },
    { label: 'Check', description: '10/21' },
    { label: 'Plate', description: '10/21 batch 50' },
    { label: 'Print' }, { label: 'Foil · pack' }, { label: 'Ship' },
  ];
  el.current = 3;
  document.body.appendChild(el);
  await el.updateComplete;
  return el;
}

const steps = (el: USteps) => [...el.shadowRoot!.querySelectorAll<HTMLElement>('.step')];

describe('u-steps bars', () => {
  it('gives every step an equal column with its bar on top and the text under it', async () => {
    const el = await mount('bars');
    const boxes = steps(el).map((s) => s.getBoundingClientRect());
    const widths = boxes.map((b) => Math.round(b.width));
    expect(Math.max(...widths) - Math.min(...widths)).toBeLessThanOrEqual(1);
    expect(el.shadowRoot!.querySelectorAll('.connector').length).toBe(0);
    const first = steps(el)[0];
    const bar = first.querySelector('.marker')!.getBoundingClientRect();
    const title = first.querySelector('.title')!.getBoundingClientRect();
    expect(Math.round(bar.width)).toBe(Math.round(boxes[0].width));
    expect(bar.height).toBeLessThan(12);
    expect(title.top).toBeGreaterThanOrEqual(bar.bottom);
  });

  it('fills the travelled and current bars, leaves upcoming and skipped empty, and names skipped for assistive tech', async () => {
    const el = await mount('bars');
    const fill = (i: number) => getComputedStyle(steps(el)[i].querySelector('.marker')!).backgroundColor;
    expect(fill(0)).toBe(fill(3));
    expect(fill(4)).toBe(fill(1));
    expect(fill(0)).not.toBe(fill(4));
    expect(steps(el)[3].getAttribute('aria-current')).toBe('step');
    expect(steps(el)[1].querySelector('.sr-only')?.textContent).toBe('Skipped');
  });

  it('NEGATIVE — the default line keeps markers and connectors', async () => {
    const el = await mount();
    expect(el.shadowRoot!.querySelectorAll('.connector').length).toBe(6);
    expect(steps(el)[0].querySelector('.marker svg')).not.toBeNull();
  });
});
