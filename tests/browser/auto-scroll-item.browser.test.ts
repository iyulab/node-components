import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/auto-scroll/UAutoScroll.js';
import type { UAutoScroll } from '../../src/components/auto-scroll/UAutoScroll.js';

/**
 * `u-auto-scroll mode="item"` — 흐르지 않고 한 항목씩 넘긴다: 다음 항목의 윗변에서 멈추고 `pause` 만큼 머문다. 멀리서 읽는
 * 보드에서 읽히는 것은 멈춘 동안이다. 꽂힌 요소가 목록 하나면 그 자식들이 항목이다.
 * NEGATIVE: 기본(`continuous`)은 항목 경계와 무관한 위치들을 지난다.
 */
describe('u-auto-scroll item mode', () => {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));
  beforeEach(() => { document.body.innerHTML = ''; });

  async function mount(attrs: string, wrapped = false): Promise<UAutoScroll> {
    document.body.innerHTML = `<button id="away">away</button>`;
    await userEvent.hover(document.getElementById('away')!);
    const rows = Array.from({ length: 12 }, (_, i) => `<div style="height: 50px">row ${i + 1}</div>`).join('');
    document.body.insertAdjacentHTML('beforeend',
      `<u-auto-scroll ${attrs} style="height: 200px; width: 300px;">${wrapped ? `<section>${rows}</section>` : rows}</u-auto-scroll>`);
    const el = document.querySelector('u-auto-scroll') as UAutoScroll;
    await el.updateComplete;
    await wait(50);
    return el;
  }

  // 멈춘 자리 — 같은 값이 `pause` 의 절반 넘게 이어진 곳. 미끄러짐의 감속 끝은 1px 안에서 100ms 넘게 머물러(반올림한
  // 값이 그대로다) «연달아 셋» 으로 세면 꼬리를 멈춤으로 잘못 센다.
  const PAUSE = 600;
  async function stops(el: UAutoScroll, samples = 160, every = 25): Promise<number[]> {
    const seen: number[] = [];
    for (let i = 0; i < samples; i++) { seen.push(Math.round(el.scrollTop)); await wait(every); }
    const minRun = Math.ceil(PAUSE / 2 / every);
    const held: number[] = [];
    let run = 1;
    for (let i = 1; i < seen.length; i++) {
      run = seen[i] === seen[i - 1] ? run + 1 : 1;
      if (run === minRun && held[held.length - 1] !== seen[i]) held.push(seen[i]);
    }
    return held;
  }

  it('stops on item boundaries, one item at a time', async () => {
    const el = await mount(`mode="item" pause="${PAUSE}"`);
    const held = await stops(el);
    expect(held.length).toBeGreaterThanOrEqual(3);
    for (const top of held) expect(top % 50).toBe(0);
    const forward = held.filter((v) => v > 0);
    // 한 번에 한 항목 — 연이은 멈춤 사이가 항목 하나(50px)다(끝은 남은 거리만큼).
    for (let i = 1; i < forward.length; i++) {
      if (forward[i] > forward[i - 1]) expect(forward[i] - forward[i - 1]).toBe(50);
    }
  });

  it('steps through a wrapping list’s children', async () => {
    const el = await mount(`mode="item" pause="${PAUSE}"`, true);
    const held = (await stops(el)).filter((v) => v > 0);
    expect(held.length).toBeGreaterThanOrEqual(2);
    expect(held[0]).toBe(50);
  });

  it('NEGATIVE: continuous mode passes through positions between item boundaries', async () => {
    const el = await mount('speed="120" pause="100"');
    const seen: number[] = [];
    for (let i = 0; i < 40; i++) { seen.push(Math.round(el.scrollTop)); await wait(25); }
    expect(seen.some((v) => v % 50 !== 0)).toBe(true);
  });
});
