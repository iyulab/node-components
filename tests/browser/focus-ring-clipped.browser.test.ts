/// <reference types="@vitest/browser-playwright" />
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { page, userEvent } from 'vitest/browser';
import '../../src/index.js';

/**
 * **자르는 호스트 안의 키보드 포커스 링이 보인다** — 픽셀로 잰다(WCAG 2.4.7). `u-button` 과 `u-carousel` 이름 칸.
 *
 * 링은 안쪽 `button`/`a` 의 `outline`(`outline-offset: 2px`) 이라 호스트 상자 **바깥**에 그려진다. 호스트가
 * `overflow: hidden` 이면 그 링이 통째로 잘려, 계산된 스타일은 «있다» 고 말하는데 화면에는 아무것도 없었다.
 * 그래서 계산값이 아니라 **호스트 상자 바깥 띠의 칠해진 픽셀**을 Tab 전후로 비교한다.
 */
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

/** 호스트 상자 **바깥** 띠(`out` CSS px)에서 두 스크린샷이 다른 픽셀 수 — 상자 안쪽은 세지 않는다. */
function outsideDiff(a: Awaited<ReturnType<typeof shot>>, b: Awaited<ReturnType<typeof shot>>, r: DOMRect, out = 6): number {
  const s = a.scale;
  const x0 = Math.floor((r.left - out) * s), x1 = Math.ceil((r.right + out) * s);
  const y0 = Math.floor((r.top - out) * s), y1 = Math.ceil((r.bottom + out) * s);
  const ix0 = Math.floor(r.left * s), ix1 = Math.ceil(r.right * s), iy0 = Math.floor(r.top * s), iy1 = Math.ceil(r.bottom * s);
  let diff = 0;
  for (let y = Math.max(0, y0); y < y1; y++) {
    for (let x = Math.max(0, x0); x < x1; x++) {
      if (x >= ix0 && x < ix1 && y >= iy0 && y < iy1) continue;
      const i = (y * a.width + x) * 4;
      if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 60) diff++;
    }
  }
  return diff;
}

const CASES = [
  { name: 'solid', html: '<u-button appearance="solid">Save</u-button>' },
  { name: 'outlined', html: '<u-button appearance="outlined">Search</u-button>' },
  { name: 'soft', html: '<u-button appearance="soft">Add</u-button>' },
  { name: 'plain', html: '<u-button appearance="plain">Cancel</u-button>' },
  { name: 'link (href)', html: '<u-button appearance="solid" href="#here">Open</u-button>' },
  { name: 'sm', html: '<u-button appearance="solid" size="sm">Small</u-button>' },
];

let stage: HTMLElement;
beforeEach(async () => {
  window.scrollTo(0, 0);
  stage = document.createElement('div');
  stage.style.cssText = 'padding:24px;width:360px;background:#fff';
  document.body.append(stage);
});
afterEach(() => stage.remove());

describe('u-button keyboard focus ring', () => {
  for (const c of CASES) {
    it(`${c.name}: the ring is painted outside the host box`, async () => {
      stage.innerHTML = `<button id="before">before</button><div style="margin-top:16px">${c.html}</div>`;
      const host = stage.querySelector('u-button') as HTMLElement & { updateComplete: Promise<unknown> };
      await host.updateComplete;
      (stage.querySelector('#before') as HTMLButtonElement).focus();
      await new Promise((r) => setTimeout(r, 300)); // 호스트의 배경 전환이 끝난 뒤 찍는다
      const rect = host.getBoundingClientRect();
      const before = await shot();
      await userEvent.tab();
      const inner = host.shadowRoot!.querySelector('button, a') as HTMLElement;
      expect(inner.matches(':focus-visible')).toBe(true);
      await new Promise((r) => setTimeout(r, 300));
      const after = await shot();
      // 2px 링 둘레 — 폭이 수십 px 인 단추에서 수백 장치 픽셀. 잘리면 0.
      expect(outsideDiff(before, after, rect)).toBeGreaterThan(100);
    });
  }

  it('a long label is still cut to the host width with an ellipsis', async () => {
    stage.innerHTML = '<u-button appearance="solid" style="width:90px">A very long label that cannot fit</u-button>';
    const host = stage.querySelector('u-button') as HTMLElement & { updateComplete: Promise<unknown> };
    await host.updateComplete;
    const inner = host.shadowRoot!.querySelector('button') as HTMLElement;
    const content = host.shadowRoot!.querySelector('.content') as HTMLElement;
    const h = host.getBoundingClientRect();
    const b = inner.getBoundingClientRect();
    expect(b.right).toBeLessThanOrEqual(h.right + 0.5);
    expect(content.scrollWidth).toBeGreaterThan(content.clientWidth);
    expect(getComputedStyle(content).textOverflow).toBe('ellipsis');
  });
});

/**
 * `u-carousel[pagination-style="labels"]` — 이름 칸 줄이 호스트 폭을 다 쓰고 호스트 아래 끝에 붙는다. 호스트는 슬라이드를
 * 자르려고 `overflow: hidden` 이라, 바깥 2px 에 그리는 링은 첫 칸의 왼쪽 · 끝 칸의 오른쪽 · 모든 칸의 아래가 잘렸다.
 * 칸 안쪽 가장자리 띠(4px)가 Tab 전후로 바뀌는지 잰다 — 링이 안쪽에 그려지면 바뀌고, 바깥에서 잘리면 0.
 */
describe('u-carousel labels: the focused name tab shows its ring', () => {
  it('the first tab’s left edge strip changes when it takes keyboard focus', async () => {
    stage.style.width = '600px';
    stage.style.padding = '0';
    stage.innerHTML =
      `<button id="before">before</button>` +
      `<u-carousel pagination pagination-style="labels" style="width:600px;height:240px">` +
      ['Late', 'Stages', 'Batches'].map((n) => `<div aria-label="${n}" style="height:100%">${n}</div>`).join('') +
      `</u-carousel>`;
    const host = stage.querySelector('u-carousel') as HTMLElement & { updateComplete: Promise<unknown> };
    await host.updateComplete;
    await new Promise((r) => setTimeout(r, 0));
    await host.updateComplete;
    const tab = host.shadowRoot!.querySelector<HTMLElement>('[part~="dot"]')!;
    (stage.querySelector('#before') as HTMLButtonElement).focus();
    await new Promise((r) => setTimeout(r, 200));
    const r = tab.getBoundingClientRect();
    const before = await shot();
    // before → (회전 버튼이 있으면 그것) → 첫 이름 칸
    for (let i = 0; i < 3 && host.shadowRoot!.activeElement !== tab; i++) await userEvent.tab();
    expect(host.shadowRoot!.activeElement).toBe(tab);
    expect(tab.matches(':focus-visible')).toBe(true);
    await new Promise((r) => setTimeout(r, 200));
    const after = await shot();
    const strip = new DOMRect(r.left, r.top, 4, r.height);
    expect(outsideDiff(before, after, strip, 0) + insideDiff(before, after, strip)).toBeGreaterThan(20);
  });
});

/** 사각형 안쪽의 다른 픽셀 수. */
function insideDiff(a: Awaited<ReturnType<typeof shot>>, b: Awaited<ReturnType<typeof shot>>, r: DOMRect): number {
  const s = a.scale;
  let diff = 0;
  for (let y = Math.floor(r.top * s); y < Math.ceil(r.bottom * s); y++) {
    for (let x = Math.floor(r.left * s); x < Math.ceil(r.right * s); x++) {
      const i = (y * a.width + x) * 4;
      if (Math.abs(a.data[i] - b.data[i]) + Math.abs(a.data[i + 1] - b.data[i + 1]) + Math.abs(a.data[i + 2] - b.data[i + 2]) > 60) diff++;
    }
  }
  return diff;
}
