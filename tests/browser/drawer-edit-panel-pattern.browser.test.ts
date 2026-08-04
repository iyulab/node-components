import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/drawer/UDrawer.js';

/**
 * **편집 패널(사이드 패널) 패턴이 `u-drawer` 만으로 어디까지 성립하는가.**
 *
 * 소비앱 초안(`lob-layout-primitives` R2)이 «완성된 패턴»으로 요구한 검증 4항목을 **그대로**
 * 잰다. 새 컴포넌트를 만들기 전에 재는 이유는 cycle-188·199 가 두 번 보여 준 것이다 —
 * ***초안이 «없다»고 적은 것이 이미 있을 수 있고, 「있다」고 적힌 것이 없을 수 있다.***
 *
 * 여기서 통과하는 항목은 **만들지 않는다.** 이 파일은 그 판정의 근거로 남는다.
 *
 * ⚠**실브라우저가 필요하다** — 포커스 트랩(`focus-trap` + `tabbable`)은 실제 포커스 이동과
 * 가시성 계산에 의존하고, 스크롤 분리는 flex 레이아웃의 실제 높이 계산이다. jsdom 은 둘 다
 * 재현하지 못한다.
 */

type Drawer = HTMLElement & { open: boolean; updateComplete: Promise<unknown>; show(): void; hide(): void };

const setup = (opts: { closable?: boolean } = {}) => {
  const trigger = document.createElement('button');
  trigger.id = 'trigger';
  trigger.textContent = '편집';
  document.body.appendChild(trigger);

  const drawer = document.createElement('u-drawer') as Drawer;
  drawer.setAttribute('placement', 'right');
  if (opts.closable) drawer.setAttribute('closable', '');
  drawer.innerHTML = `
    <span slot="header">주문 편집</span>
    <div style="height:1200px">
      <input id="first" />
      <input id="second" />
    </div>
    <div slot="footer"><button id="save">저장</button></div>
  `;
  document.body.appendChild(drawer);
  return { trigger, drawer };
};

const settle = async (drawer: Drawer, ms = 450) => {
  await drawer.updateComplete;
  await new Promise(r => setTimeout(r, ms));
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('R2 편집 패널 — u-drawer 만으로 성립하는 것', () => {
  it('⑵ 본문만 스크롤되고 푸터는 항상 보인다 (높이를 넘기는 콘텐츠로 실증)', async () => {
    const { drawer } = setup();
    drawer.show();
    await settle(drawer);

    const body = drawer.shadowRoot!.querySelector<HTMLElement>('[part="body"]')!;
    const panel = drawer.shadowRoot!.querySelector<HTMLElement>('[part="panel"]')!;
    const footer = drawer.querySelector<HTMLElement>('[slot="footer"]')!;

    expect(getComputedStyle(body).overflowY).toBe('auto');
    expect(body.scrollHeight).toBeGreaterThan(body.clientHeight); // 실제로 넘친다

    const panelBox = panel.getBoundingClientRect();
    const footerBox = footer.getBoundingClientRect();
    expect(footerBox.bottom).toBeLessThanOrEqual(panelBox.bottom + 1);
    expect(footerBox.height).toBeGreaterThan(0);

    // 본문을 끝까지 스크롤해도 푸터는 제자리다
    body.scrollTop = body.scrollHeight;
    await new Promise(r => setTimeout(r, 60));
    expect(footer.getBoundingClientRect().bottom).toBeCloseTo(footerBox.bottom, 0);
  });

  it('⑶ 포커스가 패널 밖으로 나가지 않는다 (UOverlayElement 의 focus-trap)', async () => {
    const { trigger, drawer } = setup();
    drawer.show();
    await settle(drawer);

    trigger.focus(); // 트랩 밖으로 나가려는 시도
    await new Promise(r => setTimeout(r, 60));

    expect(document.activeElement).not.toBe(trigger);
    expect(drawer.contains(document.activeElement) || document.activeElement === drawer).toBe(true);
  });

  it('⑷ 열림 직후 저절로 펼쳐진 팝업이 0개다', async () => {
    const { drawer } = setup();
    drawer.show();
    await settle(drawer);

    const expanded = [...drawer.querySelectorAll('*')].filter(
      el => el.hasAttribute('open') || el.getAttribute('aria-expanded') === 'true',
    );
    expect(expanded).toEqual([]);
  });
});

describe('R2 편집 패널 — 초기 포커스는 «계약»이어야 한다', () => {
  /**
   * ⚠**이 절의 두 케이스 중 «첫 입력 우선»(⑴-a)은 여기서 판별되지 않는다** — 드로어는 슬롯
   * 배치 때문에 `focus-trap` 기본값도 우연히 첫 입력에 떨어진다. 그 분기의 판별식은
   * `u-dialog` 이고 [`overlay-initial-focus.browser.test.ts`](./overlay-initial-focus.browser.test.ts)
   * 에 있다. 여기 남긴 이유는 **초안 R2 가 요구한 화면 모양**에서 계약이 유지되는지를 재기
   * 위해서다(감시이지 판별식이 아니다).
   *
   * ⚠**첫 되돌림 시도는 줄바꿈이 달라 파일에 적용되지 않았고, 그 상태의 «통과»를 하마터면
   * 네거티브 컨트롤로 기록할 뻔했다.** 되돌림이 실제로 적용됐는지(`grep -c`)까지 확인해야
   * 네거티브 컨트롤이다.
   */
  it('⑴-a 열리면 «첫 입력»에 포커스가 간다 — 닫기 버튼이 앞에 있어도', async () => {
    const { drawer } = setup({ closable: true });
    drawer.show();
    await settle(drawer);

    expect(document.activeElement).toBe(drawer.querySelector('#first'));
  });

  it('⑴-a-2 `autofocus` 가 있으면 그쪽이 이긴다', async () => {
    const { drawer } = setup({ closable: true });
    drawer.querySelector('#second')!.setAttribute('autofocus', '');
    drawer.show();
    await settle(drawer);

    expect(document.activeElement).toBe(drawer.querySelector('#second'));
  });

  it('⑴-b 닫으면 포커스가 트리거로 돌아온다', async () => {
    const { trigger, drawer } = setup();
    trigger.focus();
    drawer.show();
    await settle(drawer);

    drawer.hide();
    await settle(drawer);

    expect(document.activeElement).toBe(trigger);
  });
});

describe('R2 편집 패널 — 헤더에 액션이 있어도 입력으로 간다', () => {
  /**
   * ⚠**이 케이스는 판별식이 «아니었다»** — 처음엔 *"헤더에 라이트 DOM 버튼을 넣으면
   * 기본값(첫 tabbable)이 그것을 잡을 테니 여기서 갈릴 것"* 이라 예상하고 썼는데,
   * 되돌려 재 보니 **구현 없이도 첫 입력으로 갔다.** 예상이 틀렸고, 기록을 그대로 남긴다.
   *
   * 그래도 이 테스트는 남긴다 — 초안 R2 가 요구하는 실제 화면 모양(헤더에 보조 액션이 있는
   * 편집 패널)에서 계약이 유지되는지를 재기 때문이다.
   */
  it('헤더 슬롯에 버튼이 있어도 첫 입력으로 간다', async () => {
    const drawer = document.createElement('u-drawer') as Drawer;
    drawer.innerHTML = `
      <span slot="header">주문 편집 <button id="header-action">이력</button></span>
      <input id="first" />
      <div slot="footer"><button id="save">저장</button></div>
    `;
    document.body.appendChild(drawer);
    drawer.show();
    await settle(drawer);

    expect(document.activeElement).toBe(drawer.querySelector('#first'));
    expect(document.activeElement).not.toBe(drawer.querySelector('#header-action'));
  });
});
