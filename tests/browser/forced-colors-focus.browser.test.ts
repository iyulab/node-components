/// <reference types="@vitest/browser-playwright" />
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { cdp, page, userEvent } from 'vitest/browser';
import '../../src/index.js';

/**
 * **강제 색 모드(Windows 고대비)에서도 포커스가 보인다** — 픽셀로 잰다.
 *
 * 강제 색 모드는 `box-shadow` 를 지우고 색을 시스템 색으로 바꾼다(CSS Color Adjust). 포커스를 box-shadow 로만 그리던
 * 컨트롤은 그 모드에서 포커스가 어디 있는지 보이지 않았다 — `u-input` 은 Tab 전후 테두리 띠의 픽셀이 하나도 바뀌지
 * 않았다(보통 모드 707 · 강제 0). WCAG 2.4.7.
 *
 * ⚠계산된 스타일이 아니라 **칠해진 픽셀**로 잰다 — 선언(`outline: …`)이 있어도 강제 색 모드가 그 색을 배경과 같게
 * 덮으면 보이지 않는다. 포커스 링을 그리는 안쪽 상자 둘레의 띠(바깥 6px · 안쪽 3px — 캐럿이 사는 안쪽은 제외)를
 * Tab 전후로 비교한다.
 */
async function forcedColors(active: boolean): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: active ? 'active' : 'none' }],
  });
  await new Promise((r) => setTimeout(r, 50));
}

async function shot(): Promise<{ data: Uint8ClampedArray; width: number; scale: number }> {
  const raw = (await page.screenshot({ save: false, base64: true } as never)) as unknown as { base64: string } | string;
  const base64 = typeof raw === 'string' ? raw : raw.base64;
  const img = new Image();
  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = reject;
    img.src = `data:image/png;base64,${base64}`;
  });
  const canvas = document.createElement('canvas');
  canvas.width = img.width;
  canvas.height = img.height;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(img, 0, 0);
  return { data: ctx.getImageData(0, 0, img.width, img.height).data, width: img.width, scale: img.width / window.innerWidth };
}

/** 사각형 둘레 띠(바깥 `out` · 안쪽 `inn` CSS px)에서 두 스크린샷이 다른 픽셀 수. */
function bandDiff(a: Awaited<ReturnType<typeof shot>>, b: Awaited<ReturnType<typeof shot>>, r: DOMRect, out = 6, inn = 3): number {
  const s = a.scale;
  const x0 = Math.floor((r.left - out) * s), x1 = Math.ceil((r.right + out) * s);
  const y0 = Math.floor((r.top - out) * s), y1 = Math.ceil((r.bottom + out) * s);
  const ix0 = (r.left + inn) * s, ix1 = (r.right - inn) * s, iy0 = (r.top + inn) * s, iy1 = (r.bottom - inn) * s;
  let diff = 0;
  for (let y = Math.max(0, y0); y < y1; y++) {
    for (let x = Math.max(0, x0); x < x1; x++) {
      if (x > ix0 && x < ix1 && y > iy0 && y < iy1) continue;
      const i = (y * a.width + x) * 4;
      if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 60) diff++;
    }
  }
  return diff;
}

type Case = { name: string; html: string; ring: (host: HTMLElement) => Element | null; tabs?: number };

const CASES: Case[] = [
  { name: 'u-input', html: '<u-input label="이름"></u-input>', ring: (h) => h.shadowRoot!.querySelector('.container') },
  { name: 'u-textarea', html: '<u-textarea label="메모"></u-textarea>', ring: (h) => h.shadowRoot!.querySelector('.container') },
  { name: 'u-checkbox', html: '<u-checkbox>동의</u-checkbox>', ring: (h) => h.shadowRoot!.querySelector('.checkbox') },
  { name: 'u-switch', html: '<u-switch>알림</u-switch>', ring: (h) => h.shadowRoot!.querySelector('.track') },
  { name: 'u-slider', html: '<u-slider value="40"></u-slider>', ring: (h) => h.shadowRoot!.querySelector('.thumb-content') ?? h.shadowRoot!.querySelector('.thumb') },
  { name: 'u-file-input', html: '<u-file-input label="첨부"></u-file-input>', ring: (h) => h.shadowRoot!.querySelector('.trigger') },
];

let stage: HTMLElement;
beforeEach(async () => {
  window.scrollTo(0, 0);
  stage = document.createElement('div');
  stage.style.cssText = 'padding:24px;width:360px';
  document.body.append(stage);
});
afterEach(() => stage.remove());
afterAll(() => forcedColors(false));

async function measure(c: Case, forced: boolean): Promise<number> {
  stage.innerHTML = `<button id="before">before</button><div style="margin-top:16px">${c.html}</div>`;
  const host = stage.querySelector(c.name) as HTMLElement & { updateComplete?: Promise<unknown> };
  await host.updateComplete;
  await forcedColors(forced);
  const before = stage.querySelector('#before') as HTMLButtonElement;
  before.focus();
  await new Promise((r) => setTimeout(r, 300));
  const ring = c.ring(host);
  if (!ring) throw new Error(`${c.name}: ring element not found`);
  const rect = ring.getBoundingClientRect();
  const idle = await shot();
  await userEvent.tab();
  await new Promise((r) => setTimeout(r, 400));
  const focused = await shot();
  return bandDiff(idle, focused, rect);
}

describe('강제 색 모드 — 포커스가 보인다', () => {
  for (const c of CASES) {
    it(`${c.name}: 보통 모드에서도 · 강제 색 모드에서도 Tab 하면 링 둘레의 픽셀이 바뀐다`, async () => {
      const normal = await measure(c, false);
      expect(normal, `${c.name} 보통 모드 — 측정 자체가 포커스를 보는가`).toBeGreaterThan(0);
      const forced = await measure(c, true);
      expect(forced, `${c.name} 강제 색 모드`).toBeGreaterThan(0);
    });
  }
});
