import { describe, it, expect } from 'vitest';
import '../../src/components/popover/UPopover.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * `placement`가 지정되면 `flip()` 미들웨어가 항상 함께 적용된다 — 트리거가 뷰포트
 * 가장자리에 고정돼 지정한 변에 공간이 전혀 없을 때, 반대 변으로 전환해 화면 안에
 * 머물러야 한다. `shift`만으로는(같은 변 안에서 교차축만 보정) 이 케이스를 해결하지
 * 못한다 — 이 둘을 구분하는 회귀.
 */

async function settle(ms = 250): Promise<void> {
  await new Promise((r) => setTimeout(r, ms));
}

describe('UFloatingElement — flip fallback when the placed side has no room', () => {
  it('right-end 배치에서 오른쪽에 공간이 없으면 left-end로 전환된다', async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);

    const trigger = document.createElement('div');
    Object.assign(trigger.style, {
      position: 'fixed',
      top: '300px',
      right: '5px',
      width: '10px',
      height: '10px',
    });
    document.body.appendChild(trigger);

    const popover = document.createElement('u-popover') as UPopover;
    popover.setAttribute('placement', 'right-end');
    popover.setAttribute('trigger', 'manual');
    popover.shift = true;
    const content = document.createElement('div');
    content.style.width = '160px';
    content.style.height = '138px';
    content.textContent = 'content';
    popover.appendChild(content);
    trigger.appendChild(popover);

    await popover.updateComplete;
    await popover.show(trigger);
    await settle();

    const rect = popover.getBoundingClientRect();
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(window.innerWidth + 1);
  });
});
