import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/input/UInput.js';
import type { UInput } from '../../src/components/input/UInput.js';

/**
 * 고정 크기 접미 아이콘이 한 줄을 나눌 때 **글자 영역은 0 으로 접히지 않는다** — 좁으면 칸이 호스트 밖으로 넘친다(보이는 실패).
 *
 * 결함: 누름 영역 하한(`--u-target-size`)을 받은 스테퍼 둘이 폭을 다 차지해, 90px 칸의 숫자 입력은 글자 영역 0 — 값도 커서도
 * 보이지 않는 채 정상처럼 그려졌다(소비자 실측: 90px 에서 32·44 모두 0, 110px·44 에서 0).
 */
const mount = async (html: string, target?: string) => {
  document.body.innerHTML = `<div style="${target ? `--u-target-size:${target};` : ''}font-size:14px">${html}</div>`;
  const el = document.querySelector('u-input') as UInput;
  await el.updateComplete;
  await new Promise((r) => requestAnimationFrame(() => r(null)));
  return el;
};
const textWidth = (el: UInput) => el.shadowRoot!.querySelector('input')!.getBoundingClientRect().width;
const chPx = (el: UInput) => {
  const probe = document.createElement('span');
  probe.style.cssText = 'position:absolute;font:inherit;visibility:hidden';
  probe.textContent = '0000';
  el.shadowRoot!.querySelector('.container')!.appendChild(probe);
  const w = probe.getBoundingClientRect().width;
  probe.remove();
  return w;
};

describe('u-input 글자 영역 하한', () => {
  beforeEach(() => { document.body.innerHTML = ''; });

  it.each([
    ['90px', '32px'],
    ['90px', '44px'],
    ['110px', '44px'],
  ])('number · 폭 %s · 하한 %s — 글자 영역 ≥ 4ch', async (width, target) => {
    const el = await mount(`<u-input type="number" value="12" style="width:${width}"></u-input>`, target);
    expect(textWidth(el)).toBeGreaterThanOrEqual(chPx(el) - 0.5);
  });

  it('clearable + password 토글도 센다', async () => {
    const el = await mount(`<u-input type="password" clearable value="secret" style="width:60px"></u-input>`, '44px');
    expect(textWidth(el)).toBeGreaterThanOrEqual(chPx(el) - 0.5);
  });

  it('하한 아래면 칸이 호스트 밖으로 넘친다 — 스테퍼는 잘리지 않는다', async () => {
    const el = await mount(`<u-input type="number" value="1" style="width:90px"></u-input>`, '44px');
    const container = el.shadowRoot!.querySelector('.container')!.getBoundingClientRect();
    const plus = el.shadowRoot!.querySelectorAll('.stepper-btn')[1]!.getBoundingClientRect();
    expect(container.width).toBeGreaterThan(90);
    expect(plus.right).toBeLessThanOrEqual(container.right + 1);
  });

  it('NEGATIVE — 기본 폭(지정 없음)은 그대로다: 하한이 묶지 않는다', async () => {
    const el = await mount(`<u-input type="number" value="1"></u-input>`, '44px');
    const container = el.shadowRoot!.querySelector('.container') as HTMLElement;
    const floor = parseFloat(getComputedStyle(container).minInlineSize);
    expect(container.getBoundingClientRect().width).toBeGreaterThan(floor + 20);
  });

  it('NEGATIVE — 넓은 칸은 영향 없음', async () => {
    const el = await mount(`<u-input type="number" value="1" style="width:300px"></u-input>`, '44px');
    expect(el.shadowRoot!.querySelector('.container')!.getBoundingClientRect().width).toBeCloseTo(300, 0);
  });
});
