import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/auto-scroll/UAutoScroll.js';
import type { UAutoScroll } from '../../src/components/auto-scroll/UAutoScroll.js';

/**
 * `u-auto-scroll` — 손대는 사람이 없는 화면(벽걸이 보드)에서 한 화면보다 긴 목록을 끝까지 보이게 한다.
 * 맨 위에서 멈춤 → 끝까지 굴림 → 끝에서 멈춤 → 맨 위로. 사람이 손을 대면(포인터 · 초점) 비키고, 다시 보이면 처음부터.
 * NEGATIVE: 넘치지 않는 내용은 움직이지 않고 탭 정지도 아니다 · `paused` 면 굴리지 않는다.
 */
describe('u-auto-scroll', () => {
  const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

  beforeEach(async () => {
    document.body.innerHTML = '';
  });

  async function mount(rows: number, attrs = 'speed="600" pause="150"'): Promise<UAutoScroll> {
    // 포인터를 먼저 비켜 둔다 — 붙인 뒤에 옮기면 그 시간이 맨 위의 멈춤을 다 써 버린다.
    document.body.innerHTML = `<button id="away">away</button>`;
    await userEvent.hover(document.getElementById('away')!);
    document.body.insertAdjacentHTML('beforeend',
      `<u-auto-scroll ${attrs} style="height: 200px; width: 300px;">` +
      Array.from({ length: rows }, (_, i) => `<div style="height: 40px">row ${i + 1}</div>`).join('') +
      `</u-auto-scroll>`);
    const el = document.querySelector('u-auto-scroll') as UAutoScroll;
    await el.updateComplete;
    await wait(50);
    return el;
  }

  it('waits at the top, scrolls to the end, waits, and starts over', async () => {
    const el = await mount(20, 'speed="600" pause="300"'); // 600px to travel at 600px/s
    const end = el.scrollHeight - el.clientHeight;
    expect(el.scrollTop).toBe(0);
    await wait(150);
    expect(el.scrollTop).toBe(0); // 맨 위에서 멈춘다
    const seen: number[] = [];
    for (let i = 0; i < 100; i++) { seen.push(el.scrollTop); await wait(30); }
    const reached = seen.findIndex((v) => v >= end - 1);
    expect(reached).toBeGreaterThan(0);
    // 끝에서 멈춘다 — 닿은 뒤 몇 표본은 그대로다.
    expect(seen.slice(reached, reached + 4).every((v) => v >= end - 1)).toBe(true);
    // 그 뒤 맨 위로 돌아온다.
    expect(seen.slice(reached).some((v) => v === 0)).toBe(true);
  });

  it('is a keyboard scroll stop while it overflows', async () => {
    const el = await mount(20);
    expect(el.getAttribute('tabindex')).toBe('0');
  });

  it('NEGATIVE — content that fits does not move and is no tab stop', async () => {
    const el = await mount(3);
    await wait(400);
    expect(el.scrollTop).toBe(0);
    expect(el.hasAttribute('tabindex')).toBe(false);
  });

  it('stands still under the pointer', async () => {
    const el = await mount(20);
    await wait(350);
    await userEvent.hover(el);
    await wait(60);
    const held = el.scrollTop;
    expect(held).toBeGreaterThan(0); // 움직이던 것을 멈췄다 — 처음부터 서 있던 것이 아니다
    await wait(300);
    expect(el.scrollTop).toBe(held);
    await userEvent.hover(document.getElementById('away')!);
    await wait(200);
    expect(el.scrollTop).toBeGreaterThan(held);
  });

  it('NEGATIVE — paused never moves', async () => {
    const el = await mount(20, 'speed="600" pause="0" paused');
    await wait(400);
    expect(el.scrollTop).toBe(0);
  });

  it('starts over from the top when it comes back into view', async () => {
    const el = await mount(20);
    await wait(500);
    expect(el.scrollTop).toBeGreaterThan(0);
    el.style.display = 'none';
    await wait(100);
    el.style.display = 'block';
    await wait(80);
    expect(el.scrollTop).toBe(0);
  });

  it('duration fits the run into a fixed time, whatever the list length', async () => {
    for (const rows of [20, 45]) {
      const el = await mount(rows, 'duration="1600" pause="100"');
      const end = el.scrollHeight - el.clientHeight;
      const start = performance.now();
      while (el.scrollTop < end - 1 && performance.now() - start < 3000) await wait(25);
      const took = performance.now() - start;
      expect(el.scrollTop).toBeGreaterThanOrEqual(end - 1);
      // 멈춤 100 + 굴림 1400 — 프레임 여유를 두고 그 안에 닿는다(목록이 두 배여도 같은 시간).
      expect(took).toBeLessThan(1900);
      expect(took).toBeGreaterThan(1000);
    }
  });

  describe('unattended (벽걸이 화면)', () => {
    it('🔴포인터가 위에 있어도, 눌러서 들어온 초점이 있어도 굴린다', async () => {
      const el = await mount(20, 'speed="600" pause="50" unattended tabindex="0"');
      await userEvent.click(el);
      await userEvent.hover(el);
      await wait(50);
      const at = el.scrollTop; // 기준점은 포인터 · 초점이 들어온 뒤
      await wait(300);
      expect(el.scrollTop).toBeGreaterThan(at);
    });

    it('NEGATIVE: unattended 가 아니면 포인터가 위에 있는 동안 서 있다', async () => {
      const el = await mount(20, 'speed="600" pause="50"');
      await userEvent.hover(el);
      await wait(50);
      const at = el.scrollTop;
      await wait(400);
      expect(el.scrollTop).toBe(at);
    });

    it('🔴키보드 초점으로 멈춘 것은 resume-delay 동안 손대지 않으면 다시 움직인다', async () => {
      const el = await mount(20, 'speed="600" pause="50" unattended resume-delay="300"');
      (document.getElementById('away') as HTMLElement).focus();
      await userEvent.tab();
      expect(document.activeElement).toBe(el);
      await wait(200);
      expect(el.scrollTop).toBe(0);
      await wait(500);
      expect(el.scrollTop).toBeGreaterThan(0);
    });
  });
});
