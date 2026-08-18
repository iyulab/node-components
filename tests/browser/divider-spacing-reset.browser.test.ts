import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import '../../src/assets/styles/light.css';
import '../../src/components/divider/UDivider.js';

/**
 * `u-divider` 의 간격이 **소비 앱 CSS 리셋에 살아남는가**.
 *
 * 배경: 나머지 8개 컴포넌트는 여백을 `part="base"` 내부 요소로 옮겨 리셋 내성을 얻었지만,
 * `u-divider` 만 남아 있었다. 근거는 *"`:host` 의 margin 은 **형제 간 간격**이라 내부로
 * 옮기면 호스트 박스 안에서 상쇄되어 형제를 밀어내지 못한다"* 였다.
 *
 * ★ 그 전제는 **margin 을 옮길 때만** 참이다. 내부 요소의 **padding** 으로 옮기면 호스트
 *   박스 자체가 커지므로 형제는 종전대로 밀려난다 — 그리고 padding 은 섀도 내부 요소에
 *   있으므로 문서 리셋이 닿지 못한다.
 *
 * 이 파일은 그 주장을 **증거로** 만든다:
 *  - 기준선: 리셋이 없을 때의 점유 높이/너비 (변경 전후가 같아야 한다 = 시각 불변)
 *  - 내성: `* { margin: 0; padding: 0 }` 아래에서도 간격이 남아야 한다
 *
 * 내성 케이스는 변경 **전에는 실패**한다(그것이 이 테스트의 존재 이유다).
 */

const SPACING = 8; // --divider-spacing 기본값

let reset: HTMLStyleElement | null = null;

function applyReset() {
  reset = document.createElement('style');
  // 소비 앱에서 사실상 표준인 형태 (Tailwind preflight 등)
  reset.textContent = '* { margin: 0; padding: 0; border: 0; }';
  document.head.appendChild(reset);
}

beforeEach(() => {
  document.body.innerHTML = '';
});

afterEach(() => {
  reset?.remove();
  reset = null;
  document.body.innerHTML = '';
});

/** 형제 두 개 사이에 divider 를 넣고, divider 가 실제로 차지하는 세로 공간을 잰다. */
async function occupiedHeight(): Promise<number> {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:block; width:200px;';
  wrap.innerHTML = '<div id="a" style="height:10px"></div><u-divider></u-divider><div id="b" style="height:10px"></div>';
  document.body.appendChild(wrap);

  const divider = wrap.querySelector('u-divider') as HTMLElement & { updateComplete: Promise<unknown> };
  await divider.updateComplete;

  const a = wrap.querySelector('#a')!.getBoundingClientRect();
  const b = wrap.querySelector('#b')!.getBoundingClientRect();
  // 두 형제 사이의 빈 거리 = divider 가 점유한 세로 공간 (margin 이든 padding 이든 무관하게 측정)
  return b.top - a.bottom;
}

/** 가로 배치에서 vertical divider 가 차지하는 가로 공간. */
async function occupiedWidth(): Promise<number> {
  const wrap = document.createElement('div');
  wrap.style.cssText = 'display:flex; align-items:center; width:300px;';
  wrap.innerHTML =
    '<div id="a" style="width:10px;height:20px"></div><u-divider vertical></u-divider><div id="b" style="width:10px;height:20px"></div>';
  document.body.appendChild(wrap);

  const divider = wrap.querySelector('u-divider') as HTMLElement & { updateComplete: Promise<unknown> };
  await divider.updateComplete;

  const a = wrap.querySelector('#a')!.getBoundingClientRect();
  const b = wrap.querySelector('#b')!.getBoundingClientRect();
  return b.left - a.right;
}

describe('u-divider 간격', () => {
  it('기준선 — 가로: 형제 사이를 spacing×2 + 선 두께만큼 벌린다', async () => {
    const h = await occupiedHeight();
    // 8 + 1 + 8 = 17 (선 두께 1px). 서브픽셀 오차 허용.
    expect(h).toBeGreaterThanOrEqual(SPACING * 2);
    expect(h).toBeLessThan(SPACING * 2 + 4);
  });

  it('기준선 — 세로: 형제 사이를 spacing×2 + 선 두께만큼 벌린다', async () => {
    const w = await occupiedWidth();
    expect(w).toBeGreaterThanOrEqual(SPACING * 2);
    expect(w).toBeLessThan(SPACING * 2 + 4);
  });

  it('★리셋 내성 — 가로: `* { margin:0; padding:0 }` 아래에서도 간격이 남는다', async () => {
    applyReset();
    const h = await occupiedHeight();
    expect(h).toBeGreaterThanOrEqual(SPACING * 2);
  });

  it('★리셋 내성 — 세로: `* { margin:0; padding:0 }` 아래에서도 간격이 남는다', async () => {
    applyReset();
    const w = await occupiedWidth();
    expect(w).toBeGreaterThanOrEqual(SPACING * 2);
  });

  it('소비자 훅 — `--divider-spacing` 오버라이드가 리셋 아래에서도 동작한다', async () => {
    applyReset();
    const style = document.createElement('style');
    style.textContent = 'u-divider { --divider-spacing: 20px; }';
    document.head.appendChild(style);
    const h = await occupiedHeight();
    style.remove();
    expect(h).toBeGreaterThanOrEqual(40);
  });
});
