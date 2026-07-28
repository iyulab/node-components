import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/select/USelect.js';
import '../../src/components/input/UInput.js';
import '../../src/components/option/UOption.js';
import '../../src/components/popover/UPopover.js';
import type { USelect } from '../../src/components/select/USelect.js';
import type { UInput } from '../../src/components/input/UInput.js';
import type { UPopover } from '../../src/components/popover/UPopover.js';

/**
 * 회귀 고정: 열린 팝오버가 페이지 스크롤에 닫히면 안 된다.
 *
 * 1.8.1 결함 — `UPopover.dismiss` 기본값의 `'scroll'` 이 document 캡처 단계로 등록되는데,
 * `UFloatingElement.show()` 는 모든 플로팅 엘리먼트에 `autoUpdate`(스크롤 재배치)를 설치한다.
 * 두 정책이 같은 이벤트에서 충돌하고 닫기가 이겨, 열린 listbox 가 페이지 스크롤 한 번에 닫혔다.
 * (E2E 에서는 Playwright 의 "scroll into view" 가 이를 유발해 옵션 클릭이 불가능했다.)
 *
 * 테스트 격리 주의: scroll 이벤트는 비동기로 늦게 도착한다. beforeEach 에서 스크롤을 0으로
 * 되돌린 뒤 배출을 기다리지 않으면 직전 테스트의 잔여 스크롤이 다음 테스트의 팝오버를 닫는다.
 */

/** 페이지에 스크롤 여지를 만든다 — window.scrollTo 가 실제 scroll 이벤트를 내려면 필요. */
function addScrollRoom(): void {
  const spacer = document.createElement('div');
  spacer.style.height = '3000px';
  document.body.appendChild(spacer);
}

async function settle(ms = 200): Promise<void> {
  await new Promise(r => setTimeout(r, ms));
}

describe('팝오버 scroll-dismiss 정책', () => {
  beforeEach(async () => {
    document.body.replaceChildren();
    window.scrollTo(0, 0);
    // 직전 테스트의 스크롤 잔여가 비동기 scroll 이벤트로 새어들지 않도록 배출한다
    await settle(150);
  });

  it('u-select: 열린 listbox 가 페이지 스크롤에 닫히지 않고 앵커를 따라 재배치된다', async () => {
    addScrollRoom();

    const select = document.createElement('u-select') as USelect;
    for (let i = 0; i < 5; i++) {
      const option = document.createElement('u-option');
      option.setAttribute('value', `v${i}`);
      option.textContent = `옵션 ${i}`;
      select.appendChild(option);
    }
    document.body.appendChild(select);
    await select.updateComplete;

    const popover = select.shadowRoot!.querySelector('u-popover') as UPopover;
    (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
    await settle(100);
    expect(popover.open).toBe(true);

    const topBefore = popover.getBoundingClientRect().top;

    window.scrollTo(0, 100);
    await settle();

    // 합성 이벤트 없이 실제 스크롤만으로 재현되던 결함
    expect(`scrollY=${window.scrollY} open=${popover.open}`).toBe('scrollY=100 open=true');

    // 닫히지 않을 뿐 아니라 autoUpdate 가 앵커를 따라 위로 재배치해야 한다
    const topAfter = popover.getBoundingClientRect().top;
    expect(topBefore - topAfter).toBeGreaterThan(50);
  });

  it('u-input: combobox 제안 목록도 페이지 스크롤에 닫히지 않는다', async () => {
    addScrollRoom();

    const input = document.createElement('u-input') as UInput;
    const option = document.createElement('u-option');
    option.setAttribute('value', 'a');
    option.textContent = 'Option A';
    input.appendChild(option);
    document.body.appendChild(input);
    await input.updateComplete;

    const popover = input.shadowRoot!.querySelector('u-popover') as UPopover;
    // u-input 팝오버는 trigger="focus"
    (input.shadowRoot!.querySelector('.container') as HTMLElement).dispatchEvent(
      new FocusEvent('focusin', { bubbles: true })
    );
    await settle(100);
    expect(popover.open).toBe(true);

    window.scrollTo(0, 100);
    await settle();

    expect(`scrollY=${window.scrollY} open=${popover.open}`).toBe('scrollY=100 open=true');
  });

  it('u-select: 윈도우 리사이즈에도 닫히지 않는다', async () => {
    // 리사이즈는 스크롤과 같은 뷰포트 기하 변화이고 autoUpdate 가 ancestorResize 로 구독한다.
    // 여기서는 합성 이벤트를 쓴다 — 브라우저가 resize 를 발화하는지가 아니라 핸들러의 **정책**을
    // 검증하는 테스트이고, 실제 리사이즈든 dispatch 든 같은 핸들러를 같은 방식으로 호출한다.
    const select = document.createElement('u-select') as USelect;
    const option = document.createElement('u-option');
    option.setAttribute('value', 'a');
    option.textContent = 'Option A';
    select.appendChild(option);
    document.body.appendChild(select);
    await select.updateComplete;

    const popover = select.shadowRoot!.querySelector('u-popover') as UPopover;
    (select.shadowRoot!.querySelector('.container') as HTMLElement).click();
    await settle(100);
    expect(popover.open).toBe(true);

    window.dispatchEvent(new Event('resize'));
    await settle(100);

    expect(popover.open).toBe(true);
  });

  it('가상 앵커(contextmenu 좌표)에 붙은 팝오버는 리사이즈 시 닫힌다 — 의미 보존', async () => {
    const popover = document.createElement('u-popover') as UPopover;
    popover.textContent = 'menu';
    document.body.appendChild(popover);
    await popover.updateComplete;

    await popover.show({
      getBoundingClientRect: () => ({
        width: 0, height: 0, x: 10, y: 10,
        top: 10, left: 10, right: 10, bottom: 10,
      }),
    });
    await settle(100);
    expect(popover.open).toBe(true);

    window.dispatchEvent(new Event('resize'));
    await settle(100);

    expect(popover.open).toBe(false);
  });

  it('가상 앵커(contextmenu 좌표)에 붙은 팝오버는 스크롤 시 닫힌다 — 의미 보존', async () => {
    addScrollRoom();

    const popover = document.createElement('u-popover') as UPopover;
    popover.textContent = 'menu';
    document.body.appendChild(popover);
    await popover.updateComplete;

    // contextmenu 경로와 동일한 좌표 기반 가상 앵커
    await popover.show({
      getBoundingClientRect: () => ({
        width: 0, height: 0, x: 10, y: 10,
        top: 10, left: 10, right: 10, bottom: 10,
      }),
    });
    await settle(100);
    expect(popover.open).toBe(true);

    window.scrollTo(0, 100);
    await settle();

    // 가상 앵커는 스크롤 후 가리키던 대상과 어긋나므로 닫는 것이 맞다
    expect(popover.open).toBe(false);
  });
});
