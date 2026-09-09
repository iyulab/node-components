import { describe, it, expect, beforeEach } from 'vitest';
import { Toast } from '../../src/utilities/Toast.js';
import { OverlayManager } from '../../src/utilities/OverlayManager.js';
import '../../src/components/alert/UAlert.js';

/**
 * `Toast` 컨테이너의 **네이티브 top layer 승격** 회귀 (§C-B 시범, cycle-477).
 *
 * ⚠**이 파일은 «이득»과 «한계»를 둘 다 고정한다.** 시범의 산출물은 «되더라»가 아니라
 * ***«어디까지 되고 어디서부터 안 되는가»*** 이고, 한계를 고정하지 않으면 다음 사람이
 * 같은 것을 다시 재게 된다.
 *
 * | 상황 | top layer 로 해결되는가 | 근거 |
 * |---|---|---|
 * | 소비자의 거대 `z-index` 오버레이 | ✅**된다** | top layer 는 z-index 축 «밖»이다 |
 * | 우리 `u-dialog`(z-index 기반) | ✅된다 | 위와 같은 이유 — 띠 계약도 이미 보장한다 |
 * | 네이티브 `<dialog>.showModal()` | ❌**안 된다** | 모달이 바깥을 **inert** 로 만든다 |
 *
 * 마지막 줄이 이 시범의 핵심 발견이다 — **z-index 문제가 아니라 inert 문제**라
 * *어떤* 겹침 전략으로도 풀리지 않는다(그리고 그것이 모달의 올바른 의미다).
 */
function center(el: Element) {
  const r = el.getBoundingClientRect();
  return { x: Math.round(r.left + r.width / 2), y: Math.round(r.top + r.height / 2), r };
}

/**
 * 토스트 컨테이너를 «담고 있는 것»으로 식별한다 — `[popover]` 나 z-index 로 찾으면
 * 테스트가 세운 다른 오버레이를 잡는다(첫 판이 실제로 그랬다).
 */
function toastContainer(): HTMLElement {
  const el = Array.from(document.querySelectorAll('body > div')).find((d) => d.querySelector('u-alert'));
  return el as HTMLElement;
}

describe('Toast — 네이티브 top layer 승격', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  it('🔴POSITIVE — 최대 z-index(2147483647) 오버레이 위에서도 토스트가 도달 가능하다', async () => {
    const cover = document.createElement('div');
    Object.assign(cover.style, {
      position: 'fixed', inset: '0', background: 'rgba(0,0,0,.5)', zIndex: '2147483647',
    });
    document.body.appendChild(cover);

    await Toast.success('hello', { position: 'top-right', duration: 0 });
    await new Promise((r) => setTimeout(r, 50));

    const container = toastContainer();
    expect(container.getAttribute('popover'), 'body 컨테이너는 top layer 로 올라간다').toBe('manual');

    const { x, y } = center(container);
    const hit = document.elementFromPoint(x, y);
    expect(container.contains(hit), 'z-index 로는 이길 수 없는 오버레이 위에 선다').toBe(true);
  });

  it('⚪NEGATIVE — 배치가 살아 있다: UA 의 `inset: 0` 을 걷어도 top/right 가 적용된다', async () => {
    await Toast.success('hello', { position: 'top-right', duration: 0 });
    await new Promise((r) => setTimeout(r, 50));

    const container = toastContainer();
    const cs = getComputedStyle(container);
    expect(cs.position).toBe('fixed');
    // 화면 전체로 늘어나지 않았다 — UA 기본값이 걷혔다는 뜻이다.
    const r = container.getBoundingClientRect();
    expect(r.width).toBeGreaterThan(0);
    expect(r.width).toBeLessThan(window.innerWidth);
    expect(r.height).toBeLessThan(window.innerHeight);
    // top-right 로 실제로 붙었다.
    expect(Math.round(r.top)).toBeLessThan(60);
    expect(Math.round(window.innerWidth - r.right)).toBeLessThan(60);
  });

  it('⚪NEGATIVE — `target` 이 주어진 컨테이너는 top layer 로 올리지 않는다 (좌표계가 깨진다)', async () => {
    const host = document.createElement('div');
    Object.assign(host.style, { position: 'relative', width: '400px', height: '300px' });
    document.body.appendChild(host);

    await Toast.success('scoped', { target: host, position: 'top-right', duration: 0 });
    await new Promise((r) => setTimeout(r, 50));

    const scoped = host.querySelector('div') as HTMLElement;
    expect(scoped, '타깃 안에 컨테이너가 생긴다').toBeTruthy();
    expect(scoped.hasAttribute('popover'), '타깃 기준 컨테이너는 승격 대상이 아니다').toBe(false);
    expect(getComputedStyle(scoped).position).toBe('absolute');
  });

  it('⚪NEGATIVE — z-index 띠를 지우지 않는다 (승격이 안 되는 브라우저의 폴백)', async () => {
    await Toast.success('hello', { duration: 0 });
    await new Promise((r) => setTimeout(r, 50));

    const container = toastContainer();
    expect(getComputedStyle(container).zIndex).toBe(String(OverlayManager.notificationZIndex));
  });

  it('📌LIMIT — 네이티브 `<dialog>.showModal()` 아래에서는 도달 불가다 (겹침이 아니라 inert)', async () => {
    const dlg = document.createElement('dialog');
    Object.assign(dlg.style, { width: '100vw', height: '100vh', margin: '0', padding: '0', border: 'none' });
    document.body.appendChild(dlg);
    dlg.showModal();
    await new Promise((r) => setTimeout(r, 30));

    await Toast.success('hello', { position: 'top-right', duration: 0 });
    await new Promise((r) => setTimeout(r, 50));

    const container = toastContainer();
    expect(container.matches(':popover-open'), 'top layer 에는 실제로 올라가 있다').toBe(true);

    const { x, y } = center(container);
    // ⚠**이것은 결함이 아니라 모달의 의미다** — 모달이 열린 동안 바깥은 inert 이고,
    // inert 는 겹침 축이 아니라 «상호작용 대상인가» 축이다. 이 줄이 초록인 동안
    // 「top layer 로 이 문제를 풀 수 있다」는 가설은 반증된 상태로 고정된다.
    expect(container.contains(document.elementFromPoint(x, y))).toBe(false);
  });
});
