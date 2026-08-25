import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/popover/UPopover.js';
import '../../src/components/tooltip/UTooltip.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';
import type { UTooltip } from '../../src/components/tooltip/UTooltip.js';

/**
 * 회귀 고정 — docket #104: touch/pen은 지속되는 hover 상태가 없어 탭 시
 * pointerenter 직후 pointerleave가 뒤따른다. hover 트리거 컴포넌트가 이를
 * 구분하지 않으면 열리자마자(또는 SAFE_TIMER 뒤) 닫혀 터치 사용자가 콘텐츠를
 * 볼 수 없다.
 *
 * `PointerEvent.pointerType`은 컴포넌트가 값만 읽으므로 트러스티드 입력이
 * 필요 없다 — 합성 이벤트로 충분히 재현된다(네이티브 `<form>` Enter 제출처럼
 * 브라우저 기본 동작을 검증하는 경우와는 다르다).
 */

function firePointer(el: Element, type: string, pointerType: string): void {
  el.dispatchEvent(new PointerEvent(type, { bubbles: true, pointerType }));
}

async function settle(ms = 300): Promise<void> {
  await new Promise(r => setTimeout(r, ms));
}

describe('hover 트리거의 touch/pen pointerType 처리', () => {
  beforeEach(() => {
    document.body.replaceChildren();
  });

  describe('u-popover trigger="hover"', () => {
    async function mountPopover(): Promise<{ wrap: HTMLElement; popover: UPopover }> {
      const wrap = document.createElement('div');
      const popover = document.createElement('u-popover') as UPopover;
      popover.trigger = 'hover';
      popover.textContent = 'menu';
      wrap.appendChild(popover);
      document.body.appendChild(wrap);
      await popover.updateComplete;
      return { wrap, popover };
    }

    it('마우스는 종전대로 hover로 열리고 leave 후(SAFE_TIMER) 닫힌다', async () => {
      const { wrap, popover } = await mountPopover();

      firePointer(wrap, 'pointerenter', 'mouse');
      await settle(50);
      expect(popover.open).toBe(true);

      firePointer(wrap, 'pointerleave', 'mouse');
      await settle();
      expect(popover.open).toBe(false);
    });

    it('터치 탭(pointerenter 직후 pointerleave)에도 열린 채 유지된다', async () => {
      const { wrap, popover } = await mountPopover();

      firePointer(wrap, 'pointerenter', 'touch');
      firePointer(wrap, 'pointerleave', 'touch');
      await settle(); // SAFE_TIMER_DELAY(200ms)를 지나도 닫히면 안 된다

      expect(popover.open).toBe(true);
    });

    it('두 번째 터치 탭은 토글로 닫는다', async () => {
      const { wrap, popover } = await mountPopover();

      firePointer(wrap, 'pointerenter', 'touch');
      firePointer(wrap, 'pointerleave', 'touch');
      await settle(100);
      expect(popover.open).toBe(true);

      firePointer(wrap, 'pointerenter', 'touch');
      firePointer(wrap, 'pointerleave', 'touch');
      await settle(100);
      expect(popover.open).toBe(false);
    });

    it('pen도 touch와 동일하게 토글 취급된다', async () => {
      const { wrap, popover } = await mountPopover();

      firePointer(wrap, 'pointerenter', 'pen');
      firePointer(wrap, 'pointerleave', 'pen');
      await settle();

      expect(popover.open).toBe(true);
    });
  });

  describe('u-tooltip', () => {
    async function mountTooltip(): Promise<{ wrap: HTMLElement; tooltip: UTooltip }> {
      const wrap = document.createElement('div');
      const tooltip = document.createElement('u-tooltip') as UTooltip;
      tooltip.textContent = 'tip';
      wrap.appendChild(tooltip);
      document.body.appendChild(wrap);
      await tooltip.updateComplete;
      await settle(50); // 초기 slotchange가 isEmpty를 false로 반영할 시간
      return { wrap, tooltip };
    }

    it('마우스 hover는 종전대로 표시된다', async () => {
      const { wrap, tooltip } = await mountTooltip();

      firePointer(wrap, 'pointerenter', 'mouse');
      await settle(50);

      expect(tooltip.open).toBe(true);
    });

    it('터치 탭은 표시되지 않는다 — 보조 정보라 touch에서 무력화', async () => {
      const { wrap, tooltip } = await mountTooltip();

      firePointer(wrap, 'pointerenter', 'touch');
      firePointer(wrap, 'pointerleave', 'touch');
      await settle(100);

      expect(tooltip.open).toBe(false);
    });

    it('focus 트리거(키보드 내비게이션)는 pointerType과 무관하게 그대로 동작한다', async () => {
      const { wrap, tooltip } = await mountTooltip();

      wrap.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await settle(50);

      expect(tooltip.open).toBe(true);
    });
  });
});
