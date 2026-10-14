/// <reference types="@vitest/browser-playwright" />
import { describe, it, expect, beforeEach, afterEach, afterAll } from 'vitest';
import { cdp, page } from 'vitest/browser';
import '../../src/index.js';

/**
 * **강제 색 모드(Windows 고대비)에서도 상태가 구분된다** — 켬/끔 · 선택 · 무효를 픽셀로 잰다.
 *
 * 강제 색 모드는 배경·테두리 색을 시스템 색으로 덮는다 — 상태를 «배경색만» 으로 그리면 두 상태가 같은 화면이 된다.
 * 같은 컨트롤을 두 상태로 그려 그 상자 안팎(바깥 4px 포함)의 픽셀이 다른지 잰다. 보통 모드의 차이 > 0 을 함께 단언한다
 * (측정이 상태를 보는지의 자기 점검).
 */
async function forcedColors(active: boolean): Promise<void> {
  await cdp().send('Emulation.setEmulatedMedia', {
    features: [{ name: 'forced-colors', value: active ? 'active' : 'none' }],
  });
  await new Promise((r) => setTimeout(r, 50));
}

async function shot() {
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

function regionDiff(a: Awaited<ReturnType<typeof shot>>, b: Awaited<ReturnType<typeof shot>>, r: DOMRect, pad = 4): number {
  const s = a.scale;
  let diff = 0;
  for (let y = Math.max(0, Math.floor((r.top - pad) * s)); y < Math.ceil((r.bottom + pad) * s); y++) {
    for (let x = Math.max(0, Math.floor((r.left - pad) * s)); x < Math.ceil((r.right + pad) * s); x++) {
      const i = (y * a.width + x) * 4;
      if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 60) diff++;
    }
  }
  return diff;
}

type Case = { name: string; html: string; part: (h: HTMLElement) => Element | null; toggle: (h: HTMLElement) => void };

const CASES: Case[] = [
  { name: 'u-checkbox 체크', html: '<u-checkbox>동의</u-checkbox>', part: (h) => h.shadowRoot!.querySelector('.checkbox'), toggle: (h) => ((h as unknown as { checked: boolean }).checked = true) },
  { name: 'u-switch 켬', html: '<u-switch>알림</u-switch>', part: (h) => h.shadowRoot!.querySelector('.track'), toggle: (h) => ((h as unknown as { checked: boolean }).checked = true) },
  { name: 'u-input 무효', html: '<u-input label="이름" value="x"></u-input>', part: (h) => h.shadowRoot!.querySelector('.container'), toggle: (h) => h.setAttribute('invalid', '') },
  { name: 'u-textarea 무효', html: '<u-textarea label="메모" value="x"></u-textarea>', part: (h) => h.shadowRoot!.querySelector('.container'), toggle: (h) => h.setAttribute('invalid', '') },
  { name: 'u-select 무효', html: '<u-select label="상태"><u-option value="a">가</u-option></u-select>', part: (h) => h.shadowRoot!.querySelector('.container'), toggle: (h) => h.setAttribute('invalid', '') },
];

let stage: HTMLElement;
beforeEach(() => {
  window.scrollTo(0, 0);
  stage = document.createElement('div');
  stage.style.cssText = 'padding:24px;width:360px';
  document.body.append(stage);
});
afterEach(() => stage.remove());
afterAll(() => forcedColors(false));

async function measure(c: Case, forced: boolean): Promise<number> {
  stage.innerHTML = c.html;
  const host = stage.firstElementChild as HTMLElement & { updateComplete?: Promise<unknown> };
  await host.updateComplete;
  await forcedColors(forced);
  await new Promise((r) => setTimeout(r, 300));
  const part = c.part(host);
  if (!part) throw new Error(`${c.name}: part not found`);
  const rect = part.getBoundingClientRect();
  const off = await shot();
  c.toggle(host);
  await host.updateComplete;
  await new Promise((r) => setTimeout(r, 400));
  const on = await shot();
  return regionDiff(off, on, rect);
}

describe('강제 색 모드 — 상태가 구분된다', () => {
  for (const c of CASES) {
    it(`${c.name}: 보통 모드에서도 · 강제 색 모드에서도 두 상태의 화면이 다르다`, async () => {
      expect(await measure(c, false), `${c.name} 보통 모드`).toBeGreaterThan(0);
      expect(await measure(c, true), `${c.name} 강제 색 모드`).toBeGreaterThan(0);
    });
  }
});
