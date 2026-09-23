import { describe, it, expect, beforeEach } from 'vitest';
import { userEvent } from 'vitest/browser';
import '../../src/components/menu/UMenu.js';
import type { UMenuItem } from '../../src/components/menu-item/UMenuItem.js';
import '../../src/components/menu-item/UMenuItem.js';
import '../../src/components/popover/UPopover.js';

/**
 * `open` 을 `show()` 를 거치지 않고 켜도 배치된다.
 *
 * 배치(`reposition`)와 추적(`autoUpdate`)이 종전에는 `show()` 안에만 있었다. 그래서 `open` 을
 * 직접 켜는 경로 — 하위 메뉴를 **클릭·키보드(`ArrowRight`)로** 펼치기, 선언적 `<u-popover open>` —
 * 에서는 좌표가 한 번도 계산되지 않아 팝오버가 정적 위치(부모 헤더 위)에 겹쳐 떴다. 호버로 열면
 * `show()` 를 타므로 마우스 사용자에게는 보이지 않았고, 키보드 사용자에게만 깨져 있었다.
 */
describe('UFloatingElement — open 을 직접 켜도 배치된다', () => {
  beforeEach(async () => {
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 120));
  });

  async function mountMenu() {
    document.body.innerHTML =
      '<u-menu style="width:200px"><u-menu-item>Parent<u-menu-item>Child A</u-menu-item><u-menu-item>Child B</u-menu-item></u-menu-item></u-menu>';
    const parent = document.querySelector('u-menu-item') as UMenuItem;
    await parent.updateComplete;
    const root = parent.shadowRoot!;
    // 팝오버는 하위 항목이 슬롯에 들어온 뒤(`leaf` 판정 이후)에 그려진다.
    for (let i = 0; i < 50 && !root.querySelector('u-popover'); i++) await new Promise((r) => setTimeout(r, 20));
    const header = root.querySelector('.header') as HTMLElement;
    const popover = root.querySelector('u-popover') as HTMLElement;
    return { parent, header, popover };
  }

  /** 열린 뒤 배치가 확정될 때까지 기다린다(계산은 비동기다). */
  async function settled(popover: HTMLElement) {
    for (let i = 0; i < 50 && !(popover.hasAttribute('open') && popover.style.left); i++) {
      await new Promise((r) => setTimeout(r, 20));
    }
    // 열림 전환(투명도·변형)이 끝난 뒤의 기하를 잰다 — 전환 중의 경계 상자는 최종 배치가 아니다.
    await Promise.all(popover.getAnimations({ subtree: true }).map((a) => a.finished));
  }

  function expectRightOf(popover: HTMLElement, header: HTMLElement) {
    const p = popover.getBoundingClientRect();
    const h = header.getBoundingClientRect();
    // placement="right-start" · offset 4 — 헤더 오른쪽 변 바깥, 윗변 정렬.
    expect(Math.round(p.left - h.right), `팝오버 left ${p.left} · 헤더 right ${h.right}`).toBe(4);
    expect(Math.abs(p.top - h.top)).toBeLessThan(1);
  }

  it('하위 메뉴를 헤더 클릭으로 펼치면 헤더 오른쪽에 붙는다', async () => {
    const { header, popover } = await mountMenu();
    header.click();
    await settled(popover);
    expect(popover.hasAttribute('open')).toBe(true);
    expectRightOf(popover, header);
  });

  it('하위 메뉴를 키보드(ArrowRight)로 펼쳐도 헤더 오른쪽에 붙는다', async () => {
    const { parent, header, popover } = await mountMenu();
    parent.focus();
    await userEvent.keyboard('{ArrowRight}');
    await settled(popover);
    expect(popover.hasAttribute('open')).toBe(true);
    expectRightOf(popover, header);
  });

  it('접었다가 다시 펼쳐도 배치된다 — 닫을 때 추적을 끊고 다시 걸기', async () => {
    const { parent: item, header, popover } = await mountMenu();
    item.expanded = true;
    await settled(popover);
    item.expanded = false;
    await new Promise((r) => setTimeout(r, 50));
    // 닫힌 동안 헤더를 옮긴다 — 추적이 살아 있으면 여기서도 따라 움직였을 것이고, 다시 열 때의 좌표가 그것을 가린다.
    header.style.marginTop = '40px';
    item.expanded = true;
    await new Promise((r) => setTimeout(r, 50));
    await settled(popover);
    expectRightOf(popover, header);
  });

  it('선언적 <u-popover open> 은 앵커 기준으로 배치된다', async () => {
    document.body.innerHTML =
      '<div style="padding:80px"><button id="anchor" style="width:100px;height:30px">A</button>' +
      '<u-popover for="#anchor" placement="bottom-start" open>Body</u-popover></div>';
    const popover = document.querySelector('u-popover') as HTMLElement & { updateComplete: Promise<unknown> };
    await popover.updateComplete;
    await settled(popover);
    const p = popover.getBoundingClientRect();
    const a = document.getElementById('anchor')!.getBoundingClientRect();
    expect(Math.round(p.left)).toBe(Math.round(a.left));
    expect(Math.round(p.top)).toBe(Math.round(a.bottom));
  });
});
