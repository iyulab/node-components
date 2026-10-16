import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/tooltip/UTooltip.js';
import '../../src/components/popover/UPopover.js';
import type { UTooltip } from '../../src/components/tooltip/UTooltip.js';

/**
 * 닫힌 떠 있는 요소는 스크롤 컨테이너의 넘침에 들지 않는다. `visibility: hidden` 인 절대 위치 상자도 넘침에 들어,
 * 한 번도 열리지 않은 툴팁(넓은 내용)이 오른쪽 가장자리 근처 앵커에 붙어 세로 목록에 가로 스크롤바를 만들었다
 * (소비자 실측: 채팅 기록 clientWidth 885 · scrollWidth 1066 — 닫힌 인용 미리보기 셋).
 */
const made: HTMLElement[] = [];
afterEach(() => { while (made.length) made.pop()!.remove(); });

const frames = (n = 2) => new Promise<void>((r) => {
  const step = (k: number) => (k ? requestAnimationFrame(() => step(k - 1)) : r());
  step(n);
});

async function log() {
  const box = document.createElement('div');
  box.style.cssText = 'width: 400px; height: 200px; overflow-y: auto; font: 14px/1.4 sans-serif;';
  box.innerHTML = `
    <p>Some answer text with a citation near the right edge
      <span id="anchor" style="position: relative; display: inline-block; margin-left: 300px;">[1]
        <u-tooltip placement="bottom" offset="4"><span style="display: block; width: 356px;">A wide preview of the cited source</span></u-tooltip>
      </span>
    </p>`;
  document.body.appendChild(box);
  made.push(box);
  const tip = box.querySelector('u-tooltip') as UTooltip;
  await tip.updateComplete;
  await frames();
  return { box, tip, anchor: box.querySelector('#anchor') as HTMLElement };
}

describe('closed floating elements stay out of layout overflow', () => {
  it('🔴a never-opened tooltip adds no horizontal overflow', async () => {
    const { box } = await log();
    expect(box.scrollWidth).toBe(box.clientWidth);
  });

  it('🔴opening places it, closing takes it out again after the fade', async () => {
    const { box, tip, anchor } = await log();
    await tip.show(anchor);
    await tip.updateComplete;
    await frames();
    expect(getComputedStyle(tip).display).not.toBe('none');
    expect(getComputedStyle(tip).visibility).toBe('visible');
    await tip.hide();
    await tip.updateComplete;
    // 페이드 중에는 상자가 남는다(닫힘 전환)
    expect(getComputedStyle(tip).display).not.toBe('none');
    await Promise.all(tip.getAnimations().map((a) => a.finished));
    await frames();
    expect(getComputedStyle(tip).display).toBe('none');
    expect(box.scrollWidth).toBe(box.clientWidth);
  });

  it('🔴a declaratively open popover is shown', async () => {
    const host = document.createElement('div');
    host.innerHTML = '<button id="b">B</button><u-popover for="#b" open><p>Body</p></u-popover>';
    document.body.appendChild(host);
    made.push(host);
    const pop = host.querySelector('u-popover') as HTMLElement & { updateComplete: Promise<unknown> };
    await pop.updateComplete;
    await frames();
    expect(getComputedStyle(pop).display).not.toBe('none');
    expect(getComputedStyle(pop).visibility).toBe('visible');
  });

  it('🔴show() measures the closed element before it opens, and a hide during the delay parks it again', async () => {
    const { tip, anchor } = await log();
    tip.showDelay = 50;
    await tip.show(anchor);
    // 지연 동안 위치가 잡혀 있다(재려면 상자가 필요했다)
    expect(getComputedStyle(tip).display).not.toBe('none');
    await tip.hide();
    await frames(3);
    expect(getComputedStyle(tip).display).toBe('none');
  });
});
