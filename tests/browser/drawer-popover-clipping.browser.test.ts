import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/components/drawer/UDrawer.js';
import '../../src/components/select/USelect.js';
import '../../src/components/option/UOption.js';
import '../../src/components/menu/UMenu.js';
import '../../src/components/menu-item/UMenuItem.js';

/**
 * 오버플로 조상(드로어 본문) 안의 드롭다운이 조상 경계에서 잘리면 안 된다.
 *
 * 드로어는 폼을 담는 것이 주 용도이고 폼에는 셀렉트가 들어간다 — 즉 **가장 흔한 조합**이며,
 * 같은 라이브러리 안의 두 컴포넌트가 맞물리는 문제라 소비자가 해결할 몫이 아니다.
 *
 * 탈출 수단은 `strategy="fixed"` 다(`UFloatingElement`). `UDrawer` 의 패널이 열린 상태에서도
 * `transform: translateY(0)`(계산값 identity matrix)을 유지하므로 containing block 이 될
 * 여지가 있는데, 실측상 클리핑은 발생하지 않는다 — 그 사실을 여기서 고정한다.
 */
describe('오버플로 조상 안의 팝오버 클리핑', () => {
  beforeEach(async () => {
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
    // scroll 이벤트는 비동기로 늦게 도착한다 — 앞 테스트가 만든 스크롤이 다음 테스트의
    // 팝오버를 닫아버리는 것을 막기 위해 배출을 기다린다.
    await new Promise(r => setTimeout(r, 120));
  });

  /** 낮은 하단 드로어 + 긴 옵션 목록 → 드롭다운이 드로어 밖으로 나갈 수밖에 없는 배치 */
  async function openSelectInDrawer(strategy?: string) {
    const drawer = document.createElement('u-drawer') as HTMLElement & {
      open: boolean; updateComplete: Promise<unknown>;
    };
    drawer.setAttribute('placement', 'bottom');
    drawer.style.setProperty('--drawer-size', '180px');

    const select = document.createElement('u-select') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    for (let i = 0; i < 14; i++) {
      const opt = document.createElement('u-option');
      opt.setAttribute('value', String(i));
      opt.textContent = `Option ${i}`;
      select.appendChild(opt);
    }
    drawer.appendChild(select);
    document.body.appendChild(drawer);

    drawer.open = true;
    await drawer.updateComplete;
    await new Promise(r => setTimeout(r, 450));   // 슬라이드 트랜지션 완료

    const popover = select.shadowRoot!.querySelector('u-popover') as HTMLElement;
    if (strategy) popover.setAttribute('strategy', strategy);

    select.shadowRoot!.querySelector<HTMLElement>('[part="container"]')?.click();
    await select.updateComplete;
    await new Promise(r => setTimeout(r, 250));

    const drawerBody = drawer.shadowRoot!.querySelector('.body') as HTMLElement;
    return { popover, drawerBody };
  }

  it('드롭다운이 드로어 본문 경계 밖에서도 그려진다', async () => {
    const { popover, drawerBody } = await openSelectInDrawer();

    const pop = popover.getBoundingClientRect();
    const body = drawerBody.getBoundingClientRect();
    expect(pop.height, '드롭다운이 렌더돼 있어야 한다').toBeGreaterThan(0);
    expect(pop.top, '이 배치에서 드롭다운은 드로어 위로 넘쳐야 검사가 의미를 갖는다')
      .toBeLessThan(body.top - 50);

    // 드로어 본문 **밖**(위쪽)의 한 점을 히트테스트한다.
    // 조상이 클리핑하면 그 지점에는 팝오버가 그려지지 않아 다른 요소가 잡힌다.
    const x = pop.left + pop.width / 2;
    const y = pop.top + 20;
    const hit = document.elementFromPoint(x, y);

    expect(y, '검사 지점이 드로어 본문 밖이어야 한다').toBeLessThan(body.top);
    expect(
      hit?.closest('u-option, u-popover') != null,
      `드로어 밖 지점(${Math.round(x)},${Math.round(y)})에서 드롭다운이 잡히지 않았다 ` +
      `— elementFromPoint=${hit?.tagName}`,
    ).toBe(true);
  });

  // 네거티브 컨트롤: 위 검사가 실제로 클리핑을 잡는지 확인한다.
  // strategy="absolute" 로 되돌리면 팝오버가 오버플로 조상에 갇혀 밖에서 안 보인다.
  it('strategy="absolute" 로 되돌리면 같은 지점이 클리핑된다 (검사의 유효성)', async () => {
    const { popover, drawerBody } = await openSelectInDrawer('absolute');

    const pop = popover.getBoundingClientRect();
    const body = drawerBody.getBoundingClientRect();
    const x = pop.left + pop.width / 2;
    const y = Math.min(pop.top + 20, body.top - 20);
    const hit = document.elementFromPoint(x, y);

    expect(hit?.closest('u-option, u-popover') == null).toBe(true);
  });

  it('u-menu-item 의 하위 메뉴 팝오버도 fixed 로 띄운다', async () => {
    // 셀렉트/인풋과 같은 탈출 수단을 쓰는지 확인한다 — 하위 메뉴만 absolute 로 남으면
    // 스크롤 컨테이너 안의 중첩 메뉴에서 같은 클리핑이 재현된다.
    //
    // 팝오버 분기는 `inline=false` 일 때만 렌더된다(인라인 모드의 하위 메뉴는 그냥 div 라
    // 오버플로 탈출이 필요 없다). u-menu 가 자식에게 inline 을 전파하므로 그 안에 넣는다.
    const menu = document.createElement('u-menu') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    const item = document.createElement('u-menu-item') as HTMLElement & {
      updateComplete: Promise<unknown>;
    };
    const child = document.createElement('u-menu-item');
    child.setAttribute('slot', 'children');
    item.appendChild(child);
    menu.appendChild(item);
    document.body.appendChild(menu);
    await menu.updateComplete;
    await item.updateComplete;
    await new Promise(r => setTimeout(r, 50));   // inline 전파 후 재렌더

    const popover = item.shadowRoot!.querySelector('u-popover');
    expect(popover, 'inline=false 에서는 하위 메뉴가 팝오버로 렌더돼야 한다').toBeTruthy();
    expect(popover!.getAttribute('strategy')).toBe('fixed');
  });
});
