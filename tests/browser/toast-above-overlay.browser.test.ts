// 알림 층은 오버레이 층보다 **항상 위**다.
//
// 브라우저 전용인 이유: 이 계약이 지켜지는지는 «계산된 z-index 를 비교하는 것»으로는 부족하고
// **실제로 포인터가 토스트에 닿는가**(히트테스트)로 재야 한다 — 스크림·스태킹 컨텍스트가
// 얽히면 숫자가 커도 가려질 수 있다.
//
// ★네거티브 컨트롤: `Toast` 의 `z-index` 를 `"9999"` 로 되돌리면 첫 두 케이스가
//   `NO_COVERED_BY_OVERLAY` 로 실패한다.
import { describe, it, expect, beforeEach } from 'vitest';
import '../../src/index';
import { Toast } from '../../src/utilities/Toast.js';
import { OverlayManager } from '../../src/utilities/OverlayManager.js';

/** 열린 섀도 루트를 따라 내려가며 그 좌표의 최종 타깃을 찾는다. */
function hitChain(x: number, y: number): string[] {
  const chain: string[] = [];
  let el: Element | null = document.elementFromPoint(x, y);
  while (el && chain.length < 8) {
    chain.push(el.tagName.toLowerCase());
    const inner = (el as unknown as { shadowRoot?: ShadowRoot }).shadowRoot?.elementFromPoint(x, y);
    if (!inner || inner === el) break;
    el = inner;
  }
  return chain;
}

async function openOverlay(tag: 'u-dialog' | 'u-drawer') {
  const el = document.createElement(tag) as HTMLElement & { open: boolean; updateComplete: Promise<unknown> };
  el.textContent = 'overlay body';
  document.body.appendChild(el);
  await el.updateComplete;
  el.open = true;
  await new Promise((r) => setTimeout(r, 350));
  return el;
}

async function toastIsReachable(): Promise<boolean> {
  const alert = document.querySelector('u-alert') as HTMLElement | null;
  if (!alert) return false;
  const r = alert.getBoundingClientRect();
  const chain = hitChain(Math.round(r.left + r.width / 2), Math.round(r.top + r.height / 2));
  return chain.includes('u-alert');
}

describe('notification layer sits above the overlay layer', () => {
  beforeEach(async () => {
    document.body.innerHTML = '';
    window.scrollTo(0, 0);
    await new Promise((r) => setTimeout(r, 120));
  });

  it('열린 u-dialog 위에서도 토스트에 포인터가 닿는다', async () => {
    await Toast.success('over the dialog', { duration: 60000 });
    await new Promise((r) => setTimeout(r, 150));
    await openOverlay('u-dialog');

    expect(await toastIsReachable()).toBe(true);
  });

  it('토스트를 «다이얼로그가 열린 뒤에» 띄워도 위에 온다', async () => {
    await openOverlay('u-dialog');
    await Toast.error('raised while modal is open', { duration: 60000 });
    await new Promise((r) => setTimeout(r, 200));

    expect(await toastIsReachable()).toBe(true);
  });

  it('오버레이가 여러 겹 쌓여도 알림이 위에 남는다', async () => {
    await openOverlay('u-dialog');
    await openOverlay('u-drawer');
    await openOverlay('u-dialog');
    await Toast.warning('above the whole stack', { duration: 60000 });
    await new Promise((r) => setTimeout(r, 200));

    expect(await toastIsReachable()).toBe(true);
  });

  it('알림 층은 오버레이 띠 전체보다 위다 — 띠에 상한이 있는 것이 그 근거다', async () => {
    const notification = OverlayManager.notificationZIndex;

    // 동시 오버레이 깊이를 크게 만들어도 알림을 넘지 못한다
    const opened: HTMLElement[] = [];
    for (let i = 0; i < 5; i++) opened.push(await openOverlay('u-dialog'));
    const highest = Math.max(...opened.map((el) => Number(getComputedStyle(el).zIndex)));

    expect(Number.isFinite(highest)).toBe(true);
    expect(highest).toBeLessThan(notification);
  });

  it('오버레이 z-index 는 «지금까지 열린 총합»이 아니라 «동시에 열린 깊이»로 정해진다', async () => {
    const first = await openOverlay('u-dialog');
    const z1 = Number(getComputedStyle(first).zIndex);
    (first as HTMLElement & { open: boolean }).open = false;
    await new Promise((r) => setTimeout(r, 350));
    first.remove();

    const second = await openOverlay('u-dialog');
    const z2 = Number(getComputedStyle(second).zIndex);

    // 종전 구현은 단조 증가하는 카운터라 z2 > z1 이었고, 그래서 띠에 상한이 없었다
    expect(z2).toBe(z1);
  });
});
