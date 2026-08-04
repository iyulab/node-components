import { describe, it, expect, afterEach } from 'vitest';
import '../../src/components/dialog/UDialog.js';
import '../../src/components/drawer/UDrawer.js';

/**
 * **오버레이가 열릴 때 어디에 포커스가 가는가** — `UOverlayElement.resolveInitialFocus()`.
 *
 * 순서: `[autofocus]` → 첫 입력 컨트롤 → (없으면) `focus-trap` 기본값(첫 tabbable).
 *
 * ## 🔴 이 파일은 «되돌려서 실제로 실패하는» 입력만 담는다
 *
 * 두 분기가 각각 무엇을 하는지 갈리는 자리가 **다르다**:
 *
 *   `[autofocus]`  → `u-drawer` 로 갈린다 (focus-trap 은 그 속성을 보지 않는다)
 *   첫 입력 우선   → `u-dialog` 로 갈린다 (버튼이 앞이면 기본값은 버튼을 잡는다)
 *
 * ⚠**`u-drawer` 만으로 두 번째를 판별하려다 실패했다** — 그쪽은 슬롯 배치 때문에 기본값도
 * 우연히 첫 입력에 떨어진다. 그래서 *"되돌려도 통과한다"* 가 나왔고, 하마터면
 * *"이 분기는 아무것도 하지 않는다"* 로 결론지을 뻔했다. ⇒ ***«되돌려도 통과»는 코드가
 * 무용하다는 증거가 아니라 그 입력이 판별식이 아니라는 증거다.***
 */

type Overlay = HTMLElement & { updateComplete: Promise<unknown>; show(): void };

const mount = async (tag: string, inner: string) => {
  const el = document.createElement(tag) as Overlay;
  el.innerHTML = inner;
  document.body.appendChild(el);
  el.show();
  await el.updateComplete;
  await new Promise(r => setTimeout(r, 450));
  return el;
};

afterEach(() => {
  document.body.innerHTML = '';
});

describe('오버레이 초기 포커스', () => {
  it('🔴u-dialog — 버튼이 DOM 순서상 앞이어도 «첫 입력»으로 간다 (되돌리면 버튼이 잡는다)', async () => {
    const el = await mount(
      'u-dialog',
      `<button id="b1">확인</button><button id="b2">취소</button><input id="inp" />`,
    );
    expect(document.activeElement).toBe(el.querySelector('#inp'));
  });

  it('🔴u-drawer — `[autofocus]` 가 첫 입력보다 우선한다 (되돌리면 첫 입력이 잡는다)', async () => {
    const el = await mount(
      'u-drawer',
      `<input id="first" /><input id="second" autofocus />`,
    );
    expect(document.activeElement).toBe(el.querySelector('#second'));
  });

  it('입력이 하나도 없으면 기본값(첫 tabbable)에 맡긴다', async () => {
    const el = await mount('u-dialog', `<button id="only">닫기</button>`);
    expect(document.activeElement).toBe(el.querySelector('#only'));
  });
});
