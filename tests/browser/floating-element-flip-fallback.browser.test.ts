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

  /**
   * 🔴위 케이스는 트리거가 **좁아서** 반대 변(`left-end`)이 살려 준다. 트리거가 넓어
   * **좌·우 어느 쪽에도** 공간이 없으면 같은 축 안에서는 답이 없고, 그때 `flip()` 은
   * 기본값 `fallbackAxisSideDirection: 'none'` 으로 **원래 배치로 되돌아가** 팝오버가
   * 화면 밖으로 나간다. 소비앱이 실측해 회신한 기하가 정확히 그것이었다 — 뷰포트
   * 390px 안에서 트리거가 **373px**(96%)를 차지하는 모바일 드로어 항목.
   *
   * ⚠**앞 케이스와 이 케이스를 함께 두는 것이 이 파일의 요점이다** — 앞의 것만 있으면
   * *"flip 은 동작한다"* 가 참이면서도 실제 실패를 놓친다(트리아지가 처음 재현에
   * 실패한 이유가 정확히 그 차이였다).
   */
  it('트리거가 넓어 좌·우 어느 쪽에도 공간이 없으면 수직 축으로 넘어간다', async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);

    // 뷰포트 폭의 96% 를 차지하는 트리거 — 좌우 어느 쪽에도 팝오버가 들어갈 자리가 없다.
    const wide = Math.round(window.innerWidth * 0.96);
    const trigger = document.createElement('div');
    Object.assign(trigger.style, {
      position: 'fixed',
      top: '300px',
      left: `${Math.round((window.innerWidth - wide) / 2)}px`,
      width: `${wide}px`,
      height: '40px',
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
    const triggerRect = trigger.getBoundingClientRect();

    // 화면 안에 완전히 들어와야 한다.
    expect(rect.x).toBeGreaterThanOrEqual(0);
    expect(rect.x + rect.width).toBeLessThanOrEqual(window.innerWidth + 1);

    // 그리고 «수직 축으로 넘어갔다» 를 직접 잰다 — 화면 안에 있다는 것만으로는
    // shift 가 밀어 넣은 것과 구별되지 않는다.
    const wentVertical =
      rect.bottom <= triggerRect.top + 1 || rect.top >= triggerRect.bottom - 1;
    expect(wentVertical).toBe(true);
  });
});
