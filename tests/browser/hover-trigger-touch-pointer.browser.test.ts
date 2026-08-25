import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/popover/UPopover.js';
import '../../src/components/tooltip/UTooltip.js';
import '../../src/components/slider/USlider.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';
import type { UTooltip } from '../../src/components/tooltip/UTooltip.js';
import type { USlider } from '../../src/components/slider/USlider.js';

/**
 * 회귀 고정 — docket #104: touch/pen은 지속되는 hover 상태가 없어 짧은 탭 시
 * pointerenter 직후 pointerleave가 뒤따른다. `u-popover[trigger="hover"]`가 이를
 * 구분하지 않으면 열리자마자(SAFE_TIMER 뒤) 닫혀 터치 사용자가 메뉴를 조작할 수
 * 없었다 — `u-menu-item`의 서브메뉴도 같은 경로를 쓴다.
 *
 * ⚠**`u-tooltip`은 의도적으로 손대지 않았다** — pointerType 분기를 추가하려다
 * `u-slider`의 값 툴팁(`part="thumb-tooltip"`)이 드래그 중 터치를 누르고 있는
 * 동안 보여주고 뗄 때 닫히는 것에 의존한다는 것을 뒤늦게 확인했다(픽커/버튼과
 * 달리 pointerenter/pointerleave가 즉시 짝을 이루지 않고 hold 기간만큼
 * 떨어져 있다). touch에서 무조건 표시 안 함으로 바꾸면 그 기능이 깨진다 —
 * 아래 두 테스트가 그 "누르고 있는 동안 표시" 계약을 고정한다.
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

    it('터치를 누르고 있는 동안(pointerleave 없이)은 표시를 유지한다 — u-slider 드래그 값 표시가 의존', async () => {
      const { wrap, tooltip } = await mountTooltip();

      firePointer(wrap, 'pointerenter', 'touch');
      await settle(150); // 실제 드래그 중처럼 leave 없이 유지

      expect(tooltip.open).toBe(true);
    });

    it('터치를 떼면(pointerleave) 즉시 닫힌다', async () => {
      const { wrap, tooltip } = await mountTooltip();

      firePointer(wrap, 'pointerenter', 'touch');
      await settle(100);
      expect(tooltip.open).toBe(true);

      firePointer(wrap, 'pointerleave', 'touch');
      await settle(50);

      expect(tooltip.open).toBe(false);
    });

    it('focus 트리거(키보드 내비게이션)는 pointerType과 무관하게 그대로 동작한다', async () => {
      const { wrap, tooltip } = await mountTooltip();

      wrap.dispatchEvent(new FocusEvent('focusin', { bubbles: true }));
      await settle(50);

      expect(tooltip.open).toBe(true);
    });
  });

  describe('u-slider[show-tooltip] 통합 — 실제 소비 경로에서도 유지되는지 확인', () => {
    it('thumb를 터치로 누르고 있는 동안 값 툴팁이 표시된다', async () => {
      const slider = document.createElement('u-slider') as USlider;
      slider.showTooltip = true;
      slider.value = 30;
      document.body.appendChild(slider);
      await slider.updateComplete;

      const thumb = slider.shadowRoot!.querySelector('.thumb') as HTMLElement;
      const tooltip = thumb.querySelector('u-tooltip') as UTooltip;
      await tooltip.updateComplete;

      firePointer(thumb, 'pointerenter', 'touch');
      await settle(150); // 드래그 중처럼 leave 없이 유지

      expect(tooltip.open).toBe(true);

      firePointer(thumb, 'pointerleave', 'touch');
      await settle(50);

      expect(tooltip.open).toBe(false);
    });
  });
});
